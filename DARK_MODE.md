# Dark Mode Implementation

## Overview

Dark mode is class-driven (`darkMode: 'class'`) and cycles between `light`, `dark`, and `system`. The preference persists in `localStorage` and is applied before Tailwind boots to avoid flashes.

## Boot process

`src/app.html` contains an inline IIFE that runs prior to the Tailwind CDN script:

```html
<script>
  (function () {
    const theme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
</script>
```

This guarantees the correct `<html class="dark">` state before Svelte hydrates.

## Runtime control

- `src/lib/stores/theme.js` exposes `init()`, `set(theme)`, and `toggle()` (cycling order: light → dark → system → light). Each call updates `localStorage` and toggles the `<html>` class.
- `ThemeToggle.svelte` subscribes to the store, swaps between sun/moon/desktop icons, and is mounted in the header for desktop and mobile.
- `+layout.svelte` calls `themeStore.init()` during `onMount` to sync hydration with the stored value and to listen for system preference changes when the mode is `system`.

## Styling guidelines

- Use Tailwind’s `dark:` variant (`bg-white dark:bg-stone-800`, `text-black dark:text-white`, etc.).
- Prefer opacity utilities (`text-black/60`) and reuse the existing colour palette for consistency.
- Skeleton loaders rely on `.dark .animate-shimmer` styles baked into `app.html`; maintain both light and dark gradients when tweaking them.

## Verification checklist

1. Toggle the button repeatedly; it should cycle `light → dark → system`.
2. Refresh the page—stored preference must persist without any flash of light mode.
3. Switch your OS preference; when the toggle shows “system”, the UI should follow automatically.
4. Inspect the `<html>` element in DevTools to confirm class updates.

## Troubleshooting

- If the theme snaps back on reload, confirm the inline script still runs before the Tailwind CDN include.
- When debugging hydration mismatches, ensure no component writes to `document.documentElement` outside the theme store.
- Safari caches the HTML document aggressively; empty storage via “Develop → Empty Caches” if changes seem ignored.
