# Quick Start Guide

## 1. Install & configure

```bash
npm install
cp .env.example .env
```

Update `.env` values:

```
VITE_API_URL=http://localhost:3000/api    # protest-scraper backend
PUBLIC_IMPRINT_* / PUBLIC_PRIVACY_*       # optional legal copy
```

## 2. Run the app

```bash
npm run dev        # dev server on http://localhost:5173
npm run build      # compile for production
npm run preview    # serve the build locally
```

Append `-- --host` when testing on another device.

## 3. Know the layout

```
src/
├─ app.html                # Tailwind CDN + dark-mode guard
├─ routes/
│  ├─ +page.svelte         # event list, quick filters, exports
│  ├─ +page.server.js      # SSR data fetch against VITE_API_URL
│  ├─ events/create/       # 4-step creation wizard (auth required)
│  └─ about|imprint|...    # static content pages
├─ lib/
│  ├─ components/common    # Button, Input, DateRangePicker, MapPicker…
│  ├─ components/event     # EventCard, QuickFilters
│  ├─ components/layout    # Header, FilterSidebar, ExportActions
│  ├─ stores               # themeStore, authStore
│  └─ utils                # api.js, dateFormat.js (date-fns), iconPreloader.js
static/                    # hero imagery, fonts, favicon
```

## 4. Manual test loop

1. **Search & filters** – run a text search, toggle quick filters (Soon, Weekend, Near me), and adjust the sidebar date range and radius slider.
2. **Geolocation** – activate “Near me”; the chip should show resolved `lat, lon` and the Leaflet map should render the radius marker.
3. **Exports** – open the export panel, download CSV/JSON/ICS, and copy the subscription URL.
4. **Internationalisation** – switch EN ↔ DE; confirm EventCard labels, dates, and relative time update instantly.
5. **Dark mode** – cycle themes, reload the page, and verify the preference persists without a flash.
6. **Auth flows** – open the Login/Register modals and, once a token exists, walk through the event creation wizard.

## 5. Troubleshooting

- **API errors** – confirm the backend is reachable, `VITE_API_URL` matches it, and responses pass CORS.
- **Geolocation denied** – clear the `lat/lon/radius` URL params manually or reset filters.
- **Icon flashes** – ensure `preloadIcons()` runs in `+layout.svelte` and that new glyphs are listed in `iconPreloader.js`.
- **Locale hiccups** – delete the `protest-scraper-locale` cookie to renegotiate language.

## 6. Useful commands

- `rg 'icon="' src` – list icons to preload.
- `npm run build && npm run preview` – smoke test the production bundle.
- `git status --short` – verify docs-only changes before committing.
