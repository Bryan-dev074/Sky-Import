import Image from 'next/image'
import type { Locale } from '@/lib/i18n/locales'
import type { Product } from '@/lib/catalog/types'

interface ProductImageProps {
  product: Product
  locale: Locale
  priority?: boolean
  sizes?: string
  className?: string
  imageClassName?: string
}

/**
 * Fotografía real y local del producto. El contenedor conserva un halo de
 * estudio muy tenue; el desplazamiento y la escala se leen de las variables
 * que escribe la vitrina inclinable, sin provocar renders de React.
 */
export function ProductImage({
  product,
  locale,
  priority = false,
  sizes = '(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw',
  className,
  imageClassName,
}: ProductImageProps) {
  return (
    <span className={`u-product-media ${className ?? ''}`}>
      <span className="u-product-media__aura" aria-hidden="true" />
      <Image
        src={product.media.primary}
        alt={product.media.alt[locale]}
        fill
        priority={priority}
        sizes={sizes}
        draggable={false}
        className={`u-product-media__asset ${imageClassName ?? ''}`}
        style={{ objectPosition: product.media.objectPosition ?? '50% 50%' }}
      />
    </span>
  )
}
