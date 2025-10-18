<script>
  import { onDestroy } from 'svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import { t } from '$lib/i18n';
  import { getExportUrl, getCalendarSubscriptionUrl } from '$lib/utils/api';

  export let filters = {};

  const ALLOWED_FILTER_KEYS = [
    'city',
    'source',
    'country',
    'language',
    'search',
    'startDate',
    'endDate',
    'days',
    'verified',
    'lat',
    'lon',
    'radius'
  ];

  const SUBSCRIPTION_DAY_OPTIONS = [7, 14, 30, 60, 90, 120, 365];
  const DEFAULT_SUBSCRIPTION_DAYS = 120;

  let subscriptionDays = DEFAULT_SUBSCRIPTION_DAYS;

  function sanitizeFilters(rawFilters = {}, { includeDateRange = true } = {}) {
    const cleaned = {};

    for (const key of ALLOWED_FILTER_KEYS) {
      const value = rawFilters[key];
      if (value === undefined || value === null) continue;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') continue;
        cleaned[key] = trimmed;
      } else if (typeof value === 'number') {
        if (!Number.isNaN(value)) {
          cleaned[key] = value;
        }
      } else if (typeof value === 'boolean') {
        cleaned[key] = value;
      }
    }

    if (!includeDateRange) {
      delete cleaned.startDate;
      delete cleaned.endDate;
      delete cleaned.days;
    }

    // Geolocation filters must include both lat and lon
    if (!(cleaned.lat && cleaned.lon)) {
      delete cleaned.lat;
      delete cleaned.lon;
      delete cleaned.radius;
    }

    return cleaned;
  }

  $: downloadFilters = sanitizeFilters(filters, { includeDateRange: true });
  $: csvUrl = getExportUrl('csv', downloadFilters);
  $: jsonUrl = getExportUrl('json', downloadFilters);
  $: icsDownloadUrl = getExportUrl('ics', downloadFilters);

  $: normalizedSubscriptionDays = parseInt(subscriptionDays, 10);
  $: effectiveSubscriptionDays = Number.isNaN(normalizedSubscriptionDays)
    ? DEFAULT_SUBSCRIPTION_DAYS
    : Math.max(1, normalizedSubscriptionDays);

  $: subscriptionFilters = sanitizeFilters(filters, { includeDateRange: false });
  $: subscriptionFiltersWithDays = {
    ...subscriptionFilters,
    days: effectiveSubscriptionDays
  };
  $: icsSubscriptionUrl = getCalendarSubscriptionUrl(subscriptionFiltersWithDays);

  let copyStatus = 'idle';
  let copyTimeout;
  let icsInput;

  const COPY_TIMEOUT_MS = 2500;

  function clearCopyTimeout() {
    if (copyTimeout) {
      clearTimeout(copyTimeout);
      copyTimeout = undefined;
    }
  }

  onDestroy(() => {
    clearCopyTimeout();
  });

  async function copyIcsLink() {
    clearCopyTimeout();

    if (!icsInput) {
      copyStatus = 'error';
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      icsInput.select();
      copyStatus = 'unsupported';
      return;
    }

    try {
      await navigator.clipboard.writeText(icsSubscriptionUrl);
      copyStatus = 'success';
      copyTimeout = setTimeout(() => {
        copyStatus = 'idle';
        copyTimeout = undefined;
      }, COPY_TIMEOUT_MS);
    } catch (error) {
      console.error('Failed to copy ICS link:', error);
      copyStatus = 'error';
    }
  }

  $: copyMessage = (() => {
    if (copyStatus === 'success') return $t('filters.export.copySuccess');
    if (copyStatus === 'unsupported') return $t('filters.export.copyUnsupported');
    if (copyStatus === 'error') return $t('filters.export.copyError');
    return '';
  })();

  $: showCopyMessage = copyStatus === 'success' || copyStatus === 'unsupported' || copyStatus === 'error';

  $: ariaLive = copyStatus === 'success' ? 'polite' : 'assertive';

  function handleDaysChange(event) {
    subscriptionDays = event.target.value;
  }
</script>

<div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-5 shadow-sm space-y-6">
  <div class="space-y-1">
    <h3 class="text-base font-medium text-black dark:text-white">
      {$t('filters.export.title')}
    </h3>
    <p class="text-sm text-black/60 dark:text-white/60">
      {$t('filters.export.subtitle')}
    </p>
  </div>

  <section class="space-y-3">
    <div class="space-y-1">
      <p class="text-sm font-medium text-black dark:text-white">
        {$t('filters.export.downloadTitle')}
      </p>
      <p class="text-xs text-black/60 dark:text-white/60">
        {$t('filters.export.downloadDescription')}
      </p>
      <p class="text-xs text-black/60 dark:text-white/60">
        {$t('filters.export.downloadEmphasis')}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <a
        class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        href={csvUrl}
        download="protests.csv"
      >
        <Icon icon="heroicons:queue-list" class="w-4 h-4" />
        {$t('filters.export.downloadCsv')}
      </a>
      <a
        class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        href={jsonUrl}
        download="protests.json"
      >
        <Icon icon="heroicons:code-bracket" class="w-4 h-4" />
        {$t('filters.export.downloadJson')}
      </a>
      <a
        class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        href={icsDownloadUrl}
        download="protests.ics"
      >
        <Icon icon="heroicons:calendar-days" class="w-4 h-4" />
        {$t('filters.export.downloadIcs')}
      </a>
    </div>
  </section>

  <section class="space-y-3 border-t border-stone-200 dark:border-stone-700 pt-4">
    <div class="space-y-1">
      <p class="text-sm font-medium text-black dark:text-white">
        {$t('filters.export.calendarTitle')}
      </p>
      <p class="text-xs text-black/60 dark:text-white/60">
        {$t('filters.export.calendarDescription')}
      </p>
    </div>

    <div class="space-y-2">
      <label class="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-medium text-black dark:text-white">
        <span>{$t('filters.export.calendarDaysLabel')}</span>
        <select
          class="sm:w-auto px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E10600]"
          on:change={handleDaysChange}
          value={effectiveSubscriptionDays}
        >
          {#each SUBSCRIPTION_DAY_OPTIONS as option}
            <option value={option}>
              {$t('filters.export.calendarDaysOption', { values: { days: option } })}
            </option>
          {/each}
        </select>
      </label>
      <p class="text-xs text-black/60 dark:text-white/60">
        {$t('filters.export.calendarDaysHelp')}
      </p>
    </div>

    <div class="space-y-2">
      <span class="block text-xs font-medium text-black dark:text-white">
        {$t('filters.export.copyLabel')}
      </span>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          class="flex-1 min-w-0 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E10600]"
          value={icsSubscriptionUrl}
          readonly
          bind:this={icsInput}
          on:focus={() => icsInput && icsInput.select()}
          aria-label={$t('filters.export.copyLabel')}
        />
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-[#E10600] text-white text-xs font-medium hover:bg-[#C10500] transition-colors flex items-center justify-center gap-2"
          on:click={copyIcsLink}
        >
          <Icon icon="heroicons:clipboard" class="w-4 h-4" />
          {copyStatus === 'success' ? $t('filters.export.copySuccessShort') : $t('filters.export.copyAction')}
        </button>
      </div>
      {#if showCopyMessage}
        <p class="text-xs text-black/60 dark:text-white/60" aria-live={ariaLive}>
          {copyMessage}
        </p>
      {/if}
    </div>

    <div class="space-y-1">
      <p class="text-xs font-medium text-black dark:text-white">
        {$t('filters.export.calendarHowToTitle')}
      </p>
      <ol class="list-decimal list-inside text-xs text-black/60 dark:text-white/60 space-y-1">
        <li>{$t('filters.export.calendarStepCopy')}</li>
        <li>{$t('filters.export.calendarStepAdd')}</li>
      </ol>
    </div>
  </section>
</div>
