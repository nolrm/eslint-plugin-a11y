/**
 * ESLint rule: accessible-emoji
 *
 * Requires that emoji have role="img" and an accessible label.
 * Emojis are not consistently announced by screen readers, so they
 * should be marked up properly for accessibility.
 *
 * Note: This rule is deprecated in jsx-a11y v6.6.0+ as emoji support
 * has improved in modern screen readers. Included for completeness.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute } from '../utils/vue-ast-utils'

// Regex to detect emoji characters
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require emoji to have role="img" and accessible label',
      category: 'Accessibility',
      recommended: false,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      emojiNeedsRole: 'Emoji must have role="img" for screen reader compatibility.',
      emojiNeedsLabel: 'Emoji must have an accessible label (aria-label or aria-labelledby).'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
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
    }

    function containsEmoji(text: string): boolean {
      return EMOJI_REGEX.test(text)
    }

    function hasAccessibleLabel(node: any, isJSX: boolean): boolean {
      if (isJSX) {
        return hasJSXAttribute(node, 'aria-label') || hasJSXAttribute(node, 'aria-labelledby')
      } else {
        return hasVueAttribute(node, 'aria-label') || hasVueAttribute(node, 'aria-labelledby')
      }
    }

    function hasImgRole(node: any, isJSX: boolean): boolean {
      if (isJSX) {
        const roleAttr = getJSXAttribute(node, 'role')
        if (roleAttr?.value?.type === 'Literal') {
          return roleAttr.value.value === 'img'
        }
      } else {
        const roleAttr = getVueAttribute(node, 'role')
        if (roleAttr?.value?.value) {
          return roleAttr.value.value === 'img'
        }
      }
      return false
    }

    return {
      JSXElement(node: Rule.Node) {
        const jsxNode = node as any
        const openingElement = jsxNode.openingElement

        // Only check span elements (common wrapper for emoji)
        if (!openingElement?.name || openingElement.name.type !== 'JSXIdentifier') {
          return
        }

        const tagName = openingElement.name.name.toLowerCase()
        if (tagName !== 'span') {
          return
        }

        const text = getTextContent(jsxNode)
        if (!containsEmoji(text)) {
          return
        }

        // Check for role="img"
        if (!hasImgRole(openingElement, true)) {
          context.report({
            node: openingElement,
            messageId: 'emojiNeedsRole',
            suggest: [{
              desc: 'Add role="img"',
              fix(fixer) {
                const lastAttribute = openingElement.attributes && openingElement.attributes.length > 0
                  ? openingElement.attributes[openingElement.attributes.length - 1]
                  : null

                if (lastAttribute) {
                  return fixer.insertTextAfter(lastAttribute, ' role="img"')
                }
                return fixer.insertTextAfter(openingElement.name, ' role="img"')
              }
            }]
          })
        }

        // Check for accessible label
        if (!hasAccessibleLabel(openingElement, true)) {
          context.report({
            node: openingElement,
            messageId: 'emojiNeedsLabel',
            suggest: [{
              desc: 'Add aria-label',
              fix(fixer) {
                const lastAttribute = openingElement.attributes && openingElement.attributes.length > 0
                  ? openingElement.attributes[openingElement.attributes.length - 1]
                  : null

                if (lastAttribute) {
                  return fixer.insertTextAfter(lastAttribute, ' aria-label=""')
                }
                return fixer.insertTextAfter(openingElement.name, ' aria-label=""')
              }
            }]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        // Only check span elements
        if (tagName !== 'span') {
          return
        }

        const text = getVueTextContent(vueNode)
        if (!containsEmoji(text)) {
          return
        }

        // Check for role="img"
        if (!hasImgRole(vueNode, false)) {
          context.report({
            node,
            messageId: 'emojiNeedsRole'
          })
        }

        // Check for accessible label
        if (!hasAccessibleLabel(vueNode, false)) {
          context.report({
            node,
            messageId: 'emojiNeedsLabel'
          })
        }
      }
    }
  }
}

export default rule
