import type { ReactNode } from 'react'

/**
 * LA PIEZA CONECTADA — el interior de la acción principal.
 *
 * `.u-cta` no es un botón con brillo: es una pieza recibiendo corriente. Lleva
 * canto permanente, una carga que da la vuelta al perímetro con su luz
 * escapándose por fuera, relleno que entra barriendo desde la izquierda
 * invirtiendo el rótulo, y escuadras que la encuadran al acercarse.
 *
 * El componente existe para que ese marcado —dos escuadras y una envoltura— no
 * se copie en cada sitio donde hace falta. La clase va en el elemento
 * interactivo de quien lo usa, que puede ser un `<button>`, un `<a>` o un
 * `<Link>`:
 *
 *   <Link href={…} className="u-cta" data-lead>
 *     <CtaBody>Ver catálogo</CtaBody>
 *   </Link>
 *
 * SOBRE `data-lead`. La corriente y el halo cuestan un repintado por cuadro.
 * Con una pieza en pantalla no se nota; con las treinta y siete fichas del
 * catálogo, sí. Por eso solo la acción **protagonista de la vista** lleva
 * `data-lead` y se mueve sola; las demás son la misma pieza quieta, que
 * arranca cuando el puntero llega. Se ven de la misma familia y solo hay una
 * corriendo a la vez.
 *
 * Las escuadras van PRIMERO: el CSS las selecciona con `nth-of-type`.
 */
export function CtaBody({ children }: { children: ReactNode }) {
  return (
    <span className="u-cta__inner">
      <span className="u-cta__corner" aria-hidden="true" />
      <span className="u-cta__corner" aria-hidden="true" />
      {children}
    </span>
  )
}
