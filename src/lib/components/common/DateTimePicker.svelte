<script>
  import { t } from '$lib/i18n';
  import Icon from '$lib/components/common/Icon.svelte';

  export let startDateTime = '';
  export let endDateTime = '';
  export let required = false;

  function clearEndDate() {
    endDateTime = '';
  }

  // Convert datetime-local format (YYYY-MM-DDTHH:mm) to display format
  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString($t('locale'), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  }
</script>

<div class="space-y-4">
  <!-- Start Date & Time -->
  <div>
    <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="start-datetime">
      {$t('createEvent.startDateTime')} {#if required}<span class="text-red-500">*</span>{/if}
    </label>
    <div class="relative">
      <input
        type="datetime-local"
        id="start-datetime"
        bind:value={startDateTime}
        {required}
        class="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-700 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
      />
    </div>
  </div>

  <!-- End Date & Time -->
  <div>
    <div class="flex items-center justify-between mb-2">
      <label class="block text-sm text-black/60 dark:text-white/60" for="end-datetime">
        {$t('createEvent.endDateTime')}
        <span class="text-xs text-black/40 dark:text-white/40 ml-1">({$t('common.optional')})</span>
      </label>
      {#if endDateTime}
        <button
          type="button"
          on:click={clearEndDate}
          class="text-xs text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600] font-medium flex items-center gap-1"
        >
          <Icon icon="heroicons:x-mark" class="w-3 h-3" />
          {$t('filters.clearDates')}
        </button>
      {/if}
    </div>
    <div class="relative">
      <input
        type="datetime-local"
        id="end-datetime"
        bind:value={endDateTime}
        min={startDateTime}
        class="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-700 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
      />
    </div>
  </div>
</div>

<style>
  /* Style the datetime-local inputs */
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: opacity(0.5);
    cursor: pointer;
  }

  :global(.dark) input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(1) opacity(0.5);
  }

  input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
    filter: opacity(0.8);
  }

  :global(.dark) input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
    filter: invert(1) opacity(0.8);
  }
</style>
