# Gap Analysis: Missing Rules vs jsx-a11y + vuejs-accessibility

> **Historical document.** This analysis was written when the plugin had a **16-rule baseline**. As of 1.0, the plugin ships **43 rules** and achieves broad parity with jsx-a11y. See **Current state** below and [MIGRATION_FROM_JSX_A11Y.md](./MIGRATION_FROM_JSX_A11Y.md) for the authoritative mapping.

This document lists what **eslint-plugin-a11y** was missing compared to **eslint-plugin-jsx-a11y** and **eslint-plugin-vuejs-accessibility**. It is retained for roadmap context and contribution prioritization of post-1.0 work.

---

## Current state (1.0)

- **43 rules** are implemented and registered. All rules previously listed in this doc as "missing" static/event/keyboard rules are now implemented: `no-access-key`, `no-autofocus`, `tabindex-no-positive`, `no-distracting-elements`, `click-events-have-key-events`, `mouse-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions`, `interactive-supports-focus`, `no-noninteractive-tabindex`, `aria-activedescendant-has-tabindex`, `heading-has-content`, `html-has-lang`, `anchor-is-valid`, `no-interactive-element-to-noninteractive-role`, `no-noninteractive-element-to-interactive-role`, `no-redundant-roles`, `prefer-tag-over-role`, `control-has-associated-label`, `scope`, `img-redundant-alt`, and related rules.
- **Intentionally out of scope** for the ESLint plugin (use A11yChecker or other tools): cross-file `aria-labelledby`/`aria-describedby` resolution, full keyboard/focus runtime checks, color-contrast.

---

## Scope (historical baseline)

- **Baseline:** At the time of writing, the plugin had **16 rules** (image-alt, button-label, link-text, form-label, heading-order, iframe-title, fieldset-legend, table-structure, details-summary, video-captions, audio-captions, landmark-roles, dialog-modal, aria-validation, semantic-html, form-validation).
- **Comparison:** jsx-a11y has **38 rules**; vuejs-accessibility has **23 rules** (many overlapping jsx-a11y). This doc covered every rule from both that we did **not** fully replace at that time.

---

## Summary

| Category | Count | Effort | Notes |
|----------|-------|--------|-------|
| **Static rules (easy to add)** | 12 | Low–medium | No runtime; AST-only checks |
| **Event / keyboard rules** | 5 | Medium | Static “if onClick then onKeyDown” pattern in other plugins; see “Feasibility” and false-positive notes |
| **Vue-only rules** | 2 | Low | No-aria-hidden-on-focusable, no-role-presentation-on-focusable (also in jsx-a11y) |
| **Already covered or N/A** | — | — | See “Covered” section below |

**Feasibility (AST certainty):** Not all rules are equally reliable from JSX/Vue AST alone. We use three buckets when prioritizing:

| Bucket | Description | Examples |
|--------|-------------|----------|
| **Deterministic AST** | Attribute presence, numeric tabindex, forbidden attributes. Clear true/false from AST. | no-access-key, no-autofocus, tabindex-no-positive |
| **Heuristic AST** | Focusable detection, “interactive” classification, emoji detection. May have false positives/negatives. | no-aria-hidden-on-focusable, click-events-have-key-events, accessible-emoji |
| **Contextual** | Document root, cross-file idrefs. Depends on which files are linted; can be noisy or never fire. | html-has-lang, lang |

---

## Rules We Already Cover

These jsx-a11y / vuejs-accessibility rules are covered by existing a11y rules (same or broader behavior). Mappings are conservative: we only claim “covered” when semantics match; otherwise we call out partial or missing.

| Their rule | Our rule(s) | Notes |
|------------|------------|-------|
| `alt-text` | `image-alt` | ✅ Plus decorative-image options |
| `anchor-is-valid` | — | ⚠️ **Partially covered.** jsx-a11y validates *href* usage and patterns (valid href, no `javascript:`, etc.). Our `link-text` covers *descriptive* link text and denylist phrases only. We do **not** validate href usage/patterns. Mark as missing unless we add href checks. |
| `anchor-has-content` | `link-text` | ✅ Empty/descriptive text covered |
| `aria-props` | `aria-validation` | ✅ AST-based |
| `aria-proptypes` | `aria-validation` | ✅ |
| `aria-role` | `aria-validation` | ✅ |
| `aria-unsupported-elements` | `aria-validation` | ✅ |
| `heading-has-content` | — | ❌ **Missing.** jsx-a11y checks that headings are *not empty*. Our `heading-order` checks *hierarchy* (skip levels), not empty content. Different signals; hierarchy does not reliably detect empty headings. Consider a sub-check in the heading rule or a separate rule. |
| `iframe-has-title` | `iframe-title` | ✅ |
| `img-redundant-alt` | — | ❌ **Missing / optional.** jsx-a11y flags *redundant* alt text (e.g. “image”, “photo”, “picture of”). We do not implement redundant-text heuristics. Our `image-alt` handles *empty* alt only. Low priority unless we add a maintained list. |
| `label-has-associated-control` | `form-label` | ✅ |
| `media-has-caption` | `video-captions`, `audio-captions` | ✅ Split by element |
| `no-interactive-element-to-noninteractive-role` | `semantic-html` | ✅ |
| `no-noninteractive-element-to-interactive-role` | `semantic-html` | ✅ |
| `no-redundant-roles` | `semantic-html` | ✅ |
| `prefer-tag-over-role` | `semantic-html` | ✅ Prefer native elements |
| `role-has-required-aria-props` | `aria-validation` | ✅ |
| `role-supports-aria-props` | `aria-validation` | ✅ |
| `scope` | `table-structure` | ✅ |
| `form-control-has-label` (Vue) | `form-label` | ✅ Same concept |

---

## Missing Rules: Static (Good Candidates to Add)

These are purely static checks (no runtime DOM). Other plugins implement them in ESLint; we currently do not.

**Reclassified from “covered”:** The following are now explicitly called out as missing or partial: **anchor-is-valid** (we do not validate href usage/patterns), **heading-has-content** (we check hierarchy only, not empty headings), **img-redundant-alt** (we do not flag redundant alt text like “image”/“photo”). See “Covered” section for details.

### Document / document root

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **html-has-lang** | jsx-a11y, vuejs-a11y | Root `<html>` has a `lang` attribute | Medium | **Contextual** |
| **lang** | jsx-a11y | `lang` attribute has a valid value (e.g. BCP 47) | Medium | **Contextual** |

**Reality check:** These rules are **only meaningful when linting HTML or template sources that actually contain `<html>`**. In practice:

- **React:** `<html lang>` usually lives in `index.html` (Vite, Next, CRA). ESLint running on JSX/TSX will not see it.
- **Vue SFCs:** Templates typically do not include `<html>`.

A pure AST rule can therefore be **noisy** (no `<html>` in scope → warn everywhere) or **useless** (never triggers). Options:

- Implement only when `<html>` is present (no global “must have lang” requirement), **or**
- Run only for `.html` or specific file globs, **or**
- Document as “use when linting HTML entry points” and accept limited applicability.

**Note:** jsx-a11y’s own docs state that `html-has-lang` is largely superseded by `lang`. Implementing `lang` (validate value when present) and skipping `html-has-lang` is a reasonable choice.

---

### Prohibited attributes / elements

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **no-access-key** | jsx-a11y, vuejs-a11y | Disallow `accesskey` (keyboard conflict with AT/browser) | High | Deterministic AST |
| **no-autofocus** | jsx-a11y, vuejs-a11y | Disallow `autofocus` | High | Deterministic AST |
| **no-distracting-elements** | jsx-a11y, vuejs-a11y | Disallow `<blink>`, `<marquee>` | Medium | Deterministic AST |

**Implementation note:** Straightforward AST: disallow specific attribute names or tag names.

---

### ARIA misuse on focusable elements

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **no-aria-hidden-on-focusable** | jsx-a11y, vuejs-a11y | Disallow `aria-hidden="true"` on focusable elements (button, a[href], input, [tabindex], etc.) | High | Heuristic AST |
| **no-role-presentation-on-focusable** | vuejs-a11y | Disallow `role="presentation"` (or `none`) on focusable elements | High | Heuristic AST |

**Implementation note:** Focusable = native focusable tags + presence of `tabindex` (except `-1`). Can be done in AST with component mapping for custom components.

---

### Tabindex

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **tabindex-no-positive** | jsx-a11y, vuejs-a11y | Disallow `tabindex` > 0 | High | Deterministic AST |
| **no-noninteractive-tabindex** | jsx-a11y, vuejs-a11y | Disallow `tabindex` on non-interactive elements unless in an allowlisted role (e.g. tabpanel) | Medium | Heuristic AST |

**Implementation note:** Static: read `tabindex` value; classify element as interactive or not (tag + role). jsx-a11y allows options (e.g. `roles: ['tabpanel']`).

---

### Forms / inputs

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **autocomplete-valid** | jsx-a11y | `autocomplete` on `input` must be a valid token (e.g. `email`, `street-address`, `off`) | Medium | Deterministic AST (needs maintained token list) |
| **no-onchange** | jsx-a11y, vuejs-a11y | Prefer `onBlur` over `onChange` for `<select>` (better for keyboard users) | Low / optional | Deterministic AST |

**Implementation notes:**

- **autocomplete-valid:** Requires a **maintained token list** (or dependency on a spec/registry). Make the source of truth and update policy explicit (e.g. WCAG/HTML spec, or a small vendored list with a doc on keeping it current).
- **no-onchange:** Low priority and **controversial**; can conflict with modern UI expectations and framework behavior. Keep optional; document that runtime/A11yChecker may be a better fit for some teams.

---

### ARIA / roles

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **aria-activedescendant-has-tabindex** | jsx-a11y | If element has `aria-activedescendant`, it should have `tabindex` (so it can receive focus) | Medium | Deterministic AST |

**Implementation note:** When `aria-activedescendant` is present, require `tabindex` (e.g. 0 or -1 depending on pattern).

---

### Links and text

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **anchor-ambiguous-text** | jsx-a11y | Flag link text that is ambiguous (e.g. “read more”, “click here”, “here”) | Low | Heuristic AST |
| **accessible-emoji** | jsx-a11y | Emoji must have `role="img"` and accessible name (e.g. aria-label or wrapped in span with role) | Low | Heuristic AST |

**Implementation note:** anchor-ambiguous-text: we already have denylist in `link-text`; could align with jsx-a11y’s list or add as separate rule. accessible-emoji: detect emoji in text (or certain chars) and require role="img" + accessible name.

---

## Missing Rules: Event / Keyboard (Static Pattern in Other Plugins)

These are implemented as **static** “if you have handler X, you must have handler Y” or “this element shouldn’t have these handlers” in jsx-a11y and vuejs-accessibility. We currently document them as “runtime-only” and do not implement them.

| Rule | Plugin(s) | What it checks | Priority | Feasibility |
|------|-----------|----------------|----------|-------------|
| **click-events-have-key-events** | jsx-a11y, vuejs-a11y | If `onClick` (or equivalent) is present, require at least one of `onKeyDown` / `onKeyUp` / `onKeyPress` (or equivalent) | High | Heuristic AST |
| **mouse-events-have-key-events** | jsx-a11y, vuejs-a11y | Same for mouse handlers: `onMouseDown`, `onMouseUp`, etc. | High | Heuristic AST |
| **no-static-element-interactions** | jsx-a11y, vuejs-a11y | “Static” elements (e.g. `div`, `span`) should not have interactive handlers (onClick, etc.) unless allowlisted | Medium | Heuristic AST |
| **no-noninteractive-element-interactions** | jsx-a11y, vuejs-a11y | Non-interactive elements (by tag/role) should not have certain handlers, with allowlists (e.g. dialog, img) | Medium | Heuristic AST |
| **interactive-supports-focus** | jsx-a11y, vuejs-a11y | Elements with interactive roles (button, link, etc.) must be focusable (native or `tabindex` not negative) | Medium | Heuristic AST |

**False-positive risk:** With AST-only analysis and design-system component mapping, these rules can get **noisy**:

- Many click handlers live on elements not intended to be keyboard-interactive (analytics wrappers, layout divs, overlay backdrops).
- Custom components may handle keyboard internally; the AST only sees props like `onClick`.

**Recommendations:**

- **Ship with options/allowlists from day one:** `ignoreRoles`, `ignoreComponents`, `handlers` allowlist, etc., so teams can tune without disabling the rule.
- **Encourage the “runtime checked” workflow** as an escape hatch: we already have A11yChecker and the runtime-comment convention. Document that for “is this div really keyboard-accessible?” the static rule can warn, and runtime tests or manual checks can confirm. Avoid implying the ESLint rule alone is sufficient for keyboard coverage.

---

## Optional / Nuance

| Rule | Plugin(s) | Notes |
|------|-----------|-------|
| **control-has-associated-label** | jsx-a11y | Requires that “controls” (e.g. `alert`, `dialog`) have an accessible name. We cover dialog in `dialog-modal` and ARIA in `aria-validation`; a dedicated rule could mirror jsx-a11y’s `includeRoles` / `ignoreRoles`. |
| **label-has-for** | jsx-a11y | Legacy “label has `for`” rule; often off in jsx-a11y. Our `form-label` covers “control has label” from the other direction. Optional. |

---

## Vue-Only Considerations

- **vuejs-accessibility** brings the same conceptual rules as jsx-a11y to Vue (alt-text, aria-*, no-autofocus, etc.). The only Vue-specific rules we lack are:
  - **no-aria-hidden-on-focusable** (also in jsx-a11y)
  - **no-role-presentation-on-focusable**
- Supporting Vue means ensuring each new rule has a **Vue AST path** (e.g. `vue-eslint-parser`, template attributes) in addition to JSX.
- **Flat config / ESLint v9:** vuejs-accessibility already supports flat config and documents ESLint v9 usage. Parity here (same DX for Vue users on flat config) is part of our roadmap.

---

## Implementation Priority (Suggested)

1. **High value, low effort (deterministic AST):**  
   `no-access-key`, `no-autofocus`, `no-aria-hidden-on-focusable`, `no-role-presentation-on-focusable`, `tabindex-no-positive`.

2. **High value, medium effort:**  
   `click-events-have-key-events`, `mouse-events-have-key-events` (with allowlists from day one), `no-distracting-elements`, `lang` (when `lang` is present; see document-root reality check).

3. **Medium:**  
   `no-noninteractive-tabindex`, `autocomplete-valid` (with maintained token list), `aria-activedescendant-has-tabindex`, `no-static-element-interactions`, `no-noninteractive-element-interactions`, `interactive-supports-focus`.

4. **Contextual / limited applicability:**  
   `html-has-lang`, `lang` — only when linting HTML or templates that contain `<html>`; consider “check only if present” or separate glob.

5. **Lower / optional:**  
   `anchor-ambiguous-text`, `accessible-emoji`, `no-onchange`, `heading-has-content` (empty-heading check), `img-redundant-alt`, `control-has-associated-label`, `label-has-for`. Add **anchor-is-valid** (href validation) if we want full jsx-a11y parity.

---

## References

- [eslint-plugin-jsx-a11y rules](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/main/docs/rules)
- [eslint-plugin-vuejs-accessibility rule overview](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rule-overview/)
- [Migration from jsx-a11y](./MIGRATION_FROM_JSX_A11Y.md) (current mapping)
- [ESLint plugin rule list](./ESLINT_PLUGIN.md) (plugin rules)
