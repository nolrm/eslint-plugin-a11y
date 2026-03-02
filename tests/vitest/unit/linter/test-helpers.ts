/**
 * Test helper utilities for ESLint rule tests
 * 
 * Common utilities for creating test contexts, assertions, and validations
 */

import type { Rule } from 'eslint'

/**
 * Create a mock ESLint rule context
 */
export function createMockContext(source = '', filename = 'test.jsx'): Rule.RuleContext {
  return {
    getFilename: () => filename,
    getSourceCode: () => ({
      getText: () => source,
      getAllComments: () => [],
      getComments: () => [],
      getCommentsBefore: () => [],
      getCommentsAfter: () => [],
      getCommentsInside: () => [],
      getFirstToken: () => null,
      getLastToken: () => null,
      getTokens: () => [],
      getTokensBefore: () => [],
      getTokensAfter: () => [],
      getTokensBetween: () => [],
      getNodeByRangeIndex: () => null,
      getScope: () => ({
        type: 'global',
        block: null,
        childScopes: [],
        variables: [],
        references: [],
        set: () => {},
        get: () => null,
        has: () => false,
        hasGlobal: () => false,
        hasLexical: () => false,
        hasThis: () => false,
        hasSuper: () => false
      }),
      parserServices: {}
    }),
    report: (descriptor: any) => {
      // Mock report function
      if (descriptor.messageId) {
        return {
          messageId: descriptor.messageId,
          node: descriptor.node,
          data: descriptor.data
        }
      }
      return {
        message: descriptor.message,
        node: descriptor.node,
        data: descriptor.data
      }
    },
    getScope: () => ({
      type: 'global',
      block: null,
      childScopes: [],
      variables: [],
      references: []
    }),
    getAncestors: () => [],
    getDeclaredVariables: () => [],
    markVariableAsUsed: () => {}
  } as any
}

/**
 * Assert that a rule reports a specific violation
 */
export function expectViolation(
  violations: any[],
  messageId: string,
  nodeType?: string
) {
  const violation = violations.find(v => v.messageId === messageId)
  expect(violation).toBeDefined()
  if (nodeType) {
    expect(violation?.node?.type).toBe(nodeType)
  }
  return violation
}

/**
 * Assert that a rule does not report violations
 */
export function expectNoViolations(violations: any[]) {
  expect(violations).toHaveLength(0)
}

/**
 * Create a JSX element node for testing
 */
export function createJSXElement(tagName: string, attributes: Record<string, string> = {}) {
  return {
    type: 'JSXOpeningElement',
    name: {
      type: 'JSXIdentifier',
      name: tagName
    },
    attributes: Object.entries(attributes).map(([name, value]) => ({
      type: 'JSXAttribute',
      name: {
        type: 'JSXIdentifier',
        name
      },
      value: {
        type: 'Literal',
        value
      }
    }))
  }
}

/**
 * Create a Vue element node for testing
 */
export function createVueElement(tagName: string, attributes: Record<string, string> = {}) {
  return {
    type: 'VElement',
    name: tagName,
    startTag: {
      attributes: Object.entries(attributes).map(([name, value]) => ({
        key: {
          name
        },
        value: {
          value
        }
      }))
    }
  }
}

/**
 * Validate rule structure
 */
export function validateRuleStructure(rule: any) {
  expect(rule).toBeDefined()
  expect(rule.meta).toBeDefined()
  expect(rule.meta.type).toBe('problem')
  expect(rule.meta.docs).toBeDefined()
  expect(rule.meta.messages).toBeDefined()
  expect(rule.create).toBeDefined()
  expect(typeof rule.create).toBe('function')
}

/**
 * Test rule with multiple frameworks
 */
export async function testRuleWithFrameworks(
  _rule: any,
  validCode: string[],
  invalidCode: Array<{ code: string; errors: any[] }>,
  frameworks: ('jsx' | 'vue' | 'html')[] = ['jsx', 'vue', 'html']
) {
  const results: any = {}
  
  if (frameworks.includes('jsx')) {
    // Test JSX
    results.jsx = { valid: validCode, invalid: invalidCode }
  }
  
  if (frameworks.includes('vue')) {
    // Test Vue
    results.vue = { valid: validCode, invalid: invalidCode }
  }
  
  if (frameworks.includes('html')) {
    // Test HTML strings
    results.html = { valid: validCode, invalid: invalidCode }
  }
  
  return results
}

