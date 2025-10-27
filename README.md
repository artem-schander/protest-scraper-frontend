# Protest Listing Platform – Frontend

**🌐 Live at:** [https://protest-listing.com](https://protest-listing.com)

> **📦 Part of the [Protest Scraper](https://github.com/artem-schander/protest-scraper) project**
> This is the SvelteKit frontend. See also: [Backend API](https://github.com/artem-schander/protest-scraper) (Node.js/Express/MongoDB) | [Production API](https://scraper.protest-listing.com/api)

SvelteKit frontend for the protest-scraper API. The app ships with geolocation-aware filters, map tooling, rich exports, and full EN/DE localisation backed by SSR-safe cookies.

## Highlights

- **Informed discovery** – Landing page combines text search, quick filters (soon, weekend, near me), and a Leaflet-based radius picker for precise lookups.
- **International & accessible** – `svelte-i18n` drives the copy, date-fns formats dates per locale, and language can be switched without reload flicker.
- **Dark mode done right** – Theme preference is applied pre-hydration in `app.html`, persisted in `themeStore`, and toggled via `ThemeToggle.svelte`.
- **Data portability** – Export panel generates CSV/JSON/ICS downloads and exposes an iCalendar subscription URL that mirrors active filters.
- **Auth-ready flows** – Login/Register modals, a six-character email verification modal, and the event creation wizard talk to the REST API once credentials are supplied.

## Development

```bash
npm install            # install dependencies (Node 18+)
cp .env.example .env   # configure VITE_API_URL and optional imprint/privacy fields
npm run dev            # start Vite on http://localhost:5173
npm run build          # produce production bundle
npm run preview        # serve the built output
npm run start          # run the Node adapter build via server.cjs
```

Set `VITE_API_URL` to the protest-scraper backend (defaults to `http://localhost:3000/api`). Extra `PUBLIC_IMPRINT_*` and `PUBLIC_PRIVACY_*` keys fill the legal pages, and the Terms/Privacy/Disclaimer routes read those values. OAuth keys are optional placeholders.

## Project Layout

```
src/
├─ app.html                 # Tailwind CDN boot + dark-mode guard
├─ hooks.server.js          # Locale negotiation via cookies
├─ routes/                  # SvelteKit routes (+page/+layout pairs)
│  ├─ +page.svelte          # Search results, quick filters, exports
│  ├─ events/create/        # Auth-guarded creation wizard
│  └─ about|imprint|privacy # Static content routes
├─ lib/
│  ├─ components/           # common/, event/, layout/, auth/ UI (Login + Register + Verification modals)
│  ├─ stores/               # theme and auth stores
│  ├─ i18n/                 # locale loader + JSON dictionaries
│  └─ utils/                # api.js, dateFormat.js (date-fns), iconPreloader.js
static/                     # hero imagery, fonts, favicon
```

## Feature Notes

- Server `load` in `src/routes/+page.server.js` maps query params to the API spec (search, city/country, `lat/lon/radius`, date ranges, pagination).
- Quick filters mutate URL params in place; the **Near me** chip reads browser geolocation and labels itself with the resolved coordinates.
- `FilterSidebar.svelte` bundles the date range picker and Leaflet radius selector for both desktop and mobile overlays.
- `ExportActions.svelte` sanitises active filters before building CSV/JSON/ICS links and exposes an ICS subscription link with adjustable horizon.
- `EmailVerificationModal.svelte` collects the six-character verification code, handles resend cooldowns, and wires user state via `authStore`.
- `/terms`, `/privacy`, and `/disclaimer` are static routes that share the legal metadata configured via `PUBLIC_IMPRINT_*` variables; the Terms page outlines acceptable use, API rules, and the verification policy.
- `dateFormat.js` wraps `date-fns` helpers so EventCard, headers, and other components react instantly to locale changes.

## Contributing

Follow the workflow in `AGENTS.md`, ensure `npm run build` succeeds, and document any new environment variables or cookies in both `.env.example` and the quick start material.

## License

AGPL-3.0 License © 2025 Artem Schander
