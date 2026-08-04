'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BrandMark, Wordmark } from '@/components/brand/Wordmark'
import { Magnetic } from '@/components/motion/Motion'
import { useI18n } from '@/lib/i18n/context'
import { LOCALES, LOCALE_META } from '@/lib/i18n/locales'
import { CURRENCIES, CURRENCY_META } from '@/lib/money'
import { useCurrency } from '@/lib/prefs'
import { useCart } from '@/lib/cart'
import { useUi } from '@/lib/ui'
import { CONTACT, hasWhatsapp, whatsappLink } from '@/config/site'

const NAV = [
  { href: '/catalogo', key: 'nav.catalog' },
  { href: '/armar', key: 'nav.build' },
  { href: '/guias', key: 'nav.guides' },
] as const

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t, path } = useI18n()
  const pathname = usePathname()
  const navigationProps = onNavigate ? { onClick: onNavigate } : {}
  return (
    <>
      {NAV.map((item, i) => {
        const href = path(item.href)
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={item.href}
            href={href}
            {...navigationProps}
            aria-current={active ? 'page' : undefined}
            className="u-link relative font-mono text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-fg-mid transition-colors hover:text-fg"
          >
            <span className="mr-1.5 tabular-nums text-accent opacity-0 transition-opacity duration-300 ease-rail hover:opacity-100 group-hover/nav:opacity-60">
              {String(i + 1).padStart(2, '0')}
            </span>
            {t(item.key)}
          </Link>
        )
      })}
    </>
  )
}

function CurrencySwitch() {
  const { t } = useI18n()
  const [currency, setCurrency] = useCurrency()
  return (
    <div
      className="flex items-center gap-px border border-rule rounded-part p-px"
      role="group"
      aria-label={t('currency.label')}
    >
      {CURRENCIES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setCurrency(code)}
          aria-pressed={currency === code}
          title={CURRENCY_META[code].label}
          className="min-h-[44px] min-w-[44px] px-1.5 font-mono text-[0.625rem] font-medium tracking-[0.1em] uppercase text-fg-low transition-colors aria-pressed:bg-fg aria-pressed:text-surface hover:text-fg"
        >
          {code}
        </button>
      ))}
    </div>
  )
}

/**
 * Cambiar de idioma NO navega: es un botón, no un enlace. Todo el texto de la
 * tienda se vuelve a leer del diccionario en el mismo instante, la URL se
 * corrige sin recargar y el scroll, el carrito y el armado se quedan donde
 * estaban.
 */
function LocaleSwitch() {
  const { t, locale, setLocale } = useI18n()
  return (
    <div
      className="flex items-center gap-px border border-rule rounded-part p-px"
      role="group"
      aria-label={t('lang.label')}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          lang={LOCALE_META[code].htmlLang}
          title={LOCALE_META[code].label}
          className="min-h-[44px] min-w-[44px] grid place-items-center px-1.5 font-mono text-[0.625rem] font-medium tracking-[0.1em] uppercase text-fg-low transition-colors aria-pressed:bg-fg aria-pressed:text-surface hover:text-fg"
        >
          {LOCALE_META[code].short}
        </button>
      ))}
    </div>
  )
}

function CartButton() {
  const { t } = useI18n()
  const openCart = useUi((s) => s.openCart)
  const lines = useCart((s) => s.lines)
  const hydrated = useCart((s) => s.hydrated)
  const count = hydrated ? lines.reduce((n, l) => n + l.qty, 0) : 0
  const badge = useRef<HTMLSpanElement>(null)

  /**
   * El contador acusa recibo con un pulso corto. Se hace reiniciando la
   * animación en el nodo y no con estado: un `setState` por cada cambio del
   * carrito volvería a renderizar el encabezado entero para mover un número.
   */
  useEffect(() => {
    const node = badge.current
    if (!node || count === 0) return
    node.classList.remove('u-bump')
    // Forzar reflujo para poder relanzar la misma animación.
    void node.offsetWidth
    node.classList.add('u-bump')
  }, [count])

  return (
    <Magnetic strength={0.2} radius={60}>
      <button
        type="button"
        onClick={openCart}
        className="u-btn u-btn-line min-h-[44px] min-w-[44px] px-3 gap-2"
        aria-label={t('nav.openCart')}
      >
        <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor">
          <path d="M2 3h2.6l2.1 9.4h8.2l1.8-6.6H5.4" strokeWidth="1.3" strokeLinecap="square" />
          <circle cx="8" cy="16.4" r="1.2" />
          <circle cx="14.6" cy="16.4" r="1.2" />
        </svg>
        <span className="hidden sm:inline">{t('nav.cart')}</span>
        <span
          ref={badge}
          className="inline-block font-mono text-[0.6875rem] tabular-nums text-accent"
          aria-hidden={count === 0 ? 'true' : undefined}
        >
          {count.toString().padStart(2, '0')}
        </span>
      </button>
    </Magnetic>
  )
}

export function Header() {
  const { t, path } = useI18n()
  const menuOpen = useUi((s) => s.menuOpen)
  const toggleMenu = useUi((s) => s.toggleMenu)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleMenu(false)
    }
    if (menuOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, toggleMenu])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-surface/92 backdrop-blur-[2px] transition-[border-color,background-color] duration-500 ease-rail data-[scrolled]:border-rule"
      data-scrolled={scrolled ? '' : undefined}
    >
      <div className="u-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        {/* `min-h-[44px]` no cambia nada a la vista —el sello ya va centrado en
            una barra de 64 px— pero lleva el objetivo táctil al mínimo. */}
        <Link
          href={path('/')}
          className="brand-link flex min-h-[44px] items-center gap-2.5 text-fg"
          aria-label={`Sky Import — ${t('brand.role')}`}
        >
          <BrandMark size={24} className="text-accent" animate="pulse" />
          <Wordmark className="text-[0.8125rem] lg:text-sm" />
        </Link>

        <nav className="group/nav hidden items-center gap-8 lg:flex" aria-label={t('nav.menu')}>
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-2">
            <CurrencySwitch />
            <LocaleSwitch />
          </div>
          <CartButton />
          <button
            type="button"
            onClick={() => toggleMenu()}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            className="u-btn u-btn-line min-h-[44px] min-w-[44px] px-3 lg:hidden"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" stroke="currentColor" strokeWidth="1.4">
              {menuOpen ? (
                <>
                  <line x1="3" y1="3" x2="15" y2="15" />
                  <line x1="15" y1="3" x2="3" y2="15" />
                </>
              ) : (
                <>
                  <line x1="2" y1="5" x2="16" y2="5" />
                  <line x1="2" y1="12" x2="16" y2="12" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Panel móvil: pantalla completa, acciones al alcance del pulgar. */}
      <div
        id="menu-movil"
        hidden={!menuOpen}
        className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-surface lg:hidden"
      >
        <nav className="u-page flex flex-col items-start gap-1 pt-8" aria-label={t('nav.menu')}>
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={path(item.href)}
              onClick={() => toggleMenu(false)}
              className="group/item w-full overflow-hidden border-b border-rule py-4 u-display-sm text-[1.75rem]"
              style={{ animation: `menu-in 420ms var(--ease-clamp) ${i * 60}ms both` }}
            >
              <span className="mr-3 align-middle font-mono text-[0.625rem] tracking-[0.16em] text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="inline-block transition-transform duration-[420ms] ease-rail group-hover/item:translate-x-2">
                {t(item.key)}
              </span>
            </Link>
          ))}
        </nav>

        <div className="u-page mt-auto flex flex-col gap-4 pb-8 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <CurrencySwitch />
            <LocaleSwitch />
          </div>
          {hasWhatsapp ? (
            <a
              href={whatsappLink(t('wa.generic'))}
              target="_blank"
              rel="noopener noreferrer"
              className="u-btn u-btn-solid w-full"
              onClick={() => toggleMenu(false)}
            >
              {t('cta.whatsapp')}
            </a>
          ) : null}
          <p className="u-label">{CONTACT.whatsappDisplay}</p>
        </div>
      </div>
    </header>
  )
}
