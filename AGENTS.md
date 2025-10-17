# Repository Guidelines

## Project Structure & Module Organization
The SvelteKit app lives in `src/`, with route entries and server loads under `src/routes/`. Shared UI belongs in `src/lib/components/{auth,common,event,layout}`, while global state sits in `src/lib/stores/`, utilities in `src/lib/utils/`, and locale files in `src/lib/i18n/`. Place static assets (maps, fonts, imagery) in `static/`. Project-wide configuration is maintained in `svelte.config.js`, `vite.config.js`, and the onboarding notes in `README.md` plus `QUICKSTART.md`.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies (Node 18+). Use `npm run dev` for the Vite dev server at `http://localhost:5173`. Bundle production assets with `npm run build`, then sanity-check the output via `npm run preview`. If you add custom scripts (e.g., lint or test), document them in `package.json` and this guide.

## Coding Style & Naming Conventions
The `.editorconfig` enforces UTF-8, LF endings, two-space indentation, trailing newline, and single quotes in JS/TS. Name Svelte components in PascalCase (`EventCard.svelte`), stores and helpers in camelCase modules, and prefix derived store factories with `use` or `create`. Favor Tailwind utility classes in markup and keep business logic within `<script>` blocks above the template.

## Testing Guidelines
No automated suite ships today; run manual passes across event listing, filtering, auth modals, and map interactions before shipping. When adding coverage, colocate specs as `ComponentName.spec.ts` within `src/`, and prefer Vitest for unit coverage or Playwright for end-to-end flows. Note new commands in `package.json` and mention manual verification steps in reviews.

## Commit & Pull Request Guidelines
Follow the repository style: concise, lower-case summaries (`list+filters done`). Fixes belong in focused commits that reference issues when relevant (`Fixes #123`). Pull requests should describe the problem, highlight before/after behavior, attach screenshots for UI changes, and list any manual test steps or new env/config requirements.

## Security & Configuration Tips
Copy `.env.example` to `.env` and supply the required `VITE_` variables (`VITE_API_URL` must target a running backend). Only `PUBLIC_` values are safe for the client bundle. Confirm `.svelte-kit/` stays ignored, avoid committing secrets, and manage OAuth keys via local secret managers.
