# Protest Listing Platform – Frontend

A modern, responsive SvelteKit application for listing upcoming protests and demonstrations. The UI is fully internationalised (English/German), SSR-friendly, and tuned for fast filtering and geolocation searches.

## Features

- 🎨 **Polished UI** – Soft gradients, smooth transitions, and Tailwind-powered layout
- 🌓 **Dark Mode** – System detection plus manual toggle, persisted without flicker
- 🌍 **Internationalisation** – Header switcher (EN/DE) backed by `svelte-i18n` and SSR-safe locale cookies
- 🔍 **Rich Filters** – Date range picker, location radius map picker, language/source filters
- 🗺️ **Geolocation** – Optional “use my location” support for proximity searches
- ⚡ **Server Rendering** – Locale/theme cookies hydrate seamlessly for instant first paint

## Tech Stack

- **Framework**: SvelteKit (SSR)
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Iconify (`@iconify/svelte`)
- **Internationalisation**: `svelte-i18n` with JSON locale bundles
- **Backend**: [protest-scraper](https://github.com/artem-schander/protest-scraper) REST API

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see [protest-scraper](https://github.com/artem-schander/protest-scraper))

### Installation

1. **Clone & install**
   ```bash
   git clone <your-repo-url>
   cd protest-scraper-frontend
   npm install
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `VITE_API_URL` plus optional imprint/privacy details:
   ```
   VITE_API_URL=http://localhost:3000/api
   PUBLIC_IMPRINT_NAME=Example Org
   PUBLIC_IMPRINT_EMAIL=info@example.org
   PUBLIC_PRIVACY_EMAIL=privacy@example.org
   # ...see .env.example for the full list (address, phone, supervisory authority, etc.)
   ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit <http://localhost:5173>.

4. **Production build**
   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
src/
├── hooks.server.js             # Resolves locale cookie per request
├── routes/
│   ├── +layout.svelte          # Root layout (theme init, locale hydration)
│   ├── +layout.server.js       # Passes resolved locale to the layout
│   ├── +page.svelte            # Landing page with search & filters
│   ├── about/+page.svelte      # About page (i18n content)
│   ├── imprint/+page.svelte    # Legal imprint / Impressum
│   ├── privacy/+page.svelte    # GDPR-compliant privacy policy
│   └── disclaimer/+page.svelte # Disclaimer / Haftungsausschluss
├── lib/
│   ├── components/
│   │   ├── common/             # Shared UI (Button, Modal, MapPicker, DateRangePicker…)
│   │   ├── layout/             # Header, Footer, FilterSidebar
│   │   └── event/              # Event cards and related widgets
│   ├── i18n/                   # Locale JSON bundles and setup helper
│   ├── stores/                 # Svelte stores (auth, theme)
│   └── utils/                  # API client, icon preloader, helpers
└── app.html                    # Root HTML with Tailwind CDN
```

## Scripts

| Command            | Description                                  |
|--------------------|----------------------------------------------|
| `npm run dev`      | Start the Vite dev server                     |
| `npm run build`    | Compile the SvelteKit production bundle       |
| `npm run preview`  | Preview the production build locally          |

## Internationalisation

- Locale switcher in the header toggles between English and German.
- Server-side hooks read/write `protest-scraper-locale` (strictly necessary cookie) to keep SSR and hydration in sync.
- Add new languages by extending `src/lib/i18n/locales/*.json` and updating the language option list.

## Legal & Privacy Notes

- Optional `.env` fields (`PUBLIC_IMPRINT_*`, `PUBLIC_PRIVACY_*`) populate imprint and privacy policy pages.
- Locale and potential future session cookies are essential; document them in your privacy policy. No banner is needed unless you add analytics/marketing cookies.

## Editing & Formatting

- `.editorconfig` enforces UTF-8, LF, 2-space indents, and trailing newline.
- To convert tabs to spaces project-wide:
  ```bash
  nvim -u NORC -n     "+set tabstop=2 shiftwidth=2 expandtab"     "+argdo retab | update"     "+qa"     $(git ls-files '*.svelte' '*.ts' '*.js' '*.css' '*.scss' '*.md')
  ```

## Contributing

- Read `AGENTS.md` for repository-specific guidelines.
- Ensure `npm run build` passes before opening a PR.
- Clearly describe new environment variables, cookies, or data requirements when you introduce them.

## Credit

Protest Listing frontend works in tandem with the community-driven [protest-scraper](https://github.com/artem-schander/protest-scraper) backend. Contributions, issue reports, and new localisation pull requests are welcome!
