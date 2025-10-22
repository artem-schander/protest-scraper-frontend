<script>
import { createEventDispatcher } from 'svelte';
import { goto, invalidate } from '$app/navigation';
import { fade, fly } from 'svelte/transition';
import Icon from '$lib/components/common/Icon.svelte';
import Button from '$lib/components/common/Button.svelte';
import DateRangePicker from '$lib/components/common/DateRangePicker.svelte';
import MapPicker from '$lib/components/common/MapPicker.svelte';
import { t } from '$lib/i18n';

  export let filters = {};
  export let showMobileFilters = false;

  const dispatch = createEventDispatcher();

  // Filter state
  let startDate = null;
  let endDate = null;
  let dateMode = 'day';
  let city = filters.city || '';
  let lat = filters.lat ? parseFloat(filters.lat) : null;
  let lon = filters.lon ? parseFloat(filters.lon) : null;
  let radius = filters.radius ? parseInt(filters.radius) : 10;

  const instanceSuffix = Math.random().toString(36).slice(2, 8);
  const desktopDateLabelId = `filters-date-range-${instanceSuffix}-desktop`;
  const mobileDateLabelId = `filters-date-range-${instanceSuffix}-mobile`;
  const desktopLocationLabelId = `filters-location-${instanceSuffix}-desktop`;
  const mobileLocationLabelId = `filters-location-${instanceSuffix}-mobile`;

  // Initialize dates from URL params
  function parseDateFromAPI(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  let lastFiltersKey = '';

  function formatDateForAPI(date) {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function handleDateChange(event) {
    startDate = event.detail.startDate;
    endDate = event.detail.endDate;
    dateMode = event.detail.mode;
  }

  function handleMapChange(event) {
    lat = event.detail.lat;
    lon = event.detail.lon;
    radius = event.detail.radius;
  }

  async function applyFilters() {
    const url = new URL(window.location.href);

    // Clear existing params
    url.searchParams.delete('days');
    url.searchParams.delete('startDate');
    url.searchParams.delete('endDate');
    url.searchParams.delete('city');
    url.searchParams.delete('lat');
    url.searchParams.delete('lon');
    url.searchParams.delete('radius');
    url.searchParams.delete('page'); // Reset to page 1 when filters change

    // Add date params
    if (startDate) {
      url.searchParams.set('startDate', formatDateForAPI(startDate));
    }
    if (endDate) {
      url.searchParams.set('endDate', formatDateForAPI(endDate));
    }

    // Add city param
    if (city) url.searchParams.set('city', city);

    // Add geolocation params
    if (lat && lon) {
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lon', lon.toString());
      url.searchParams.set('radius', radius.toString());
    }

    // Navigate and invalidate the load function
    await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
    await invalidate(() => true); // Invalidate all load functions
    dispatch('close');

    // Smooth scroll to top of event list
    if (typeof window !== 'undefined') {
      const eventList = document.querySelector('main');
      if (eventList) {
        eventList.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  async function resetFilters() {
    startDate = null;
    endDate = null;
    dateMode = 'day';
    city = '';
    lat = null;
    lon = null;
    radius = 10;
    await goto('/', { replaceState: false, keepFocus: true, noScroll: true });
    await invalidate(() => true);
    dispatch('close');
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      dispatch('close');
    }
  }

  function getUpcomingDaysRange(days, baseStart = null) {
    const count = Math.max(1, Number.parseInt(days, 10) || 1);
    const start = baseStart ? new Date(baseStart.getTime()) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + (count - 1));
    return { start, end };
  }

  function updateStateFromFilters() {
    const daysValue = filters.days ? Number.parseInt(filters.days, 10) || 0 : 0;
    const hasDaysPreset = daysValue > 0;

    if (hasDaysPreset) {
      const presetStart = filters.startDate ? parseDateFromAPI(filters.startDate) : null;
      const range = getUpcomingDaysRange(daysValue, presetStart || null);
      startDate = range.start;
      endDate = range.end;
      dateMode = daysValue === 1 ? 'day' : 'range';
    } else {
      startDate = filters.startDate ? parseDateFromAPI(filters.startDate) : null;
      endDate = filters.endDate ? parseDateFromAPI(filters.endDate) : null;
      if (startDate && endDate) {
        dateMode = startDate.getTime() === endDate.getTime() ? 'day' : 'range';
      } else {
        dateMode = 'day';
      }
    }

    city = filters.city || '';
    lat = filters.lat ? parseFloat(filters.lat) : null;
    lon = filters.lon ? parseFloat(filters.lon) : null;
    radius = filters.radius ? parseInt(filters.radius, 10) || 10 : 10;
  }

  updateStateFromFilters();

  $: {
    const nextKey = JSON.stringify({
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      days: filters.days || '',
      city: filters.city || '',
      lat: filters.lat || '',
      lon: filters.lon || '',
      radius: filters.radius || ''
    });

    if (nextKey !== lastFiltersKey) {
      lastFiltersKey = nextKey;
      updateStateFromFilters();
    }
  }
</script>

<!-- Desktop Sidebar -->
<aside class="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide z-10">
  <div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 mt-8 p-6 shadow-sm space-y-6 mb-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-medium text-black dark:text-white">
        {$t('filters.title')}
      </h2>
      <button
        on:click={resetFilters}
        class="text-sm text-[#E10600] hover:text-[#C10500] dark:text-red-400 dark:hover:text-[#E10600] font-medium"
      >
        {$t('filters.reset')}
      </button>
    </div>

    <!-- Date Range -->
    <div aria-labelledby={desktopDateLabelId}>
      <p id={desktopDateLabelId} class="flex items-center text-sm font-medium text-black dark:text-white mb-3">
        <Icon icon="heroicons:calendar-days" class="inline w-4 h-4" />
        <span class="ml-1">{$t('filters.dateRange')}</span>
      </p>
      <DateRangePicker
        bind:startDate
        bind:endDate
        bind:mode={dateMode}
        on:change={handleDateChange}
      />
    </div>

    <!-- Map Location Picker -->
    <div aria-labelledby={desktopLocationLabelId}>
      <p id={desktopLocationLabelId} class="flex items-center text-sm font-medium text-black dark:text-white mb-3">
        <Icon icon="heroicons:map" class="inline w-4 h-4" />
        <span class="ml-1">{$t('filters.location')}</span>
      </p>
      <MapPicker
        bind:lat
        bind:lon
        bind:radius
        on:change={handleMapChange}
      />
    </div>

    <!-- Apply Button -->
    <Button variant="primary" fullWidth on:click={applyFilters}>
      {$t('filters.apply')}
    </Button>
  </div>
</aside>

<!-- Mobile Drawer -->
{#if showMobileFilters}
  <!-- Backdrop -->
  <div
    class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    on:click={handleBackdropClick}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && dispatch('close')}
    transition:fade={{ duration: 200 }}
  >
    <!-- Drawer -->
    <div
      class="fixed inset-x-0 bottom-0 max-h-[80vh] bg-white dark:bg-stone-800 rounded-t-2xl shadow-2xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      transition:fly={{ y: 500, duration: 300 }}
    >
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-black dark:text-white">
            {$t('filters.title')}
          </h2>
          <div class="flex items-center gap-2">
            <button
              on:click={resetFilters}
              class="text-sm text-[#E10600] hover:text-[#C10500] dark:text-red-400 dark:hover:text-[#E10600] font-medium"
            >
              {$t('filters.reset')}
            </button>
            <button
              on:click={() => dispatch('close')}
              class="w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
              aria-label={$t('filters.mobileClose')}
            >
              <Icon icon="heroicons:x-mark" class="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>

        <!-- Date Range -->
        <div aria-labelledby={mobileDateLabelId}>
          <p id={mobileDateLabelId} class="flex items-center text-sm font-medium text-black dark:text-white mb-3">
            <Icon icon="heroicons:calendar-days" class="inline w-4 h-4 mr-1" />
            {$t('filters.dateRange')}
          </p>
          <DateRangePicker
            bind:startDate
            bind:endDate
            bind:mode={dateMode}
            on:change={handleDateChange}
          />
        </div>

        <!-- Map Location Picker -->
        <div aria-labelledby={mobileLocationLabelId}>
          <p id={mobileLocationLabelId} class="flex items-center text-sm font-medium text-black dark:text-white mb-3">
            <Icon icon="heroicons:map" class="inline w-4 h-4 mr-1" />
            {$t('filters.location')}
          </p>
          <MapPicker
            bind:lat
            bind:lon
            bind:radius
            on:change={handleMapChange}
          />
        </div>

        <!-- Apply Button -->
        <Button variant="primary" fullWidth on:click={applyFilters}>
          {$t('filters.apply')}
        </Button>
      </div>
    </div>
  </div>
{/if}
