<script>
	import { onMount } from 'svelte';
	import Icon from '$lib/components/common/Icon.svelte';
	import { themeStore } from '$lib/stores/theme';

	let currentTheme = 'system';

	onMount(() => {
		themeStore.init();
		themeStore.subscribe(value => {
			currentTheme = value;
		});
	});

	function cycleTheme() {
		themeStore.toggle();
	}

	$: icon = currentTheme === 'light'
		? 'heroicons:sun'
		: currentTheme === 'dark'
			? 'heroicons:moon'
			: 'heroicons:computer-desktop';

	$: label = currentTheme === 'light'
		? 'Light mode'
		: currentTheme === 'dark'
			? 'Dark mode'
			: 'System theme';
</script>

<button
	on:click={cycleTheme}
	class="
		w-10 h-10 rounded-full
		bg-stone-100 dark:bg-stone-800
		hover:bg-stone-200 dark:hover:bg-stone-700
		flex items-center justify-center
		transition-colors
		group
	"
	aria-label={label}
	title={label}
>
	<Icon
		{icon}
		class="w-5 h-5 text-black dark:text-white transition-transform group-hover:scale-110"
	/>
</button>
