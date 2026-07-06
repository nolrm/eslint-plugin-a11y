/**
 * ARIA 1.2 Specification Data
 * 
 * This file contains comprehensive ARIA role, property, and state definitions
 * based on the ARIA 1.2 specification and ARIA in HTML guidelines.
 */

export interface AriaRoleDefinition {
  // "One of" semantics: the requirement is satisfied if ANY one of these properties is present
  // (e.g. accessible name via aria-label OR aria-labelledby). See a11y-checker.ts's
  // `roleDef.requiredProperties.some(...)` runtime check, which shares this convention.
  requiredProperties: string[]
  // "All of" semantics: every property listed here must independently be present.
  // Used only for roles where the spec lists multiple, unrelated required properties
  // (e.g. scrollbar needs both aria-controls AND aria-valuenow).
  requiredPropertiesAll?: string[]
  allowedProperties: string[]
  allowedOn: string[] // '*' means all elements
  requiredContext?: string | string[] // Parent role required
  requiredOwned?: string[] // Required child roles
  deprecated: boolean
  abstract: boolean
}

export interface AriaPropertyDefinition {
  type: 'boolean' | 'tristate' | 'idref' | 'idrefs' | 'string' | 'enum' | 'integer' | 'number'
  required: boolean
  allowedOn: string[] // '*' means all elements
  enumValues?: string[] // For enum type
  deprecated: boolean
}

export interface AriaStateDefinition {
  type: 'boolean' | 'tristate' | 'enum'
  enumValues?: string[]
  allowedOn: string[]
}

// Deprecated ARIA items
export const DEPRECATED_ARIA = {
  roles: [] as string[],
  properties: ['aria-dropeffect', 'aria-grabbed'],
  states: ['aria-grabbed']
}

/**
 * Elements that do not support ARIA at all (HTML-AAM "Allowed ARIA roles, states and
 * properties" table lists these as permitting no role / no aria-* attributes). Assistive
 * technology ignores `role` and `aria-*` attributes placed on these elements entirely.
 *
 * https://www.w3.org/TR/html-aam-1.0/#html-element-role-mappings
 */
export const ARIA_UNSUPPORTED_ELEMENTS: string[] = [
  'meta',
  'html',
  'head',
  'script',
  'style',
  'title',
  'base',
  'param'
]

// ARIA-in-HTML restrictions
export const ARIA_IN_HTML = {
  // Attributes that are global but discouraged on certain elements
  discouraged: {
    'input[type="text"]': ['aria-label'], // Should use <label> instead
    'input[type="email"]': ['aria-label'],
    'input[type="password"]': ['aria-label'],
    'input[type="number"]': ['aria-label'],
    'input[type="tel"]': ['aria-label'],
    'input[type="url"]': ['aria-label'],
    'input[type="search"]': ['aria-label'],
    'button': ['role'], // Redundant if role="button"
    'a': ['role'], // Redundant if role="link"
    'h1': ['role'], // Redundant if role="heading"
    'h2': ['role'],
    'h3': ['role'],
    'h4': ['role'],
    'h5': ['role'],
    'h6': ['role'],
    'img': ['role'], // Redundant if role="img"
    'ul': ['role'], // Redundant if role="list"
    'ol': ['role'],
    'li': ['role'], // Redundant if role="listitem"
    'nav': ['role'], // Redundant if role="navigation"
    'main': ['role'], // Redundant if role="main"
    'article': ['role'], // Redundant if role="article"
    'section': ['role'], // Redundant if role="section"
    'header': ['role'], // Redundant if role="banner"
    'footer': ['role'], // Redundant if role="contentinfo"
    'aside': ['role'], // Redundant if role="complementary"
    'form': ['role'], // Redundant if role="form"
    'dialog': ['role'] // Redundant if role="dialog"
  },
  // Native elements that already have implicit roles
  implicitRoles: {
    'button': 'button',
    'a': 'link',
    'img': 'img',
    'h1': 'heading',
    'h2': 'heading',
    'h3': 'heading',
    'h4': 'heading',
    'h5': 'heading',
    'h6': 'heading',
    'ul': 'list',
    'ol': 'list',
    'li': 'listitem',
    'nav': 'navigation',
    'main': 'main',
    'article': 'article',
    'section': 'region',
    'header': 'banner',
    'footer': 'contentinfo',
    'aside': 'complementary',
    'form': 'form',
    'dialog': 'dialog',
    'input[type="button"]': 'button',
    'input[type="submit"]': 'button',
    'input[type="reset"]': 'button',
    'input[type="checkbox"]': 'checkbox',
    'input[type="radio"]': 'radio',
    'input[type="text"]': 'textbox',
    'input[type="email"]': 'textbox',
    'input[type="password"]': 'textbox',
    'input[type="number"]': 'spinbutton',
    'input[type="search"]': 'searchbox',
    'select': 'combobox',
    'textarea': 'textbox'
  } as Record<string, string>
}

// ARIA Role Definitions
export const ARIA_ROLES: Record<string, AriaRoleDefinition> = {
  // Widget Roles
  'button': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-pressed', 'aria-expanded', 'aria-disabled', 'aria-haspopup'],
    allowedOn: ['button', 'a', 'div', 'span', 'input'],
    deprecated: false,
    abstract: false
  },
  'checkbox': {
    // WAI-ARIA 1.2 §checkbox: Required States and Properties: aria-checked.
    requiredProperties: ['aria-checked'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-checked', 'aria-required', 'aria-disabled'],
    allowedOn: ['input', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'radio': {
    // WAI-ARIA 1.2 §radio: Required States and Properties: aria-checked.
    requiredProperties: ['aria-checked'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-checked', 'aria-required', 'aria-disabled'],
    allowedOn: ['input', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'switch': {
    // WAI-ARIA 1.2 §switch: Required States and Properties: aria-checked.
    requiredProperties: ['aria-checked'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-checked', 'aria-required', 'aria-disabled'],
    allowedOn: ['button', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'tab': {
    requiredProperties: [],
    allowedProperties: ['aria-selected', 'aria-controls', 'aria-labelledby', 'aria-disabled'],
    allowedOn: ['button', 'a', 'div', 'span'],
    requiredContext: 'tablist',
    deprecated: false,
    abstract: false
  },
  'tabpanel': {
    requiredProperties: [],
    allowedProperties: ['aria-labelledby'],
    allowedOn: ['div', 'section'],
    deprecated: false,
    abstract: false
  },
  'combobox': {
    // WAI-ARIA 1.2 §combobox: Required States and Properties: aria-expanded.
    // (aria-controls is spec-required only while aria-expanded="true"; not enforced statically
    // here since this check validates presence, not cross-attribute conditional value logic.)
    requiredProperties: ['aria-expanded'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded', 'aria-controls', 'aria-autocomplete', 'aria-required'],
    allowedOn: ['input', 'select', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'slider': {
    // WAI-ARIA 1.2 §slider: Required States and Properties: aria-valuenow.
    // (aria-valuemax/aria-valuemin default to 100/0 per spec, so are not required.)
    requiredProperties: ['aria-valuenow'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-orientation'],
    allowedOn: ['input', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'spinbutton': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-required'],
    allowedOn: ['input', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'scrollbar': {
    // WAI-ARIA 1.2 §scrollbar: Required States and Properties: aria-controls, aria-valuenow.
    // Both are independently required (not alternatives), hence requiredPropertiesAll rather
    // than requiredProperties. aria-valuemax/aria-valuemin default to 100/0 per spec.
    requiredProperties: [],
    requiredPropertiesAll: ['aria-controls', 'aria-valuenow'],
    allowedProperties: ['aria-controls', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-orientation', 'aria-disabled'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  'textbox': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-multiline', 'aria-required', 'aria-readonly', 'aria-invalid', 'aria-autocomplete'],
    allowedOn: ['input', 'textarea', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'searchbox': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-required', 'aria-autocomplete'],
    allowedOn: ['input', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'menuitem': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-disabled'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: ['menu', 'menubar'],
    deprecated: false,
    abstract: false
  },
  'menuitemcheckbox': {
    // WAI-ARIA 1.2 §menuitemcheckbox: Required States and Properties: aria-checked.
    requiredProperties: ['aria-checked'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-checked', 'aria-disabled'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: ['menu', 'menubar'],
    deprecated: false,
    abstract: false
  },
  'menuitemradio': {
    // WAI-ARIA 1.2 §menuitemradio: Required States and Properties: aria-checked.
    requiredProperties: ['aria-checked'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-checked', 'aria-disabled'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: ['menu', 'menubar'],
    deprecated: false,
    abstract: false
  },
  'option': {
    requiredProperties: [],
    allowedProperties: ['aria-selected', 'aria-checked', 'aria-disabled'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: 'listbox',
    deprecated: false,
    abstract: false
  },
  'treeitem': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded', 'aria-selected', 'aria-level'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: 'tree',
    deprecated: false,
    abstract: false
  },
  // Composite Widget Roles
  'menu': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['ul', 'menu', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'menubar': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['ul', 'menu', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'tablist': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-orientation'],
    allowedOn: ['ul', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'tree': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-required'],
    allowedOn: ['ul', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'treegrid': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded', 'aria-level'],
    allowedOn: ['table', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'grid': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded', 'aria-level'],
    allowedOn: ['table', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'listbox': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-required', 'aria-multiselectable'],
    allowedOn: ['ul', 'select', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  // Document Structure Roles
  'article': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded'],
    allowedOn: ['article', 'div', 'section'],
    deprecated: false,
    abstract: false
  },
  'section': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded'],
    allowedOn: ['section', 'div'],
    deprecated: false,
    abstract: false
  },
  'navigation': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['nav', 'div'],
    deprecated: false,
    abstract: false
  },
  'main': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['main', 'div'],
    deprecated: false,
    abstract: false
  },
  'complementary': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['aside', 'div'],
    deprecated: false,
    abstract: false
  },
  'contentinfo': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['footer', 'div'],
    deprecated: false,
    abstract: false
  },
  'search': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['form', 'div', 'section'],
    deprecated: false,
    abstract: false
  },
  'form': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['form', 'div'],
    deprecated: false,
    abstract: false
  },
  'region': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['section', 'div'],
    deprecated: false,
    abstract: false
  },
  // Landmark Roles
  'banner': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['header', 'div'],
    deprecated: false,
    abstract: false
  },
  'application': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  // Live Region Roles
  'alert': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  'status': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
    allowedOn: ['div', 'span', 'output'],
    deprecated: false,
    abstract: false
  },
  'log': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  'marquee': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  'timer': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  // Window Roles
  'dialog': {
    requiredProperties: ['aria-label', 'aria-labelledby'], // One required
    allowedProperties: ['aria-modal', 'aria-describedby'],
    allowedOn: ['dialog', 'div'],
    deprecated: false,
    abstract: false
  },
  'alertdialog': {
    requiredProperties: ['aria-label', 'aria-labelledby'], // One required
    allowedProperties: ['aria-modal', 'aria-describedby'],
    allowedOn: ['dialog', 'div'],
    deprecated: false,
    abstract: false
  },
  // High Priority Additions
  'link': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-expanded'],
    allowedOn: ['a', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'heading': {
    // WAI-ARIA 1.2 §heading: Required States and Properties: aria-level.
    // Native h1-h6 elements get an implicit level from the host-language tag, so the static
    // validator (validateRoleRequiredProperties) skips this requirement when the role is on a
    // native heading element; it only applies when role="heading" is used on a generic element.
    requiredProperties: ['aria-level'],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-level'],
    allowedOn: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'img': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['img', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'progressbar': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'],
    allowedOn: ['progress', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'meter': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'],
    allowedOn: ['meter', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'separator': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-orientation'],
    allowedOn: ['hr', 'div', 'span'],
    deprecated: false,
    abstract: false
  },
  'toolbar': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-orientation'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  'tooltip': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['div', 'span'],
    deprecated: false,
    abstract: false
  },
  'none': {
    requiredProperties: [],
    allowedProperties: [],
    allowedOn: ['*'],
    deprecated: false,
    abstract: false
  },
  'presentation': {
    requiredProperties: [],
    allowedProperties: [],
    allowedOn: ['*'],
    deprecated: false,
    abstract: false
  }
}

// ARIA Property Definitions
export const ARIA_PROPERTIES: Record<string, AriaPropertyDefinition> = {
  // Labeling Properties
  'aria-label': {
    type: 'string',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-labelledby': {
    type: 'idrefs',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-describedby': {
    type: 'idrefs',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  // Relationship Properties
  'aria-owns': {
    type: 'idrefs',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-controls': {
    type: 'idrefs',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-flowto': {
    type: 'idrefs',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-activedescendant': {
    type: 'idref',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  // Live Region Properties
  'aria-live': {
    type: 'enum',
    enumValues: ['off', 'polite', 'assertive'],
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-atomic': {
    type: 'boolean',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-relevant': {
    type: 'enum',
    enumValues: ['additions', 'removals', 'text', 'all'],
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-busy': {
    type: 'boolean',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  // Drag and Drop Properties (Deprecated)
  'aria-dropeffect': {
    type: 'enum',
    enumValues: ['copy', 'move', 'link', 'execute', 'popup', 'none'],
    required: false,
    allowedOn: ['*'],
    deprecated: true
  },
  'aria-grabbed': {
    type: 'enum',
    enumValues: ['true', 'false'],
    required: false,
    allowedOn: ['*'],
    deprecated: true
  },
  // Global Properties
  'aria-hidden': {
    type: 'boolean',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-invalid': {
    type: 'enum',
    enumValues: ['true', 'false', 'grammar', 'spelling'],
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-required': {
    type: 'boolean',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-readonly': {
    type: 'boolean',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-disabled': {
    type: 'boolean',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  // Widget Properties
  'aria-autocomplete': {
    type: 'enum',
    enumValues: ['none', 'inline', 'list', 'both'],
    required: false,
    allowedOn: ['input', 'textarea', 'div', 'span'],
    deprecated: false
  },
  'aria-checked': {
    type: 'tristate',
    required: false,
    allowedOn: ['input', 'div', 'span'],
    deprecated: false
  },
  'aria-expanded': {
    type: 'tristate',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-haspopup': {
    type: 'enum',
    enumValues: ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'],
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-level': {
    type: 'integer',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-modal': {
    type: 'boolean',
    required: false,
    allowedOn: ['dialog', 'div'],
    deprecated: false
  },
  'aria-multiline': {
    type: 'boolean',
    required: false,
    allowedOn: ['textarea', 'div', 'span'],
    deprecated: false
  },
  'aria-multiselectable': {
    type: 'boolean',
    required: false,
    allowedOn: ['select', 'div', 'span'],
    deprecated: false
  },
  'aria-orientation': {
    type: 'enum',
    enumValues: ['horizontal', 'vertical'],
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-pressed': {
    type: 'tristate',
    required: false,
    allowedOn: ['button', 'div', 'span'],
    deprecated: false
  },
  'aria-selected': {
    type: 'boolean',
    required: false,
    allowedOn: ['option', 'tab', 'treeitem', 'div', 'span'],
    deprecated: false
  },
  'aria-sort': {
    type: 'enum',
    enumValues: ['ascending', 'descending', 'none', 'other'],
    required: false,
    allowedOn: ['th', 'td', 'div', 'span'],
    deprecated: false
  },
  // Range Properties
  'aria-valuemax': {
    type: 'number',
    required: false,
    allowedOn: ['input', 'progress', 'meter', 'div', 'span'],
    deprecated: false
  },
  'aria-valuemin': {
    type: 'number',
    required: false,
    allowedOn: ['input', 'progress', 'meter', 'div', 'span'],
    deprecated: false
  },
  'aria-valuenow': {
    type: 'number',
    required: false,
    allowedOn: ['input', 'progress', 'meter', 'div', 'span'],
    deprecated: false
  },
  'aria-valuetext': {
    type: 'string',
    required: false,
    allowedOn: ['input', 'progress', 'meter', 'div', 'span'],
    deprecated: false
  },
  // High Priority Additions
  'aria-current': {
    type: 'enum',
    enumValues: ['page', 'step', 'location', 'date', 'time', 'true', 'false'],
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-keyshortcuts': {
    type: 'string',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-roledescription': {
    type: 'string',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-posinset': {
    type: 'integer',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  },
  'aria-setsize': {
    type: 'integer',
    required: false,
    allowedOn: ['*'],
    deprecated: false
  }
}

// ARIA State Definitions
export const ARIA_STATES: Record<string, AriaStateDefinition> = {
  'aria-checked': {
    type: 'tristate',
    allowedOn: ['input', 'div', 'span']
  },
  'aria-selected': {
    type: 'boolean',
    allowedOn: ['option', 'tab', 'treeitem', 'div', 'span']
  },
  'aria-expanded': {
    type: 'tristate',
    allowedOn: ['*']
  },
  'aria-pressed': {
    type: 'tristate',
    allowedOn: ['button', 'div', 'span']
  },
  'aria-disabled': {
    type: 'boolean',
    allowedOn: ['*']
  },
  'aria-readonly': {
    type: 'boolean',
    allowedOn: ['*']
  },
  'aria-required': {
    type: 'boolean',
    allowedOn: ['*']
  },
  'aria-invalid': {
    type: 'enum',
    enumValues: ['true', 'false', 'grammar', 'spelling'],
    allowedOn: ['*']
  },
  'aria-busy': {
    type: 'boolean',
    allowedOn: ['*']
  },
  'aria-hidden': {
    type: 'boolean',
    allowedOn: ['*']
  }
}

