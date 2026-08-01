# Premium Product Imagery and 3D Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Add the RTX 5090, real official imagery for every catalog product, a premium extended intro, a sticky procedural GPU assembly, and a state-driven 3D PC builder without regressing mobile usability or accessibility.

**Architecture:** Product identity remains in the typed static catalog while an exhaustive media map attaches local official imagery to every product. Reusable ProductImage and ProductStage components replace product-facing vector drawings. Two isolated, dynamically loaded Three.js scenes consume pure model/state modules: one scroll-driven RTX 5090 assembly and one builder scene driven by the existing useBuild and checkBuild sources of truth.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Three.js 0.185, Zustand, CSS/Tailwind 4, Vitest, Playwright, axe-core, Sharp.

## Global Constraints

- The final catalog contains exactly 38 products and starts with GeForce RTX 5090 Founders Edition 32 GB.
- Product photography comes from official manufacturer sources and is stored locally under public/products.
- Product photographs are never synthesized by AI and never substitute a different named model.
- Generic GPU entries use the official reference, Founders Edition, or Limited Edition image and matching specifications.
- The home hero uses the RTX 5090 image with pointer tilt, controlled zoom, parallax, and annotated dimensions.
- The full-load intro lasts about 3.8 seconds, remains skippable before 600 ms, releases pointer input when opening, and never replays during internal navigation.
- The RTX 5090 assembly uses native scroll plus a 360vh section and a 100svh sticky stage; JavaScript never blocks wheel or touch scrolling.
- The PC builder uses the existing useBuild and checkBuild state and only reaches powered when eight selections are present with no blocking issue.
- Three.js is dynamically imported, stops rendering off-screen, lowers DPR on mobile, and fully disposes resources and WebGL contexts.
- prefers-reduced-motion removes the intro, pointer motion, prolonged sticky sequence, and continuous 3D animation.
- Spanish and Brazilian Portuguese remain complete; checkout remains simulated; no backend or real stock claim is introduced.
- Verification requires lint, typecheck, unit tests, production build, full E2E, axe, console checks, and screenshots at 360, 390, 768, 1366, and 1440 pixels.

---

## File map

New files:

- src/lib/catalog/media.ts — exhaustive local media metadata keyed by product slug.
- src/lib/catalog/catalogWithMedia.ts — attaches validated media to raw catalog records.
- src/components/product/ProductImage.tsx — responsive image with vector fallback.
- src/components/product/ProductStage.tsx — pointer tilt, zoom, glare, and dimensions.
- src/components/product/HeroProductStage.tsx — hero-specific product stage and parallax.
- src/components/motion/KineticHeading.tsx — reusable title timeline.
- src/lib/assembly.ts — pure 3D builder state derivation.
- src/components/three/rtx5090Model.ts — procedural named-part RTX 5090 factory.
- src/components/three/Rtx5090Assembly.tsx — Three.js lifecycle and scroll progress renderer.
- src/components/three/pcAssemblyModel.ts — procedural PC groups, sockets, cables, and lights.
- src/components/three/PcAssemblyScene.tsx — builder WebGL lifecycle and state transitions.
- scripts/validate-product-media.mjs — file/source/dimension validation.
- public/products/manifest.json — canonical 38-entry asset and source manifest.
- tests/unit/catalog-media.test.ts — catalog and media coverage tests.
- tests/unit/assembly.test.ts — builder visual-state tests.
- tests/unit/three-models.test.ts — procedural hierarchy tests.
- tests/e2e/premium-visuals.spec.ts — hero, hover, intro, sticky, and builder visual-state tests.
- docs/three/rtx5090/ — img2threejs assessment, sculpt spec, reviews, and comparison evidence.

Modified files:

- src/lib/catalog/types.ts — ProductMedia and product media field.
- src/lib/catalog/products.ts — raw catalog export and RTX 5090 record.
- src/lib/catalog/categories.ts — representative product slug for each category.
- src/components/views/HomeView.tsx — real hero/category imagery and kinetic headings.
- src/components/catalog/ProductCard.tsx — ProductStage.
- src/components/product/Gallery.tsx — real image gallery plus dimension overlay.
- src/components/cart/CartContents.tsx — product thumbnails.
- src/components/checkout/CheckoutFlow.tsx — product thumbnails.
- src/components/builder/Configurator.tsx — PcAssemblyScene and real thumbnails.
- src/components/home/AssemblySection.tsx — sticky RTX 5090 scroll story.
- src/components/intro/Intro.tsx — expanded timeline and 5090 silhouette.
- src/components/views/PageHeader.tsx — configurable beam speed/intensity.
- src/app/[locale]/armar/page.tsx — faster builder header background.
- src/components/brand/Wordmark.tsx — subtle post-intro circuit pulse.
- src/app/globals.css — image-stage, intro, heading, sticky, and responsive motion styles.
- src/lib/i18n/dictionary.ts — new accessible labels and assembly copy in ES/PT.
- package.json — media validation command and full verify command.
- PRODUCT.md, DESIGN.md, README.md, CREDITS.md — final behavior, sources, and limitations.

---

### Task 1: Catalog media contract and RTX 5090

**Files:**

- Create: tests/unit/catalog-media.test.ts
- Create: src/lib/catalog/media.ts
- Create: src/lib/catalog/catalogWithMedia.ts
- Modify: src/lib/catalog/types.ts
- Modify: src/lib/catalog/products.ts
- Modify: src/lib/catalog/categories.ts

**Interfaces:**

- Produces ProductMedia with primary, optional secondary, alt.es, alt.pt, sourcePage, and credit.
- Produces attachCatalogMedia(products) returning Product[] and throwing on a missing media key.
- Keeps PRODUCTS, PRODUCT_BY_SLUG, and all existing imports stable.

- [ ] **Step 1: Write the failing catalog and media tests**

    import { describe, expect, test } from 'vitest'
    import { PRODUCTS } from '@/lib/catalog/products'
    import { PRODUCT_MEDIA } from '@/lib/catalog/media'

    describe('premium catalog', () => {
      test('contains the RTX 5090 as the flagship product', () => {
        expect(PRODUCTS).toHaveLength(38)
        expect(PRODUCTS[0]?.slug).toBe('geforce-rtx-5090-founders-edition-32gb')
        expect(PRODUCTS[0]?.compat).toMatchObject({
          kind: 'gpu',
          lengthMm: 304,
          tgpW: 575,
          recommendedPsuW: 1000,
          vramGb: 32,
        })
      })

      test('has official media metadata for every product', () => {
        const catalogSlugs = PRODUCTS.map((product) => product.slug).sort()
        expect(Object.keys(PRODUCT_MEDIA).sort()).toEqual(catalogSlugs)
        for (const product of PRODUCTS) {
          expect(product.media.primary).toMatch(/^\/products\//)
          expect(product.media.sourcePage).toMatch(/^https:\/\//)
          expect(product.media.alt.es).toContain(product.model)
          expect(product.media.alt.pt).toContain(product.model)
        }
      })
    })

- [ ] **Step 2: Run the focused test and verify RED**

  Run: npm test -- tests/unit/catalog-media.test.ts

  Expected: FAIL because Product has no media, PRODUCT_MEDIA does not exist, and the catalog has 37 products.

- [ ] **Step 3: Add the exact media types and attachment boundary**

    export interface ProductMedia {
      primary: string
      secondary?: string
      alt: L10n
      sourcePage: string
      credit: string
      objectPosition?: string
    }

    export function attachCatalogMedia(
      products: Array<Omit<Product, 'media'>>,
    ): Product[] {
      return products.map((product) => {
        const media = PRODUCT_MEDIA[product.slug]
        if (!media) throw new Error('Missing media for product: ' + product.slug)
        return { ...product, media }
      })
    }

- [ ] **Step 4: Add the RTX 5090 record and preserve stable exports**

  Insert the approved SI-VGA-0101 record before the RTX 5080 with priceUsd 1999, units 1, featured true, arrivedRecently true, official 32 GB GDDR7, 512 bit, 21,760 CUDA cores, PCIe 5.0 x16, 575 W, 1000 W PSU, 304 mm, and two slots. Export PRODUCTS by passing the raw records through attachCatalogMedia.

- [ ] **Step 5: Add the exhaustive 38-key PRODUCT_MEDIA map**

  Every key must equal a catalog slug. Every primary path must be public/products/<slug>/primary.webp. Use sourcePage and credit for the official NVIDIA, AMD, Intel, MSI, ASUS, ASRock, Gigabyte, Corsair, G.Skill, Kingston, Samsung, Western Digital, Crucial, Seasonic, Noctua, Thermalright, ARCTIC, Lian Li, NZXT, Cooler Master, or Thermal Grizzly page matching that named model.

- [ ] **Step 6: Re-run the focused test and verify GREEN**

  Run: npm test -- tests/unit/catalog-media.test.ts

  Expected: PASS with two tests and 38 products.

- [ ] **Step 7: Commit**

  Run:

    git add src/lib/catalog tests/unit/catalog-media.test.ts
    git commit -m "feat: add RTX 5090 and product media contract"

---

### Task 2: Acquire and validate all official product images

**Files:**

- Create: scripts/validate-product-media.mjs
- Create: public/products/manifest.json
- Create: public/products/<38 slugs>/primary.webp
- Modify: package.json
- Modify: CREDITS.md
- Test: tests/unit/catalog-media.test.ts

**Interfaces:**

- Consumes PRODUCT_MEDIA from Task 1.
- Produces one optimized local WebP per product and a deterministic npm run media:validate command.

- [ ] **Step 1: Extend the failing test to require physical files**

    import { existsSync } from 'node:fs'
    import { join } from 'node:path'

    test('stores every primary image locally', () => {
      for (const media of Object.values(PRODUCT_MEDIA)) {
        expect(
          existsSync(join(process.cwd(), 'public', media.primary.replace(/^\//, ''))),
        ).toBe(true)
      }
    })

- [ ] **Step 2: Run the test and verify RED**

  Run: npm test -- tests/unit/catalog-media.test.ts

  Expected: FAIL on the first missing public/products file.

- [ ] **Step 3: Download only from the recorded official source**

  For each of the 38 entries, inspect the official product page, select the primary isolated product image, download it, remove surrounding whitespace without altering the product, and convert it with Sharp:

    await sharp(input)
      .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 95 })
      .toFile(output)

  Preserve logos and physical details because these are real catalog photographs, not generated artwork.

  Write the same 38 slug, primary, sourcePage, and credit values to
  public/products/manifest.json. The validator compares those keys against PRODUCT_MEDIA so the
  public manifest cannot drift from the TypeScript catalog.

- [ ] **Step 4: Create deterministic media validation**

    import { access, readFile } from 'node:fs/promises'
    import { resolve } from 'node:path'
    import sharp from 'sharp'

    const manifest = JSON.parse(await readFile(resolve('public/products/manifest.json'), 'utf8'))
    if (manifest.length !== 38) throw new Error('Expected 38 media entries')
    for (const item of manifest) {
      const path = resolve('public', item.primary.replace(/^\//, ''))
      await access(path)
      const meta = await sharp(path).metadata()
      if (meta.format !== 'webp' || !meta.width || meta.width < 600) {
        throw new Error('Invalid media: ' + item.slug)
      }
      if (!item.sourcePage.startsWith('https://')) {
        throw new Error('Missing official source: ' + item.slug)
      }
    }

- [ ] **Step 5: Add scripts**

    "media:validate": "node scripts/validate-product-media.mjs",
    "verify": "npm run media:validate && npm run lint && npm run typecheck && npm run test && npm run build"

- [ ] **Step 6: Record every source in CREDITS.md**

  Group credits by manufacturer. Each line contains product name, official source page, local file path, and states that the image was resized/compressed without changing product identity.

- [ ] **Step 7: Run media validation and unit tests**

  Run:

    npm run media:validate
    npm test -- tests/unit/catalog-media.test.ts

  Expected: 38 valid WebP files and all catalog-media tests PASS.

- [ ] **Step 8: Commit**

  Run:

    git add public/products scripts/validate-product-media.mjs package.json CREDITS.md tests/unit/catalog-media.test.ts
    git commit -m "feat: add official imagery for every product"

---

### Task 3: ProductImage, pointer-responsive ProductStage, and storefront integration

**Files:**

- Create: src/components/product/ProductImage.tsx
- Create: src/components/product/ProductStage.tsx
- Create: tests/e2e/premium-visuals.spec.ts
- Modify: src/components/catalog/ProductCard.tsx
- Modify: src/components/product/Gallery.tsx
- Modify: src/components/cart/CartContents.tsx
- Modify: src/components/checkout/CheckoutFlow.tsx
- Modify: src/components/builder/Configurator.tsx
- Modify: src/app/globals.css

**Interfaces:**

- ProductImage accepts product, view, sizes, priority, className, and onLoad.
- ProductStage accepts product, dimensions, hero, priority, and className.
- Vector ComponentRender remains the onError fallback.

- [ ] **Step 1: Write failing E2E coverage**

    test('uses a real RTX 5090 image and moves a catalog product on hover', async ({ page }) => {
      await page.goto('/es')
      await expect(page.getByTestId('hero-product-image')).toHaveAttribute(
        'src',
        /geforce-rtx-5090-founders-edition-32gb/,
      )

      await page.goto('/es/catalogo')
      const stage = page.getByTestId('product-stage').first()
      await stage.hover({ position: { x: 250, y: 60 } })
      await expect(stage).toHaveAttribute('data-active', 'true')
      const transform = await stage.locator('[data-product-plane]').evaluate(
        (node) => getComputedStyle(node).transform,
      )
      expect(transform).not.toBe('none')
    })

- [ ] **Step 2: Run and verify RED**

  Run: npx playwright test tests/e2e/premium-visuals.spec.ts --project=chromium

  Expected: FAIL because product-stage and hero-product-image do not exist.

- [ ] **Step 3: Implement ProductImage with accessible fallback**

    export function ProductImage({ product, view = 'primary', ...props }: Props) {
      const [failed, setFailed] = useState(false)
      if (failed) {
        return <ComponentRender {...product.render} title={product.media.alt[locale]} />
      }
      const src = view === 'secondary' && product.media.secondary
        ? product.media.secondary
        : product.media.primary
      return (
        <Image
          src={src}
          alt={product.media.alt[locale]}
          onError={() => setFailed(true)}
          {...props}
        />
      )
    }

- [ ] **Step 4: Implement ProductStage pointer behavior**

  Read the element rect only on pointer enter. Store pointer ratios as CSS custom properties. Animate only transform and opacity. Apply perspective rotation of at most five degrees, translation of at most eight pixels, and scale 1.06. Reset on pointer leave. Skip listeners for coarse pointers and reduced motion.

- [ ] **Step 5: Replace every product-facing ComponentRender**

  ProductCard, Gallery, cart, checkout, and configurator thumbnails use ProductImage or ProductStage. Gallery keeps ComponentDims as its annotation overlay. Guides may keep explanatory vectors because they are not selling a named product.

- [ ] **Step 6: Run E2E, unit tests, and accessibility**

  Run:

    npx playwright test tests/e2e/premium-visuals.spec.ts --project=chromium
    npm test
    npm run a11y

  Expected: hover transform detected, images have non-empty alt text, all existing flows pass.

- [ ] **Step 7: Commit**

  Run:

    git add src/components src/app/globals.css tests/e2e/premium-visuals.spec.ts
    git commit -m "feat: present real products with responsive depth"

---

### Task 4: RTX 5090 hero, kinetic headings, and expanded intro

**Files:**

- Create: src/components/product/HeroProductStage.tsx
- Create: src/components/motion/KineticHeading.tsx
- Modify: src/components/views/HomeView.tsx
- Modify: src/components/intro/Intro.tsx
- Modify: src/components/brand/Wordmark.tsx
- Modify: src/lib/i18n/dictionary.ts
- Modify: src/app/globals.css
- Test: tests/e2e/premium-visuals.spec.ts

**Interfaces:**

- HeroProductStage uses the same ProductImage contract and exposes data-testid hero-product-image.
- KineticHeading accepts text or lines, level, start, alive, and className.
- Intro duration constants remain shared between TypeScript and CSS custom properties.

- [ ] **Step 1: Add failing intro and hero assertions**

    test('keeps the premium intro longer and still releases input', async ({ page }) => {
      await page.goto('/es')
      await expect(page.locator('.intro')).toBeAttached()
      await page.waitForTimeout(2600)
      await expect(page.locator('.intro')).toBeAttached()
      await expect(page.locator('.intro')).toHaveCSS('pointer-events', 'none')
      await expect(page.locator('.intro')).toHaveCount(0, { timeout: 5000 })
    })

    test('announces the 5090 as the hero product', async ({ page }) => {
      await page.goto('/es')
      await expect(page.getByText('32 GB GDDR7').first()).toBeVisible()
      await expect(page.getByText('575 W').first()).toBeVisible()
      await expect(page.getByText('304 mm').first()).toBeVisible()
    })

- [ ] **Step 2: Run and verify RED**

  Run: npx playwright test tests/e2e/premium-visuals.spec.ts --project=chromium

  Expected: FAIL because the intro disappears around 2.3 seconds and the hero is still the RTX 5080.

- [ ] **Step 3: Implement the 3.8-second intro timeline**

  Use four explicit phases: circuit wake, mark assembly, sustained dual current pass with a 5090 technical silhouette, and slat reveal. Set skip visibility before 600 ms, pointer release around 2350 ms, and final unmount around 3800 ms. Reuse the existing easing curves. Keep Escape, click-to-skip, and reduced-motion prepaint skip.

- [ ] **Step 4: Implement the 5090 hero and headings**

  Replace HERO_GPU lookup with the 5090 slug. Render HeroProductStage with official imagery and the 304 mm, 575 W, PCIe 5.0 x16 annotations. KineticHeading composes masked word entry, tracking settle, and the seven-second controlled sweep. Replace the home hero, categories, featured, builder, guides, and benefits headings plus PageHeader title motion with KineticHeading so the upgraded grammar is consistent beyond the first viewport.

- [ ] **Step 5: Add the post-intro wordmark pulse**

  Animate only the small brand mark path and a short circuit segment once every eight seconds. Do not animate the full wordmark continuously.

- [ ] **Step 6: Verify intro, motion reduction, and console**

  Run:

    npx playwright test tests/e2e/premium-visuals.spec.ts tests/e2e/experiencia.spec.ts --project=chromium
    npm run a11y

  Expected: the normal intro lasts about 3.8 seconds, reduced motion skips it, navigation does not replay it, and the hero shows 5090 data.

- [ ] **Step 7: Commit**

  Run:

    git add src/components src/lib/i18n src/app/globals.css tests/e2e
    git commit -m "feat: energize the RTX 5090 storefront"

---

### Task 5: Quality-gated RTX 5090 procedural model and sticky assembly

**Files:**

- Create: docs/three/rtx5090/reference.webp
- Create: docs/three/rtx5090/assessment.json
- Create: docs/three/rtx5090/sculpt-spec.json
- Create: docs/three/rtx5090/reviews/
- Create: src/components/three/rtx5090Model.ts
- Create: src/components/three/Rtx5090Assembly.tsx
- Create: tests/unit/three-models.test.ts
- Modify: src/components/home/AssemblySection.tsx
- Modify: src/app/globals.css
- Test: tests/e2e/premium-visuals.spec.ts

**Interfaces:**

- createRtx5090Model returns { root, parts, fans, dispose }.
- parts is a record containing pcb, memory, vapor, fins, frame, backplate, connectors, shroud, fanFront, and fanRear.
- applyRtx5090Progress(model, progress) accepts a clamped 0..1 number.

- [ ] **Step 1: Run the img2threejs intake before model code**

  Analyze the official 5090 image using the skill image-analysis rubric. Record visible silhouette, dual flow-through fan layout, X-frame, metal finish, connector region, hidden-side assumptions, and browser-performance target. Run the commands from C:\Users\Bryan\.agents\skills\img2threejs and pass absolute workspace paths:

    python forge/next.py D:\CODE\SkyImport\docs\three\rtx5090\sculpt-spec.json
    python forge/stage1_intake/probe_image.py D:\CODE\SkyImport\docs\three\rtx5090\reference.webp
    python forge/stage2_spec/new_pre_spec_assessment.py "RTX 5090 Founders Edition" --image D:\CODE\SkyImport\docs\three\rtx5090\reference.webp --complexity complex --spec-query "graphics card vapor chamber dual flow through fan" --out D:\CODE\SkyImport\docs\three\rtx5090\assessment.json
    python forge/stage2_spec/new_sculpt_spec.py "RTX 5090 Founders Edition" --image D:\CODE\SkyImport\docs\three\rtx5090\reference.webp --assessment D:\CODE\SkyImport\docs\three\rtx5090\assessment.json --out D:\CODE\SkyImport\docs\three\rtx5090\sculpt-spec.json

  Replace starter feature targets, component topology, local details, pivots, sockets, materials,
  and hidden-side confidence with the observed 5090 systems before strict validation:

    python forge/stage2_spec/validate_sculpt_spec.py D:\CODE\SkyImport\docs\three\rtx5090\sculpt-spec.json --strict-quality

  Expected: strict validation passes before production model code is written.

- [ ] **Step 2: Write the failing hierarchy test**

    import { createRtx5090Model, applyRtx5090Progress } from '@/components/three/rtx5090Model'

    test('builds an explodable named RTX 5090 hierarchy', () => {
      const model = createRtx5090Model()
      expect(Object.keys(model.parts)).toEqual(expect.arrayContaining([
        'pcb', 'memory', 'vapor', 'fins', 'frame', 'backplate',
        'connectors', 'shroud', 'fanFront', 'fanRear',
      ]))
      applyRtx5090Progress(model, 0)
      const exploded = model.parts.shroud.position.clone()
      applyRtx5090Progress(model, 1)
      expect(model.parts.shroud.position.equals(exploded)).toBe(false)
      model.dispose()
    })

- [ ] **Step 3: Run and verify RED**

  Run: npm test -- tests/unit/three-models.test.ts

  Expected: FAIL because the factory does not exist.

- [ ] **Step 4: Build and review pass by pass**

  Implement blockout, structural, form, material, lighting, interaction, and optimization passes in the order unlocked by the img2threejs orchestrator. After each pass capture a browser render, build a comparison sheet, record the review, and choose exactly one action. Do not call the model exact; hidden faces remain inferred.

- [ ] **Step 5: Implement sticky native-scroll orchestration**

  AssemblySection becomes a 360vh wrapper with a 100svh sticky child. Rtx5090Assembly derives progress from the wrapper rectangle, applies the procedural part timeline, activates the matching text label, and reports data-assembly-progress. Reduced motion renders a complete static model in a normal-height section.

- [ ] **Step 6: Run model and sticky tests**

  Run:

    npm test -- tests/unit/three-models.test.ts
    npx playwright test tests/e2e/premium-visuals.spec.ts --project=chromium

  Expected: hierarchy tests PASS and scrolling to the end exposes progress 1 without any wheel-blocking listener.

- [ ] **Step 7: Commit**

  Run:

    git add docs/three/rtx5090 src/components/three src/components/home/AssemblySection.tsx src/app/globals.css tests
    git commit -m "feat: assemble the RTX 5090 through scroll"

---

### Task 6: Pure PC assembly model and compatibility-to-visual state

**Files:**

- Create: src/lib/assembly.ts
- Create: src/components/three/pcAssemblyModel.ts
- Create: tests/unit/assembly.test.ts
- Modify: tests/unit/three-models.test.ts

**Interfaces:**

- deriveAssemblyState(build, issues) returns selected slots, flagged slots, complete, blocked, and powered.
- createPcAssemblyModel returns root, slotGroups, fanRotors, ramLights, cablePulses, powerLight, setState, tick, and dispose.
- Slot group keys exactly match BUILD_SLOTS.

- [ ] **Step 1: Write failing visual-state tests**

    test('powers only a complete compatible build', () => {
      const compatible = deriveAssemblyState(fullBuild, [])
      expect(compatible).toMatchObject({ complete: true, blocked: false, powered: true })
      const blocked = deriveAssemblyState(fullBuild, [{
        id: 'socket',
        level: 'bloqueo',
        slots: ['cpu', 'motherboard'],
        title: { es: '', pt: '' },
        detail: { es: '', pt: '' },
      }])
      expect(blocked.powered).toBe(false)
      expect(blocked.flagged.cpu).toBe('bloqueo')
    })

- [ ] **Step 2: Run and verify RED**

  Run: npm test -- tests/unit/assembly.test.ts

  Expected: FAIL because deriveAssemblyState does not exist.

- [ ] **Step 3: Implement pure state derivation**

  Read the resolved build and existing CompatibilityIssue array. Do not duplicate socket, DDR, wattage, or physical-fit logic. A build is complete only when all BUILD_SLOTS are non-null; powered is complete and contains no bloqueo.

- [ ] **Step 4: Extend the failing Three.js hierarchy test**

    test('creates one independent group per builder slot', () => {
      const model = createPcAssemblyModel()
      expect(Object.keys(model.slotGroups).sort()).toEqual([...BUILD_SLOTS].sort())
      expect(model.cablePulses.length).toBeGreaterThan(2)
      expect(model.fanRotors.length).toBeGreaterThan(2)
      model.dispose()
    })

- [ ] **Step 5: Build the procedural open-case model**

  Create independent case, motherboard, CPU, RAM, GPU, storage, PSU, cooling, and cable groups with final sockets and off-stage positions. GPU length, board form factor, RAM module count, and cooling type adjust the representative geometry. Cables use TubeGeometry and small emissive pulse meshes; fans expose rotor groups; RAM exposes narrow emissive strips.

- [ ] **Step 6: Run unit tests and typecheck**

  Run:

    npm test -- tests/unit/assembly.test.ts tests/unit/three-models.test.ts
    npm run typecheck

  Expected: all assembly and hierarchy tests PASS with no type errors.

- [ ] **Step 7: Commit**

  Run:

    git add src/lib/assembly.ts src/components/three/pcAssemblyModel.ts tests/unit
    git commit -m "feat: model visual PC assembly state"

---

### Task 7: Integrate the 3D scene into Arma tu PC

**Files:**

- Create: src/components/three/PcAssemblyScene.tsx
- Modify: src/components/builder/Configurator.tsx
- Modify: src/components/views/PageHeader.tsx
- Modify: src/app/[locale]/armar/page.tsx
- Modify: src/lib/i18n/dictionary.ts
- Modify: src/app/globals.css
- Test: tests/e2e/premium-visuals.spec.ts
- Test: tests/e2e/experiencia.spec.ts

**Interfaces:**

- PcAssemblyScene accepts build, issues, onReady, and className.
- It exposes data-assembly-selected, data-assembly-powered, and data-assembly-blocked on its host for accessible E2E observation.
- PageHeader adds beamSpeed and beamIntensity props with current values as defaults.

- [ ] **Step 1: Add failing builder-scene E2E tests**

    test('assembles selections and powers a compatible complete PC', async ({ page }) => {
      await page.goto('/es/armar')
      await expect(page.getByTestId('pc-assembly')).toHaveAttribute('data-assembly-selected', '0')
      await chooseCompatibleFullBuild(page)
      await expect(page.getByTestId('pc-assembly')).toHaveAttribute('data-assembly-selected', '8')
      await expect(page.getByTestId('pc-assembly')).toHaveAttribute('data-assembly-powered', 'true')
    })

    test('does not power an incompatible complete PC', async ({ page }) => {
      await page.goto('/es/armar')
      await chooseBlockedFullBuild(page)
      await expect(page.getByTestId('pc-assembly')).toHaveAttribute('data-assembly-powered', 'false')
      await expect(page.getByTestId('pc-assembly')).toHaveAttribute('data-assembly-blocked', 'true')
    })

- [ ] **Step 2: Run and verify RED**

  Run: npx playwright test tests/e2e/premium-visuals.spec.ts --project=chromium

  Expected: FAIL because pc-assembly does not exist.

- [ ] **Step 3: Implement the WebGL lifecycle**

  Dynamically import Three.js, create the model once, derive visual state from props, animate changed groups to their sockets, frame the affected area briefly, and return to the overview. When powered, spin fans, animate RAM light hue, move cable pulses, and run one short RGB completion sweep before settling to Sky cyan. Stop frames off-screen and dispose in the established forceContextLoss-before-dispose order.

- [ ] **Step 4: Reshape Configurator around the sticky stage**

  Desktop uses a seven-column selection list and five-column sticky scene/summary. Mobile shows a 42svh scene before the list and disables sticky below the desktop breakpoint. Existing dialogs, compatibility copy, price summary, add-all, reset, keyboard focus trap, and cart behavior remain intact.

- [ ] **Step 5: Speed up the builder header background**

  Add beamSpeed and beamIntensity to PageHeader. Pass beamSpeed 2.3 and a modestly higher opacity for the builder route only. Reduced motion still prevents the effect from mounting.

- [ ] **Step 6: Verify builder flows, mobile layout, and accessibility**

  Run:

    npx playwright test tests/e2e/premium-visuals.spec.ts tests/e2e/experiencia.spec.ts --project=chromium
    npm run a11y

  Expected: compatible complete builds power on, incompatible builds remain unpowered, existing warnings and cart behavior pass, and axe reports zero violations.

- [ ] **Step 7: Commit**

  Run:

    git add src/components/three/PcAssemblyScene.tsx src/components/builder src/components/views/PageHeader.tsx src/app src/lib/i18n tests/e2e
    git commit -m "feat: let customers watch their PC come alive"

---

### Task 8: Documentation, full verification, visual QA, and publication

**Files:**

- Modify: PRODUCT.md
- Modify: DESIGN.md
- Modify: README.md
- Modify: CREDITS.md
- Modify: scripts/shots.mjs
- Modify: tests/e2e/accesibilidad.spec.ts

**Interfaces:**

- Produces current documentation, repeatable screenshots, and a verified commit ready for origin/main.

- [ ] **Step 1: Update documentation accurately**

  PRODUCT.md records 38 products, official photography, and procedural representations. DESIGN.md updates the image policy, 3.8-second intro, 5090 hero, sticky assembly, builder completion RGB exception, and motion budget. README explains media validation and 3D fallbacks. CREDITS contains all official image sources and img2threejs Apache-2.0 attribution.

- [ ] **Step 2: Extend screenshot coverage**

  Add intro at 1.7 seconds, home after intro, catalog, RTX 5090 product page, sticky assembly at 0/50/100 percent, builder empty, builder partially selected, builder powered, and builder blocked at 360, 390, 768, 1366, and 1440 widths.

- [ ] **Step 3: Run fresh full verification**

  Run:

    npm run media:validate
    npm run lint
    npm run typecheck
    npm test
    npm run build
    npm run e2e
    npm run a11y

  Expected: every command exits 0, all 38 media files validate, and no tests fail.

- [ ] **Step 4: Run screenshot and console audit**

  Run:

    node scripts/shots.mjs test-results/premium-final http://127.0.0.1:3100

  Expected: no horizontal overflow and no console/page errors across every route and viewport.

- [ ] **Step 5: Inspect images manually**

  Compare notebook and mobile captures. Confirm product images are exact and uncropped, hero controls are visible, titles never overlap, sticky assembly reaches completion, the mobile builder keeps controls usable, RGB appears only after compatible completion, and reduced-motion screenshots are static.

- [ ] **Step 6: Commit final documentation or corrections**

  Run:

    git add PRODUCT.md DESIGN.md README.md CREDITS.md scripts tests src public package.json
    git commit -m "docs: record the premium Sky Import experience"

- [ ] **Step 7: Verify repository state and push**

  Run:

    git status --short --branch
    git log --oneline origin/main..HEAD
    git push origin main

  Expected: clean main branch, push succeeds without force, and origin/main points to the final verified commit.
