/**
 * Minimal ESLint configuration for a11y
 * 
 * This configuration enables only the most critical accessibility rules.
 * Use this for incremental adoption in large projects or when starting fresh.
 * 
 * Includes only:
 * - button-label (critical)
 * - form-label (critical)
 * - image-alt (serious)
 */

import type { RuleConfig } from '../utils/types'

const minimal: RuleConfig = {
  // Only critical/serious violations that block basic accessibility
  'a11y/button-label': 'error',
  'a11y/form-label': 'error',
  'a11y/image-alt': 'error'
}

export default minimal

