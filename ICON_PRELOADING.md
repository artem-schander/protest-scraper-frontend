# Icon Preloading

## Why

Iconify fetches glyph data on demand; without preparation each icon paints a few frames late and can shift layout. The app therefore preloads every icon that appears in the UI as soon as the shell mounts.

## How it works

1. `src/lib/utils/iconPreloader.js` keeps a single `icons` array and calls `loadIcons()` from `@iconify/svelte`. The promise resolves once every glyph is cached and we log a success message (failures only warn and fall back to lazy loading).
2. `src/routes/+layout.svelte` calls `preloadIcons()` inside `onMount` together with the theme store and i18n setup.
3. `src/lib/components/common/Icon.svelte` wraps `IconifyIcon`, adds an inline size reservation derived from Tailwind classes, and sets the `ssr` flag so server/client markup stays in sync.

```svelte
<!-- +layout.svelte -->
onMount(() => {
  themeStore.init();
  preloadIcons();
  setupI18n(data?.locale);
});
```

```javascript
// iconPreloader.js
export async function preloadIcons() {
  const icons = ['heroicons:arrow-left', 'heroicons:map-pin', 'svg-spinners:ring-resize', /* … */];
  await loadIcons(icons);
}
```

## Maintenance tips

- When you introduce a new icon, append its name to the `icons` array. A quick helper command:  
  `rg 'icon="' src --glob '*.svelte' | sort -u`
- Keep the list alphabetised to avoid duplicates and make merges painless.
- If you need to debug missing glyphs, temporarily comment out `preloadIcons()` to reproduce the lazy-loading behaviour.

## Cost & benefits

- **CLS prevention** – icons render with their final dimensions on first paint.
- **Predictable logging** – failures surface once in the console, not for every component render.
- **Minimal runtime cost** – Iconify batches the request; the bundle only stores small SVG payloads in memory.
