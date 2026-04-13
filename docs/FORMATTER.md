# Custom Formatter

The plugin includes an optional custom ESLint formatter with Vite-style output that shows:
- ✅ Summary of linted files, warnings, and errors
- ✅ Clean, presentable terminal output
- ✅ Color-coded results

## Usage

### Use the Formatter with ESLint

Use the formatter directly with ESLint's `-f` flag:

```bash
npx eslint -f eslint-plugin-a11y/formatter .
```

Or in your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint -f eslint-plugin-a11y/formatter ."
  }
}
```

## Output Example

```
src/components/Button.tsx
  5:12  ✖ Image missing alt attribute (a11y/image-alt)
  8:3   ⚠ Button should have accessible label (a11y/button-label)
  2 errors, 1 warning

────────────────────────────────────────────────────────────

Summary: 15 files linted • 2 errors • 5 warnings
```

## Features

- **File-by-file output**: Lists issues per file with line numbers
- **Color-coded**: Errors in red, warnings in yellow
- **Summary**: Total files, errors, and warnings at the end
- **Clean formatting**: Vite-style presentation

## Options

The formatter works with all standard ESLint options:

- `--fix` - Auto-fix issues
- `--cache` - Use ESLint cache
- `--max-warnings N` - Set max warnings threshold
- File paths - Specify files/directories to lint

Example:

```bash
npx eslint --format eslint-plugin-a11y/formatter src/ --cache --fix
```

