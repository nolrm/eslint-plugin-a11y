#!/usr/bin/env node
/**
 * ESLint wrapper with loader and nice formatting
 * Usage: node node_modules/eslint-plugin-test-a11y-js/bin/lint-with-loader.js
 * Or add to package.json: "lint": "node node_modules/eslint-plugin-test-a11y-js/bin/lint-with-loader.js"
 */

const { ESLint } = require('eslint')
const path = require('path')

// Try to load formatter, fallback to basic formatting if not available
let format
try {
  const formatterPath = path.join(__dirname, '..', 'dist', 'linter', 'eslint-plugin', 'formatter.js')
  const formatterModule = require(formatterPath)
  // Try to get the format function directly (named export)
  format = formatterModule.format
  // If not found, try the formatter object's format method
  if (typeof format !== 'function') {
    const formatter = formatterModule.default || formatterModule
    if (formatter && typeof formatter.format === 'function') {
      format = (results, _useColors) => formatter.format(results)
    } else {
      throw new Error('Formatter format function not found')
    }
  }
} catch (e) {
  // Fallback formatter
  format = (results, _useColors) => {
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0)
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0)
    const filesLinted = results.length
    
    if (totalErrors === 0 && totalWarnings === 0) {
      return `\n✓ No accessibility issues found!\nLinted ${filesLinted} file${filesLinted !== 1 ? 's' : ''}\n`
    }
    
    let output = '\n'
    for (const result of results) {
      if (result.messages.length > 0) {
        output += `${result.filePath}\n`
        for (const msg of result.messages) {
          const severity = msg.severity === 2 ? 'error' : 'warning'
          output += `  ${msg.line}:${msg.column}  ${severity === 'error' ? '✖' : '⚠'} ${msg.message}${msg.ruleId ? ` (${msg.ruleId})` : ''}\n`
        }
      }
    }
    output += `\nSummary: ${filesLinted} file${filesLinted !== 1 ? 's' : ''} linted`
    if (totalErrors > 0) output += ` • ${totalErrors} error${totalErrors !== 1 ? 's' : ''}`
    if (totalWarnings > 0) output += ` • ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`
    output += '\n'
    return output
  }
}

// Simple spinner
function createSpinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let frameIndex = 0
  let interval = null
  
  return {
    start(message) {
      process.stdout.write(`\r${frames[frameIndex]} ${message}`)
      interval = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length
        process.stdout.write(`\r${frames[frameIndex]} ${message}`)
      }, 80)
    },
    stop(message) {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      if (message) {
        process.stdout.write(`\r${' '.repeat(60)}\r${message}\n`)
      } else {
        process.stdout.write(`\r${' '.repeat(60)}\r`)
      }
    },
    succeed(message) {
      this.stop(`✓ ${message}`)
    },
    fail(message) {
      this.stop(`✖ ${message}`)
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const files = args.filter(arg => !arg.startsWith('--'))
  const useCache = args.includes('--cache')
  const fix = args.includes('--fix')
  
  const eslint = new ESLint({
    cache: useCache,
    fix: fix,
    cacheLocation: '.eslintcache',
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    useEslintrc: true,
  })
  
  const spinner = createSpinner()
  
  try {
    spinner.start('Linting files...')
    
    const targetFiles = files.length > 0 ? files : ['.']
    const startTime = Date.now()
    const results = await eslint.lintFiles(targetFiles)
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    spinner.stop()
    
    // Format and print output
    const output = format(results, process.stdout.isTTY)
    console.log(output)
    
    // Print timing
    if (process.stdout.isTTY) {
      console.log(`\x1b[2mCompleted in ${duration}s\x1b[0m\n`)
    }
    
    // Calculate totals
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0)
    const _totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0)
    
    // Exit with appropriate code
    process.exit(totalErrors > 0 ? 1 : 0)
  } catch (error) {
    spinner.fail('Linting failed')
    console.error(error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})

