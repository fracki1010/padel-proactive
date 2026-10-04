#!/usr/bin/env bash
# Local verification gates (no-Actions strategy).
# Runs the per-module gates locally; exits non-zero if any module fails.
# Usage (from the repo root): bash scripts/verify-local.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILED=0

run_module() {
  local name="$1"
  shift
  echo "=== [$name] starting ==="
  if (cd "$ROOT/$name" && "$@"); then
    echo "=== [$name] OK ==="
  else
    echo "=== [$name] FAIL ==="
    FAILED=1
  fi
}

run_module padel-proactive-backend \
  bash -c "npm ci --no-audit --no-fund && npm run lint && npm test"

run_module padel-proactive-frontend \
  bash -c "npm ci --no-audit --no-fund && npm run typecheck && npm run lint:ci && npm run build"

run_module padel-proactive-whatsapp-worker \
  bash -c "npm ci --no-audit --no-fund && node scripts/smoke.js"

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "All modules OK"
else
  echo "One or more modules FAILED"
fi
exit "$FAILED"