<script>
import { onMount, onDestroy, createEventDispatcher } from 'svelte';
import { browser } from '$app/environment';
import { get } from 'svelte/store';
import Icon from '$lib/components/common/Icon.svelte';
import { t } from '$lib/i18n';

	export let lat = null;
	export let lon = null;
	export let radius = 10; // km

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

	onMount(async () => {
		if (!browser) return;

		// Dynamically import Leaflet (client-side only)
		L = await import('leaflet');

		// Initialize map centered on Berlin (default)
		const defaultLat = lat || 52.52;
		const defaultLon = lon || 13.40;

		map = L.map(mapContainer, {
			zoomControl: false, // Remove +/- zoom buttons
			attributionControl: false, // Remove attribution
			wheelPxPerZoomLevel: 120,
		}).setView([defaultLat, defaultLon], 10);

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

		// If we have initial coordinates, add marker and circle
		if (lat && lon) {
			updateMapMarker(lat, lon);
		}

		// Click event to place marker
		map.on('click', (e) => {
			const { lat: clickLat, lng: clickLon } = e.latlng;
			updateMapMarker(clickLat, clickLon, false);
			emitChange(clickLat, clickLon, radius);
		});
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function calculateZoomLevel(
  	radiusKm,
  	latitude = 0,
  	viewportPx = 230,
  	paddingFraction = 0.75,
  	tileSize = 256,
  	minZoom = 5,
  	maxZoom = 14
	) {
  	const R = 6378137; // meters (WGS84)
  	const diameterM = 2 * radiusKm * 1000;
  	const targetM = diameterM * (1 + paddingFraction);

  	// meters/pixel we need so the target diameter fits in the viewport
  	const requiredMetersPerPixel = targetM / Math.max(1, viewportPx);

  	// Web Mercator ground resolution: m/px = cos(lat) * 2πR / (tileSize * 2^z)
  	// Solve for z:
  	const latFactor = Math.max(1e-6, Math.cos((latitude * Math.PI) / 180)); // avoid poles -> 0
  	const numerator = 2 * Math.PI * R * latFactor;

  	const z = Math.log2(numerator / (tileSize * requiredMetersPerPixel));

  	// Use floor to guarantee the circle fits (rounding up could crop it)
  	const fitted = Math.floor(z);

  	return Math.min(maxZoom, Math.max(minZoom, fitted));
	}

	function updateMapMarker(newLat, newLon, shouldUpdateZoom = true) {
		if (!L || !map) return;

		// Remove existing marker and circle
		if (marker) map.removeLayer(marker);
		if (circle) map.removeLayer(circle);

		// Create a custom icon using heroicons map-pin
	const markerTitle = get(t)('filters.mapMarkerLabel');
	const icon = L.divIcon({
			// html: `
			// 	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E10600" style="width: 32px; height: 32px;">
			// 		<path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
			// 	</svg>
			// `,
			// html: `
			// 	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#E10600" style="width: 32px; height: 32px;">
			// 			<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
			// 			<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
			// 	</svg>
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

		// Add circle showing search radius
		circle = L.circle([newLat, newLon], {
			color: '#E10600',
			opacity: 0.1,
			fillColor: '#E10600',
			fillOpacity: 0.1,
			radius: radius * 1000 // Convert km to meters
		}).addTo(map);

		// Pan to new location with appropriate zoom
		if (shouldUpdateZoom) {
			const zoom = calculateZoomLevel(radius, newLat);
			map.setView([newLat, newLon], zoom);
		}

		// Update component state
		lat = newLat;
		lon = newLon;
	}

	function handleRadiusChange(event) {
		radius = parseInt(event.target.value);

		// Update circle radius if it exists
		if (circle) {
			circle.setRadius(radius * 1000);
		}

		// Update zoom level based on new radius
		if (lat && lon && map) {
			const zoom = calculateZoomLevel(radius);
			map.setView([lat, lon], zoom, { animate: true });
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
	if (marker) map.removeLayer(marker);
	if (circle) map.removeLayer(circle);

	marker = null;
	circle = null;
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

	// Update circle when lat/lon/radius change externally
	$: if (lat && lon && map && L) {
		updateMapMarker(lat, lon, false);
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
		<!-- 	<button -->
		<!-- 		type="button" -->
		<!-- 		on:click={clearLocation} -->
		<!-- 		class="flex items-center px-2 h-[34px] rounded-lg border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors" -->
		<!-- 		aria-label={$t('filters.clearLocation')} -->
		<!-- 	> -->
		<!-- 		<Icon icon="heroicons:x-mark" class="w-4 h-4" /> -->
		<!-- 	</button> -->
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
		class="h-64 dark:bg-black rounded-lg border-1 border-stone-200 dark:border-stone-700 overflow-hidden"
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

	:global(.leaflet-container) {
		background-color: oklch(96.7% 0.003 264.542);
	}
</style>
