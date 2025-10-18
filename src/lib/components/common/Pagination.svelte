<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import { t } from '$lib/i18n';

  const dispatch = createEventDispatcher();

  // Required props
  export let currentPage = 1;
  export let totalItems = 0;
  export let itemsPerPage = 20;

  // Optional configuration
  export let maxVisiblePages = 5; // Number of page buttons to show
  export let showFirstLast = true; // Show first/last page buttons with ellipsis
  export let showPrevNext = true; // Show prev/next buttons
  export let showInfo = true; // Show "Showing X-Y of Z" text
  export let showMobileJump = true; // Show page input on mobile

  // Calculate pagination values
  $: totalPages = Math.ceil(totalItems / itemsPerPage);
  $: hasNextPage = currentPage < totalPages;
  $: hasPrevPage = currentPage > 1;
  $: pageStart = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  $: pageEnd = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  // Calculate visible page numbers
  $: visiblePages = (() => {
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Show maxVisiblePages centered around current page
      const start = Math.max(1, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1));
      return Array.from({ length: maxVisiblePages }, (_, i) => start + i);
    }
  })();

  $: showFirstEllipsis = showFirstLast && visiblePages[0] > 1;
  $: showLastEllipsis = showFirstLast && visiblePages[visiblePages.length - 1] < totalPages;
  $: showFirstButton = showFirstLast && currentPage > Math.floor(maxVisiblePages / 2) + 1 && totalPages > maxVisiblePages;
  $: showLastButton = showFirstLast && currentPage < totalPages - Math.floor(maxVisiblePages / 2) && totalPages > maxVisiblePages;

  function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch('pageChange', { page });
    }
  }

  function handlePrevious() {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  }

  function handleNext() {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }

  function handleMobileInput(e) {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      goToPage(page);
    }
  }
</script>

{#if totalItems > itemsPerPage}
  <div class="flex flex-col items-center gap-4 pt-8">
    <!-- Results Info -->
    {#if showInfo}
      <p class="text-sm text-black/60 dark:text-white/60">
        {$t('home.paginationShowing', { values: { start: pageStart, end: pageEnd, total: totalItems } })}
      </p>
    {/if}

    <!-- Pagination Controls -->
    <nav class="flex w-full items-center gap-1 sm:gap-1" aria-label="Pagination">
      <!-- Previous Button -->
      {#if showPrevNext}
        <button
          on:click={handlePrevious}
          class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          disabled={!hasPrevPage}
          aria-label={$t('home.paginationAriaPrev')}
        >
          <Icon icon="heroicons:chevron-left" class="w-4 h-4" />
          <!-- <span class="hidden md:inline">{$t('home.paginationPrev')}</span> -->
        </button>
      {/if}

      <div class="grow"></div>

      <!-- First Page Button -->
      {#if showFirstButton}
        <button
          on:click={() => goToPage(1)}
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center text-sm sm:text-base"
          aria-label={$t('home.paginationAriaFirst')}
        >
          1
        </button>
        {#if showFirstEllipsis && visiblePages[0] > 2}
          <span class="w-6 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-black/40 dark:text-white/40 text-sm">
            ...
          </span>
        {/if}
      {/if}

      <!-- Page Number Buttons -->
      {#each visiblePages as pageNum}
        <button
          on:click={() => goToPage(pageNum)}
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors flex items-center justify-center font-medium text-sm sm:text-base
            {pageNum === currentPage
              ? 'bg-red-600 text-white shadow-md'
              : 'border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700'}"
          aria-label={$t('home.paginationAriaPage', { values: { page: pageNum } })}
          aria-current={pageNum === currentPage ? 'page' : undefined}
        >
          {pageNum}
        </button>
      {/each}

      <!-- Last Page Button -->
      {#if showLastButton}
        {#if showLastEllipsis && visiblePages[visiblePages.length - 1] < totalPages - 1}
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

      <!-- Next Button -->
      {#if showPrevNext}
        <button
          on:click={handleNext}
          class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          disabled={!hasNextPage}
          aria-label={$t('home.paginationAriaNext')}
        >
          <!-- <span class="hidden md:inline">{$t('home.paginationNext')}</span> -->
          <Icon icon="heroicons:chevron-right" class="w-4 h-4" />
        </button>
      {/if}
    </nav>

    <!-- Mobile: Page Input for Quick Navigation -->
    {#if showMobileJump}
      <div class="flex items-center gap-2 text-xs sm:text-sm sm:hidden">
        <label for="page-input" class="text-black/60 dark:text-white/60">
          {$t('home.paginationGotoLabel')}
        </label>
        <input
          id="page-input"
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          on:change={handleMobileInput}
          class="w-12 px-1 py-1 text-center border border-stone-200 dark:border-stone-700 rounded bg-white dark:bg-stone-800 text-black dark:text-white text-xs"
        />
        <span class="text-black/60 dark:text-white/60">
          {$t('home.paginationGotoSuffix', { values: { total: totalPages } })}
        </span>
      </div>
    {/if}
  </div>
{/if}
