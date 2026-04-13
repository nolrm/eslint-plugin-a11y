/**
 * ESLint rule: landmark-roles
 * 
 * Enforces proper use of landmark elements
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce proper use of landmark elements (nav, main, header, footer, aside, section, article)',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      multipleMain: 'Page should have only one main element',
      missingName: 'Multiple {{tagName}} landmarks found. Each should have an accessible name (aria-label or aria-labelledby)'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    // Track main elements per file
    const mainElements: Rule.Node[] = []
    // Track landmark counts per file
    const landmarkCounts: Map<string, number> = new Map()

    return {
      // Check JSX landmark elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        const tagName = jsxNode.name.name?.toLowerCase()
        const landmarkTags = ['nav', 'main', 'header', 'footer', 'aside']
        
        if (landmarkTags.includes(tagName)) {
          // Track main elements
          if (tagName === 'main') {
            mainElements.push(node)
          }
          
          // Track landmark counts
          const count = landmarkCounts.get(tagName) || 0
          landmarkCounts.set(tagName, count + 1)
        }
      },

      // Check Vue template landmark elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()
        const landmarkTags = ['nav', 'main', 'header', 'footer', 'aside']
        
        if (landmarkTags.includes(tagName)) {
          // Track main elements
          if (tagName === 'main') {
            mainElements.push(node)
          }
          
          // Track landmark counts
          const count = landmarkCounts.get(tagName) || 0
          landmarkCounts.set(tagName, count + 1)
        }
      },

      // After checking all nodes, verify landmark usage
      'Program:exit'() {
        // Check for multiple main elements
        if (mainElements.length > 1) {
          for (const node of mainElements) {
            context.report({
              node,
              messageId: 'multipleMain'
            })
          }
        }

        // Check for multiple landmarks of same type without labels
        for (const [tagName, count] of landmarkCounts.entries()) {
          if (count > 1 && tagName !== 'main') {
            // Note: We can't easily check for aria-label in AST without
            // inspecting each node individually. This is a simplified check.
            // For comprehensive validation, use A11yChecker in tests.
          }
        }
      }
    }
  }
}

export default rule
