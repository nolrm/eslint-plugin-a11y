/**
 * ESLint rule: table-structure
 * 
 * Enforces that table elements have proper accessibility structure
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce table elements have proper accessibility structure (caption, headers, scope)',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingCaption: 'Table must have a caption element or aria-label/aria-labelledby attribute',
      missingScope: 'Table header cells (th) should have a scope attribute'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX table elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        if (jsxNode.name.name === 'table') {
          // Check if table has caption as child or aria-label/aria-labelledby
          const hasAriaLabel = jsxNode.attributes?.some((attr: any) =>
            attr.name?.name === 'aria-label' || attr.name?.name === 'aria-labelledby'
          )
          
          const parent = (node as any).parent
          const hasCaption = parent?.children?.some((child: any) =>
            child.type === 'JSXElement' && child.openingElement?.name?.name === 'caption'
          )
          
          if (!hasAriaLabel && !hasCaption) {
            context.report({
              node,
              messageId: 'missingCaption'
            })
          }
        }
        
        // Check th elements for scope
        if (jsxNode.name.name === 'th') {
          const hasScope = jsxNode.attributes?.some((attr: any) =>
            attr.name?.name === 'scope'
          )
          if (!hasScope) {
            context.report({
              node,
              messageId: 'missingScope'
            })
          }
        }
      },

      // Check Vue template table elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'table') {
          // Check if table has caption or aria attributes
          const hasAriaLabel = vueNode.startTag?.attributes?.some((attr: any) =>
            attr.key?.name === 'aria-label' || attr.key?.name === 'aria-labelledby'
          )
          
          const hasCaption = vueNode.children?.some((child: any) =>
            child.type === 'VElement' && child.name === 'caption'
          )
          
          if (!hasAriaLabel && !hasCaption) {
            context.report({
              node,
              messageId: 'missingCaption'
            })
          }
        }
        
        // Check th elements for scope
        if (vueNode.name === 'th') {
          const hasScope = vueNode.startTag?.attributes?.some((attr: any) =>
            attr.key?.name === 'scope'
          )
          if (!hasScope) {
            context.report({
              node,
              messageId: 'missingScope'
            })
          }
        }
      }
    }
  }
}

export default rule
