# Repository Guidelines

## Project Structure & Module Organization
The SvelteKit app lives in `src`, with pages and server load handlers in `src/routes`. Shared UI sits in `src/lib/components/{auth,common,event,layout}`, state in `src/lib/stores`, helpers in `src/lib/utils`, and locale files in `src/lib/i18n`. Static assets (maps, images, fonts) belong in `static/`. Keep configuration in `svelte.config.js`, `vite.config.js`, and cross-check docs in `README.md` and `QUICKSTART.md`.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies (Node 18+). Use `npm run dev` to start the Vite dev server on `http://localhost:5173`. Ship bundles with `npm run build`, then smoke-test production output locally via `npm run preview`.

## Coding Style & Naming Conventions
The `.editorconfig` enforces UTF-8, LF endings, two-space indents, trailing newline, and single quotes in JS/TS. Name Svelte components in PascalCase (`EventCard.svelte`), stores/utilities in camelCase modules, and keep derived state exports prefixed with `use` or `create` when relevant. Compose styling with Tailwind utility classes inside markup and keep business logic in `<script>` blocks above markup.

## Testing Guidelines
No automated harness is wired up yet; cover new work with manual passes through event listing, filtering, auth modals, and map interactions before requesting review. When adding automated tests, follow SvelteKit defaults: colocate component specs as `<name>.spec.ts` inside `src`, and prefer Playwright or Vitest if end-to-end coverage is needed. Document any new test commands inside `package.json` scripts.

## Commit & Pull Request Guidelines
Recent history favors concise, lower-case summaries (`list+filters done`); follow that format and keep scope focused per commit. Reference GitHub issues with `Fixes #123` when applicable and describe any schema, API, or environment changes in the commit body. Pull requests should include a clear problem statement, before/after notes or screenshots for UI work, test evidence (manual steps or command output), and mention of new env vars or migrations.

## Configuration & Security Notes
Copy `.env.example` to `.env` and fill required `VITE_` variables (`VITE_API_URL` must target a running backend). Never commit secrets; rely on the `PUBLIC_` prefix only for values safe to expose to the client. When onboarding agents, confirm that `.svelte-kit/` remains untracked and that any OAuth keys live in your local secrets manager.

