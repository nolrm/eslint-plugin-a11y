# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned for 1.0.0
- After 0.17.0 is validated in production with no issues, the next release will be **1.0.0** with a formal API stability contract (package name, rule names, config names, exports unchanged until next major). See [ROADMAP_1.0.md](./docs/ROADMAP_1.0.md).

## [0.17.0] - 2026-03-03

### Added
- Coverage and documentation updates per [ROADMAP_1.0.md](./docs/ROADMAP_1.0.md): runtime-comment and ast-utils test coverage, migration and gap-analysis doc audits, PERFORMANCE.md and ROADMAP.md updated for 43 rules and correct preset counts.

### Changed
- Documentation: `docs/MIGRATION_FROM_JSX_A11Y.md` audited against all 43 rules; added Config Preset column (minimal / recommended / strict).
- Documentation: `docs/MISSING_RULES_GAP_ANALYSIS.md` marked historical (16-rule baseline) with current-state summary.
- Documentation: `docs/PERFORMANCE.md` and `docs/ROADMAP.md` updated (30 recommended, 43 strict; current state and post-1.0 intentions).

---

## [Unreleased]

### Changed
- Internal: ContextKit integration; `prepare` script sets `core.hooksPath` to `.contextkit/hooks`; `.gitignore` updated for `.contextkit/` and `.cursor/`.
- Performance: `component-mapping` — `NATIVE_TAGS` is now a module-level `Set` (was recreated as an array on every `getElementRoleFromJSX` call); `includes()` replaced with `Set.has()` for O(1) lookups.
- Performance: `event-utils` — JSX handler checks now do a single pass over `node.attributes` against a module-level `Set` instead of N passes (one per handler name); `hasJSXEventHandler` uses a unified `JSX_ALL_HANDLERS_SET`. Vue handler checks use precomputed event-name `Set`s, eliminating per-call regex in the inner loop.
- Performance: `runtime-comment` — `getAllComments()` is now cached per file via `WeakMap` (was called once per node); cached comments are sorted by position so the proximity scan exits early once past the node.

### Fixed
- CI: integration tests (config-presets, formatter-output) resolve dist path from `GITHUB_WORKSPACE` (when set) or test file location for reliable runs in GitHub Actions.

## [0.16.1] - 2026-02-26

### Fixed
- Build: suppress tsup/esbuild `commonjs-variable-in-esm` warning so CI build completes without warnings

---

## [0.16.0] - 2026-02-23

### Added
- 3 new accessibility rules (total: 43 rules)
  - `prefer-tag-over-role` — recommends using semantic native HTML elements instead of ARIA roles on generic elements (e.g. `<div role="button">` → use `<button>`); strict-only, not in recommended
  - `control-has-associated-label` — enforces that elements with interactive ARIA roles (not already covered by `button-label`/`form-label`) have an accessible label via `aria-label`, `aria-labelledby`, `title`, or text content
  - `scope` — validates the `scope` attribute: only valid on `<th>`, and the value must be one of `col`, `row`, `colgroup`, `rowgroup`

### Changed
- Added component mapping support (`getElementRoleFromJSX`) to `no-interactive-element-to-noninteractive-role`, `no-noninteractive-element-to-interactive-role`, and `no-redundant-roles` so design-system components are correctly resolved
- `recommended` config grows from 28 → 30 rules (new: `control-has-associated-label` as error, `scope` as error)
- `strict` config grows from 40 → 43 rules (all 3 new rules as error)

---

## [0.15.0] - 2026-02-23

### Added
- 4 new accessibility rules (total: 40 rules)
  - `anchor-is-valid` — anchors must have a real href; flags empty `""`, `"#"`, and `javascript:` hrefs, and onClick-without-href (prefer `<button>`)
  - `no-interactive-element-to-noninteractive-role` — prevents `role="none"` or `role="presentation"` on interactive elements (`button`, `a[href]`, `input`, `select`, `textarea`, `summary`)
  - `no-noninteractive-element-to-interactive-role` — prevents interactive ARIA roles (button, link, checkbox, etc.) on non-interactive elements without both `tabIndex` and a keyboard event handler
  - `no-redundant-roles` — flags explicit `role` attributes that match the element's implicit ARIA role (e.g. `<button role="button">`, `<nav role="navigation">`) with auto-fix suggestion

### Fixed
- `image-alt` now also checks `<input type="image">` and `<area>` elements, not just `<img>`; empty alt on `<area>` without `href` is correctly allowed
- `link-text` no longer false-positives on `<a><img alt="Home" /></a>` — an img child with a non-empty alt provides an accessible name for the link
- `form-label` no longer false-positives when a form control has an `id` but its `<label for>` is in a different component file; presence of `id` is now treated as sufficient (label association may be elsewhere)

### Changed
- `recommended` config grows from 24 → 28 rules (new: `anchor-is-valid` as error, `no-interactive-element-to-noninteractive-role` as error, `no-noninteractive-element-to-interactive-role` as warn, `no-redundant-roles` as warn)
- `strict` config grows from 36 → 40 rules (all new rules set to error)
- Updated `config-presets.test.ts` rule counts (recommended: 28, strict: 40)

---

### Fixed (from 0.14.0 unreleased)
- Fixed `./core` CJS export — `require('eslint-plugin-test-a11y-js/core')` now correctly exports `A11yChecker` instead of the ESLint plugin
- Fixed `bin/eslint-with-progress.js` to work with both ESLint v8 and v9 (removed deprecated `useEslintrc` and `extensions` options)
- Removed `vitest` from `peerDependencies` (should only be in devDependencies)
- Replaced `TODO:` placeholder text in `link-text` autofix suggestions with user-friendly text

### Changed (from 0.14.0 unreleased)
- Updated `plugin-structure.test.ts` to verify all 40 rules
- Enhanced `build-verification.test.ts` with formatter/formatter-progress file checks and export-to-disk validation
- Rewrote `rule-structure.test.ts` to dynamically cover all rule files
- Rewrote `config-presets.test.ts` to test built plugin with exact rule counts (minimal: 3, recommended: 28, strict: 40)
- Expanded `test:core` pipeline with config-presets, flat-config, plugin-structure, and all new integration tests
- Clarified recommended config comment about excluded rules (no longer "temporarily disabled")

### Added (from 0.14.0 unreleased)
- `package-publish-readiness.test.ts` — comprehensive publish gate covering npm pack contents, CJS require, export content validation, rule loading, version consistency, and package.json field checks
- `formatter-output.test.ts` — functional tests for formatter and formatter-with-progress output
- `bin-smoke.test.ts` — smoke test for bin/eslint-with-progress.js (shebang, syntax, structure)
- `core-export.test.ts` — integration test for ./core export path with A11yChecker runtime validation

## [0.13.0] - 2025-05-01

### Added
- 20 new accessibility rules (total: 36 rules)
  - Phase 1: `no-access-key`, `no-autofocus`, `tabindex-no-positive`, `no-distracting-elements`, `lang`
  - Phase 2: `no-aria-hidden-on-focusable`, `no-role-presentation-on-focusable`
  - Phase 3: `click-events-have-key-events`, `mouse-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions`, `interactive-supports-focus`
  - Phase 4: `no-noninteractive-tabindex`, `autocomplete-valid`, `aria-activedescendant-has-tabindex`, `heading-has-content`
  - Phase 5: `anchor-ambiguous-text`, `img-redundant-alt`, `accessible-emoji`, `html-has-lang`

## [0.12.0] - 2025-04-01

### Added
- Phase 3: Static + Runtime Workflow Integration
- Phase 2: Suggestions and AST-first rule reintroduction
- Phase 1: Rule configurability, component mapping, and flat config support
- Polymorphic prop support (`as`, `component`)
- Design system component mapping via settings

### Changed
- Updated recommended and strict config presets to include new rules

## [0.11.0] - 2025-03-01

### Added
- Custom ESLint formatter with summary output
- Progress-aware ESLint wrapper (`bin/eslint-with-progress.js`)
- Comprehensive E2E CLI testing infrastructure

### Fixed
- Handle `JSXSpreadAttribute` in all 13 ESLint rules
- Add `JSXIdentifier` type guards to all rules

## [0.10.0] - 2025-02-01

### Changed
- Major architecture refactor: pure AST-first ESLint rules (removed jsdom/A11yChecker dependency from linter)
- Dual API design: ESLint plugin for static analysis, A11yChecker for runtime

### Added
- `fieldset-legend`, `table-structure`, `details-summary`, `video-captions`, `audio-captions`, `landmark-roles`, `dialog-modal`, `aria-validation`, `semantic-html`, `form-validation` rules

## [0.4.0] - 2024-12-01

### Added
- ESLint plugin with initial 6 rules: `image-alt`, `button-label`, `link-text`, `form-label`, `heading-order`, `iframe-title`
- Recommended, strict, react, and vue config presets
- `prepublishOnly` pre-check script

## [0.1.0] - 2024-10-01

### Added
- Initial release
- A11yChecker runtime API for programmatic accessibility testing
- Vitest integration with happy-dom
