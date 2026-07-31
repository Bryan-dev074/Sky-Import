import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ComponentRender } from '@/components/render/ComponentRender'
import { ProductCard } from '@/components/catalog/ProductCard'
import { AssemblySection } from '@/components/home/AssemblySection'
import { Trace } from '@/components/motif/Trace'
import { Reveal } from '@/components/ui/Reveal'
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/catalog/categories'
import { PRODUCTS } from '@/lib/catalog/products'
import { GUIDES } from '@/content/guides'
import { makeT } from '@/lib/i18n/dictionary'
import { isLocale, type Locale } from '@/lib/i18n/locales'
import { CONTACT, hasWhatsapp, whatsappLink } from '@/config/site'
import { CURRENCIES } from '@/lib/money'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = makeT(locale)
  const p = (path: string) => `/${locale}${path}`

  const featured = PRODUCTS.filter((product) => product.featured).slice(0, 6)
  const countByCategory = new Map<string, number>()
  for (const product of PRODUCTS) {
    countByCategory.set(product.category, (countByCategory.get(product.category) ?? 0) + 1)
  }

  const heroGpu = PRODUCTS.find((product) => product.slug === 'geforce-rtx-5080-16gb') ?? PRODUCTS[0]!

  return (
    <>
      {/* ─────────────────────────────────────────────────────────── HERO ── */}
      <section className="u-plate relative overflow-hidden pt-28 lg:pt-36" aria-labelledby="titular">
        <div className="u-page grid items-center gap-10 pb-14 lg:grid-cols-12 lg:gap-8 lg:pb-20">
          <div className="lg:col-span-6 xl:col-span-5">
            <p className="u-eyebrow">{t('home.hero.eyebrow')}</p>

            <h1
              id="titular"
              className="u-display mt-6 text-[clamp(2.6rem,7vw,5.5rem)]"
            >
              {[t('home.hero.title1'), t('home.hero.title2'), t('home.hero.title3')].map(
                (line, i) => (
                  <span key={line} className="hero-mask">
                    <span
                      className={`hero-line ${i === 2 ? 'text-fg-mid' : ''}`}
                      style={{ '--line': i } as React.CSSProperties}
                    >
                      {line}
                    </span>
                  </span>
                ),
              )}
            </h1>

            <Reveal delayIndex={3}>
              <p className="u-measure mt-7 text-[1.0625rem] leading-relaxed text-fg-mid">
                {t('home.hero.lede')}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={p('/catalogo')} className="u-btn u-btn-solid">
                  {t('cta.catalog')}
                </Link>
                <Link href={p('/armar')} className="u-btn u-btn-line">
                  {t('cta.build')}
                </Link>
              </div>
            </Reveal>
          </div>

          {/* El render desborda el margen: la pieza no está encajonada. */}
          <div className="relative lg:col-span-6 xl:col-span-7 lg:-mr-[6vw]">
            <div className="relative rounded-part">
              <ComponentRender
                {...heroGpu.render}
                variant="annotated"
                dims={[
                  `${heroGpu.compat.kind === 'gpu' ? heroGpu.compat.lengthMm : 0} mm`,
                  heroGpu.compat.kind === 'gpu' ? `${heroGpu.compat.tgpW} W` : '',
                  heroGpu.compat.kind === 'gpu' ? heroGpu.compat.bus : '',
                ].filter(Boolean)}
                className="w-full"
                title={t('home.hero.figureAlt')}
              />
              <span className="u-sweep" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* El manifiesto empieza antes del scroll. */}
        <div className="u-rule" />
        <dl className="u-page grid grid-cols-2 gap-x-6 py-6 sm:grid-cols-4">
          {[
            { label: t('home.manifest.pieces'), value: String(PRODUCTS.length) },
            { label: t('home.manifest.categories'), value: String(CATEGORY_ORDER.length) },
            { label: t('home.manifest.currencies'), value: CURRENCIES.join(' · ') },
            { label: t('home.manifest.check'), value: t('home.manifest.checkValue') },
          ].map((item) => (
            <div key={item.label} className="py-2">
              <dt className="u-label">{item.label}</dt>
              <dd className="mt-1.5 font-mono text-[0.9375rem] tabular-nums text-fg">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ────────────────────────────────────────────────────── CATEGORÍAS ── */}
      <section className="u-page border-t border-rule py-24 lg:py-32" aria-labelledby="categorias">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="u-eyebrow">{t('home.categories.eyebrow')}</p>
            <h2 id="categorias" className="u-display mt-5 text-[clamp(1.9rem,4vw,3rem)]">
              {t('home.categories.title')}
            </h2>
            <p className="u-measure mt-5 text-[0.9375rem] leading-relaxed text-fg-mid">
              {t('home.categories.lede')}
            </p>
          </div>

          <ul className="lg:col-span-8">
            {CATEGORY_ORDER.map((slug, i) => {
              const meta = CATEGORY_META[slug]
              return (
                <Reveal as="li" key={slug} delayIndex={i} className="border-t border-rule last:border-b">
                  <Link
                    href={`${p('/catalogo')}?categoria=${slug}`}
                    prefetch={false}
                    data-cursor="link"
                    className="group flex items-center gap-5 py-5 sm:gap-8"
                  >
                    <span className="font-mono text-[0.6875rem] tabular-nums text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="hidden w-16 shrink-0 sm:block">
                      <ComponentRender shape={meta.shape} accent="#6E7A85" seed={i * 7 + 3} className="w-full opacity-60 transition-opacity duration-300 ease-rail group-hover:opacity-100" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1.0625rem] font-medium text-fg">
                        {meta.name[locale]}
                      </span>
                      <span className="mt-1 block text-[0.875rem] leading-snug text-fg-low">
                        {meta.role[locale]}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-fg-low">
                      {countByCategory.get(slug) ?? 0}
                    </span>
                    <span
                      className="shrink-0 text-fg-low transition-transform duration-300 ease-rail group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" stroke="currentColor" strokeWidth="1.3" fill="none">
                        <path d="M2 8h11M9 4l4 4-4 4" />
                      </svg>
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────── DESTACADOS ── */}
      <section className="u-page border-t border-rule py-24 lg:py-32" aria-labelledby="destacados">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-eyebrow">{t('home.featured.eyebrow')}</p>
            <h2 id="destacados" className="u-display mt-5 text-[clamp(1.9rem,4vw,3rem)]">
              {t('home.featured.title')}
            </h2>
          </div>
          <Link
            href={p('/catalogo')}
            data-cursor="link"
            className="u-link font-mono text-[0.6875rem] tracking-[0.14em] uppercase text-fg-mid"
          >
            {t('cta.viewAll')}
          </Link>
        </div>

        <p className="u-measure mt-5 text-[0.9375rem] leading-relaxed text-fg-mid">
          {t('home.featured.lede')}
        </p>

        <div className="mt-12 grid gap-x-6 gap-y-12 border-b border-rule pb-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <Reveal key={product.slug} delayIndex={i}>
              <ProductCard product={product} locale={locale} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── ENSAMBLAJE ── */}
      <AssemblySection />

      {/* ══ SEGUNDA SUPERFICIE ══ el configurador y las guías van sobre aluminio */}
      <div data-surface="aluminio" className="bg-surface text-fg">
        {/* ───────────────────────────────────────────────── CONFIGURADOR ── */}
        <section className="relative overflow-hidden" aria-labelledby="configurador">
          <div className="pointer-events-none absolute inset-0 text-steel opacity-30">
            <Trace width={1400} height={520} lines={9} seed={73} className="h-full w-full" />
          </div>

          <div className="u-page relative py-24 lg:py-32">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="u-eyebrow">{t('home.builder.eyebrow')}</p>
                <h2 id="configurador" className="u-display mt-5 text-[clamp(2rem,4.5vw,3.5rem)]">
                  {t('home.builder.title')}
                </h2>
                <p className="u-measure mt-6 text-[1.0625rem] leading-relaxed text-fg-mid">
                  {t('home.builder.lede')}
                </p>
                <Link href={p('/armar')} className="u-btn u-btn-solid mt-9">
                  {t('home.builder.cta')}
                </Link>
              </div>

              <div className="lg:col-span-5">
                <ul className="border-t border-rule">
                  {(
                    [
                      ['cpu', 'motherboard'],
                      ['ram', 'motherboard'],
                      ['gpu', 'psu'],
                      ['gpu', 'case'],
                    ] as const
                  ).map(([a, b], i) => (
                    <li key={`${a}-${b}`} className="flex items-center gap-3 border-b border-rule py-4">
                      <span className="font-mono text-[0.625rem] tabular-nums text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[0.75rem] text-fg">{t(`build.slot.${a}`)}</span>
                      <span className="h-px flex-1 bg-rule" aria-hidden="true" />
                      <span className="font-mono text-[0.75rem] text-fg">{t(`build.slot.${b}`)}</span>
                    </li>
                  ))}
                </ul>
                <p className="u-label mt-4 leading-relaxed normal-case tracking-normal">
                  {t('build.disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── GUÍAS ── */}
        <section className="u-page border-t border-rule py-24 lg:py-32" aria-labelledby="guias">
          <p className="u-eyebrow">{t('home.guides.eyebrow')}</p>
          <h2 id="guias" className="u-display mt-5 text-[clamp(1.9rem,4vw,3rem)]">
            {t('home.guides.title')}
          </h2>
          <p className="u-measure mt-5 text-[0.9375rem] leading-relaxed text-fg-mid">
            {t('home.guides.lede')}
          </p>

          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {GUIDES.map((guide, i) => (
              <Reveal as="li" key={guide.slug} delayIndex={i} className="border-t border-rule pt-6">
                <Link href={p(`/guias/${guide.slug}`)} data-cursor="link" className="group block">
                  <span className="font-mono text-[0.6875rem] tabular-nums text-accent">
                    {guide.index}
                  </span>
                  <h3 className="u-display-sm mt-3 text-[1.375rem]">
                    <span className="relative inline">
                      {guide.title[locale]}
                      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-[320ms] ease-rail group-hover:scale-x-100" />
                    </span>
                  </h3>
                  <p className="u-measure mt-3 text-[0.9375rem] leading-relaxed text-fg-mid">
                    {guide.standfirst[locale]}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      </div>

      {/* ─────────────────────────────────────────────────────── BENEFICIOS ── */}
      <section className="u-page border-t border-rule py-24 lg:py-32" aria-labelledby="beneficios">
        <p className="u-eyebrow">{t('home.benefits.eyebrow')}</p>
        <h2 id="beneficios" className="u-display mt-5 text-[clamp(1.9rem,4vw,3rem)]">
          {t('home.benefits.title')}
        </h2>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n, i) => (
            <Reveal key={n} delayIndex={i} className="border-t border-rule pt-5">
              <span className="font-mono text-[0.6875rem] tabular-nums text-accent">
                {String(n).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-[1.0625rem] font-medium leading-snug text-fg">
                {t(`home.benefit${n}.title` as 'home.benefit1.title')}
              </h3>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-fg-mid">
                {t(`home.benefit${n}.body` as 'home.benefit1.body')}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── CIERRE ── */}
      {hasWhatsapp ? (
        <section className="border-t border-rule">
          <div className="u-page flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="u-eyebrow">{t('footer.contact')}</p>
              <p className="u-display-sm mt-4 text-[clamp(1.375rem,3vw,2rem)]">
                {CONTACT.whatsappDisplay}
              </p>
            </div>
            <a
              href={whatsappLink(t('wa.generic'))}
              target="_blank"
              rel="noopener noreferrer"
              className="u-btn u-btn-solid"
            >
              {t('cta.whatsapp')}
            </a>
          </div>
        </section>
      ) : null}
    </>
  )
}
