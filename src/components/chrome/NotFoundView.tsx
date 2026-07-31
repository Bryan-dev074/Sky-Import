import Link from 'next/link'
import { Trace } from '@/components/motif/Trace'
import { makeT } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locales'

/**
 * La página que se ve cuando una dirección no existe. Habla el idioma de la casa
 * y ofrece salida en vez de disculparse.
 */
export function NotFoundView({ locale }: { locale: Locale }) {
  const t = makeT(locale)
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-steel opacity-25" aria-hidden="true">
        <Trace width={1400} height={600} lines={8} seed={101} className="h-full w-full" />
      </div>
      <div className="u-page relative flex min-h-[72vh] flex-col items-start justify-center py-24">
        <p className="u-eyebrow">404</p>
        <h1 className="u-display mt-6 text-[clamp(2rem,5vw,3.5rem)]">{t('notFound.title')}</h1>
        <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">
          {t('notFound.body')}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={`/${locale}/catalogo`} className="u-btn u-btn-solid">
            {t('cta.catalog')}
          </Link>
          <Link href={`/${locale}`} className="u-btn u-btn-line">
            {t('cta.backToStore')}
          </Link>
        </div>
      </div>
    </div>
  )
}
