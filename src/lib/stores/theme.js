import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Get initial theme
function getInitialTheme() {
  if (!browser) return 'system';
  return localStorage.getItem('theme') || 'system';
}

// Create the theme store
function createThemeStore() {
  const { subscribe, set } = writable(getInitialTheme());

  return {
    subscribe,
    set: (theme) => {
      if (!browser) return;

      // Save to localStorage
      localStorage.setItem('theme', theme);

      // Apply theme
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      set(theme);
    },
    toggle: () => {
      const current = getInitialTheme();
      const newTheme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';

      if (!browser) return;

      localStorage.setItem('theme', newTheme);

      if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      set(newTheme);
    },
    init: () => {
      if (!browser) return;

      const theme = localStorage.getItem('theme') || 'system';

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = localStorage.getItem('theme') || 'system';
        if (currentTheme === 'system') {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      });

      set(theme);
    }
  };
}

export const themeStore = createThemeStore();
