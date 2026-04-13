/**
 * ESLint rule: link-text
 * 
 * Enforces that links have descriptive text
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, isJSXAttributeDynamic, getJSXAttribute } from '../utils/jsx-ast-utils'
import { hasVueAttribute, isVueAttributeDynamic, getVueAttribute } from '../utils/vue-ast-utils'
import { isElementLike } from '../utils/component-mapping'
import { getLinkTextOptions, matchesDenylist } from '../utils/rule-options'
import { hasRuntimeCheckedComment } from '../utils/runtime-comment'

/**
 * Get accessible name from JSX element (text, aria-label, aria-labelledby)
 */
function getJSXAccessibleName(node: any, _context: Rule.RuleContext): { text: string; source: 'text' | 'aria-label' | 'aria-labelledby' | null } {
  // Check aria-label first
  const ariaLabelAttr = getJSXAttribute(node, 'aria-label')
  if (ariaLabelAttr && ariaLabelAttr.value?.type === 'Literal') {
    return { text: ariaLabelAttr.value.value || '', source: 'aria-label' }
  }
  
  // Check aria-labelledby (would need to resolve ID, but for now just note it exists)
  if (hasJSXAttribute(node, 'aria-labelledby')) {
    return { text: '', source: 'aria-labelledby' }
  }
  
  // Check text content and image children
  const parent = node.parent
  const jsxElement = parent
  if (jsxElement?.children) {
    const textContent = jsxElement.children
      .filter((child: any) => child.type === 'JSXText')
      .map((child: any) => child.value || '')
      .join('')
      .trim()
    if (textContent) {
      return { text: textContent, source: 'text' }
    }

    // Also check img children with non-empty alt as accessible name source
    // e.g. <a><img alt="Home" /></a> is valid
    for (const child of jsxElement.children) {
      if (child.type === 'JSXElement') {
        const childOpening = child.openingElement
        if (childOpening?.name?.name === 'img') {
          const altAttr = childOpening.attributes?.find((attr: any) => attr.name?.name === 'alt')
          if (altAttr?.value?.type === 'Literal' && typeof altAttr.value.value === 'string' && altAttr.value.value !== '') {
            return { text: altAttr.value.value, source: 'text' }
          }
        }
      }
    }
  }

  return { text: '', source: null }
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce links have descriptive text',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingText: 'Link must have descriptive text',
      nonDescriptive: 'Link text should be more descriptive (avoid "click here", "read more", etc.)',
      dynamicText: 'Link text is dynamic. Ensure it is descriptive at runtime.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          denylist: {
            type: 'array',
            items: { type: 'string' }
          },
          caseInsensitive: {
            type: 'boolean'
          },
          allowlistPatterns: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context: Rule.RuleContext) {
    const options = getLinkTextOptions(context.options)
    
    return {
      // Check JSX anchor elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        // Check if it's an anchor element (native or mapped component)
        if (jsxNode.name.name === 'a' || isElementLike(node, context, 'a')) {
          // Get accessible name from multiple sources
          const accessibleName = getJSXAccessibleName(jsxNode, context)
          
          // Check if aria-label is dynamic
          const ariaLabelAttr = getJSXAttribute(jsxNode, 'aria-label')
          if (ariaLabelAttr && isJSXAttributeDynamic(ariaLabelAttr)) {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'dynamicText',
              })
            }
            return
          }

          // Check if link has no accessible name
          if (!accessibleName.text && accessibleName.source !== 'aria-labelledby') {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'missingText'
              })
            }
            return
          }

          // Check if text matches denylist
          if (accessibleName.text && matchesDenylist(accessibleName.text, options)) {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'nonDescriptive',
                suggest: [{
                  desc: 'Replace with descriptive text placeholder',
                  fix(fixer) {
                    // Find the text node to replace
                    const parent = (node as any).parent
                    if (parent && parent.children) {
                      const textChild = parent.children.find((child: any) => 
                        child.type === 'JSXText' && child.value.trim() === accessibleName.text
                      )
                      if (textChild) {
                        return fixer.replaceText(textChild, '[add descriptive link text]')
                      }
                    }
                    // If we can't find the text node, suggest adding aria-label instead
                    const lastAttribute = jsxNode.attributes && jsxNode.attributes.length > 0
                      ? jsxNode.attributes[jsxNode.attributes.length - 1]
                      : null
                    if (lastAttribute) {
                      return fixer.insertTextAfter(lastAttribute, ' aria-label="[add descriptive link text]"')
                    } else {
                      return fixer.insertTextAfter(jsxNode.name, ' aria-label="[add descriptive link text]"')
                    }
                  }
                }]
              })
            }
          }
        }
      },


      // Check Vue template elements
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'a') {
          // Get accessible name from multiple sources
          let accessibleText = ''
          let source: 'text' | 'aria-label' | 'aria-labelledby' | null = null
          
          // Check aria-label
          const ariaLabelAttr = getVueAttribute(vueNode, 'aria-label')
          if (ariaLabelAttr) {
            if (isVueAttributeDynamic(ariaLabelAttr)) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'dynamicText',
                })
              }
              return
            }
            if (ariaLabelAttr.value?.value) {
              accessibleText = ariaLabelAttr.value.value
              source = 'aria-label'
            }
          }
          
          // Check aria-labelledby
          if (!source && hasVueAttribute(vueNode, 'aria-labelledby')) {
            source = 'aria-labelledby'
          }
          
          // Check text content and image children
          if (!source && vueNode.children) {
            const textContent = vueNode.children
              .filter((child: any) => child.type === 'VText')
              .map((child: any) => child.value || '')
              .join('')
              .trim()
            if (textContent) {
              accessibleText = textContent
              source = 'text'
            }

            // Also check img children with non-empty alt as accessible name source
            // e.g. <a><img alt="Home" /></a> is valid
            if (!source) {
              for (const child of vueNode.children) {
                if (child.type === 'VElement' && child.name === 'img') {
                  const altAttr = child.startTag?.attributes?.find((attr: any) =>
                    !attr.directive && attr.key?.name === 'alt'
                  )
                  if (altAttr?.value?.value && altAttr.value.value !== '') {
                    accessibleText = altAttr.value.value
                    source = 'text'
                    break
                  }
                }
              }
            }
          }

          // Check if link has no accessible name
          if (!accessibleText && source !== 'aria-labelledby') {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'missingText'
              })
            }
            return
          }

          // Check if text matches denylist
          if (accessibleText && matchesDenylist(accessibleText, options)) {
            const runtimeComment = hasRuntimeCheckedComment(context, node)
            if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
              context.report({
                node,
                messageId: 'nonDescriptive',
                suggest: [{
                  desc: 'Replace with descriptive text placeholder',
                  fix(fixer) {
                    // For Vue, suggest adding aria-label since text replacement is complex
                    const startTag = vueNode.startTag
                    const lastAttribute = startTag.attributes && startTag.attributes.length > 0
                      ? startTag.attributes[startTag.attributes.length - 1]
                      : null
                    if (lastAttribute) {
                      return fixer.insertTextAfter(lastAttribute, ' aria-label="[add descriptive link text]"')
                    } else {
                      const tagNameEnd = startTag.range[0] + vueNode.name.length
                      return fixer.insertTextAfterRange([startTag.range[0], tagNameEnd], ' aria-label="[add descriptive link text]"')
                    }
                  }
                }]
              })
            }
          }
        }
      }
    }
  }
}

export default rule

