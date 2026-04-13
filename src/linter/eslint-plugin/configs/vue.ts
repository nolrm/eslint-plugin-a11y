/**
 * Vue-specific ESLint configuration for a11y
 * 
 * This configuration is optimized for Vue projects using vue-eslint-parser.
 * It includes the recommended rules with Vue-specific parser settings.
 */

import type { RuleConfig } from '../utils/types'
import recommended from './recommended'

const vue: RuleConfig = {
  ...recommended,
  // Vue-specific overrides can be added here if needed
}

export default vue

