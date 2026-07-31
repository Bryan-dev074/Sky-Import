import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ComponentRender } from '@/components/render/ComponentRender'
import { GUIDES, GUIDE_BY_SLUG } from '@/content/guides'
import { makeT } from '@/lib/i18n/dictionary'
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/locales'

/**
 * Solo existen las rutas del catálogo. Un slug que no está en la lista no es una
 * ruta de la aplicación, así que responde el 404 global de la casa.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => GUIDES.map((guide) => ({ locale, slug: guide.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'es'
  const guide = GUIDE_BY_SLUG.get(slug)
  if (!guide) return { title: makeT(locale)('guides.notFound') }
  return { title: guide.title[locale], description: guide.standfirst[locale] }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)
  const guide = GUIDE_BY_SLUG.get(slug)
  if (!guide) notFound()

  const next = GUIDES[(GUIDES.findIndex((g) => g.slug === slug) + 1) % GUIDES.length]

  return (
    <div data-surface="aluminio" className="bg-surface text-fg">
      <article className="u-page pt-28 pb-20 lg:pt-36">
        <Link
          href={`/${locale}/guias`}
          data-cursor="link"
          className="u-link u-label hover:text-fg"
        >
          ← {t('guides.back')}
        </Link>

        <header className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="u-eyebrow">
              {t('guides.eyebrow')} · {guide.index}
            </p>
            <h1 className="u-display mt-5 text-[clamp(2rem,5vw,3.5rem)]">{guide.title[locale]}</h1>
            <p className="u-measure-wide mt-6 text-[1.125rem] leading-relaxed text-fg-mid">
              {guide.standfirst[locale]}
            </p>
          </div>
          <div className="hidden lg:col-span-4 lg:block">
            <ComponentRender
              shape={guide.shape}
              accent="#6E7A85"
              seed={17}
              className="w-full opacity-80"
            />
          </div>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-3">
            {guide.sections.map((section, i) => (
              <section key={section.heading[locale]} className="border-t border-rule pt-8 pb-10">
                <p className="u-label mb-4">
                  <span className="text-accent tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </p>
                <h2 className="u-display-sm text-[clamp(1.25rem,2.6vw,1.75rem)]">
                  {section.heading[locale]}
                </h2>
                <div className="mt-5 flex flex-col gap-5">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph[locale].slice(0, 32)}
                      className="u-measure-wide text-[1.0625rem] leading-[1.75] text-fg-mid"
                    >
                      {paragraph[locale]}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            {next ? (
              <Link
                href={`/${locale}/guias/${next.slug}`}
                data-cursor="link"
                className="group flex items-center justify-between gap-6 border-t border-rule pt-8"
              >
                <span>
                  <span className="u-label block">{t('guides.read')}</span>
                  <span className="u-display-sm mt-2 block text-[1.25rem]">
                    {next.title[locale]}
                  </span>
                </span>
                <span
                  className="shrink-0 text-fg-low transition-transform duration-300 ease-rail group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 16 16" width="16" height="16" stroke="currentColor" strokeWidth="1.3" fill="none">
                    <path d="M2 8h11M9 4l4 4-4 4" />
                  </svg>
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  )
}
