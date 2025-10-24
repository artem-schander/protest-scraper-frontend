<script>
import { createEventDispatcher } from 'svelte';
import Icon from '$lib/components/common/Icon.svelte';
import { locale, t } from '$lib/i18n';

export let startDate = null;
export let endDate = null;
export let mode = 'day'; // 'day', 'week', 'month', 'range'

const dispatch = createEventDispatcher();
const modeOrder = ['day', 'week', 'month', 'range'];
const modeIcons = {
  day: 'heroicons:calendar',
  week: 'heroicons:calendar-days',
  month: 'heroicons:calendar',
  range: 'heroicons:arrows-right-left'
};
const baseMondayUTC = Date.UTC(2021, 0, 4); // Monday, 4 Jan 2021

// Initialize currentMonth based on startDate if it exists, otherwise use current month
let currentMonth = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), 1) : new Date();
let hoverDate = null;
let userNavigatedMonth = false;

// Update currentMonth when startDate changes (e.g., from URL params), but only if user hasn't manually navigated
$: if (startDate && !userNavigatedMonth && currentMonth.getMonth() !== startDate.getMonth()) {
  currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
}

// Create a reactive key that changes whenever startDate or endDate change
// This forces the calendar to re-render and update the highlighted range
$: dateKey = `${startDate?.getTime() || 'null'}-${endDate?.getTime() || 'null'}`;

$: currentLocale = $locale || 'en-US';
$: monthFormatter = new Intl.DateTimeFormat(currentLocale, { month: 'long', year: 'numeric' });
$: dayFormatter = new Intl.DateTimeFormat(currentLocale, { month: 'short', day: 'numeric', year: 'numeric' });
$: weekdayLabels = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(currentLocale, { weekday: 'short' }).format(new Date(baseMondayUTC + i * 86400000))
);

$: monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
$: monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
$: daysInMonth = monthEnd.getDate();
$: firstDayOfWeek = (monthStart.getDay() + 6) % 7; // Monday as first day
$: today = new Date();
$: todayStr = formatDateStr(today);

  function formatDateStr(date) {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function parseDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    return formatDateStr(date1) === formatDateStr(date2);
  }

  function isInRange(date) {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  }

  function isInHoverRange(date) {
    if (!startDate || !hoverDate || endDate) return false;
    const min = startDate < hoverDate ? startDate : hoverDate;
    const max = startDate > hoverDate ? startDate : hoverDate;
    return date >= min && date <= max;
  }

  function handleModeChange(newMode) {
    mode = newMode;
    startDate = null;
    endDate = null;
    emitChange();
  }

  function handleDayClick(day) {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    switch (mode) {
      case 'day':
        startDate = clickedDate;
        endDate = clickedDate;
        break;
      case 'week':
        const dayOfWeek = clickedDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate() + mondayOffset);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
        break;
      case 'month':
        startDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1);
        endDate = new Date(clickedDate.getFullYear(), clickedDate.getMonth() + 1, 0);
        break;
      case 'range':
        if (!startDate || (startDate && endDate)) {
          startDate = clickedDate;
          endDate = null;
        } else if (startDate && !endDate) {
          if (clickedDate < startDate) {
            endDate = startDate;
            startDate = clickedDate;
          } else {
            endDate = clickedDate;
          }
        }
        break;
    }

    emitChange();
  }

  function handleDayHover(day) {
    if (mode === 'range' && startDate && !endDate) {
      hoverDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    }
  }

  function previousMonth() {
    userNavigatedMonth = true;
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  }

  function nextMonth() {
    userNavigatedMonth = true;
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }

  function emitChange() {
    dispatch('change', { startDate, endDate, mode });
  }

  function clearDates() {
    startDate = null;
    endDate = null;
    emitChange();
  }
</script>

<div class="space-y-4">
  <!-- Mode Selection -->
  <div class="grid grid-cols-4 gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg">
    {#each modeOrder as modeId}
      <button
        type="button"
        on:click={() => handleModeChange(modeId)}
        class="flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-md text-xs font-medium transition-all
          {mode === modeId
            ? 'bg-white dark:bg-stone-700 text-black dark:text-white shadow-sm'
            : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}"
      >
        <Icon icon={modeIcons[modeId]} class="w-4 h-4" />
        <span class="text-[10px]">{$t(`filters.dateModes.${modeId}`)}</span>
      </button>
    {/each}
  </div>

  <!-- Calendar -->
  <div class="border border-stone-200 dark:border-stone-700 rounded-lg p-4 bg-white dark:bg-stone-800">
    <!-- Month Navigation -->
    <div class="flex items-center justify-between mb-4">
      <button
        type="button"
        on:click={previousMonth}
        class="w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
        aria-label={$t('filters.monthNav.previous')}
      >
        <Icon icon="heroicons:chevron-left" class="w-5 h-5 text-black dark:text-white" />
      </button>
      <span class="font-medium text-black dark:text-white">
        {monthFormatter.format(currentMonth)}
      </span>
      <button
        type="button"
        on:click={nextMonth}
        class="w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
        aria-label={$t('filters.monthNav.next')}
      >
        <Icon icon="heroicons:chevron-right" class="w-5 h-5 text-black dark:text-white" />
      </button>
    </div>

    <!-- Weekday Headers -->
    <div class="grid grid-cols-7 mb-2">
      {#each weekdayLabels as day}
        <div class="text-center text-xs font-medium text-black/60 dark:text-white/60 py-2">
          {day}
        </div>
      {/each}
    </div>

    <!-- Calendar Days -->
    <div class="grid grid-cols-7 gap-1">
      <!-- Empty cells for days before month starts -->
      {#each Array(firstDayOfWeek) as _}
        <div class="aspect-square"></div>
      {/each}

      <!-- Days of the month -->
      {#each Array(daysInMonth) as _, i (dateKey + '-' + i)}
        {@const day = i + 1}
        {@const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)}
        {@const dateStr = formatDateStr(date)}
        {@const isToday = dateStr === todayStr}
        {@const isStart = isSameDay(date, startDate)}
        {@const isEnd = isSameDay(date, endDate)}
        {@const inRange = isInRange(date)}
        {@const inHover = isInHoverRange(date)}
        {@const isPast = date < today && !isToday}

        <button
          type="button"
          on:click={() => handleDayClick(day)}
          on:mouseenter={() => handleDayHover(day)}
          on:mouseleave={() => hoverDate = null}
          disabled={isPast}
          class="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
            {isStart || isEnd
              ? 'bg-[#E10600] text-white shadow-md hover:bg-[#C10500]'
              : inRange || inHover
                ? 'bg-[#E10600]/20 dark:bg-red-400/20 text-black dark:text-white'
                : isToday
                  ? 'bg-black dark:bg-white text-white dark:text-black font-bold'
                  : isPast
                    ? 'text-black/20 dark:text-white/20 cursor-not-allowed'
                    : 'text-black dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700'}"
        >
          {day}
        </button>
      {/each}
    </div>
  </div>

  <!-- Selected Range Display -->
  {#if startDate}
    <div class="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm">
      <div class="text-sm space-y-1">
        <div class="flex items-center gap-2 text-black/60 dark:text-white/60">
          <Icon icon="heroicons:calendar" class="w-4 h-4" />
          <span class="font-medium">{$t('filters.selection')}</span>
        </div>
        <div class="text-xs text-black dark:text-white font-mono">
          <span class="whitespace-nowrap">{dayFormatter.format(startDate)}</span>
          {#if endDate && !isSameDay(startDate, endDate)}
            <span class="whitespace-nowrap ml-[-4px]">→ {dayFormatter.format(endDate)}</span>
          {/if}
        </div>
      </div>
      <button
        type="button"
        on:click={clearDates}
        class="flex itens-center text-sm text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600] font-medium"
        aria-label={$t('filters.clearDates')}
      >
        <!-- {$t('filters.clear')} -->
        <Icon icon="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>
  {/if}
</div>
