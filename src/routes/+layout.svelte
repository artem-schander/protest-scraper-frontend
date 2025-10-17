<script>
  import { onMount } from 'svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { themeStore } from '$lib/stores/theme';
  import { preloadIcons } from '$lib/utils/iconPreloader';
  import { setupI18n } from '$lib/i18n';

  export let data;

  setupI18n(data?.locale, { persist: false });

  onMount(() => {
    themeStore.init();
    preloadIcons();
    setupI18n(data?.locale);
  });
</script>

<div class="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors flex flex-col">
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>
