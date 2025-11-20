#!/usr/bin/env bash
set -euo pipefail

# HabitFlow Frontend setup (isolated Node.js via local nvm)
# This script installs a local copy of nvm under habitflow/frontend/.nvm,
# installs the Node.js version from .nvmrc, installs npm dependencies into
# habitflow/frontend/node_modules, and prepares .env from .env.example.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
NVM_DIR="$PROJECT_DIR/.nvm"
NVM_VERSION="v0.39.7"

info() { echo -e "[frontend:setup] $*"; }

info "Ensuring local nvm in $NVM_DIR"
if [[ ! -d "$NVM_DIR" ]]; then
  command -v git >/dev/null 2>&1 || { echo "git is required to install nvm"; exit 1; }
  git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR"
  (cd "$NVM_DIR" && git checkout "$NVM_VERSION")
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

# Ensure we operate inside the project directory for nvm to pick up .nvmrc
cd "$PROJECT_DIR"

# Make sure we are on the requested Node.js version
if [[ -f "$PROJECT_DIR/.nvmrc" ]]; then
  info "Installing Node.js version from .nvmrc: $(cat "$PROJECT_DIR/.nvmrc")"
  nvm install "$(cat "$PROJECT_DIR/.nvmrc")"
  nvm use "$(cat "$PROJECT_DIR/.nvmrc")"
else
  # Fallback to a stable LTS if .nvmrc is missing
  info ".nvmrc not found, installing LTS"
  nvm install --lts
  nvm use --lts
fi

# Print versions for diagnostics
info "Using node: $(node -v)"
info "Using npm:  $(npm -v)"

# Install dependencies (prefer npm ci when lockfile exists)
if [[ -f package-lock.json ]]; then
  info "Installing dependencies with npm ci"
  npm ci
else
  info "Installing dependencies with npm install"
  npm install
fi

# Prepare .env from .env.example if missing
if [[ -f .env.example && ! -f .env ]]; then
  info "Creating .env from .env.example"
  cp .env.example .env
fi

info "Setup complete. You can now run:\n  - $PROJECT_DIR/run_frontend_dev.sh\n  - $PROJECT_DIR/build_frontend.sh\n  - $PROJECT_DIR/serve_frontend_prod.sh"
