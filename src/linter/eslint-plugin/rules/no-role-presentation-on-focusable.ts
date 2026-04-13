/**
 * ESLint rule: no-role-presentation-on-focusable
 *
 * Disallows role="presentation" or role="none" on focusable elements.
 * These roles semantically hide the element from assistive technology,
 * but if the element is still focusable, users can navigate to something
 * that has no announced purpose.
 */

import type { Rule } from 'eslint'
import { getJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute } from '../utils/vue-ast-utils'
import { isJSXElementFocusable, isVueElementFocusable } from '../utils/focusable-utils'

const PRESENTATION_ROLES = ['presentation', 'none']

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow role="presentation" or role="none" on focusable elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noRolePresentationOnFocusable: 'role="{{role}}" must not be used on focusable elements. This hides the element\'s semantics from screen readers while the element remains focusable, causing confusion. Either remove the role or make the element non-focusable.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    function getRoleValue(attr: any): string | null {
      if (!attr) return null

      // Check literal value
      if (attr.value?.type === 'Literal') {
        return String(attr.value.value).toLowerCase()
      }

      // Check JSX expression with literal
      if (attr.value?.type === 'JSXExpressionContainer') {
        const expression = attr.value.expression
        if (expression?.type === 'Literal' && typeof expression.value === 'string') {
          return expression.value.toLowerCase()
        }
      }

      return null
    }

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        const roleAttr = getJSXAttribute(jsxNode, 'role')
        const roleValue = getRoleValue(roleAttr)

        if (!roleValue || !PRESENTATION_ROLES.includes(roleValue)) {
          return
        }

        if (isJSXElementFocusable(jsxNode, context)) {
          context.report({
            node,
            messageId: 'noRolePresentationOnFocusable',
            data: { role: roleValue },
            suggest: [
              {
                desc: 'Remove role attribute',
                fix(fixer) {
                  return fixer.remove(roleAttr as any)
                }
              },
              {
                desc: 'Add tabindex="-1" to make element non-focusable',
                fix(fixer) {
                  const lastAttribute = jsxNode.attributes && jsxNode.attributes.length > 0
                    ? jsxNode.attributes[jsxNode.attributes.length - 1]
                    : null

                  if (lastAttribute) {
                    return fixer.insertTextAfter(lastAttribute, ' tabIndex={-1}')
                  }
                  return null
                }
              }
            ]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        const roleAttr = getVueAttribute(vueNode, 'role')
        if (!roleAttr?.value?.value) return

        const roleValue = roleAttr.value.value.toLowerCase()
        if (!PRESENTATION_ROLES.includes(roleValue)) return

        if (isVueElementFocusable(vueNode)) {
          context.report({
            node,
            messageId: 'noRolePresentationOnFocusable',
            data: { role: roleValue },
            suggest: [
              {
                desc: 'Remove role attribute',
                fix(fixer) {
                  return fixer.remove(roleAttr as any)
                }
              }
            ]
          })
        }
      }
    }
  }
}

export default rule
