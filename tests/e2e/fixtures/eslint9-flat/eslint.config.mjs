import a11y from 'eslint-plugin-a11y'
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'a11y': a11y
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    ...a11y.configs['flat/recommended']
  }
]
