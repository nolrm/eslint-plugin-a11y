/**
 * ESLint rule: prefer-tag-over-role
 *
 * Recommends using semantic native HTML elements instead of ARIA roles on
 * generic elements. Unlike no-noninteractive-element-to-interactive-role,
 * this rule fires unconditionally — even when keyboard support is present —
 * because native elements provide better built-in accessibility behaviour.
 *
 * e.g. <div role="button"> → use <button>
 *      <span role="heading" aria-level="2"> → use <h2>
 */

import type { Rule } from 'eslint'
import { getJSXAttribute } from '../utils/jsx-ast-utils'
import { getVueAttribute } from '../utils/vue-ast-utils'

/**
 * Maps ARIA roles to their preferred native HTML element(s).
 * Value is the suggestion shown in the error message.
 */
const ROLE_TO_TAG: Record<string, string> = {
  button: '<button>',
  checkbox: '<input type="checkbox">',
  combobox: '<select>',
  form: '<form>',
  heading: '<h1>–<h6> (with aria-level)',
  img: '<img>',
  link: '<a href="...">',
  list: '<ul> or <ol>',
  listitem: '<li>',
  listbox: '<select multiple>',
  main: '<main>',
  navigation: '<nav>',
  complementary: '<aside>',
  banner: '<header>',
  contentinfo: '<footer>',
  region: '<section aria-label="...">',
  radio: '<input type="radio">',
  searchbox: '<input type="search">',
  slider: '<input type="range">',
  spinbutton: '<input type="number">',
  table: '<table>',
  textbox: '<input> or <textarea>',
  meter: '<meter>',
  progressbar: '<progress>',
  radiogroup: '<fieldset>',
  row: '<tr>',
  rowgroup: '<thead>, <tbody>, or <tfoot>',
  columnheader: '<th scope="col">',
  rowheader: '<th scope="row">',
  article: '<article>',
  separator: '<hr>',
  term: '<dt>',
  definition: '<dd>',
}

function getStaticRole(node: any, getRoleAttr: (n: any) => any): string | null {
  const roleAttr = getRoleAttr(node)
  if (!roleAttr?.value) return null

  // JSX literal
  if (roleAttr.value.type === 'Literal' && typeof roleAttr.value.value === 'string') {
    return roleAttr.value.value.toLowerCase()
  }
  // JSX expression container with literal
  if (roleAttr.value.type === 'JSXExpressionContainer') {
    const expr = roleAttr.value.expression as any
    if (expr?.type === 'Literal' && typeof expr.value === 'string') {
      return expr.value.toLowerCase()
    }
  }
  // Vue static value
  if (typeof roleAttr.value.value === 'string') {
    return roleAttr.value.value.toLowerCase()
  }
  return null
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using semantic native HTML elements over ARIA role attributes',
      category: 'Accessibility',
      recommended: false,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      preferTag: 'Prefer {{tag}} over role="{{role}}" for better native accessibility semantics.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        // Skip native semantic elements (they already have the right implicit role)
        if (jsxNode.name?.type !== 'JSXIdentifier') return
        const tagName = jsxNode.name.name?.toLowerCase()

        // Only flag on generic/non-semantic elements
        const GENERIC_ELEMENTS = new Set([
          'div', 'span', 'section', 'article', 'aside', 'footer', 'header',
          'nav', 'main', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'figure', 'figcaption', 'blockquote', 'pre', 'i', 'b', 'em',
          'strong', 'small', 'mark', 'sub', 'sup', 'address',
        ])
        if (!GENERIC_ELEMENTS.has(tagName)) return

        const role = getStaticRole(jsxNode, (n) => getJSXAttribute(n, 'role'))
        if (!role) return

        const preferredTag = ROLE_TO_TAG[role]
        if (!preferredTag) return

        context.report({
          node,
          messageId: 'preferTag',
          data: { tag: preferredTag, role }
        })
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any
        const tagName = vueNode.name?.toLowerCase()

        const GENERIC_ELEMENTS = new Set([
          'div', 'span', 'section', 'article', 'aside', 'footer', 'header',
          'nav', 'main', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'figure', 'figcaption', 'blockquote', 'pre', 'i', 'b', 'em',
          'strong', 'small', 'mark', 'sub', 'sup', 'address',
        ])
        if (!GENERIC_ELEMENTS.has(tagName)) return

        const role = getStaticRole(vueNode, (n) => getVueAttribute(n, 'role'))
        if (!role) return

        const preferredTag = ROLE_TO_TAG[role]
        if (!preferredTag) return

        context.report({
          node,
          messageId: 'preferTag',
          data: { tag: preferredTag, role }
        })
      }
    }
  }
}

export default rule
