/**
 * ESLint rule: no-distracting-elements
 *
 * Disallows <blink> and <marquee> elements.
 * These elements are distracting, can cause seizures, and are deprecated.
 */

import type { Rule } from 'eslint'

const DISTRACTING_ELEMENTS = ['blink', 'marquee']

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow distracting elements like <blink> and <marquee>',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noDistractingElements: '<{{element}}> elements are distracting, can cause seizures, and are deprecated. Remove or replace with static content.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          elements: {
            type: 'array',
            items: { type: 'string' },
            default: ['blink', 'marquee']
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = context.options[0] || {}
    const elements = new Set(
      (options.elements || DISTRACTING_ELEMENTS).map((e: string) => e.toLowerCase())
    )

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }

        const tagName = jsxNode.name.name.toLowerCase()

        if (elements.has(tagName)) {
          context.report({
            node,
            messageId: 'noDistractingElements',
            data: { element: tagName }
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        if (tagName && elements.has(tagName)) {
          context.report({
            node,
            messageId: 'noDistractingElements',
            data: { element: tagName }
          })
        }
      }
    }
  }
}

export default rule
