/**
 * ESLint rule: audio-captions
 * 
 * Enforces that audio elements have caption tracks or transcripts
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce audio elements have caption tracks or transcripts',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingCaptions: 'Audio element must have track elements or a transcript link',
      missingSrclang: 'Audio track must have a srclang attribute',
      missingLabel: 'Audio track should have a label attribute'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX audio elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        if (jsxNode.name.name === 'audio') {
          // Check if audio has track elements as children
          const parent = (node as any).parent
          const hasTrackChild = parent?.children?.some((child: any) => 
            child.type === 'JSXElement' && child.openingElement?.name?.name === 'track'
          )
          
          if (!hasTrackChild) {
            context.report({
              node,
              messageId: 'missingCaptions'
            })
          }
        }
        
        // Check track elements for srclang
        if (jsxNode.name.name === 'track') {
          const hasSrclang = jsxNode.attributes?.some((attr: any) =>
            attr.name?.name === 'srclang'
          )
          if (!hasSrclang) {
            context.report({
              node,
              messageId: 'missingSrclang'
            })
          }
        }
      },

      // Check Vue template elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'audio') {
          const hasTrackChild = vueNode.children?.some((child: any) =>
            child.type === 'VElement' && child.name === 'track'
          )
          
          if (!hasTrackChild) {
            context.report({
              node,
              messageId: 'missingCaptions'
            })
          }
        }
        
        // Check track elements
        if (vueNode.name === 'track') {
          const hasSrclang = vueNode.startTag?.attributes?.some((attr: any) =>
            attr.key?.name === 'srclang'
          )
          if (!hasSrclang) {
            context.report({
              node,
              messageId: 'missingSrclang'
            })
          }
        }
      }
    }
  }
}

export default rule
