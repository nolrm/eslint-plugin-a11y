/**
 * ESLint formatter with progress display (like Vite test output)
 * Shows which files are being linted in real-time
 */

import type { ESLint } from 'eslint'

// Use LintResult type directly from ESLint
type LintResult = ESLint.LintResult
type LintMessage = LintResult['messages'][number]

interface FormatterResult {
  filePath: string
  messages: LintMessage[]
  errorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
}

/**
 * Color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

/**
 * Format a single file's results
 */
function formatFile(result: FormatterResult, useColors = true): string {
  const { filePath, messages, errorCount, warningCount } = result
  
  if (messages.length === 0) {
    return ''
  }

  const lines: string[] = []
  const c = useColors ? colors : { reset: '', bright: '', dim: '', red: '', yellow: '', cyan: '', gray: '' }
  
  // File header
  lines.push(`\n${c.cyan}${filePath}${c.reset}`)
  
  // Group messages by line
  const messagesByLine = new Map<number, LintMessage[]>()
  for (const message of messages) {
    const line = message.line || 0
    if (!messagesByLine.has(line)) {
      messagesByLine.set(line, [])
    }
    messagesByLine.get(line)!.push(message)
  }
  
  // Sort by line number
  const sortedLines = Array.from(messagesByLine.keys()).sort((a, b) => a - b)
  
  for (const lineNum of sortedLines) {
    const lineMessages = messagesByLine.get(lineNum)!
    const firstMessage = lineMessages[0]
    const line = firstMessage.line || 0
    const column = firstMessage.column || 0
    
    // Show line and column
    lines.push(`  ${c.gray}${line}:${column}${c.reset}  `)
    
    for (const message of lineMessages) {
      const severity = message.severity === 2 ? 'error' : 'warning'
      const severityColor = severity === 'error' ? c.red : c.yellow
      const severitySymbol = severity === 'error' ? '✖' : '⚠'
      const ruleId = message.ruleId ? `${c.gray}(${message.ruleId})${c.reset}` : ''
      
      lines.push(
        `${severityColor}${severitySymbol}${c.reset} ${c.bright}${message.message}${c.reset} ${ruleId}`
      )
    }
  }
  
  // File summary
  if (errorCount > 0 || warningCount > 0) {
    const summary: string[] = []
    if (errorCount > 0) {
      summary.push(`${c.red}${errorCount} error${errorCount !== 1 ? 's' : ''}${c.reset}`)
    }
    if (warningCount > 0) {
      summary.push(`${c.yellow}${warningCount} warning${warningCount !== 1 ? 's' : ''}${c.reset}`)
    }
    lines.push(`  ${summary.join(', ')}`)
  }
  
  return lines.join('\n')
}

/**
 * Main formatter function with progress display
 */
export function format(results: FormatterResult[], useColors = true): string {
  const c = useColors ? colors : { reset: '', bright: '', dim: '', red: '', green: '', yellow: '', blue: '', cyan: '', gray: '' }
  
  const lines: string[] = []
  
  // Filter out files with no issues
  const filesWithIssues = results.filter(r => r.messages.length > 0)
  const filesLinted = results.length
  const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0)
  const totalFixable = results.reduce((sum, r) => sum + r.fixableErrorCount + r.fixableWarningCount, 0)
  
  // Format each file
  for (const result of filesWithIssues) {
    lines.push(formatFile(result, useColors))
  }
  
  // Summary section with progress-like display
  lines.push('\n' + '─'.repeat(60))
  
  if (totalErrors === 0 && totalWarnings === 0) {
    lines.push(`${c.green}✓${c.reset} ${c.bright}No accessibility issues found!${c.reset}`)
    lines.push(`${c.dim}Linted ${filesLinted} file${filesLinted !== 1 ? 's' : ''}${c.reset}`)
  } else {
    // Summary stats with progress-like format
    const stats: string[] = []
    stats.push(`${c.cyan}${filesLinted}${c.reset} file${filesLinted !== 1 ? 's' : ''} linted`)
    
    if (totalErrors > 0) {
      stats.push(`${c.red}${totalErrors} error${totalErrors !== 1 ? 's' : ''}${c.reset}`)
    }
    
    if (totalWarnings > 0) {
      stats.push(`${c.yellow}${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}${c.reset}`)
    }
    
    lines.push(`\n${c.bright}Summary:${c.reset} ${stats.join(' • ')}`)
    
    if (totalFixable > 0) {
      lines.push(`${c.dim}${totalFixable} issue${totalFixable !== 1 ? 's' : ''} potentially fixable with --fix${c.reset}`)
    }
  }
  
  lines.push('')
  
  return lines.join('\n')
}

/**
 * ESLint formatter export
 * This formatter shows progress-like output similar to Vite's test runner
 */
const formatter: ESLint.Formatter = {
  format(results: ESLint.LintResult[]): string {
    return format(results as FormatterResult[], process.stdout.isTTY)
  }
}

// Default export for ESLint
export default formatter

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = formatter
  module.exports.default = formatter
  module.exports.format = format
}

