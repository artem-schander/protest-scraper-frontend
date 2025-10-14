# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
protest-scraper-frontend/
├── src/
│   ├── app.html                    # Root HTML with Tailwind CDN
│   ├── routes/                     # Pages (SvelteKit routing)
│   │   ├── +layout.svelte         # Main layout wrapper
│   │   ├── +page.svelte           # Landing page (/)
│   │   ├── +page.server.js        # SSR data loading
│   │   └── events/create/         # Create event page (/events/create)
│   └── lib/
│       ├── components/             # Reusable components
│       │   ├── common/            # Button, Input, Modal, etc.
│       │   ├── event/             # EventCard, QuickFilters
│       │   ├── auth/              # Login/Register modals
│       │   └── layout/            # Header, FilterSidebar
│       ├── stores/                # Svelte stores
│       │   └── auth.js           # Authentication state
│       └── utils/                 # Helper functions
│           ├── api.js            # API client
│           └── dateFormat.js     # Date utilities
├── static/                        # Static assets
├── package.json
├── svelte.config.js
└── vite.config.js
```

---

## 🎨 Design Features

### Color Scheme
- **Primary**: Emerald to Lime gradient (`from-emerald-400 to-lime-400`)
- **Text**: Black (`text-black`) with opacity variants
- **Backgrounds**: Soft gradients for cards based on urgency

### Typography
- **Font**: Inter (loaded from Google Fonts)
- **Mobile First**: Responsive on all devices

### Components
All components follow the design system with:
- Rounded corners (`rounded-xl`, `rounded-full`)
- Soft shadows (`shadow-md`, `shadow-lg`)
- Smooth transitions (`transition-all duration-200`)
- Hover effects (scale, shadow changes)

---

## 🔧 Key Components

### EventCard
Displays event information with:
- Date badge (month + day)
- Source indicator
- Location and time
- Tags
- Verified badge
- Urgency-based gradient background

**Usage:**
```svelte
<EventCard event={protestData} />
```

### FilterSidebar
Advanced filtering with:
- Date range selection
- City search
- Source filter
- Language filter
- Geolocation (near me)

**Desktop**: Fixed sidebar
**Mobile**: Bottom drawer

### Header
Navigation with:
- Logo and branding
- Search (future)
- Auth buttons (Login/Register)
- User menu (when authenticated)

### Auth Modals
- Login modal with email/password
- Register modal with validation
- Google OAuth option (UI ready)

---

## 🌐 API Integration

The app connects to your backend at the URL specified in `.env`.

### Main API Calls:

**Get Events:**
```javascript
import { getProtests } from '$lib/utils/api';

const data = await getProtests({
  city: 'Berlin',
  dateRange: '30',
  source: 'Berlin Police'
});
```

**Create Event:**
```javascript
import { createProtest } from '$lib/utils/api';

const response = await createProtest({
  title: 'Climate March',
  startDate: '2025-02-15T14:00:00Z',
  location: { city: 'Berlin', country: 'Germany' }
});
```

**Authentication:**
```javascript
import { login, register } from '$lib/utils/api';

const response = await login('user@email.com', 'password');
```

---

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with search bar
- Quick filters (Today, This Week, Near Me)
- Event grid with pagination
- Filter sidebar (desktop) / drawer (mobile)
- Floating action button (create event)

**SSR**: Events are loaded server-side for SEO and performance.

### Create Event (`/events/create`)
Multi-step form:
1. **Basic Info**: Title, description, image
2. **Date & Time**: Start/end date and time
3. **Location**: Address, city, country, coordinates
4. **Additional**: Source, tags, expected attendees

**Authentication**: Required (redirects if not logged in)

---

## 🎯 Next Steps

### 1. Connect to Backend
Make sure your [protest-scraper backend](https://github.com/artem-schander/protest-scraper) is running:
```bash
# In your backend directory
docker-compose up -d
```

### 2. Test Authentication
- Click "Sign Up" in the header
- Create an account
- Try logging in

### 3. Create Test Event
- Log in
- Click the "+" floating button (mobile) or "Create Event" (desktop)
- Fill in the 4-step form
- Submit

### 4. Test Filters
- Use quick filters (Today, This Week)
- Open filter sidebar
- Try different combinations

### 5. Customize
- Update colors in `src/app.html` (Tailwind config)
- Add more sources in `FilterSidebar.svelte`
- Modify API URL in `.env`

---

## 🛠 Common Tasks

### Add a New Page
```bash
# Create new route
mkdir -p src/routes/about
touch src/routes/about/+page.svelte
```

### Add a New Component
```bash
# Create component
mkdir -p src/lib/components/custom
touch src/lib/components/custom/MyComponent.svelte
```

### Update API Endpoint
Edit `src/lib/utils/api.js` and add your function:
```javascript
export async function myNewEndpoint() {
  return await apiRequest('/my-endpoint');
}
```

### Add New Icon
Browse [icones.js.org](https://icones.js.org) and use:
```svelte
<script>
  import Icon from '@iconify/svelte';
</script>

<Icon icon="heroicons:icon-name" class="w-5 h-5" />
```

---

## 🐛 Troubleshooting

**Issue**: "Cannot connect to API"
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

**Issue**: "Module not found"
- Run `npm install` again
- Delete `node_modules` and reinstall

**Issue**: "Page not loading"
- Check SvelteKit dev server is running on port 5173
- Clear browser cache
- Check for JavaScript errors in console

**Issue**: "Build fails"
- Check all imports are correct
- Ensure all required dependencies are installed
- Try `npm run build` to see detailed errors

---

## 📚 Learn More

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Iconify Icon Sets](https://icones.js.org)
- [Backend API Docs](https://github.com/artem-schander/protest-scraper)

---

## ✅ Checklist

Before deploying:
- [ ] Update `VITE_API_URL` to production URL
- [ ] Test all forms and validation
- [ ] Test authentication flow
- [ ] Test on mobile devices
- [ ] Check console for errors
- [ ] Optimize images (if any)
- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`

---

Happy coding! 🎉
