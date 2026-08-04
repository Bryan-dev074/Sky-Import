# Manual Power Premium Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acercar la RTX 5090, animar la invitación al armador y convertir el configurador 3D en una secuencia manual, diagnosticable, comprable y cómoda en teléfono.

**Architecture:** Separar la representación física (`pcAssemblyPlan`) del diagnóstico de arranque (`pcBootSequence`) y mantener la máquina de estados temporal en `Configurator`. `PcBuildScene` recibe corriente y diagnóstico como entradas explícitas; HomeView reutiliza un CTA de ensamblaje enfocado y CSS contiene la coreografía responsive.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zustand, Three.js, Tailwind/CSS, Vitest y Playwright.

## Global Constraints

- Mantener español y portugués brasileño completos.
- Ningún cambio enciende automáticamente la PC; solo el gesto humano puede llegar a `powered`.
- `psu-under` impide el arranque, aunque siga siendo un aviso en el resumen general.
- No inventar porcentaje de descuento ni ahorro numérico.
- Objetivos táctiles de al menos 44 × 44 px y cuadrícula móvil 4 × 2 sin scroll horizontal obligatorio.
- `prefers-reduced-motion` apaga desplazamientos, barridos, pulsos, RGB animado y giro de ventiladores.
- Movimiento por cuadro limitado a `transform` y `opacity`, con hover solo en puntero preciso.
- Conservar las fotos transparentes reales de producto y la fuente de 2048 px del hero.

---

### Task 1: Separar montaje y diagnóstico de arranque

**Files:**
- Modify: `tests/unit/pc-assembly-plan.test.ts`
- Create: `tests/unit/pc-boot-sequence.test.ts`
- Modify: `src/lib/pcAssemblyPlan.ts`
- Create: `src/lib/pcBootSequence.ts`

**Interfaces:**
- Consumes: `Issue`, `BuildSlot` y `BUILD_SLOTS` desde `src/lib/compat.ts`.
- Produces: `getPcAssemblyPlan(picks): PcAssemblyPlan`, `scenePartsForSlots(slots): PcScenePartId[]` y `diagnosePcBoot(complete, issues): PcBootDiagnostic`.

- [ ] **Step 1: Escribir primero las pruebas del contrato manual**

```ts
const completePicks = Object.fromEntries(BUILD_SLOTS.map((slot) => [slot, true]))

function issue(id: string, level: Issue['level'], slots: BuildSlot[]): Issue {
  return {
    id,
    level,
    slots,
    title: { es: id, pt: id },
    detail: { es: id, pt: id },
  }
}

it('never powers a complete build automatically', () => {
  const plan = getPcAssemblyPlan(completePicks)
  expect(plan.complete).toBe(true)
  expect(plan).not.toHaveProperty('powered')
})

it('treats an undersized PSU as a boot failure', () => {
  const result = diagnosePcBoot(true, [issue('psu-under', 'aviso', ['psu', 'gpu'])])
  expect(result.status).toBe('failed')
  expect(result.flaggedSlots).toEqual(['psu', 'gpu'])
})
```

- [ ] **Step 2: Ejecutar las pruebas y confirmar el fallo correcto**

Run: `npm test -- tests/unit/pc-assembly-plan.test.ts tests/unit/pc-boot-sequence.test.ts`

Expected: FAIL porque `pcBootSequence` no existe y el plan todavía expone `powered`.

- [ ] **Step 3: Implementar el clasificador mínimo y el mapa escena/ranura**

```ts
export type PcBootDiagnostic =
  | { status: 'incomplete'; issue: null; flaggedSlots: [] }
  | { status: 'passed'; issue: null; flaggedSlots: [] }
  | { status: 'failed'; issue: Issue; flaggedSlots: BuildSlot[] }

export function diagnosePcBoot(complete: boolean, issues: Issue[]): PcBootDiagnostic {
  if (!complete) return { status: 'incomplete', issue: null, flaggedSlots: [] }
  const issue = issues.find((item) => item.level === 'bloqueo' || item.id === 'psu-under')
  return issue
    ? { status: 'failed', issue, flaggedSlots: [...issue.slots] }
    : { status: 'passed', issue: null, flaggedSlots: [] }
}
```

- [ ] **Step 4: Ejecutar las pruebas focalizadas hasta obtener verde**

Run: `npm test -- tests/unit/pc-assembly-plan.test.ts tests/unit/pc-boot-sequence.test.ts`

Expected: PASS con ambas suites y sin advertencias.

### Task 2: Acercar la 5090 y construir el CTA de ensamblaje

**Files:**
- Modify: `tests/e2e/experiencia.spec.ts`
- Create: `src/components/home/BuildInviteCta.tsx`
- Modify: `src/components/views/HomeView.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ProductImage`, `PRODUCTS`, `href`, `locale`, texto traducido y la prop `ambient`.
- Produces: `<BuildInviteCta href label ambient />` con `data-build-invite` y tres miniaturas decorativas reales.

- [ ] **Step 1: Añadir comprobaciones E2E que todavía fallen**

```ts
test('la portada acerca la 5090 e invita a ensamblar con piezas reales', async ({ page }) => {
  await page.goto('/es')
  await expect(page.locator('.intro')).toHaveCount(0, { timeout: INTRO_EXIT_TIMEOUT })
  const heroArt = page.locator('.u-hero-product__art')
  await expect(heroArt).toBeVisible()
  await expect(page.locator('[data-build-invite="ambient"] img')).toHaveCount(3)
  const ratio = await heroArt.evaluate((node) => node.getBoundingClientRect().width / node.parentElement!.getBoundingClientRect().width)
  expect(ratio).toBeGreaterThan(1)
})
```

- [ ] **Step 2: Ejecutar el caso y verificar que falla por selectores ausentes**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "acerca la 5090" --project=escritorio`

Expected: FAIL porque `.u-hero-product__art` y `data-build-invite` aún no existen.

- [ ] **Step 3: Crear el enlace compuesto y aplicar el acercamiento responsive**

```tsx
export function BuildInviteCta({ href, label, locale, ambient = false }: Props) {
  return (
    <Link href={href} className="u-build-invite" data-build-invite={ambient ? 'ambient' : 'interactive'}>
      <span className="u-build-invite__rail" aria-hidden="true">
        {INVITE_PRODUCTS.map((product, index) => (
          <span className="u-build-invite__part" style={{ '--part-index': index } as CSSProperties} key={product.slug}>
            <ProductImage product={product} locale={locale} sizes="34px" className="h-full w-full" />
          </span>
        ))}
      </span>
      <span>{label}</span><span aria-hidden="true">→</span>
    </Link>
  )
}
```

- [ ] **Step 4: Ejecutar el caso E2E y confirmar verde**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "acerca la 5090" --project=escritorio`

Expected: PASS en escritorio; el enlace conserva nombre accesible y tres imágenes.

### Task 3: Implementar encendido manual, diagnóstico y compra

**Files:**
- Modify: `tests/e2e/experiencia.spec.ts`
- Modify: `src/components/builder/Configurator.tsx`
- Modify: `src/lib/i18n/dictionary.ts`

**Interfaces:**
- Consumes: `diagnosePcBoot`, `useUi.openCart`, `issues`, `scenePlan.complete` y las ocho piezas elegidas.
- Produces: estado `PcPowerPhase = 'off' | 'checking' | 'failed' | 'powered'`, `diagnosticIssue`, `powerOn()` y `addWholeBuild()`.

- [ ] **Step 1: Escribir recorridos de encendido válido y fallido**

```ts
const validBuild: Record<BuildSlot, string> = {
  cpu: 'ryzen-7-9800x3d',
  motherboard: 'msi-mag-b850-tomahawk-wifi',
  ram: 'corsair-vengeance-ddr5-32gb-6000',
  gpu: 'geforce-rtx-5080-16gb',
  storage: 'samsung-990-pro-2tb',
  psu: 'corsair-rm1000x',
  cooling: 'arctic-liquid-freezer-iii-360',
  case: 'lian-li-lancool-216',
}
const lowPsuBuild = { ...validBuild, psu: 'msi-mag-a650bn' }

async function seedBuild(page: Page, picks: Record<BuildSlot, string>) {
  await page.addInitScript((seededPicks) => {
    localStorage.setItem(
      'sky-import:build:v1',
      JSON.stringify({ state: { picks: seededPicks }, version: 0 }),
    )
  }, picks)
}

test('espera el botón, prueba el equipo y recién entonces lo enciende', async ({ page }) => {
  await seedBuild(page, validBuild)
  await page.goto('/es/armar')
  await expect(page.getByRole('button', { name: 'Encender PC' })).toBeVisible()
  await expect(page.getByText('Sistema encendido')).toHaveCount(0)
  await page.getByRole('button', { name: 'Encender PC' }).click()
  await expect(page.getByText('Comprobando energía y compatibilidad')).toBeVisible()
  await expect(page.getByText('Sistema encendido')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Comprar armado' })).toBeVisible()
})

test('una fuente insuficiente bloquea el arranque y marca sus piezas', async ({ page }) => {
  await seedBuild(page, lowPsuBuild)
  await page.goto('/es/armar')
  await page.getByRole('button', { name: 'Encender PC' }).click()
  await expect(page.getByText('La fuente está por debajo de lo recomendado').last()).toBeVisible()
  await expect(page.locator('[data-diagnostic="error"]')).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Comprar armado' })).toHaveCount(0)
})
```

- [ ] **Step 2: Ejecutar ambos recorridos y observar el fallo por ausencia del control**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "recién entonces|bloquea el arranque" --project=escritorio`

Expected: FAIL al buscar «Encender PC».

- [ ] **Step 3: Implementar temporizador cancelable y reinicio por cambio de armado**

```ts
const [powerPhase, setPowerPhase] = useState<PcPowerPhase>('off')
const [diagnosticIssueId, setDiagnosticIssueId] = useState<string | null>(null)
const powerTimerRef = useRef<number | null>(null)
const buildSignature = BUILD_SLOTS.map((slot) => picks[slot] ?? '').join('|')

useEffect(() => {
  if (powerTimerRef.current !== null) window.clearTimeout(powerTimerRef.current)
  setPowerPhase('off')
  setDiagnosticIssueId(null)
  return () => {
    if (powerTimerRef.current !== null) window.clearTimeout(powerTimerRef.current)
  }
}, [buildSignature])

const powerOn = useCallback(() => {
  if (!scenePlan.complete || powerPhase === 'checking') return
  setPowerPhase('checking')
  powerTimerRef.current = window.setTimeout(() => {
    const result = diagnosePcBoot(true, issues)
    setDiagnosticIssueId(result.issue?.id ?? null)
    setPowerPhase(result.status === 'passed' ? 'powered' : 'failed')
    powerTimerRef.current = null
  }, 2000)
}, [issues, powerPhase, scenePlan.complete])
```

- [ ] **Step 4: Unificar la compra y añadir traducciones ES/PT**

```ts
const addWholeBuild = useCallback(() => {
  for (const product of chosen) addToCart(product.slug, 1)
  toast(t('build.addedAll'))
  openCart()
}, [addToCart, chosen, openCart, t, toast])
```

- [ ] **Step 5: Ejecutar los recorridos y confirmar estados correctos**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "recién entonces|bloquea el arranque" --project=escritorio`

Expected: PASS; compra solo tras `powered`, error visible y dos ranuras marcadas.

### Task 4: Conectar corriente explícita y diagnóstico a Three.js

**Files:**
- Modify: `src/components/builder/PcBuildScene.tsx`
- Modify: `src/components/builder/Configurator.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/experiencia.spec.ts`

**Interfaces:**
- Consumes: props `powered`, `checking`, `diagnosticSlots` y `diagnosticTone`.
- Produces: `window.__pcBuilderState` con `powered`, `checking` y `diagnosticSlots`; marcos `THREE.BoxHelper` para partes fallidas.

- [ ] **Step 1: Extender el E2E para observar el estado real de la escena**

```ts
await expect.poll(() => page.evaluate(() => window.__pcBuilderState?.powered)).toBe(false)
await page.getByRole('button', { name: 'Encender PC' }).click()
await expect.poll(() => page.evaluate(() => window.__pcBuilderState?.powered)).toBe(true)
```

- [ ] **Step 2: Ejecutarlo y confirmar que falla porque la escena aún se autoalimenta**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "recién entonces" --project=escritorio`

Expected: FAIL: antes del clic el estado actual ya aparece encendido.

- [ ] **Step 3: Pasar entradas explícitas y crear ayudantes de diagnóstico por parte**

```tsx
<PcBuildScene
  picks={picks}
  powered={powerPhase === 'powered'}
  checking={powerPhase === 'checking'}
  diagnosticSlots={diagnosticIssue?.slots ?? []}
  diagnosticTone={diagnosticIssue ? 'error' : null}
/>
```

Dentro del render loop, `powerTarget` usa únicamente `snapshot.powered`; los helpers se
actualizan y muestran solo cuando su `PcScenePartId` pertenece a las ranuras diagnosticadas.

- [ ] **Step 4: Ejecutar el E2E y la suite unitaria focalizada**

Run: `npm test -- tests/unit/pc-assembly-plan.test.ts tests/unit/pc-boot-sequence.test.ts && npx playwright test tests/e2e/experiencia.spec.ts --grep "recién entonces|bloquea el arranque" --project=escritorio`

Expected: PASS en unit y E2E.

### Task 5: Adaptar el laboratorio al teléfono y cerrar calidad

**Files:**
- Modify: `src/components/builder/Configurator.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/experiencia.spec.ts`

**Interfaces:**
- Consumes: mismo dock de ocho ranuras y breakpoints existentes.
- Produces: dock 4 × 2 a menos de 640 px, fila única en escritorio, fondo más veloz y controles sin solapamiento.

- [ ] **Step 1: Añadir una comprobación móvil de geometría que falle primero**

```ts
test('el laboratorio móvil muestra las ocho piezas en una cuadrícula 4 por 2', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/es/armar')
  const cells = page.locator('[data-pc-dock] [data-pc-slot]')
  await expect(cells).toHaveCount(8)
  const boxes = await cells.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()))
  expect(new Set(boxes.slice(0, 4).map((box) => Math.round(box.top))).size).toBe(1)
  expect(Math.round(boxes[4]!.top)).toBeGreaterThan(Math.round(boxes[0]!.top))
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})
```

- [ ] **Step 2: Ejecutar el caso móvil y confirmar el fallo de estructura actual**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "cuadrícula 4 por 2" --project=movil`

Expected: FAIL porque el dock actual es horizontal y no tiene selectores semánticos.

- [ ] **Step 3: Implementar grid móvil, action tray y reduced-motion**

```css
.u-pc-dock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
@media (min-width: 640px) { .u-pc-dock { display: flex; } }
@media (prefers-reduced-motion: reduce) {
  .u-build-invite__part, .u-pc-lab-grid, .u-pc-lab-scan { animation: none !important; transform: none !important; }
}
```

- [ ] **Step 4: Ejecutar el caso móvil, inspección mecánica y revisión de movimiento**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "cuadrícula 4 por 2" --project=movil`

Run: `node C:\Users\Bryan\.agents\skills\impeccable\scripts/detect.mjs --json src/components/views/HomeView.tsx src/components/home/BuildInviteCta.tsx src/components/builder/Configurator.tsx src/components/builder/PcBuildScene.tsx src/app/globals.css`

Expected: E2E PASS y detector sin hallazgos bloqueantes.

- [ ] **Step 5: Ejecutar verificación completa y capturas responsive**

Run: `npm run verify`

Run: `npx playwright test tests/e2e/experiencia.spec.ts --project=escritorio --project=movil`

Expected: validación de imágenes, lint, tipos, unit tests, build y recorridos relevantes en verde.

- [ ] **Step 6: Revisar diff, confirmar alcance, commit y push a la rama desplegada**

Run: `git diff --check && git status --short && git diff --stat`

Expected: solo archivos de esta función, sin espacios finales ni artefactos temporales.
