#!/usr/bin/env bash
set -euo pipefail

# Build the production bundle using local nvm environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
NVM_DIR="$PROJECT_DIR/.nvm"

if [[ ! -d "$NVM_DIR" ]]; then
  echo "Local nvm not found. Run setup_frontend.sh first." >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

if [[ -f "$PROJECT_DIR/.nvmrc" ]]; then
  nvm use
else
  nvm use --lts
fi

cd "$PROJECT_DIR"
# Ensure .env exists
if [[ -f .env.example && ! -f .env ]]; then
  cp .env.example .env
fi

# Build
npm run build

BUILD_DIR="$PROJECT_DIR/build"
if [[ -d "$BUILD_DIR" ]]; then
  echo "Build artifacts are in $BUILD_DIR"
fi
