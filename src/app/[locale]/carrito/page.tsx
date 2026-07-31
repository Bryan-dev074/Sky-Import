import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CartContents } from '@/components/cart/CartContents'
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
  return { title: makeT(locale)('cart.title') }
}

/**
 * En teléfono el carrito tiene página propia además del cajón: es más cómodo
 * revisar cantidades a pantalla completa que dentro de un panel deslizante.
 */
export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const t = makeT(raw)

  return (
    <>
      <header className="u-page pt-28 pb-8 lg:pt-36">
        <p className="u-eyebrow">{t('checkout.orderSummary')}</p>
        <h1 className="u-display mt-5 text-[clamp(2.2rem,5.5vw,3.5rem)]">{t('cart.title')}</h1>
      </header>

      <div className="u-page pb-24">
        <div className="mx-auto flex max-w-[720px] flex-col border-t border-rule">
          <CartContents />
        </div>
      </div>
    </>
  )
}
