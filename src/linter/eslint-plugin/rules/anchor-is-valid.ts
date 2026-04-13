/**
 * ESLint rule: anchor-is-valid
 *
 * Enforces that anchor elements have valid href attributes.
 * Anchors without a real href are not valid links and should use
 * a <button> element instead for clickable actions.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute, hasJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute } from '../utils/vue-ast-utils'
import { isElementLike } from '../utils/component-mapping'

const INVALID_HREFS = new Set(['', '#'])

function isInvalidHref(value: string): boolean {
  if (INVALID_HREFS.has(value)) return true
  if (value.toLowerCase().startsWith('javascript:')) return true
  return false
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce anchor elements have valid href attributes',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingHref: 'Anchor element must have an href attribute to be a valid link. Use a <button> for clickable actions.',
      invalidHref: 'The href value "{{href}}" is not a valid URL. Use a real URL, or use a <button> for clickable actions.',
      preferButton: 'Anchor elements with click handlers but no href should be <button> elements for proper keyboard accessibility.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }

        if (jsxNode.name.name !== 'a' && !isElementLike(node, context, 'a')) {
          return
        }

        const hrefAttr = getJSXAttribute(jsxNode, 'href')
        const hasOnClick = hasJSXAttribute(jsxNode, 'onClick')

        if (!hrefAttr) {
          // No href at all
          if (hasOnClick) {
            context.report({ node, messageId: 'preferButton' })
          } else {
            context.report({ node, messageId: 'missingHref' })
          }
          return
        }

        // href exists — validate its value
        if (hrefAttr.value?.type === 'Literal' && typeof hrefAttr.value.value === 'string') {
          const hrefValue = hrefAttr.value.value
          if (isInvalidHref(hrefValue)) {
            context.report({
              node,
              messageId: 'invalidHref',
              data: { href: hrefValue }
            })
          }
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        if (vueNode.name !== 'a') {
          return
        }

        const hrefAttr = getVueAttribute(vueNode, 'href')
        const hasClickHandler = vueNode.startTag?.attributes?.some((attr: any) =>
          attr.directive &&
          attr.key?.name?.name === 'on' &&
          attr.key?.argument?.name === 'click'
        )

        if (!hrefAttr) {
          if (hasClickHandler) {
            context.report({ node, messageId: 'preferButton' })
          } else {
            context.report({ node, messageId: 'missingHref' })
          }
          return
        }

        // href exists — validate its value
        const hrefValue = hrefAttr.value?.value
        if (typeof hrefValue === 'string' && isInvalidHref(hrefValue)) {
          context.report({
            node,
            messageId: 'invalidHref',
            data: { href: hrefValue }
          })
        }
      }
    }
  }
}

export default rule
