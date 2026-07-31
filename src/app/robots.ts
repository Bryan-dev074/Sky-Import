import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

/**
 * Mientras Sky Import no sea un comercio operativo, la tienda NO debe indexarse.
 * Cuando lo sea, basta con invertir esta regla y quitar el `robots` de la
 * metadata del layout: no hay ninguna otra copia de esta decisión.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
    sitemap: `${SITE.origin}/sitemap.xml`,
  }
}
