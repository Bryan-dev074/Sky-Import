'use client'

import Link from 'next/link'
import { Trace } from '@/components/motif/Trace'
import { Reveal, SplitWords } from '@/components/motion/Motion'
import { useI18n } from '@/lib/i18n/context'

/**
 * La página que se ve cuando una dirección no existe. Habla el idioma de la casa
 * y ofrece salida en vez de disculparse.
 */
export function NotFoundView() {
  const { t, path } = useI18n()
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-steel opacity-25" aria-hidden="true">
        <Trace width={1400} height={600} lines={8} seed={101} className="h-full w-full" />
      </div>
      <div className="u-page relative flex min-h-[72vh] flex-col items-start justify-center py-24">
        <Reveal>
          <p className="u-eyebrow">404</p>
        </Reveal>
        <SplitWords
          as="h1"
          start="now"
          delay={120}
          text={t('notFound.title')}
          className="u-display mt-6 text-[clamp(2rem,5vw,3.5rem)]"
        />
        <Reveal delayIndex={2}>
          <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">
            {t('notFound.body')}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={path('/catalogo')} className="u-btn u-btn-solid">
              {t('cta.catalog')}
            </Link>
            <Link href={path('/')} className="u-btn u-btn-line">
              {t('cta.backToStore')}
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
