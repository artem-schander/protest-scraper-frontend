# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit SSR frontend for listing upcoming protests and demonstrations. It connects to the [protest-scraper](https://github.com/artem-schander/protest-scraper) backend API.

**Key Technologies:**
- **SvelteKit** (SSR with file-based routing, Node adapter)
- **Tailwind CSS** (via CDN, configured in `src/app.html`)
- **svelte-i18n** (internationalization with EN/DE support)
- **date-fns** (locale-aware date formatting)
- **Leaflet** (map-based radius picker)
- **Iconify** (@iconify/svelte for icons from icones.js.org)

## Development Commands

```bash
# Install dependencies (Node 18+)
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Node adapter build
npm run start
```

## Environment Configuration

Required: Create `.env` from `.env.example`:
```bash
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# GitHub repository URL
PUBLIC_GITHUB_URL=https://github.com/artem-schander/protest-scraper-frontend

# Optional: Imprint/legal page data (PUBLIC_IMPRINT_*)
# Optional: Privacy policy data (PUBLIC_PRIVACY_*)
# Optional: OAuth credentials (VITE_GOOGLE_CLIENT_ID)
```

**Environment variable usage:**
- `VITE_API_URL` - Used in `src/routes/+page.server.js` (via `$env/static/private`) and `src/lib/utils/api.js` (via `import.meta.env`)
- `PUBLIC_*` - Accessible in both server and client code

## Architecture & Key Patterns

### SvelteKit Routing & SSR

**File-based routing:**
- `src/routes/+page.svelte` = `/` (landing page)
- `src/routes/+page.server.js` = SSR data loader for landing page
- `src/routes/+layout.svelte` = Root layout wrapper
- `src/routes/events/create/+page.svelte` = `/events/create`

**SSR Pattern:**
```javascript
// +page.server.js
export async function load({ url, fetch }) {
  // Extract query params from URL
  // Fetch data server-side
  // Return props to +page.svelte
}
```

Data flows: Server → +page.server.js → +page.svelte component

### Internationalization (i18n)

**Critical Architecture:**
The app supports EN/DE localization using `svelte-i18n` with SSR-safe cookie persistence.

**Setup flow:**
1. `src/hooks.server.js` runs on every request:
   - Reads `protest-scraper-locale` cookie
   - Falls back to `Accept-Language` header
   - Calls `setupI18n()` to resolve locale
   - Sets cookie if missing/changed
   - Stores in `event.locals.locale`

2. Locale resolution priority (in `src/lib/i18n/index.js`):
   - Provided locale (from cookie/header)
   - Browser cookie (client-side)
   - Navigator language (client-side)
   - Fallback to 'en'

**Key functions:**
- `setupI18n(initialLocale, { persist })` - Initialize i18n, optionally persist to cookie
- `setAppLocale(nextLocale)` - Change language (client-side), updates store + cookie
- `$t('key.path')` - Translate using current locale
- `$locale` - Reactive current locale store

**Usage in components:**
```svelte
<script>
  import { t, locale } from '$lib/i18n';
</script>

<p>{$t('filters.export.title')}</p>
<p>Current locale: {$locale}</p>
```

**Adding new translations:**
1. Add key to `src/lib/i18n/locales/en.json`
2. Add corresponding key to `src/lib/i18n/locales/de.json`
3. Use `$t('your.new.key')` in components

### State Management with Stores

**Two main stores:**

1. **authStore** (`src/lib/stores/auth.js`):
   - Manages authentication state (token, user, isAuthenticated)
   - Persists to localStorage (authToken, authUser)
   - Methods: `login()`, `logout()`, `updateUser()`, `checkAuth()`
   - SSR-safe: checks `browser` from `$app/environment`

2. **themeStore** (`src/lib/stores/theme.js`):
   - Manages theme (light/dark/system)
   - Defaults to 'system' (OS preference)
   - **Critical**: Must call `themeStore.init()` in `+layout.svelte` onMount
   - Persists to localStorage and applies dark class to `<html>`

**Store Usage Pattern:**
```svelte
<script>
  import { authStore } from '$lib/stores/auth';

  // Access reactive state
  $: isLoggedIn = $authStore.isAuthenticated;

  // Call methods
  authStore.login(token, user);
</script>
```

### Dark Mode Implementation

**Critical Architecture:**
1. **Pre-Tailwind Script** in `src/app.html` runs BEFORE Tailwind loads to prevent flash
2. Script checks localStorage or defaults to 'system'
3. Applies `dark` class to `<html>` element
4. Tailwind's `darkMode: 'class'` reads this class
5. All components use `dark:` modifiers for dark mode styles

**When adding new components:**
- Always include `dark:` variants for colors, backgrounds, borders
- Example: `text-black dark:text-white`, `bg-white dark:bg-stone-800`

See `DARK_MODE.md` for detailed implementation.

### Tailwind Configuration

**Location:** Inline in `src/app.html` (NOT tailwind.config.js)

```javascript
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      // Custom colors, fonts here
    }
  }
}
```

**Design tokens:**
- Gradients: emerald-to-lime for primary actions
- Urgency colors: amber/orange for <7 days, emerald/lime for 7-30 days
- Text: black/white only (no grays for primary text, use opacity)
- Rounded corners: xl (12px) for cards, full for buttons

### API Integration Pattern

**Client-side API calls** (`src/lib/utils/api.js`):
```javascript
// Centralized API client with auth token injection
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthToken() {
  return localStorage.getItem('authToken');
}

async function apiRequest(endpoint, options) {
  // Adds Authorization header if token exists
  // Returns parsed JSON or throws error
}
```

**Server-side API calls** (`+page.server.js`):
- Use SvelteKit's `fetch` from load function
- No auth token (SSR context)
- Build query params from URL searchParams

**Backend API Endpoints:**
- `GET /api/protests` - List with filters (search, city, country, startDate, endDate, days, lat, lon, radius, skip, limit)
- `GET /api/protests/:id` - Single event
- `POST /api/protests` - Create (auth required)
- `PUT /api/protests/:id` - Update (auth required)
- `DELETE /api/protests/:id` - Delete (auth required)
- `POST /api/auth/login` - Returns {token, user}
- `POST /api/auth/register` - Returns {token, user}
- `GET /api/export/csv` - CSV export with filters
- `GET /api/export/json` - JSON export with filters
- `GET /api/export/ics` - ICS download with filters
- `GET /api/export/ics` - ICS calendar subscription (webcal://)

**Filter parameters:**
- `search` - Text search across title/description
- `city`, `country` - Location filters
- `startDate`, `endDate` - Date range (ISO format)
- `days` - Legacy/subscription date filter (events in next N days)
- `lat`, `lon`, `radius` - Geolocation (radius in km)
- `skip`, `limit` - Pagination (skip = (page - 1) * limit)

### Component Organization

**Component hierarchy:**
```
lib/components/
├── common/          # Reusable primitives (Button, Input, Modal, Icon, ThemeToggle, MapPicker, DateRangePicker)
├── event/           # Event-specific (EventCard, QuickFilters)
├── auth/            # Auth modals (LoginModal, RegisterModal)
└── layout/          # Layout components (Header, Footer, FilterSidebar, ExportActions)
```

**Key component patterns:**

**EventCard** - Displays single event with urgency-based gradient:
```svelte
// Urgency logic determines gradient class
if (daysUntil <= 7) → amber/orange gradient
else if (daysUntil <= 30) → emerald/lime gradient
else → sky/indigo gradient
```

**FilterSidebar** - Desktop sidebar / Mobile drawer:
- Desktop: `lg:block`, fixed position
- Mobile: Drawer with backdrop, triggered by mobile filter button
- Updates URL searchParams on apply
- Uses SvelteKit's `goto()` for navigation
- Includes DateRangePicker and MapPicker (Leaflet)

**ExportActions** - Export and calendar subscription panel:
- Sanitizes filters before building export URLs
- CSV/JSON/ICS downloads (snapshot of current results)
- ICS calendar subscription URL (live feed with configurable horizon)
- Subscription excludes date range filters, uses `days` parameter instead
- Copy-to-clipboard functionality with visual feedback
- Located in `src/lib/components/layout/ExportActions.svelte`

**MapPicker** - Leaflet-based radius selector:
- Interactive map for selecting lat/lon and radius
- Supports geolocation ("Near me" button)
- Circle overlay shows selected radius
- Updates filter state on change

**Modal Pattern:**
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  export let isOpen = false;
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }
</script>

<Modal bind:isOpen on:close={() => isOpen = false}>
  <!-- content -->
</Modal>
```

### Form Handling

**Multi-step form pattern** (see `src/routes/events/create/+page.svelte`):
- Local `step` state (1-4)
- All form data in single `formData` object
- Validation per step before advancing
- Uses SvelteKit form actions (optional) or direct API call

**Authentication check:**
```svelte
$: if (!$authStore.isAuthenticated && typeof window !== 'undefined') {
  goto('/');
}
```

### Date Formatting Utilities

**Location:** `src/lib/utils/dateFormat.js`

All date formatting functions are **locale-aware** and integrate with the i18n system via `date-fns` locales.

**Key functions:**
- `formatDate(date, formatStr, localeCode)` - Format date with pattern (defaults to current locale)
- `formatTime(date, { use24Hour }, localeCode)` - Time formatting
- `formatTimeRange(startDate, endDate, options, localeCode)` - Format time range
- `getDaysUntil(date)` - Returns number of days until future date (calendar days)
- `formatDateRange(start, end, localeCode)` - Smart range formatting (same day/month/year)
- `getRelativeTime(date, localeCode)` - "in 3 days", "vor 2 Tagen", etc.

**Implementation details:**
- All functions accept ISO strings, Date objects, or timestamps
- Invalid dates return empty string/null
- `toDate()` helper validates and normalizes input
- Uses `date-fns` with locale map: `{ en: enUS, de: de }`
- Automatically reads current locale from `$locale` store if not provided

**Usage:**
```javascript
import { formatDate, formatDateRange, getDaysUntil } from '$lib/utils/dateFormat';

// Auto-detects current locale
formatDate(protest.date); // "18 Oct 2025" or "18 Okt 2025"

// Smart range formatting
formatDateRange('2025-10-18', '2025-10-20'); // "18 – 20 Oct 2025"
formatDateRange('2025-10-18', '2025-11-02'); // "18 Oct – 2 Nov 2025"

// Days until calculation (for urgency logic)
const days = getDaysUntil(protest.date); // 7
```

## Design System Guidelines

**Color Usage:**
- **Primary actions**: Gradient `from-emerald-400 to-lime-400`
- **Text**: `text-black dark:text-white` (never gray-900/100)
- **Secondary text**: Use opacity: `text-black/60 dark:text-white/60`
- **Borders**: `border-stone-200 dark:border-stone-700`
- **Backgrounds**: `bg-stone-50 dark:bg-stone-900` (page), `bg-white dark:bg-stone-800` (cards)

**Typography:**
- Font: Inter (loaded from Google Fonts in app.html)
- Use Tailwind text scales: text-3xl (headings) down to text-xs (labels)

**Spacing:**
- Mobile-first: Start with `p-4 gap-3`
- Desktop breakpoints: `md:p-6` → `lg:p-8`

**Interactive States:**
- Buttons: `hover:scale-[1.02] active:scale-[0.98]`
- Cards: `hover:-translate-y-1 hover:shadow-xl`
- All transitions: `transition-all duration-200`

**Icons:**
- Use Iconify: `<Icon icon="heroicons:icon-name" class="w-5 h-5" />`
- Browse icons at icones.js.org
- Prefer heroicons collection for consistency

## Common Development Tasks

### Adding a New Translation

1. Add English key to `src/lib/i18n/locales/en.json`:
```json
{
  "your": {
    "new": {
      "key": "English text"
    }
  }
}
```

2. Add German translation to `src/lib/i18n/locales/de.json`:
```json
{
  "your": {
    "new": {
      "key": "Deutscher Text"
    }
  }
}
```

3. Use in components:
```svelte
<script>
  import { t } from '$lib/i18n';
</script>
<p>{$t('your.new.key')}</p>
```

**For translations with variables:**
```json
// en.json
"greeting": "Hello, {name}!"

// In component
$t('greeting', { values: { name: 'World' } })
```

### Adding a New Page

```bash
mkdir -p src/routes/your-page
touch src/routes/your-page/+page.svelte
# Optional: +page.server.js for SSR
```

### Adding SSR Data Loading

```javascript
// +page.server.js
export async function load({ params, url, fetch }) {
  const data = await fetch('API_URL');
  return { data };
}
```

### Creating a New Component

```svelte
<!-- src/lib/components/category/ComponentName.svelte -->
<script>
  import { t } from '$lib/i18n';

  export let prop1;
  export let prop2 = 'default';

  // Component logic
</script>

<div class="text-black dark:text-white">
  <!-- Always include dark: variants and use $t() for text -->
  <p>{$t('component.text.key')}</p>
</div>
```

### Adding Dark Mode to Existing Component

1. Find all color classes: text-*, bg-*, border-*
2. Add dark: variants:
   - `text-black` → `text-black dark:text-white`
   - `bg-white` → `bg-white dark:bg-stone-800`
   - `border-stone-200` → `border-stone-200 dark:border-stone-700`
3. Test with theme toggle in header

### Updating API Integration

**For new endpoint:**
```javascript
// src/lib/utils/api.js
export async function myNewEndpoint(data) {
  return await apiRequest('/my-endpoint', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

**For authenticated endpoint:**
Token is automatically added by `apiRequest()` if it exists in localStorage.

## Important Notes

### SSR Considerations

- **Browser checks required**: Always check `browser` from `$app/environment` before accessing localStorage/window
- **Store initialization**: Stores that use localStorage must handle SSR (see auth/theme stores)
- **Fetch in load functions**: Use SvelteKit's `fetch` for automatic SSR/CSR handling
- **i18n in hooks**: `src/hooks.server.js` sets up i18n on every request, stores locale in `event.locals.locale`
- **Cookie persistence**: Locale is persisted in `protest-scraper-locale` cookie (1 year max-age)

### Internationalization Flow

1. Server-side (`hooks.server.js`):
   - Reads locale from cookie or Accept-Language header
   - Calls `setupI18n()` with `{ persist: false }` (already in cookie)
   - Sets `event.locals.locale` for use in components
   - Updates cookie if changed

2. Client-side (components):
   - Import `t` and `locale` from `$lib/i18n`
   - Use `$t('key')` for reactive translations
   - Use `setAppLocale(newLocale)` to change language
   - Date formatting automatically uses current locale

3. **Adding new locales:**
   - Add to `SUPPORTED_LOCALES` in `src/lib/i18n/index.js`
   - Add to `LANGUAGE_OPTIONS` array
   - Create locale file in `src/lib/i18n/locales/`
   - Add to `localeMap` in `src/lib/utils/dateFormat.js` (import from date-fns)

### Authentication Flow

1. User submits login → calls `login()` from `src/lib/utils/api.js`
2. API returns `{token, user}`
3. Call `authStore.login(token, user)` → saves to localStorage
4. Header reactively shows user info via `$authStore.isAuthenticated`
5. Protected routes check auth in script block

### Theme Persistence

Theme is stored in localStorage as 'light', 'dark', or 'system'. The `src/app.html` script applies it before hydration to prevent flash. Components use Tailwind's `dark:` classes which read the `dark` class on `<html>`.

### Filter State Management

Filters are stored in URL searchParams (not in a store). This enables:
- Shareable URLs
- Browser back/forward
- SSR support
- Page refresh preservation

Update filters → call `goto(newUrl)` → triggers SSR load → new data

**Filter processing in `+page.server.js`:**
- Supports both legacy `days` param and new `startDate/endDate`
- Converts `page` to `skip` for API (skip = (page - 1) * limit)
- Returns pagination metadata for client

### Event Card Urgency Logic

Cards change gradient based on time until event:
- **<= 7 days**: Amber/orange (urgent)
- **8-30 days**: Emerald/lime (upcoming)
- **> 30 days**: Sky/indigo (future)

This is calculated in EventCard component using `getDaysUntil()`, not server-side.

### Export and Calendar Subscription

**Export URLs** (CSV/JSON/ICS download):
- Include all current filters (search, date range, location, etc.)
- Snapshot of results at time of download
- Built via `getExportUrl(format, filters)` in `src/lib/utils/api.js`

**Calendar subscription** (ICS live feed):
- Excludes `startDate/endDate` filters
- Uses `days` parameter for rolling window (default 120 days)
- User can configure horizon in ExportActions component
- Built via `getCalendarSubscriptionUrl(filters)`
- Returns `webcal://` URL for calendar apps

## Debugging Tips

**SSR vs Client rendering:**
```javascript
console.log('Server or client:', browser ? 'client' : 'server');
```

**Check theme application:**
```javascript
// In browser console
document.documentElement.classList.contains('dark')
localStorage.getItem('theme')
```

**Check current locale:**
```javascript
// In browser console
document.cookie.match(/protest-scraper-locale=([^;]+)/)?.[1]
localStorage.getItem('protest-scraper-locale') // Not used - cookie is source of truth

// In Svelte component
import { locale } from '$lib/i18n';
console.log($locale); // Current locale code
```

**API connection issues:**
- Verify `VITE_API_URL` in `.env`
- Check backend is running
- Look for CORS errors in browser console
- Server-side uses `$env/static/private`, client-side uses `import.meta.env`

**Dark mode not working:**
1. Check `app.html` script runs before Tailwind
2. Verify `darkMode: 'class'` in Tailwind config
3. Ensure components have `dark:` variants
4. Check `themeStore.init()` is called in +layout.svelte

**i18n not working:**
1. Verify translation keys exist in both `en.json` and `de.json`
2. Check `hooks.server.js` is setting locale cookie
3. Use browser DevTools → Application → Cookies to inspect `protest-scraper-locale`
4. Ensure `$t()` is used (not `t()`) for reactivity
5. Check date formatting functions receive correct locale from store

## Reference Documentation

- SvelteKit: https://kit.svelte.dev/docs
- Tailwind CSS: https://tailwindcss.com/docs
- svelte-i18n: https://github.com/kaisermann/svelte-i18n
- date-fns: https://date-fns.org/docs
- Leaflet: https://leafletjs.com/reference.html
- Iconify: https://icones.js.org
- Backend API: https://github.com/artem-schander/protest-scraper
