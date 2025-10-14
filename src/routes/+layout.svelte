<script>
	import { onMount } from 'svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import { themeStore } from '$lib/stores/theme';

	onMount(() => {
		themeStore.init();
	});
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
	<Header />
	<slot />
</div>
