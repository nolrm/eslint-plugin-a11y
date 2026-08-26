/**
 * ESLint rule: button-label
 * 
 * Enforces that buttons have labels or aria-label attributes
 */

import type { Rule } from 'eslint'
import { hasJSXAttribute, isJSXAttributeDynamic } from '../utils/jsx-ast-utils'
import { hasVueAttribute, isVueAttributeDynamic } from '../utils/vue-ast-utils'
import { isElementLike, type A11yPluginSettings } from '../utils/component-mapping'
import { hasRuntimeCheckedComment } from '../utils/runtime-comment'

// Default prop name checked for an accessible name on custom (non-native)
// button-like components, e.g. <Button label="Cancel" /> - configurable via
// settings['a11y'].labelPropNames since design systems vary the prop name.
const DEFAULT_LABEL_PROP_NAMES = ['label']

/**
 * Checks whether a custom button-like component (JSX) has an accessible name
 * via one of the configured label props. Reports `dynamicLabel` for dynamic
 * values it can't verify statically. Returns true if the element should be
 * treated as labeled (i.e. the caller should not report `missingLabel`).
 */
function hasJSXLabelProp(
  jsxNode: any,
  node: Rule.Node,
  context: Rule.RuleContext
): boolean {
  const settings = (context.settings || {}) as A11yPluginSettings
  const labelPropNames = settings['a11y']?.labelPropNames || DEFAULT_LABEL_PROP_NAMES

  for (const propName of labelPropNames) {
    const labelAttr = jsxNode.attributes?.find((attr: any) => attr.name?.name === propName)
    if (!labelAttr) continue

    if (isJSXAttributeDynamic(labelAttr)) {
      const runtimeComment = hasRuntimeCheckedComment(context, node)
      if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
        context.report({ node, messageId: 'dynamicLabel' })
      }
      return true
    }

    if (labelAttr.value?.type === 'Literal' && typeof labelAttr.value.value === 'string' && labelAttr.value.value.trim().length > 0) {
      return true
    }
  }

  return false
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce buttons have labels or aria-label',
      category: 'Accessibility',
      recommended: true,
      url: 'https://github.com/nolrm/eslint-plugin-a11y'
    },
    messages: {
      missingLabel: 'Button must have a label or aria-label',
      dynamicLabel: 'Button label is dynamic. Ensure it is not empty at runtime.'
    },
    hasSuggestions: true,
    fixable: undefined,
    schema: []
  },
  create(context: Rule.RuleContext) {
    return {
      // Check JSX button elements
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as any
        
        // Only handle simple identifiers (not member expressions like <UI.Button>)
        if (!jsxNode.name || jsxNode.name.type !== 'JSXIdentifier') {
          return
        }
        
        // Check if it's a button element (native or mapped component)
        const isNativeButton = jsxNode.name.name === 'button'
        if (isNativeButton || isElementLike(node, context, 'button')) {
          // Quick check: if no aria-label and no text content, report
          const hasAriaLabel = hasJSXAttribute(jsxNode, 'aria-label')
          const hasAriaLabelledBy = hasJSXAttribute(jsxNode, 'aria-labelledby')
          
          // Check if aria-label is dynamic
          if (hasAriaLabel) {
            const ariaLabelAttr = jsxNode.attributes?.find((attr: any) => 
              attr.name?.name === 'aria-label'
            )
            if (ariaLabelAttr && isJSXAttributeDynamic(ariaLabelAttr)) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'dynamicLabel'
                })
              }
              return
            }
          }

          // Check if button has no accessible name
          if (!hasAriaLabel && !hasAriaLabelledBy) {
            // Check if JSXElement has children (text content)
            const parent = node as any
            const jsxElement = parent.parent
            const hasChildren = jsxElement?.children && jsxElement.children.length > 0

            if (!hasChildren) {
              // Custom components (e.g. <Button label="Cancel" />) may carry their
              // accessible name via a prop instead of children/aria-label.
              if (!isNativeButton && hasJSXLabelProp(jsxNode, node, context)) {
                return
              }

              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'missingLabel',
                  suggest: [{
                    desc: 'Add aria-label attribute for icon-only button',
                    fix(fixer) {
                      const lastAttribute = jsxNode.attributes && jsxNode.attributes.length > 0
                        ? jsxNode.attributes[jsxNode.attributes.length - 1]
                        : null
                      
                      if (lastAttribute) {
                        return fixer.insertTextAfter(lastAttribute, ' aria-label=""')
                      } else {
                        return fixer.insertTextAfter(jsxNode.name, ' aria-label=""')
                      }
                    }
                  }]
                })
              }
            }
          }
        }
      },


      // Check Vue template elements
      // Note: component mapping (settings['a11y'].components) only resolves
      // JSX identifiers today (see getElementRoleFromJSX) - Vue custom
      // components are not matched here, matching the rest of the plugin's
      // Vue rules (e.g. image-alt, link-text), which also check literal tag
      // names only.
      VElement(node: Rule.Node) {
        const vueNode = node as any
        if (vueNode.name === 'button') {
          // Quick check: if no aria-label and no text content, report
          const hasAriaLabel = hasVueAttribute(vueNode, 'aria-label')
          const hasAriaLabelledBy = hasVueAttribute(vueNode, 'aria-labelledby')
          
          // Check if aria-label is dynamic
          if (hasAriaLabel) {
            const ariaLabelAttr = vueNode.startTag?.attributes?.find((attr: any) => 
              attr.key?.name === 'aria-label' || attr.key?.argument === 'aria-label'
            )
            if (ariaLabelAttr && isVueAttributeDynamic(ariaLabelAttr)) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'dynamicLabel'
                })
              }
              return
            }
          }

          // Check if button has no accessible name
          if (!hasAriaLabel && !hasAriaLabelledBy) {
            // Check if there are children (text content)
            const hasChildren = vueNode.children && vueNode.children.length > 0
            if (!hasChildren) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (!(runtimeComment.hasComment && runtimeComment.mode === 'suppress')) {
                context.report({
                  node,
                  messageId: 'missingLabel',
                  suggest: [{
                    desc: 'Add aria-label attribute for icon-only button',
                    fix(fixer) {
                      const startTag = vueNode.startTag
                      const lastAttribute = startTag.attributes && startTag.attributes.length > 0
                        ? startTag.attributes[startTag.attributes.length - 1]
                        : null
                      
                      if (lastAttribute) {
                        return fixer.insertTextAfter(lastAttribute, ' aria-label=""')
                      } else {
                        const tagNameEnd = startTag.range[0] + vueNode.name.length
                        return fixer.insertTextAfterRange([startTag.range[0], tagNameEnd], ' aria-label=""')
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
}

export default rule

