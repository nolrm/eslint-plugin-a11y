/**
 * TypeScript types for ESLint plugin rules
 */

import type { Rule } from 'eslint'

/**
 * Extended rule context with additional utilities
 */
export type A11yRuleContext = Rule.RuleContext

/**
 * Rule meta information for accessibility rules
 */
export interface A11yRuleMeta {
  type: 'problem' | 'suggestion' | 'layout'
  docs: {
    description: string
    category: 'Accessibility'
    recommended: boolean
    url?: string
  }
  messages: Record<string, string>
  fixable?: 'code' | 'whitespace'
  schema?: unknown[]
}

/**
 * Base rule module interface
 */
export interface A11yRuleModule extends Rule.RuleModule {
  meta: A11yRuleMeta
}

/**
 * Rule severity levels
 */
export type RuleSeverity = 'off' | 'warn' | 'error' | 0 | 1 | 2

/**
 * Rule configuration
 */
export interface RuleConfig {
  [ruleName: string]: RuleSeverity | [RuleSeverity, ...unknown[]]
}

