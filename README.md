# Protest Listing Platform - Frontend

A modern, responsive web application for listing upcoming protests and demonstrations. Built with SvelteKit and Tailwind CSS.

## Features

- 🎨 **Beautiful Design**: Soft gradients, clean layouts, and smooth animations
- 🌓 **Dark Mode**: Automatic theme detection (system preference) with manual toggle
- 📱 **Mobile First**: Fully responsive design optimized for all devices
- 🔍 **Advanced Filtering**: Filter by location, source, date range, and more
- 🗺️ **Geolocation**: Find protests near you
- 🔐 **Authentication**: Secure user login and registration
- ✏️ **Event Management**: Create and manage protest events
- 📅 **Calendar Export**: Subscribe to events via ICS feed
- ⚡ **SSR Ready**: Server-side rendering for optimal performance

## Tech Stack

- **Framework**: SvelteKit (SSR)
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Iconify (@iconify/svelte)
- **Backend API**: [protest-scraper](https://github.com/artem-schander/protest-scraper)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Backend API running (see [protest-scraper](https://github.com/artem-schander/protest-scraper))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd protest-scraper-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your backend API URL:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## Project Structure

```
src/
├── routes/                      # SvelteKit routes (pages)
│   ├── +layout.svelte          # Main layout
│   ├── +page.svelte            # Landing page
│   ├── +page.server.js         # SSR data loading
│   └── events/                  # Event-related pages
│       └── create/
│           └── +page.svelte    # Create event page
├── lib/
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   │   ├── Button.svelte
│   │   │   ├── Input.svelte
│   │   │   ├── Modal.svelte
│   │   │   └── LoadingSkeleton.svelte
│   │   ├── event/              # Event-specific components
│   │   │   ├── EventCard.svelte
│   │   │   └── QuickFilters.svelte
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginModal.svelte
│   │   │   └── RegisterModal.svelte
│   │   └── layout/             # Layout components
│   │       ├── Header.svelte
│   │       └── FilterSidebar.svelte
│   ├── stores/
│   │   └── auth.js             # Authentication state
│   └── utils/
│       ├── api.js              # API client
│       └── dateFormat.js       # Date utilities
└── app.html                     # Root HTML with Tailwind CDN
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Design System

### Dark Mode

The application automatically detects and applies your system theme preference. It supports three modes:

- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for low-light environments
- **System**: Automatically follows your OS setting (default)

Toggle between themes using the theme switcher in the header (sun/moon/desktop icon).

**Theme Persistence**: Your choice is saved to localStorage and persists across sessions.

### Colors

**Primary Gradients:**
- Light: `from-emerald-50 to-lime-50`
- Dark: `from-emerald-900/30 to-lime-900/30`
- Accent: `from-emerald-400 to-lime-400`
- Warning (Light): `from-amber-50 to-orange-50`
- Warning (Dark): `from-amber-900/30 to-orange-900/30`

**Text:**
- Primary: `text-black dark:text-white`
- Secondary: `text-black/60 dark:text-white/60`
- Accent: `text-emerald-600 dark:text-emerald-400`

**Backgrounds:**
- Primary: `bg-gray-50 dark:bg-gray-900`
- Secondary: `bg-white dark:bg-gray-800`
- Borders: `border-gray-200 dark:border-gray-700`

### Typography

- **Font**: Inter (loaded from Google Fonts)
- **Scales**: text-3xl, text-2xl, text-xl, text-base, text-sm, text-xs

### Spacing

- Mobile: p-4, gap-3
- Desktop: p-8, gap-6

### Rounded Corners

- Small: rounded-lg (8px)
- Medium: rounded-xl (12px)
- Large: rounded-2xl (16px)
- Full: rounded-full

## API Integration

The application connects to the [protest-scraper](https://github.com/artem-schander/protest-scraper) backend API.

### Key Endpoints Used:

- `GET /api/protests` - Fetch protests with filters
- `GET /api/protests/:id` - Get protest details
- `POST /api/protests` - Create new protest (authenticated)
- `PUT /api/protests/:id` - Update protest (authenticated)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/export/ics` - Calendar subscription feed

Update the API URL in `.env` file to point to your backend instance.

## Features by Page

### Landing Page (/)
- Hero section with search
- Quick filters (Today, This Week, Near Me)
- Event grid with cards
- Advanced filter sidebar
- Pagination

### Event Card
- Date badge
- Source indicator
- Location and time
- Tags
- Verified badge
- Urgency-based color coding

### Authentication
- Login modal
- Registration modal
- Google OAuth option (optional)
- Remember me functionality

### Filters
- Date range (7, 30, 90 days)
- City search
- Source selection
- Language selection
- Geolocation (near me)
- Verified events only

## Customization

### Update Backend URL

Edit `src/lib/utils/api.js`:
```javascript
const API_BASE_URL = 'https://your-api-url.com/api';
```

### Change Color Scheme

Edit `src/app.html` Tailwind config:
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Add your colors here
      }
    }
  }
}
```

### Add New Icons

Browse [icones.js.org](https://icones.js.org) and use:
```svelte
<Icon icon="heroicons:icon-name" class="w-5 h-5" />
```

## Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
npx vercel
```

### Deploy to Netlify

```bash
npm run build
npx netlify deploy --prod --dir=build
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Credits

- Design inspired by modern calendar and subscription apps
- Icons from [Iconify](https://iconify.design/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Illustrations from [unDraw](https://undraw.co/)

## Support

For issues and questions:
- Backend API: [protest-scraper issues](https://github.com/artem-schander/protest-scraper/issues)
- Frontend: Create an issue in this repository

---

Built with ❤️ using SvelteKit and Tailwind CSS
