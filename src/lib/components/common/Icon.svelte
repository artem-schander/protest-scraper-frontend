<script>
	import IconifyIcon from '@iconify/svelte';

	export let icon;
	export let width = undefined;
	export let height = undefined;

	// Extract size from Tailwind classes if width/height not provided
	let size = width || height;
	if (!size && $$restProps.class) {
		const match = $$restProps.class.match(/w-(\d+)/);
		if (match) {
			// Convert Tailwind units to pixels (1 unit = 0.25rem = 4px)
			size = parseFloat(match[1]) * 4;
		}
	}
</script>

<span class="inline-flex items-center justify-center" style={size ? `width: ${size}px; height: ${size}px;` : ''}>
	<IconifyIcon {icon} {width} {height} ssr {...$$restProps} />
</span>
