#!/usr/bin/env bash
set -euo pipefail

# Serve the production build using a lightweight static server (http-server)
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

# Ensure http-server is available locally (devDependency)
if ! npx --yes --package http-server@14.1.1 --call "true" >/dev/null 2>&1; then
  echo "Installing http-server..."
fi

# Serve build folder on PORT (default 3000)
PORT="${PORT:-3000}"

# Use npx to run without global install
exec npx --yes http-server@14.1.1 -p "$PORT" -c-1 build
