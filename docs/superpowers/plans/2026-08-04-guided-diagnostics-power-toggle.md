# Guided Diagnostics and Power Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace intrusive diagnostic boxes with precise yellow guidance, recommend compatible replacement products, and let the power control turn the assembled PC off again.

**Architecture:** A pure candidate-assessment module evaluates replacement products against the current `Build`. `Configurator` owns the power state and guided repair UI. `PcBuildScene` renders lightweight target markers instead of `BoxHelper` geometry while continuing to receive diagnostic slots as declarative props.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, Zustand, Vitest, Playwright.

## Global Constraints

- Use yellow technical `#E8B23A` only for boot failures and cyan for compatible/working states.
- Preserve the existing eight-slot builder and mobile 4 by 2 dock.
- Respect `prefers-reduced-motion`.
- Do not add a new runtime dependency.
- All Spanish UI additions require Portuguese equivalents.

---

### Task 1: Candidate compatibility assessment

**Files:**
- Create: `src/lib/buildCandidateFit.ts`
- Create: `tests/unit/build-candidate-fit.test.ts`

**Interfaces:**
- Consumes: `Build`, `BuildSlot`, `Product`, and `checkBuild` from the compatibility/catalog modules.
- Produces: `assessBuildCandidate(build, slot, candidate): { fit: 'compatible' | 'conflict'; issues: Issue[] }`.

- [ ] **Step 1: Write failing unit tests**

Cover a 650 W PSU remaining in conflict with RTX 5080, RM1000x resolving it, an incompatible motherboard conflicting with Ryzen 7 9800X3D, and the matching B850 board passing.

```ts
expect(assessBuildCandidate(build, 'psu', rm1000x).fit).toBe('compatible')
expect(assessBuildCandidate(build, 'psu', a650bn).fit).toBe('conflict')
```

- [ ] **Step 2: Run the focused test and confirm red**

Run: `npm test -- tests/unit/build-candidate-fit.test.ts`

Expected: FAIL because `@/lib/buildCandidateFit` does not exist.

- [ ] **Step 3: Implement the pure evaluator**

```ts
const candidateBuild = { ...build, [slot]: candidate }
const issues = checkBuild(candidateBuild).filter((issue) => issue.slots.includes(slot))
const conflict = issues.some((issue) => issue.level === 'bloqueo' || issue.id === 'psu-under')
return { fit: conflict ? 'conflict' : 'compatible', issues }
```

- [ ] **Step 4: Run focused tests and confirm green**

Run: `npm test -- tests/unit/build-candidate-fit.test.ts`

Expected: all candidate-fit tests pass.

### Task 2: Bidirectional power control

**Files:**
- Modify: `src/components/builder/Configurator.tsx`
- Modify: `src/lib/i18n/dictionary.ts`
- Modify: `tests/e2e/experiencia.spec.ts`

**Interfaces:**
- Consumes: existing `PcPowerPhase` and scene props.
- Produces: `powerOff()` and translated `build.scene.powerOff` copy.

- [ ] **Step 1: Extend the E2E test before implementation**

After a valid boot, assert the control is named `Apagar PC`; click it and assert `window.__pcBuilderState.powered === false`, the ready status is restored, and `Comprar armado` is hidden.

- [ ] **Step 2: Run the focused E2E test and confirm red**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "apagar" --project=escritorio`

Expected: FAIL because the powered state has no power button.

- [ ] **Step 3: Keep the power tray visible for every complete build**

```ts
const powerOff = () => {
  if (powerTimerRef.current !== null) window.clearTimeout(powerTimerRef.current)
  setPowerAttempt({ signature: buildSignature, phase: 'off', diagnosticIssueId: null })
}
```

Render the button in the powered state with `onClick={powerOff}` and `Apagar PC`; preserve the current scan/retry behavior for all other states.

- [ ] **Step 4: Run the focused E2E test and confirm green**

Run the command from Step 2. Expected: PASS.

### Task 3: Guided yellow diagnostics and compatible choices

**Files:**
- Modify: `src/components/builder/Configurator.tsx`
- Modify: `src/components/builder/PcBuildScene.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/lib/i18n/dictionary.ts`
- Modify: `tests/e2e/experiencia.spec.ts`

**Interfaces:**
- Consumes: `assessBuildCandidate`, `diagnosticSlots`, and the first slot as `guidedSlot`.
- Produces: `data-diagnostic="warning"`, `data-pc-guide`, `data-fit`, and precise Three.js diagnostic markers.

- [ ] **Step 1: Write failing browser assertions**

For an undersized PSU, assert two warning cells, one guide targeting `psu`, a repair action, and at least one compatible selector option containing RM1000x.

```ts
await expect(page.locator('[data-diagnostic="warning"]')).toHaveCount(2)
await expect(page.locator('[data-pc-guide][data-target-slot="psu"]')).toBeVisible()
await page.getByRole('button', { name: 'Ver opciones compatibles' }).click()
await expect(page.getByRole('button', { name: /RM1000x/ })).toHaveAttribute('data-fit', 'compatible')
```

- [ ] **Step 2: Confirm the browser test fails**

Run: `npx playwright test tests/e2e/experiencia.spec.ts --grep "opciones compatibles" --project=escritorio`

Expected: FAIL on the new warning/guide selectors.

- [ ] **Step 3: Implement the DOM repair guide and selector ordering**

Compute candidate fit for `openSlot`, sort compatible choices first, label each choice, and make both the diagnostic action and dock callout open `guidedSlot`.

- [ ] **Step 4: Replace Three.js box helpers**

Remove every `THREE.BoxHelper`. Create one marker group per scene part with an amber line, cone arrowhead, target halo, and local point light. Toggle only markers mapped from `diagnosticSlots`; pulse only when reduced motion is disabled.

- [ ] **Step 5: Apply the visual state system**

Use amber borders/text for `failed`, yellow dock indicators and guide arrows, cyan compatibility pills, and quiet neutral conflict pills. Ensure the guide fits above the 4 by 2 dock on mobile.

- [ ] **Step 6: Run focused desktop and mobile tests**

Run:

```powershell
npx playwright test tests/e2e/experiencia.spec.ts --grep "opciones compatibles|cuadrícula 4 por 2|apagar"
```

Expected: all matching tests pass in their applicable projects.

### Task 4: Full verification and publication

**Files:**
- Verify all modified source, test, spec, and plan files.

**Interfaces:**
- Produces: a clean commit pushed to `codex/premium-store-3d` and `main`, followed by a verified Vercel production deployment.

- [ ] **Step 1: Review desktop/mobile screenshots**

Confirm there are no diagnostic boxes, only the failed parts are yellow, arrows point toward the relevant components, compatible options are obvious, and the powered state offers `Apagar PC`.

- [ ] **Step 2: Run repository verification**

Run: `npm run verify`

Expected: media validation, lint, typecheck, unit tests, and production build pass.

- [ ] **Step 3: Run the complete browser suite**

Run: `npm run e2e`

Expected: all applicable desktop/mobile tests pass with only intentional device-specific skips.

- [ ] **Step 4: Commit and publish**

Stage only task files, commit with `feat: guide incompatible PC parts`, fetch `origin`, confirm `origin/main` is an ancestor, and push fast-forward updates without force.

- [ ] **Step 5: Verify production**

Confirm both remote branches point to the same commit, Vercel reports `Production/success`, and live desktop/mobile smoke tests cover failure guidance and power-off.
