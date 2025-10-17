<script>
  import { goto, invalidate } from '$app/navigation';
  import EventCard from '$lib/components/event/EventCard.svelte';
  import FilterSidebar from '$lib/components/layout/FilterSidebar.svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import { t } from '$lib/i18n';

  export let data;

  let searchQuery = data.filters.search || '';
  let showMobileFilters = false;

  async function handleSearch(e) {
    e.preventDefault();

    const url = new URL(window.location.href);
    if (!searchQuery.trim()) {
      // remove search param if empty
      url.searchParams.delete('search');
    } else {
      url.searchParams.set('search', searchQuery.trim());
    }

    url.searchParams.delete('page'); // Reset to page 1

    await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
    await invalidate(() => true);

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

  async function goToPage(pageNum) {
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

  function nextPage() {
    goToPage(data.page + 1);
  }

  function previousPage() {
    if (data.page > 1) {
      goToPage(data.page - 1);
    }
  }

  // Reactive key to force re-render when page or filters change
  $: key = `page:${data.page}-search:${data.filters.search}-dates:${data.filters.startDate}-${data.filters.endDate}-location:${data.filters.lat}-${data.filters.lon}-${data.filters.radius}`;

  // Update search query when data changes (e.g., filters reset)
  // $: searchQuery = data.filters.search || '';

  // Calculate total pages
  $: totalPages = Math.ceil(data.total / data.limit);
  $: hasNextPage = data.page < totalPages;
  $: pageStart = data.total ? (data.page - 1) * data.limit + 1 : 0;
  $: pageEnd = data.total ? Math.min(data.page * data.limit, data.total) : 0;
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
      </div>

      <!-- TODO: Quick Filters -->
      <!-- <QuickFilters activeFilter="all" /> -->

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
      {#if data.total > data.limit}
        <div class="flex flex-col items-center gap-4 pt-8">
          <!-- Results Info -->
          <p class="text-sm text-black/60 dark:text-white/60">
          {$t('home.paginationShowing', { values: { start: pageStart, end: pageEnd, total: data.total } })}
          </p>

          <!-- Pagination Controls -->
          <nav class="flex w-full items-center gap-1 sm:gap-1" aria-label="Pagination">

            <!-- Previous Page -->
            <button
              on:click={previousPage}
              class="px-2 sm:px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              disabled={data.page === 1}
              aria-label={$t('home.paginationAriaPrev')}
            >
              <Icon icon="heroicons:chevron-left" class="w-4 h-4" />
              <span class="hidden md:inline">{$t('home.paginationPrev')}</span>
            </button>

            <div class="grow"></div>

            <!-- First Page -->
            {#if data.page > 3 && totalPages > 5}
              <button
                on:click={() => goToPage(1)}
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center text-sm sm:text-base"
              aria-label={$t('home.paginationAriaFirst')}
              >
                1
              </button>
              {#if data.page > 4}
                <span class="w-6 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-black/40 dark:text-white/40 text-sm">
                  ...
                </span>
              {/if}
            {/if}

            <!-- Page Numbers -->
            {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              if (totalPages <= 5) {
                // Show all pages if 5 or fewer
                return i + 1;
              } else {
                // Show 5 pages centered around current page
                const start = Math.max(1, Math.min(data.page - 2, totalPages - 4));
                return start + i;
              }
            }) as pageNum}
              <button
                on:click={() => goToPage(pageNum)}
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors flex items-center justify-center font-medium text-sm sm:text-base
                  {pageNum === data.page
                    ? 'bg-red-600 text-white shadow-md'
                    : 'border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700'}"
                aria-label={$t('home.paginationAriaPage', { values: { page: pageNum } })}
                aria-current={pageNum === data.page ? 'page' : undefined}
              >
                {pageNum}
              </button>
            {/each}

            <!-- Last Page -->
            {#if data.page < totalPages - 2 && totalPages > 5}
              {#if data.page < totalPages - 3}
                <span class="w-6 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-black/40 dark:text-white/40 text-sm">
                  ...
                </span>
              {/if}
              <button
                on:click={() => goToPage(totalPages)}
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                aria-label={$t('home.paginationAriaLast')}
              >
                {totalPages}
              </button>
            {/if}

            <div class="grow"></div>

            <!-- Next Page -->
            <button
              on:click={nextPage}
              class="px-2 sm:px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              disabled={!hasNextPage}
              aria-label={$t('home.paginationAriaNext')}
            >
              <span class="hidden md:inline">{$t('home.paginationNext')}</span>
              <Icon icon="heroicons:chevron-right" class="w-4 h-4" />
            </button>
          </nav>

          <!-- Mobile: Page Input for Quick Navigation -->
          <div class="flex items-center gap-2 text-xs sm:text-sm sm:hidden">
            <label for="page-input" class="text-black/60 dark:text-white/60">
              {$t('home.paginationGotoLabel')}
            </label>
            <input
              id="page-input"
              type="number"
              min="1"
              max={totalPages}
              value={data.page}
              on:change={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  goToPage(page);
                }
              }}
              class="w-12 px-1 py-1 text-center border border-stone-200 dark:border-stone-700 rounded bg-white dark:bg-stone-800 text-black dark:text-white text-xs"
            />
            <span class="text-black/60 dark:text-white/60">
              {$t('home.paginationGotoSuffix', { values: { total: totalPages } })}
            </span>
          </div>
        </div>
      {/if}
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
