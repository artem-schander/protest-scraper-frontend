<script>
  import { fly, fade } from 'svelte/transition';
  import { notificationStore } from '$lib/stores/notification';
  import Icon from '$lib/components/common/Icon.svelte';

  $: notifications = $notificationStore;

  function getIcon(type) {
    switch (type) {
      case 'success':
        return 'heroicons:check-circle';
      case 'error':
        return 'heroicons:x-circle';
      case 'warning':
        return 'heroicons:exclamation-triangle';
      default:
        return 'heroicons:information-circle';
    }
  }

  function getColorClasses(type) {
    switch (type) {
      case 'success':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-amber-500 dark:text-amber-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  }
</script>

<!-- Notification Container -->
<div aria-live="assertive" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6" style="z-index: 9999;">
  <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
    {#each notifications as notification (notification.id)}
      <div
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-stone-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
        in:fly={{ y: -20, duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <Icon icon={getIcon(notification.type)} class="h-6 w-6 {getColorClasses(notification.type)}" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-black dark:text-white">
                {notification.title}
              </p>
              {#if notification.message}
                <p class="mt-1 text-sm text-black/60 dark:text-white/60">
                  {notification.message}
                </p>
              {/if}
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                on:click={() => notificationStore.remove(notification.id)}
                class="inline-flex rounded-md text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <span class="sr-only">Close</span>
                <Icon icon="heroicons:x-mark" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
