'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ComponentRender } from '@/components/render/ComponentRender'
import { useI18n } from '@/lib/i18n/context'
import type { AssemblyStep } from '@/lib/assemblyProgress'

const GpuAssembly = dynamic(() => import('@/components/three/GpuAssembly'), { ssr: false })

const PART_KEYS = [
  'assembly.part1',
  'assembly.part2',
  'assembly.part3',
  'assembly.part4',
  'assembly.part5',
  'assembly.part6',
  'assembly.part7',
] as const

const STEPS: AssemblyStep[] = ['chassis', 'thermal', 'frame', 'details', 'power']

export function AssemblySection() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  const [live, setLive] = useState(false)
  const [step, setStep] = useState<AssemblyStep>('chassis')

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setNear(true))
      return () => cancelAnimationFrame(frame)
    }
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '700px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const onReady = useCallback(() => setLive(true), [])
  const onLost = useCallback(() => setLive(false), [])
  const onStepChange = useCallback((next: AssemblyStep) => setStep(next), [])
  const activeStep = STEPS.indexOf(step)

  return (
    <section
      ref={sectionRef}
      data-assembly-scroll
      data-assembly-step={step}
      className="relative h-[320svh] border-t border-rule bg-[#05090c] sm:h-[340svh]"
      aria-labelledby="ensamblaje"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center overflow-hidden py-16 lg:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_68%_45%,rgba(59,197,241,0.11),transparent_38%),linear-gradient(110deg,transparent_18%,rgba(63,207,255,0.035)_50%,transparent_73%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(77,171,204,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(77,171,204,0.16)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]" />
          <div className="u-assembly-scan absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
        </div>

        <div className="u-page relative z-10 grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="u-eyebrow">{t('assembly.eyebrow')}</p>
            <h2 id="ensamblaje" className="u-display u-kinetic-title mt-5 text-[clamp(2.1rem,5vw,4.4rem)] leading-[0.94]">
              {t('assembly.title')}
            </h2>
            <p className="u-measure mt-6 text-[0.9375rem] leading-relaxed text-fg-mid">
              {t('assembly.lede')}
            </p>

            <div className="mt-8 flex items-center gap-3" aria-live="polite">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[0.68rem] tracking-[0.16em] text-accent uppercase">
                {t(`assembly.stage.${step}`)}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-1" aria-hidden="true">
              {STEPS.map((item, index) => (
                <span
                  key={item}
                  className={`h-px transition-all duration-500 ${index <= activeStep ? 'bg-accent shadow-[0_0_12px_rgba(66,205,255,0.8)]' : 'bg-rule'}`}
                />
              ))}
            </div>

            <ol className="mt-7 hidden xl:block">
              {PART_KEYS.map((key, index) => (
                <li key={key} className="u-spec py-2.5">
                  <span className="font-mono text-[0.625rem] tracking-[0.14em] text-accent uppercase tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[0.76rem] text-fg">{t(key)}</span>
                </li>
              ))}
            </ol>

            <p className="mt-6 max-w-md font-mono text-[0.67rem] leading-relaxed tracking-[0.04em] text-fg-low">
              {t('assembly.note')}
            </p>
          </div>

          <div className="relative lg:col-span-8">
            <div className="u-assembly-stage relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_50%_44%,rgba(21,40,49,0.72),rgba(3,7,9,0.96)_72%)] shadow-[0_34px_100px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] lg:aspect-[16/10]">
              <div
                className="absolute inset-0 grid place-items-center p-8 transition-opacity duration-700 ease-rail"
                style={{ opacity: live ? 0.035 : 0.82 }}
              >
                <ComponentRender
                  shape="gpu"
                  accent="#4b5a63"
                  seed={5090}
                  fans={2}
                  view="annotated"
                  dims={['304 mm', '2 slots', '575 W']}
                  className="w-full max-w-[680px]"
                  title={t('assembly.title')}
                />
              </div>

              {near ? (
                <GpuAssembly
                  onReady={onReady}
                  onLost={onLost}
                  onStepChange={onStepChange}
                  className="absolute inset-0"
                />
              ) : null}

              <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between font-mono text-[0.58rem] tracking-[0.14em] text-fg-low uppercase">
                <span>FE / BROWSER SCULPT</span>
                <span className="text-accent">LIVE 60</span>
              </div>
              <p className="u-label pointer-events-none absolute bottom-5 left-5 flex items-center gap-2">
                <span className="inline-block h-px w-7 bg-accent shadow-[0_0_10px_rgba(66,205,255,0.9)]" />
                {step === 'power' ? t('assembly.hint.complete') : t('assembly.hint')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
