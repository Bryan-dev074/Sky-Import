/**
 * Marcador de posición del catálogo.
 *
 * `useSearchParams` obliga a envolver el navegador de catálogo en un `Suspense`
 * para que la página siga siendo estática. Si el respaldo fuera una línea de
 * texto, al aparecer la grilla la página daría un salto enorme: medido, 0,47 de
 * CLS. Este esqueleto reserva exactamente la misma geometría —columna de
 * filtros, barra de herramientas y nueve celdas con la proporción de la ficha—
 * así que el reemplazo no mueve nada.
 *
 * No lleva animación de brillo: un esqueleto que parpadea es ruido para algo que
 * dura milisegundos.
 */
export function CatalogSkeleton() {
  return (
    <div className="u-page grid gap-10 pb-24 lg:grid-cols-12 lg:gap-10" aria-hidden="true">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="flex flex-col gap-8">
          <div>
            <span className="mb-3 block h-3 w-24 bg-surface-sunk" />
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="block h-[41px] border-b border-rule" />
            ))}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-9">
        <div className="flex flex-col gap-4 border-b border-rule pb-5 sm:flex-row sm:items-center">
          <span className="h-12 flex-1 rounded-part border border-rule bg-surface-sunk" />
          <span className="hidden h-[42px] w-[168px] rounded-part border border-rule bg-surface-sunk lg:block" />
          <span className="h-12 w-full rounded-part border border-rule sm:w-[200px] lg:hidden" />
        </div>

        <span className="mt-4 block h-3 w-20 bg-surface-sunk" />

        <div className="mt-6 grid gap-x-6 gap-y-12 border-b border-rule pb-12 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex flex-col border-t border-rule pt-5">
              <span className="block aspect-[4/3] rounded-part bg-surface-sunk" />
              <span className="mt-4 block h-3 w-24 bg-surface-sunk" />
              <span className="mt-3 block h-4 w-3/4 bg-surface-sunk" />
              <span className="mt-3 block h-3 w-1/2 bg-surface-sunk" />
              <span className="mt-6 block h-5 w-28 bg-surface-sunk" />
              <span className="mt-4 block h-12 rounded-part border border-rule" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
