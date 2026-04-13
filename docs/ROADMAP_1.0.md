# 1.0.0 Release Plan

> **Goal:** Ship a stable, trustworthy 1.0.0 — good coverage, accurate docs, and a clear API contract users can rely on.

---

## Current State (as of 0.16.1)

| Metric | Current | Target |
|--------|---------|--------|
| Rules | 43 registered | — |
| Tests | 603 passing | — |
| Statement coverage | 81% | ≥80% ✅ |
| Branch coverage | **70%** | ≥75% ❌ |
| Function coverage | 81% | ≥80% ✅ |
| `runtime-comment.ts` statements | **57%** | ≥80% ❌ |
| Migration guide accuracy | **Severely stale** | Accurate ❌ |
| Gap analysis accuracy | **Severely stale** | Accurate or archived ❌ |
| Package name decided | Pending | Decided ❌ |

---

## Tracks

### Track A — Coverage (Blocker)

Branch coverage is below the project's own stated threshold (75%). Two files are the main culprits.

**A1. `runtime-comment.ts` — 57% statements, 73% branch**

Uncovered lines: 96–140, 143–154, 198–204. These correspond to:
- The `adjustSeverityForRuntimeComment` function (lines 143–154) — zero test coverage
- The JSX expression-container comment path (lines 96–119)
- The `getEffectiveSeverity` helper (lines 198–204)
- The newly-optimized proximity scan (lines 126–140)

Action: Expand `tests/vitest/unit/linter/utils/runtime-comment.test.ts` and/or `tests/vitest/integration/runtime-comment.test.ts` to cover all branches of the opt-in feature.

**A2. `html-ast-utils.ts` — 68% statements, 60% branch**

Uncovered lines: 75–101, 119, 135–136, 145–152. These are HTML string parsing utilities.

Action: Add targeted unit tests for the uncovered parsing paths.

**A3. `vue-ast-utils.ts` — 78% statements, 68% branch**

Uncovered lines: 76, 121–122, 139–141, 179–180. Likely edge cases in Vue attribute resolution.

Action: Add edge-case unit tests (bound attributes, missing values, directive attributes).

**A4. `jsx-ast-utils.ts` — 82% statements, 61% branch**

Uncovered lines: 191–192, 217–222, 235–236. JSX-to-DOM conversion edge cases, and the dynamic-attribute branch.

Action: Add targeted tests for the uncovered branches.

---

### Track B — Stale Docs (Blocker)

These docs actively mislead users and potential adopters. They must be fixed before launch.

**B1. `docs/MIGRATION_FROM_JSX_A11Y.md` — Critical**

Currently marks **15+ rules as "❌ Not available"** that are fully implemented and registered. Examples:
- `click-events-have-key-events` → marked ❌, exists as `a11y/click-events-have-key-events`
- `heading-has-content` → marked as "different approach", exists as `a11y/heading-has-content`
- `html-has-lang` → marked ❌, exists as `a11y/html-has-lang`
- `no-access-key` → marked ❌, exists as `a11y/no-access-key`
- `no-autofocus` → marked ❌, exists as `a11y/no-autofocus`
- `no-distracting-elements` → marked ❌, exists as `a11y/no-distracting-elements`
- `mouse-events-have-key-events` → marked ❌, exists
- `no-noninteractive-element-interactions` → marked ❌, exists
- `no-noninteractive-tabindex` → marked ❌, exists
- `interactive-supports-focus` → marked ❌, exists
- `aria-activedescendant-has-tabindex` → marked ❌, exists

Action: Do a complete audit of the rule mapping table against `src/linter/eslint-plugin/index.ts`. Update every row. Add a "Coverage" column showing which config preset includes the rule.

**B2. `docs/MISSING_RULES_GAP_ANALYSIS.md` — Critical**

Written when the plugin had **16 rules**. Now has 43. Most "missing" rules are implemented. This doc should either be fully updated or archived with a clear "as of v0.x" notice pointing to the current rule list.

Action: Add a header noting the doc is historical (written at 16-rule baseline). Add a current-state section at the top showing what's now covered.

**B3. `docs/PERFORMANCE.md` — Minor**

States "Recommended Config (36 rules)" and "Strict Config (36 rules, all errors)" — both wrong (30 recommended, 43 strict). Not caused by recent changes but should be fixed before 1.0.

Action: Update rule counts.

**B4. `docs/ROADMAP.md` — Stale**

References v0.8/v0.9 phase plans from the original implementation. No longer reflects reality.

Action: Replace with a forward-looking section referencing this document and post-1.0 ideas.

---

### Track C — Package Identity (Decide Before Release)

**C1. Package name: `eslint-plugin-a11y`**

The "test-" prefix makes the package sound like a test utility rather than a production ESLint plugin. If a rename is ever going to happen, it must happen before 1.0 — renaming after means a breaking change and split discoverability.

Options:
- **Keep it** — rename later under a major version
- **Rename now** — e.g. `eslint-plugin-a11y` or `eslint-plugin-access` (check npm availability)

Action: Make the call. If renaming, update `package.json`, `README.md`, all docs, rule URLs in `meta.docs.url`, and npm publish.

---

### Track D — Release Polish (Should-fix)

**D1. Audit `meta.docs.url` in all 43 rules**

Rule URLs in `meta.docs.url` should point to valid documentation pages. Verify none point to 404s or placeholder paths.

**D2. Verify all 43 rules appear in CHANGELOG correctly**

Rules added across 0.13–0.16 were added in batches. Confirm each rule is documented under the correct version entry.

**D3. Write the 1.0.0 CHANGELOG entry**

Should clearly state:
- What 1.0 signals (stable API contract — rule names, config names, package exports won't change without a major version)
- What's NOT covered (intentional non-goals: cross-file resolution, runtime DOM concerns)
- Migration note from pre-1.0 versions (if any config or rule names changed)

**D4. npm publish CI workflow**

`prepublishOnly` already runs `pre-check`. Consider adding a GitHub Actions `release` job that publishes on tag push (`v*`), so publishing is not manual.

---

### Track E — Post-1.0 (Out of Scope for Now, Document Intentions)

Capture so they're not forgotten, but explicitly not 1.0 blockers:

- **Autofix** on selected rules (`no-redundant-roles`, `no-autofocus`) — currently suggestions only
- **Cross-file `aria-labelledby`/`aria-describedby` ID resolution** — currently within-file only
- **`html-has-lang` / `lang` heuristics** — these rules exist but are contextual (only fire when `<html>` is in scope)
- **`img-redundant-alt` maintained word list** — currently basic; could expand the list
- **ESLint v9 language plugin API** — full native flat-config Language plugin (post ESLint v9 stable)

---

## Release Checklist

### Track A — Coverage

- [ ] **A1** Add tests for `adjustSeverityForRuntimeComment` (currently 0% coverage)
- [ ] **A1** Add tests for `getEffectiveSeverity` (currently 0% coverage)
- [ ] **A1** Add tests for JSX expression-container comment path in `hasRuntimeCheckedComment`
- [ ] **A1** Add tests for the proximity-scan fallback (lines 126–140) in `hasRuntimeCheckedComment`
- [ ] **A2** Add tests for uncovered HTML string parsing paths in `html-ast-utils.ts`
- [ ] **A3** Add Vue edge-case tests (bound attrs, missing values, directive attrs) in `vue-ast-utils`
- [ ] **A4** Add JSX edge-case tests for dynamic-attribute branch in `jsx-ast-utils.ts`
- [ ] **Verify** `npm run test:coverage` shows branch ≥75% and `runtime-comment.ts` statements ≥80%

### Track B — Stale Docs

- [ ] **B1** Audit every row in `docs/MIGRATION_FROM_JSX_A11Y.md` against current `index.ts` rule registrations
- [ ] **B1** Update all ❌/⚠️ rows where rules are now implemented
- [ ] **B1** Add "Config Preset" column (minimal / recommended / strict) to migration table
- [ ] **B2** Add historical-baseline notice to `docs/MISSING_RULES_GAP_ANALYSIS.md`
- [ ] **B2** Add current-state summary section at the top of the gap analysis
- [ ] **B3** Fix rule counts in `docs/PERFORMANCE.md` (recommended: 30, strict: 43)
- [ ] **B4** Replace `docs/ROADMAP.md` content with current state and post-1.0 intentions

### Track C — Package Identity

- [ ] **C1** Decide: keep `eslint-plugin-a11y` or rename
- [ ] **C1** If renaming: update `package.json` name, README, all docs, rule `meta.docs.url` values, publish under new name

### Track D — Release Polish

- [ ] **D1** Spot-check `meta.docs.url` on all 43 rules — fix any 404s or placeholder URLs
- [ ] **D2** Verify all rules added in 0.13–0.16 appear in CHANGELOG under the correct version
- [ ] **D3** Write the 1.0.0 CHANGELOG entry (API stability contract, non-goals, migration note)
- [ ] **D4** (Optional) Add GitHub Actions release job for automated npm publish on tag push

### Final Gates

- [ ] `npm run pre-check` passes clean (build + test:core + test:e2e + lint + type-check)
- [ ] Branch coverage ≥75%
- [ ] `runtime-comment.ts` statement coverage ≥80%
- [ ] `MIGRATION_FROM_JSX_A11Y.md` has no incorrect ❌ rows
- [ ] Package name decision made and applied
- [ ] `CHANGELOG.md` has a complete `[1.0.0]` entry
- [ ] `package.json` version bumped to `1.0.0`
- [ ] Tag `v1.0.0` pushed and npm package published

---

## Estimated Effort

| Track | Effort | Blocker? |
|-------|--------|----------|
| A — Coverage | Medium (add ~20–30 targeted tests) | Yes |
| B — Stale docs | Low–Medium (audit + rewrite two docs) | Yes |
| C — Package name | Low (decision) / Medium (rename execution) | Yes (if renaming) |
| D — Release polish | Low | No |

Tracks A and B can be done in parallel. Track C must be decided before publishing.
