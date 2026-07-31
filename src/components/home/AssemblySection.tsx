'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ComponentRender } from '@/components/render/ComponentRender'
import { useI18n } from '@/lib/i18n/context'

/**
 * Envoltorio de la pieza WebGL.
 *
 * Lo caro se difiere: `three` no entra en el paquete inicial y ni siquiera se
 * pide hasta que la sección está a 480 px de entrar en pantalla. Con movimiento
 * reducido no se pide nunca.
 *
 * El respaldo estático —el mismo dibujo vectorial del catálogo, en su vista
 * anotada— está siempre presente y solo se atenúa cuando la pieza confirmó que
 * pintó un cuadro real. Si el contexto se pierde, vuelve.
 */

const GpuAssembly = dynamic(() => import('@/components/three/GpuAssembly'), {
  ssr: false,
})

const PART_KEYS = [
  'assembly.part1',
  'assembly.part2',
  'assembly.part3',
  'assembly.part4',
  'assembly.part5',
  'assembly.part6',
  'assembly.part7',
] as const

export function AssemblySection() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setNear(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '480px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const onReady = useCallback(() => setLive(true), [])
  const onLost = useCallback(() => setLive(false), [])

  return (
    <section ref={sectionRef} className="u-page border-t border-rule py-24 lg:py-32" aria-labelledby="ensamblaje">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="u-eyebrow">{t('assembly.eyebrow')}</p>
          <h2 id="ensamblaje" className="u-display mt-5 text-[clamp(1.9rem,4vw,3rem)]">
            {t('assembly.title')}
          </h2>
          <p className="u-measure mt-5 text-[0.9375rem] leading-relaxed text-fg-mid">
            {t('assembly.lede')}
          </p>

          <ol className="mt-8">
            {PART_KEYS.map((key, i) => (
              <li key={key} className="u-spec">
                <span className="font-mono text-[0.625rem] tracking-[0.14em] uppercase text-fg-low">
                  <span className="text-accent tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <span className="font-mono text-[0.8125rem] text-fg">{t(key)}</span>
              </li>
            ))}
          </ol>

          <p className="u-label mt-6 leading-relaxed normal-case tracking-normal">
            {t('assembly.note')}
          </p>
        </div>

        <div className="relative lg:col-span-8">
          <div className="u-plate relative aspect-[4/3] overflow-hidden rounded-part border border-rule bg-surface-sunk lg:aspect-[16/11]">
            {/* Respaldo: no se oculta hasta que hay un cuadro real. */}
            <div
              className="absolute inset-0 grid place-items-center p-8 transition-opacity duration-500 ease-rail"
              style={{ opacity: live ? 0.12 : 1 }}
            >
              <ComponentRender
                shape="gpu"
                accent="#414D58"
                seed={12}
                fans={3}
                view="annotated"
                dims={['336 mm', '3 ranuras', '1× 12V-2×6']}
                className="w-full max-w-[560px]"
                title={t('assembly.title')}
              />
            </div>

            {near ? <GpuAssembly onReady={onReady} onLost={onLost} className="absolute inset-0" /> : null}

            <p className="u-label absolute bottom-4 left-4 flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-accent" aria-hidden="true" />
              {t('assembly.hint')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
