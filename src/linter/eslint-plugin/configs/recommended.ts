/**
 * Recommended ESLint configuration for a11y
 * 
 * This configuration enables all accessibility rules with recommended severity levels
 * based on the impact of violations (critical/serious = error, moderate/minor = warn)
 */

import type { RuleConfig } from '../utils/types'

const recommended: RuleConfig = {
  // Critical/Serious violations - set to error
  'a11y/image-alt': 'error',
  'a11y/button-label': 'error',
  'a11y/form-label': 'error',
  'a11y/iframe-title': 'error',
  'a11y/fieldset-legend': 'error',
  'a11y/table-structure': 'error',
  'a11y/details-summary': 'error',
  'a11y/video-captions': 'error',
  'a11y/audio-captions': 'error',
  'a11y/landmark-roles': 'warn',
  'a11y/dialog-modal': 'error',

  // Moderate/Minor violations - set to warn
  'a11y/link-text': 'warn',
  'a11y/heading-order': 'warn',

  // New rules - Critical/Serious violations
  'a11y/no-access-key': 'error',
  'a11y/no-autofocus': 'error',
  'a11y/tabindex-no-positive': 'error',
  'a11y/no-distracting-elements': 'error',
  'a11y/no-aria-hidden-on-focusable': 'error',
  'a11y/no-role-presentation-on-focusable': 'error',
  'a11y/heading-has-content': 'error',
  'a11y/html-has-lang': 'error',

  // New rules - Moderate violations (warn)
  'a11y/click-events-have-key-events': 'warn',
  'a11y/no-static-element-interactions': 'warn',
  'a11y/interactive-supports-focus': 'warn',

  // Phase 6: New rules
  'a11y/anchor-is-valid': 'error',
  'a11y/no-interactive-element-to-noninteractive-role': 'error',
  'a11y/no-noninteractive-element-to-interactive-role': 'warn',
  'a11y/no-redundant-roles': 'warn',
  'a11y/control-has-associated-label': 'error',
  'a11y/scope': 'error'

  // Not included in recommended (available in strict):
  // - aria-validation, semantic-html, form-validation
  //   These rules are broad and may produce noise in typical projects.
  //   Enable individually or use the strict preset for full coverage.
}

export default recommended

