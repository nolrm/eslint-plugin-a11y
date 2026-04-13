/**
 * ESLint rule: html-has-lang
 *
 * Requires that the <html> element has a lang attribute.
 * The lang attribute is essential for screen readers to announce
 * content with the correct pronunciation.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute } from '../utils/vue-ast-utils'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require lang attribute on <html> element',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      htmlMustHaveLang: '<html> element must have a lang attribute for screen readers to announce content correctly.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Only check html elements
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }

        if (jsxNode.name.name.toLowerCase() !== 'html') {
          return
        }

        // Check for lang attribute
        if (!hasJSXAttribute(jsxNode, 'lang')) {
          context.report({
            node,
            messageId: 'htmlMustHaveLang',
            suggest: [{
              desc: 'Add lang="en" attribute',
              fix(fixer) {
                const lastAttribute = jsxNode.attributes && jsxNode.attributes.length > 0
                  ? jsxNode.attributes[jsxNode.attributes.length - 1]
                  : null

                if (lastAttribute) {
                  return fixer.insertTextAfter(lastAttribute, ' lang="en"')
                }
                return fixer.insertTextAfter(jsxNode.name, ' lang="en"')
              }
            }]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        // Only check html elements
        if (tagName !== 'html') {
          return
        }

        // Check for lang attribute
        if (!hasVueAttribute(vueNode, 'lang')) {
          context.report({
            node,
            messageId: 'htmlMustHaveLang',
            suggest: [{
              desc: 'Add lang="en" attribute',
              fix(fixer) {
                const startTag = vueNode.startTag
                const lastAttribute = startTag?.attributes && startTag.attributes.length > 0
                  ? startTag.attributes[startTag.attributes.length - 1]
                  : null

                if (lastAttribute) {
                  return fixer.insertTextAfter(lastAttribute, ' lang="en"')
                }
                // Insert after <html
                const tagNameEnd = startTag.range[0] + vueNode.name.length + 1
                return fixer.insertTextAfterRange([startTag.range[0], tagNameEnd], ' lang="en"')
              }
            }]
          })
        }
      }
    }
  }
}

export default rule
