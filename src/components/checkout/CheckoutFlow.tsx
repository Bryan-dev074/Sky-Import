'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { ProductImage } from '@/components/product/ProductImage'
import { Trace } from '@/components/motif/Trace'
import { Price } from '@/components/ui/Price'
import { BrandMark } from '@/components/brand/Wordmark'
import { useCart, resolveLines, totalsOf } from '@/lib/cart'
import { useI18n } from '@/lib/i18n/context'
import { useFocusTrap } from '@/lib/useFocusTrap'
import type { DictKey } from '@/lib/i18n/dictionary'

/**
 * CHECKOUT SIMULADO
 *
 * Tres pasos y ninguna petición de red. En esta pantalla no se pide número de
 * tarjeta, ni documento, ni dirección: no hay ningún campo donde escribirlos,
 * que es la única forma honesta de prometer que no se transmiten.
 *
 * Al pulsar «Procesar pago» la acción se intercepta ANTES de cualquier
 * operación y aparece la revelación. Éste es el PRIMER Y ÚNICO punto de la
 * interfaz pública donde se dice que la experiencia es demostrativa.
 */

const DELIVERY = [
  { id: 'pickup', label: 'checkout.delivery.pickup', note: 'checkout.delivery.pickup.note' },
  { id: 'national', label: 'checkout.delivery.national', note: 'checkout.delivery.national.note' },
  { id: 'border', label: 'checkout.delivery.border', note: 'checkout.delivery.border.note' },
] as const satisfies ReadonlyArray<{ id: string; label: DictKey; note: DictKey }>

const PAYMENT = [
  { id: 'transfer', label: 'checkout.payment.transfer', note: 'checkout.payment.transfer.note' },
  { id: 'cash', label: 'checkout.payment.cash', note: 'checkout.payment.cash.note' },
  { id: 'card', label: 'checkout.payment.card', note: 'checkout.payment.card.note' },
] as const satisfies ReadonlyArray<{ id: string; label: DictKey; note: DictKey }>

type Step = 1 | 2 | 3

export function CheckoutFlow() {
  const { t, locale, path } = useI18n()
  const lines = useCart((s) => s.lines)
  const hydrated = useCart((s) => s.hydrated)
  const clear = useCart((s) => s.clear)

  const [step, setStep] = useState<Step>(1)
  const [delivery, setDelivery] = useState<string>(DELIVERY[0].id)
  const [payment, setPayment] = useState<string>(PAYMENT[0].id)
  const [revealed, setRevealed] = useState(false)

  const revealRef = useRef<HTMLDivElement>(null)
  const closeReveal = useCallback(() => setRevealed(false), [])
  useFocusTrap(revealRef, revealed, closeReveal)

  const resolved = resolveLines(lines)
  const totals = totalsOf(resolved)

  if (!hydrated) {
    return (
      <div className="u-page py-24">
        <p className="u-label">{t('cart.loading')}…</p>
      </div>
    )
  }

  if (resolved.length === 0 && !revealed) {
    return (
      <div className="u-page flex flex-col items-start gap-5 py-24">
        <h2 className="u-display-sm text-2xl">{t('checkout.emptyTitle')}</h2>
        <p className="u-measure text-[0.9375rem] text-fg-mid">{t('checkout.emptyBody')}</p>
        <Link href={path('/catalogo')} className="u-btn u-btn-solid">
          {t('cta.catalog')}
        </Link>
      </div>
    )
  }

  const summary = (
    <div className="u-panel p-6">
      <h2 className="u-label text-fg">{t('checkout.orderSummary')}</h2>
      <ul className="mt-4">
        {resolved.map((line) => (
          <li key={line.slug} className="flex items-center gap-3 border-b border-rule py-3">
            <span className="relative h-12 w-12 shrink-0">
              <ProductImage product={line.product} locale={locale} sizes="48px" className="h-full w-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.875rem] text-fg">{line.product.name}</span>
              <span className="u-label block tabular-nums">
                {line.qty} × {line.product.ref}
              </span>
            </span>
            <Price usd={line.lineTotalUsd} className="shrink-0 font-mono text-[0.8125rem]" />
          </li>
        ))}
      </ul>
      <dl className="mt-4">
        <div className="u-spec">
          <dt>{t('cart.subtotal')}</dt>
          <dd>
            <Price usd={totals.subtotalUsd} />
          </dd>
        </div>
        <div className="u-spec">
          <dt>{t('cart.shipping')}</dt>
          <dd>{totals.shippingUsd === 0 ? t('cart.shipping.free') : <Price usd={totals.shippingUsd} />}</dd>
        </div>
        <div className="u-spec border-b-0">
          <dt className="text-fg">{t('cart.total')}</dt>
          <dd className="text-base font-medium">
            <Price usd={totals.totalUsd} />
          </dd>
        </div>
      </dl>
    </div>
  )

  return (
    <>
      <div className="u-page grid gap-10 pb-24 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          {/* indicador de pasos: filete de 1 px, el segmento activo en cian */}
          <ol className="flex gap-2" aria-label={t('checkout.title')}>
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="flex-1">
                <span
                  className={`block h-px transition-colors duration-300 ease-rail ${
                    n <= step ? 'bg-accent' : 'bg-rule'
                  }`}
                />
                <span
                  className={`u-label mt-2.5 block ${n === step ? 'text-fg' : ''}`}
                  aria-current={n === step ? 'step' : undefined}
                >
                  <span className="tabular-nums">{String(n).padStart(2, '0')}</span>{' '}
                  {t(`checkout.step${n}` as 'checkout.step1')}
                </span>
              </li>
            ))}
          </ol>

          {/* El <h1> de la página es «Finalizar compra»; el paso es su subtítulo. */}
          <h2 className="u-display-sm mt-9 text-[clamp(1.6rem,3.5vw,2.25rem)]">
            {t(`checkout.step${step}` as 'checkout.step1')}
          </h2>
          <p className="u-measure mt-3 text-[0.9375rem] leading-relaxed text-fg-mid">
            {t(`checkout.step${step}.lede` as 'checkout.step1.lede')}
          </p>

          {step === 1 ? (
            <ul className="mt-8 border-t border-rule">
              {resolved.map((line) => (
                <li key={line.slug} className="flex items-center gap-4 border-b border-rule py-4">
                  <span className="relative h-16 w-16 shrink-0">
                    <ProductImage product={line.product} locale={locale} sizes="64px" className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="u-label block">{line.product.brand}</span>
                    <span className="mt-1 block text-[0.9375rem] text-fg">{line.product.name}</span>
                    <span className="u-label mt-1 block tabular-nums">
                      {line.product.ref} · {line.qty} ×
                    </span>
                  </span>
                  <Price usd={line.lineTotalUsd} className="shrink-0 font-mono text-[0.875rem]" />
                </li>
              ))}
            </ul>
          ) : null}

          {step === 2 ? (
            <div className="mt-8 flex flex-col gap-10">
              <fieldset>
                <legend className="u-label mb-4 text-fg">{t('checkout.delivery')}</legend>
                <div className="flex flex-col">
                  {DELIVERY.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-4 border-b border-rule py-4 first:border-t"
                    >
                      <input
                        type="radio"
                        name="entrega"
                        value={option.id}
                        checked={delivery === option.id}
                        onChange={() => setDelivery(option.id)}
                        className="peer sr-only"
                      />
                      <span
                        className="mt-0.5 grid size-5 shrink-0 place-items-center border border-rule rounded-hair transition-colors peer-checked:border-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]"
                        aria-hidden="true"
                      >
                        <span
                          className="size-2.5 bg-accent transition-transform"
                          style={{ transform: delivery === option.id ? 'scale(1)' : 'scale(0)' }}
                        />
                      </span>
                      <span>
                        <span className="block text-[0.9375rem] font-medium text-fg">
                          {t(option.label)}
                        </span>
                        <span className="mt-1 block text-[0.8125rem] text-fg-low">
                          {t(option.note)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="u-label mb-4 text-fg">{t('checkout.payment')}</legend>
                <div className="flex flex-col">
                  {PAYMENT.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-4 border-b border-rule py-4 first:border-t"
                    >
                      <input
                        type="radio"
                        name="pago"
                        value={option.id}
                        checked={payment === option.id}
                        onChange={() => setPayment(option.id)}
                        className="peer sr-only"
                      />
                      <span
                        className="mt-0.5 grid size-5 shrink-0 place-items-center border border-rule rounded-hair transition-colors peer-checked:border-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]"
                        aria-hidden="true"
                      >
                        <span
                          className="size-2.5 bg-accent transition-transform"
                          style={{ transform: payment === option.id ? 'scale(1)' : 'scale(0)' }}
                        />
                      </span>
                      <span>
                        <span className="block text-[0.9375rem] font-medium text-fg">
                          {t(option.label)}
                        </span>
                        <span className="mt-1 block text-[0.8125rem] text-fg-low">
                          {t(option.note)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="u-label leading-relaxed normal-case tracking-normal">
                {t('checkout.noDataNote')}
              </p>
            </div>
          ) : null}

          {step === 3 ? (
            <dl className="mt-8 border-t border-rule">
              <div className="u-spec">
                <dt>{t('checkout.delivery')}</dt>
                <dd>{t(DELIVERY.find((o) => o.id === delivery)?.label ?? DELIVERY[0].label)}</dd>
              </div>
              <div className="u-spec">
                <dt>{t('checkout.payment')}</dt>
                <dd>{t(PAYMENT.find((o) => o.id === payment)?.label ?? PAYMENT[0].label)}</dd>
              </div>
              <div className="u-spec">
                <dt>{t('cart.lines')}</dt>
                <dd className="tabular-nums">{totals.count}</dd>
              </div>
              <div className="u-spec border-b-0">
                <dt className="text-fg">{t('cart.total')}</dt>
                <dd className="text-base font-medium">
                  <Price usd={totals.totalUsd} />
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="mt-10 flex flex-col gap-2.5 sm:flex-row">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="u-btn u-btn-line"
              >
                {t('cta.back')}
              </button>
            ) : (
              <Link href={path('/carrito')} className="u-btn u-btn-line">
                {t('cta.back')}
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="u-btn u-btn-solid sm:flex-1"
              >
                {t('cta.continue')}
              </button>
            ) : (
              <button
                type="button"
                data-testid="finalizar"
                onClick={(event) => {
                  // Se intercepta ANTES de cualquier operación: no hay envío de
                  // formulario, no hay `fetch`, no hay pasarela.
                  event.preventDefault()
                  setRevealed(true)
                }}
                className="u-btn u-btn-solid sm:flex-1"
              >
                {t('checkout.finalize')}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">{summary}</div>
        </aside>
      </div>

      {/* ══════════════ LA REVELACIÓN ══════════════ */}
      {revealed ? (
        <div
          ref={revealRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="revelacion-titulo"
          data-testid="revelacion"
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-carbon px-5 py-16"
        >
          <div className="pointer-events-none absolute inset-0 text-sky opacity-20" aria-hidden="true">
            <Trace width={1400} height={800} lines={11} seed={91} className="h-full w-full" />
          </div>

          <div className="relative w-full max-w-[620px] text-center">
            <BrandMark size={34} className="mx-auto text-accent" />

            <p className="u-eyebrow mx-auto mt-8 justify-center">{t('reveal.title')}</p>

            <h2
              id="revelacion-titulo"
              className="u-display-sm mt-6 text-[clamp(1.5rem,4.5vw,2.25rem)] text-fg"
            >
              {t('reveal.message')}
            </h2>

            <p className="mx-auto mt-6 max-w-[52ch] text-[0.9375rem] leading-relaxed text-fg-mid">
              {t('reveal.detail')}
            </p>

            <div className="mt-10 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link href={path('/')} className="u-btn u-btn-solid">
                {t('reveal.backToStore')}
              </Link>
              <Link href={path('/carrito')} className="u-btn u-btn-line">
                {t('reveal.reviewCart')}
              </Link>
              <button
                type="button"
                onClick={() => {
                  clear()
                  setRevealed(false)
                  setStep(1)
                }}
                className="u-btn u-btn-line"
              >
                {t('reveal.restart')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
