'use client'

import { useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    // Sin servicio de telemetría configurado: queda en consola para depurar.
    console.error(error)
  }, [error])

  return (
    <div className="u-page flex min-h-[70vh] flex-col items-start justify-center py-24">
      <p className="u-eyebrow">Error</p>
      <h1 className="u-display mt-6 text-[clamp(2rem,5vw,3.5rem)]">{t('error.title')}</h1>
      <p className="u-measure mt-5 text-[1.0625rem] leading-relaxed text-fg-mid">{t('error.body')}</p>
      <button type="button" onClick={reset} className="u-btn u-btn-solid mt-9">
        {t('error.retry')}
      </button>
    </div>
  )
}
