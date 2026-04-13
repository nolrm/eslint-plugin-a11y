# Implementation Plan: Phase 1 Features

This document provides a detailed implementation plan for the next phase of `a11y` features.

## Related Documents

- [ARIA Validation Scope](./ARIA_VALIDATION_SCOPE.md) - Complete list of supported/unsupported ARIA roles, properties, and states
- [Semantic HTML Validation Scope](./SEMANTIC_HTML_SCOPE.md) - Complete list of supported/unsupported semantic HTML elements and patterns

## Overview

**Phase 1: Static Validation Features (4-6 weeks)**
1. Comprehensive ARIA validation (2-3 weeks)
2. Semantic HTML validation (1-2 weeks)
3. Form validation messages (1-2 weeks)

**Phase 2: Runtime Validation Features (7-10 weeks)**
4. Keyboard navigation testing (4-6 weeks)
5. Focus visible indicators (3-4 weeks)

---

## 1. Comprehensive ARIA Validation

### Goal
Validate ARIA attributes, roles, and properties according to ARIA 1.2 specification.

### Scope

#### 1.1 ARIA Role Validation
- Validate role attribute values against ARIA spec
- Check role is appropriate for element type
- Validate role combinations (e.g., button + menu)
- Check for invalid role usage
- **Detect deprecated roles** (warn by default, error in strict)
- **Detect redundant roles** (e.g., `<button role="button">` - warn)
- **Detect conflicting semantics** (role conflicts with native element semantics)

#### 1.2 ARIA Property Validation
- Validate all `aria-*` attributes
- Check required properties for specific roles
- Validate property values (enums, booleans, IDs, etc.)
- Check property relationships (e.g., aria-labelledby references)
- **Detect deprecated properties** (aria-dropeffect, aria-grabbed - warn by default, error in strict)
- **ARIA-in-HTML conformance** (attributes allowed/prohibited on native elements)

#### 1.3 ARIA State Validation
- Validate state attributes (aria-checked, aria-expanded, etc.)
- Check state consistency with element type
- **Detect obviously impossible state combinations** (rather than transitions)

#### 1.4 ARIA Relationship Validation (Enhanced)
- Validate aria-labelledby references exist
- Validate aria-describedby references exist
- Check aria-owns relationships
- Validate aria-controls references
- **No self-reference** (aria-labelledby="self")
- **No circular references** (circular aria-owns)
- **Referenced IDs must be unique** in document
- **Referenced elements shouldn't be aria-hidden="true"**
- **aria-activedescendant**: referenced element in same widget scope, owning element focusable

#### 1.5 ARIA Live Region Validation
- Validate aria-live usage
- Check aria-atomic and aria-relevant
- Validate live region content

#### 1.6 Role Context Rules ⭐ NEW
- **Required parent/child role relationships**
  - `tab` must be owned by `tablist`
  - `tabpanel` must be associated with `tab` (via aria-labelledby or aria-controls)
  - `option` must be in `listbox` (or combobox popup listbox)
  - `menuitem*` must be in `menu` or `menubar`
  - `treeitem` must be in `tree`
  - `row` must be in `grid` or `treegrid`
- Validate required owned elements
- Validate required context role

#### 1.7 Accessible Name Computation ⭐ NEW
- **Empty aria-label/aria-labelledby** should be error
- **Flag "name from content" vs aria-label mismatches** (e.g., icon button has visible text "Save" but aria-label is "Close")
- **Ensure aria-label is used appropriately** - only when visible label isn't available
- **Dialog/alertdialog accessible name enforcement** - prefer aria-labelledby when visible title exists
- Validate accessible name rules in general way (not just "has aria-label")

#### 1.8 Composite Pattern Validator ⭐ NEW
- Validates required parent/child roles
- Validates required linking attributes (aria-controls, aria-labelledby) for patterns like tabs/combobox/listbox/menu
- Validates focusability + keyboard affordances when using non-native elements

### Implementation Steps

#### Step 1: Create ARIA Data Structure (Week 1, Days 1-2)
**File:** `src/core/aria-spec.ts`

```typescript
// ARIA role definitions
export const ARIA_ROLES = {
  'button': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby', 'aria-pressed', 'aria-expanded'],
    allowedOn: ['button', 'a', 'div', 'span'],
    requiredContext: null, // No required parent
    requiredOwned: [], // No required children
    deprecated: false,
    abstract: false
  },
  'dialog': {
    requiredProperties: ['aria-label', 'aria-labelledby'], // One required
    allowedProperties: ['aria-modal', 'aria-describedby'],
    allowedOn: ['dialog', 'div'],
    requiredContext: null,
    requiredOwned: [],
    deprecated: false,
    abstract: false
  },
  'tab': {
    requiredProperties: [],
    allowedProperties: ['aria-selected', 'aria-controls', 'aria-labelledby'],
    allowedOn: ['button', 'a', 'div', 'span'],
    requiredContext: 'tablist', // ⭐ NEW: Must be in tablist
    requiredOwned: [],
    deprecated: false,
    abstract: false
  },
  'tabpanel': {
    requiredProperties: [],
    allowedProperties: ['aria-labelledby'],
    allowedOn: ['div', 'section'],
    requiredContext: null,
    requiredOwned: [],
    deprecated: false,
    abstract: false
  },
  'option': {
    requiredProperties: [],
    allowedProperties: ['aria-selected', 'aria-checked'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: 'listbox', // ⭐ NEW: Must be in listbox
    requiredOwned: [],
    deprecated: false,
    abstract: false
  },
  'menuitem': {
    requiredProperties: [],
    allowedProperties: ['aria-label', 'aria-labelledby'],
    allowedOn: ['li', 'div', 'span'],
    requiredContext: ['menu', 'menubar'], // ⭐ NEW: Must be in menu or menubar
    requiredOwned: [],
    deprecated: false,
    abstract: false
  },
  // ... more roles
}

// Deprecated roles/properties
export const DEPRECATED_ARIA = {
  roles: [],
  properties: ['aria-dropeffect', 'aria-grabbed'],
  states: ['aria-grabbed']
}

// ARIA-in-HTML restrictions
export const ARIA_IN_HTML = {
  // Attributes that are global but discouraged on certain elements
  discouraged: {
    'input[type="text"]': ['aria-label'], // Should use <label> instead
    'button': ['role'], // Redundant if role="button"
    // ... more restrictions
  },
  // Native elements that already have implicit roles
  implicitRoles: {
    'button': 'button',
    'a': 'link',
    'img': 'img',
    'h1': 'heading',
    'h2': 'heading',
    // ... more mappings
  }
}

// ARIA property definitions
export const ARIA_PROPERTIES = {
  'aria-label': {
    type: 'string',
    required: false,
    allowedOn: ['*'] // All elements
  },
  'aria-labelledby': {
    type: 'idref',
    required: false,
    allowedOn: ['*']
  },
  'aria-pressed': {
    type: 'tristate', // true | false | mixed
    required: false,
    allowedOn: ['button']
  },
  // ... more properties
}
```

**Tasks:**
- [ ] Research ARIA 1.2 specification
- [ ] Create comprehensive role definitions
- [ ] Create property definitions with types
- [ ] Add validation rules for each role/property

#### Step 2: Implement ARIA Role Checker (Week 1, Days 3-5)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkAriaRoles(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  const allElements = element.querySelectorAll('[role]')
  
  for (const el of Array.from(allElements)) {
    const role = el.getAttribute('role')
    const tagName = el.tagName.toLowerCase()
    
    // Check role is valid
    if (!ARIA_ROLES[role]) {
      violations.push({
        id: 'aria-invalid-role',
        description: `Invalid ARIA role: ${role}`,
        element: el,
        impact: 'serious'
      })
      continue
    }
    
    const roleDef = ARIA_ROLES[role]
    
    // Check if deprecated
    if (DEPRECATED_ARIA.roles.includes(role)) {
      violations.push({
        id: 'aria-deprecated-role',
        description: `ARIA role "${role}" is deprecated`,
        element: el,
        impact: 'moderate' // Warn by default, configurable to error
      })
    }
    
    // Check if abstract (warn)
    if (roleDef.abstract) {
      violations.push({
        id: 'aria-abstract-role',
        description: `ARIA role "${role}" is abstract and should not be used`,
        element: el,
        impact: 'moderate'
      })
    }
    
    // Check redundant role (e.g., <button role="button">)
    const implicitRole = ARIA_IN_HTML.implicitRoles[tagName]
    if (implicitRole === role) {
      violations.push({
        id: 'aria-redundant-role',
        description: `Redundant role: <${tagName}> already has implicit role "${role}"`,
        element: el,
        impact: 'minor'
      })
    }
    
    // Check conflicting semantics
    if (implicitRole && implicitRole !== role && this.hasStrongNativeSemantics(tagName)) {
      violations.push({
        id: 'aria-conflicting-semantics',
        description: `Conflicting semantics: <${tagName}> has implicit role "${implicitRole}" but role="${role}" is specified`,
        element: el,
        impact: 'serious'
      })
    }
    
    // Check role is allowed on element type (ARIA-in-HTML)
    if (!roleDef.allowedOn.includes('*') && !roleDef.allowedOn.includes(tagName)) {
      violations.push({
        id: 'aria-role-on-wrong-element',
        description: `Role "${role}" is not appropriate for <${tagName}>`,
        element: el,
        impact: 'serious'
      })
    }
    
    // ⭐ NEW: Check required context (parent role)
    if (roleDef.requiredContext) {
      const parent = el.parentElement
      const parentRole = parent?.getAttribute('role')
      const contexts = Array.isArray(roleDef.requiredContext) 
        ? roleDef.requiredContext 
        : [roleDef.requiredContext]
      
      if (!parentRole || !contexts.includes(parentRole)) {
        violations.push({
          id: 'aria-missing-context-role',
          description: `Role "${role}" must be in context of ${contexts.join(' or ')}`,
          element: el,
          impact: 'serious'
        })
      }
    }
    
    // Check required properties
    for (const requiredProp of roleDef.requiredProperties) {
      if (!el.hasAttribute(requiredProp)) {
        violations.push({
          id: 'aria-missing-required-property',
          description: `Role "${role}" requires ${requiredProp} attribute`,
          element: el,
          impact: 'critical'
        })
      }
    }
  }
  
  return violations
}

private static hasStrongNativeSemantics(tagName: string): boolean {
  const strongSemanticElements = ['button', 'a', 'input', 'select', 'textarea', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  return strongSemanticElements.includes(tagName)
}
```

**Tasks:**
- [ ] Implement role validation logic
- [ ] Add role appropriateness checks
- [ ] Add required property checks
- [ ] Write unit tests

#### Step 3: Implement ARIA Property Checker (Week 2, Days 1-3)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkAriaProperties(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  const allElements = element.querySelectorAll('[aria-*]')
  
  for (const el of Array.from(allElements)) {
    const attributes = Array.from(el.attributes)
      .filter(attr => attr.name.startsWith('aria-'))
    
    for (const attr of attributes) {
      const propName = attr.name
      const propValue = attr.value
      
      // Check property is valid
      if (!ARIA_PROPERTIES[propName]) {
        violations.push({
          id: 'aria-invalid-property',
          description: `Invalid ARIA property: ${propName}`,
          element: el,
          impact: 'serious'
        })
        continue
      }
      
      const propDef = ARIA_PROPERTIES[propName]
      
      // Validate property value type
      if (!this.validateAriaPropertyValue(propValue, propDef.type)) {
        violations.push({
          id: 'aria-invalid-property-value',
          description: `Invalid value for ${propName}: ${propValue}`,
          element: el,
          impact: 'serious'
        })
      }
      
      // Check property is allowed on element
      const tagName = el.tagName.toLowerCase()
      if (!propDef.allowedOn.includes('*') && !propDef.allowedOn.includes(tagName)) {
        violations.push({
          id: 'aria-property-on-wrong-element',
          description: `${propName} is not appropriate for <${tagName}>`,
          element: el,
          impact: 'moderate'
        })
      }
    }
  }
  
  return violations
}

private static validateAriaPropertyValue(value: string, type: string): boolean {
  switch (type) {
    case 'boolean':
      return value === 'true' || value === 'false'
    case 'tristate':
      return value === 'true' || value === 'false' || value === 'mixed'
    case 'idref':
      return value.length > 0 // Should also check ID exists
    case 'idrefs':
      return value.length > 0
    case 'string':
      return true
    case 'enum':
      // Check against allowed values
      return true
    default:
      return true
  }
}
```

**Tasks:**
- [ ] Implement property validation logic
- [ ] Add value type validation
- [ ] Add ID reference validation
- [ ] Write unit tests

#### Step 4: Implement ARIA Relationship Checker (Enhanced) (Week 2, Days 4-5)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkAriaRelationships(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  
  // Helper to check ID references
  const checkIdReferences = (
    elements: NodeListOf<Element>,
    attribute: string,
    violationId: string
  ) => {
    for (const el of Array.from(elements)) {
      const ids = el.getAttribute(attribute)?.split(/\s+/) || []
      
      // ⭐ NEW: Check for self-reference
      if (ids.includes(el.id || 'self')) {
        violations.push({
          id: `${violationId}-self-reference`,
          description: `${attribute} should not reference itself`,
          element: el,
          impact: 'serious'
        })
      }
      
      for (const id of ids) {
        const referencedEl = element.querySelector(`#${id}`)
        
        // Check if reference exists
        if (!referencedEl) {
          violations.push({
            id: `${violationId}-reference-missing`,
            description: `${attribute} references non-existent ID: ${id}`,
            element: el,
            impact: 'serious'
          })
          continue
        }
        
        // ⭐ NEW: Check if referenced element is aria-hidden
        if (referencedEl.getAttribute('aria-hidden') === 'true') {
          violations.push({
            id: `${violationId}-reference-hidden`,
            description: `${attribute} references element with aria-hidden="true" (name/description will be hidden from AT)`,
            element: el,
            impact: 'serious'
          })
        }
        
        // ⭐ NEW: Check for duplicate IDs (IDs must be unique)
        const allWithId = element.querySelectorAll(`#${id}`)
        if (allWithId.length > 1) {
          violations.push({
            id: `${violationId}-duplicate-id`,
            description: `ID "${id}" is not unique in document (referenced by ${attribute})`,
            element: el,
            impact: 'serious'
          })
        }
      }
    }
  }
  
  // Check aria-labelledby references
  checkIdReferences(
    element.querySelectorAll('[aria-labelledby]'),
    'aria-labelledby',
    'aria-labelledby'
  )
  
  // Check aria-describedby references
  checkIdReferences(
    element.querySelectorAll('[aria-describedby]'),
    'aria-describedby',
    'aria-describedby'
  )
  
  // Check aria-controls references
  checkIdReferences(
    element.querySelectorAll('[aria-controls]'),
    'aria-controls',
    'aria-controls'
  )
  
  // Check aria-owns references
  checkIdReferences(
    element.querySelectorAll('[aria-owns]'),
    'aria-owns',
    'aria-owns'
  )
  
  // ⭐ NEW: Check aria-activedescendant
  const activedescendantElements = element.querySelectorAll('[aria-activedescendant]')
  for (const el of Array.from(activedescendantElements)) {
    const id = el.getAttribute('aria-activedescendant')
    if (id) {
      const referencedEl = element.querySelector(`#${id}`)
      
      if (!referencedEl) {
        violations.push({
          id: 'aria-activedescendant-reference-missing',
          description: `aria-activedescendant references non-existent ID: ${id}`,
          element: el,
          impact: 'serious'
        })
        continue
      }
      
      // ⭐ NEW: Check referenced element is in same widget scope
      // ⭐ NEW: Check owning element is focusable
      const isFocusable = this.isFocusable(el)
      if (!isFocusable) {
        violations.push({
          id: 'aria-activedescendant-owner-not-focusable',
          description: 'Element with aria-activedescendant should be focusable',
          element: el,
          impact: 'serious'
        })
      }
    }
  }
  
  // ⭐ NEW: Check for circular aria-owns
  const ownsElements = element.querySelectorAll('[aria-owns]')
  for (const el of Array.from(ownsElements)) {
    const ids = el.getAttribute('aria-owns')?.split(/\s+/) || []
    for (const id of ids) {
      const referencedEl = element.querySelector(`#${id}`)
      if (referencedEl && referencedEl.getAttribute('aria-owns')?.includes(el.id || '')) {
        violations.push({
          id: 'aria-owns-circular-reference',
          description: 'Circular aria-owns reference detected',
          element: el,
          impact: 'serious'
        })
      }
    }
  }
  
  return violations
}

private static isFocusable(element: Element): boolean {
  const tagName = element.tagName.toLowerCase()
  const tabindex = element.getAttribute('tabindex')
  
  // Native focusable elements
  if (['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) {
    return !element.hasAttribute('disabled')
  }
  
  // Elements with tabindex
  if (tabindex !== null) {
    return tabindex !== '-1'
  }
  
  return false
}
```

**Tasks:**
- [ ] Implement ID reference validation
- [ ] Add relationship checks
- [ ] Handle multiple ID references (idrefs)
- [ ] Write unit tests

#### Step 5: Create ESLint Rule (Week 3, Days 1-2)
**File:** `src/linter/eslint-plugin/rules/aria-validation.ts`

```typescript
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce valid ARIA attributes, roles, and properties',
      category: 'Accessibility',
      recommended: true
    },
    messages: {
      invalidRole: 'Invalid ARIA role: {{role}}',
      roleOnWrongElement: 'Role "{{role}}" is not appropriate for <{{tag}}>',
      missingRequiredProperty: 'Role "{{role}}" requires {{property}} attribute',
      invalidProperty: 'Invalid ARIA property: {{property}}',
      invalidPropertyValue: 'Invalid value for {{property}}: {{value}}',
      referenceMissing: '{{property}} references non-existent ID: {{id}}'
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check role attribute
        // Check aria-* attributes
        // Report violations
      },
      VElement(node) {
        // Vue template support
      },
      Literal(node) {
        // HTML string support
      }
    }
  }
}
```

**Tasks:**
- [ ] Create ESLint rule structure
- [ ] Integrate with ARIA validation logic
- [ ] Add JSX support
- [ ] Add Vue support
- [ ] Add HTML string support
- [ ] Write rule tests

#### Step 8: Testing & Documentation (Week 3, Days 3-5)
**Tasks:**
- [ ] Write comprehensive unit tests
- [ ] Write ESLint rule tests
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Add examples
- [ ] Update checks.json

### Success Criteria
- ✅ All ARIA roles validated
- ✅ All ARIA properties validated
- ✅ ID references validated
- ✅ ESLint rule working for JSX, Vue, HTML
- ✅ 90%+ test coverage
- ✅ Documentation complete

### Estimated Time: 3-4 weeks (updated with new features)

**Updated Timeline:**
- Week 1: ARIA data structure + core role/property validation
- Week 2: Enhanced relationship validation + accessible name computation + composite patterns
- Week 3: ESLint rule implementation
- Week 4: Testing & documentation

---

## 2. Semantic HTML Validation

### Goal
Validate proper use of semantic HTML elements and detect misuse of generic elements.

### Scope

#### 2.1 Semantic Element Detection
- Detect div/span used where semantic element would be better
- Suggest semantic alternatives
- Validate proper nesting of semantic elements

#### 2.2 Heading Hierarchy in Landmarks
- Validate heading structure within landmarks
- Check for skipped heading levels
- Ensure proper heading order

#### 2.3 List Structure Validation
- Validate ul/ol/li structure
- Check for list items outside lists
- Validate nested lists

#### 2.4 Form Structure Validation
- Validate form element structure
- Check fieldset/legend usage
- Validate label associations

### Implementation Steps

#### Step 1: Create Semantic Element Mappings (Week 1, Days 1-2)
**File:** `src/core/semantic-html.ts`

```typescript
// Semantic element suggestions
export const SEMANTIC_SUGGESTIONS = {
  'div': {
    'role="button"': 'Use <button> instead',
    'role="link"': 'Use <a> instead',
    'role="heading"': 'Use <h1>-<h6> instead',
    'role="list"': 'Use <ul> or <ol> instead',
    'onclick': 'Use <button> instead',
    'tabindex="0"': 'Consider semantic element'
  },
  'span': {
    'role="button"': 'Use <button> instead',
    'role="link"': 'Use <a> instead',
    'onclick': 'Use <button> instead'
  }
}

// Semantic element requirements
export const SEMANTIC_REQUIREMENTS = {
  'ul': {
    children: ['li'],
    description: '<ul> must contain <li> elements'
  },
  'ol': {
    children: ['li'],
    description: '<ol> must contain <li> elements'
  },
  'dl': {
    children: ['dt', 'dd'],
    description: '<dl> must contain <dt> and <dd> elements'
  }
}
```

**Tasks:**
- [ ] Create semantic element mappings
- [ ] Define suggestion rules
- [ ] Create validation requirements

#### Step 2: Implement Generic Element Checker (Week 1, Days 3-4)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkSemanticHTML(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  
  // Check div/span misuse
  const divs = element.querySelectorAll('div')
  for (const div of Array.from(divs)) {
    const role = div.getAttribute('role')
    const hasOnClick = div.hasAttribute('onclick') || 
                       div.getAttribute('onclick') !== null
    
    // Check for role that should be semantic element
    if (role && SEMANTIC_SUGGESTIONS['div'][`role="${role}"`]) {
      violations.push({
        id: 'semantic-element-suggested',
        description: SEMANTIC_SUGGESTIONS['div'][`role="${role}"`],
        element: div,
        impact: 'moderate'
      })
    }
    
    // Check for onclick without proper role
    if (hasOnClick && !role) {
      violations.push({
        id: 'semantic-button-suggested',
        description: 'Use <button> instead of <div> with onclick',
        element: div,
        impact: 'serious'
      })
    }
  }
  
  // Check span misuse
  const spans = element.querySelectorAll('span')
  for (const span of Array.from(spans)) {
    const role = span.getAttribute('role')
    const hasOnClick = span.hasAttribute('onclick')
    
    if (role && SEMANTIC_SUGGESTIONS['span'][`role="${role}"`]) {
      violations.push({
        id: 'semantic-element-suggested',
        description: SEMANTIC_SUGGESTIONS['span'][`role="${role}"`],
        element: span,
        impact: 'moderate'
      })
    }
    
    if (hasOnClick && !role) {
      violations.push({
        id: 'semantic-button-suggested',
        description: 'Use <button> instead of <span> with onclick',
        element: span,
        impact: 'serious'
      })
    }
  }
  
  return violations
}
```

**Tasks:**
- [ ] Implement div/span misuse detection
- [ ] Add role-based suggestions
- [ ] Add onclick detection
- [ ] Write unit tests

#### Step 3: Implement List Structure Checker (Week 1, Day 5)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkListStructure(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  
  // Check ul/ol structure
  const lists = element.querySelectorAll('ul, ol')
  for (const list of Array.from(lists)) {
    const listItems = list.querySelectorAll(':scope > li')
    if (listItems.length === 0) {
      violations.push({
        id: 'list-missing-items',
        description: '<ul> or <ol> must contain <li> elements',
        element: list,
        impact: 'serious'
      })
    }
  }
  
  // Check li outside list
  const allLis = element.querySelectorAll('li')
  for (const li of Array.from(allLis)) {
    const parent = li.parentElement
    if (parent && parent.tagName.toLowerCase() !== 'ul' && 
        parent.tagName.toLowerCase() !== 'ol') {
      violations.push({
        id: 'list-item-outside-list',
        description: '<li> must be a child of <ul> or <ol>',
        element: li,
        impact: 'serious'
      })
    }
  }
  
  // Check dl structure
  const dlLists = element.querySelectorAll('dl')
  for (const dl of Array.from(dlLists)) {
    const hasDt = dl.querySelector(':scope > dt')
    const hasDd = dl.querySelector(':scope > dd')
    
    if (!hasDt && !hasDd) {
      violations.push({
        id: 'definition-list-missing-items',
        description: '<dl> must contain <dt> and <dd> elements',
        element: dl,
        impact: 'serious'
      })
    }
  }
  
  return violations
}
```

**Tasks:**
- [ ] Implement list structure validation
- [ ] Add nested list support
- [ ] Add definition list validation
- [ ] Write unit tests

#### Step 4: Create ESLint Rule (Week 2, Days 1-2)
**File:** `src/linter/eslint-plugin/rules/semantic-html.ts`

```typescript
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce semantic HTML usage',
      category: 'Accessibility',
      recommended: true
    },
    messages: {
      semanticElementSuggested: '{{suggestion}}',
      listMissingItems: '{{description}}',
      listItemOutsideList: '{{description}}'
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check for div/span misuse
        // Check list structure
        // Report violations
      },
      VElement(node) {
        // Vue template support
      }
    }
  }
}
```

**Tasks:**
- [ ] Create ESLint rule
- [ ] Add JSX support
- [ ] Add Vue support
- [ ] Write rule tests

#### Step 5: Testing & Documentation (Week 2, Days 3-5)
**Tasks:**
- [ ] Write comprehensive unit tests
- [ ] Write ESLint rule tests
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Add examples
- [ ] Update checks.json

### Success Criteria
- ✅ Div/span misuse detected
- ✅ List structure validated
- ✅ Semantic suggestions provided
- ✅ ESLint rule working
- ✅ 90%+ test coverage
- ✅ Documentation complete

### Estimated Time: 1-2 weeks

---

## 3. Form Validation Messages

### Goal
Validate form validation error messages are accessible and properly associated with form controls.

### Scope

#### 3.1 Error Message Association
- Check aria-invalid usage
- Validate aria-describedby links to error messages
- Check error messages are accessible
- Validate error message visibility

#### 3.2 Required Field Indicators
- Check required fields have indicators
- Validate aria-required usage
- Check visual indicators match aria-required

#### 3.3 Validation State
- Validate aria-invalid values
- Check validation state consistency
- Validate error message content

### Implementation Steps

#### Step 1: Create Form Validation Data Structure (Week 1, Days 1-2)
**File:** `src/core/form-validation.ts`

```typescript
// Form validation patterns
export const FORM_VALIDATION_PATTERNS = {
  errorMessageSelectors: [
    '[role="alert"]',
    '[role="status"]',
    '.error',
    '.error-message',
    '[aria-live]'
  ],
  requiredIndicators: [
    '[aria-required="true"]',
    '[required]',
    '*', // Visual indicator
    '[aria-label*="required"]'
  ]
}
```

**Tasks:**
- [ ] Research form validation patterns
- [ ] Create validation rules
- [ ] Define error message patterns

#### Step 2: Implement Error Message Checker (Week 1, Days 3-4)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkFormValidation(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  
  // Check form controls with aria-invalid
  const invalidControls = element.querySelectorAll(
    'input[aria-invalid="true"], ' +
    'select[aria-invalid="true"], ' +
    'textarea[aria-invalid="true"]'
  )
  
  for (const control of Array.from(invalidControls)) {
    const describedBy = control.getAttribute('aria-describedby')
    
    // Check aria-describedby exists
    if (!describedBy) {
      violations.push({
        id: 'form-validation-missing-describedby',
        description: 'Form control with aria-invalid="true" should have aria-describedby linking to error message',
        element: control,
        impact: 'serious'
      })
      continue
    }
    
    // Check aria-describedby references exist
    const ids = describedBy.split(/\s+/)
    for (const id of ids) {
      const errorElement = element.querySelector(`#${id}`)
      if (!errorElement) {
        violations.push({
          id: 'form-validation-error-reference-missing',
          description: `aria-describedby references non-existent error message ID: ${id}`,
          element: control,
          impact: 'serious'
        })
      } else {
        // Check error element is accessible
        const role = errorElement.getAttribute('role')
        const isLiveRegion = role === 'alert' || role === 'status' || 
                            errorElement.hasAttribute('aria-live')
        
        if (!isLiveRegion && !this.isVisible(errorElement)) {
          violations.push({
            id: 'form-validation-error-not-accessible',
            description: 'Error message should be visible or have aria-live attribute',
            element: errorElement,
            impact: 'serious'
          })
        }
      }
    }
  }
  
  return violations
}

private static isVisible(element: Element): boolean {
  // Check if element is visible (simplified)
  const style = window.getComputedStyle(element as HTMLElement)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0'
}
```

**Tasks:**
- [ ] Implement error message association checks
- [ ] Add ID reference validation
- [ ] Add visibility checks
- [ ] Write unit tests

#### Step 3: Implement Required Field Checker (Week 1, Day 5)
**File:** `src/core/a11y-checker.ts`

```typescript
static checkRequiredFields(element: Element): A11yViolation[] {
  const violations: A11yViolation[] = []
  
  // Check required fields
  const requiredFields = element.querySelectorAll(
    'input[required], select[required], textarea[required]'
  )
  
  for (const field of Array.from(requiredFields)) {
    const ariaRequired = field.getAttribute('aria-required')
    
    // Check aria-required matches required attribute
    if (field.hasAttribute('required') && ariaRequired !== 'true') {
      violations.push({
        id: 'form-required-missing-aria',
        description: 'Required field should have aria-required="true"',
        element: field,
        impact: 'moderate'
      })
    }
    
    // Check for required indicator in label
    const label = this.getAssociatedLabel(field)
    if (label) {
      const labelText = label.textContent?.toLowerCase() || ''
      const hasIndicator = labelText.includes('required') || 
                          labelText.includes('*') ||
                          label.querySelector('[aria-label*="required"]')
      
      if (!hasIndicator) {
        violations.push({
          id: 'form-required-missing-indicator',
          description: 'Required field should have visual indicator in label',
          element: field,
          impact: 'moderate'
        })
      }
    }
  }
  
  return violations
}

private static getAssociatedLabel(field: Element): HTMLLabelElement | null {
  const id = field.getAttribute('id')
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`)
    if (label) return label as HTMLLabelElement
  }
  
  // Check for nested label
  const parent = field.parentElement
  if (parent?.tagName.toLowerCase() === 'label') {
    return parent as HTMLLabelElement
  }
  
  return null
}
```

**Tasks:**
- [ ] Implement required field checks
- [ ] Add indicator validation
- [ ] Add label association checks
- [ ] Write unit tests

#### Step 4: Create ESLint Rule (Week 2, Days 1-2)
**File:** `src/linter/eslint-plugin/rules/form-validation.ts`

```typescript
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce accessible form validation messages',
      category: 'Accessibility',
      recommended: true
    },
    messages: {
      missingDescribedBy: 'Form control with aria-invalid should have aria-describedby',
      errorReferenceMissing: 'aria-describedby references non-existent error message',
      errorNotAccessible: 'Error message should be visible or have aria-live',
      requiredMissingAria: 'Required field should have aria-required="true"',
      requiredMissingIndicator: 'Required field should have visual indicator'
    }
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        // Check form validation
        // Report violations
      },
      VElement(node) {
        // Vue template support
      }
    }
  }
}
```

**Tasks:**
- [ ] Create ESLint rule
- [ ] Add JSX support
- [ ] Add Vue support
- [ ] Write rule tests

#### Step 5: Testing & Documentation (Week 2, Days 3-5)
**Tasks:**
- [ ] Write comprehensive unit tests
- [ ] Write ESLint rule tests
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Add examples
- [ ] Update checks.json

### Success Criteria
- ✅ Error message association validated
- ✅ Required field indicators checked
- ✅ Validation state validated
- ✅ ESLint rule working
- ✅ 90%+ test coverage
- ✅ Documentation complete

### Estimated Time: 1-2 weeks

---

## Implementation Timeline

### Week 1: ARIA Validation Core
- Days 1-2: ARIA data structure (with deprecated, context rules, ARIA-in-HTML)
- Days 3-5: ARIA role checker (with redundant/conflicting detection, context validation)

### Week 2: ARIA Validation Enhanced
- Days 1-3: ARIA property checker (with deprecated detection, ARIA-in-HTML restrictions)
- Days 4-5: Enhanced relationship checker (self-ref, circular, unique IDs, aria-hidden checks)
- Days 4-5: Accessible name computation
- Days 4-5: Composite pattern validator

### Week 3: ARIA ESLint Rule
- Days 1-3: ESLint rule implementation (integrate all validators)
- Days 4-5: Testing & documentation

### Week 4: Semantic HTML Validation
- Days 1-2: Semantic element mappings
- Days 3-4: Generic element checker
- Day 5: List structure checker

### Week 5: Semantic HTML ESLint Rule & Testing
- Days 1-2: ESLint rule implementation
- Days 3-5: Testing & documentation

### Week 6: Form Validation Messages
- Days 1-2: Form validation data structure
- Days 3-4: Error message checker
- Day 5: Required field checker

### Week 7: Form Validation ESLint Rule & Testing
- Days 1-2: ESLint rule implementation
- Days 3-5: Testing & documentation

**Total Estimated Time: 7-8 weeks** (updated with enhanced ARIA validation features)

---

## Dependencies

### New Dependencies
- None required (all static analysis)

### Optional Dependencies
- None

---

## Testing Strategy

### Unit Tests
- Test each validation function independently
- Test edge cases and error conditions
- Test with various HTML structures

### Integration Tests
- Test with React components
- Test with Vue components
- Test with HTML strings

### ESLint Rule Tests
- Test JSX support
- Test Vue support
- Test HTML string support
- Test rule configurations

---

## Documentation Updates

### README Updates
- Add new rules to ESLint Rules section
- Update Features section
- Add examples for each new feature

### New Documentation
- ARIA Validation Guide
- Semantic HTML Guide
- Form Validation Guide

### checks.json Updates
- Add new rules to checks object
- Update summary statistics
- Add new violation types

---

## Success Metrics

- ✅ All 3 features implemented
- ✅ ESLint rules working for JSX, Vue, HTML
- ✅ 90%+ test coverage
- ✅ Documentation complete
- ✅ No breaking changes
- ✅ Performance maintained (<100ms for typical page)

