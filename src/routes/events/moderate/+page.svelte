<script>
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { notificationStore } from '$lib/stores/notification';
  import { getProtests, updateProtest, deleteProtest } from '$lib/utils/api';
  import { t } from '$lib/i18n';
  import { formatDate, formatTime } from '$lib/utils/dateFormat';
  import Icon from '$lib/components/common/Icon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { pendingModerationStore } from '$lib/stores/moderation';
  import EditEventModal from '$lib/components/event/EditEventModal.svelte';
  import { getModerationWebSocket } from '$lib/utils/moderationWebSocket';

  let pendingEvents = [];
  let isLoading = true;
  let processingIds = new Set();
  let editingEventId = null;
  let showEditModal = false;
  let lockedEvents = new Map(); // eventId → { userId, email }
  let wsClient = null;
  let isWsConnected = false;

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

    // Get WebSocket instance (connection managed by Header component)
    wsClient = getModerationWebSocket();
    isWsConnected = wsClient.getConnectionStatus();

    // Setup event handlers
    wsClient.on('open', () => {
      isWsConnected = true;
      // Request current locks after connection
      wsClient.requestCurrentLocks();
    });

    wsClient.on('close', () => {
      isWsConnected = false;
    });

    wsClient.on('event_locked', handleEventLocked);
    wsClient.on('event_unlocked', handleEventUnlocked);
    wsClient.on('event_updated', handleWsEventUpdated);
    wsClient.on('event_deleted', handleWsEventDeleted);

    // If already connected, request locks immediately
    if (isWsConnected) {
      wsClient.requestCurrentLocks();
    }
  });

  onDestroy(() => {
    // Cleanup WebSocket event listeners (but don't disconnect - Header manages the connection)
    if (wsClient) {
      wsClient.off('event_locked', handleEventLocked);
      wsClient.off('event_unlocked', handleEventUnlocked);
      wsClient.off('event_updated', handleWsEventUpdated);
      wsClient.off('event_deleted', handleWsEventDeleted);
    }
  });

  // Watch for modal close (when isOpen changes from true to false)
  $: if (!showEditModal && editingEventId) {
    if (wsClient && wsClient.getConnectionStatus()) {
      wsClient.unviewEvent(editingEventId);
    }
    editingEventId = null;
  }

  async function loadPendingEvents() {
    isLoading = true;
    const response = await getProtests({ verified: 'false', manualOnly: 'true', limit: 100 });

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
      const parsedTotal = Number(response.pagination?.total);
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

      // Notify WebSocket
      if (wsClient && wsClient.getConnectionStatus()) {
        wsClient.notifyEventUpdated(event.id);
        wsClient.unviewEvent(event.id);
      }

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

      // Notify WebSocket
      if (wsClient && wsClient.getConnectionStatus()) {
        wsClient.notifyEventDeleted(event.id);
        wsClient.unviewEvent(event.id);
      }

      // Remove from list
      pendingEvents = pendingEvents.filter(e => e.id !== event.id);
      pendingModerationStore.decrement();
    }
  }

  function openEditModal(eventId) {
    editingEventId = eventId;
    showEditModal = true;

    // Lock the event for editing
    if (wsClient && wsClient.getConnectionStatus()) {
      wsClient.viewEvent(eventId);
    }
  }

  async function handleEventUpdated() {
    // Unlock the event
    if (wsClient && wsClient.getConnectionStatus() && editingEventId) {
      wsClient.unviewEvent(editingEventId);
    }

    // Reload the list to show updated event data
    await loadPendingEvents();
    showEditModal = false;
    editingEventId = null;
  }

  function handleEditModalClose() {
    // Unlock the event when modal closes without saving
    if (wsClient && wsClient.getConnectionStatus() && editingEventId) {
      wsClient.unviewEvent(editingEventId);
    }

    showEditModal = false;
    editingEventId = null;
  }

  // WebSocket event handlers
  function handleEventLocked(data) {
    lockedEvents.set(data.eventId, data.lockedBy);
    lockedEvents = new Map(lockedEvents); // Create new Map to trigger reactivity
  }

  function handleEventUnlocked(data) {
    lockedEvents.delete(data.eventId);
    lockedEvents = new Map(lockedEvents); // Create new Map to trigger reactivity
  }

  function handleWsEventUpdated(data) {
    // Another moderator updated an event - reload list
    loadPendingEvents();
  }

  function handleWsEventDeleted(data) {
    // Another moderator deleted an event - remove from list
    pendingEvents = pendingEvents.filter(e => e.id !== data.eventId);
    pendingModerationStore.decrement();
  }

  function isEventLocked(eventId) {
    return lockedEvents.has(eventId);
  }

  function getEventLocker(eventId) {
    return lockedEvents.get(eventId);
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
        <div class="w-12 h-12 border-4 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin mb-4"></div>
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
          {@const locked = lockedEvents.has(event.id)}
          {@const locker = lockedEvents.get(event.id)}
          {@const isLockedByThisBrowser = editingEventId === event.id}
          {@const isLockedByOther = locked && !isLockedByThisBrowser}

          <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl {isLockedByOther ? 'pointer-events-none' : ''}">
            <div class="flex flex-col gap-6">
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
                  <!-- {#if event.source} -->
                  <!--   <div class="flex items-center gap-2"> -->
                  <!--     <Icon icon="heroicons:information-circle" class="w-4 h-4" /> -->
                  <!--     <span>{$t('moderate.source')}: {event.source}</span> -->
                  <!--   </div> -->
                  <!-- {/if} -->

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

              <!-- Locked Indicator -->
              {#if isLockedByOther}
                <div class="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 outline outline-offset-1 outline-amber-200 dark:outline-amber-900/50 rounded-lg">
                  <Icon icon="heroicons:lock-closed" class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span class="text-sm text-amber-700 dark:text-amber-300">
                    Currently being reviewed by {locker.email}
                  </span>
                </div>
              {:else}
                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    on:click={() => rejectEvent(event)}
                    disabled={isProcessing || isLockedByOther}
                    class="flex-1 lg:flex-none"
                  >
                    {#if isProcessing}
                      <div class="w-4 h-4 border-2 border-black/30 dark:border-white/30 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                    {:else}
                      <Icon icon="heroicons:x-mark" class="w-4 h-4" />
                    {/if}
                    {$t('moderate.reject')}
                  </Button>

                  <div class="hidden sm:block sm:grow"></div>

                  <Button
                    variant="light"
                    size="sm"
                    on:click={() => openEditModal(event.id)}
                    disabled={isProcessing || isLockedByOther}
                    class="flex-1 lg:flex-none"
                  >
                    <Icon icon="heroicons:pencil-square" class="w-4 h-4" />
                    {$t('editEvent.title')}
                  </Button>

                  <Button
                    variant="green"
                    size="sm"
                    on:click={() => approveEvent(event)}
                    disabled={isProcessing || isLockedByOther}
                    class="flex-1 lg:flex-none"
                  >
                    {#if isProcessing}
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {:else}
                      <Icon icon="heroicons:check" class="w-4 h-4" />
                    {/if}
                    {$t('moderate.approve')}
                  </Button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<EditEventModal
  bind:isOpen={showEditModal}
  protestId={editingEventId || ''}
  on:updated={handleEventUpdated}
  on:close={handleEditModalClose}
/>
