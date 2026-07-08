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
import { getAnchorIsValidOptions } from '../utils/rule-options'

const INVALID_HREFS = new Set(['', '#'])

function isInvalidHref(value: string): boolean {
  if (INVALID_HREFS.has(value)) return true
  if (value.toLowerCase().startsWith('javascript:')) return true
  return false
}

function findLinkAttr<T>(
  candidates: string[],
  getAttr: (name: string) => T | undefined
): { attr: T; name: string } | undefined {
  for (const name of candidates) {
    const attr = getAttr(name)
    if (attr) return { attr, name }
  }
  return undefined
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
      missingHref: 'Anchor element must have an href attribute{{extra}} to be a valid link. Use a <button> for clickable actions.',
      invalidHref: 'The {{attrLabel}} value "{{href}}" is not a valid URL. Use a real URL, or use a <button> for clickable actions.',
      preferButton: 'Anchor elements with click handlers but no href should be <button> elements for proper keyboard accessibility.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          specialLink: {
            type: 'array',
            items: { type: 'string' }
          },
          aspects: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['noHref', 'invalidHref', 'preferButton']
            },
            minItems: 1
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = getAnchorIsValidOptions(context.options)
    const candidates = ['href', ...options.specialLink]
    const extra = options.specialLink.length
      ? ` (or one of: ${options.specialLink.join(', ')})`
      : ''

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }

        if (jsxNode.name.name !== 'a' && !isElementLike(node, context, 'a')) {
          return
        }

        const found = findLinkAttr(candidates, (name) => getJSXAttribute(jsxNode, name))
        const hasOnClick = hasJSXAttribute(jsxNode, 'onClick')

        if (!found) {
          // No href (or special link prop) at all
          if (hasOnClick && options.aspects.includes('preferButton')) {
            context.report({ node, messageId: 'preferButton' })
          } else if (options.aspects.includes('noHref')) {
            context.report({ node, messageId: 'missingHref', data: { extra } })
          }
          return
        }

        // href (or special link prop) exists — validate its value
        const { attr: linkAttr, name: attrLabel } = found
        if (linkAttr.value?.type === 'Literal' && typeof linkAttr.value.value === 'string') {
          const hrefValue = linkAttr.value.value
          if (isInvalidHref(hrefValue) && options.aspects.includes('invalidHref')) {
            context.report({
              node,
              messageId: 'invalidHref',
              data: { href: hrefValue, attrLabel }
            })
          }
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        if (vueNode.name !== 'a') {
          return
        }

        const found = findLinkAttr(candidates, (name) => getVueAttribute(vueNode, name))
        const hasClickHandler = vueNode.startTag?.attributes?.some((attr: any) =>
          attr.directive &&
          attr.key?.name?.name === 'on' &&
          attr.key?.argument?.name === 'click'
        )

        if (!found) {
          if (hasClickHandler && options.aspects.includes('preferButton')) {
            context.report({ node, messageId: 'preferButton' })
          } else if (options.aspects.includes('noHref')) {
            context.report({ node, messageId: 'missingHref', data: { extra } })
          }
          return
        }

        // href (or special link prop) exists — validate its value
        const { attr: linkAttr, name: attrLabel } = found
        const hrefValue = linkAttr.value?.value
        if (typeof hrefValue === 'string' && isInvalidHref(hrefValue) && options.aspects.includes('invalidHref')) {
          context.report({
            node,
            messageId: 'invalidHref',
            data: { href: hrefValue, attrLabel }
          })
        }
      }
    }
  }
}

export default rule
