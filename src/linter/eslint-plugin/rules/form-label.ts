/**
 * ESLint rule: form-label
 * 
 * Enforces that form controls have associated labels
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce form controls have associated labels',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingLabel: 'Form control must have an associated label (use id/for, aria-label, or aria-labelledby)'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX form control elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Only handle simple identifiers (not member expressions like <Form.Input>)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }

        const tagName = jsxNode.name.name?.toLowerCase()

        if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
          // Check if it has aria-label or aria-labelledby
          const hasAriaLabel = hasJSXAttribute(jsxNode, 'aria-label')
          const hasAriaLabelledBy = hasJSXAttribute(jsxNode, 'aria-labelledby')

          // Get id attribute — if present, a label may be in another component
          const idAttr = jsxNode.attributes?.find((attr: any) =>
            attr.name?.name === 'id'
          )
          const id = idAttr?.value?.value

          // Report only when there is no labeling mechanism at all
          if (!hasAriaLabel && !hasAriaLabelledBy && !id) {
            context.report({
              node,
              messageId: 'missingLabel'
            })
          }
        }
      },

      // Check Vue template form control elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
          // Check if it has aria-label or aria-labelledby
          const hasAriaLabel = hasVueAttribute(vueNode, 'aria-label')
          const hasAriaLabelledBy = hasVueAttribute(vueNode, 'aria-labelledby')

          // Get id attribute — if present, a label may be in another component
          const idAttr = getVueAttribute(vueNode, 'id')
          const id = idAttr?.value?.value

          // Report only when there is no labeling mechanism at all
          if (!hasAriaLabel && !hasAriaLabelledBy && !id) {
            context.report({
              node,
              messageId: 'missingLabel'
            })
          }
        }
      }
    }
  }
}

export default rule

