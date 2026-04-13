/**
 * ESLint rule: image-alt
 * 
 * Enforces that images have alt attributes for accessibility
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, isJSXAttributeDynamic, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, isVueAttributeDynamic, getVueAttribute } from '../utils/vue-ast-utils'
import { isElementLike } from '../utils/component-mapping'
import { getImageAltOptions, isImageDecorative } from '../utils/rule-options'
import { hasRuntimeCheckedComment } from '../utils/runtime-comment'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce images have alt attributes',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingAlt: 'Image must have an alt attribute',
      emptyAlt: 'Image alt attribute must not be empty',
      emptyAltNotDecorative: 'Empty alt should only be used for decorative images. Add aria-hidden="true" or role="presentation" if decorative.',
      dynamicAlt: 'Image alt attribute is dynamic. Ensure it is not empty at runtime.'
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          allowMissingAltOnDecorative: {
            type: 'boolean'
          },
          decorativeMatcher: {
            type: 'object',
            properties: {
              requireAriaHidden: { type: 'boolean' },
              requireRolePresentation: { type: 'boolean' },
              markerAttributes: {
                type: 'array',
                items: { type: 'string' }
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = getImageAltOptions(context.options)
    
    return {
      // Check JSX img elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions like <UI.Image>)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }

        const tagName = jsxNode.name.name

        // Detect element types that require alt attributes
        const isImg = tagName === 'img' || isElementLike(node, context, 'img')
        const isArea = tagName === 'area'
        const typeAttr = getJSXAttribute(jsxNode, 'type')
        const isInputImage = tagName === 'input' &&
          typeAttr?.value?.type === 'Literal' && typeAttr.value.value === 'image'

        if (isImg || isArea || isInputImage) {
          // Check if image is decorative (only applies to img, not area/input)
          const isDecorative = isImg && isImageDecorative(
            jsxNode,
            options,
            hasJSXAttribute,
            getJSXAttribute
          )

          // Check if alt attribute exists
          if (!hasJSXAttribute(jsxNode, 'alt')) {
            if (!isDecorative) {
              // Check for runtime comment - suppress if mode is 'suppress'
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'missingAlt'
                })
              }
            }
            return
          }

          // Check if alt is dynamic
          const altAttr = getJSXAttribute(jsxNode, 'alt')
          if (altAttr && isJSXAttributeDynamic(altAttr)) {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'dynamicAlt'
              })
            }
            return
          }

          // Check if alt is empty string
          if (altAttr && altAttr.value && altAttr.value.type === 'Literal' && altAttr.value.value === '') {
            // For area without href, empty alt is acceptable (inactive image map area)
            if (isArea && !hasJSXAttribute(jsxNode, 'href')) {
              return
            }
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              if (!isDecorative) {
                context.report({
                  node,
                  messageId: 'emptyAltNotDecorative'
                })
              } else {
                // Even if decorative, warn if empty alt without proper markers
                context.report({
                  node,
                  messageId: 'emptyAlt'
                })
              }
            }
          }
        }
      },


      // Check Vue template elements
      VElement(node: Rule.Node) {
        const vueNode = node as any

        const isVueImg = vueNode.name === 'img'
        const isVueArea = vueNode.name === 'area'
        const vueTypeAttr = getVueAttribute(vueNode, 'type')
        const isVueInputImage = vueNode.name === 'input' &&
          vueTypeAttr?.value?.value === 'image'

        if (isVueImg || isVueArea || isVueInputImage) {
          // For Vue, check decorative status (only for img elements)
          const hasAriaHidden = hasVueAttribute(vueNode, 'aria-hidden')
          const roleAttr = getVueAttribute(vueNode, 'role')
          const hasRolePresentation = roleAttr?.value?.value === 'presentation'
          const isDecorative = isVueImg && options.allowMissingAltOnDecorative &&
            (hasAriaHidden || hasRolePresentation ||
             (options.decorativeMatcher?.markerAttributes?.some(attr =>
               hasVueAttribute(vueNode, attr)) ?? false))

          // Check if alt attribute exists
          if (!hasVueAttribute(vueNode, 'alt')) {
            if (!isDecorative) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'missingAlt'
                })
              }
            }
            return
          }

          // Check if alt is dynamic
          const altAttr = getVueAttribute(vueNode, 'alt')
          if (altAttr && isVueAttributeDynamic(altAttr)) {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'dynamicAlt'
              })
            }
            return
          }

          // Check if alt is empty string
          if (altAttr && altAttr.value && altAttr.value.value === '') {
            // For area without href, empty alt is acceptable (inactive image map area)
            if (isVueArea && !hasVueAttribute(vueNode, 'href')) {
              return
            }
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              if (!isDecorative) {
                context.report({
                  node,
                  messageId: 'emptyAltNotDecorative'
                })
              } else {
                context.report({
                  node,
                  messageId: 'emptyAlt'
                })
              }
            }
          }
        }
      }
    }
  }
}

export default rule

