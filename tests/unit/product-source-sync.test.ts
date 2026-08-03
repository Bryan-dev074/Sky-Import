import { createHash } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, expect, test } from 'vitest'
import { syncProductSource } from '../../scripts/lib/product-source-sync.mjs'

let directory: string
let servers: Server[]

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'sky-import-source-sync-'))
  servers = []
})

afterEach(async () => {
  await Promise.all(
    servers.map(
      (server) => new Promise<void>((resolve) => server.close(() => resolve())),
    ),
  )
  await rm(directory, { recursive: true, force: true })
})

function sha256(bytes: Buffer) {
  return createHash('sha256').update(bytes).digest('hex').toUpperCase()
}

async function listen(server: Server) {
  servers.push(server)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Servidor de prueba sin puerto.')
  return `http://127.0.0.1:${address.port}/source`
}

test('fija representación y verifica SHA-256 antes de publicar una fuente', async () => {
  const expected = await sharp({
    create: { width: 8, height: 8, channels: 3, background: '#224466' },
  })
    .png()
    .toBuffer()
  const alternative = await sharp({
    create: { width: 8, height: 8, channels: 3, background: '#ffffff' },
  })
    .webp()
    .toBuffer()
  let observedAccept = ''
  let observedEncoding = ''
  const url = await listen(
    createServer((request, response) => {
      observedAccept = String(request.headers.accept ?? '')
      observedEncoding = String(request.headers['accept-encoding'] ?? '')
      const pinned = observedAccept === 'image/png' && observedEncoding === 'identity'
      response.writeHead(200, { 'Content-Type': pinned ? 'image/png' : 'image/webp' })
      response.end(pinned ? expected : alternative)
    }),
  )

  const result = await syncProductSource(
    {
      slug: 'producto-fijado',
      imageUrl: url,
      sourcePage: 'https://example.com/producto',
      sourceMediaType: 'image/png',
      sourceSha256: sha256(expected),
    },
    { outputRoot: directory },
  )

  expect(observedAccept).toBe('image/png')
  expect(observedEncoding).toBe('identity')
  expect(result.output).toBe(join(directory, 'producto-fijado', 'source.png'))
  await expect(readFile(result.output)).resolves.toEqual(expected)
})

test('un hash incorrecto no crea ni reemplaza bytes locales', async () => {
  const existingDirectory = join(directory, 'producto-fijado')
  const output = join(existingDirectory, 'source.png')
  const sentinel = Buffer.from('fuente aprobada previa')
  await mkdir(existingDirectory, { recursive: true })
  await writeFile(output, sentinel)
  const downloaded = Buffer.from('representación remota inesperada')
  const url = await listen(
    createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'image/png' })
      response.end(downloaded)
    }),
  )

  await expect(
    syncProductSource(
      {
        slug: 'producto-fijado',
        imageUrl: url,
        sourcePage: 'https://example.com/producto',
        sourceMediaType: 'image/png',
        sourceSha256: 'A'.repeat(64),
      },
      { outputRoot: directory },
    ),
  ).rejects.toThrow(/SHA-256/)

  await expect(readFile(output)).resolves.toEqual(sentinel)
})

test('rechaza una entrada no fijada antes de solicitar o escribir', async () => {
  let requests = 0
  const url = await listen(
    createServer((_request, response) => {
      requests += 1
      response.writeHead(200, { 'Content-Type': 'image/png' })
      response.end('no debe descargarse')
    }),
  )

  await expect(
    syncProductSource(
      {
        slug: 'producto-sin-hash',
        imageUrl: url,
        sourcePage: 'https://example.com/producto',
        sourceMediaType: 'image/png',
      },
      { outputRoot: directory },
    ),
  ).rejects.toThrow(/sourceSha256/)

  expect(requests).toBe(0)
})

test('rechaza path traversal en el slug antes de solicitar o escribir', async () => {
  let requests = 0
  const bytes = await sharp({
    create: { width: 2, height: 2, channels: 3, background: '#000000' },
  })
    .png()
    .toBuffer()
  const url = await listen(
    createServer((_request, response) => {
      requests += 1
      response.writeHead(200, { 'Content-Type': 'image/png' })
      response.end(bytes)
    }),
  )

  await expect(
    syncProductSource(
      {
        slug: '../escape',
        imageUrl: url,
        sourcePage: 'https://example.com/producto',
        sourceMediaType: 'image/png',
        sourceSha256: sha256(bytes),
      },
      { outputRoot: directory },
    ),
  ).rejects.toThrow(/slug seguro/)

  expect(requests).toBe(0)
})
