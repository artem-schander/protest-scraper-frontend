<script>
  import { onMount, onDestroy } from 'svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Notification from '$lib/components/common/Notification.svelte';
  import { themeStore } from '$lib/stores/theme';
  import { authStore } from '$lib/stores/auth';
  import { preloadIcons } from '$lib/utils/iconPreloader';
  import { setupI18n, t } from '$lib/i18n';
  import { refreshToken } from '$lib/utils/api';

  export let data;

  setupI18n(data?.locale, { persist: false });

  // Initialize auth from SSR data if available
  if (data?.user) {
    authStore.login(data.user);
  }

  let refreshInterval;

  onMount(() => {
    themeStore.init();
    preloadIcons();
    setupI18n(data?.locale);

    // Auto-refresh token every 10 minutes (before 15-minute expiry)
    // Only if user is authenticated
    if (data?.user) {
      const TEN_MINUTES = 10 * 60 * 1000;
      refreshInterval = setInterval(async () => {
        // Check if still authenticated
        if ($authStore.isAuthenticated) {
          await refreshToken();
        } else {
          // Clear interval if logged out
          clearInterval(refreshInterval);
        }
      }, TEN_MINUTES);
    }
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<svelte:head>
  <!-- Default OG tags (can be overridden by individual pages) -->
  <meta property="og:site_name" content="Protest Listing" />
  <meta property="og:locale" content={data?.locale || 'en'} />
  <meta property="og:image" content="https://protest-listing.com/og-image.jpg" />
  <meta property="og:image:width" content="1280" />
  <meta property="og:image:height" content="853" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://protest-listing.com/og-image.jpg" />
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors flex flex-col">
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>

<!-- Global notification container -->
<Notification />
