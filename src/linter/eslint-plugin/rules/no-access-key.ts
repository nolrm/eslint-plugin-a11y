/**
 * ESLint rule: no-access-key
 *
 * Disallows the accesskey attribute on elements.
 * Access keys create keyboard shortcuts that can conflict with screen readers
 * and other assistive technologies.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute } from '../utils/vue-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow accesskey attribute on elements',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      noAccessKey: 'The accesskey attribute creates keyboard shortcuts that conflict with assistive technology. Remove this attribute.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (hasJSXAttribute(jsxNode, 'accessKey') || hasJSXAttribute(jsxNode, 'accesskey')) {
          context.report({
            node,
            messageId: 'noAccessKey',
            suggest: [{
              desc: 'Remove accesskey attribute',
              fix(fixer) {
                const attr = jsxNode.attributes.find((a: any) =>
                  a.name?.name?.toLowerCase() === 'accesskey'
                )
                if (attr) {
                  return fixer.remove(attr)
                }
                return null
              }
            }]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        if (hasVueAttribute(vueNode, 'accesskey')) {
          context.report({
            node,
            messageId: 'noAccessKey',
            suggest: [{
              desc: 'Remove accesskey attribute',
              fix(fixer) {
                const attr = vueNode.startTag?.attributes?.find((a: any) =>
                  a.key?.name === 'accesskey' || a.key?.argument === 'accesskey'
                )
                if (attr) {
                  return fixer.remove(attr)
                }
                return null
              }
            }]
          })
        }
      }
    }
  }
}

export default rule
