'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ProductImage } from '@/components/product/ProductImage'
import { Price } from '@/components/ui/Price'
import { CtaBody } from '@/components/ui/Cta'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { useI18n } from '@/lib/i18n/context'
import { useBuild, resolveBuild } from '@/lib/build'
import { useCart } from '@/lib/cart'
import { useUi } from '@/lib/ui'
import { PRODUCTS } from '@/lib/catalog/products'
import { headlineSpec } from '@/lib/catalog/derive'
import {
  BUILD_SLOTS,
  checkBuild,
  estimatedDrawW,
  suggestedPsuW,
  summarize,
  type BuildSlot,
} from '@/lib/compat'
import type { CompatKind, Product } from '@/lib/catalog/types'

/**
 * TABLERO DE COMPATIBILIDAD
 *
 * Cada ranura es una fila con su propio rail de 1 px a la izquierda — el motivo
 * del trazado convertido en estado. El rail está en acero cuando la ranura está
 * vacía, en cian cuando tiene pieza, y en ámbar o herrumbre cuando esa ranura
 * participa de una advertencia. Es el único sitio de la interfaz donde el color
 * de estado sustituye al acento, porque ámbar y cian nunca conviven.
 */

/** Qué tipo de ficha admite cada ranura. */
const KIND_OF_SLOT: Record<BuildSlot, CompatKind> = {
  cpu: 'cpu',
  motherboard: 'motherboard',
  ram: 'ram',
  gpu: 'gpu',
  storage: 'storage',
  psu: 'psu',
  cooling: 'cooling',
  case: 'case',
}

function optionsFor(slot: BuildSlot): Product[] {
  return PRODUCTS.filter((product) => product.compat.kind === KIND_OF_SLOT[slot])
}

export function Configurator() {
  const { t, locale, path } = useI18n()
  const picks = useBuild((s) => s.picks)
  const hydrated = useBuild((s) => s.hydrated)
  const pick = useBuild((s) => s.pick)
  const unpick = useBuild((s) => s.unpick)
  const resetBuild = useBuild((s) => s.reset)
  const addToCart = useCart((s) => s.add)
  const toast = useUi((s) => s.toast)

  const [openSlot, setOpenSlot] = useState<BuildSlot | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeDialog = useCallback(() => setOpenSlot(null), [])
  useFocusTrap(dialogRef, openSlot !== null, closeDialog)

  const build = useMemo(() => resolveBuild(picks), [picks])
  const issues = useMemo(() => checkBuild(build), [build])
  const status = summarize(issues)
  const draw = estimatedDrawW(build)
  const psu = suggestedPsuW(build)

  const chosen = BUILD_SLOTS.map((slot) => build[slot]).filter(Boolean) as Product[]
  const totalUsd = chosen.reduce((sum, product) => sum + product.priceUsd, 0)

  /** Ranuras señaladas por alguna advertencia, con su nivel. */
  const flagged = useMemo(() => {
    const map = new Map<BuildSlot, 'bloqueo' | 'aviso'>()
    for (const issue of issues) {
      if (issue.level === 'nota') continue
      for (const slot of issue.slots) {
        if (issue.level === 'bloqueo' || !map.has(slot)) map.set(slot, issue.level)
      }
    }
    return map
  }, [issues])

  const overall = chosen.length === 0 ? 'vacio' : status.status

  return (
    <div className="u-page grid gap-10 pb-24 lg:grid-cols-12 lg:gap-12">
      {/* ── las ocho ranuras ── */}
      <div className="lg:col-span-7">
        <ul>
          {BUILD_SLOTS.map((slot, i) => {
            const product = build[slot]
            const flag = flagged.get(slot)
            const railColor =
              flag === 'bloqueo'
                ? 'bg-rust'
                : flag === 'aviso'
                  ? 'bg-amber'
                  : product
                    ? 'bg-accent'
                    : 'bg-rule'

            return (
              <li key={slot} data-slot={slot} className="relative border-b border-rule first:border-t">
                <div className="flex items-stretch gap-4 py-5 sm:gap-6">
                  {/* el rail: el trazado convertido en estado */}
                  <div className="relative flex w-4 shrink-0 justify-center" aria-hidden="true">
                    <span className={`w-px flex-1 transition-colors duration-300 ease-rail ${railColor}`} />
                    <span
                      className={`absolute top-1/2 size-2 -translate-y-1/2 rounded-hair border transition-colors duration-300 ease-rail ${
                        product ? 'border-transparent' : 'border-rule bg-surface'
                      } ${product ? railColor : ''}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="u-label flex items-center gap-2">
                      <span className="tabular-nums text-fg-low">{String(i + 1).padStart(2, '0')}</span>
                      {t(`build.slot.${slot}`)}
                    </p>

                    {!hydrated ? (
                      <p className="mt-2 text-[0.9375rem] text-fg-low">…</p>
                    ) : product ? (
                      <div className="mt-2 flex items-start gap-4">
                        <span className="relative hidden h-16 w-16 shrink-0 sm:block">
                          <ProductImage product={product} locale={locale} sizes="64px" className="h-full w-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <Link
                            href={path(`/producto/${product.slug}`)}
                            data-cursor="link"
                            className="u-link block text-[1rem] font-medium leading-snug text-fg"
                          >
                            {product.name}
                          </Link>
                          <span className="mt-1 block font-mono text-[0.6875rem] tabular-nums text-fg-low">
                            {headlineSpec(product, locale)}
                          </span>
                          <Price usd={product.priceUsd} className="mt-2 block font-mono text-[0.875rem]" />
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-[0.9375rem] text-fg-low">{t('build.empty')}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenSlot(slot)}
                      aria-haspopup="dialog"
                      className="u-btn u-btn-line min-h-[44px] px-4"
                    >
                      {product ? t('build.change') : t('build.choose')}
                    </button>
                    {product ? (
                      <button
                        type="button"
                        onClick={() => unpick(slot)}
                        data-cursor="link"
                        className="u-link u-tap font-mono text-[0.625rem] tracking-[0.14em] uppercase text-fg-low hover:text-fg"
                      >
                        {t('build.clearSlot')}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="u-label mt-6 leading-relaxed normal-case tracking-normal">
          {t('build.disclaimer')}
        </p>
      </div>

      {/* ── resumen y advertencias ── */}
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div className="u-panel p-6">
            <p
              className={`u-label flex items-center gap-2.5 ${
                overall === 'bloqueo' ? 'text-rust' : overall === 'aviso' ? 'text-amber' : 'text-accent'
              }`}
              role="status"
              aria-live="polite"
            >
              <span className="inline-block size-2 rounded-hair bg-current" aria-hidden="true" />
              {t(`build.status.${overall}`)}
            </p>

            <dl className="mt-5">
              <div className="u-spec">
                <dt>{t('build.draw')}</dt>
                <dd>{draw === null ? '—' : `${draw} W`}</dd>
              </div>
              <div className="u-spec">
                <dt>{t('build.suggestedPsu')}</dt>
                <dd>{psu === null ? '—' : `${psu} W`}</dd>
              </div>
              <div className="u-spec border-b-0">
                <dt className="text-fg">{t('build.total')}</dt>
                <dd className="text-base font-medium">
                  <Price usd={totalUsd} />
                </dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-2">
              {/* Pasar el armado entero al carrito es LA acción de esta vista:
                  lleva la pieza conectada, igual que agregar desde una ficha. */}
              <button
                type="button"
                disabled={chosen.length === 0}
                onClick={() => {
                  for (const product of chosen) addToCart(product.slug, 1)
                  toast(t('build.addedAll'))
                }}
                data-lead
                className="u-cta u-cta--block u-cta--sm"
              >
                <CtaBody>
                  <span className="u-invite">{t('build.addAll')}</span>
                  <span className="u-nudge" aria-hidden="true">
                    →
                  </span>
                </CtaBody>
              </button>
              <button
                type="button"
                disabled={chosen.length === 0}
                onClick={resetBuild}
                className="u-btn u-btn-line w-full"
              >
                {t('build.reset')}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="u-label text-fg">{t('build.issues')}</h2>
            {issues.length === 0 ? (
              <p className="mt-4 text-[0.9375rem] text-fg-mid">{t('build.noIssues')}</p>
            ) : (
              <ul className="mt-4">
                {issues.map((issue) => (
                  <li key={issue.id} className="border-b border-rule py-4">
                    <p
                      className={`u-tag ${issue.level === 'bloqueo' ? 'text-rust' : 'text-amber'}`}
                    >
                      {t(`build.level.${issue.level}`)}
                    </p>
                    <p className="mt-2.5 text-[0.9375rem] font-medium leading-snug text-fg">
                      {issue.title[locale]}
                    </p>
                    <p className="mt-1.5 text-[0.875rem] leading-relaxed text-fg-mid">
                      {issue.detail[locale]}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>

      {/* ── selector de pieza ── */}
      {openSlot ? (
        <>
          <div
            className="fixed inset-0 z-[60] bg-carbon-sunk/75"
            onClick={closeDialog}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${t('build.pickTitle')} — ${t(`build.slot.${openSlot}`)}`}
            className="fixed inset-x-0 bottom-0 z-[65] flex max-h-[88vh] flex-col bg-surface-lift shadow-lift sm:inset-0 sm:m-auto sm:h-fit sm:max-w-3xl sm:rounded-part"
          >
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <h2 className="u-label text-fg">
                {t('build.pickTitle')} — {t(`build.slot.${openSlot}`)}
              </h2>
              <button
                type="button"
                onClick={closeDialog}
                aria-label={t('cta.close')}
                className="grid size-11 place-items-center text-fg-mid transition-colors hover:text-fg"
              >
                <svg viewBox="0 0 14 14" width="12" height="12" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <line x1="2" y1="2" x2="12" y2="12" />
                  <line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto overscroll-contain">
              {optionsFor(openSlot).map((product) => {
                const selected = picks[openSlot] === product.slug
                return (
                  <li key={product.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        pick(openSlot, product.slug)
                        closeDialog()
                      }}
                      aria-pressed={selected}
                      className="flex w-full items-center gap-4 border-b border-rule px-5 py-4 text-left transition-colors hover:bg-surface-sunk aria-pressed:bg-surface-sunk"
                    >
                      <span className="u-product-interactive relative h-16 w-16 shrink-0">
                        <ProductImage product={product} locale={locale} sizes="64px" className="h-full w-full" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="u-label block">{product.brand}</span>
                        <span className="mt-1 block text-[0.9375rem] font-medium leading-snug text-fg">
                          {product.name}
                        </span>
                        <span className="mt-1 block font-mono text-[0.6875rem] tabular-nums text-fg-low">
                          {headlineSpec(product, locale)}
                        </span>
                      </span>
                      <Price usd={product.priceUsd} className="shrink-0 font-mono text-[0.875rem]" />
                    </button>
                  </li>
                )
              })}
              {optionsFor(openSlot).length === 0 ? (
                <li className="px-5 py-10 text-center text-[0.9375rem] text-fg-mid">
                  {t('build.pickEmpty')}
                </li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  )
}
