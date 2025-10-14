<script>
	import { createEventDispatcher } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import Input from '$lib/components/common/Input.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import DateRangePicker from '$lib/components/common/DateRangePicker.svelte';
	import MapPicker from '$lib/components/common/MapPicker.svelte';

	export let filters = {};
	export let showMobileFilters = false;

	const dispatch = createEventDispatcher();

	// Filter state
	let startDate = null;
	let endDate = null;
	let dateMode = 'day';
	let city = filters.city || '';
	let lat = filters.lat ? parseFloat(filters.lat) : null;
	let lon = filters.lon ? parseFloat(filters.lon) : null;
	let radius = filters.radius ? parseInt(filters.radius) : 10;

	// Initialize dates from URL params
	function parseDateFromAPI(dateStr) {
		if (!dateStr) return null;
		const [year, month, day] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, day);
	}

	// Set initial dates from filters
	if (filters.startDate) {
		startDate = parseDateFromAPI(filters.startDate);
	}
	if (filters.endDate) {
		endDate = parseDateFromAPI(filters.endDate);
	}

	function formatDateForAPI(date) {
		if (!date) return null;
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}

	function handleDateChange(event) {
		startDate = event.detail.startDate;
		endDate = event.detail.endDate;
		dateMode = event.detail.mode;
	}

	function handleMapChange(event) {
		lat = event.detail.lat;
		lon = event.detail.lon;
		radius = event.detail.radius;
	}

	async function applyFilters() {
		const url = new URL(window.location.href);

		// Clear existing params
		url.searchParams.delete('days');
		url.searchParams.delete('startDate');
		url.searchParams.delete('endDate');
		url.searchParams.delete('city');
		url.searchParams.delete('lat');
		url.searchParams.delete('lon');
		url.searchParams.delete('radius');
		url.searchParams.delete('page'); // Reset to page 1 when filters change

		// Add date params
		if (startDate) {
			url.searchParams.set('startDate', formatDateForAPI(startDate));
		}
		if (endDate) {
			url.searchParams.set('endDate', formatDateForAPI(endDate));
		}

		// Add city param
		if (city) url.searchParams.set('city', city);

		// Add geolocation params
		if (lat && lon) {
			url.searchParams.set('lat', lat.toString());
			url.searchParams.set('lon', lon.toString());
			url.searchParams.set('radius', radius.toString());
		}

		// Navigate and invalidate the load function
		await goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
		await invalidate(() => true); // Invalidate all load functions
		dispatch('close');

		// Smooth scroll to top of event list
		if (typeof window !== 'undefined') {
			const eventList = document.querySelector('main');
			if (eventList) {
				eventList.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
	}

	async function resetFilters() {
		startDate = null;
		endDate = null;
		dateMode = 'day';
		city = '';
		lat = null;
		lon = null;
		radius = 10;
		await goto('/', { replaceState: false, keepFocus: true, noScroll: true });
		await invalidate(() => true);
		dispatch('close');
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) {
			dispatch('close');
		}
	}
</script>

<!-- Desktop Sidebar -->
<aside class="hidden lg:block sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto">
	<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-medium text-black dark:text-white">Filters</h2>
			<button
				on:click={resetFilters}
				class="text-sm text-[#E10600] hover:text-[#C10500] dark:text-[#FF4081] dark:hover:text-[#E10600] font-medium"
			>
				Reset
			</button>
		</div>

		<!-- Date Range -->
		<div>
			<label class="block text-sm font-medium text-black dark:text-white mb-3">
				<Icon icon="heroicons:calendar-days" class="inline w-4 h-4 mr-1" />
				Date Range
			</label>
			<DateRangePicker
				bind:startDate
				bind:endDate
				bind:mode={dateMode}
				on:change={handleDateChange}
			/>
		</div>

		<!-- Map Location Picker -->
		<div>
			<label class="block text-sm font-medium text-black dark:text-white mb-3">
				<Icon icon="heroicons:map" class="inline w-4 h-4 mr-1" />
				Location
			</label>
			<MapPicker
				bind:lat
				bind:lon
				bind:radius
				on:change={handleMapChange}
			/>
		</div>

		<!-- Apply Button -->
		<Button variant="primary" fullWidth on:click={applyFilters}>
			Apply Filters
		</Button>
	</div>
</aside>

<!-- Mobile Drawer -->
{#if showMobileFilters}
	<!-- Backdrop -->
	<div
		class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
		on:click={handleBackdropClick}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Escape' && dispatch('close')}
		transition:fade={{ duration: 200 }}
	>
		<!-- Drawer -->
		<div
			class="fixed inset-x-0 bottom-0 max-h-[80vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl overflow-y-auto"
			on:click|stopPropagation
			role="dialog"
			aria-modal="true"
			transition:fly={{ y: 500, duration: 300 }}
		>
			<div class="p-6 space-y-6">
				<!-- Header -->
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-black dark:text-white">Filters</h2>
					<div class="flex items-center gap-2">
						<button
							on:click={resetFilters}
							class="text-sm text-[#E10600] hover:text-[#C10500] dark:text-[#FF4081] dark:hover:text-[#E10600] font-medium"
						>
							Reset
						</button>
						<button
							on:click={() => dispatch('close')}
							class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
							aria-label="Close filters"
						>
							<Icon icon="heroicons:x-mark" class="w-5 h-5 text-black dark:text-white" />
						</button>
					</div>
				</div>

				<!-- Date Range -->
				<div>
					<label class="block text-sm font-medium text-black dark:text-white mb-3">
						<Icon icon="heroicons:calendar-days" class="inline w-4 h-4 mr-1" />
						Date Range
					</label>
					<DateRangePicker
						bind:startDate
						bind:endDate
						bind:mode={dateMode}
						on:change={handleDateChange}
					/>
				</div>

				<!-- Map Location Picker -->
				<div>
					<label class="block text-sm font-medium text-black dark:text-white mb-3">
						<Icon icon="heroicons:map" class="inline w-4 h-4 mr-1" />
						Location
					</label>
					<MapPicker
						bind:lat
						bind:lon
						bind:radius
						on:change={handleMapChange}
					/>
				</div>

				<!-- Apply Button -->
				<Button variant="primary" fullWidth on:click={applyFilters}>
					Apply Filters
				</Button>
			</div>
		</div>
	</div>
{/if}
