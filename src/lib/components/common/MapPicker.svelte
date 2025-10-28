<script>
import { onMount, onDestroy, createEventDispatcher } from 'svelte';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import Icon from '$lib/components/common/Icon.svelte';
import { t } from '$lib/i18n';
import { getProtests } from '$lib/utils/api.js';

  export let lat = null;
  export let lon = null;
  export let radius = 10; // km
  export let filters = {}; // All current filters from parent

  function normalizeRadius(value) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  let internalLat = lat !== null ? parseFloat(lat) : null;
  let internalLon = lon !== null ? parseFloat(lon) : null;
  let internalRadius = normalizeRadius(radius);

  const dispatch = createEventDispatcher();

  let map;
  let L;
  let marker;
  let circle;
  let mapContainer;
  let isLoading = false;
let locationErrorKey = null;
  let lightTileLayer;
  let darkTileLayer;
  let markerClusterGroup = null;
  let events = [];
  let goalZoom = null;
  let currentZoom = null;
  let zoomAnimationId = null;
  let isZooming = false;

  /**
   * Fetch all events matching current filters (excluding radius filter)
   * Fetches all pages to get complete event list for markers
   * Runs lazily without blocking the UI
   */
  async function fetchAndDisplayEvents() {
    if (!map || !L || !markerClusterGroup) {
      return;
    }

    // Run async without blocking
    setTimeout(async () => {
      try {
        // Build filter object excluding radius/location (we want all events, not just nearby)
        const eventFilters = {
          ...filters,
          limit: 100, // Fetch 100 per page
        };

        // Remove location filters to get all events
        delete eventFilters.lat;
        delete eventFilters.lon;
        delete eventFilters.radius;

        // Fetch first page to get total count
        const firstPage = await getProtests({ ...eventFilters, page: 1 });

        if (firstPage.error) {
          console.error('Failed to fetch events:', firstPage.error);
          return;
        }

        let allEvents = firstPage.protests || [];
        const total = firstPage.pagination?.total || 0;
        const totalPages = Math.ceil(total / 100);

        // Fetch remaining pages in parallel
        if (totalPages > 1) {
          const pagePromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(getProtests({ ...eventFilters, page }));
          }

          const remainingPages = await Promise.all(pagePromises);
          remainingPages.forEach(pageData => {
            if (pageData.protests) {
              allEvents = [...allEvents, ...pageData.protests];
            }
          });
        }

        events = allEvents;

        // Clear existing markers
        markerClusterGroup.clearLayers();

        // Add markers for events with coordinates
        let markerCount = 0;
        events.forEach(event => {
          if (event.coordinates?.lat && event.coordinates?.lon) {
            markerCount++;
            const eventLat = event.coordinates.lat;
            const eventLon = event.coordinates.lon;

            // Create marker with red circle icon
            const eventMarker = L.marker([eventLat, eventLon], {
              icon: L.divIcon({
                html: `
                  <div style="
                    width: 6px;
                    height: 6px;
                    background-color: #E10600;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
                  "></div>
                `,
                className: 'custom-event-marker',
                iconSize: [10, 10],
                iconAnchor: [5, 5],
                popupAnchor: [0, -5]
              })
            });

            // Format date for popup
            const startDate = new Date(event.start);
            const dateStr = startDate.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            // Create popup content
            const popupContent = `
              <div class="event-popup">
                <h3 style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">${event.title}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; opacity: 0.7;">${dateStr}</p>
                ${event.city ? `<p style="margin: 0; font-size: 12px; opacity: 0.7;">${event.city}</p>` : ''}
              </div>
            `;

            eventMarker.bindPopup(popupContent, {
              maxWidth: 200,
              className: 'custom-event-popup'
            });

            markerClusterGroup.addLayer(eventMarker);
          }
        });

        // Update map zoom based on smart zoom logic
        updateSmartZoom();

      } catch (error) {
        console.error('Error fetching events for markers:', error);
      }
    }, 0);
  }

  /**
   * Calculate smooth fractional zoom level that fits the radius circle
   */
  function calculateSmoothZoom(radiusKm, latitude) {
    // Get map container size
    const mapSize = map.getSize();
    const mapHeight = mapSize.y;

    // Add padding (30px on each side = 60px total)
    const availableHeight = mapHeight - 60;

    // Calculate meters per pixel needed to fit the circle
    const radiusMeters = radiusKm * 1000;
    const diameterMeters = radiusMeters * 2;
    const metersPerPixel = diameterMeters / availableHeight;

    // Web Mercator formula: resolution = (cos(lat) * 2 * π * R) / (256 * 2^zoom)
    // Where R = Earth radius = 6378137 meters
    const earthRadius = 6378137;
    const latRad = (latitude * Math.PI) / 180;
    const resolution = Math.cos(latRad) * 2 * Math.PI * earthRadius / 256;

    // Solve for zoom: zoom = log2(resolution / metersPerPixel)
    const zoom = Math.log2(resolution / metersPerPixel);

    // Clamp between min and max zoom
    return Math.max(5, Math.min(14, zoom));
  }

  /**
   * Animate zoom smoothly using requestAnimationFrame
   * Same technique as smooth wheel zoom plugin
   */
  function animateZoom() {
    if (!map || !isZooming) return;

    // Interpolate towards goal zoom (same as wheel zoom: 0.3 factor)
    const newZoom = currentZoom + (goalZoom - currentZoom) * 0.3;
    currentZoom = Math.floor(newZoom * 100) / 100;

    // Check if we're close enough to the goal
    if (Math.abs(goalZoom - currentZoom) < 0.01) {
      currentZoom = goalZoom;
      isZooming = false;
      cancelAnimationFrame(zoomAnimationId);
      map._moveEnd(true);
      return;
    }

    // Update map using internal _move method (like smooth wheel zoom)
    // Keep center at marker position
    const center = internalLat && internalLon ? L.latLng(internalLat, internalLon) : map.getCenter();
    map._move(center, currentZoom);

    // Continue animation
    zoomAnimationId = requestAnimationFrame(animateZoom);
  }

  /**
   * Start smooth zoom animation to target zoom level
   */
  function startSmoothZoom(targetZoom) {
    if (!map) return;

    // Stop any existing animation
    if (isZooming) {
      cancelAnimationFrame(zoomAnimationId);
    }

    goalZoom = Math.max(5, Math.min(14, targetZoom));
    currentZoom = map.getZoom();
    isZooming = true;

    // Start animation like wheel zoom does
    if (!map._zooming) {
      map._moveStart(true, false);
    }

    animateZoom();
  }

  /**
   * Smart zoom: fit all markers UNLESS radius filter is active
   * Uses smooth animation like wheel zoom plugin
   */
  function updateSmartZoom() {
    if (!map || !L) return;

    const hasRadiusFilter = internalLat != null && internalLon != null;

    if (hasRadiusFilter) {
      // Calculate smooth fractional zoom for radius circle
      const zoom = calculateSmoothZoom(internalRadius, internalLat);
      startSmoothZoom(zoom);
    } else if (markerClusterGroup && markerClusterGroup.getLayers().length > 0) {
      // Fit bounds to all markers with padding
      const bounds = markerClusterGroup.getBounds();
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  onMount(async () => {
    if (!browser) return;

    // Dynamically import Leaflet and markercluster (client-side only)
    const leafletModule = await import('leaflet');
    L = leafletModule.default || leafletModule;

    // Import smooth wheel zoom - must be before map creation
    await import('@luomus/leaflet-smooth-wheel-zoom');

    // Import markercluster - it adds to L automatically
    await import('leaflet.markercluster');

    // Initialize map centered on Berlin (default)
    const defaultLat = lat ? parseFloat(lat) : 52.52;
    const defaultLon = lon ? parseFloat(lon) : 13.4;

    map = L.map(mapContainer, {
      zoomControl: false, // Remove +/- zoom buttons
      attributionControl: false, // Remove attribution
      maxBounds: [[-90, -180], [90, 180]], // Restrict panning to world bounds
      maxBoundsViscosity: 1.0, // Make bounds completely solid (no bouncing back)
      scrollWheelZoom: false, // Disable default zoom
      smoothWheelZoom: true, // Enable smooth zoom like Google Maps
      smoothSensitivity: 10, // Sensitivity (1 = default, higher = slower)
      zoomSnap: 0, // Allow fractional zoom levels (0 = continuous)
      zoomDelta: 0.1 // Small steps for smoother transitions
    }).setView([defaultLat, defaultLon], 10);

    // Create light and dark tile layers with fade animation
    lightTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
      fadeAnimation: true,
      keepBuffer: 2 // Keep 2 zoom levels of tiles in memory to reduce reloading
    });

    darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO',
      fadeAnimation: true,
      keepBuffer: 2 // Keep 2 zoom levels of tiles in memory to reduce reloading
    });

    // Add the initial tile layer based on current theme
    updateTileLayer();

    // Initialize marker cluster group
    markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 80,
    });
    map.addLayer(markerClusterGroup);

    // If we have initial coordinates, add marker and circle
    if (lat != null && lon != null) {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
        updateMapMarker(latNum, lonNum);
      }
    }

    // Fetch and display event markers
    await fetchAndDisplayEvents();

    // Click event to place marker
    map.on('click', (e) => {
      const { lat: clickLat, lng: clickLon } = e.latlng;
      updateMapMarker(clickLat, clickLon, false);
      emitChange(clickLat, clickLon, radius);
    });
  });

  onDestroy(() => {
    // Stop any ongoing zoom animation
    if (zoomAnimationId) {
      cancelAnimationFrame(zoomAnimationId);
      isZooming = false;
    }

    if (map) {
      map.remove();
    }
  });

  function updateMapMarker(newLat, newLon, shouldUpdateZoom = true) {
    if (!L || !map) return;

    internalLat = newLat;
    internalLon = newLon;

    // Remove existing marker and circle
    if (marker) map.removeLayer(marker);
    if (circle) map.removeLayer(circle);

    // Create a custom icon using heroicons map-pin
  const markerTitle = get(t)('filters.mapMarkerLabel');
  const icon = L.divIcon({
      // html: `
      //  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E10600" style="width: 32px; height: 32px;">
      //    <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
      //  </svg>
      // `,
      // html: `
      //  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E10600" style="width: 32px; height: 32px;">
      //      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      //      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      //  </svg>
      // `,
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
    marker = L.marker([newLat, newLon], { icon }).addTo(map);

    // Add circle showing search radius (hidden by default, only for zoom calculation)
    const effectiveRadius = normalizeRadius(radius);

    circle = L.circle([newLat, newLon], {
      color: '#E10600',
      opacity: 0,
      fillColor: '#E10600',
      fillOpacity: 0,
      radius: effectiveRadius * 1000 // Convert km to meters
    }).addTo(map);

    // Pan to new location with appropriate zoom
    if (shouldUpdateZoom) {
      updateSmartZoom();
    }

    // Update component state
    if (lat !== newLat) lat = newLat;
    if (lon !== newLon) lon = newLon;
    internalRadius = effectiveRadius;
  }

  function clearMapMarker() {
    if (!map) return;
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    if (circle) {
      map.removeLayer(circle);
      circle = null;
    }
  }

  function handleRadiusChange(event) {
    radius = parseInt(event.target.value);

    internalRadius = normalizeRadius(radius);

    // Update circle radius if it exists
    if (circle) {
      circle.setRadius(radius * 1000);
    }

    // Update zoom level based on new radius - smooth zoom to fit circle
    if (lat && lon && map && circle) {
      updateSmartZoom();
    }

    // Emit change if we have coordinates
    if (lat && lon) {
      emitChange(lat, lon, radius);
    }
  }

  async function useMyLocation() {
  if (!navigator.geolocation) {
    locationErrorKey = 'filters.locationError.unsupported';
    return;
  }

  isLoading = true;
  locationErrorKey = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Set radius to 30km for "my location"
        radius = 30;
        internalRadius = 30;

        updateMapMarker(userLat, userLon);
        emitChange(userLat, userLon, radius);

        isLoading = false;
      },
      (error) => {
        isLoading = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
      locationErrorKey = 'filters.locationError.denied';
      break;
    case error.POSITION_UNAVAILABLE:
      locationErrorKey = 'filters.locationError.unavailable';
      break;
    case error.TIMEOUT:
      locationErrorKey = 'filters.locationError.timeout';
      break;
    default:
      locationErrorKey = 'filters.locationError.unknown';
    }
  }
  );
}

function clearLocation() {
  clearMapMarker();
  internalLat = null;
  internalLon = null;
  lat = null;
  lon = null;
  locationErrorKey = null;

  emitChange(null, null, radius);
}

  function emitChange(newLat, newLon, newRadius) {
    dispatch('change', {
      lat: newLat,
      lon: newLon,
      radius: newRadius
    });
  }

  function updateTileLayer() {
    if (!map || !lightTileLayer || !darkTileLayer) return;

    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains('dark');

    // Remove both layers first
    if (map.hasLayer(lightTileLayer)) {
      map.removeLayer(lightTileLayer);
    }
    if (map.hasLayer(darkTileLayer)) {
      map.removeLayer(darkTileLayer);
    }

    // Add the appropriate layer
    if (isDark) {
      darkTileLayer.addTo(map);
    } else {
      lightTileLayer.addTo(map);
    }
  }

  // Update marker when lat/lon change externally
  $: if (map && L) {
    if (lat != null && lon != null) {
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lonNum = typeof lon === 'string' ? parseFloat(lon) : lon;
      if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
        const hadExistingMarker = internalLat != null && internalLon != null;
        if (internalLat !== latNum || internalLon !== lonNum || !hadExistingMarker) {
          updateMapMarker(latNum, lonNum, !hadExistingMarker);
        }
      }
    } else if (internalLat != null || internalLon != null) {
      clearMapMarker();
      internalLat = null;
      internalLon = null;
    }
  }

  // Update circle when radius changes externally
  $: if (circle && map) {
    const normalized = normalizeRadius(radius);
    if (normalized !== internalRadius) {
      internalRadius = normalized;
      circle.setRadius(normalized * 1000);
      if (internalLat != null && internalLon != null) {
        updateSmartZoom();
      }
    }
  }

  // Watch for theme changes and update tile layer
  $: if (browser && map) {
    // Set up a MutationObserver to watch for dark class changes
    const observer = new MutationObserver(() => {
      updateTileLayer();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Clean up observer on component destroy
    onDestroy(() => {
      observer.disconnect();
    });
  }

  // Refetch events when filters change
  $: if (browser && map && markerClusterGroup) {
    fetchAndDisplayEvents();
  }
</script>

<div class="space-y-3">
  <!-- Controls -->
  <div class="flex items-center gap-2">
    <button
      type="button"
      on:click={useMyLocation}
      disabled={isLoading}
      class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
    >
      {#if isLoading}
        <Icon icon="svg-spinners:ring-resize" class="w-3.5 h-3.5" />
        <span>{$t('filters.gettingLocation')}</span>
      {:else}
        <Icon icon="heroicons:map-pin" class="w-3.5 h-3.5" />
        <span>{$t('filters.useLocation')}</span>
      {/if}
    </button>

    <!-- {#if lat && lon} -->
    <!--  <button -->
    <!--    type="button" -->
    <!--    on:click={clearLocation} -->
    <!--    class="flex items-center px-2 h-[34px] rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors" -->
    <!--    aria-label={$t('filters.clearLocation')} -->
    <!--  > -->
    <!--    <Icon icon="heroicons:x-mark" class="w-4 h-4" /> -->
    <!--  </button> -->
    <!-- {/if} -->
  </div>

  <!-- Error message -->
  {#if locationErrorKey}
    <div class="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
      <Icon icon="heroicons:exclamation-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{$t(locationErrorKey)}</span>
    </div>
  {/if}

  <!-- Map Container -->
  <div
    bind:this={mapContainer}
    class="h-58 dark:bg-black rounded-lg border-1 border-stone-200 dark:border-stone-700 overflow-hidden"
    style="z-index: 1;"
  ></div>

  <!-- Radius Slider -->
  <div class="space-y-2">
    <div class="flex items-center justify-between text-sm">
      <label for="radius-slider" class="font-medium text-black dark:text-white">
        {$t('filters.radiusLabel')}
      </label>
      <span class="text-black/60 dark:text-white/60">
        {$t('filters.radiusValue', { values: { value: radius } })}
      </span>
    </div>
    <input
      id="radius-slider"
      type="range"
      min="1"
      max="100"
      step="1"
      bind:value={radius}
      on:input={handleRadiusChange}
      class="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
    />
    <div class="flex justify-between text-xs text-black/40 dark:text-white/40">
      <span>{$t('filters.radiusMin')}</span>
      <span>{$t('filters.radiusMax')}</span>
    </div>
  </div>

  <!-- Selected Location Info -->
  {#if lat && lon}
    <div class="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm">
      <div class="text-sm space-y-1">
        <div class="flex items-center gap-2 text-black/60 dark:text-white/60">
          <Icon icon="heroicons:map-pin" class="w-4 h-4" />
          <span class="font-medium">{$t('filters.selectedLocation')}</span>
        </div>
        <div class="text-xs text-black/40 dark:text-white/40 font-mono">
          {lat.toFixed(6)}, {lon.toFixed(6)}
        </div>
      </div>
      <button
        type="button"
        on:click={clearLocation}
        class="flex itens-center text-sm text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600] font-medium"
        aria-label={$t('filters.clearLocation')}
      >
        <!-- {$t('filters.clear')} -->
        <Icon icon="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>
  {:else}
    <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded-lg text-sm text-center text-black/60 dark:text-white/60">
      {$t('filters.mapHint')}
    </div>
  {/if}
</div>

<style>
  /* Import Leaflet CSS */
  @import 'leaflet/dist/leaflet.css';
  @import 'leaflet.markercluster/dist/MarkerCluster.css';
  @import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

  /* Custom marker styling */
  :global(.custom-map-marker) {
    background: transparent !important;
    border: none !important;
    &:before {
      content: '';
      box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.8);
      position: absolute;
      bottom: 0;
      width: 10px;
      height: 2;
      left: calc(50% - 5px);
    }
  }

  :global(.custom-event-marker) {
    background: transparent !important;
    border: none !important;
  }

  /* Custom popup styling */
  :global(.custom-event-popup .leaflet-popup-content-wrapper) {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  :global(.custom-event-popup .leaflet-popup-content) {
    margin: 12px;
  }

  :global(.custom-event-popup .leaflet-popup-tip) {
    background-color: white;
  }

  /* Dark mode popup styling */
  :global(.dark .custom-event-popup .leaflet-popup-content-wrapper) {
    background-color: rgb(41 37 36); /* stone-800 */
    color: white;
  }

  :global(.dark .custom-event-popup .leaflet-popup-tip) {
    background-color: rgb(41 37 36); /* stone-800 */
  }

  /* Map background - light mode */
  :global(.leaflet-container) {
    background-color: #e5e7eb; /* stone-200 equivalent */
  }

  /* Map background - dark mode */
  :global(.dark .leaflet-container) {
    background-color: #1c1917; /* stone-900 */
  }
</style>
