import React from 'react'

/**
 * Edge cases that might break ESLint rules
 * These test real-world patterns from UI libraries
 */

// Simulate UI library components (like Shadcn, Radix, etc.)
const Form = {
  Input: (props: any) => <input {...props} />,
  Select: (props: any) => <select {...props} />,
  Textarea: (props: any) => <textarea {...props} />
}

const UI = {
  Form: {
    Field: {
      Input: (props: any) => <input {...props} />
    }
  },
  Button: (props: any) => <button {...props} />,
  Image: (props: any) => <img {...props} />
}

/**
 * Member Expressions - Common in UI libraries
 * Should NOT crash the linter
 */
export function MemberExpressionComponents() {
  return (
    <div>
      {/* Member expressions should not crash */}
      <Form.Input type="text" aria-label="Email" />
      <Form.Select aria-label="Country" />
      <Form.Textarea aria-label="Description" />
      
      {/* Nested member expressions */}
      <UI.Form.Field.Input type="text" aria-label="Name" />
      <UI.Button>Click</UI.Button>
      <UI.Image src="test.jpg" alt="Test" />
    </div>
  )
}

/**
 * Missing Labels - Should be caught by linter
 */
export function MissingLabels() {
  return (
    <div>
      {/* These SHOULD trigger violations */}
      <input type="text" />
      <select></select>
      <textarea></textarea>
    </div>
  )
}

/**
 * Valid Labels - Should NOT trigger violations
 */
export function ValidLabels() {
  return (
    <div>
      {/* With aria-label - OK */}
      <input type="text" aria-label="Email" />
      
      {/* With htmlFor - OK */}
      <label htmlFor="name">Name</label>
      <input id="name" type="text" />
      
      {/* With aria-labelledby - OK */}
      <span id="email-label">Email</span>
      <input type="text" aria-labelledby="email-label" />
    </div>
  )
}

/**
 * Spread Attributes - Should not crash
 */
export function SpreadAttributes() {
  const inputProps = { type: 'text', 'aria-label': 'Email' }
  const buttonProps = { type: 'button', children: 'Click' }
  
  return (
    <div>
      {/* Spread props - should not crash */}
      <input {...inputProps} />
      <button {...buttonProps} />
    </div>
  )
}

/**
 * Missing Alt on Images - Should be caught
 */
export function MissingAlt() {
  return (
    <div>
      {/* Should trigger violation */}
      <img src="test.jpg" />
      
      {/* Empty alt should trigger violation */}
      <img src="test.jpg" alt="" />
    </div>
  )
}

/**
 * Valid Alt on Images - Should pass
 */
export function ValidAlt() {
  return (
    <div>
      <img src="test.jpg" alt="A beautiful landscape" />
      <img src="decorative.jpg" role="presentation" alt="" />
    </div>
  )
}

/**
 * Empty Buttons - Should be caught
 */
export function EmptyButtons() {
  return (
    <div>
      {/* Should trigger violations */}
      <button></button>
      <button />
    </div>
  )
}

/**
 * Valid Buttons - Should pass
 */
export function ValidButtons() {
  return (
    <div>
      <button>Click Me</button>
      <button aria-label="Close">×</button>
    </div>
  )
}

// A design-system Button wrapper, named to match the common convention this
// rule auto-detects (case-insensitively) as a native <button> - see
// getElementRoleFromJSX. Its accessible name comes from a `label` prop
// instead of children, which is why button-label needs labelPropNames support.
const Button = (props: any) => <button {...props} />

/**
 * Custom Button component using a `label` prop - Should pass with zero config
 */
export function ValidCustomButtonLabel() {
  return (
    <div>
      <Button label="Cancel" />
    </div>
  )
}

/**
 * Custom Button component with no accessible name at all - Should still be caught
 */
export function MissingCustomButtonLabel() {
  return (
    <div>
      <Button />
    </div>
  )
}

/**
 * Heading Order Issues - Should be caught
 */
export function HeadingOrderIssues() {
  return (
    <div>
      <h1>Title</h1>
      {/* Skipping h2, should trigger violation */}
      <h3>Subsection</h3>
    </div>
  )
}

/**
 * Valid Heading Order - Should pass
 */
export function ValidHeadingOrder() {
  return (
    <div>
      <h1>Title</h1>
      <h2>Section</h2>
      <h3>Subsection</h3>
    </div>
  )
}

/**
 * All edge cases combined
 */
export function AllEdgeCases() {
  return (
    <>
      <MemberExpressionComponents />
      <SpreadAttributes />
      <ValidLabels />
      <ValidAlt />
      <ValidButtons />
      <ValidCustomButtonLabel />
      <ValidHeadingOrder />
    </>
  )
}

