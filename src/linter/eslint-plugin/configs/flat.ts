/**
 * Flat config presets for ESLint v9+
 * 
 * These configs are compatible with ESLint's flat config format (eslint.config.js)
 * 
 * Usage:
 * ```js
 * import a11y from 'eslint-plugin-a11y'
 *
 * export default [
 *   ...a11y.configs['flat/recommended']
 * ]
 * ```
 */

import recommended from './recommended'
import react from './react'
import vue from './vue'
import minimal from './minimal'
import strict from './strict'

/**
 * Flat config type (compatible with ESLint v9+ flat config format)
 */
type FlatConfig = {
  rules?: Record<string, string | [string, ...unknown[]] | number>
  languageOptions?: {
    parser?: any
    parserOptions?: any
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Base flat config helper - creates a flat config object
 * Users will spread this into their config array
 */
function createFlatConfig(
  rules: Record<string, string | [string, ...unknown[]] | number>,
  languageOptions?: FlatConfig['languageOptions']
): FlatConfig {
  const config: FlatConfig = {
    rules: rules as any
  }
  
  if (languageOptions) {
    config.languageOptions = languageOptions
  }
  
  return config
}

/**
 * Flat config: recommended (rules only, minimal assumptions)
 * Users must add the plugin themselves:
 * ```js
 * { plugins: { 'a11y': a11y }, ...flatRecommended }
 * ```
 */
export const flatRecommended: FlatConfig = createFlatConfig(recommended as any)

/**
 * Flat config: recommended with React parser options (convenience variant)
 * Note: Users must install @typescript-eslint/parser separately
 */
export const flatRecommendedReact: FlatConfig = createFlatConfig(
  recommended as any,
  {
    parser: '@typescript-eslint/parser' as any,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  }
)

/**
 * Flat config: React (rules + React parser setup)
 * Note: Users must install @typescript-eslint/parser separately
 */
export const flatReact: FlatConfig = createFlatConfig(
  react as any,
  {
    parser: '@typescript-eslint/parser' as any,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  }
)

/**
 * Flat config: Vue (rules + Vue parser setup)
 * Note: Users must install vue-eslint-parser and @typescript-eslint/parser separately
 */
export const flatVue: FlatConfig = createFlatConfig(
  vue as any,
  {
    parser: 'vue-eslint-parser' as any,
    parserOptions: {
      parser: '@typescript-eslint/parser' as any,
      ecmaVersion: 2020,
      sourceType: 'module'
    }
  }
)

/**
 * Flat config: minimal (rules only)
 */
export const flatMinimal: FlatConfig = createFlatConfig(minimal as any)

/**
 * Flat config: strict (rules only)
 */
export const flatStrict: FlatConfig = createFlatConfig(strict as any)
