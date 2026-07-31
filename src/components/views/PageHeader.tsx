'use client'

import dynamic from 'next/dynamic'
import { Trace } from '@/components/motif/Trace'
import { Reveal, SplitWords } from '@/components/motion/Motion'
import { useI18n } from '@/lib/i18n/context'
import type { DictKey } from '@/lib/i18n/dictionary'

/** Los haces solo se piden donde de verdad se usan. */
const Beams = dynamic(() => import('@/components/background/Beams'), { ssr: false })

/**
 * Encabezado de sección interior. El antetítulo entra, el titular sube palabra
 * por palabra desde sus máscaras y la línea de valor llega después. El mismo
 * compás en catálogo, configurador, carrito y checkout — que es lo que hace que
 * la casa se sienta una sola.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  background = 'none',
}: {
  eyebrow?: DictKey
  title: DictKey
  lede?: DictKey
  background?: 'none' | 'trace' | 'beams'
}) {
  const { t } = useI18n()

  return (
    <header className="relative overflow-hidden pt-28 pb-10 lg:pt-36">
      {background === 'trace' ? (
        <div className="pointer-events-none absolute inset-0 text-steel opacity-25" aria-hidden="true">
          <Trace width={1400} height={360} lines={7} seed={53} className="h-full w-full" />
        </div>
      ) : null}

      {background === 'beams' ? (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
            <Beams className="h-full w-full" rotation={22} beamNumber={10} speed={1.4} />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent"
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="u-page relative">
        {eyebrow ? (
          <Reveal from="left" distance={14}>
            <p className="u-eyebrow">{t(eyebrow)}</p>
          </Reveal>
        ) : null}

        <SplitWords
          as="h1"
          start="now"
          delay={90}
          text={t(title)}
          className="u-display mt-5 text-[clamp(2.2rem,5.5vw,4rem)]"
        />

        {lede ? (
          <Reveal delayIndex={2}>
            <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">{t(lede)}</p>
          </Reveal>
        ) : null}
      </div>
    </header>
  )
}
