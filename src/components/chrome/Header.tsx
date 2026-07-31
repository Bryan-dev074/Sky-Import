'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandMark, Wordmark } from '@/components/brand/Wordmark'
import { useI18n, localePath } from '@/lib/i18n/context'
import { LOCALES, LOCALE_META } from '@/lib/i18n/locales'
import { CURRENCIES, CURRENCY_META } from '@/lib/money'
import { useCurrency } from '@/lib/prefs'
import { useCart } from '@/lib/cart'
import { useUi } from '@/lib/ui'
import { CONTACT, hasWhatsapp, whatsappLink } from '@/config/site'

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t, locale } = useI18n()
  const pathname = usePathname()
  const items = [
    { href: '/catalogo', label: t('nav.catalog') },
    { href: '/armar', label: t('nav.build') },
    { href: '/guias', label: t('nav.guides') },
  ]
  return (
    <>
      {items.map((item) => {
        const href = localePath(locale, item.href)
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={item.href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            data-cursor="link"
            className="u-link font-mono text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-fg-mid transition-colors hover:text-fg"
          >
            {item.label}
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
          data-cursor="link"
          title={CURRENCY_META[code].label}
          className="min-h-[32px] min-w-[42px] px-1.5 font-mono text-[0.625rem] font-medium tracking-[0.1em] uppercase text-fg-low transition-colors aria-pressed:bg-fg aria-pressed:text-surface hover:text-fg"
        >
          {code}
        </button>
      ))}
    </div>
  )
}

function LocaleSwitch() {
  const { t, locale } = useI18n()
  const pathname = usePathname()
  const rest = pathname.replace(/^\/(es|pt)/, '') || ''
  return (
    <div
      className="flex items-center gap-px border border-rule rounded-part p-px"
      role="group"
      aria-label={t('lang.label')}
    >
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={`/${code}${rest}`}
          hrefLang={LOCALE_META[code].htmlLang}
          aria-current={locale === code ? 'true' : undefined}
          data-cursor="link"
          className="min-h-[32px] min-w-[34px] grid place-items-center px-1.5 font-mono text-[0.625rem] font-medium tracking-[0.1em] uppercase text-fg-low transition-colors aria-[current]:bg-fg aria-[current]:text-surface hover:text-fg"
        >
          {LOCALE_META[code].short}
        </Link>
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

  return (
    <button
      type="button"
      onClick={openCart}
      data-cursor="link"
      className="u-btn u-btn-line min-h-[40px] px-3 gap-2"
      aria-label={t('nav.openCart')}
    >
      <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor">
        <path d="M2 3h2.6l2.1 9.4h8.2l1.8-6.6H5.4" strokeWidth="1.3" strokeLinecap="square" />
        <circle cx="8" cy="16.4" r="1.2" />
        <circle cx="14.6" cy="16.4" r="1.2" />
      </svg>
      <span className="hidden sm:inline">{t('nav.cart')}</span>
      <span
        className="font-mono text-[0.6875rem] tabular-nums text-accent"
        aria-hidden={count === 0 ? 'true' : undefined}
      >
        {count.toString().padStart(2, '0')}
      </span>
    </button>
  )
}

export function Header() {
  const { t, locale } = useI18n()
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
      className="fixed inset-x-0 top-0 z-50 bg-surface transition-shadow"
      data-scrolled={scrolled ? '' : undefined}
    >
      <div className="u-page flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link
          href={localePath(locale, '/')}
          data-cursor="link"
          className="flex items-center gap-2.5 text-fg"
          aria-label={`Sky Import — ${t('brand.role')}`}
        >
          <BrandMark size={24} className="text-accent" />
          <Wordmark className="text-[0.8125rem] lg:text-sm" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={t('nav.menu')}>
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
            data-cursor="link"
            className="u-btn u-btn-line min-h-[40px] px-3 lg:hidden"
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

      <div className="u-rule" />

      {/* Panel móvil: pantalla completa, acciones al alcance del pulgar. */}
      <div
        id="menu-movil"
        hidden={!menuOpen}
        className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-surface lg:hidden"
      >
        <nav
          className="u-page flex flex-col items-start gap-1 pt-8"
          aria-label={t('nav.menu')}
        >
          {[
            { href: '/catalogo', label: t('nav.catalog') },
            { href: '/armar', label: t('nav.build') },
            { href: '/guias', label: t('nav.guides') },
          ].map((item, i) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              onClick={() => toggleMenu(false)}
              className="w-full border-b border-rule py-4 u-display-sm text-[1.75rem]"
            >
              <span className="font-mono text-[0.625rem] tracking-[0.16em] text-accent mr-3 align-middle">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
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
