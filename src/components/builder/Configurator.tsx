'use client'

import dynamic from 'next/dynamic'
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
import { getPcAssemblyPlan } from '@/lib/pcAssemblyPlan'

const PcBuildScene = dynamic(() => import('@/components/builder/PcBuildScene'), { ssr: false })

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
  const [sceneReady, setSceneReady] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeDialog = useCallback(() => setOpenSlot(null), [])
  useFocusTrap(dialogRef, openSlot !== null, closeDialog)

  const build = useMemo(() => resolveBuild(picks), [picks])
  const issues = useMemo(() => checkBuild(build), [build])
  const status = summarize(issues)
  const scenePlan = useMemo(() => getPcAssemblyPlan(picks, status.blocking), [picks, status.blocking])
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
  const coolingType =
    build.cooling?.compat.kind === 'cooling' ? build.cooling.compat.type : undefined
  const sceneStatusKey = scenePlan.powered
    ? 'build.scene.powered'
    : scenePlan.complete && status.blocking > 0
      ? 'build.scene.blocked'
      : scenePlan.selectedCount > 0
        ? 'build.scene.assembling'
        : 'build.scene.idle'
  const onSceneReady = useCallback(() => setSceneReady(true), [])
  const onSceneLost = useCallback(() => setSceneReady(false), [])

  return (
    <div className="u-page pb-24">
      <section
        className="u-pc-lab relative mb-12 min-h-[660px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05090c] shadow-[0_38px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] sm:min-h-[680px]"
        aria-labelledby="pc-live-title"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_45%,rgba(43,196,237,0.13),transparent_38%),radial-gradient(circle_at_12%_88%,rgba(23,96,124,0.13),transparent_34%)]" />
          <div className="u-pc-lab-grid absolute -inset-[30%] opacity-30 [background-image:linear-gradient(rgba(67,184,220,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(67,184,220,0.13)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="u-pc-lab-scan absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>

        <div className="pointer-events-none absolute inset-x-5 top-5 z-20 flex flex-col items-start gap-3 sm:inset-x-7 sm:top-7 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="w-full sm:w-auto">
            <p className="u-eyebrow">{t('build.scene.eyebrow')}</p>
            <h2 id="pc-live-title" className="mt-3 max-w-md text-[clamp(1.35rem,3.2vw,2.45rem)] font-semibold leading-tight tracking-[-0.04em] text-fg">
              {t('build.scene.title')}
            </h2>
          </div>
          <div className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-left backdrop-blur-sm sm:text-right">
            <p className="font-mono text-[0.6rem] tracking-[0.15em] text-fg-low uppercase">
              {scenePlan.selectedCount}/{scenePlan.totalSlots}
            </p>
            <p
              className={`mt-1 font-mono text-[0.62rem] tracking-[0.12em] uppercase ${
                scenePlan.powered
                  ? 'text-accent drop-shadow-[0_0_10px_rgba(66,205,255,0.95)]'
                  : scenePlan.complete && status.blocking > 0
                    ? 'text-rust'
                    : 'text-fg-mid'
              }`}
            >
              {t(sceneStatusKey)}
            </p>
          </div>
        </div>

        <div className="absolute inset-0 z-10 pt-40 sm:pt-20">
          <PcBuildScene
            picks={picks}
            blockingIssues={status.blocking}
            {...(coolingType ? { coolingType } : {})}
            onReady={onSceneReady}
            onLost={onSceneLost}
            className="h-full w-full transition-opacity duration-700"
          />
        </div>

        <div
          className={`pointer-events-none absolute inset-0 z-[5] grid place-items-center transition-opacity duration-700 ${sceneReady ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden="true"
        >
          <div className="h-40 w-40 animate-pulse rounded-full border border-accent/20 bg-accent/5 shadow-[0_0_80px_rgba(66,205,255,0.12)]" />
        </div>

        <div className="absolute inset-x-5 bottom-5 z-20 sm:inset-x-7 sm:bottom-7">
          <div className="mb-4 flex min-h-12 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {BUILD_SLOTS.map((slot) => {
              const product = build[slot]
              return product ? (
                <div
                  key={slot}
                  className="group/thumb pointer-events-auto relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/12 bg-black/35 p-1.5 backdrop-blur-sm"
                  title={`${t(`build.slot.${slot}`)}: ${product.name}`}
                >
                  <ProductImage product={product} locale={locale} sizes="48px" className="h-full w-full" />
                  <span className="absolute inset-x-0 bottom-0 h-px bg-accent shadow-[0_0_8px_rgba(66,205,255,0.8)]" />
                </div>
              ) : (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setOpenSlot(slot)}
                  className="pointer-events-auto grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-dashed border-white/10 bg-black/20 font-mono text-[0.58rem] text-fg-low transition-colors hover:border-accent/50 hover:text-accent"
                  aria-label={`${t('build.choose')} ${t(`build.slot.${slot}`)}`}
                >
                  {String(BUILD_SLOTS.indexOf(slot) + 1).padStart(2, '0')}
                </button>
              )
            })}
          </div>

          <div className="flex items-end justify-between gap-5 border-t border-white/10 pt-4">
            <div>
              <p className="font-mono text-[0.64rem] tracking-[0.13em] text-accent uppercase">
                {scenePlan.nextSlot ? t(`build.slot.${scenePlan.nextSlot}`) : t(sceneStatusKey)}
              </p>
              <p className="mt-1 max-w-xl text-[0.75rem] leading-relaxed text-fg-low">
                {scenePlan.powered ? t('build.scene.readyHint') : t('build.scene.hint')}
              </p>
            </div>
            <p className="hidden max-w-xs text-right font-mono text-[0.58rem] leading-relaxed tracking-[0.05em] text-fg-low md:block">
              {t('build.scene.approx')}
            </p>
          </div>
          <div className="mt-3 h-px overflow-hidden bg-white/8" aria-hidden="true">
            <span
              className="block h-full bg-accent shadow-[0_0_12px_rgba(66,205,255,0.9)] transition-[width] duration-700 ease-rail"
              style={{ width: `${scenePlan.progress * 100}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
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
    </div>
  )
}
