<script>
  import { onMount } from 'svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import {
    formatDateRange,
    formatTimeRange,
    getDaysUntil,
    getRelativeTime
  } from '$lib/utils/dateFormat';
import { locale, t } from '$lib/i18n';

  export let event;

  // Extract event data
  const {
    id,
    title = 'Untitled Event',
    start,
    end,
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
$: timeRangeText = eventDate ? formatTimeRange(eventDate, eventEndDate, {}, $locale) : '';
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

  onMount(() => {
    hydrated = true;
    if (titleEl) {
      isClamped = titleEl.scrollHeight > titleEl.clientHeight;
      // optional: resize observer etc.
    }
  });
</script>

<div
  class="
    relative min-w-0
    rounded-xl bg-stone-100 dark:bg-stone-700
    border border-stone-200 dark:border-stone-700
    shadow-md p-4 block
  "
>
  <!-- Content -->
  <div class="space-y-3">
    <div class="relative group inline-block">
      <h3
        bind:this={titleEl}
        class="text-md font-medium text-black dark:text-white line-clamp-2 min-h-[2.8rem]"
      >
        {title}
      </h3>

      {#if hydrated && isClamped}
        <div
          class="absolute z-20 pointer-events-none
            left-1/2 -translate-x-1/2 bottom-full mb-2
            w-64 rounded-lg bg-black text-white text-sm px-3 py-2 shadow-lg whitespace-normal text-center
            opacity-0 translate-y-1
            group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-200 ease-in-out
            [visibility:hidden] group-hover:[visibility:visible]"
        >
          {title}
        </div>
      {/if}
    </div>

    <div class="space-y-1 text-sm text-black/60 dark:text-white/60">
      <!-- Date Range -->
      <p class="flex items-center gap-2">
        <Icon icon="heroicons:calendar-days" class="w-4 h-4 flex-shrink-0" />
        <span>{dateRangeText || $t('event.dateTBA')}</span>
      </p>

      <!-- Time Range -->
      {#if timeRangeText}
        <p class="flex items-center gap-2">
          <Icon icon="heroicons:clock" class="w-4 h-4 flex-shrink-0" />
          <span>{timeRangeText}</span>
          <!-- <span>{start} | {eventDate?.toISOString()} | {timeRangeText}</span> -->
        </p>
      {/if}

      <!-- Location -->
      {#if mapLink}
        <a href={mapLink} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-[#E10600] dark:hover:text-red-400 transition-colors" on:click={(e) => e.stopPropagation()}>
          <Icon icon="heroicons:map-pin" class="w-4 h-4 flex-shrink-0" />
          <span class="truncate">{location}</span>
          <Icon icon="heroicons:arrow-top-right-on-square" class="w-3 h-3 flex-shrink-0" />
        </a>
      {:else}
        <p class="flex items-center gap-2">
          <Icon icon="heroicons:map-pin" class="w-4 h-4 flex-shrink-0" />
          <span class="truncate">{location}</span>
        </p>
      {/if}

      {#if url}
        <a href={url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-[#E10600] dark:hover:text-red-400 transition-colors" on:click={(e) => e.stopPropagation()}>
          <Icon icon="heroicons:globe-alt" class="w-4 h-4 flex-shrink-0" />
          <span class="truncate">{source}</span>
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
      {#if verified}
        <span class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
          <Icon icon="heroicons:check-circle" class="w-4 h-4" />
          <!-- Verified -->
        </span>
      {/if}
    </div>
  </div>
</div>
