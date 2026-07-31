import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Configurator } from '@/components/builder/Configurator'
import { Trace } from '@/components/motif/Trace'
import { makeT } from '@/lib/i18n/dictionary'
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/locales'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'es'
  const t = makeT(locale)
  return { title: t('build.title'), description: t('build.lede') }
}

export default async function BuilderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const t = makeT(raw)

  return (
    <>
      <header className="relative overflow-hidden pt-28 pb-12 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 text-steel opacity-25" aria-hidden="true">
          <Trace width={1400} height={360} lines={7} seed={53} className="h-full w-full" />
        </div>
        <div className="u-page relative">
          <p className="u-eyebrow">{t('build.eyebrow')}</p>
          <h1 className="u-display mt-5 text-[clamp(2.2rem,5.5vw,4rem)]">{t('build.title')}</h1>
          <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">
            {t('build.lede')}
          </p>
        </div>
      </header>

      <Configurator />
    </>
  )
}
