/**
 * ESLint rule for ARIA validation (AST-first, no JSDOM)
 * Validates ARIA roles, properties, and ID references using pure AST analysis
 */

import { Rule } from 'eslint'
import { validateJSXAria, validateVueAria } from '../utils/aria-ast-validation'
import { hasRuntimeCheckedComment } from '../utils/runtime-comment'

// Issue ids that respect the `a11y-checked-at-runtime` suppression comment (mode: 'suppress').
// Only newly-added checks opt into this; pre-existing issue ids keep their established
// (non-suppressible) behavior to avoid changing behavior outside this task's scope.
const RUNTIME_SUPPRESSIBLE_ISSUE_IDS = new Set<string>([
  'aria-role-missing-required-props',
  'aria-unsupported-element'
])

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid ARIA attributes, roles, and properties',
      category: 'Accessibility',
      recommended: true // Graduated from opt-in: role-required-properties and
      // unsupported-element checks landed and were validated against JSX/Vue fixtures.
    },
    messages: {
      ariaViolation: '{{message}}'
    },
    schema: []
  },
  create(context: Rule.RuleContext) {
    // Track all IDs in the file for reference validation
    const allIds = new Set<string>()
    const jsxNodes: any[] = []
    const vueNodes: any[] = []
    
    return {
      // Collect IDs and store JSX nodes for validation
      JSXOpeningElement(node: any) {
        // Collect ID
        if (node.attributes) {
          for (const attr of node.attributes) {
            if (attr.name?.name === 'id' && attr.value?.type === 'Literal') {
              const idValue = attr.value.value
              if (typeof idValue === 'string') {
                allIds.add(idValue)
              }
            }
          }
        }
        
        // Store for validation at Program:exit
        jsxNodes.push(node)
      },
      
      // Collect IDs and store Vue nodes for validation
      VElement(node: any) {
        // Collect ID
        if (node.startTag?.attributes) {
          for (const attr of node.startTag.attributes) {
            const attrName = attr.key?.name || attr.key?.argument
            if (attrName === 'id' && attr.value?.value && typeof attr.value.value === 'string') {
              allIds.add(attr.value.value)
            }
          }
        }
        
        // Store for validation at Program:exit
        vueNodes.push(node)
      },
      
      // Validate all elements after collecting all IDs
      'Program:exit'() {
        // Validate JSX elements
        for (const node of jsxNodes) {
          const issues = validateJSXAria(node, allIds)
          for (const issue of issues) {
            if (RUNTIME_SUPPRESSIBLE_ISSUE_IDS.has(issue.id)) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (runtimeComment.hasComment && runtimeComment.mode === 'suppress') {
                continue
              }
            }
            context.report({
              node,
              messageId: 'ariaViolation',
              data: {
                message: issue.message
              }
            })
          }
        }

        // Validate Vue elements
        for (const node of vueNodes) {
          const issues = validateVueAria(node, allIds)
          for (const issue of issues) {
            if (RUNTIME_SUPPRESSIBLE_ISSUE_IDS.has(issue.id)) {
              const runtimeComment = hasRuntimeCheckedComment(context, node)
              if (runtimeComment.hasComment && runtimeComment.mode === 'suppress') {
                continue
              }
            }
            context.report({
              node,
              messageId: 'ariaViolation',
              data: {
                message: issue.message
              }
            })
          }
        }
      }
    }
  }
}

export default rule

