/**
 * Helper for testing ESLint rules
 * 
 * This helper loads rules from the plugin to avoid module resolution issues
 */

// Import from dist to avoid module resolution issues in test environment
import { join } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pluginPath = join(process.cwd(), 'dist/linter/eslint-plugin/index.js')
const eslintPlugin = require(pluginPath).default

export function getRule(ruleName: string) {
  return eslintPlugin.rules[ruleName]
}

export const imageAlt = getRule('image-alt')
export const buttonLabel = getRule('button-label')
export const linkText = getRule('link-text')
export const formLabel = getRule('form-label')
export const headingOrder = getRule('heading-order')
export const iframeTitle = getRule('iframe-title')
export const fieldsetLegend = getRule('fieldset-legend')
export const tableStructure = getRule('table-structure')
export const detailsSummary = getRule('details-summary')
export const videoCaptions = getRule('video-captions')
export const audioCaptions = getRule('audio-captions')
export const landmarkRoles = getRule('landmark-roles')
export const dialogModal = getRule('dialog-modal')
// Phase 1 rules
export const noAccessKey = getRule('no-access-key')
export const noAutofocus = getRule('no-autofocus')
export const tabindexNoPositive = getRule('tabindex-no-positive')
export const noDistractingElements = getRule('no-distracting-elements')
export const lang = getRule('lang')
// Phase 2 rules
export const noAriaHiddenOnFocusable = getRule('no-aria-hidden-on-focusable')
export const noRolePresentationOnFocusable = getRule('no-role-presentation-on-focusable')
// Phase 3 rules
export const clickEventsHaveKeyEvents = getRule('click-events-have-key-events')
export const mouseEventsHaveKeyEvents = getRule('mouse-events-have-key-events')
export const noStaticElementInteractions = getRule('no-static-element-interactions')
export const noNoninteractiveElementInteractions = getRule('no-noninteractive-element-interactions')
export const interactiveSupportsFocus = getRule('interactive-supports-focus')
// Phase 4 rules
export const noNoninteractiveTabindex = getRule('no-noninteractive-tabindex')
export const autocompleteValid = getRule('autocomplete-valid')
export const ariaActivedescendantHasTabindex = getRule('aria-activedescendant-has-tabindex')
export const headingHasContent = getRule('heading-has-content')
// Phase 5 rules
export const anchorAmbiguousText = getRule('anchor-ambiguous-text')
export const imgRedundantAlt = getRule('img-redundant-alt')
export const accessibleEmoji = getRule('accessible-emoji')
export const htmlHasLang = getRule('html-has-lang')
// Phase 6 rules
export const anchorIsValid = getRule('anchor-is-valid')
export const controlHasAssociatedLabel = getRule('control-has-associated-label')
export const noInteractiveElementToNoninteractiveRole = getRule('no-interactive-element-to-noninteractive-role')
export const noNoninteractiveElementToInteractiveRole = getRule('no-noninteractive-element-to-interactive-role')
export const noRedundantRoles = getRule('no-redundant-roles')
export const preferTagOverRole = getRule('prefer-tag-over-role')
export const scope = getRule('scope')

