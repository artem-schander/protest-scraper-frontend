<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { notificationStore } from '$lib/stores/notification';
  import { getProtests, updateProtest, deleteProtest } from '$lib/utils/api';
  import { t } from '$lib/i18n';
  import { formatDate, formatTime } from '$lib/utils/dateFormat';
  import Icon from '$lib/components/common/Icon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { pendingModerationStore } from '$lib/stores/moderation';

  let pendingEvents = [];
  let isLoading = true;
  let processingIds = new Set();

  onMount(async () => {
    // Check authentication and role (only on client-side)
    if (!$authStore.isAuthenticated) {
      goto('/');
      return;
    }

    if ($authStore.user?.role !== 'MODERATOR' && $authStore.user?.role !== 'ADMIN') {
      notificationStore.add({
        type: 'error',
        title: $t('moderate.accessDenied'),
        message: $t('moderate.accessDeniedMessage'),
        duration: 5000
      });
      goto('/');
      return;
    }

    await loadPendingEvents();
  });

  async function loadPendingEvents() {
    isLoading = true;
    const response = await getProtests({ verified: 'false', limit: 100 });

    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: $t('moderate.loadError'),
        message: response.error,
        duration: 5000
      });
      pendingModerationStore.reset();
    } else {
      pendingEvents = response.protests || [];
      const parsedTotal = Number(response.total);
      let total = 0;

      if (Number.isFinite(parsedTotal) && parsedTotal >= 0) {
        total = parsedTotal;
      } else if (Array.isArray(response.protests)) {
        total = response.protests.length;
      }

      pendingModerationStore.set(total);
    }

    isLoading = false;
  }

  async function approveEvent(event) {
    if (processingIds.has(event.id)) return;

    processingIds.add(event.id);
    processingIds = processingIds;

    const response = await updateProtest(event.id, { verified: true });

    processingIds.delete(event.id);
    processingIds = processingIds;

    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: $t('moderate.approveError'),
        message: response.error,
        duration: 5000
      });
    } else {
      notificationStore.add({
        type: 'success',
        title: $t('moderate.approved'),
        message: $t('moderate.approvedMessage', { values: { title: event.title } }),
        duration: 5000
      });

      // Remove from list
      pendingEvents = pendingEvents.filter(e => e.id !== event.id);
      pendingModerationStore.decrement();
    }
  }

  async function rejectEvent(event) {
    if (processingIds.has(event.id)) return;

    if (!confirm($t('moderate.confirmReject', { values: { title: event.title } }))) {
      return;
    }

    processingIds.add(event.id);
    processingIds = processingIds;

    const response = await deleteProtest(event.id);

    processingIds.delete(event.id);
    processingIds = processingIds;

    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: $t('moderate.rejectError'),
        message: response.error,
        duration: 5000
      });
    } else {
      notificationStore.add({
        type: 'success',
        title: $t('moderate.rejected'),
        message: $t('moderate.rejectedMessage', { values: { title: event.title } }),
        duration: 5000
      });

      // Remove from list
      pendingEvents = pendingEvents.filter(e => e.id !== event.id);
      pendingModerationStore.decrement();
    }
  }
</script>

<svelte:head>
  <title>{$t('moderate.title')} - Protest Listing</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-900 py-8 px-4">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <button
        on:click={() => goto('/')}
        class="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white mb-4 transition-colors"
      >
        <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
        {$t('common.backToHome')}
      </button>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-medium text-black dark:text-white mb-2">
            {$t('moderate.title')}
          </h1>
          <p class="text-black/60 dark:text-white/60">
            {$t('moderate.description')}
          </p>
        </div>

        <button
          on:click={loadPendingEvents}
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        >
          <Icon icon="heroicons:arrow-path" class="w-5 h-5" />
          {$t('moderate.refresh')}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-20">
        <Icon icon="heroicons:arrow-path" class="w-12 h-12 text-black/40 dark:text-white/40 animate-spin mb-4" />
        <p class="text-black/60 dark:text-white/60">{$t('moderate.loading')}</p>
      </div>

    <!-- Empty State -->
    {:else if pendingEvents.length === 0}
      <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-12 text-center">
        <Icon icon="heroicons:check-circle" class="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
        <h2 class="text-xl font-medium text-black dark:text-white mb-2">
          {$t('moderate.noEvents')}
        </h2>
        <p class="text-black/60 dark:text-white/60">
          {$t('moderate.noEventsMessage')}
        </p>
      </div>

    <!-- Event List -->
    {:else}
      <div class="space-y-4">
        <div class="text-sm text-black/60 dark:text-white/60 mb-4">
          {$t('moderate.eventCount', { values: { count: pendingEvents.length } })}
        </div>

        {#each pendingEvents as event (event.id)}
          {@const isProcessing = processingIds.has(event.id)}

          <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
            <div class="flex flex-col lg:flex-row lg:items-start gap-6">
              <!-- Event Info -->
              <div class="flex-1">
                <h3 class="text-xl font-medium text-black dark:text-white mb-3">
                  {event.title}
                </h3>

                <div class="space-y-2 text-sm text-black/60 dark:text-white/60">
                  <!-- Date & Time -->
                  <div class="flex items-center gap-2">
                    <Icon icon="heroicons:calendar" class="w-4 h-4" />
                    <span>
                      {formatDate(event.start)}
                      {#if event.start}
                        {$t('common.at')} {formatTime(event.start)}
                      {/if}
                    </span>
                  </div>

                  <!-- Location -->
                  {#if event.location}
                    <div class="flex items-center gap-2">
                      <Icon icon="heroicons:map-pin" class="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  {/if}

                  <!-- City & Country -->
                  {#if event.city || event.country}
                    <div class="flex items-center gap-2">
                      <Icon icon="heroicons:globe-alt" class="w-4 h-4" />
                      <span>
                        {#if event.city}{event.city}{/if}{#if event.city && event.country}, {/if}{#if event.country}{event.country}{/if}
                      </span>
                    </div>
                  {/if}

                  <!-- Source -->
                  {#if event.source}
                    <div class="flex items-center gap-2">
                      <Icon icon="heroicons:information-circle" class="w-4 h-4" />
                      <span>{$t('moderate.source')}: {event.source}</span>
                    </div>
                  {/if}

                  <!-- URL -->
                  {#if event.url}
                    <div class="flex items-center gap-2">
                      <Icon icon="heroicons:link" class="w-4 h-4" />
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-black dark:text-white hover:underline"
                      >
                        {$t('moderate.viewDetails')}
                      </a>
                    </div>
                  {/if}

                  <!-- Created At -->
                  {#if event.createdAt}
                    <div class="flex items-center gap-2">
                      <Icon icon="heroicons:clock" class="w-4 h-4" />
                      <span>{$t('moderate.submitted')}: {formatDate(event.createdAt)}</span>
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex lg:flex-col gap-3">
                <Button
                  variant="primary"
                  on:click={() => approveEvent(event)}
                  disabled={isProcessing}
                  class="flex-1 lg:flex-none"
                >
                  {#if isProcessing}
                    <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                  {:else}
                    <Icon icon="heroicons:check" class="w-5 h-5" />
                  {/if}
                  {$t('moderate.approve')}
                </Button>

                <Button
                  variant="secondary"
                  on:click={() => rejectEvent(event)}
                  disabled={isProcessing}
                  class="flex-1 lg:flex-none"
                >
                  {#if isProcessing}
                    <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                  {:else}
                    <Icon icon="heroicons:x-mark" class="w-5 h-5" />
                  {/if}
                  {$t('moderate.reject')}
                </Button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
