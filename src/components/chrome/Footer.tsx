import Link from 'next/link'
import { BrandMark, Wordmark } from '@/components/brand/Wordmark'
import { Trace } from '@/components/motif/Trace'
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/catalog/categories'
import { GUIDES } from '@/content/guides'
import { makeT } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locales'
import { CONTACT, SITE, hasWhatsapp, whatsappLink } from '@/config/site'

/**
 * El trazado sale del sello hacia los bordes: es el cuarto y último lugar donde
 * aparece el motivo de la casa.
 */
export function Footer({ locale }: { locale: Locale }) {
  const t = makeT(locale)
  const p = (path: string) => `/${locale}${path}`

  return (
    <footer className="relative border-t border-rule bg-surface">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden text-steel opacity-25">
        <Trace width={1400} height={112} lines={4} seed={41} className="h-full w-full" />
      </div>

      <div className="u-page relative pt-24 pb-12">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 text-fg">
              <BrandMark size={26} className="text-accent" />
              <Wordmark className="text-sm" />
            </div>
            <p className="u-measure mt-5 text-[0.9375rem] leading-relaxed text-fg-mid">
              {locale === 'es'
                ? 'Importación de componentes para montar, mejorar y personalizar computadoras. Publicamos la ficha técnica antes que la promesa comercial.'
                : 'Importação de componentes para montar, melhorar e personalizar computadores. Publicamos a ficha técnica antes da promessa comercial.'}
            </p>
            <p className="u-label mt-6">{t('brand.place')}</p>
          </div>

          <nav className="md:col-span-3" aria-labelledby="pie-tienda">
            <h2 id="pie-tienda" className="u-label mb-4 text-fg">
              {t('footer.explore')}
            </h2>
            <ul className="space-y-2.5">
              {[
                { href: '/catalogo', label: t('nav.catalog') },
                { href: '/armar', label: t('nav.build') },
                { href: '/guias', label: t('nav.guides') },
                { href: '/carrito', label: t('nav.cart') },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={p(item.href)}
                    data-cursor="link"
                    className="u-link text-[0.875rem] text-fg-mid hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="u-label mt-8 mb-4 text-fg">{t('catalog.category')}</h2>
            <ul className="space-y-2">
              {CATEGORY_ORDER.slice(0, 5).map((slug) => (
                <li key={slug}>
                  <Link
                    href={`${p('/catalogo')}?categoria=${slug}`}
                    prefetch={false}
                    data-cursor="link"
                    className="u-link text-[0.8125rem] text-fg-low hover:text-fg"
                  >
                    {CATEGORY_META[slug].name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-labelledby="pie-guias">
            <h2 id="pie-guias" className="u-label mb-4 text-fg">
              {t('footer.help')}
            </h2>
            <ul className="space-y-2.5">
              {GUIDES.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={p(`/guias/${guide.slug}`)}
                    data-cursor="link"
                    className="u-link text-[0.8125rem] text-fg-mid hover:text-fg"
                  >
                    {guide.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <h2 className="u-label mb-4 text-fg">{t('footer.contact')}</h2>
            {hasWhatsapp ? (
              <>
                <a
                  href={whatsappLink(t('wa.generic'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="u-link font-mono text-[0.8125rem] tabular-nums text-fg"
                >
                  {CONTACT.whatsappDisplay}
                </a>
                <p className="u-label mt-2 normal-case tracking-normal">WhatsApp</p>
              </>
            ) : null}
          </div>
        </div>

        <div className="u-rule mt-14" />

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <p className="u-measure-wide u-label leading-relaxed normal-case tracking-normal">
            <span className="font-medium uppercase tracking-[0.14em]">{t('footer.legal')} — </span>
            {t('footer.legalNote')}
          </p>
          <p className="u-label shrink-0">
            © {SITE.name}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
