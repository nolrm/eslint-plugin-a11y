## a11y – ESLint Plugin Improvement Plan

> **Status: ✅ All Phases Completed (v0.12.0)**
> 
> This document served as the implementation plan for v0.11.x through v0.12.0.
> All planned phases have been completed:
> - ✅ Phase 1: Production-Fit Config & Ecosystem Alignment (v0.11.x)
> - ✅ Phase 2: Developer Experience & Rule Surface Expansion (v0.12.x, v0.13.x)
> - ✅ Phase 3: Static + Runtime Workflow Integration (v0.14.x)
> 
> This document is kept for historical reference. For current features, see [ESLint Plugin Guide](./ESLINT_PLUGIN.md).

---

This document captures a multi‑phase plan to evolve `eslint-plugin-a11y` into a production‑grade, design‑system‑aware, flat‑config‑first accessibility linting solution that pairs tightly with the `A11yChecker` runtime API.

---

## Phase 1 – Production‑Fit Config & Ecosystem Alignment

### 1. Rule Configurability

- **Goal**: Let teams tune behavior instead of disabling rules when they hit edge cases.
- **Targets**:
  - **`image-alt`**:
    - Options (refined to avoid encouraging bad practice):
      - `allowMissingAltOnDecorative?: boolean` (default `false` - requires explicit opt-in)
      - `decorativeMatcher?: { requireAriaHidden?: boolean; requireRolePresentation?: boolean; markerAttributes?: string[] }`
    - Behavior:
      - **Strict by default**: Missing/empty `alt` is only allowed when:
        - `allowMissingAltOnDecorative` is `true` AND
        - Image is explicitly marked decorative via:
          - `aria-hidden="true"` OR
          - `role="presentation"` OR
          - A configured marker attribute (e.g. `data-decorative="true"`)
      - **Additional validation**: Warn if `alt=""` is used but image is NOT marked decorative (contradictory state).
      - This keeps the rule opinionated but configurable, preventing accidental "allow missing alt everywhere" scenarios.
  - **`link-text`**:
    - Options (safer approach):
      - `denylist?: string[]` (default: `["click here", "read more", "more"]`)
      - `caseInsensitive?: boolean` (default `true`)
      - `allowlistPatterns?: string[]` (regex strings - **compile with try/catch, surface clear config errors**)
    - Behavior:
      - Check accessible name from multiple sources:
        - Direct text content
        - `aria-label` attribute
        - `aria-labelledby` reference
        - `title` attribute (optional, depending on stance)
      - Warn/error when accessible name matches denylist phrases (substring match by default, regex if allowlist provided).
      - **Note**: Start with substring matching; add regex support later with robust error handling.
  - **`heading-order`**:
    - Options:
      - `allowSameLevel?: boolean` (default `true`)
      - `maxSkip?: number` (e.g. warn only when skipping more than one level)
    - Behavior:
      - Allow small, controlled heading skips or enforce strict hierarchy depending on config.
      - **No autofix by default** - changing heading levels can break styling or intentional semantics.
- **Implementation Notes**:
  - Extend each rule’s `meta.schema` to describe the options (ESLint JSON schema).
  - Access options via `context.options[0]` with robust defaulting.
  - Keep default behavior fully backwards compatible when no options are supplied.
- **Testing**:
  - Unit tests for:
    - No options (current behavior).
    - Each option toggled independently and in combination.
    - Invalid configurations rejected at schema level where practical.

### 2. Custom Components & Polymorphic `as=` Support

- **Goal**: Treat design‑system components like their native equivalents so rules apply to real‑world code (e.g. `<Link>` as `<a>`, `<Button>` as `<button>`).
- **Settings Design**:
  - Under ESLint `settings`:
    - `settings: { 'a11y': { components?: Record<string, 'a' | 'button' | 'img' | string>, polymorphicPropNames?: string[] } }`
  - Potential future extension:
    - `polymorphicMap?: Record<string, Record<string, string>>` (e.g. map `Link` + `as` combinations to roles).
- **Implementation**:
  - Add a utility (e.g. `getElementRoleFromJSX(node, context)`) that:
    - **Resolves with deterministic precedence** (document and test this order):
      1. Native HTML tag (highest priority)
      2. Polymorphic prop (`as`, `component`) when it's a **static literal** (e.g. `as="a"`)
      3. `settings['a11y'].components[ComponentName]` mapping
      4. Otherwise unknown (fallback)
    - **Important**: Only treat polymorphic props as meaningful when they resolve to a known tag (`"a"`, `"button"`, etc.). If dynamic (`as={something}`), follow current "warn/don't error" philosophy.
  - Refactor rules like `image-alt`, `button-label`, `link-text` to use this helper instead of checking raw `jsxNode.name.name`.
- **Scope (v1)**:
  - Focus on JSX/TSX first; Vue continues to use native tags (`VElement`) only.
- **Testing**:
  - Fixtures for:
    - `<Link href="/x">` acting as `<a>`.
    - `<Button as="a" href="/x">` acting as `<a>`.
    - Dynamic polymorphic props (`as={variable}`) - should not error, may warn.
    - Precedence conflicts (e.g. native tag vs component mapping).
    - No settings (ensures identical behavior to current release).

### 3. ESLint v9 / Flat‑Config‑First Presets

- **Goal**: Make the plugin feel "current" by supporting ESLint's flat config as a first‑class citizen.
- **Config Exports**:
  - Add flat presets with **minimal assumptions** to avoid brittleness:
    - `plugin.configs['flat/recommended']` - rules only, no parser assumptions
    - `plugin.configs['flat/recommended-react']` - includes parserOptions/jsx
    - `plugin.configs['flat/react']` - rules + React parser setup
    - `plugin.configs['flat/vue']` - rules + Vue parser setup
    - Optionally: `flat/minimal`, `flat/strict` (rules-only variants).
- **Implementation**:
  - Export presets that provide `plugins` + `rules` as core.
  - Offer **optional helpers** for `languageOptions` (parser, parserOptions) that users can merge if needed.
  - **Two-variant approach**:
    - `flat/recommended` - minimal, rules-only (users add their own parser)
    - `flat/recommended-react` - includes parserOptions for JSX (for convenience)
  - Ensure no reliance on deprecated ESLint configuration patterns (no "environments").
- **Docs**:
  - Update `README` and `CONFIGURATION` docs to:
    - Show `eslint.config.js` / `eslint.config.mjs` usage first.
    - Keep `.eslintrc.*` usage as a secondary ("legacy but supported") path.
    - Explain when to use rules-only vs full presets.
- **Testing**:
  - Add an integration test that:
    - Uses ESLint flat config via Node API.
    - Lints a small React and Vue fixture using the flat presets.
    - Verifies minimal preset doesn't conflict with user's parser choices.

---

## Phase 2 – Developer Experience & Rule Surface Expansion

### 4. Suggestions & Safe Autofix

- **Goal**: Make lint results more actionable in editors without introducing risky autofixes.
- **Targets & Behaviors**:
  - **`iframe-title`**:
    - ESLint **suggestion** to add a `title` attribute placeholder (`title=""`).
    - Does not attempt to guess the actual title string.
  - **`button-label`**:
    - When a button is icon‑only (no text content, no `aria-label`/`aria-labelledby`), provide a suggestion to add `aria-label=""`.
  - **`link-text`**:
    - When link text matches denylist phrases, suggest replacing with an explicit placeholder (e.g. `"TODO: describe link purpose"`), leaving it for humans to refine.
  - **`heading-order`**:
    - **Suggestion only, never autofix by default** - changing heading levels can break styling or intentional semantics.
    - Future: Consider `fixHeadingOrder?: 'off' | 'suggest' | 'fix'` option in strict mode (post-v0.12).
- **Implementation**:
  - Add `suggest` arrays to `context.report` calls in target rules.
  - Keep `meta.fixable` mostly `undefined` at first to avoid global `--fix` surprises.
  - **Postpone aggressive autofix** - focus on suggestions in v0.12.x.
- **Docs**:
  - Add a "Suggestions & editor UX" section to the ESLint plugin docs.
  - Show how suggestions manifest in VS Code or common editor setups.

### 5. Reintroduce Disabled Rules as AST‑First

- **Goal**: Restore feature coverage (ARIA, semantic HTML, form validation) without re‑introducing JSDOM into the ESLint plugin.
- **Rules to Re‑Enable**:
  - **`aria-validation`**
  - **`semantic-html`**
  - **`form-validation`**
- **Design Principles** (scope tightly at first):
  - Use **pure AST** + existing spec data (e.g. `aria-spec.ts`) for:
    - **Obvious invalid role values** (static validation against ARIA spec).
    - **ARIA attribute validity** (e.g. `aria-invalid` must be boolean/tristate).
    - **Known forbidden attributes per role** (e.g. `aria-checked` not allowed on `role="textbox"`).
    - **ID reference resolvable within file only** (e.g. `aria-labelledby` must reference an element ID that exists in the same file).
  - For semantic HTML:
    - Prefer semantic elements to generic ones with roles (e.g. `<button>` over `<div role="button">`).
    - Flag redundant roles (e.g. `<button role="button">`).
  - For form validation:
    - Ensure labeled required fields.
    - Check that `aria-describedby`/`aria-labelledby` IDs are resolvable within the file.
    - Avoid runtime‑only concerns (focus management, dynamic error flows).
- **Explicit Exclusions** (v0.13 initial scope):
  - Cross-file resolution (IDs in other files).
  - Runtime behavior validation.
  - Complex ARIA relationship chains that require computed accessibility tree.
- **Implementation Steps**:
  - Implement core validators in `core/` that work entirely on a normalized element representation (no DOM).
  - Port or rewrite ESLint rules to:
    - Normalize JSX/Vue nodes into the shared representation.
    - Call the core validators and convert violations into `context.report` calls.
  - Wire rules into:
    - `plugin.rules` in `index.ts`.
    - **Start as beta/experimental preset** (e.g. `plugin.configs['experimental']`).
    - Graduate to `recommended` / `strict` once stable.
- **Testing**:
  - Base coverage on:
    - `ARIA_VALIDATION_SCOPE.md`
    - `SEMANTIC_HTML_SCOPE.md`
    - `IMPLEMENTATION_PLAN.md` examples.
  - Explicitly test edge cases that are **out of scope** to ensure they don't error.

---

## Phase 3 – Static + Runtime Workflow as a Differentiator

### 6. Coherent Static + Runtime Story

- **Goal**: Turn the combination of ESLint plugin + `A11yChecker` into an explicit workflow advantage over static‑only plugins.
- **Convention for "Checked at Runtime"**:
  - Add an opt‑in setting to globally recognize a special comment:
    - `settings: { 'a11y': { runtimeCheckedComment?: string, runtimeCheckedMode?: 'downgrade' | 'suppress' } }`
    - Default: `runtimeCheckedComment: 'a11y-checked-at-runtime'`, `runtimeCheckedMode: 'downgrade'`.
  - Behavior (per‑rule or shared helper):
    - If a node (or its nearest parent) has a leading comment containing this string:
      - **Default (downgrade)**: `error` → `warn`, `warn` → `off` (per configured policy).
      - **Opt-in (suppress)**: Fully suppress the diagnostic (requires explicit `runtimeCheckedMode: 'suppress'`).
    - **Comment granularity**: Apply to the node + its descendants (nearest parent comment applies to subtree).
    - Only apply if configured; default behavior remains unchanged.
  - **Rationale**: Full suppression can hide real regressions. Downgrading maintains visibility while acknowledging runtime coverage.
- **Runtime Mapping in Docs**:
  - For each rule, document its corresponding `A11yChecker` API:
    - `image-alt` → `A11yChecker.checkImageAlt`
    - `button-label` → `A11yChecker.checkButtonLabel`
    - `link-text` → `A11yChecker.checkLinkText`
    - etc.
  - Add examples that show:
    - Lowering an ESLint rule's severity for a dynamic pattern.
    - Adding an explicit A11yChecker test.
    - Marking the code with `// a11y-checked-at-runtime` (document comment placement and scope).
- **Implementation**:
  - Shared utility (e.g. `hasRuntimeCheckedComment(context, node)`) that:
    - Looks at leading comments for the configured marker string.
    - Determines comment scope (node-only vs subtree).
    - Is cheap to call and safe in both JSX and Vue code paths.
  - Adopt utility in selected "noisy with dynamic props" rules (e.g. `image-alt`, `button-label`, `link-text`).

---

## Cross‑Cutting Tasks

- **Documentation**:
  - Keep `README`, `CONFIGURATION`, `ESLINT_PLUGIN`, and new improvement docs aligned.
  - Add:
    - **Migration guide** from `eslint-plugin-jsx-a11y`:
      - Rule mapping table: `jsx-a11y/rule-name` → `a11y/rule-name`.
      - Config mapping (how to approximate `jsx-a11y/recommended` with `a11y`).
      - **Compatibility "bridge" preset**: `plugin.configs['bridge/jsx-a11y']` that approximates common `jsx-a11y/recommended` behavior (even if not exact) to lower switching cost.
    - **Adoption guide** for large codebases (start with `minimal`, then `recommended`, then `strict`).
- **Testing & CI**:
  - Extend vitest integration to:
    - Validate flat‑config usage.
    - Exercise component mapping + polymorphic behavior.
    - Cover each rule options matrix (especially default vs configured behavior).
- **Versioning**:
  - Use **minor versions** for new rules/options:
    - Example milestones: `0.11.x` (configurability + components + flat configs), `0.12.x` (suggestions), `0.13.x` (ARIA/semantic/form), `0.14.x` (static+runtime).
  - Reserve **breaking changes** for:
    - Changing default severities.
    - Adding new rules as `error` into `recommended` without a major bump (or clearly flag in `BREAKING_CHANGES.md`).

---

## Suggested Milestones (High Level)

- **v0.11.x**:
  - Rule options for `image-alt`, `link-text`, `heading-order` (with refined, strict defaults).
  - Custom components + polymorphic `as=` for JSX (with documented precedence).
  - Flat config presets exported and documented (minimal-assumption variants).
  - Migration guide + compatibility bridge preset for `jsx-a11y` users.
- **v0.12.x**:
  - **Suggestions** on key rules (`iframe-title`, `button-label`, `link-text`).
  - **Autofix postponed** - focus on suggestions first, autofix can come later.
- **v0.13.x**:
  - AST‑based `aria-validation`, `semantic-html`, `form-validation` restored.
  - **Start as beta/experimental preset** - graduate to `recommended`/`strict` once stable.
  - Tightly scoped to obvious invalid values, within-file ID resolution, no cross-file or runtime concerns.
- **v0.14.x**:
  - Static + runtime integration conventions (`runtimeCheckedComment` with downgrade-by-default).
  - Complete runtime mapping docs for all rules.

---

## Key Design Decisions & Rationale

### Why Strict Defaults for `image-alt`?

- `allowMissingAltOnDecorative` defaults to `false` to prevent teams from accidentally allowing "missing alt everywhere".
- Requires explicit decorative markers (`aria-hidden`, `role="presentation"`, or configured attributes) to prevent bad practice.

### Why Substring Matching First for `link-text`?

- Regex-in-JSON is error-prone. Start with simple substring matching + case-insensitive option.
- Add regex support later with robust try/catch and clear config error messages.

### Why No Autofix for `heading-order`?

- Changing heading levels can break styling tied to semantic levels.
- Keep as suggestion only; consider opt-in autofix in strict mode later.

### Why Downgrade Over Suppress for Runtime Comments?

- Full suppression can hide regressions. Downgrading maintains visibility while acknowledging runtime coverage.
- Suppression available as explicit opt-in for teams that want it.

### Why Minimal-Assumption Flat Configs?

- Flat configs can become brittle if they enforce parser choices too aggressively.
- Provide rules-only variants that users can merge with their own parser setup, plus convenience variants with parser included.


