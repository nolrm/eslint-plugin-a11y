/**
 * ESLint rule: no-redundant-roles
 *
 * Flags elements whose explicit role matches their implicit ARIA role.
 * Redundant roles add noise without adding information for assistive technologies.
 * e.g. <button role="button"> or <nav role="navigation">
 */

import type { Rule } from 'eslint'
import { getJSXAttribute, hasJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute, hasVueAttribute } from '../utils/vue-ast-utils'
import { getElementRoleFromJSX } from '../utils/component-mapping'

/**
 * Get the implicit ARIA role for a given element tag and attributes.
 * Returns null when the element has no meaningful implicit role or
 * when the role depends on context that can't be determined statically.
 */
function getImplicitRole(
  tagName: string,
  getAttr: (name: string) => string | null,
  hasAttr: (name: string) => boolean
): string | null {
  switch (tagName) {
    case 'button':
      return 'button'
    case 'nav':
      return 'navigation'
    case 'main':
      return 'main'
    case 'aside':
      return 'complementary'
    case 'ul':
    case 'ol':
      return 'list'
    case 'li':
      return 'listitem'
    case 'img':
      return 'img'
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading'
    case 'article':
      return 'article'
    case 'table':
      return 'table'
    case 'tr':
      return 'row'
    case 'textarea':
      return 'textbox'
    case 'a': {
      // <a> with a real href has implicit role 'link'
      const href = getAttr('href')
      if (href !== null && href !== '' && href !== '#' && !href.toLowerCase().startsWith('javascript:')) {
        return 'link'
      }
      return null
    }
    case 'input': {
      const type = (getAttr('type') ?? 'text').toLowerCase()
      switch (type) {
        case 'checkbox': return 'checkbox'
        case 'radio': return 'radio'
        case 'range': return 'slider'
        case 'number': return 'spinbutton'
        case 'text':
        case 'email':
        case 'password':
        case 'search':
        case 'tel':
        case 'url':
          return 'textbox'
        default:
          return null
      }
    }
    case 'select': {
      // <select multiple> or <select size > 1> → listbox; otherwise → combobox
      if (hasAttr('multiple')) return 'listbox'
      const size = parseInt(getAttr('size') ?? '1', 10)
      if (!isNaN(size) && size > 1) return 'listbox'
      return 'combobox'
    }
    case 'section':
    case 'form': {
      // Only has a meaningful implicit role when it has an accessible name
      if (hasAttr('aria-label') || hasAttr('aria-labelledby')) {
        return tagName === 'section' ? 'region' : 'form'
      }
      return null
    }
    default:
      return null
  }
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow redundant roles that match an element\'s implicit ARIA role',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      redundantRole: 'The role "{{role}}" is redundant for <{{element}}>. It is the element\'s implicit ARIA role and does not need to be specified explicitly.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Resolve tag via component mapping (handles Nav→nav, Button→button, etc.)
        const tagName = getElementRoleFromJSX(node, context)
        if (!tagName) return

        const roleAttr = getJSXAttribute(jsxNode, 'role')
        if (!roleAttr) return

        let explicitRole: string | null = null
        if (roleAttr.value?.type === 'Literal' && typeof roleAttr.value.value === 'string') {
          explicitRole = roleAttr.value.value.toLowerCase()
        } else if (roleAttr.value?.type === 'JSXExpressionContainer') {
          const expr = roleAttr.value.expression as any
          if (expr?.type === 'Literal' && typeof expr.value === 'string') {
            explicitRole = expr.value.toLowerCase()
          }
        }
        if (!explicitRole) return

        const implicitRole = getImplicitRole(
          tagName,
          (name) => {
            const attr = getJSXAttribute(jsxNode, name)
            if (!attr) return null
            if (attr.value?.type === 'Literal') return String(attr.value.value)
            return ''
          },
          (name) => hasJSXAttribute(jsxNode, name)
        )

        if (implicitRole && explicitRole === implicitRole) {
          context.report({
            node: roleAttr as any,
            messageId: 'redundantRole',
            data: { role: explicitRole, element: tagName },
            suggest: [
              {
                desc: `Remove redundant role="${explicitRole}"`,
                fix(fixer) {
                  return fixer.remove(roleAttr as any)
                }
              }
            ]
          })
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        const roleAttr = getVueAttribute(vueNode, 'role')
        if (!roleAttr) return

        const explicitRole = roleAttr.value?.value?.toLowerCase()
        if (!explicitRole) return

        const implicitRole = getImplicitRole(
          tagName,
          (name) => {
            const attr = getVueAttribute(vueNode, name)
            return attr?.value?.value ?? null
          },
          (name) => hasVueAttribute(vueNode, name)
        )

        if (implicitRole && explicitRole === implicitRole) {
          context.report({
            node: roleAttr as any,
            messageId: 'redundantRole',
            data: { role: explicitRole, element: tagName }
          })
        }
      }
    }
  }
}

export default rule
