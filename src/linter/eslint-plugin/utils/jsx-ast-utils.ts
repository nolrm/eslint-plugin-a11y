/**
 * JSX AST to DOM Element conversion utilities
 * 
 * Converts JSX AST nodes to DOM Elements so they can be checked by A11yChecker
 * 
 * Note: Requires jsdom to be installed. If jsdom is not available,
 * JSX checks will be skipped gracefully.
 */

import type { Rule } from 'eslint'

// Lazy load jsdom - make it optional
let JSDOM: any = null
let jsdomWarningShown = false

function getJSDOM(): any {
  if (JSDOM !== null) {
    return JSDOM
  }
  
  try {
    // @ts-ignore - jsdom types may not be available
    JSDOM = require('jsdom').JSDOM
    return JSDOM
  } catch (error) {
    // jsdom not available - JSX checks will be limited
    if (!jsdomWarningShown) {
      console.warn(
        '[a11y] jsdom not found. JSX element conversion will be skipped. ' +
        'Install jsdom if you need JSX accessibility checks: npm install --save-dev jsdom'
      )
      jsdomWarningShown = true
    }
    return null
  }
}

/**
 * JSX Attribute AST node type
 */
interface JSXAttribute {
  name: {
    name?: string
    type?: string
  }
  value?: {
    type: string
    value?: string
    expression?: {
      type: string
      name?: string
    }
  }
  type: string
}

/**
 * JSX Opening Element AST node type
 */
interface JSXOpeningElement {
  name: {
    name?: string
    type?: string
  }
  attributes: JSXAttribute[]
  type: string
}

/**
 * JSX Element AST node type
 */
interface JSXElement {
  openingElement: JSXOpeningElement
  children?: Array<{
    type: string
    value?: string
    expression?: {
      type: string
    }
  }>
  type: string
}

/**
 * Get attribute value from JSX attribute
 */
function getJSXAttributeValue(attr: JSXAttribute): string | null {
  if (!attr.value) {
    // Boolean attribute (e.g., <input disabled />)
    return attr.name.name || null
  }

  if (attr.value.type === 'Literal') {
    return attr.value.value || null
  }

  if (attr.value.type === 'JSXExpressionContainer') {
    // Dynamic attribute (e.g., alt={variable})
    // We can't evaluate this statically, so return a placeholder
    if (attr.value.expression && typeof attr.value.expression === 'object' && 'type' in attr.value.expression && attr.value.expression.type === 'Literal' && 'value' in attr.value.expression) {
      return String(attr.value.expression.value) || null
    }
    // For dynamic values, we'll return null and handle in rules
    return null
  }

  return null
}

/**
 * Get all attributes from JSX opening element as a map
 */
function getJSXAttributes(element: JSXOpeningElement): Map<string, string> {
  const attributes = new Map<string, string>()
  
  for (const attr of element.attributes) {
    // Skip spread attributes (e.g., {...props})
    if (attr.type === 'JSXSpreadAttribute') {
      continue
    }
    
    const attrName = attr.name.name || attr.name.type
    if (attrName) {
      const value = getJSXAttributeValue(attr)
      if (value !== null) {
        attributes.set(attrName, value)
      }
    }
  }
  
  return attributes
}

/**
 * Get tag name from JSX element
 */
function getJSXTagName(element: JSXOpeningElement): string {
  if (element.name.name) {
    return element.name.name.toLowerCase()
  }
  return 'div' // fallback
}

/**
 * Get text content from JSX children
 */
function getJSXTextContent(
  children: JSXElement['children'] | undefined,
  _context: Rule.RuleContext
): string {
  if (!children) return ''
  
  return children
    .map(child => {
      if (child.type === 'JSXText') {
        return child.value || ''
      }
      if (child.type === 'JSXExpressionContainer') {
        // For expressions, we can't get the value statically
        // Return empty string - rules should handle this
        return ''
      }
      return ''
    })
    .join('')
    .trim()
}

/**
 * Convert JSX opening element to DOM Element
 * 
 * @param node - JSX opening element or JSX element node
 * @param context - ESLint rule context
 * @returns DOM Element representation
 */
export function jsxToElement(
  node: Rule.Node,
  context: Rule.RuleContext
): Element {
  const jsxNode = node as unknown as JSXElement | JSXOpeningElement
  const openingElement = 'openingElement' in jsxNode 
    ? jsxNode.openingElement 
    : jsxNode as JSXOpeningElement
  
  const tagName = getJSXTagName(openingElement)
  const attributes = getJSXAttributes(openingElement)
  
  // Create DOM element using JSDOM
  const JSDOMClass = getJSDOM()
  if (!JSDOMClass) {
    throw new Error('jsdom is required for JSX element conversion')
  }
  
  const dom = new JSDOMClass('<!DOCTYPE html><html><body></body></html>')
  const element = dom.window.document.createElement(tagName)
  
  // Set attributes
  for (const [name, value] of attributes.entries()) {
    element.setAttribute(name, value)
  }
  
  // Set text content if available
  if ('children' in jsxNode && jsxNode.children) {
    const textContent = getJSXTextContent(jsxNode.children, context)
    if (textContent) {
      element.textContent = textContent
    }
  }
  
  return element
}

/**
 * Check if JSX attribute is dynamic (uses expression)
 */
export function isJSXAttributeDynamic(attr: JSXAttribute): boolean {
  if (!attr.value) return false
  return (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression?.type !== 'Literal'
  )
}

/**
 * Get JSX attribute by name
 */
export function getJSXAttribute(
  element: JSXOpeningElement,
  name: string
): JSXAttribute | undefined {
  return element.attributes.find(
    attr => {
      // Skip spread attributes (e.g., {...props})
      if (attr.type === 'JSXSpreadAttribute') {
        return false
      }
      return attr.name.name === name || attr.name.type === name
    }
  )
}

/**
 * Check if JSX element has a specific attribute
 */
export function hasJSXAttribute(
  element: JSXOpeningElement,
  name: string
): boolean {
  return getJSXAttribute(element, name) !== undefined
}

