import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser'
import { CatalogSkeleton } from '@/components/catalog/CatalogSkeleton'
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
  return { title: t('catalog.title'), description: t('catalog.lede') }
}

export default async function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const t = makeT(raw)

  return (
    <>
      <header className="u-page pt-28 pb-10 lg:pt-36">
        <p className="u-eyebrow">{t('catalog.eyebrow')}</p>
        <h1 className="u-display mt-5 text-[clamp(2.2rem,5.5vw,4rem)]">{t('catalog.title')}</h1>
        <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">
          {t('catalog.lede')}
        </p>
      </header>

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogBrowser />
      </Suspense>
    </>
  )
}
