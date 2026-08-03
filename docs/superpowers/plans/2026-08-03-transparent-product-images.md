# Transparent Product Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task by task, `imagegen` for every semantic raster edit, `test-driven-development` for code changes, and `verification-before-completion` before publishing.

**Goal:** Replace the 38 catalog assets with faithful, high-quality product-only WebP cutouts, make the RTX 5090 the clean transparent hero image, preserve pointer motion, and publish the verified result to the production branch.

**Architecture:** Keep the existing stable URL for every product (`/products/<slug>/primary.webp`). A deterministic Sharp pipeline will normalize clean transparent sources to a shared square canvas; problematic composites will first receive one faithful image edit per asset and then pass through the same normalizer. Validation will enforce alpha, transparent corners, safe margins, and catalog completeness. The React layer will render only the asset and retain its existing transform variables, with no aura or CSS drop shadow.

**Tech Stack:** Next.js 16, React 19, TypeScript, Sharp, Vitest, Playwright, built-in `image_gen`, ImageGen chroma-key helper, Git, Vercel.

---

## Non-negotiable visual contract

- Show only the physical product or the complete commercial kit that defines the purchase.
- Preserve the real model, geometry, fan count, connectors, labels, materials, colors, and perspective.
- Keep two modules for RAM kits, radiator/block/tubes for an AIO, and all five fans for the ARCTIC five-pack.
- Remove boxes, manuals, loose accessories, campaign badges, promotional text, studio backgrounds, floors, reflections, and projected shadows.
- Keep physically printed branding on the product.
- Produce a real alpha channel, transparent corners, no white/green/black fringe, no clipping, and a minimum 6% safe margin.
- Use a 1600 x 1600 transparent canvas for catalog assets and 2048 x 2048 for the RTX 5090 hero asset.
- Never accept a generated result that invents or alters product details. If an edit cannot preserve fidelity, source a cleaner official reference rather than approximating it.

## Asset groups

### Normalize the existing clean cutout

1. `geforce-rtx-5070-ti-16gb`
2. `radeon-rx-9070-xt-16gb`
3. `asus-tuf-gaming-b650-plus-wifi`
4. `asrock-z890-pro-rs`
5. `corsair-vengeance-ddr5-32gb-6000`
6. `gskill-trident-z5-neo-32gb-6000`
7. `corsair-vengeance-lpx-ddr4-16gb-3200`
8. `wd-black-sn850x-1tb`
9. `corsair-rm750e`
10. `corsair-rm1000x`
11. `msi-mag-a650bn`
12. `lian-li-lancool-216`
13. `nzxt-h5-flow`
14. `cooler-master-masterbox-q300l`
15. `thermal-grizzly-kryonaut-1g`

### Faithful edit, then normalize

1. GPUs: `geforce-rtx-5090-founders-edition-32gb`, `geforce-rtx-5080-16gb`, `geforce-rtx-5070-12gb`, `geforce-rtx-4060-8gb`, `arc-b580-12gb`.
2. CPUs: `ryzen-7-9800x3d`, `ryzen-7-7800x3d`, `ryzen-5-9600x`, `core-ultra-7-265k`, `core-i5-14600k`.
3. Motherboards: `msi-mag-b850-tomahawk-wifi`, `msi-pro-b650m-a-wifi`, `gigabyte-b760m-ds3h`.
4. Memory/storage/power: `kingston-fury-beast-ddr5-16gb-5600`, `samsung-990-pro-2tb`, `crucial-p3-plus-1tb`, `samsung-870-evo-1tb`, `seasonic-focus-gx-850`.
5. Cooling/cases/accessories: `noctua-nh-d15`, `thermalright-peerless-assassin-120-se`, `arctic-liquid-freezer-iii-360`, `cooler-master-nr200p`, `arctic-p12-pwm-pst-5-pack`.

## Image-edit prompt template

Use the local source as the only visual reference and make one built-in image-generation call per asset:

```text
Faithfully isolate the exact [BRAND + MODEL] shown in the reference. Preserve its real geometry, proportions, perspective, materials, colors, fan count, connectors, labels, printed branding, and every visible hardware detail. Show only [SINGLE PRODUCT / EXACT COMMERCIAL KIT CONTENT]. Remove all packaging, manuals, loose accessories, promotional badges, captions, background graphics, floors, reflections, and projected shadows. Do not redesign, beautify, simplify, add, remove, or invent hardware details. Center the complete object with generous even clearance; do not crop any edge. Render it sharply at high resolution on a perfectly flat solid chroma-key green #00ff00 background with no gradient, texture, glow, shadow, or green reflections on the product.
```

For a predominantly green product, substitute flat `#ff00ff`. After every generated edit, run:

```powershell
python C:\Users\Bryan\.codex\skills\.system\imagegen\scripts\remove_chroma_key.py `
  --input <generated-file> `
  --out <staging-file.png> `
  --auto-key border `
  --soft-matte `
  --transparent-threshold 12 `
  --opaque-threshold 220 `
  --despill `
  --force
```

Inspect the matte on both dark (`#071016`) and light (`#f4f7f8`) backgrounds before accepting it. Use native-transparent CLI fallback only if chroma extraction demonstrably fails on reflective product edges and only after asking the user for confirmation, as required by the ImageGen workflow.

---

## Task 1: Lock the cutout contract with failing tests

**Files:**

- Create: `scripts/lib/product-cutout.mjs`
- Create: `tests/unit/product-cutout.test.ts`
- Modify: `tests/unit/catalog-media.test.ts`
- Modify: `scripts/validate-product-media.mjs`

**Step 1: Add a failing normalizer unit test**

Create a synthetic 800 x 400 transparent fixture with a centered opaque rectangle and assert that the normalizer returns a square 1600 x 1600 WebP, preserves alpha, keeps all four corner alpha values at zero, and leaves at least 6% transparent clearance.

```ts
test('normaliza un recorte sin perder alfa ni margen seguro', async () => {
  const input = await sharp({
    create: { width: 800, height: 400, channels: 4, background: '#00000000' },
  })
    .composite([{ input: opaqueFixture, left: 80, top: 40 }])
    .png()
    .toBuffer()

  const output = await normalizeProductCutout(input, { canvas: 1600, occupancy: 0.86 })
  const metadata = await sharp(output).metadata()
  expect(metadata).toMatchObject({ width: 1600, height: 1600, format: 'webp', hasAlpha: true })
  await expect(readCornerAlpha(output)).resolves.toEqual([0, 0, 0, 0])
  await expect(measureOpaqueBounds(output)).resolves.toMatchObject({ safeMarginRatio: expect.any(Number) })
})
```

**Step 2: Run the new unit test and confirm it fails**

Run: `npm test -- tests/unit/product-cutout.test.ts`

Expected: FAIL because `scripts/lib/product-cutout.mjs` does not exist.

**Step 3: Add catalog-wide alpha assertions**

Make the existing local-media test asynchronous and inspect each file with Sharp. Require:

```ts
expect(metadata.format, product.slug).toBe('webp')
expect(metadata.hasAlpha, product.slug).toBe(true)
expect(await readCornerAlpha(imagePath), product.slug).toEqual([0, 0, 0, 0])
```

Also add the same requirements to `scripts/validate-product-media.mjs`, plus:

- exact square dimensions of 1600, except RTX 5090 at 2048;
- non-empty opaque bounds;
- at least 6% transparent clearance on every side;
- no more than 16 MB per image;
- a per-slug error message that reports the violated measurement.

**Step 4: Run the catalog test and confirm the current media fails**

Run: `npm test -- tests/unit/catalog-media.test.ts`

Expected: FAIL on current assets without alpha and/or transparent corners.

**Step 5: Implement the shared analysis and normalization module**

Export the following from `scripts/lib/product-cutout.mjs`:

```js
export async function normalizeProductCutout(input, options = {})
export async function readCornerAlpha(input)
export async function measureOpaqueBounds(input)
export async function inspectProductCutout(input, options = {})
```

Implementation details:

1. `rotate()` and convert to RGBA.
2. Read the alpha channel, `trim({ background: '#00000000' })`, and reject a fully transparent result.
3. Resize with `fit: 'inside'` to the requested occupancy box (`canvas * occupancy`) without enlargement unless `allowEnlargement` is explicitly enabled.
4. Extend evenly to the square transparent canvas.
5. Encode lossless WebP with `alphaQuality: 100` and high effort.
6. Derive opaque bounds from alpha pixels above a small threshold (8), not RGB values.

**Step 6: Run the focused normalizer test**

Run: `npm test -- tests/unit/product-cutout.test.ts`

Expected: PASS.

**Step 7: Commit the contract**

```powershell
git add scripts/lib/product-cutout.mjs tests/unit/product-cutout.test.ts tests/unit/catalog-media.test.ts scripts/validate-product-media.mjs
git commit -m "test: enforce transparent product cutouts"
```

---

## Task 2: Add a safe, repeatable media workflow

**Files:**

- Create: `scripts/normalize-product-cutout.mjs`
- Create: `scripts/product-cutout-policy.mjs`
- Modify: `scripts/sync-product-images.mjs`
- Modify: `scripts/build-product-contact-sheet.mjs`
- Modify: `package.json`
- Modify: `public/products/SOURCES.md`

**Step 1: Write a failing CLI integration test**

Extend `tests/unit/product-cutout.test.ts` to execute the CLI against a temporary PNG and assert the requested output path is created, validated, and never writes outside that explicit path.

Run: `npm test -- tests/unit/product-cutout.test.ts`

Expected: FAIL because the CLI does not exist.

**Step 2: Define per-product policy**

`scripts/product-cutout-policy.mjs` must export the 38 slugs exactly once. Use defaults `{ canvas: 1600, occupancy: 0.84 }`, override RTX 5090 to `{ canvas: 2048, occupancy: 0.86 }`, and use category-specific occupancy only when the contact sheet proves it necessary.

**Step 3: Implement the explicit-path CLI**

```powershell
node scripts/normalize-product-cutout.mjs `
  --input artifacts/product-cutouts/<slug>.png `
  --slug <slug> `
  --output public/products/<slug>/primary.webp
```

The command must validate that `slug` exists in policy, write through a sibling temporary file, validate the result, and atomically rename only the explicit output. It must not glob or overwrite unrelated assets.

**Step 4: Protect curated assets from source synchronization**

Change `scripts/sync-product-images.mjs` so `npm run media:sync` downloads source material only to `artifacts/product-sources/<slug>/source.<detected-extension>`. It must never write `public/products/**/primary.webp`. Keep generation of `SOURCES.md` as a separate `--write-credits` option or a dedicated function.

**Step 5: Improve the contact sheet for matte review**

Render every product twice in each cell: once over dark neutral and once over light neutral. Keep slug and credit labels below the previews. This makes white, black, and chroma fringes visible in one artifact.

**Step 6: Add package commands and documentation**

```json
"media:normalize": "node scripts/normalize-product-cutout.mjs",
"media:validate": "node scripts/validate-product-media.mjs",
"media:sheet": "node scripts/build-product-contact-sheet.mjs"
```

Document the raw-source -> edit/extract -> normalize -> validate -> contact-sheet flow in `public/products/SOURCES.md`, while retaining every source URL and credit.

**Step 7: Run focused tests**

Run: `npm test -- tests/unit/product-cutout.test.ts`

Expected: PASS.

**Step 8: Commit the workflow**

```powershell
git add scripts package.json public/products/SOURCES.md tests/unit/product-cutout.test.ts
git commit -m "feat: add safe product cutout pipeline"
```

---

## Task 3: Normalize the 15 already-clean official cutouts

**Files:**

- Modify: the 15 `public/products/<slug>/primary.webp` files listed under “Normalize the existing clean cutout”.

**Step 1: Inspect each source before processing**

Use `view_image` for every file. Reject any item that actually includes packaging, badges, a baked background, or a visible edge halo and move it to the faithful-edit list.

**Step 2: Normalize one asset at a time**

For each approved file, pass the existing `primary.webp` through a temporary sibling input and invoke the normalizer using its policy. Do not overwrite the source until the normalized output passes inspection.

**Step 3: Validate the group**

Run: `npm run media:validate`

Expected at this stage: the command may still fail on the 23 pending assets, but none of the 15 normalized slugs may appear in the failure list.

**Step 4: Generate and inspect a group contact sheet**

Run: `npm run media:sheet -- artifacts/product-cutouts-clean.webp`

Inspect on dark and light backgrounds. Confirm consistent scale, complete silhouettes, and no halo.

**Step 5: Commit the clean group**

```powershell
git add public/products
git commit -m "assets: normalize clean product cutouts"
```

---

## Task 4: Produce faithful GPU cutouts, led by the RTX 5090

**Files:**

- Modify: `public/products/geforce-rtx-5090-founders-edition-32gb/primary.webp`
- Modify: `public/products/geforce-rtx-5080-16gb/primary.webp`
- Modify: `public/products/geforce-rtx-5070-12gb/primary.webp`
- Modify: `public/products/geforce-rtx-4060-8gb/primary.webp`
- Modify: `public/products/arc-b580-12gb/primary.webp`

**Step 1: Inspect all five local references**

Use `view_image` at original detail before each image edit. Record the exact fan count, visible ports, silhouette, brand marks, and perspective to use as rejection criteria.

**Step 2: Edit the RTX 5090 first**

Use the approved prompt template, explicitly requesting only the complete RTX 5090 Founders Edition from the supplied reference. Remove the NVIDIA press background without changing the dual-flow-through cooler geometry. Extract chroma, normalize to 2048 x 2048, and inspect at hero size on dark and light backgrounds.

**Step 3: Edit the remaining four GPUs one by one**

- RTX 5080 and RTX 5070: remove NVIDIA promotional backgrounds, retain the exact Founders Edition body.
- RTX 4060: remove retail box and retain only the complete MSI card.
- Intel Arc B580: remove the white background and retain only the complete card.

Run one generation call per asset and reject any result with changed ports, labels, fan count, or shroud geometry.

**Step 4: Normalize and validate the group**

Run the explicit normalizer command per slug, then:

```powershell
npm run media:sheet -- artifacts/product-cutouts-gpu.webp
npm run media:validate
```

Expected: no GPU slug appears in validation errors; RTX 5090 fills the hero canvas without clipping.

**Step 5: Commit the GPU assets**

```powershell
git add public/products/geforce-* public/products/radeon-* public/products/arc-*
git commit -m "assets: replace gpu images with clean cutouts"
```

---

## Task 5: Produce CPU and motherboard cutouts

**Files:**

- Modify: the five CPU and three motherboard assets listed in “Faithful edit, then normalize”.

**Step 1: Inspect and edit each CPU separately**

Remove retail boxes and compositions. Show one bare processor only, top-facing or in the exact clear official perspective, preserving the correct AMD/Intel heat-spreader outline and physically printed model marking.

**Step 2: Inspect and edit each motherboard separately**

Remove boxes, badges, antennas, manuals, and accessory arrangements. Retain one complete board only, including its native heatsinks, socket cover, I/O shroud, slots, and printed board branding.

**Step 3: Normalize and review**

```powershell
npm run media:sheet -- artifacts/product-cutouts-platform.webp
npm run media:validate
```

Expected: no CPU or motherboard slug appears in validation errors; no socket, slot, heat-spreader, or board edge is cropped.

**Step 4: Commit the platform assets**

```powershell
git add public/products/ryzen-* public/products/core-* public/products/msi-mag-b850-* public/products/msi-pro-b650m-* public/products/gigabyte-b760m-*
git commit -m "assets: isolate cpu and motherboard products"
```

---

## Task 6: Produce memory, storage, and power cutouts

**Files:**

- Modify: the five memory/storage/power assets listed in “Faithful edit, then normalize”.

**Step 1: Preserve the commercial unit for each product**

- Kingston Fury Beast: one module because the catalog item is 16 GB single-module.
- Samsung 990 Pro: one bare 2 TB M.2 drive, not a second heatsink variant.
- Crucial P3 Plus: one bare M.2 drive.
- Samsung 870 EVO: one 2.5-inch drive, no retail box.
- Seasonic Focus GX-850: one complete PSU, no box or loose cables.

**Step 2: Edit one asset per call, extract chroma, and normalize**

Inspect every output at original resolution. Reject misspelled labels, altered connector counts, invented vents, or duplicate drives.

**Step 3: Generate the group sheet and validate**

```powershell
npm run media:sheet -- artifacts/product-cutouts-components.webp
npm run media:validate
```

Expected: no slug in this group appears in validation errors.

**Step 4: Commit the component assets**

```powershell
git add public/products/kingston-* public/products/samsung-* public/products/crucial-* public/products/seasonic-*
git commit -m "assets: isolate memory storage and power products"
```

---

## Task 7: Produce cooling, case, and accessory cutouts

**Files:**

- Modify: the five cooling/case/accessory assets listed in “Faithful edit, then normalize”.

**Step 1: Preserve exact purchased contents**

- Noctua NH-D15 and Peerless Assassin: complete cooler assembly only; no box, mounting kit, or floor shadow.
- ARCTIC Liquid Freezer III 360: radiator, installed fans, tubes, and pump/block as one complete AIO; no award badges or accessory cards.
- Cooler Master NR200P: one complete case only, using a brighter official angle if the current source cannot yield a crisp silhouette.
- ARCTIC P12 five-pack: exactly five matching fans in a clean arrangement; no badge, packaging, or invented lighting.

**Step 2: Edit, extract, normalize, and inspect each item**

Pay special attention to thin fan blades, radiator fins, tubes, case mesh, and cable edges. Reject chroma spill or missing semi-transparent edge pixels.

**Step 3: Generate the group sheet and validate**

```powershell
npm run media:sheet -- artifacts/product-cutouts-cooling.webp
npm run media:validate
```

Expected: no slug in this group appears in validation errors.

**Step 4: Commit the final edited group**

```powershell
git add public/products/noctua-* public/products/thermalright-* public/products/arctic-* public/products/cooler-master-nr200p
git commit -m "assets: isolate cooling case and fan products"
```

---

## Task 8: Remove UI effects that read as image backgrounds

**Files:**

- Modify: `src/components/product/ProductImage.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/experiencia.spec.ts`

**Step 1: Add a failing browser assertion**

In the existing experience suite, assert that the hero image loads, that its `naturalWidth` is at least 1600, and that `.u-product-media__aura` does not exist. Keep the existing hover/motion behavior assertion if present.

Run: `npm run e2e -- experiencia --grep "producto de portada"`

Expected: FAIL because the aura element still renders.

**Step 2: Remove the aura from React**

Delete:

```tsx
<span className="u-product-media__aura" aria-hidden="true" />
```

Update the component comment to state that the product has no decorative backdrop and continues to read pointer variables without React renders.

**Step 3: Remove aura and shadow styling**

Delete `.u-product-media__aura` and its hover rules. Set `.u-product-media__asset { filter: none; }`, remove filter transitions, and keep only the existing pointer-driven translation and hover scale. Do not change card, hero panel, or page-level lighting.

**Step 4: Run focused tests**

```powershell
npm test -- tests/unit/catalog-media.test.ts
npm run e2e -- experiencia --grep "producto de portada"
```

Expected: PASS.

**Step 5: Commit the UI cleanup**

```powershell
git add src/components/product/ProductImage.tsx src/app/globals.css tests/e2e/experiencia.spec.ts
git commit -m "refactor: present products without decorative backdrops"
```

---

## Task 9: Full visual and automated verification

**Files:**

- Generate only for review: `artifacts/product-cutouts-final.webp`
- Do not commit diagnostic contents under `artifacts/`.

**Step 1: Validate every asset**

Run: `npm run media:validate`

Expected: `OK: 38 productos tienen recorte WebP transparente, fuente y crédito.`

**Step 2: Build and inspect the final contact sheet**

Run: `npm run media:sheet -- artifacts/product-cutouts-final.webp`

Use `view_image` at original detail. Check all 38 products on both backgrounds for complete silhouettes, coherent category scale, no packaging, no non-product props, no halo, and exact kit counts.

**Step 3: Run static and unit verification**

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

**Step 4: Run browser verification in desktop and mobile viewports**

```powershell
npm run e2e
```

Manually inspect at minimum:

- home hero at desktop and iPhone width;
- catalog grid and hover response;
- one product detail;
- cart line item;
- PC builder selector and preview.

Confirm the RTX 5090 remains crisp while moving with the pointer and no transparent bounds become visible during scale/translation.

**Step 5: Confirm the worktree contains only intended changes**

```powershell
git status --short
git diff --check
git log --oneline --decorate -8
```

Expected: no untracked diagnostic media, no whitespace errors, and only planned commits.

**Step 6: Final verification commit if needed**

Commit only any necessary test/documentation correction. Do not make a cosmetic code change solely to create a final commit.

---

## Task 10: Publish and verify the real Vercel production deployment

**Files:** none unless verification exposes a defect.

**Step 1: Push the feature branch**

```powershell
git push origin codex/premium-store-3d
```

Expected: remote branch advances without force.

**Step 2: Advance `main` safely**

Fetch the remote and verify the relationship first. Fast-forward `main` only if the remote state permits it; never force-push and never discard unrelated commits.

```powershell
git fetch origin
git merge-base --is-ancestor origin/main HEAD
git push origin HEAD:main
```

Expected: `main` advances to the verified cutout commit.

**Step 3: Verify the connected production project**

Confirm project `sky-import`, GitHub repository `Bryan-dev074/Sky-Import`, production branch `main`, and alias `https://sky-import-delta.vercel.app`. Wait until the deployment for the new commit reports READY.

**Step 4: Verify public output, not only deployment status**

Open `https://sky-import-delta.vercel.app`, bypassing cached assumptions. Confirm HTTP 200 and inspect the hero plus catalog in desktop/mobile browser sessions. The production HTML/assets must contain the new RTX 5090 cutout and the aura element must be absent.

**Step 5: Report the exact published commit and URL**

Include the commit SHA, branch updates, test results, and verified production URL. If Vercel is still building, do not claim completion; continue monitoring until READY or report a concrete deployment failure.
