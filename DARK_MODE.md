# Dark Mode Implementation

## Overview

The application features a complete dark mode implementation that **defaults to system preference** and allows manual override.

## How It Works

### 1. Theme Detection (app.html)

A script runs **before** Tailwind CSS loads to prevent theme flash:

```javascript
// Checks localStorage or defaults to 'system'
const theme = localStorage.getItem('theme') || 'system';

// Applies 'dark' class to <html> if needed
if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
  document.documentElement.classList.add('dark');
}
```

### 2. Theme States

- **`light`**: Force light mode
- **`dark`**: Force dark mode
- **`system`**: Follow OS preference (default)

### 3. Theme Store (lib/stores/theme.js)

Manages theme state and persistence:

```javascript
import { themeStore } from '$lib/stores/theme';

// Initialize (call in +layout.svelte)
themeStore.init();

// Toggle through modes: light → dark → system → light
themeStore.toggle();

// Set specific theme
themeStore.set('dark');
```

### 4. Theme Toggle Component

`lib/components/common/ThemeToggle.svelte` provides the UI:

- **Sun icon**: Light mode
- **Moon icon**: Dark mode
- **Desktop icon**: System mode

**Location:** Header (both desktop and mobile)

## Usage in Components

### Adding Dark Mode Classes

Use Tailwind's `dark:` modifier:

```svelte
<!-- Text -->
<p class="text-black dark:text-white">
  Text that changes color
</p>

<!-- Backgrounds -->
<div class="bg-white dark:bg-gray-800">
  Card with dark mode
</div>

<!-- Borders -->
<div class="border border-gray-200 dark:border-gray-700">
  Bordered element
</div>

<!-- Gradients -->
<div class="bg-gradient-to-r from-emerald-50 to-lime-50 dark:from-emerald-900/30 dark:to-lime-900/30">
  Gradient that adapts
</div>
```

### Updated Components

All major components support dark mode:

- ✅ Layout (`+layout.svelte`)
- ✅ Header (`Header.svelte`)
- ✅ Landing page (`+page.svelte`)
- ✅ Event cards (`EventCard.svelte`)
- ✅ Filter sidebar (`FilterSidebar.svelte`)
- ✅ Quick filters (`QuickFilters.svelte`)
- ✅ Modals (`Modal.svelte`, `LoginModal.svelte`, `RegisterModal.svelte`)
- ✅ Common components (`Button.svelte`, `Input.svelte`, etc.)

## Tailwind Configuration

Dark mode is enabled in `app.html`:

```javascript
tailwind.config = {
  darkMode: 'class', // Use class-based dark mode
  // ... rest of config
}
```

## System Theme Detection

The app listens for system theme changes:

```javascript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (currentTheme === 'system') {
    // Update dark class when system theme changes
  }
});
```

## Testing Dark Mode

### Manual Testing

1. **Toggle button**: Click theme toggle in header
   - First click: Changes to opposite of current system theme
   - Second click: Switches to system mode
   - Third click: Cycles to the other manual mode

2. **Browser DevTools**:
   - Chrome: DevTools → Command Palette (Cmd+Shift+P) → "Emulate CSS prefers-color-scheme: dark"
   - Firefox: DevTools → Inspector → :root → Toggle prefers-color-scheme

3. **OS Settings**:
   - macOS: System Preferences → General → Appearance
   - Windows: Settings → Personalization → Colors → Choose your mode

### Verify No Flash

On page load, theme should apply **instantly** without flash because:
- Theme script runs before Tailwind loads
- Stored preference is applied synchronously
- No FOUC (Flash of Unstyled Content)

## Customization

### Change Theme Colors

Edit color gradients in components:

```svelte
<!-- Light mode -->
from-emerald-50 to-lime-50

<!-- Dark mode -->
dark:from-emerald-900/30 dark:to-lime-900/30
```

### Add New Theme

1. Update `themeStore.toggle()` in `lib/stores/theme.js`
2. Add new icon in `ThemeToggle.svelte`
3. Define theme colors in your components

### Customize Toggle Behavior

Edit `lib/components/common/ThemeToggle.svelte`:

```svelte
function cycleTheme() {
  // Change cycling order:
  // light → dark → system → light
  themeStore.toggle();
}
```

## Accessibility

Dark mode improves accessibility by:

- **Reducing eye strain** in low-light environments
- **Following user preferences** (respects system settings)
- **Maintaining contrast ratios** (WCAG AA compliant)
- **Clear visual feedback** (theme toggle shows current state)

## Browser Support

- ✅ Chrome/Edge 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ✅ All modern mobile browsers

## Troubleshooting

### Theme not persisting

Check localStorage:
```javascript
console.log(localStorage.getItem('theme'));
```

### Flash on page load

Ensure script in `app.html` runs before Tailwind:
```html
<!-- Dark Mode Script - Must run before Tailwind -->
<script>...</script>

<!-- Tailwind CSS CDN -->
<script src="https://cdn.tailwindcss.com"></script>
```

### Dark mode not applying

1. Check `<html>` element has `dark` class
2. Verify Tailwind config has `darkMode: 'class'`
3. Confirm all styles use `dark:` prefix

## Future Enhancements

Possible additions:

- **Custom themes**: Allow user-defined color schemes
- **Scheduled themes**: Auto-switch at specific times
- **Per-page themes**: Different themes for different sections
- **Reduced motion**: Respect prefers-reduced-motion
- **High contrast mode**: Enhanced accessibility option

---

**Built with:** SvelteKit, Tailwind CSS, and localStorage
