/**
 * ESLint plugin for a11y
 *
 * Provides accessibility linting rules for React, Vue, and HTML components.
 *
 * @example
 * ```javascript
 * // .eslintrc.js
 * module.exports = {
 *   plugins: ['a11y'],
 *   extends: ['plugin:a11y/recommended']
 * }
 * ```
 */

import type { ESLint } from 'eslint'
import minimal from './configs/minimal'

// Version is injected at build time from package.json
declare const __PACKAGE_VERSION__: string
import recommended from './configs/recommended'
import strict from './configs/strict'
import react from './configs/react'
import vue from './configs/vue'
import * as flatConfigs from './configs/flat'
import imageAlt from './rules/image-alt'
import buttonLabel from './rules/button-label'
import linkText from './rules/link-text'
import formLabel from './rules/form-label'
import headingOrder from './rules/heading-order'
import iframeTitle from './rules/iframe-title'
import fieldsetLegend from './rules/fieldset-legend'
import tableStructure from './rules/table-structure'
import detailsSummary from './rules/details-summary'
import videoCaptions from './rules/video-captions'
import audioCaptions from './rules/audio-captions'
import landmarkRoles from './rules/landmark-roles'
import dialogModal from './rules/dialog-modal'
import ariaValidation from './rules/aria-validation'
import semanticHTML from './rules/semantic-html'
import formValidation from './rules/form-validation'
// Phase 1: Simple attribute rules
import noAccessKey from './rules/no-access-key'
import noAutofocus from './rules/no-autofocus'
import tabindexNoPositive from './rules/tabindex-no-positive'
import noDistractingElements from './rules/no-distracting-elements'
import lang from './rules/lang'
// Phase 2: Focusable element rules
import noAriaHiddenOnFocusable from './rules/no-aria-hidden-on-focusable'
import noRolePresentationOnFocusable from './rules/no-role-presentation-on-focusable'
// Phase 3: Event/keyboard rules
import clickEventsHaveKeyEvents from './rules/click-events-have-key-events'
import mouseEventsHaveKeyEvents from './rules/mouse-events-have-key-events'
import noStaticElementInteractions from './rules/no-static-element-interactions'
import noNoninteractiveElementInteractions from './rules/no-noninteractive-element-interactions'
import interactiveSupportsFocus from './rules/interactive-supports-focus'
// Phase 4: Medium-priority rules
import noNoninteractiveTabindex from './rules/no-noninteractive-tabindex'
import autocompleteValid from './rules/autocomplete-valid'
import ariaActivedescendantHasTabindex from './rules/aria-activedescendant-has-tabindex'
import headingHasContent from './rules/heading-has-content'
// Phase 5: Optional rules
import anchorAmbiguousText from './rules/anchor-ambiguous-text'
import imgRedundantAlt from './rules/img-redundant-alt'
import accessibleEmoji from './rules/accessible-emoji'
import htmlHasLang from './rules/html-has-lang'
// Phase 6: New rules (parity with jsx-a11y + bug fixes)
import anchorIsValid from './rules/anchor-is-valid'
import noInteractiveElementToNoninteractiveRole from './rules/no-interactive-element-to-noninteractive-role'
import noNoninteractiveElementToInteractiveRole from './rules/no-noninteractive-element-to-interactive-role'
import noRedundantRoles from './rules/no-redundant-roles'
import preferTagOverRole from './rules/prefer-tag-over-role'
import controlHasAssociatedLabel from './rules/control-has-associated-label'
import scope from './rules/scope'

/**
 * ESLint plugin for accessibility checking
 */
const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-a11y',
    version: __PACKAGE_VERSION__
  },
  rules: {
    'image-alt': imageAlt,
    'button-label': buttonLabel,
    'link-text': linkText,
    'form-label': formLabel,
    'heading-order': headingOrder,
    'iframe-title': iframeTitle,
    'fieldset-legend': fieldsetLegend,
    'table-structure': tableStructure,
    'details-summary': detailsSummary,
    'video-captions': videoCaptions,
    'audio-captions': audioCaptions,
    'landmark-roles': landmarkRoles,
    'dialog-modal': dialogModal,
    'aria-validation': ariaValidation,
    'semantic-html': semanticHTML,
    'form-validation': formValidation,
    // Phase 1: Simple attribute rules
    'no-access-key': noAccessKey,
    'no-autofocus': noAutofocus,
    'tabindex-no-positive': tabindexNoPositive,
    'no-distracting-elements': noDistractingElements,
    'lang': lang,
    // Phase 2: Focusable element rules
    'no-aria-hidden-on-focusable': noAriaHiddenOnFocusable,
    'no-role-presentation-on-focusable': noRolePresentationOnFocusable,
    // Phase 3: Event/keyboard rules
    'click-events-have-key-events': clickEventsHaveKeyEvents,
    'mouse-events-have-key-events': mouseEventsHaveKeyEvents,
    'no-static-element-interactions': noStaticElementInteractions,
    'no-noninteractive-element-interactions': noNoninteractiveElementInteractions,
    'interactive-supports-focus': interactiveSupportsFocus,
    // Phase 4: Medium-priority rules
    'no-noninteractive-tabindex': noNoninteractiveTabindex,
    'autocomplete-valid': autocompleteValid,
    'aria-activedescendant-has-tabindex': ariaActivedescendantHasTabindex,
    'heading-has-content': headingHasContent,
    // Phase 5: Optional rules
    'anchor-ambiguous-text': anchorAmbiguousText,
    'img-redundant-alt': imgRedundantAlt,
    'accessible-emoji': accessibleEmoji,
    'html-has-lang': htmlHasLang,
    // Phase 6: New rules (parity with jsx-a11y + bug fixes)
    'anchor-is-valid': anchorIsValid,
    'no-interactive-element-to-noninteractive-role': noInteractiveElementToNoninteractiveRole,
    'no-noninteractive-element-to-interactive-role': noNoninteractiveElementToInteractiveRole,
    'no-redundant-roles': noRedundantRoles,
    'prefer-tag-over-role': preferTagOverRole,
    'control-has-associated-label': controlHasAssociatedLabel,
    'scope': scope
  },
  configs: {
    minimal: {
      plugins: ['a11y'],
      rules: minimal
    },
    recommended: {
      plugins: ['a11y'],
      rules: recommended
    },
    strict: {
      plugins: ['a11y'],
      rules: strict
    },
    react: {
      plugins: ['a11y'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: react
    },
    vue: {
      plugins: ['a11y'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      rules: vue
    },
    // Flat config presets for ESLint v9+
    'flat/recommended': flatConfigs.flatRecommended as any,
    'flat/recommended-react': flatConfigs.flatRecommendedReact as any,
    'flat/react': flatConfigs.flatReact as any,
    'flat/vue': flatConfigs.flatVue as any,
    'flat/minimal': flatConfigs.flatMinimal as any,
    'flat/strict': flatConfigs.flatStrict as any
  }
}

// Export formatter
export { default as formatter } from './formatter'

export default plugin

// CommonJS compatibility - ensure plugin is accessible without .default
if (typeof module !== 'undefined' && module.exports) {
  module.exports = plugin
  module.exports.default = plugin
  module.exports.formatter = require('./formatter').default
}

