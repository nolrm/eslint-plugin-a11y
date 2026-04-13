/**
 * Runtime comment utilities for static + runtime workflow integration
 * 
 * Allows rules to recognize when accessibility is checked at runtime via A11yChecker,
 * enabling a downgrade or suppress behavior for those cases.
 */

import type { Rule } from 'eslint'
import type { A11yPluginSettings } from './component-mapping'

// Per-file cache for getAllComments() — avoids an O(n) full-file scan per node.
// Keyed by the sourceCode object (one instance per file); WeakMap allows GC when done.
const sortedCommentsCache = new WeakMap<object, any[]>()

function getCachedSortedComments(sourceCode: ReturnType<Rule.RuleContext['getSourceCode']>): any[] {
  const key = sourceCode as unknown as object
  let comments = sortedCommentsCache.get(key)
  if (!comments) {
    comments = sourceCode.getAllComments().slice().sort(
      (a: any, b: any) => (a.range?.[0] ?? 0) - (b.range?.[0] ?? 0)
    )
    sortedCommentsCache.set(key, comments)
  }
  return comments
}

/**
 * Check if a node (or its nearest parent) has a runtime-checked comment
 * 
 * Comment granularity: Apply to the node + its descendants (nearest parent comment applies to subtree)
 * 
 * @param context - ESLint rule context
 * @param node - The node to check
 * @returns Object with `hasComment` boolean and `mode` ('downgrade' | 'suppress' | null)
 */
export function hasRuntimeCheckedComment(
  context: Rule.RuleContext,
  node: Rule.Node
): { hasComment: boolean; mode: 'downgrade' | 'suppress' | null } {
  const settings = (context.settings || {}) as A11yPluginSettings
  const pluginSettings = settings['a11y']
  
  // If not configured, return no comment
  if (!pluginSettings?.runtimeCheckedComment) {
    return { hasComment: false, mode: null }
  }
  
  const commentMarker = pluginSettings.runtimeCheckedComment
  const mode = pluginSettings.runtimeCheckedMode || 'downgrade'
  
  // Get source code to access comments
  const sourceCode = context.getSourceCode()
  
  // Check leading comments on the node itself
  const leadingComments = sourceCode.getCommentsBefore(node)
  for (const comment of leadingComments) {
    if (comment.value.includes(commentMarker)) {
      return { hasComment: true, mode }
    }
  }
  
  // Check trailing comments on the node
  const trailingComments = sourceCode.getCommentsAfter(node)
  for (const comment of trailingComments) {
    if (comment.value.includes(commentMarker)) {
      return { hasComment: true, mode }
    }
  }
  
  // Check parent nodes (nearest parent comment applies to subtree)
  // Also check for JSX comments in JSXElement children
  let parent = node.parent
  while (parent) {
    // Check regular comments
    const parentLeadingComments = sourceCode.getCommentsBefore(parent)
    for (const comment of parentLeadingComments) {
      if (comment.value.includes(commentMarker)) {
        return { hasComment: true, mode }
      }
    }
    
    const parentTrailingComments = sourceCode.getCommentsAfter(parent)
    for (const comment of parentTrailingComments) {
      if (comment.value.includes(commentMarker)) {
        return { hasComment: true, mode }
      }
    }
    
    // Check JSX comments in JSXElement children
    const parentAny = parent as any
    if (parentAny.type === 'JSXElement' && parentAny.children) {
      for (const child of parentAny.children) {
        // JSX comments are JSXExpressionContainer with JSXEmptyExpression
        if (child.type === 'JSXExpressionContainer' && child.expression) {
          // Check if it's a comment (JSXEmptyExpression with comment)
          const commentNodes = sourceCode.getCommentsInside(child)
          for (const comment of commentNodes) {
            if (comment.value.includes(commentMarker)) {
              return { hasComment: true, mode }
            }
          }
        }
      }
    }
    
    // Stop at Program level to avoid checking too far up
    if (parent.type === 'Program') {
      break
    }
    
    parent = parent.parent
  }
  
  // Also check JSX comments in the current node's parent JSXElement
  // JSX comments are JSXExpressionContainer nodes with JSXEmptyExpression
  const nodeParent = node.parent as any
  if (nodeParent && nodeParent.type === 'JSXElement') {
    if (nodeParent.children) {
      for (const child of nodeParent.children) {
        // JSX comments: {/* comment */}
        if (child.type === 'JSXExpressionContainer') {
          // Check if it's an empty expression (comment)
          if (child.expression && child.expression.type === 'JSXEmptyExpression') {
            // Get comments inside the expression container
            const commentNodes = sourceCode.getCommentsInside(child)
            for (const comment of commentNodes) {
              if (comment.value.includes(commentMarker)) {
                return { hasComment: true, mode }
              }
            }
          }
        }
      }
    }
  }
  
  // Fallback: scan comments near the node's range.
  // Handles JSX comments not properly associated via getCommentsBefore/After.
  // Uses a per-file sorted cache so getAllComments() is called once per file,
  // and breaks early once past the node position.
  const nodeStart = node.range?.[0]
  if (nodeStart !== undefined) {
    const allComments = getCachedSortedComments(sourceCode)
    for (const comment of allComments) {
      const commentStart = comment.range?.[0]
      if (commentStart === undefined) continue
      if (commentStart >= nodeStart) break  // sorted: no earlier candidates remain
      if (nodeStart - commentStart < 50 && comment.value.includes(commentMarker)) {
        return { hasComment: true, mode }
      }
    }
  }
  
  return { hasComment: false, mode: null }
}

/**
 * Adjust rule severity based on runtime comment
 * 
 * @param originalSeverity - The original severity ('error' | 'warn' | 'off')
 * @param runtimeComment - Result from hasRuntimeCheckedComment
 * @returns Adjusted severity level
 */
export function adjustSeverityForRuntimeComment(
  originalSeverity: 'error' | 'warn' | 'off',
  runtimeComment: { hasComment: boolean; mode: 'downgrade' | 'suppress' | null }
): 'error' | 'warn' | 'off' {
  if (!runtimeComment.hasComment || !runtimeComment.mode) {
    return originalSeverity
  }
  
  if (runtimeComment.mode === 'suppress') {
    return 'off'
  }
  
  // Default mode: 'downgrade'
  // error → warn, warn → off
  if (originalSeverity === 'error') {
    return 'warn'
  }
  
  if (originalSeverity === 'warn') {
    return 'off'
  }
  
  return originalSeverity
}

/**
 * Get the effective severity for a rule report, considering runtime comments
 * 
 * @param context - ESLint rule context
 * @param node - The node being reported
 * @param defaultSeverity - The default severity from rule config
 * @returns Effective severity to use for the report
 */
export function getEffectiveSeverity(
  context: Rule.RuleContext,
  node: Rule.Node,
  defaultSeverity: 'error' | 'warn' | 'off'
): 'error' | 'warn' | 'off' {
  const runtimeComment = hasRuntimeCheckedComment(context, node)
  return adjustSeverityForRuntimeComment(defaultSeverity, runtimeComment)
}
