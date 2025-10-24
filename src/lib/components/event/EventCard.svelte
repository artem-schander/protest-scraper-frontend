<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import {
    formatDateRange,
    formatTimeRange,
    getDaysUntil,
    getRelativeTime
  } from '$lib/utils/dateFormat';
  import { locale, t } from '$lib/i18n';
  import { authStore } from '$lib/stores/auth';
  import { notificationStore } from '$lib/stores/notification';
  import EditEventModal from '$lib/components/event/EditEventModal.svelte';
  import { deleteProtest } from '$lib/utils/api';

  export let event;

  const dispatch = createEventDispatcher();
  let showEditModal = false;
  let showDeleteConfirm = false;
  let isDeleting = false;

  // Extract event data
  const {
    id,
    title = 'Untitled Event',
    start,
    startTimeKnown = true,
    end,
    endTimeKnown = true,
    // location: "Berlin, Deutschland"
    location,
    locationDetails = 'TBA',
    city = 'TBA',
    country = 'TBA',
    coordinates,
    language,
    // source: "www.demokrateam.org"
    source = 'Unknown',
    categories = [],
    attendees,
    verified = false,
    url
  } = event;

  // Date parsing with validation
  function parseEventDate(dateString) {
    if (!dateString) return null;

    try {
      // Handle ISO string directly to preserve timezone
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return null;
      }

      // // Debug: log the original string and parsed date
      // console.log('Original date string:', dateString);
      // console.log('Parsed date:', date);
      // console.log('UTC time:', date.toISOString());
      // console.log('Local time:', date.toString());

      return date;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  // Date formatting with proper validation
  const eventDate = parseEventDate(start);
  const eventEndDate = parseEventDate(end);

  // Create a copy for getDaysUntil to prevent mutation
const daysUntil = eventDate ? getDaysUntil(new Date(eventDate)) : null;

let dateRangeText = '';
let timeRangeText = '';
let relativeTime = '';

$: dateRangeText = eventDate ? formatDateRange(eventDate, eventEndDate, $locale) : '';
$: timeRangeText = (eventDate && startTimeKnown === true) ? formatTimeRange(eventDate, eventEndDate, {}, $locale) : '';
$: relativeTime = eventDate ? getRelativeTime(eventDate, $locale) : '';

  // // Location
  // const locationParts = [];
  // if (location.street) locationParts.push(location.street);
  // if (location.city) locationParts.push(location.city);
  // if (location.country) locationParts.push(location.country);
  // const locationText = locationParts.join(', ') || 'Location TBA';
  //
  // // Map link (OpenStreetMap)
  const mapLink = coordinates?.lat && coordinates?.lon
    ? `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}&zoom=15`
    : null;

  // Determine card style based on urgency - using protest colors
  // let urgencyClass = 'bg-[#EEEEEE] dark:bg-stone-700'; // Paper gray for future events
  // if (daysUntil !== null) {
  //  if (daysUntil <= 7) urgencyClass = 'bg-gradient-to-br from-[#E10600]/10 to-red-400/10 dark:from-[#E10600]/20 dark:to-red-400/20 border-l-4 border-[#E10600]'; // Signal Red for urgent
  //  else if (daysUntil <= 30) urgencyClass = 'bg-white dark:bg-stone-800'; // White/black for upcoming
  // }

  let urgencyClass = 'text-black/60 dark:text-white/60'; // Paper gray for future events
  if (daysUntil !== null && daysUntil <= 7) {
    urgencyClass = 'text-[#E10600] dark:text-red-400'; // Signal Red for urgent
  }

  let titleEl;
  let isClamped = false;
  let hydrated = false;
  let showTooltip = false;

  onMount(() => {
    hydrated = true;
    if (titleEl) {
      isClamped = titleEl.scrollHeight > titleEl.clientHeight;
      // optional: resize observer etc.
    }
  });

  function handleMouseEnter() {
    if (isClamped) showTooltip = true;
  }

  function handleMouseLeave() {
    showTooltip = false;
  }

  async function handleDelete() {
    if (isDeleting) return;

    isDeleting = true;
    try {
      const response = await deleteProtest(id);

      if (response.error) {
        notificationStore.add({
          type: 'error',
          title: $t('deleteEvent.error'),
          message: response.error
        });
        isDeleting = false;
        showDeleteConfirm = false;
        return;
      }

      // Show success notification
      notificationStore.add({
        type: 'success',
        title: $t('deleteEvent.success')
      });

      // Close modal and reset state
      showDeleteConfirm = false;
      isDeleting = false;

      // Emit event to refresh the list
      dispatch('deleted', { id });
    } catch (error) {
      console.error('Delete error:', error);
      notificationStore.add({
        type: 'error',
        title: $t('deleteEvent.error')
      });
      isDeleting = false;
      showDeleteConfirm = false;
    }
  }
</script>

<div
  class="
    relative min-w-0
    rounded-xl bg-stone-100 dark:bg-stone-700
    border border-stone-200 dark:border-stone-700
    shadow-md p-4 block
    grid grid-rows-[auto_1fr_auto] gap-3
  "
>
  <!-- Title -->
  <div class="relative">
    <h3
      bind:this={titleEl}
      class="text-md font-medium text-black dark:text-white line-clamp-2 leading-tight"
      style="display: -webkit-box; -webkit-box-orient: vertical; height: 2.5em;"
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
    >
      {title}
    </h3>

    {#if hydrated && isClamped && showTooltip}
      <div
        class="absolute z-20 pointer-events-none
          left-1/2 -translate-x-1/2 bottom-full mb-2
          w-64 rounded-lg bg-black text-white text-sm px-3 py-2 shadow-xl whitespace-normal text-center
          animate-in fade-in slide-in-from-bottom-1 duration-200"
      >
        {title}
      </div>
    {/if}
  </div>

  <!-- Details -->
  <div class="space-y-1 text-sm text-black/60 dark:text-white/60 min-w-0">
    <!-- Date Range -->
    <p class="flex items-center gap-2">
      <Icon icon="heroicons:calendar-days" class="w-4 h-4 flex-shrink-0" />
      <span>{dateRangeText || $t('event.dateTBA')}</span>
    </p>

    <!-- Time Range -->
    <p class="flex items-center gap-2">
      <Icon icon="heroicons:clock" class="w-4 h-4 flex-shrink-0" />
      <span>{timeRangeText || $t('event.timeTBA')}</span>
    </p>

    <!-- Location -->
    {#if mapLink}
      <a href={mapLink} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-[#E10600] dark:hover:text-red-400 transition-colors min-w-0" on:click={(e) => e.stopPropagation()}>
        <Icon icon="heroicons:map-pin" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate min-w-0">{location}</span>
        <Icon icon="heroicons:arrow-top-right-on-square" class="w-3 h-3 flex-shrink-0" />
      </a>
    {:else}
      <p class="flex items-center gap-2 min-w-0">
        <Icon icon="heroicons:map-pin" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate min-w-0">{location}</span>
      </p>
    {/if}

    {#if url}
      <a href={url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-[#E10600] dark:hover:text-red-400 transition-colors min-w-0" on:click={(e) => e.stopPropagation()}>
        <Icon icon="heroicons:globe-alt" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate min-w-0">{source}</span>
        <Icon icon="heroicons:arrow-top-right-on-square" class="w-3 h-3 flex-shrink-0" />
      </a>
    {/if}
  </div>

  <!-- Tags -->
  <!-- {#if categories && categories.length > 0} -->
  <!--  <div class="flex flex-wrap gap-2"> -->
  <!--    {#each categories.slice(0, 3) as tag} -->
  <!--      <span class="px-3 py-1 rounded-full bg-white/60 dark:bg-stone-700/60 text-xs text-black dark:text-white"> -->
  <!--        {tag} -->
  <!--      </span> -->
  <!--    {/each} -->
  <!--  </div> -->
  <!-- {/if} -->

  <!-- Footer -->
  <div class="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
    <div class="flex items-center gap-3 text-xs text-black/60 dark:text-white/60 flex-wrap">
      {#if relativeTime}
        <span class="flex items-center gap-1 {urgencyClass}">
          <Icon icon="heroicons:calendar-days" class="w-4 h-4" />
          {relativeTime}
        </span>
      {/if}
      {#if attendees}
        <span class="flex items-center gap-1">
          <Icon icon="heroicons:users" class="w-4 h-4" />
          {attendees}+
        </span>
      {/if}
      <!-- {#if url} -->
      <!--  <a href={url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 hover:text-[#E10600] dark:hover:text-red-400 transition-colors" on:click={(e) => e.stopPropagation()}> -->
      <!--    <Icon icon="heroicons:arrow-top-right-on-square" class="w-3 h-3" /> -->
      <!--    {source} -->
      <!--  </a> -->
      <!-- {/if} -->
    </div>
    <div class="flex items-center gap-2">
      {#if verified}
        <span class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
          <Icon icon="heroicons:check-circle" class="w-4 h-4" />
          <!-- Verified -->
        </span>
      {/if}
      {#if $authStore.user?.role === 'MODERATOR' || $authStore.user?.role === 'ADMIN'}
        <button
          type="button"
          on:click|stopPropagation={() => (showEditModal = true)}
          class="text-xs text-black/60 dark:text-white/60 hover:text-[#E10600] dark:hover:text-red-400 transition-colors flex items-center gap-1"
          aria-label={$t('editEvent.title')}
        >
          <Icon icon="heroicons:pencil-square" class="w-4 h-4" />
        </button>
      {/if}
      {#if $authStore.user?.role === 'ADMIN'}
        <button
          type="button"
          on:click|stopPropagation={() => (showDeleteConfirm = true)}
          class="text-xs text-black/60 dark:text-white/60 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-1"
          aria-label={$t('deleteEvent.title')}
        >
          <Icon icon="heroicons:trash" class="w-4 h-4" />
        </button>
      {/if}
    </div>
  </div>
</div>

<EditEventModal
  bind:isOpen={showEditModal}
  protestId={id}
  on:updated={() => dispatch('updated')}
/>

{#if showDeleteConfirm}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    on:click|stopPropagation={() => (showDeleteConfirm = false)}
  >
    <div
      class="bg-white dark:bg-stone-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4"
      on:click|stopPropagation
    >
      <h3 class="text-xl font-semibold text-black dark:text-white">
        {$t('deleteEvent.confirmTitle')}
      </h3>
      <p class="text-black/70 dark:text-white/70">
        {$t('deleteEvent.confirmMessage')}
      </p>
      <div class="flex gap-3 justify-end pt-2">
        <button
          type="button"
          on:click|stopPropagation={() => (showDeleteConfirm = false)}
          disabled={isDeleting}
          class="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 text-black dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {$t('deleteEvent.cancel')}
        </button>
        <button
          type="button"
          on:click|stopPropagation={handleDelete}
          disabled={isDeleting}
          class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
        >
          {isDeleting ? $t('deleteEvent.deleting') : $t('deleteEvent.confirm')}
        </button>
      </div>
    </div>
  </div>
{/if}
