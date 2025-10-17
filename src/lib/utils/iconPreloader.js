import { loadIcons } from '@iconify/svelte';

/**
 * Preload all icons used in the application to prevent layout shift
 * This should be called once during app initialization
 */
export async function preloadIcons() {
	// List of all icons used in the application
	const icons = [
		'heroicons:arrow-left',
		'heroicons:arrow-path',
		'heroicons:arrow-right',
		'heroicons:arrow-top-right-on-square',
		'heroicons:arrows-right-left',
		'heroicons:bars-3',
		'heroicons:building-office',
		'heroicons:calendar-days',
		'heroicons:calendar',
		'heroicons:chart-bar',
		'heroicons:check-circle',
		'heroicons:check',
		'heroicons:chevron-left',
		'heroicons:chevron-right',
		'heroicons:clock',
		'heroicons:code-bracket',
		'heroicons:adjustments-horizontal',
		'heroicons:document-text',
		'heroicons:envelope',
		'heroicons:exclamation-circle',
		'heroicons:exclamation-triangle',
		'heroicons:funnel',
		'heroicons:globe-alt',
		'heroicons:identification',
		'heroicons:information-circle',
		'heroicons:link',
		'heroicons:lock-closed',
		'heroicons:magnifying-glass',
		'heroicons:map-pin',
		'heroicons:map',
		'heroicons:megaphone',
		'heroicons:moon',
		'heroicons:plus',
		'heroicons:scale',
		'heroicons:share',
		'heroicons:shield-check',
		'heroicons:shield-exclamation',
		'heroicons:sun',
		'heroicons:user-circle',
		'heroicons:user-group',
		'heroicons:user',
		'heroicons:users',
		'heroicons:x-mark',
		'svg-spinners:ring-resize'
	];

	try {
		// loadIcons returns a promise that resolves when all icons are loaded
		await loadIcons(icons);
		console.log('✓ Icons preloaded successfully');
	} catch (error) {
		console.warn('Icon preloading failed, icons will load on demand:', error);
	}
}
