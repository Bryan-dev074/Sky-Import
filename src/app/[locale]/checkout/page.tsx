import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow'
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
  return { title: makeT(locale)('checkout.title') }
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const t = makeT(raw)

  return (
    <>
      <header className="u-page pt-28 pb-10 lg:pt-36">
        <p className="u-eyebrow">{t('checkout.title')}</p>
      </header>
      <CheckoutFlow />
    </>
  )
}
