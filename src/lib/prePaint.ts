import type { Currency } from '@/lib/money'

/**
 * Script que corre ANTES del primer pintado.
 *
 * Hace dos cosas que el servidor no puede saber y que, si se resolvieran después
 * de la hidratación, producirían un parpadeo visible:
 *
 *   1. Fija `html[data-currency]` con la moneda guardada, o con la que
 *      corresponde al idioma de la ruta. El CSS decide con ese atributo cuál de
 *      los tres importes impresos se muestra.
 *   2. Marca `html[data-intro="skip"]` cuando el sistema pide movimiento
 *      reducido, para que la cortina de entrada no llegue ni a pintarse.
 *
 * Vive en un módulo SIN `'use client'` a propósito: lo invoca el layout del
 * servidor para incrustar la cadena en el `<head>`.
 */
export const CURRENCY_STORAGE_KEY = 'sky-import:currency'

export function prePaintScript(fallbackCurrency: Currency): string {
  return `(function(){try{var d=document.documentElement;var s=null;try{s=localStorage.getItem('${CURRENCY_STORAGE_KEY}')}catch(e){}
var c=(s==='USD'||s==='PYG'||s==='BRL')?s:'${fallbackCurrency}';d.setAttribute('data-currency',c);
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-intro','skip')}
}catch(e){document.documentElement.setAttribute('data-currency','USD')}})()`
}
