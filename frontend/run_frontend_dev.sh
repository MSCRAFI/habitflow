#!/usr/bin/env bash
set -euo pipefail

# Start the React development server using local nvm environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
NVM_DIR="$PROJECT_DIR/.nvm"

if [[ ! -d "$NVM_DIR" ]]; then
  echo "Local nvm not found. Run setup_frontend.sh first." >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

# Use the version declared in .nvmrc
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

# Ensure API URL points at local backend by default
if ! grep -q '^REACT_APP_API_URL=' .env; then
  echo 'REACT_APP_API_URL=http://localhost:8000/api/v1' >> .env
fi

# Run dev server on configured port (default 3000)
exec npm run start
