<script>
	export let type = 'card'; // card, list, text
</script>

{#if type === 'card'}
	<div class="rounded-xl bg-white border border-gray-200 p-4 space-y-4 animate-pulse">
		<div class="flex items-start justify-between">
			<div class="w-16 h-16 bg-gray-200 rounded-lg animate-shimmer"></div>
			<div class="w-20 h-6 bg-gray-200 rounded-full animate-shimmer"></div>
		</div>

		<div class="space-y-2 mt-4">
			<div class="h-5 bg-gray-200 rounded animate-shimmer"></div>
			<div class="h-4 bg-gray-200 rounded w-3/4 animate-shimmer"></div>
		</div>

		<div class="flex gap-2">
			<div class="h-6 w-16 bg-gray-200 rounded-full animate-shimmer"></div>
			<div class="h-6 w-16 bg-gray-200 rounded-full animate-shimmer"></div>
			<div class="h-6 w-16 bg-gray-200 rounded-full animate-shimmer"></div>
		</div>

		<div class="flex items-center justify-between pt-3 border-t border-gray-100">
			<div class="h-4 w-24 bg-gray-200 rounded animate-shimmer"></div>
			<div class="h-4 w-16 bg-gray-200 rounded animate-shimmer"></div>
		</div>
	</div>
{:else if type === 'list'}
	<div class="space-y-3">
		{#each Array(5) as _}
			<div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 animate-pulse">
				<div class="w-12 h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
				<div class="flex-1 space-y-2">
					<div class="h-4 bg-gray-200 rounded w-3/4 animate-shimmer"></div>
					<div class="h-3 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="space-y-2 animate-pulse">
		<div class="h-4 bg-gray-200 rounded animate-shimmer"></div>
		<div class="h-4 bg-gray-200 rounded w-5/6 animate-shimmer"></div>
		<div class="h-4 bg-gray-200 rounded w-4/6 animate-shimmer"></div>
	</div>
{/if}
