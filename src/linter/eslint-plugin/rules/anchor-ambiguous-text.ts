/**
 * ESLint rule: anchor-ambiguous-text
 *
 * Flags ambiguous link text like "click here", "read more", "learn more".
 * Links should have descriptive text that makes sense out of context.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute } from '../utils/vue-ast-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

// Common ambiguous link text patterns
const DEFAULT_AMBIGUOUS_WORDS = [
  'click here',
  'here',
  'link',
  'read more',
  'learn more',
  'more',
  'this',
  'this link',
  'go',
  'click',
  'page',
  'this page',
]

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Flag ambiguous link text',
      category: 'Accessibility',
      recommended: false,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      ambiguousText: 'Ambiguous link text "{{text}}" is not descriptive. Use meaningful text that describes the link destination.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          words: {
            type: 'array',
            items: { type: 'string' },
            description: 'Words/phrases to flag as ambiguous'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = context.options[0] || {}
    const ambiguousWords = new Set(
      (options.words || DEFAULT_AMBIGUOUS_WORDS).map((w: string) => w.toLowerCase().trim())
    )

    function isAmbiguous(text: string): boolean {
      const normalized = text.toLowerCase().trim()
      return ambiguousWords.has(normalized)
    }

    function getTextContent(node: any): string {
      if (!node.children) return ''

      return node.children
        .map((child: any) => {
          if (child.type === 'JSXText') {
            return child.value || ''
          }
          return ''
        })
        .join('')
        .trim()
    }

    function getVueTextContent(node: any): string {
      if (!node.children) return ''

      return node.children
        .map((child: any) => {
          if (child.type === 'VText') {
            return child.value || ''
          }
          return ''
        })
        .join('')
        .trim()
    }

    return {
      JSXElement(node: Rule.Node) {
        const jsxNode = node as any
        const openingElement = jsxNode.openingElement

        if (!openingElement?.name || openingElement.name.type !== 'JSXIdentifier') {
          return
        }

        // Only check anchor elements
        const tagName = getElementRoleFromJSX(openingElement, context)
        if (tagName !== 'a') {
          return
        }

        // Skip if has aria-label or aria-labelledby
        if (hasJSXAttribute(openingElement, 'aria-label') ||
            hasJSXAttribute(openingElement, 'aria-labelledby')) {
          return
        }

        const text = getTextContent(jsxNode)
        if (text && isAmbiguous(text)) {
          context.report({
            node: openingElement,
            messageId: 'ambiguousText',
            data: { text }
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        // Only check anchor elements
        if (tagName !== 'a') {
          return
        }

        // Skip if has aria-label or aria-labelledby
        if (hasVueAttribute(vueNode, 'aria-label') ||
            hasVueAttribute(vueNode, 'aria-labelledby')) {
          return
        }

        const text = getVueTextContent(vueNode)
        if (text && isAmbiguous(text)) {
          context.report({
            node,
            messageId: 'ambiguousText',
            data: { text }
          })
        }
      }
    }
  }
}

export default rule
