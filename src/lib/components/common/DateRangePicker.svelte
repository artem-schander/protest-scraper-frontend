<script>
	import { createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';

	export let startDate = null;
	export let endDate = null;
	export let mode = 'day'; // 'day', 'week', 'month', 'range'

	const dispatch = createEventDispatcher();

	// Initialize currentMonth based on startDate if it exists, otherwise use current month
	let currentMonth = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), 1) : new Date();
	let hoverDate = null;
	let userNavigatedMonth = false;

	// Update currentMonth when startDate changes (e.g., from URL params), but only if user hasn't manually navigated
	$: if (startDate && !userNavigatedMonth && currentMonth.getMonth() !== startDate.getMonth()) {
		currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
	}

	const modes = [
		{ id: 'day', label: 'Day', icon: 'heroicons:calendar' },
		{ id: 'week', label: 'Week', icon: 'heroicons:calendar-days' },
		{ id: 'month', label: 'Month', icon: 'heroicons:calendar' },
		{ id: 'range', label: 'Custom', icon: 'heroicons:arrows-right-left' }
	];

	$: monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
	$: monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
	$: daysInMonth = monthEnd.getDate();
	$: firstDayOfWeek = monthStart.getDay();
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
	<div class="grid grid-cols-4 gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
		{#each modes as modeOption}
			<button
				type="button"
				on:click={() => handleModeChange(modeOption.id)}
				class="flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-md text-xs font-medium transition-all
					{mode === modeOption.id
						? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
						: 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'}"
			>
				<Icon icon={modeOption.icon} class="w-4 h-4" />
				<span class="text-[10px]">{modeOption.label}</span>
			</button>
		{/each}
	</div>

	<!-- Calendar -->
	<div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
		<!-- Month Navigation -->
		<div class="flex items-center justify-between mb-4">
			<button
				type="button"
				on:click={previousMonth}
				class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
			>
				<Icon icon="heroicons:chevron-left" class="w-5 h-5 text-black dark:text-white" />
			</button>
			<span class="font-medium text-black dark:text-white">
				{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
			</span>
			<button
				type="button"
				on:click={nextMonth}
				class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
			>
				<Icon icon="heroicons:chevron-right" class="w-5 h-5 text-black dark:text-white" />
			</button>
		</div>

		<!-- Weekday Headers -->
		<div class="grid grid-cols-7 mb-2">
			{#each ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as day}
				<div class="text-center text-xs font-medium text-black/60 dark:text-white/60 py-2">
					{day}
				</div>
			{/each}
		</div>

		<!-- Calendar Days -->
		<div class="grid grid-cols-7 gap-1">
			<!-- Empty cells for days before month starts -->
			{#each Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1) as _}
				<div class="aspect-square"></div>
			{/each}

			<!-- Days of the month -->
			{#each Array(daysInMonth) as _, i}
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
								? 'bg-[#E10600]/20 dark:bg-[#FF4081]/20 text-black dark:text-white'
								: isToday
									? 'bg-black dark:bg-white text-white dark:text-black font-bold'
									: isPast
										? 'text-black/20 dark:text-white/20 cursor-not-allowed'
										: 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}"
				>
					{day}
				</button>
			{/each}
		</div>
	</div>

	<!-- Selected Range Display -->
	{#if startDate}
		<div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
			<div class="text-sm">
				<span class="text-black/60 dark:text-white/60">Selected: </span>
				<span class="font-medium text-black dark:text-white">
					<span class="whitespace-nowrap">
						{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</span>
					{#if endDate && !isSameDay(startDate, endDate)}
						<span class="whitespace-nowrap">
							→ {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
						</span>
					{/if}
				</span>
			</div>
			<button
				type="button"
				on:click={clearDates}
				class="text-sm text-[#E10600] dark:text-[#FF4081] hover:text-[#C10500] dark:hover:text-[#E10600] font-medium"
			>
				Clear
			</button>
		</div>
	{/if}
</div>
