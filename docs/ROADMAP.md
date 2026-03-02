# Roadmap

This document outlines the planned features and improvements for `eslint-plugin-test-a11y-js`.

## 1.0 and current state

**Current release:** 0.17.0. **1.0.0** is planned after 0.17.0 is validated (see [ROADMAP_1.0.md](./ROADMAP_1.0.md) for the release plan and final gates).

- **43 rules** are implemented and registered. Presets: **minimal** (3 rules), **recommended** (30 rules), **strict** (43 rules). Flat config and classic config are supported.
- **Static + runtime workflow:** Runtime comment convention and A11yChecker API allow combining ESLint with programmatic checks.
- **Vue and React:** Full support for JSX/TSX and Vue SFCs; component mapping and polymorphic props supported.

Post-1.0 intentions (not in 1.0 scope) are summarized below. Deeper integration with ESLint v9+ language APIs, cross-file ARIA ID resolution, and expanded autofix are tracked as future work.

## Historical implementation phases (reference)

### Phase 1: Static Validation (v0.8.0) - ✅ Completed
**Completion Date:** 2024-12-22  
**See:** [Detailed Implementation Plan](./IMPLEMENTATION_PLAN.md)

- ✅ Comprehensive ARIA validation, semantic HTML validation, form validation messages.

### Phase 2: Runtime Validation (v0.9.0) - Post-1.0
**Status:** Research / post-1.0

- Keyboard navigation testing, focus visible indicators — programmatic API only, not ESLint compatible.

## Post-1.0 intentions (not in 1.0 scope)

- **Autofix:** Expand autofix for rules that currently offer suggestions only (e.g. `no-redundant-roles`, `no-autofocus`).
- **Cross-file ID resolution:** `aria-labelledby` / `aria-describedby` resolution across files is out of scope for 1.0; may be revisited post-1.0.
- **Contextual rules:** `html-has-lang` and `lang` fire only when `<html>` is in scope; documentation sets realistic expectations.
- **ESLint v9+ language plugin:** Deeper integration with future ESLint language plugin APIs is post-1.0.
- **Color contrast / keyboard / focus-visible:** Require CSS or runtime analysis; not part of the current plugin scope.

See [ROADMAP_1.0.md](./ROADMAP_1.0.md) Track E for the full list of post-1.0 items.

## Reference Sources

When implementing new rules, refer to these authoritative sources:

### Primary Sources
1. **WCAG 2.1 Guidelines**
   - URL: https://www.w3.org/WAI/WCAG21/quickref/
   - Use for: Accessibility requirements and success criteria

2. **ARIA Authoring Practices Guide (APG)**
   - URL: https://www.w3.org/WAI/ARIA/apg/
   - Use for: ARIA patterns, roles, and properties

3. **MDN Web Docs**
   - URL: https://developer.mozilla.org/en-US/docs/Web/Accessibility
   - Use for: HTML element accessibility requirements

4. **WAI-ARIA Specification**
   - URL: https://www.w3.org/TR/wai-aria-1.2/
   - Use for: ARIA attributes and roles

### Secondary Sources
5. **eslint-plugin-jsx-a11y**
   - URL: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
   - Use for: Rule patterns and implementation examples

6. **axe-core Rules**
   - URL: https://github.com/dequelabs/axe-core/tree/develop/doc/rule-descriptions
   - Use for: Rule descriptions and test cases

7. **WebAIM**
   - URL: https://webaim.org/
   - Use for: Practical accessibility guidance

## Implementation Checklist

For each new rule, follow this checklist:

### 1. Research & Documentation
- [ ] Review WCAG guidelines for element/pattern
- [ ] Check ARIA Authoring Practices Guide
- [ ] Review MDN documentation
- [ ] Check existing ESLint plugins (eslint-plugin-jsx-a11y) for patterns
- [ ] Document requirements in this roadmap

### 2. Core Implementation
- [ ] Add check method to `A11yChecker` class
- [ ] Create ESLint rule file
- [ ] Add rule to plugin index
- [ ] Update `checks.json` (move from notSupported to supported)

### 3. Framework Support
- [ ] Test with JSX
- [ ] Test with Vue templates
- [ ] Test with HTML strings

### 4. Configuration
- [ ] Add to recommended config
- [ ] Add to strict config
- [ ] Verify React and Vue configs inherit correctly

### 5. Testing
- [ ] Unit tests for core check method
- [ ] ESLint rule structure tests
- [ ] Integration tests
- [ ] Real-world examples

### 6. Documentation
- [ ] Update rule documentation
- [ ] Add examples to EXAMPLES.md
- [ ] Update checks.json
- [ ] Update README if needed

## Contributing

If you'd like to contribute by implementing one of these features:

1. Check the roadmap for priority items
2. Create an issue to discuss the implementation
3. Follow the implementation checklist
4. Submit a pull request with tests and documentation

## Notes

- **Complexity estimates** are rough and may vary based on implementation details
- **Priority** is based on impact and frequency of violations
- **Time estimates** assume working on one feature at a time
- Some features may require additional dependencies or build configuration changes

---

**Last Updated:** 2026-03  
**Current Version:** 0.17.0 — 1.0.0 planned after validation; see [ROADMAP_1.0.md](./ROADMAP_1.0.md).

