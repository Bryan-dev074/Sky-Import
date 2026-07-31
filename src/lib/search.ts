/**
 * Búsqueda insensible a diacríticos y con ranking por niveles.
 *
 * «grafica» encuentra «gráfica», «refrigeracion» encuentra «refrigeración» y
 * «SI-VGA» encuentra la pieza por su código. Sin esto, media clientela escribe
 * sin tildes y no encuentra nada.
 */

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Nivel de coincidencia: cuanto más bajo, más relevante.
 * `null` significa que no coincide.
 */
export function matchRank(query: string, fields: { primary: string[]; secondary: string[] }): number | null {
  const q = normalize(query)
  if (!q) return 0

  const primary = fields.primary.map(normalize)
  const secondary = fields.secondary.map(normalize)

  if (primary.some((field) => field === q)) return 0
  if (primary.some((field) => field.startsWith(q))) return 1
  if (primary.some((field) => field.includes(q))) return 2
  if (secondary.some((field) => field.includes(q))) return 3

  // Última oportunidad: todas las palabras de la consulta aparecen en algún campo.
  const words = q.split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    const haystack = [...primary, ...secondary].join(' ')
    if (words.every((word) => haystack.includes(word))) return 4
  }

  return null
}
