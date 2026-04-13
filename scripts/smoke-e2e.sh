#!/usr/bin/env bash
# Run the same smoke test as CI: build, pack, install plugin in each e2e fixture,
# run ESLint, and verify expected a11y violations are reported.
# Usage: from repo root, run: npm run test:smoke  OR  bash scripts/smoke-e2e.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Building plugin..."
npm run build

echo "Packing plugin..."
npm pack
TARBALL=$(ls "$ROOT"/eslint-plugin-a11y-*.tgz | head -n 1)
echo "Using tarball: $TARBALL"

run_fixture() {
  local fixture="$1"
  echo ""
  echo "--- Smoke test: $fixture ---"
  cd "$ROOT/tests/e2e/fixtures/$fixture"
  npm install --silent
  npm install --silent "$TARBALL"
  set +e
  npx eslint src/ --ext .ts,.tsx,.js,.jsx --format json --no-error-on-unmatched-pattern > eslint-output.json 2>&1
  EXIT_CODE=$?
  set -e
  echo "ESLint exit code: $EXIT_CODE"
  cat eslint-output.json
  if [ "$EXIT_CODE" -eq 2 ]; then
    echo "FATAL: ESLint crashed or had a config error"
    return 1
  fi
  if ! grep -q "image-alt" eslint-output.json; then
    echo "FAIL: Expected image-alt violation not found"
    return 1
  fi
  if ! grep -q "button-label" eslint-output.json; then
    echo "FAIL: Expected button-label violation not found"
    return 1
  fi
  if ! grep -q "form-label" eslint-output.json; then
    echo "FAIL: Expected form-label violation not found"
    return 1
  fi
  echo "All expected violations detected - $fixture passed"
  return 0
}

FAILED=0
run_fixture "eslint8-legacy" || FAILED=1
run_fixture "eslint9-flat"   || FAILED=1

echo ""
rm -f "$TARBALL"
if [ "$FAILED" -eq 1 ]; then
  echo "Smoke test failed"
  exit 1
fi
echo "All smoke tests passed"
