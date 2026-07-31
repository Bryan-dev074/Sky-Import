import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ComponentRender } from '@/components/render/ComponentRender'
import { Reveal } from '@/components/ui/Reveal'
import { GUIDES } from '@/content/guides'
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
  return { title: t('guides.title'), description: t('guides.lede') }
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)

  return (
    <div data-surface="aluminio" className="bg-surface text-fg">
      <header className="u-page pt-28 pb-12 lg:pt-36">
        <p className="u-eyebrow">{t('guides.eyebrow')}</p>
        <h1 className="u-display mt-5 text-[clamp(2.2rem,5.5vw,4rem)]">{t('guides.title')}</h1>
        <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">
          {t('guides.lede')}
        </p>
      </header>

      <div className="u-page pb-24">
        <ul className="border-t border-rule">
          {GUIDES.map((guide, i) => (
            <Reveal as="li" key={guide.slug} delayIndex={i} className="border-b border-rule">
              <Link
                href={`/${locale}/guias/${guide.slug}`}
                data-cursor="link"
                className="group grid gap-5 py-8 md:grid-cols-12 md:items-center md:gap-8"
              >
                <span className="font-mono text-[0.6875rem] tabular-nums text-accent md:col-span-1">
                  {guide.index}
                </span>
                <span className="hidden w-20 md:col-span-2 md:block">
                  <ComponentRender
                    shape={guide.shape}
                    accent="#6E7A85"
                    seed={i * 11 + 5}
                    className="w-full opacity-70 transition-opacity duration-300 ease-rail group-hover:opacity-100"
                  />
                </span>
                <span className="md:col-span-9">
                  <span className="u-display-sm block text-[clamp(1.25rem,2.6vw,1.75rem)]">
                    <span className="relative inline">
                      {guide.title[locale]}
                      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-[320ms] ease-rail group-hover:scale-x-100" />
                    </span>
                  </span>
                  <span className="u-measure-wide mt-3 block text-[0.9375rem] leading-relaxed text-fg-mid">
                    {guide.standfirst[locale]}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  )
}
