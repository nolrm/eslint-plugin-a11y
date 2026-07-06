/**
 * AST-based ARIA validation utilities
 * 
 * These functions validate ARIA attributes without using JSDOM/DOM,
 * working purely on AST nodes.
 */

import { ARIA_ROLES, ARIA_PROPERTIES, ARIA_IN_HTML, DEPRECATED_ARIA, ARIA_UNSUPPORTED_ELEMENTS } from '../../../core/aria-spec'
import { getJSXAttribute } from './jsx-ast-utils'
import { getVueAttribute } from './vue-ast-utils'

export interface AriaValidationIssue {
  id: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Get role value from JSX node
 */
function getJSXRole(node: any): string | null {
  const roleAttr = getJSXAttribute(node, 'role')
  if (!roleAttr || !roleAttr.value) return null
  
  if (roleAttr.value.type === 'Literal' && typeof roleAttr.value.value === 'string') {
    return roleAttr.value.value
  }
  
  return null // Dynamic role
}

/**
 * Get role value from Vue node
 */
function getVueRole(node: any): string | null {
  const roleAttr = getVueAttribute(node, 'role')
  if (!roleAttr || !roleAttr.value) return null
  
  if (roleAttr.value.value && typeof roleAttr.value.value === 'string') {
    return roleAttr.value.value
  }
  
  return null // Dynamic role
}

/**
 * Get tag name from JSX node
 */
function getJSXTagName(node: any): string {
  if (node.name?.type === 'JSXIdentifier') {
    return node.name.name.toLowerCase()
  }
  return ''
}

/**
 * Get tag name from Vue node
 */
function getVueTagName(node: any): string {
  return node.name?.toLowerCase() || ''
}

/**
 * Validate ARIA role value
 */
export function validateRole(role: string, tagName: string): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  
  // Check if role exists
  if (!ARIA_ROLES[role]) {
    issues.push({
      id: 'aria-invalid-role',
      message: `Invalid ARIA role: "${role}"`,
      severity: 'error'
    })
    return issues
  }
  
  const roleDef = ARIA_ROLES[role]
  
  // Check if deprecated
  if (roleDef.deprecated || DEPRECATED_ARIA.roles.includes(role)) {
    issues.push({
      id: 'aria-deprecated-role',
      message: `ARIA role "${role}" is deprecated`,
      severity: 'warning'
    })
  }
  
  // Check if abstract
  if (roleDef.abstract) {
    issues.push({
      id: 'aria-abstract-role',
      message: `ARIA role "${role}" is abstract and should not be used directly`,
      severity: 'warning'
    })
  }
  
  // Check if role is allowed on element (ARIA-in-HTML)
  if (roleDef.allowedOn && !roleDef.allowedOn.includes('*')) {
    if (!roleDef.allowedOn.includes(tagName)) {
      issues.push({
        id: 'aria-role-on-wrong-element',
        message: `ARIA role "${role}" is not recommended on <${tagName}> element`,
        severity: 'warning'
      })
    }
  }
  
  // Check for redundant role
  const implicitRole = ARIA_IN_HTML.implicitRoles[tagName]
  if (implicitRole === role) {
    issues.push({
      id: 'aria-redundant-role',
      message: `Redundant role: <${tagName}> already has implicit role "${role}"`,
      severity: 'warning'
    })
  }
  
  return issues
}

/**
 * Validate ARIA property
 */
export function validateAriaProperty(
  propName: string,
  propValue: string | null,
  tagName: string,
  role: string | null
): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  
  // Check if property exists
  if (!ARIA_PROPERTIES[propName]) {
    issues.push({
      id: 'aria-invalid-property',
      message: `Invalid ARIA property: "${propName}"`,
      severity: 'error'
    })
    return issues
  }
  
  const propDef = ARIA_PROPERTIES[propName]
  
  // Check if deprecated
  if (propDef.deprecated || DEPRECATED_ARIA.properties.includes(propName)) {
    issues.push({
      id: 'aria-deprecated-property',
      message: `ARIA property "${propName}" is deprecated`,
      severity: 'warning'
    })
  }
  
  // Validate property value type
  if (propValue !== null) {
    if (propDef.type === 'boolean') {
      if (propValue !== 'true' && propValue !== 'false') {
        issues.push({
          id: 'aria-invalid-property-value',
          message: `ARIA property "${propName}" must be "true" or "false"`,
          severity: 'error'
        })
      }
    } else if (propDef.type === 'enum' && propDef.enumValues) {
      if (!propDef.enumValues.includes(propValue)) {
        issues.push({
          id: 'aria-invalid-property-value',
          message: `ARIA property "${propName}" must be one of: ${propDef.enumValues.join(', ')}`,
          severity: 'error'
        })
      }
    }
  }
  
  // Check if property is allowed on element (ARIA-in-HTML)
  const elementKey = tagName // Simplified - could include input type
  const discouraged = (ARIA_IN_HTML.discouraged as Record<string, string[]>)[elementKey]
  if (discouraged && discouraged.includes(propName)) {
    issues.push({
      id: 'aria-property-discouraged',
      message: `ARIA property "${propName}" is discouraged on <${tagName}> element`,
      severity: 'warning'
    })
  }
  
  // Check if property is allowed with role
  if (role && ARIA_ROLES[role]) {
    const roleDef = ARIA_ROLES[role]
    if (roleDef.allowedProperties && !roleDef.allowedProperties.includes(propName)) {
      // Only warn if it's not a global property
      if (!propDef.allowedOn?.includes('*')) {
        issues.push({
          id: 'aria-property-not-allowed-with-role',
          message: `ARIA property "${propName}" is not allowed with role "${role}"`,
          severity: 'warning'
        })
      }
    }
  }
  
  return issues
}

/**
 * Validate that a role's spec-required properties are present on the element.
 *
 * Checks presence only (not value correctness — that's `validateAriaProperty`'s job).
 * `requiredProperties` uses "one of" semantics (any single alternative satisfies, e.g.
 * aria-label OR aria-labelledby); `requiredPropertiesAll` uses "all of" semantics (every
 * listed property must independently be present, e.g. scrollbar's aria-controls AND
 * aria-valuenow).
 *
 * @param role - The static ARIA role value
 * @param presentAriaPropNames - Set of aria-* attribute names present on the element
 *   (static or dynamic value — presence is what's checked here)
 * @param tagName - Host tag name, used for the native-heading-element exception
 */
export function validateRoleRequiredProperties(
  role: string,
  presentAriaPropNames: Set<string>,
  tagName?: string
): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  const roleDef = ARIA_ROLES[role]
  if (!roleDef) return issues

  // Native heading elements (h1-h6) get an implicit level from the host-language tag;
  // authors aren't required to also provide aria-level (WAI-ARIA 1.2 heading role note).
  if (role === 'heading' && tagName && /^h[1-6]$/.test(tagName)) {
    return issues
  }

  if (roleDef.requiredProperties.length > 0) {
    const hasRequired = roleDef.requiredProperties.some(prop => presentAriaPropNames.has(prop))
    if (!hasRequired) {
      const propList = roleDef.requiredProperties.map(p => `"${p}"`).join(' or ')
      issues.push({
        id: 'aria-role-missing-required-props',
        message: `ARIA role "${role}" is missing required property: ${propList}`,
        severity: 'error'
      })
    }
  }

  if (roleDef.requiredPropertiesAll) {
    for (const prop of roleDef.requiredPropertiesAll) {
      if (!presentAriaPropNames.has(prop)) {
        issues.push({
          id: 'aria-role-missing-required-props',
          message: `ARIA role "${role}" is missing required property: "${prop}"`,
          severity: 'error'
        })
      }
    }
  }

  return issues
}

/**
 * Validate that `role`/`aria-*` attributes are not placed on elements that don't support ARIA
 * at all (per HTML-AAM). Presence alone is the violation — the attribute's value (or whether
 * it's static or dynamic) doesn't matter, since assistive technology ignores the attribute
 * entirely regardless of what it's set to.
 *
 * @param tagName - Host tag name (already lowercased by the caller)
 * @param offendingAttributeNames - Ordered list of `role`/`aria-*` attribute names present on
 *   the element
 * @returns One issue per offending attribute name
 */
export function validateAriaUnsupportedElement(
  tagName: string,
  offendingAttributeNames: string[]
): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  if (!ARIA_UNSUPPORTED_ELEMENTS.includes(tagName)) return issues

  for (const attributeName of offendingAttributeNames) {
    issues.push({
      id: 'aria-unsupported-element',
      message: `<${tagName}> does not support ARIA attributes; "${attributeName}" will be ignored by assistive technology`,
      severity: 'error'
    })
  }

  return issues
}

/**
 * Validate ID references (aria-labelledby, aria-describedby, etc.)
 * Only checks within the same file
 */
export function validateIdReference(
  propName: string,
  idValue: string,
  allIds: Set<string>
): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  
  // Split idrefs (space-separated)
  const ids = idValue.trim().split(/\s+/)
  
  for (const id of ids) {
    if (!allIds.has(id)) {
      issues.push({
        id: 'aria-invalid-id-reference',
        message: `ARIA property "${propName}" references non-existent ID: "${id}"`,
        severity: 'error'
      })
    }
  }
  
  return issues
}

/**
 * Validate JSX element ARIA attributes
 */
export function validateJSXAria(
  node: any,
  allIds: Set<string>
): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  const tagName = getJSXTagName(node)
  const role = getJSXRole(node)

  // Validate role
  if (role) {
    issues.push(...validateRole(role, tagName))
  }

  // Validate all aria-* attributes
  const presentAriaPropNames = new Set<string>()
  if (node.attributes) {
    for (const attr of node.attributes) {
      if (attr.name?.name?.startsWith('aria-')) {
        const propName = attr.name.name
        // Presence counts regardless of whether the value is static or dynamic.
        presentAriaPropNames.add(propName)
        let propValue: string | null = null

        if (attr.value) {
          if (attr.value.type === 'Literal' && typeof attr.value.value === 'string') {
            propValue = attr.value.value
          } else if (attr.value.type === 'JSXExpressionContainer') {
            // Dynamic value - skip validation
            continue
          }
        }

        // Validate property
        issues.push(...validateAriaProperty(propName, propValue, tagName, role))

        // Validate ID references
        if ((propName === 'aria-labelledby' || propName === 'aria-describedby' ||
             propName === 'aria-controls' || propName === 'aria-owns' ||
             propName === 'aria-activedescendant') && propValue) {
          issues.push(...validateIdReference(propName, propValue, allIds))
        }
      }
    }
  }

  // Validate role-required properties (presence-only; only for a statically-resolved role)
  if (role) {
    issues.push(...validateRoleRequiredProperties(role, presentAriaPropNames, tagName))
  }

  // Validate elements that don't support ARIA at all (presence alone is the violation,
  // regardless of static/dynamic value, and regardless of whether `role` resolved statically)
  if (ARIA_UNSUPPORTED_ELEMENTS.includes(tagName) && node.attributes) {
    const offendingAttributeNames: string[] = []
    for (const attr of node.attributes) {
      if (attr.type === 'JSXSpreadAttribute') continue
      const attrName = attr.name?.name
      if (attrName === 'role' || attrName?.startsWith('aria-')) {
        offendingAttributeNames.push(attrName)
      }
    }
    issues.push(...validateAriaUnsupportedElement(tagName, offendingAttributeNames))
  }

  return issues
}

/**
 * Validate Vue element ARIA attributes
 */
export function validateVueAria(
  node: any,
  allIds: Set<string>
): AriaValidationIssue[] {
  const issues: AriaValidationIssue[] = []
  const tagName = getVueTagName(node)
  const role = getVueRole(node)

  // Validate role
  if (role) {
    issues.push(...validateRole(role, tagName))
  }

  // Validate all aria-* attributes
  const presentAriaPropNames = new Set<string>()
  if (node.startTag?.attributes) {
    for (const attr of node.startTag.attributes) {
      const attrName = attr.key?.name || attr.key?.argument
      if (attrName?.startsWith('aria-')) {
        const propName = attrName
        // Presence counts regardless of whether the value is static or dynamic.
        presentAriaPropNames.add(propName)
        let propValue: string | null = null

        if (attr.value) {
          if (attr.value.value && typeof attr.value.value === 'string') {
            propValue = attr.value.value
          } else {
            // Dynamic value - skip validation
            continue
          }
        }

        // Validate property
        issues.push(...validateAriaProperty(propName, propValue, tagName, role))

        // Validate ID references
        if ((propName === 'aria-labelledby' || propName === 'aria-describedby' ||
             propName === 'aria-controls' || propName === 'aria-owns' ||
             propName === 'aria-activedescendant') && propValue) {
          issues.push(...validateIdReference(propName, propValue, allIds))
        }
      }
    }
  }

  // Validate role-required properties (presence-only; only for a statically-resolved role)
  if (role) {
    issues.push(...validateRoleRequiredProperties(role, presentAriaPropNames, tagName))
  }

  // Validate elements that don't support ARIA at all (presence alone is the violation,
  // regardless of static/dynamic value, and regardless of whether `role` resolved statically)
  if (ARIA_UNSUPPORTED_ELEMENTS.includes(tagName) && node.startTag?.attributes) {
    const offendingAttributeNames: string[] = []
    for (const attr of node.startTag.attributes) {
      const attrName = attr.key?.name || attr.key?.argument
      if (attrName === 'role' || attrName?.startsWith('aria-')) {
        offendingAttributeNames.push(attrName)
      }
    }
    issues.push(...validateAriaUnsupportedElement(tagName, offendingAttributeNames))
  }

  return issues
}
