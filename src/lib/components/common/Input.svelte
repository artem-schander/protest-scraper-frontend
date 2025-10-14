<script>
	export let label = '';
	export let type = 'text';
	export let placeholder = '';
	export let value = '';
	export let error = '';
	export let helper = '';
	export let required = false;
	export let disabled = false;
	export let icon = '';

	import Icon from '@iconify/svelte';
</script>

<div class="w-full">
	{#if label}
		<label class="block text-sm text-black/60 dark:text-white/60 mb-2">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative">
		{#if icon}
			<div class="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
				<Icon icon={icon} class="w-5 h-5" />
			</div>
		{/if}

		{#if type === 'textarea'}
			<textarea
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				rows="4"
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
					resize-y
				"
			/>
		{:else if type === 'text'}
			<input
				type="text"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'email'}
			<input
				type="email"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'password'}
			<input
				type="password"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'number'}
			<input
				type="number"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'url'}
			<input
				type="url"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'tel'}
			<input
				type="tel"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'date'}
			<input
				type="date"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'time'}
			<input
				type="time"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else if type === 'datetime-local'}
			<input
				type="datetime-local"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{:else}
			<!-- Fallback for any other type -->
			<input
				type="text"
				{placeholder}
				{required}
				{disabled}
				bind:value
				on:input
				on:blur
				on:focus
				class="
					w-full px-4 py-3
					{icon ? 'pl-12' : ''}
					border rounded-xl
					{error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10'}
					bg-white dark:bg-gray-800 text-black dark:text-white
					placeholder:text-black/40 dark:placeholder:text-white/40
					focus:outline-none focus:ring-2
					transition-all
					disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
				"
			/>
		{/if}
	</div>

	{#if error}
		<p class="mt-1 text-xs text-red-500 flex items-center gap-1">
			<span>⚠</span>
			{error}
		</p>
	{:else if helper}
		<p class="mt-1 text-xs text-black/40 dark:text-white/40">
			{helper}
		</p>
	{/if}
</div>
