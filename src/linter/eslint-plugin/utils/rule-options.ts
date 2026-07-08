/**
 * Rule options utilities and type definitions
 */

/**
 * Image alt rule options
 */
export interface ImageAltOptions {
  allowMissingAltOnDecorative?: boolean // default: false
  decorativeMatcher?: {
    requireAriaHidden?: boolean
    requireRolePresentation?: boolean
    markerAttributes?: string[] // e.g., ['data-decorative']
  }
}

/**
 * Link text rule options
 */
export interface LinkTextOptions {
  denylist?: string[] // default: ['click here', 'read more', 'more']
  caseInsensitive?: boolean // default: true
  allowlistPatterns?: string[] // regex strings - compile with try/catch
}

/**
 * Heading order rule options
 */
export interface HeadingOrderOptions {
  allowSameLevel?: boolean // default: true
  maxSkip?: number // e.g., warn only when skipping more than one level
}

/**
 * Anchor is valid rule options
 */
export interface AnchorIsValidOptions {
  specialLink?: string[] // default: [] - extra prop/attribute names checked as href aliases (e.g. ['to'])
  aspects?: Array<'noHref' | 'invalidHref' | 'preferButton'> // default: all three
}

/**
 * Get rule options with defaults
 */
export function getImageAltOptions(options: unknown[] = []): ImageAltOptions {
  const opts = (options[0] || {}) as ImageAltOptions
  return {
    allowMissingAltOnDecorative: opts.allowMissingAltOnDecorative ?? false,
    decorativeMatcher: {
      requireAriaHidden: opts.decorativeMatcher?.requireAriaHidden ?? false,
      requireRolePresentation: opts.decorativeMatcher?.requireRolePresentation ?? false,
      markerAttributes: opts.decorativeMatcher?.markerAttributes || []
    }
  }
}

export function getLinkTextOptions(options: unknown[] = []): LinkTextOptions {
  const opts = (options[0] || {}) as LinkTextOptions
  return {
    denylist: opts.denylist || ['click here', 'read more', 'more'],
    caseInsensitive: opts.caseInsensitive ?? true,
    allowlistPatterns: opts.allowlistPatterns || []
  }
}

export function getHeadingOrderOptions(options: unknown[] = []): HeadingOrderOptions {
  const opts = (options[0] || {}) as HeadingOrderOptions
  return {
    allowSameLevel: opts.allowSameLevel ?? true,
    maxSkip: opts.maxSkip
  }
}

export function getAnchorIsValidOptions(options: unknown[] = []): Required<AnchorIsValidOptions> {
  const opts = (options[0] || {}) as AnchorIsValidOptions
  return {
    specialLink: opts.specialLink || [],
    aspects: opts.aspects && opts.aspects.length > 0
      ? opts.aspects
      : ['noHref', 'invalidHref', 'preferButton']
  }
}

/**
 * Check if an image is marked as decorative based on options
 */
export function isImageDecorative(
  node: any,
  options: ImageAltOptions,
  hasJSXAttribute: (node: any, attr: string) => boolean,
  getJSXAttribute: (node: any, attr: string) => any
): boolean {
  if (!options.allowMissingAltOnDecorative) {
    return false
  }
  
  const matcher = options.decorativeMatcher!
  
  // If both are required, both must be present
  if (matcher.requireAriaHidden && matcher.requireRolePresentation) {
    const ariaHidden = getJSXAttribute(node, 'aria-hidden')
    const role = getJSXAttribute(node, 'role')
    return (
      ariaHidden?.value?.value === 'true' &&
      role?.value?.value === 'presentation'
    )
  }
  
  // If aria-hidden is required
  if (matcher.requireAriaHidden) {
    const ariaHidden = getJSXAttribute(node, 'aria-hidden')
    if (ariaHidden?.value?.value === 'true') {
      return true
    }
    return false
  }
  
  // If role="presentation" is required
  if (matcher.requireRolePresentation) {
    const role = getJSXAttribute(node, 'role')
    if (role?.value?.value === 'presentation') {
      return true
    }
    return false
  }
  
  // If neither is required, check if any decorative marker is present
  const ariaHidden = getJSXAttribute(node, 'aria-hidden')
  const role = getJSXAttribute(node, 'role')
  
  if (ariaHidden?.value?.value === 'true' || role?.value?.value === 'presentation') {
    return true
  }
  
  // Check marker attributes
  if (matcher.markerAttributes && matcher.markerAttributes.length > 0) {
    for (const markerAttr of matcher.markerAttributes) {
      if (hasJSXAttribute(node, markerAttr)) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Check if text matches denylist (substring matching)
 */
export function matchesDenylist(
  text: string,
  options: LinkTextOptions
): boolean {
  const denylist = options.denylist || []
  const caseInsensitive = options.caseInsensitive ?? true
  
  const normalizedText = caseInsensitive ? text.toLowerCase() : text
  
  for (const phrase of denylist) {
    const normalizedPhrase = caseInsensitive ? phrase.toLowerCase() : phrase
    if (normalizedText.includes(normalizedPhrase)) {
      // Check allowlist patterns if provided
      if (options.allowlistPatterns && options.allowlistPatterns.length > 0) {
        let matchesAllowlist = false
        for (const pattern of options.allowlistPatterns) {
          try {
            const regex = new RegExp(pattern, caseInsensitive ? 'i' : '')
            if (regex.test(text)) {
              matchesAllowlist = true
              break
            }
          } catch (error) {
            // Invalid regex - skip this pattern
            // In a real implementation, you might want to warn about this
            continue
          }
        }
        if (matchesAllowlist) {
          continue // Skip this denylist item
        }
      }
      return true
    }
  }
  
  return false
}
