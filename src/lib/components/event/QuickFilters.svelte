<script>
  import Icon from '$lib/components/common/Icon.svelte';
  import { t } from '$lib/i18n';

  export let searchTerm = '';
  export let onClearSearch = () => {};
  export let activeFilters = [];
  export let onFilterToggle = () => {};

  const MAX_LABEL_LENGTH = 28;

  const QUICK_FILTERS = [
    { id: 'soon', labelKey: 'filters.quick.soon', icon: 'heroicons:bolt' },
    { id: 'weekend', labelKey: 'filters.quick.weekend', icon: 'heroicons:calendar-days' },
    { id: 'near', labelKey: 'filters.quick.near', icon: 'heroicons:map-pin' }
  ];

  $: normalizedSearch = (searchTerm ?? '').trim();
  $: hasSearch = normalizedSearch.length > 0;
  $: displaySearch =
    normalizedSearch.length > MAX_LABEL_LENGTH
      ? `${normalizedSearch.slice(0, MAX_LABEL_LENGTH).trim()}…`
      : normalizedSearch;

  async function handleClearSearch() {
    if (typeof onClearSearch === 'function') {
      await onClearSearch();
    }
  }

  function isActive(id) {
    return Array.isArray(activeFilters) && activeFilters.includes(id);
  }

  function handleToggle(filterId) {
    if (typeof onFilterToggle === 'function') {
      onFilterToggle(filterId, { active: isActive(filterId) });
    }
  }
</script>

<div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
  {#if hasSearch}
    <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E10600] text-white text-sm font-bold shadow-sm">
      <Icon icon="heroicons:magnifying-glass" class="w-4 h-4" />
      <span class="max-w-[12rem] truncate whitespace-nowrap" title={normalizedSearch}>{displaySearch}</span>
      <button
        type="button"
        class="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
        on:click={handleClearSearch}
        aria-label={$t('home.clearSearchChip', { values: { query: normalizedSearch } })}
      >
        <Icon icon="heroicons:x-mark" class="w-3.5 h-3.5" />
      </button>
    </div>
  {/if}

  {#each QUICK_FILTERS as filter}
    {#if isActive(filter.id)}
      <div class="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E10600] bg-[#E10600] text-white text-sm font-bold shadow-md">
        <Icon icon={filter.icon} class="w-4 h-4" />
        <span class="whitespace-nowrap">{$t(filter.labelKey)}</span>
        <button
          type="button"
          class="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          on:click={() => handleToggle(filter.id)}
          aria-label={$t('filters.quick.clearFilter', { values: { filter: $t(filter.labelKey) } })}
        >
          <Icon icon="heroicons:x-mark" class="w-3.5 h-3.5" />
        </button>
      </div>
    {:else}
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black dark:border-white text-sm font-bold whitespace-nowrap text-black dark:text-white bg-white dark:bg-stone-800 hover:bg-[#E10600] dark:hover:bg-[#E10600] hover:border-[#E10600] dark:hover:border-[#E10600] hover:text-white dark:hover:text-white hover:shadow-md transition-all duration-200"
        on:click={() => handleToggle(filter.id)}
        aria-pressed={isActive(filter.id)}
      >
        <Icon icon={filter.icon} class="w-4 h-4" />
        <span class="whitespace-nowrap">{$t(filter.labelKey)}</span>
      </button>
    {/if}
  {/each}

  <div class="grow" />
  <slot />
</div>
