/**
 * ESLint rule: img-redundant-alt
 *
 * Flags redundant words in image alt text like "image", "photo", "picture".
 * Screen readers already announce that an element is an image, so including
 * these words in alt text is redundant.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute, isJSXAttributeDynamic } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute, isVueAttributeDynamic } from '../utils/vue-ast-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

// Default redundant words
const DEFAULT_REDUNDANT_WORDS = [
  'image',
  'photo',
  'photograph',
  'picture',
  'graphic',
  'icon',
  'logo',
  'img',
]

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Flag redundant words in image alt text',
      category: 'Accessibility',
      recommended: false,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      redundantAlt: 'Redundant alt text: "{{word}}" is unnecessary. Screen readers already announce images. Describe the image content instead.'
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
            description: 'Words to flag as redundant'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = context.options[0] || {}
    const redundantWords = (options.words || DEFAULT_REDUNDANT_WORDS)
      .map((w: string) => w.toLowerCase().trim())

    function findRedundantWord(text: string): string | null {
      const normalized = text.toLowerCase()
      for (const word of redundantWords) {
        // Match whole word with word boundaries
        const regex = new RegExp(`\\b${word}\\b`, 'i')
        if (regex.test(normalized)) {
          return word
        }
      }
      return null
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Only check img elements
        const tagName = getElementRoleFromJSX(jsxNode, context)
        if (tagName !== 'img') {
          return
        }

        // Check for alt attribute
        if (!hasJSXAttribute(jsxNode, 'alt')) {
          return
        }

        const altAttr = getJSXAttribute(jsxNode, 'alt')
        if (!altAttr) return

        // Skip dynamic values
        if (isJSXAttributeDynamic(altAttr)) {
          return
        }

        // Get alt text
        let altText: string | null = null
        if (altAttr.value?.type === 'Literal') {
          altText = String(altAttr.value.value)
        }

        if (altText) {
          const redundantWord = findRedundantWord(altText)
          if (redundantWord) {
            context.report({
              node,
              messageId: 'redundantAlt',
              data: { word: redundantWord }
            })
          }
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        // Only check img elements
        if (tagName !== 'img') {
          return
        }

        // Check for alt attribute
        if (!hasVueAttribute(vueNode, 'alt')) {
          return
        }

        const altAttr = getVueAttribute(vueNode, 'alt')
        if (!altAttr) return

        // Skip dynamic values
        if (isVueAttributeDynamic(altAttr)) {
          return
        }

        const altText = altAttr.value?.value
        if (altText) {
          const redundantWord = findRedundantWord(altText)
          if (redundantWord) {
            context.report({
              node,
              messageId: 'redundantAlt',
              data: { word: redundantWord }
            })
          }
        }
      }
    }
  }
}

export default rule
