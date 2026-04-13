/**
 * ESLint rule: dialog-modal
 * 
 * Enforces that dialog elements have proper accessibility attributes
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce dialog elements have proper accessibility attributes',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingName: 'Dialog element must have an accessible name (aria-label, aria-labelledby, or heading)',
      missingModal: 'Modal dialog should have aria-modal="true" attribute',
      invalidRole: 'Dialog element should have role="dialog" or role="alertdialog"'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX dialog elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        const isDialog = jsxNode.name.name === 'dialog'
        const hasDialogRole = jsxNode.attributes?.some((attr: any) => 
          attr.name?.name === 'role' && 
          (attr.value?.value === 'dialog' || attr.value?.value === 'alertdialog')
        )
        
        if (isDialog || hasDialogRole) {
          // Check for accessible name
          const hasAriaLabel = jsxNode.attributes?.some((attr: any) =>
            attr.name?.name === 'aria-label'
          )
          const hasAriaLabelledBy = jsxNode.attributes?.some((attr: any) =>
            attr.name?.name === 'aria-labelledby'
          )
          
          if (!hasAriaLabel && !hasAriaLabelledBy) {
            context.report({
              node,
              messageId: 'missingName'
            })
          }
          
          // Check for aria-modal
          const hasAriaModal = jsxNode.attributes?.some((attr: any) =>
            attr.name?.name === 'aria-modal'
          )
          
          if (!hasAriaModal) {
            context.report({
              node,
              messageId: 'missingModal'
            })
          }
        }
      },

      // Check Vue template dialog elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        const isDialog = vueNode.name === 'dialog'
        const hasDialogRole = vueNode.startTag?.attributes?.some((attr: any) => 
          attr.key?.name === 'role' && 
          (attr.value?.value === 'dialog' || attr.value?.value === 'alertdialog')
        )
        
        if (isDialog || hasDialogRole) {
          // Check for accessible name
          const hasAriaLabel = vueNode.startTag?.attributes?.some((attr: any) =>
            attr.key?.name === 'aria-label'
          )
          const hasAriaLabelledBy = vueNode.startTag?.attributes?.some((attr: any) =>
            attr.key?.name === 'aria-labelledby'
          )
          
          if (!hasAriaLabel && !hasAriaLabelledBy) {
            context.report({
              node,
              messageId: 'missingName'
            })
          }
          
          // Check for aria-modal
          const hasAriaModal = vueNode.startTag?.attributes?.some((attr: any) =>
            attr.key?.name === 'aria-modal'
          )
          
          if (!hasAriaModal) {
            context.report({
              node,
              messageId: 'missingModal'
            })
          }
        }
      }
    }
  }
}

export default rule
