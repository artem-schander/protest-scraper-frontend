<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Icon from '$lib/components/common/Icon.svelte';

  export let isOpen = false;
  export let title = '';
  export let maxWidth = 'md'; // sm, md, lg, xl

  const dispatch = createEventDispatcher();

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  function close() {
    dispatch('close');
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click={handleBackdropClick}
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal -->
    <div
      class="w-full {maxWidths[maxWidth]} bg-white rounded-2xl shadow-2xl overflow-hidden"
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Header -->
      {#if title}
        <div class="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 class="text-xl font-medium text-black">
            {title}
          </h2>
          <button
            on:click={close}
            class="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <Icon icon="heroicons:x-mark" class="w-5 h-5 text-black/60" />
          </button>
        </div>
      {/if}

      <!-- Content -->
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
{/if}
