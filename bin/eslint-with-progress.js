#!/usr/bin/env node
/**
 * ESLint wrapper with progress display (like Vite test output)
 * Drop-in replacement for 'next lint' or 'eslint' that shows progress
 *
 * Compatible with ESLint v8 (.eslintrc) and v9 (flat config).
 *
 * Usage: node node_modules/eslint-plugin-a11y/bin/eslint-with-progress.js
 * Or: pnpm lint (if configured in package.json)
 */

const { ESLint } = require('eslint')
const path = require('path')

// Try to load our formatter
let formatter
try {
  const formatterPath = path.join(__dirname, '..', 'dist', 'linter', 'eslint-plugin', 'formatter.js')
  const formatterModule = require(formatterPath)
  formatter = formatterModule.default || formatterModule
} catch (e) {
  // Fallback to default
  formatter = null
}

/**
 * Detect ESLint major version to use the right constructor options.
 * ESLint v9 removed `useEslintrc` and `extensions`.
 */
function getESLintVersion() {
  try {
    const eslintPkg = require('eslint/package.json')
    return parseInt(eslintPkg.version.split('.')[0], 10)
  } catch {
    return 8
  }
}

async function main() {
  const args = process.argv.slice(2)
  const files = args.filter(arg => !arg.startsWith('--'))
  const useCache = args.includes('--cache')
  const fix = args.includes('--fix')

  const eslintMajor = getESLintVersion()

  const options = {
    cache: useCache,
    fix: fix,
    cacheLocation: '.eslintcache',
  }

  // ESLint v8 options (removed in v9)
  if (eslintMajor < 9) {
    options.extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue']
    options.useEslintrc = true
  }

  const eslint = new ESLint(options)

  try {
    // Get files to lint
    const targetFiles = files.length > 0 ? files : ['.']

    // Show progress header
    if (process.stdout.isTTY) {
      const colors = {
        cyan: '\x1b[36m',
        reset: '\x1b[0m',
        dim: '\x1b[2m',
      }
      process.stdout.write(`${colors.cyan}Linting files...${colors.reset}\n`)
    }

    const startTime = Date.now()

    // Lint files with progress
    const results = await eslint.lintFiles(targetFiles)

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    // Use our formatter if available, otherwise use default
    let output
    if (formatter && typeof formatter.format === 'function') {
      output = formatter.format(results)
    } else {
      // Default ESLint formatter
      const defaultFormatter = await eslint.loadFormatter('stylish')
      output = defaultFormatter.format(results)
    }

    // Print output
    console.log(output)

    // Print timing
    if (process.stdout.isTTY) {
      const colors = {
        dim: '\x1b[2m',
        reset: '\x1b[0m',
      }
      console.log(`${colors.dim}Completed in ${duration}s${colors.reset}\n`)
    }

    // Calculate totals
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0)

    // Exit with appropriate code
    process.exit(totalErrors > 0 ? 1 : 0)
  } catch (error) {
    console.error('Linting failed:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
