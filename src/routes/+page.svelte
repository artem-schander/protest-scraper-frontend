<script>
import { goto, invalidate } from '$app/navigation';
import { tick } from 'svelte';
import { get } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import EventCard from '$lib/components/event/EventCard.svelte';
  import FilterSidebar from '$lib/components/layout/FilterSidebar.svelte';
  import ExportActions from '$lib/components/layout/ExportActions.svelte';
  import QuickFilters from '$lib/components/event/QuickFilters.svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import { t } from '$lib/i18n';

  export let data;

  const HAPPENING_SOON_DAYS = '7';
  const DEFAULT_NEAR_RADIUS = '30';

  let searchQuery = data.filters.search || '';
  let showMobileFilters = false;
  let showExportPanel = false;
  let appliedSearch = data.filters.search || '';
  let isPendingNavigation = false;
  let activeQuickFilters = [];
  let nearCoordinates = extractNearCoordinatesFromFilters(data.filters);

  const desktopExportBaseClass = 'hidden lg:inline-flex items-center justify-center gap-2 w-10 h-10 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all duration-200';
  const mobileExportBaseClass = 'lg:hidden flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-200';

  $: desktopExportToggleClass = `${desktopExportBaseClass} ${
    showExportPanel
      ? 'bg-[#E10600] border-[#E10600] text-white shadow-md hover:bg-[#C10500] dark:hover:bg-[#C10500] hover:border-[#C10500] dark:hover:border-[#C10500]'
      : 'bg-white dark:bg-stone-800 border-black dark:border-white text-black dark:text-white hover:bg-[#E10600] dark:hover:bg-[#E10600] hover:border-[#E10600] dark:hover:border-[#E10600] hover:text-white dark:hover:text-white hover:shadow-md'
  }`;

  $: mobileExportToggleClass = `${mobileExportBaseClass} ${
    showExportPanel
      ? 'bg-[#E10600] border-[#E10600] text-white shadow-md hover:bg-[#C10500] dark:hover:bg-[#C10500] hover:border-[#C10500] dark:hover:border-[#C10500]'
      : 'bg-white dark:bg-stone-800 border-black dark:border-white text-black dark:text-white hover:bg-[#E10600] dark:hover:bg-[#E10600] hover:border-[#E10600] dark:hover:border-[#E10600] hover:text-white dark:hover:text-white hover:shadow-md'
  }`;

  $: nearLabel = formatNearLabel(nearCoordinates);

  function translate(key, options) {
    return get(t)(key, options);
  }

  function formatDateForApi(date) {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    const utc = new Date(copy.getTime() - copy.getTimezoneOffset() * 60000);
    return utc.toISOString().split('T')[0];
  }

  function getUpcomingWeekendBounds() {
    const today = new Date();
    const day = today.getDay();
    const offsetToFriday = (5 - day + 7) % 7;
    const friday = new Date(today);
    friday.setDate(friday.getDate() + offsetToFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    return {
      start: formatDateForApi(friday),
      end: formatDateForApi(sunday)
    };
  }

  function getUpcomingDaysRange(days) {
    const count = Math.max(1, Number.parseInt(days, 10) || 1);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + (count - 1));
    return {
      start: formatDateForApi(start),
      end: formatDateForApi(end)
    };
  }

  function extractNearCoordinatesFromFilters(filters = {}) {
    const lat = filters.lat || '';
    const lon = filters.lon || '';
    return lat && lon ? { lat, lon } : null;
  }

  function extractNearCoordinatesFromParams(params) {
    const lat = params.get('lat') || '';
    const lon = params.get('lon') || '';
    return lat && lon ? { lat, lon } : null;
  }

  function formatNearLabel(coords) {
    if (!coords) return '';
    const latNum = Number.parseFloat(coords.lat);
    const lonNum = Number.parseFloat(coords.lon);
    const latString = Number.isFinite(latNum) ? latNum.toFixed(3) : coords.lat;
    const lonString = Number.isFinite(lonNum) ? lonNum.toFixed(3) : coords.lon;
    return `${latString}, ${lonString}`;
  }

  async function handleSearch(e) {
    e.preventDefault();

    const url = new URL(window.location.href);
    const trimmedSearch = searchQuery.trim();
    if (!trimmedSearch) {
      // remove search param if empty
      url.searchParams.delete('search');
    } else {
      url.searchParams.set('search', trimmedSearch);
    }

    url.searchParams.delete('page'); // Reset to page 1

    isPendingNavigation = true;
    appliedSearch = trimmedSearch;

    try {
      await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
      await invalidate(() => true);
    } finally {
      isPendingNavigation = false;
    }

    // Smooth scroll to results
    if (typeof window !== 'undefined') {
      const eventList = document.querySelector('main');
      if (eventList) {
        eventList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function toggleMobileFilters() {
    showMobileFilters = !showMobileFilters;
  }

  function toggleExportPanel() {
    showExportPanel = !showExportPanel;
  }

  async function clearSearch() {
    if (typeof window === 'undefined') return;

    searchQuery = '';
    appliedSearch = '';
    isPendingNavigation = true;

    const url = new URL(window.location.href);
    url.searchParams.delete('search');
    url.searchParams.delete('page');

    try {
      await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
      await invalidate(() => true);
    } finally {
      isPendingNavigation = false;
    }
  }

  function getActiveQuickFilters() {
    const active = [];
    const filters = data.filters || {};
    if ((filters.days || '') === HAPPENING_SOON_DAYS) {
      active.push('soon');
    }
    const weekend = getUpcomingWeekendBounds();
    if ((filters.startDate || '') === weekend.start && (filters.endDate || '') === weekend.end) {
      active.push('weekend');
    }
    if ((filters.lat || '') && (filters.lon || '')) {
      active.push('near');
    }
    return active;
  }

  function deriveQuickFiltersFromParams(params) {
    const active = [];
    if (params.get('days') === HAPPENING_SOON_DAYS) {
      active.push('soon');
    }
    const weekend = getUpcomingWeekendBounds();
    if (params.get('startDate') === weekend.start && params.get('endDate') === weekend.end) {
      active.push('weekend');
    }
    if ((params.get('lat') || '') && (params.get('lon') || '')) {
      active.push('near');
    }
    return active;
  }

  function setQuickFilterState(filterId, nextActive) {
    if (nextActive) {
      if (!activeQuickFilters.includes(filterId)) {
        activeQuickFilters = [...activeQuickFilters, filterId];
      }
    } else {
      if (activeQuickFilters.includes(filterId)) {
        activeQuickFilters = activeQuickFilters.filter((id) => id !== filterId);
      }
    }
  }

  async function updateFilters(apply) {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    apply(url.searchParams);
    url.searchParams.delete('page');

    activeQuickFilters = deriveQuickFiltersFromParams(url.searchParams);
    nearCoordinates = extractNearCoordinatesFromParams(url.searchParams);

    isPendingNavigation = true;
    try {
      await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
      await invalidate(() => true);
    } finally {
      isPendingNavigation = false;
    }
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async function handleQuickFilterToggle(filterId, { active }) {
    if (typeof window === 'undefined') return;

    const markPending = () => {
      if (!isPendingNavigation) {
        isPendingNavigation = true;
      }
    };

    if (filterId === 'near') {
      if (!active) {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          alert(translate('filters.locationError.unsupported'));
          return;
        }

        let position;
        try {
          position = await getCurrentPosition();
        } catch (error) {
          console.error('Geolocation error:', error);
          let errorKey = 'filters.locationError.unknown';
          if (error.code === error.PERMISSION_DENIED) {
            errorKey = 'filters.locationError.denied';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorKey = 'filters.locationError.unavailable';
          } else if (error.code === error.TIMEOUT) {
            errorKey = 'filters.locationError.timeout';
          }
          alert(translate(errorKey));
          isPendingNavigation = false;
          return;
        }

        const lat = position.coords.latitude.toString();
        const lon = position.coords.longitude.toString();

        markPending();
        setQuickFilterState(filterId, true);
        nearCoordinates = { lat, lon };
        await tick();
        await updateFilters((params) => {
          params.set('lat', lat);
          params.set('lon', lon);
          params.set('radius', params.get('radius') || DEFAULT_NEAR_RADIUS);
        });
        return;
      }

      markPending();
      setQuickFilterState(filterId, false);
      nearCoordinates = null;
      await tick();
      await updateFilters((params) => {
        params.delete('lat');
        params.delete('lon');
        params.delete('radius');
      });
      return;
    }

    if (filterId === 'soon') {
      if (active) {
        markPending();
        setQuickFilterState(filterId, false);
        await tick();
        await updateFilters((params) => {
          params.delete('days');
        });
      } else {
        markPending();
        setQuickFilterState(filterId, true);
        await tick();
        await updateFilters((params) => {
          params.set('days', HAPPENING_SOON_DAYS);
          params.delete('startDate');
          params.delete('endDate');
        });
      }
      return;
    }

    if (filterId === 'weekend') {
      const weekend = getUpcomingWeekendBounds();
      if (active) {
        markPending();
        setQuickFilterState(filterId, false);
        await tick();
        await updateFilters((params) => {
          params.delete('startDate');
          params.delete('endDate');
        });
      } else {
        markPending();
        setQuickFilterState(filterId, true);
        await tick();
        await updateFilters((params) => {
          params.delete('days');
          params.set('startDate', weekend.start);
          params.set('endDate', weekend.end);
        });
      }
    }
  }

  async function handlePageChange(event) {
    const pageNum = event.detail.page;
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNum.toString());
    await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
    await invalidate(() => true);

    // Smooth scroll to top of event list
    if (typeof window !== 'undefined') {
      const eventList = document.querySelector('main');
      if (eventList) {
        eventList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Reactive key to force re-render when page or filters change
  $: key = `page:${data.page}-search:${data.filters.search}-dates:${data.filters.startDate}-${data.filters.endDate}-location:${data.filters.lat}-${data.filters.lon}-${data.filters.radius}`;

  $: if (!isPendingNavigation) {
    appliedSearch = data.filters.search || '';
    activeQuickFilters = getActiveQuickFilters();
    nearCoordinates = extractNearCoordinatesFromFilters(data.filters);
  }

</script>

<svelte:head>
  <title>{$t('home.metaTitle')}</title>
  <meta name="description" content={$t('home.metaDescription')} />
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden bg-stone-100 dark:bg-stone-900 py-12 px-4 md:py-16 transition-colors border-b-4 border-black dark:border-white">
  <!-- Responsive Background -->
  <picture class="absolute inset-0">
    <source srcset="/protest-9842669_1920.jpg" media="(min-width: 1280px)" />
    <source srcset="/protest-9842669_1280.jpg" media="(min-width: 768px)" />
    <source srcset="/protest-9842669_640.jpg" media="(max-width: 767px)" />
    <img
      src="/protest-9842669.jpg"
      alt={$t('home.heroImageAlt')}
      class="w-full h-full object-cover opacity-30 dark:opacity-20"
      decoding="async"
    />
    <!-- caption -->
    <div class="absolute bottom-2 right-2 text-xs text-black/40 dark:text-white/40">
      Image by
      <a target="_blank" rel="noopener noreferrer" href="https://pixabay.com/users/vilkasss-35420724/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=9842669">Vilius Kukanauskas</a>
      from
      <a target="_blank" rel="noopener noreferrer" href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=9842669">Pixabay</a>
    </div>
  </picture>

  <div class="max-w-7xl mx-auto text-center relative">
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4 tracking-tight uppercase">
      {$t('home.heroTitle')}
    </h1>
    <p class="text-base md:text-lg text-black/60 dark:text-white/60 mb-8 max-w-2xl mx-auto font-medium">
      {$t('home.heroSubtitle')}
    </p>

    <!-- Search Bar -->
    <form on:submit={handleSearch} class="max-w-2xl mx-auto">
      <!-- dark:bg-stone-700 -->
      <div class="relative flex items-center bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
        <!-- dark:text-white dark:placeholder:text-white/40 -->
        <input
          type="text"
          bind:value={searchQuery}
          placeholder={$t('home.searchPlaceholder')}
          class="w-full py-3 md:py-4 px-6 bg-transparent text-black placeholder:text-black/40 focus:outline-none rounded-full"
          aria-label={$t('home.searchAria')}
        />
        <button
          type="button"
          on:click={toggleMobileFilters}
          class="lg:hidden absolute right-14 w-10 h-10 rounded-full text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-600 flex items-center justify-center transition-colors"
          aria-label={$t('home.filterAria')}
        >
          <Icon icon="heroicons:funnel" class="w-5 h-5" />
        </button>
        <button
          type="submit"
          class="absolute right-2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 hover:bg-[#C10500] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
          aria-label={$t('home.searchButtonAria')}
        >
          <Icon icon="heroicons:magnifying-glass" class="w-5 h-5" />
        </button>
      </div>
    </form>
  </div>
</section>

<!-- Main Content -->
<div class="max-w-7xl mx-auto px-4">
  <div class="lg:grid lg:grid-cols-[280px,1fr] lg:gap-8">
    <!-- Filter Sidebar (Desktop) -->
    <FilterSidebar filters={data.filters} {showMobileFilters} on:close={() => showMobileFilters = false} />

    <!-- Events Grid -->
    <main class="space-y-6 py-8 mb-12">
      <!-- Mobile Filter Button Bar (visible on mobile/tablet only) -->
      <div class="lg:hidden flex items-center gap-3">
        <button
          type="button"
          on:click={toggleMobileFilters}
          class="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-stone-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-medium shadow-sm hover:shadow-md transition-all"
        >
          <Icon icon="heroicons:funnel" class="w-5 h-5" />
          {$t('home.filterButton')}
        </button>
        <div class="flex-1 text-sm text-black/60 dark:text-white/60">
          {$t('home.mobileSummary', { values: { count: data.total } })}
        </div>
        <button
          type="button"
          on:click={toggleExportPanel}
          class={mobileExportToggleClass}
          aria-label={showExportPanel ? $t('home.exportHide') : $t('home.exportShow')}
          aria-pressed={showExportPanel}
          aria-expanded={showExportPanel}
        >
          <Icon icon="heroicons:arrow-down-tray" class="w-5 h-5 download-icon" />
        </button>
      </div>

      <QuickFilters
        searchTerm={appliedSearch}
        onClearSearch={clearSearch}
        activeFilters={activeQuickFilters}
        nearLabel={nearLabel}
        onFilterToggle={handleQuickFilterToggle}
      >
        <button
          type="button"
          on:click={toggleExportPanel}
          class={desktopExportToggleClass}
          aria-label={showExportPanel ? $t('home.exportHide') : $t('home.exportShow')}
          aria-pressed={showExportPanel}
          aria-expanded={showExportPanel}
        >
          <Icon icon="heroicons:arrow-down-tray" class="w-4 h-4 download-icon" />
          <!-- {showExportPanel ? $t('home.exportHide') : $t('home.exportShow')} -->
        </button>
      </QuickFilters>

      {#if showExportPanel}
        <div transition:fly={{ y: -10, duration: 180, opacity: 0 }}>
          <ExportActions filters={data.filters} />
        </div>
      {/if}

      <!-- Results Count (Desktop) -->
      <div class="hidden lg:flex items-center justify-between">
        <p class="text-sm text-black/60 dark:text-white/60">
          {#if data.total > 0}
            {$t('home.resultsFound', { values: { count: data.total } })}
          {/if}
        </p>
      </div>

      <!-- Event Grid -->
      {#key key}
        {#if data.protests && data.protests.length > 0}
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {#each data.protests as protest}
              <EventCard event={protest} />
            {/each}
          </div>
        {:else if data.error}
          <!-- Error State -->
          <div class="text-center py-16">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
              <Icon icon="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 dark:text-red-400" />
            </div>
            <h3 class="text-xl font-medium text-black dark:text-white mb-2">{$t('home.errorTitle')}</h3>
            <p class="text-black/60 dark:text-white/60 mb-2">
              {$t('home.errorDescription')}
            </p>
            {#if data.error}
              <p class="text-black/60 dark:text-white/60 mb-6">
                {data.error}
              </p>
            {/if}
            <button
              on:click={() => window.location.reload()}
              class="px-6 py-3 rounded-xl bg-red-600 hover:bg-[#C10500] text-white font-medium hover:shadow-lg transition-all"
            >
              {$t('home.errorRetry')}
            </button>
          </div>
        {:else}
          <!-- Empty State -->
          <div class="text-center py-16">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-200 dark:bg-stone-800 border-2 border-black/10 dark:border-white/10 mb-4">
              <Icon icon="heroicons:calendar-days" class="w-12 h-12 text-black dark:text-white" />
            </div>
            <h3 class="text-xl font-medium text-black dark:text-white mb-2">{$t('home.emptyTitle')}</h3>
            <p class="text-black/60 dark:text-white/60 mb-6">
              {$t('home.emptyDescription')}
            </p>
          </div>
        {/if}
      {/key}

      <!-- Pagination -->
      <Pagination
        currentPage={data.page}
        totalItems={data.total}
        itemsPerPage={data.limit}
        maxVisiblePages="3"
        on:pageChange={handlePageChange}
      />
    </main>
  </div>
</div>

<!-- Floating Action Button (Mobile - Will be shown when authenticated) -->
<a
  href="/events/create"
  class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-600 hover:bg-[#C10500] text-white text-2xl shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center lg:hidden z-50"
  aria-label={$t('home.floatingCreateAria')}
>
  <Icon icon="heroicons:plus" class="w-7 h-7" />
</a>

<style>
  :global(.download-icon path) {
    stroke-width: 2.25px;
  }
</style>
