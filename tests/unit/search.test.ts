import { describe, expect, it } from 'vitest'
import { matchRank, normalize } from '@/lib/search'

const fields = (primary: string[], secondary: string[] = []) => ({ primary, secondary })

describe('búsqueda', () => {
  it('quita diacríticos y mayúsculas', () => {
    expect(normalize('Refrigeración')).toBe('refrigeracion')
    expect(normalize('  GeForce RTX  ')).toBe('geforce rtx')
  })

  it('encuentra sin tildes lo que está escrito con tildes', () => {
    expect(matchRank('grafica', fields(['Tarjeta gráfica']))).not.toBeNull()
    expect(matchRank('refrigeracion', fields(['Refrigeración']))).not.toBeNull()
  })

  it('ordena por nivel: exacto antes que empieza, y empieza antes que contiene', () => {
    const exact = matchRank('rtx 5080', fields(['RTX 5080']))
    const starts = matchRank('rtx', fields(['RTX 5080']))
    const contains = matchRank('5080', fields(['GeForce RTX 5080']))
    const secondary = matchRank('blackwell', fields(['RTX 5080'], ['arquitectura Blackwell']))
    expect(exact).toBe(0)
    expect(starts).toBe(1)
    expect(contains).toBe(2)
    expect(secondary).toBe(3)
    expect(exact!).toBeLessThan(starts!)
    expect(starts!).toBeLessThan(contains!)
    expect(contains!).toBeLessThan(secondary!)
  })

  it('encuentra por código de referencia', () => {
    expect(matchRank('SI-VGA-0112', fields(['GeForce RTX 5080 16 GB', 'SI-VGA-0112']))).toBe(0)
    expect(matchRank('si-vga', fields(['GeForce RTX 5080 16 GB', 'SI-VGA-0112']))).toBe(1)
  })

  it('acepta varias palabras dispersas entre campos', () => {
    expect(matchRank('nvidia 5080', fields(['GeForce RTX 5080'], ['NVIDIA']))).toBe(4)
  })

  it('devuelve null cuando no hay coincidencia', () => {
    expect(matchRank('teclado', fields(['GeForce RTX 5080'], ['NVIDIA']))).toBeNull()
  })

  it('una consulta vacía no filtra nada', () => {
    expect(matchRank('', fields(['lo que sea']))).toBe(0)
    expect(matchRank('   ', fields(['lo que sea']))).toBe(0)
  })
})
