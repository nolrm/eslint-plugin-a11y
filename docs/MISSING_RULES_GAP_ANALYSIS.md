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
| `accessible-emoji` | `accessible-emoji` | ✅ Dedicated rule |
| `anchor-ambiguous-text` | `anchor-ambiguous-text` | ✅ Dedicated rule (distinct from `link-text`'s denylist) |
| `anchor-is-valid` | `anchor-is-valid` | ✅ Dedicated rule validates href presence/patterns (`javascript:`, `#`, empty); see also `link-text` for descriptive text. Also supports `specialLink` (alternate href-equivalent props, e.g. router `to`) and `aspects` (toggle individual checks) options. |
| `anchor-has-content` | `link-text` | ✅ Empty/descriptive text covered |
| `aria-props` | `aria-validation` | ✅ AST-based |
| `aria-proptypes` | `aria-validation` | ✅ |
| `aria-role` | `aria-validation` | ✅ |
| `aria-unsupported-elements` | `aria-validation` | ✅ |
| `heading-has-content` | `heading-has-content` | ✅ Dedicated rule; separate from `heading-order`, which checks hierarchy (skip levels) rather than empty content. |
| `iframe-has-title` | `iframe-title` | ✅ |
| `img-redundant-alt` | `img-redundant-alt` | ✅ Flags redundant words in alt text (e.g. “image”, “photo”, “picture”) via a maintained default word list, configurable via options. |
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

## Remaining Gaps (Post-1.0)

Everything previously tracked in this section as "missing" (`html-has-lang`, `lang`, `no-access-key`, `no-autofocus`, `no-distracting-elements`, `no-aria-hidden-on-focusable`, `no-role-presentation-on-focusable`, `tabindex-no-positive`, `no-noninteractive-tabindex`, `autocomplete-valid`, `aria-activedescendant-has-tabindex`, `click-events-have-key-events`, `mouse-events-have-key-events`, `no-static-element-interactions`, `no-noninteractive-element-interactions`, `interactive-supports-focus`, `control-has-associated-label`, `anchor-ambiguous-text`, `accessible-emoji`, `heading-has-content`, `img-redundant-alt`, `anchor-is-valid`) has been implemented — see "Rules We Already Cover" above and [MIGRATION_FROM_JSX_A11Y.md](./MIGRATION_FROM_JSX_A11Y.md) for the full mapping.

**Genuinely still not implemented** (low priority, by design):

| Rule | Plugin(s) | Notes |
|------|-----------|-------|
| **no-onchange** | jsx-a11y, vuejs-a11y | Prefer `onBlur` over `onChange` for `<select>`. Low priority and controversial — conflicts with modern UI/framework expectations; jsx-a11y itself treats it as edge-case. |
| **label-has-for** | jsx-a11y | Legacy "label has `for`" rule, often disabled in jsx-a11y's own recommended config. Our `form-label` already covers "control has label" from the other direction. |

**Other known gaps** (found via a later jsx-a11y/vuejs-accessibility comparison pass, not part of the original 16→43 rule work):

- `anchor-is-valid` has `specialLink`/`aspects` options (added — see above) but no shared `settings['a11y'].attributes` mechanism for aliasing arbitrary attribute names across *all* rules (jsx-a11y has this). Would be a larger, separate cross-rule change if wanted.
- No dedicated per-rule documentation website (vuejs-accessibility-style); rule docs live in Markdown only (`docs/ESLINT_PLUGIN.md`, `docs/CONFIGURATION.md`). DX/discoverability nice-to-have, not a correctness gap.

---

## References

- [eslint-plugin-jsx-a11y rules](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/main/docs/rules)
- [eslint-plugin-vuejs-accessibility rule overview](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rule-overview/)
- [Migration from jsx-a11y](./MIGRATION_FROM_JSX_A11Y.md) (current mapping)
- [ESLint plugin rule list](./ESLINT_PLUGIN.md) (plugin rules)
