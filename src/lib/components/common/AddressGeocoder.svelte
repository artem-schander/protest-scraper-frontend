<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import Icon from '$lib/components/common/Icon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { t } from '$lib/i18n';

  export let initialAddress = '';
  export let initialCity = '';
  export let initialCountry = '';
  export let initialLat = null;
  export let initialLon = null;
  export let showMap = true; // New prop to control map visibility
  export let required = false; // Whether location selection is required
  export let label = ''; // Optional label for the field

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let searchResults = [];
  let selectedResult = null;
  let isSearching = false;
  let showResults = false;
  let error = null;

  let map;
  let L;
  let marker;
  let mapContainer;
  let lightTileLayer;
  let darkTileLayer;

  // Helper to get normalized address from result
  // For restored results, display_name is already normalized
  // For new selections, we normalize from address object
  $: getNormalizedAddress = (result) => {
    if (!result) return '';
    // If display_name exists and is already normalized (from restoration), use it
    if (result.display_name && !result.address?.road && !result.address?.postcode) {
      return result.display_name;
    }
    // Otherwise normalize from address object
    return normalizeAddress(result.address);
  };

  // Initialize searchQuery only once from props (not reactive)
  // This prevents the search field from being refilled when navigating back
  if (!searchQuery && (initialAddress || initialCity || initialCountry)) {
    const parts = [initialAddress, initialCity, initialCountry].filter(Boolean);
    if (parts.length > 0 && !initialLat && !initialLon) {
      // Only prefill if we don't have coordinates (new component, not restoration)
      searchQuery = parts.join(', ');
    }
  }

  // Restore selected location when initial props are provided
  // This runs reactively when the component is recreated (e.g., navigating back)
  $: if (initialLat && initialLon && initialAddress && !selectedResult) {
    selectedResult = {
      lat: initialLat,
      lon: initialLon,
      display_name: initialAddress,
      address: {
        city: initialCity,
        country_code: initialCountry?.toLowerCase()
      }
    };
    // Only update map marker if map is initialized
    if (map && L) {
      updateMapMarker(parseFloat(initialLat), parseFloat(initialLon), initialAddress);
    }
  }

  onMount(async () => {
    if (!browser || !showMap) return;

    // Dynamically import Leaflet (client-side only)
    L = await import('leaflet');

    // Initialize map centered on Europe (default)
    map = L.map(mapContainer, {
      zoomControl: false,
      attributionControl: false,
      wheelPxPerZoomLevel: 120,
    }).setView([51.1657, 10.4515], 5); // Germany center

    // Create light and dark tile layers
    lightTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO'
    });

    darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO'
    });

    // Add the initial tile layer based on current theme
    updateTileLayer();

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      updateTileLayer();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    onDestroy(() => {
      observer.disconnect();
    });
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  function updateTileLayer() {
    if (!map || !lightTileLayer || !darkTileLayer) return;

    const isDark = document.documentElement.classList.contains('dark');

    if (map.hasLayer(lightTileLayer)) {
      map.removeLayer(lightTileLayer);
    }
    if (map.hasLayer(darkTileLayer)) {
      map.removeLayer(darkTileLayer);
    }

    if (isDark) {
      darkTileLayer.addTo(map);
    } else {
      lightTileLayer.addTo(map);
    }
  }

  /**
   * Normalize address from Nominatim address components
   * Format: {road} {house_number}, {postcode} {village}, {state} {county}
   */
  function normalizeAddress(address) {
    if (!address) return '';

    const parts = [];

    // Part 1: road + house_number
    const streetParts = [];
    if (address.road) streetParts.push(address.road);
    if (address.house_number) streetParts.push(address.house_number);
    if (streetParts.length > 0) {
      parts.push(streetParts.join(' '));
    }

    // Part 2: postcode + village/city/town
    const cityParts = [];
    if (address.postcode) cityParts.push(address.postcode);
    const locality = address.village || address.city || address.town || address.municipality;
    if (locality) cityParts.push(locality);
    if (cityParts.length > 0) {
      parts.push(cityParts.join(' '));
    }

    // Part 3: state + county
    const regionParts = [];
    if (address.state) regionParts.push(address.state);
    if (address.county) regionParts.push(address.county);
    if (regionParts.length > 0) {
      parts.push(regionParts.join(' '));
    }

    return parts.join(', ');
  }

  async function searchAddress() {
    if (!searchQuery.trim()) return;

    isSearching = true;
    error = null;
    searchResults = [];
    showResults = false;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: 'json',
          addressdetails: '1',
          limit: '5'
        })
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      searchResults = results;
      showResults = results.length > 0;

      if (results.length === 0) {
        error = $t('createEvent.geocoder.noResults');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      error = $t('createEvent.geocoder.error');
    } finally {
      isSearching = false;
    }
  }

  function selectResult(result) {
    selectedResult = result;
    showResults = false;

    // Normalize the address using address components
    const normalizedAddress = normalizeAddress(result.address);

    updateMapMarker(parseFloat(result.lat), parseFloat(result.lon), normalizedAddress);

    // Extract city and country code (ISO alpha-2)
    const city = result.address?.city || result.address?.town || result.address?.village || '';
    const countryCode = result.address?.country_code?.toUpperCase() || '';

    // Emit the selected address data with normalized format
    dispatch('select', {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: normalizedAddress,
      city: city,
      country: countryCode // ISO alpha-2 code like "DE", "AT", etc.
    });
  }

  function updateMapMarker(lat, lon, displayName) {
    if (!L || !map) return;

    // Remove existing marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Create marker icon
    const markerTitle = displayName || get(t)('filters.mapMarkerLabel');
    const icon = L.divIcon({
      html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#E10600" style="width: 32px; height: 32px;" role="img" aria-label="${markerTitle}">
          <title>${markerTitle}</title>
          <path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" />
        </svg>
      `,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Add new marker
    marker = L.marker([lat, lon], { icon }).addTo(map);

    // Pan to location with higher zoom
    map.setView([lat, lon], 15);
  }

  function clearSelection() {
    selectedResult = null;
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    map.setView([51.1657, 10.4515], 5);
    dispatch('clear');
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAddress();
    }
  }

  // Close results when clicking outside
  function handleClickOutside(e) {
    if (showResults && !e.target.closest('.search-results-container')) {
      showResults = false;
    }
  }

  $: if (browser) {
    if (showResults) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }
</script>

<div class="space-y-3">
  <!-- Label -->
  {#if label}
    <label class="block text-sm text-black/60 dark:text-white/60">
      {label}
      {#if required}
        <span class="text-[#E10600] dark:text-red-400 ml-0.5">*</span>
      {/if}
    </label>
  {/if}

  <!-- Search Input -->
  <div class="relative search-results-container">
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={searchQuery}
        on:keydown={handleKeydown}
        placeholder={$t('createEvent.geocoder.placeholder')}
        class="flex-1 px-4 py-2.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-700 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-lg focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
      />
      <Button
        variant="light"
        on:click={searchAddress}
        disabled={isSearching || !searchQuery.trim()}
      >
        {#if isSearching}
          <Icon icon="svg-spinners:ring-resize" class="w-4 h-4" />
        {:else}
          <Icon icon="heroicons:magnifying-glass" class="w-4 h-4" />
        {/if}
        <span>{$t('createEvent.geocoder.search')}</span>
      </Button>
    </div>

    <!-- Search Results Dropdown -->
    {#if showResults && searchResults.length > 0}
      <div class="absolute z-10 w-full mt-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
        {#each searchResults as result}
          <button
            type="button"
            on:click={() => selectResult(result)}
            class="w-full px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors border-b border-stone-100 dark:border-stone-700 last:border-b-0"
          >
            <div class="flex items-start gap-2">
              <Icon icon="heroicons:map-pin" class="w-4 h-4 mt-0.5 text-black/60 dark:text-white/60 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-black dark:text-white">
                  {normalizeAddress(result.address)}
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg text-sm">
      <Icon icon="heroicons:exclamation-triangle" class="w-4 h-4 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
      <span class="text-red-700 dark:text-red-300">{error}</span>
    </div>
  {/if}

  <!-- Map Container -->
  {#if showMap}
    <div
      bind:this={mapContainer}
      class="h-64 dark:bg-black rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden"
      style="z-index: 1;"
    ></div>
  {/if}

  <!-- Selected Location Info -->
  {#if selectedResult}
    <div class="flex items-start justify-between p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 text-black/60 dark:text-white/60 mb-1">
          <Icon icon="heroicons:map-pin" class="w-4 h-4 flex-shrink-0" />
          <span class="font-medium">{$t('createEvent.geocoder.selected')}</span>
        </div>
        <div class="text-xs text-black dark:text-white break-words">
          {getNormalizedAddress(selectedResult)}
        </div>
        <div class="text-xs text-black/40 dark:text-white/40 font-mono mt-1">
          {parseFloat(selectedResult.lat).toFixed(6)}, {parseFloat(selectedResult.lon).toFixed(6)}
        </div>
      </div>
      <button
        type="button"
        on:click={clearSelection}
        class="flex items-center text-sm text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600] font-medium flex-shrink-0"
        aria-label={$t('createEvent.geocoder.clear')}
      >
        <Icon icon="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>
  {:else}
    <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm text-center text-black/60 dark:text-white/60">
      {$t('createEvent.geocoder.hint')}
    </div>
  {/if}
</div>

<style>
  @import 'leaflet/dist/leaflet.css';

  :global(.custom-map-marker) {
    background: transparent !important;
    border: none !important;
  }

  :global(.leaflet-container) {
    background-color: oklch(96.7% 0.003 264.542);
  }
</style>
