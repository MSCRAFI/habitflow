# HabitFlow Frontend Setup (Isolated Node.js)

This guide sets up the React frontend with a locally isolated Node.js environment in this workspace only. It does not modify your global system configuration.

What you get:
- Local nvm installed at `habitflow/frontend/.nvm`
- Node.js installed according to `.nvmrc` (currently 18.20.4)
- All dependencies installed into `habitflow/frontend/node_modules`
- `.env` created from `.env.example` with defaults to connect to the local Django backend at `http://localhost:8000/api/v1`
- Scripts to run development and create production builds

Prerequisites:
- git (required for installing nvm)
- Bash shell (macOS/Linux; for Windows use WSL or run the commands using Git Bash)

Quick start
1) One-time setup
   ```bash
   chmod +x habitflow/frontend/*.sh
   bash habitflow/frontend/setup_frontend.sh
   ```

2) Run the development server (React dev server)
   ```bash
   bash habitflow/frontend/run_frontend_dev.sh
   ```
   - Served on: http://localhost:3000 (configurable via `PORT` in `.env`)
   - Connects to backend API: `REACT_APP_API_URL` from `.env` (default `http://localhost:8000/api/v1`)

3) Build a production bundle
   ```bash
   bash habitflow/frontend/build_frontend.sh
   ```
   - Artifacts: `habitflow/frontend/build/`

4) Serve the production build locally
   ```bash
   bash habitflow/frontend/serve_frontend_prod.sh
   ```
   - Serves `build/` at http://localhost:3000 (or `PORT` you set)

Environment configuration
- Copy `.env.example` to `.env` (the setup script will do this if it’s missing):
  ```env
  PORT=3000
  REACT_APP_API_URL=http://localhost:8000/api/v1
  BROWSER=none
  ```
- The frontend reads `REACT_APP_API_URL` at build/start time (see `src/services/api.js`). Ensure your Django backend (already configured) is running at the same URL.

Node.js isolation details
- Local nvm is installed under `habitflow/frontend/.nvm` and loaded by the scripts.
- Node.js version is pinned in `.nvmrc`.
- No global Node.js or nvm is required or modified.

Common commands
- Install/Update deps: `bash habitflow/frontend/setup_frontend.sh`
- Start dev server: `bash habitflow/frontend/run_frontend_dev.sh`
- Build prod: `bash habitflow/frontend/build_frontend.sh`
- Serve prod: `bash habitflow/frontend/serve_frontend_prod.sh`

Troubleshooting
- If you see engine warnings for `react-router-dom` on Node < 20, the app still builds and runs on Node 18 with CRA 5 here. If you have Node 20 available and want to use it, change the version in `.nvmrc` to `20.18.1` (or later) and rerun setup.
- If the dev server cannot reach the API, verify the backend is running and `REACT_APP_API_URL` is correct.
