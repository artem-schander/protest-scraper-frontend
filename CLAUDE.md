# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit SSR frontend for listing upcoming protests and demonstrations. It connects to the [protest-scraper](https://github.com/artem-schander/protest-scraper) backend API.

**Key Technologies:**
- **SvelteKit** (SSR with file-based routing)
- **Tailwind CSS** (via CDN, configured in `src/app.html`)
- **Iconify** (@iconify/svelte for icons from icones.js.org)
- **No build-time CSS processing** - Tailwind is loaded via CDN

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Required: Create `.env` from `.env.example`:
```bash
VITE_API_URL=http://localhost:3000/api
```

The API URL is used in:
- `src/routes/+page.server.js` (hardcoded, should use env)
- `src/lib/utils/api.js` (reads from import.meta.env.VITE_API_URL)

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
- Example: `text-black dark:text-white`, `bg-white dark:bg-gray-800`

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
- `GET /api/protests` - List with filters (city, source, language, dateRange, page, lat, lon, radius)
- `GET /api/protests/:id` - Single event
- `POST /api/protests` - Create (auth required)
- `PUT /api/protests/:id` - Update (auth required)
- `DELETE /api/protests/:id` - Delete (auth required)
- `POST /api/auth/login` - Returns {token, user}
- `POST /api/auth/register` - Returns {token, user}
- `GET /api/export/ics` - Calendar subscription

### Component Organization

**Component hierarchy:**
```
lib/components/
├── common/          # Reusable primitives (Button, Input, Modal)
├── event/           # Event-specific (EventCard, QuickFilters)
├── auth/            # Auth modals (LoginModal, RegisterModal)
└── layout/          # Layout components (Header, FilterSidebar)
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

Key functions:
- `formatDate(date, 'DD/MM/YYYY')` - Custom format strings
- `formatTime(date, use24Hour)` - Time formatting
- `getDaysUntil(date)` - Returns number of days until future date
- `formatDateRange(start, end)` - Smart range formatting
- `getRelativeTime(date)` - "Tomorrow", "In 3 days", etc.

**Important:** All dates from API should be ISO strings, parsed with `new Date()`

## Design System Guidelines

**Color Usage:**
- **Primary actions**: Gradient `from-emerald-400 to-lime-400`
- **Text**: `text-black dark:text-white` (never gray-900/100)
- **Secondary text**: Use opacity: `text-black/60 dark:text-white/60`
- **Borders**: `border-gray-200 dark:border-gray-700`
- **Backgrounds**: `bg-gray-50 dark:bg-gray-900` (page), `bg-white dark:bg-gray-800` (cards)

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
  export let prop1;
  export let prop2 = 'default';

  // Component logic
</script>

<div class="text-black dark:text-white">
  <!-- Always include dark: variants -->
</div>
```

### Adding Dark Mode to Existing Component

1. Find all color classes: text-*, bg-*, border-*
2. Add dark: variants:
   - `text-black` → `text-black dark:text-white`
   - `bg-white` → `bg-white dark:bg-gray-800`
   - `border-gray-200` → `border-gray-200 dark:border-gray-700`
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

### Event Card Urgency Logic

Cards change gradient based on time until event:
- **<= 7 days**: Amber/orange (urgent)
- **8-30 days**: Emerald/lime (upcoming)
- **> 30 days**: Sky/indigo (future)

This is calculated in EventCard component, not server-side.

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

**API connection issues:**
- Verify `VITE_API_URL` in `.env`
- Check backend is running
- Look for CORS errors in browser console
- Note: `+page.server.js` has hardcoded URL (needs fixing)

**Dark mode not working:**
1. Check `app.html` script runs before Tailwind
2. Verify `darkMode: 'class'` in Tailwind config
3. Ensure components have `dark:` variants
4. Check `themeStore.init()` is called in +layout.svelte

## Reference Documentation

- SvelteKit: https://kit.svelte.dev/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Iconify: https://icones.js.org
- Backend API: https://github.com/artem-schander/protest-scraper
