/**
 * ESLint rule: lang
 *
 * Validates that the lang attribute contains a valid BCP 47 language tag.
 * A valid language tag is essential for screen readers and other assistive
 * technologies to properly announce content.
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, getJSXAttribute, isJSXAttributeDynamic } from '../utils/jsx-ast-utils'
import { hasVueAttribute, getVueAttribute, isVueAttributeDynamic } from '../utils/vue-ast-utils'

// Common valid BCP 47 language codes (primary language subtags)
// This is not exhaustive but covers most common languages
const VALID_PRIMARY_LANGUAGES = new Set([
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
  'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs',
  'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy',
  'da', 'de', 'dv', 'dz',
  'ee', 'el', 'en', 'eo', 'es', 'et', 'eu',
  'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy',
  'ga', 'gd', 'gl', 'gn', 'gu', 'gv',
  'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz',
  'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'in', 'io', 'is', 'it', 'iu', 'iw',
  'ja', 'ji', 'jv', 'jw',
  'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky',
  'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mo', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny',
  'oc', 'oj', 'om', 'or', 'os',
  'pa', 'pi', 'pl', 'ps', 'pt',
  'qu',
  'rm', 'rn', 'ro', 'ru', 'rw',
  'sa', 'sc', 'sd', 'se', 'sg', 'sh', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty',
  'ug', 'uk', 'ur', 'uz',
  've', 'vi', 'vo',
  'wa', 'wo',
  'xh',
  'yi', 'yo',
  'za', 'zh', 'zu',
  // Grandfathered tags
  'und', // undetermined
])

// BCP 47 language tag pattern
// Simplified pattern: primary language (2-3 chars), optional script (4 chars), optional region (2-3 chars)
const BCP47_PATTERN = /^[a-z]{2,3}(-[A-Za-z]{4})?(-[A-Za-z]{2}|-[0-9]{3})?$/

/**
 * Validate a BCP 47 language tag
 */
function isValidLangTag(lang: string): boolean {
  if (!lang || typeof lang !== 'string') return false

  const normalized = lang.trim().toLowerCase()
  if (!normalized) return false

  // Extract primary language
  const primaryLang = normalized.split('-')[0]

  // Check if primary language is valid
  if (!VALID_PRIMARY_LANGUAGES.has(primaryLang)) {
    return false
  }

  // Check overall format matches BCP 47 pattern
  return BCP47_PATTERN.test(lang.trim())
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate lang attribute contains a valid BCP 47 language tag',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      invalidLang: 'The lang attribute value "{{value}}" is not a valid BCP 47 language tag. Use a valid language code like "en", "es", "fr", or "en-US".',
      emptyLang: 'The lang attribute must not be empty.',
      dynamicLang: 'The lang attribute is dynamic. Ensure it resolves to a valid BCP 47 language tag at runtime.'
    },
    hasSuggestions: false,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any

        if (!hasJSXAttribute(jsxNode, 'lang')) {
          return
        }

        const langAttr = getJSXAttribute(jsxNode, 'lang')
        if (!langAttr) return

        // Check if dynamic
        if (isJSXAttributeDynamic(langAttr)) {
          context.report({
            node,
            messageId: 'dynamicLang'
          })
          return
        }

        // Get static value
        if (langAttr.value?.type === 'Literal') {
          const value = langAttr.value.value

          if (typeof value !== 'string' || !value.trim()) {
            context.report({
              node,
              messageId: 'emptyLang'
            })
            return
          }

          if (!isValidLangTag(value)) {
            context.report({
              node,
              messageId: 'invalidLang',
              data: { value }
            })
          }
        }
      },

      VElement(node: Rule.Node) {
        const vueNode = node as any

        if (!hasVueAttribute(vueNode, 'lang')) {
          return
        }

        const langAttr = getVueAttribute(vueNode, 'lang')
        if (!langAttr) return

        // Check if dynamic
        if (isVueAttributeDynamic(langAttr)) {
          context.report({
            node,
            messageId: 'dynamicLang'
          })
          return
        }

        // Get static value
        const value = langAttr.value?.value

        if (typeof value !== 'string' || !value.trim()) {
          context.report({
            node,
            messageId: 'emptyLang'
          })
          return
        }

        if (!isValidLangTag(value)) {
          context.report({
            node,
            messageId: 'invalidLang',
            data: { value }
          })
        }
      }
    }
  }
}

export default rule
