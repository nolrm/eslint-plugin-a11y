/**
 * Unit tests for runtime comment utilities
 */

import { describe, it, expect } from 'vitest'
import type { Rule } from 'eslint'
import {
  hasRuntimeCheckedComment,
  adjustSeverityForRuntimeComment,
  getEffectiveSeverity
} from '../../../../../src/linter/eslint-plugin/utils/runtime-comment'

describe('runtime-comment utilities', () => {
  describe('hasRuntimeCheckedComment', () => {
    it('should return false when settings are not configured', () => {
      const mockContext = {
        settings: {},
        getSourceCode: () => ({
          getCommentsBefore: () => [],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: null
      } as unknown as Rule.Node

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(false)
      expect(result.mode).toBe(null)
    })

    it('should return false when runtimeCheckedComment is not set', () => {
      const mockContext = {
        settings: {
          'test-a11y-js': {
            components: { Link: 'a' }
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: null
      } as unknown as Rule.Node

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(false)
      expect(result.mode).toBe(null)
    })

    it('should detect comment in leading comments', () => {
      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'suppress'
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [
            { value: ' a11y-checked-at-runtime ' }
          ],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: null
      } as unknown as Rule.Node

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(true)
      expect(result.mode).toBe('suppress')
    })

    it('should detect comment in trailing comments', () => {
      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'downgrade'
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [],
          getCommentsAfter: () => [
            { value: ' a11y-checked-at-runtime ' }
          ]
        })
      } as unknown as Rule.RuleContext

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: null
      } as unknown as Rule.Node

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(true)
      expect(result.mode).toBe('downgrade')
    })

    it('should detect comment in parent node comments', () => {
      const mockParent = {
        type: 'JSXElement',
        parent: null
      }

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: mockParent
      } as unknown as Rule.Node

      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'suppress'
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: (node: any) => {
            if (node === mockNode) return []
            if (node === mockParent) return [{ value: ' a11y-checked-at-runtime ' }]
            return []
          },
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(true)
      expect(result.mode).toBe('suppress')
    })

    it('should default to downgrade mode when not specified', () => {
      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime'
            // runtimeCheckedMode not specified
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [
            { value: ' a11y-checked-at-runtime ' }
          ],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: null
      } as unknown as Rule.Node

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(true)
      expect(result.mode).toBe('downgrade')
    })
  })

  describe('adjustSeverityForRuntimeComment', () => {
    it('should return original severity when no comment', () => {
      const result = adjustSeverityForRuntimeComment('error', { hasComment: false, mode: null })
      expect(result).toBe('error')
    })

    it('should return off when mode is suppress', () => {
      const result = adjustSeverityForRuntimeComment('error', { hasComment: true, mode: 'suppress' })
      expect(result).toBe('off')
    })

    it('should downgrade error to warn when mode is downgrade', () => {
      const result = adjustSeverityForRuntimeComment('error', { hasComment: true, mode: 'downgrade' })
      expect(result).toBe('warn')
    })

    it('should downgrade warn to off when mode is downgrade', () => {
      const result = adjustSeverityForRuntimeComment('warn', { hasComment: true, mode: 'downgrade' })
      expect(result).toBe('off')
    })

    it('should return off unchanged when mode is downgrade', () => {
      const result = adjustSeverityForRuntimeComment('off', { hasComment: true, mode: 'downgrade' })
      expect(result).toBe('off')
    })
  })

  describe('getEffectiveSeverity', () => {
    it('should return default severity when no runtime comment', () => {
      const mockContext = {
        settings: {},
        getSourceCode: () => ({
          getCommentsBefore: () => [],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext
      const mockNode = { type: 'JSXOpeningElement', parent: null, range: [0, 10] } as unknown as Rule.Node

      expect(getEffectiveSeverity(mockContext, mockNode, 'error')).toBe('error')
      expect(getEffectiveSeverity(mockContext, mockNode, 'warn')).toBe('warn')
      expect(getEffectiveSeverity(mockContext, mockNode, 'off')).toBe('off')
    })

    it('should downgrade severity when runtime comment present with downgrade mode', () => {
      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'downgrade'
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [{ value: ' a11y-checked-at-runtime ' }],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext
      const mockNode = { type: 'JSXOpeningElement', parent: null, range: [0, 10] } as unknown as Rule.Node

      expect(getEffectiveSeverity(mockContext, mockNode, 'error')).toBe('warn')
      expect(getEffectiveSeverity(mockContext, mockNode, 'warn')).toBe('off')
    })

    it('should return off when runtime comment present with suppress mode', () => {
      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'suppress'
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [{ value: ' a11y-checked-at-runtime ' }],
          getCommentsAfter: () => []
        })
      } as unknown as Rule.RuleContext
      const mockNode = { type: 'JSXOpeningElement', parent: null, range: [0, 10] } as unknown as Rule.Node

      expect(getEffectiveSeverity(mockContext, mockNode, 'error')).toBe('off')
    })
  })

  describe('hasRuntimeCheckedComment — JSX expression-container comment path', () => {
    it('should detect comment inside JSXExpressionContainer sibling (parent JSXElement children)', () => {
      const jsxExprContainer = {
        type: 'JSXExpressionContainer',
        expression: { type: 'JSXEmptyExpression' }
      }
      const mockParent = {
        type: 'JSXElement',
        children: [jsxExprContainer],
        parent: null
      }

      const mockNode = {
        type: 'JSXOpeningElement',
        parent: mockParent,
        range: [50, 60]
      } as unknown as Rule.Node

      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'downgrade'
          }
        },
        getSourceCode: () => ({
          getCommentsBefore: () => [],
          getCommentsAfter: () => [],
          getCommentsInside: (n: any) => {
            if (n === jsxExprContainer) {
              return [{ value: ' a11y-checked-at-runtime ', range: [10, 40] }]
            }
            return []
          },
          getAllComments: () => []
        })
      } as unknown as Rule.RuleContext

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(true)
      expect(result.mode).toBe('downgrade')
    })
  })

  describe('hasRuntimeCheckedComment — proximity-scan fallback', () => {
    it('should detect comment within 50 chars before node when leading/parent comments do not', () => {
      const mockNode = {
        type: 'JSXOpeningElement',
        parent: { type: 'Program' },
        range: [50, 60]
      } as unknown as Rule.Node

      const commentWithin50 = {
        value: ' a11y-checked-at-runtime ',
        range: [10, 40]
      }

      const mockSourceCode = {
        getCommentsBefore: () => [],
        getCommentsAfter: () => [],
        getAllComments: () => [commentWithin50]
      }

      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'suppress'
          }
        },
        getSourceCode: () => mockSourceCode
      } as unknown as Rule.RuleContext

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(true)
      expect(result.mode).toBe('suppress')
    })

    it('should not match comment more than 50 chars before node', () => {
      const mockNode = {
        type: 'JSXOpeningElement',
        parent: { type: 'Program' },
        range: [100, 110]
      } as unknown as Rule.Node

      const commentFarAway = {
        value: ' a11y-checked-at-runtime ',
        range: [0, 30]
      }

      const mockSourceCode = {
        getCommentsBefore: () => [],
        getCommentsAfter: () => [],
        getAllComments: () => [commentFarAway]
      }

      const mockContext = {
        settings: {
          'test-a11y-js': {
            runtimeCheckedComment: 'a11y-checked-at-runtime',
            runtimeCheckedMode: 'downgrade'
          }
        },
        getSourceCode: () => mockSourceCode
      } as unknown as Rule.RuleContext

      const result = hasRuntimeCheckedComment(mockContext, mockNode)
      expect(result.hasComment).toBe(false)
      expect(result.mode).toBe(null)
    })
  })
})
