module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': false
        },
        extendDefaults: true
      }
    ]
  },
  ignorePatterns: ['dist/', 'node_modules/', 'tests/e2e/fixtures/'],
  overrides: [
    {
      files: ['bin/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
      }
    },
    { files: ['src/linter/eslint-plugin/index.ts'], rules: { '@typescript-eslint/no-var-requires': 'off' } },
    {
      files: ['src/linter/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
      }
    },
    {
      files: ['src/linter/eslint-plugin/utils/html-ast-utils.ts', 'src/linter/eslint-plugin/utils/jsx-ast-utils.ts', 'src/linter/eslint-plugin/utils/vue-ast-utils.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: ['src/linter/eslint-plugin/utils/types.ts'],
      rules: { '@typescript-eslint/no-empty-interface': 'off' }
    },
    {
      files: ['tests/**/*.ts', 'vitest.config.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
      }
    }
  ]
} 