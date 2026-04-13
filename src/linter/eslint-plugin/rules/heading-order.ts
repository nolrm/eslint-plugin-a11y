/**
 * ESLint rule: heading-order
 * 
 * Enforces proper heading hierarchy (no skipped levels)
 */

import type { Rule } from 'eslint'
import { getHeadingOrderOptions } from '../utils/rule-options'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce proper heading hierarchy (no skipped levels)',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      skippedLevel: 'Heading level skipped from h{{previous}} to h{{current}}'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          allowSameLevel: {
            type: 'boolean'
          },
          maxSkip: {
            type: 'number',
            minimum: 0
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = getHeadingOrderOptions(context.options)
    // Track heading levels in the current file
    const headingNodes: Array<{ node: Rule.Node; level: number }> = []

    return {
      // Check JSX heading elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        const tagName = jsxNode.name.name?.toLowerCase()
        
        if (tagName && /^h[1-6]$/.test(tagName)) {
          const currentLevel = parseInt(tagName[1])
          headingNodes.push({ node, level: currentLevel })
        }
      },

      // Check Vue template heading elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()
        
        if (tagName && /^h[1-6]$/.test(tagName)) {
          const currentLevel = parseInt(tagName[1])
          headingNodes.push({ node, level: currentLevel })
        }
      },

      // After checking all nodes, verify heading order
      'Program:exit'() {
        // Check heading order
        let prevLevel = 0
        
        for (const { node, level } of headingNodes) {
          if (prevLevel > 0) {
            const skip = level - prevLevel
            
            // Check if same level is allowed
            if (skip === 0 && !options.allowSameLevel) {
              // Same level - only report if not allowed (rare case)
              // Usually same level is fine, so we skip this
              continue
            }
            
            // Check skip amount
            if (skip > 1) {
              // Check maxSkip option
              if (options.maxSkip !== undefined && skip <= options.maxSkip) {
                // Skip is within allowed range
                prevLevel = level
                continue
              }
              
              context.report({
                node,
                messageId: 'skippedLevel',
                data: {
                  previous: String(prevLevel),
                  current: String(level)
                },
                suggest: [{
                  desc: `Consider using h${prevLevel + 1} instead of h${level} to maintain proper heading hierarchy`,
                  fix(_fixer) {
                    // No autofix - changing heading levels can break styling or intentional semantics
                    // Return null to indicate no fix available
                    return null
                  }
                }]
              })
            }
          }
          prevLevel = level
        }
      }
    }
  }
}

export default rule
