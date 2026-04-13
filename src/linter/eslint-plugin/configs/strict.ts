/**
 * Strict ESLint configuration for a11y
 * 
 * This configuration enables all accessibility rules as errors.
 * Use this for projects that want to enforce strict accessibility standards.
 */

import type { RuleConfig } from '../utils/types'

const strict: RuleConfig = {
  // All rules set to error for strict enforcement
  'a11y/image-alt': 'error',
  'a11y/button-label': 'error',
  'a11y/link-text': 'error',
  'a11y/form-label': 'error',
  'a11y/heading-order': 'error',
  'a11y/iframe-title': 'error',
  'a11y/fieldset-legend': 'error',
  'a11y/table-structure': 'error',
  'a11y/details-summary': 'error',
  'a11y/video-captions': 'error',
  'a11y/audio-captions': 'error',
  'a11y/landmark-roles': 'error',
  'a11y/dialog-modal': 'error',
  'a11y/aria-validation': 'error',
  'a11y/semantic-html': 'error',
  'a11y/form-validation': 'error',
  // Phase 1: Simple attribute rules
  'a11y/no-access-key': 'error',
  'a11y/no-autofocus': 'error',
  'a11y/tabindex-no-positive': 'error',
  'a11y/no-distracting-elements': 'error',
  'a11y/lang': 'error',
  // Phase 2: Focusable element rules
  'a11y/no-aria-hidden-on-focusable': 'error',
  'a11y/no-role-presentation-on-focusable': 'error',
  // Phase 3: Event/keyboard rules
  'a11y/click-events-have-key-events': 'error',
  'a11y/mouse-events-have-key-events': 'error',
  'a11y/no-static-element-interactions': 'error',
  'a11y/no-noninteractive-element-interactions': 'error',
  'a11y/interactive-supports-focus': 'error',
  // Phase 4: Medium-priority rules
  'a11y/no-noninteractive-tabindex': 'error',
  'a11y/autocomplete-valid': 'error',
  'a11y/aria-activedescendant-has-tabindex': 'error',
  'a11y/heading-has-content': 'error',
  // Phase 5: Optional rules (also enabled in strict mode)
  'a11y/anchor-ambiguous-text': 'error',
  'a11y/img-redundant-alt': 'error',
  'a11y/accessible-emoji': 'error',
  'a11y/html-has-lang': 'error',
  // Phase 6: New rules
  'a11y/anchor-is-valid': 'error',
  'a11y/no-interactive-element-to-noninteractive-role': 'error',
  'a11y/no-noninteractive-element-to-interactive-role': 'error',
  'a11y/no-redundant-roles': 'error',
  'a11y/prefer-tag-over-role': 'error',
  'a11y/control-has-associated-label': 'error',
  'a11y/scope': 'error'
}

export default strict

