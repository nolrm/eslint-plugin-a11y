/**
 * ESLint rule: video-captions
 * 
 * Enforces that video elements have caption tracks
 */

import type { Rule } from 'eslint'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce video elements have caption tracks',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingCaptions: 'Video element must have at least one track element with kind="captions"',
      missingSrclang: 'Video caption track must have a srclang attribute'
    },
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX video elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        if (jsxNode.name.name === 'video') {
          // Check if video has track children
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

      // Check Vue template video elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'video') {
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
