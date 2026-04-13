# Testing Checklist

This document tracks testing improvements and coverage for `a11y`.

## ✅ Completed

- [x] Core A11yChecker unit tests (all 13 check methods)
- [x] ESLint rule structure tests (all rules)
- [x] Vue AST utilities tests
- [x] Basic React/JSX tests
- [x] Real-world component examples
- [x] ArticleCard Vue component test
- [x] Test fixtures library (test-fixtures.ts)
- [x] Test helpers library (test-helpers.ts)
- [x] Testing checklist document

## ⚠️ Known Issues

### Module Resolution in Tests
- RuleTester tests have module resolution issues with vitest
- This is a known limitation documented in TESTING.md
- Workaround: Use structure tests (file reading) or integration tests with built plugin
- Status: Needs investigation for proper fix

## 🔥 High Priority (Immediate)

### Missing ESLint Rule Tests
- [x] `iframe-title-rule.test.ts` - ESLint rule tests for iframe-title
- [x] `landmark-roles-rule.test.ts` - ESLint rule tests for landmark-roles
- [x] `dialog-modal-rule.test.ts` - ESLint rule tests for dialog-modal

### Vue Integration Tests
- [x] Vue SFC (Single File Component) tests with `<template>`, `<script>`, `<style>`
- [x] Vue 3 Composition API scenarios
- [x] Vue dynamic props and computed attributes
- [x] Vue slots and conditional rendering
- [x] Vue v-if, v-for, v-show patterns

### React Advanced Scenarios
- [x] React hooks components (useState, useEffect patterns)
- [x] React functional components with props
- [x] React fragments (`<>...</>`)
- [x] React conditional rendering patterns
- [x] TypeScript React with interfaces/types
- [x] React children patterns

### Configuration Preset Tests
- [x] Minimal config preset tests
- [x] Recommended config preset tests
- [x] Strict config preset tests
- [x] React config preset tests
- [x] Vue config preset tests

## 📋 Short Term (Medium Priority)

### Complex Scenarios
- [x] Nested components (components within components)
- [x] Dynamic component rendering
- [x] Template literals with expressions
- [x] Complex form scenarios (nested forms, fieldset groups)
- [x] Table with merged cells (colspan/rowspan)
- [x] Multiple landmarks on same page
- [x] Dialog with focus trap scenarios
- [x] Video/audio with multiple tracks

### Error Handling Tests
- [x] Malformed AST handling
- [x] Missing dependencies (jsdom) graceful fallback
- [x] Invalid parser configurations
- [x] Edge cases (null, undefined, empty strings)

### Performance Tests
- [x] Large file performance (1000+ lines)
- [x] Many violations performance
- [x] ESLint cache effectiveness
- [x] Memory usage tests

### Coverage Reporting
- [x] Set up vitest coverage configuration
- [x] Generate coverage reports
- [x] Set coverage thresholds
- [x] Track coverage over time

## 🎯 Long Term (Nice to Have)

### E2E Testing
- [ ] Full plugin execution tests with actual ESLint
- [ ] Real project integration tests
- [ ] CI/CD simulation tests
- [ ] Multiple ESLint versions compatibility

### Advanced Testing
- [ ] Visual regression tests (if applicable)
- [ ] Accessibility testing of the testing tool itself
- [ ] Cross-browser testing (if applicable)
- [ ] Performance benchmarking suite

### Test Infrastructure
- [ ] Shared test fixtures library
- [ ] Reusable component examples
- [ ] Test data generators
- [ ] Mock ESLint environments

## 🛠️ Test Quality Improvements

### Test Organization
- [x] Group by framework (React, Vue, HTML)
- [x] Separate unit vs integration clearly
- [ ] Create test utilities/helpers
- [ ] Standardize test file naming

### Test Data
- [ ] Create shared test fixtures
- [ ] Reusable component examples
- [ ] Test data generators
- [ ] Mock data factories

### Assertions
- [ ] More specific error message checks
- [ ] Verify exact violation locations
- [ ] Test violation ordering
- [ ] Test impact levels

### Documentation
- [ ] Document test patterns
- [ ] Add examples for contributors
- [ ] Create testing guide
- [ ] Document test utilities

## 📊 Test Coverage Goals

### Current Coverage
- Core A11yChecker: ~95%
- ESLint Rules: ~70% (missing 3 rule tests)
- Vue Integration: ~40% (basic only)
- React Integration: ~50% (basic only)
- Config Presets: ~0% (not tested)

### Target Coverage
- Core A11yChecker: 100%
- ESLint Rules: 100%
- Vue Integration: 80%
- React Integration: 80%
- Config Presets: 100%
- Overall: 85%+

## Notes

- High priority items should be completed before v0.8.0
- Short term items can be done incrementally
- Long term items are aspirational improvements
- Test quality improvements should be ongoing

