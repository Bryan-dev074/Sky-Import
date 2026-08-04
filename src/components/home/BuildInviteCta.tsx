import Link from 'next/link'

import { ProductImage } from '@/components/product/ProductImage'
import { PRODUCT_BY_SLUG } from '@/lib/catalog/products'
import type { Product } from '@/lib/catalog/types'
import type { Locale } from '@/lib/i18n/locales'

const INVITE_PRODUCTS = [
  'ryzen-7-9800x3d',
  'corsair-vengeance-ddr5-32gb-6000',
  'geforce-rtx-5090-founders-edition-32gb',
]
  .map((slug) => PRODUCT_BY_SLUG.get(slug))
  .filter((product): product is Product => Boolean(product))

interface BuildInviteCtaProps {
  href: string
  label: string
  locale: Locale
  ambient?: boolean
  className?: string
}

/**
 * Una micro línea de montaje dentro del CTA: las mismas fotos transparentes
 * del catálogo se convierten en una explicación visual, no en decoración.
 */
export function BuildInviteCta({
  href,
  label,
  locale,
  ambient = false,
  className,
}: BuildInviteCtaProps) {
  return (
    <Link
      href={href}
      className={`u-build-invite ${className ?? ''}`}
      data-build-invite={ambient ? 'ambient' : 'interactive'}
    >
      <span className="u-build-invite__rail" aria-hidden="true">
        {INVITE_PRODUCTS.map((product) => (
          <span className="u-build-invite__part" key={product.slug}>
            <ProductImage product={product} locale={locale} sizes="30px" className="h-full w-full" />
          </span>
        ))}
        <span className="u-build-invite__socket">
          <span />
        </span>
      </span>
      <span className="u-build-invite__label">{label}</span>
      <span className="u-build-invite__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
