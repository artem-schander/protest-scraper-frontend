# Repository Guidelines

## Project Structure & Module Organization
- Application code lives in `src/`. SvelteKit routes and server loads are under `src/routes/`, shared UI in `src/lib/components/`, utilities in `src/lib/utils/`, stores in `src/lib/stores/`, and i18n resources in `src/lib/i18n/`.
- Static assets (images, fonts, maps) belong in `static/`. Build configs are at project root (`svelte.config.js`, `vite.config.js`).
- Keep new modules colocated with related features; follow the folder naming already in place (e.g., `src/lib/components/event/` for event UI).

## Build, Test, and Development Commands
- `npm install` — install dependencies (Node 18+ required).
- `npm run dev` — start the Vite dev server at `http://localhost:5173`.
- `npm run build` — generate production bundles; used by CI.
- `npm run preview` — serve the production build locally.

## Coding Style & Naming Conventions
- Formatting is enforced via `.editorconfig`: UTF-8, LF line endings, two-space indentation, trailing newline.
- Prefer Svelte components in PascalCase (`EventCard.svelte`), stores in camelCase, and derived store factories prefixed with `use` or `create`.
- Business logic stays in `<script>` blocks; markup should primarily leverage Tailwind utility classes.
- When adding scripts/tools (linting, formatting), document them in `package.json`.

## Testing Guidelines
- No automated suite ships yet. Run manual checks across event listing, filtering, auth flows, and the Leaflet map before merging.
- If you add automated tests, place unit specs next to the component (`ComponentName.spec.ts`) and use Vitest; document any new npm scripts.

## Commit & Pull Request Guidelines
- Follow short, lowercase commit summaries (`add map radius control`). Reference issues with “Fixes #123” when applicable.
- Pull requests should describe the problem, capture before/after behavior, and include screenshots for UI changes. Note manual verification steps and new env/config requirements.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and supply required `VITE_` variables (`VITE_API_URL` must target the backend). Only expose `PUBLIC_` values in the client bundle.
- Ensure `.svelte-kit/` remains untracked. Do not commit secrets; manage OAuth keys via local secret stores.
