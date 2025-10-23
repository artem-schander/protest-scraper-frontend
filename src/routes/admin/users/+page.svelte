<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { t, locale } from '$lib/i18n';
  import { authStore } from '$lib/stores/auth';
  import { notificationStore } from '$lib/stores/notification';
  import { translateError } from '$lib/utils/errorHandler';
  import {
    fetchUsers,
    createUserAccount,
    updateUserAccount,
    deleteUserAccount,
    banUserAccount,
    unbanUserAccount,
    resendUserVerification
  } from '$lib/utils/api';
  import Button from '$lib/components/common/Button.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import Modal from '$lib/components/common/Modal.svelte';

  export let data;

  const initialUsersFromServer = Array.isArray(data?.initialUsers) ? data.initialUsers : null;
  const hasInitialUsers = initialUsersFromServer !== null;

  let users = initialUsersFromServer ? [...initialUsersFromServer] : [];
  let isLoading = !hasInitialUsers;
  let isCreating = false;
  let isUpdating = false;
  let isBanning = false;
  let resendTargetId = null;

  let showCreateModal = false;
  let showEditModal = false;
  let showBanModal = false;

  let editTarget = null;
  let banTarget = null;
  let actionMenuUserId = null;
  let actionMenuPosition = { top: 0, right: 0 };

  let createForm = {
    email: '',
    password: '',
    role: 'USER',
    emailVerified: false
  };

  let editForm = {
    email: '',
    password: '',
    role: 'USER',
    emailVerified: false
  };

  let banForm = {
    value: '',
    unit: 'days',
    forever: false,
    reason: ''
  };

  const roleOptions = ['USER', 'MODERATOR', 'ADMIN'];
  const translate = (key, options) => get(t)(key, options);

  function translated(key, options) {
    const value = translate(key, options);
    return typeof value === 'string' && value !== key ? value : null;
  }

  onMount(async () => {
    if (!$authStore.isAuthenticated || $authStore.user?.role !== 'ADMIN') {
      goto('/');
      return;
    }

    if (!hasInitialUsers) {
      await loadUsers();
    } else {
      await loadUsers({ showSpinner: false });
    }
  });

  async function loadUsers({ showSpinner = true } = {}) {
    if (showSpinner) {
      isLoading = true;
    }

    const response = await fetchUsers();
    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.fetchFailed'),
        message: translateError(response)
      });
    } else {
      users = response.users || [];
    }

    isLoading = false;
  }

  function toggleActionMenu(userId, event) {
    if (actionMenuUserId === userId) {
      actionMenuUserId = null;
      return;
    }

    actionMenuUserId = userId;

    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      actionMenuPosition = {
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      };
    }
  }

  function closeActionMenu() {
    actionMenuUserId = null;
  }

  function handleGlobalClick() {
    closeActionMenu();
  }

  function handleWindowKeydown(event) {
    if (event.key === 'Escape') {
      closeActionMenu();
    }
  }

  function resetCreateForm() {
    createForm = {
      email: '',
      password: '',
      role: 'USER',
      emailVerified: false
    };
  }

  function openCreateUserModal() {
    resetCreateForm();
    showCreateModal = true;
    closeActionMenu();
  }

  function closeCreateUserModal() {
    showCreateModal = false;
    resetCreateForm();
  }

  function startEdit(user) {
    closeActionMenu();
    editTarget = user;
    editForm = {
      email: user.email,
      password: '',
      role: user.role,
      emailVerified: Boolean(user.emailVerified)
    };
    showEditModal = true;
  }

  function cancelEdit() {
    showEditModal = false;
    editTarget = null;
    editForm = {
      email: '',
      password: '',
      role: 'USER',
      emailVerified: false
    };
  }

  function startBan(user) {
    closeActionMenu();
    banTarget = user;
    banForm = {
      value: '',
      unit: 'days',
      forever: false,
      reason: ''
    };
    showBanModal = true;
  }

  function cancelBan() {
    showBanModal = false;
    banTarget = null;
    banForm = {
      value: '',
      unit: 'days',
      forever: false,
      reason: ''
    };
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    isCreating = true;

    const payload = {
      email: createForm.email,
      password: createForm.password,
      role: createForm.role,
      emailVerified: createForm.emailVerified
    };

    const response = await createUserAccount(payload);
    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.createFailed'),
        message: translateError(response)
      });
    } else {
      notificationStore.add({
        type: 'success',
        title: translate('admin.users.notifications.createSuccess'),
        message: translate('admin.users.notifications.createSuccessMessage', {
          values: { email: response.user.email }
        })
      });
      users = [response.user, ...users];
      closeCreateUserModal();
    }

    isCreating = false;
  }

  async function handleUpdateUser(user = editTarget) {
    if (!user) {
      return;
    }

    const payload = {};
    if (editForm.email.trim() !== user.email) {
      payload.email = editForm.email.trim();
    }
    if (editForm.password.trim().length > 0) {
      payload.password = editForm.password.trim();
    }
    if (editForm.role !== user.role) {
      payload.role = editForm.role;
    }
    if (Boolean(editForm.emailVerified) !== Boolean(user.emailVerified)) {
      payload.emailVerified = editForm.emailVerified;
    }

    if (Object.keys(payload).length === 0) {
      cancelEdit();
      return;
    }

    isUpdating = true;
    const response = await updateUserAccount(user.id, payload);
    isUpdating = false;

    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.updateFailed'),
        message: translateError(response)
      });
      return;
    }

    users = users.map((item) => (item.id === user.id ? response.user : item));
    notificationStore.add({
      type: 'success',
      title: translate('admin.users.notifications.updateSuccess'),
      message: translate('admin.users.notifications.updateSuccessMessage', {
        values: { email: response.user.email }
      })
    });
    cancelEdit();
  }

  async function handleDeleteUser(user) {
    closeActionMenu();
    if (!confirm(translate('admin.users.confirmDelete', { values: { email: user.email } }))) {
      return;
    }

    const response = await deleteUserAccount(user.id);
    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.deleteFailed'),
        message: translateError(response)
      });
      return;
    }

    users = users.filter((item) => item.id !== user.id);
    notificationStore.add({
      type: 'success',
      title: translate('admin.users.notifications.deleteSuccess'),
      message: translate('admin.users.notifications.deleteSuccessMessage', {
        values: { email: user.email }
      })
    });
  }

  async function handleBanUser(user = banTarget) {
    if (!user) {
      return;
    }

    const payload = {};

    if (banForm.forever) {
      payload.forever = true;
    } else if (banForm.value) {
      const numeric = Number(banForm.value);
      if (!Number.isFinite(numeric) || numeric <= 0) {
        notificationStore.add({
          type: 'error',
          title: translate('admin.users.notifications.banFailed'),
          message: translate('admin.users.notifications.invalidDuration')
        });
        return;
      }
      let minutes = numeric;
      if (banForm.unit === 'hours') {
        minutes = numeric * 60;
      } else if (banForm.unit === 'days') {
        minutes = numeric * 24 * 60;
      }
      payload.minutes = minutes;
    } else {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.banFailed'),
        message: translate('admin.users.notifications.invalidDuration')
      });
      return;
    }

    if (banForm.reason.trim()) {
      payload.reason = banForm.reason.trim();
    }

    isBanning = true;
    const response = await banUserAccount(user.id, payload);
    isBanning = false;

    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.banFailed'),
        message: translateError(response)
      });
      return;
    }

    users = users.map((item) => (item.id === user.id ? response.user : item));
    notificationStore.add({
      type: 'success',
      title: translate('admin.users.notifications.banSuccess'),
      message: translate('admin.users.notifications.banSuccessMessage', {
        values: { email: user.email }
      })
    });
    cancelBan();
  }

  async function handleUnbanUser(user) {
    closeActionMenu();
    const response = await unbanUserAccount(user.id);
    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.unbanFailed'),
        message: translateError(response)
      });
      return;
    }

    users = users.map((item) => (item.id === user.id ? response.user : item));
    notificationStore.add({
      type: 'success',
      title: translate('admin.users.notifications.unbanSuccess'),
      message: translate('admin.users.notifications.unbanSuccessMessage', {
        values: { email: user.email }
      })
    });
  }

  async function handleResendVerification(user) {
    closeActionMenu();
    resendTargetId = user.id;
    const response = await resendUserVerification(user.id);
    resendTargetId = null;

    if (response.error) {
      notificationStore.add({
        type: 'error',
        title: translate('admin.users.notifications.resendFailed'),
        message: translateError(response)
      });
      return;
    }

    users = users.map((item) => (item.id === user.id ? response.user : item));
    notificationStore.add({
      type: 'success',
      title: translate('admin.users.notifications.resendSuccess'),
      message: translate('admin.users.notifications.resendSuccessMessage', {
        values: { email: user.email }
      })
    });
  }

  function isUserBanned(user) {
    if (!user.bannedUntil) return false;
    const until = new Date(user.bannedUntil);
    return Number.isFinite(until.getTime()) && until > new Date();
  }

  import { formatDate as dateFormatter } from '$lib/utils/dateFormat';

  function formatDate(value, currentLocale) {
    if (!value) return '\u2014';
    const formatted = dateFormatter(value, 'd MMM yyyy, HH:mm', currentLocale);
    return formatted || '\u2014';
  }

  function isOtherAdmin(user) {
    return user.role === 'ADMIN' && user.id !== $authStore.user?.id;
  }

  function canEditRole(user) {
    return !isOtherAdmin(user);
  }
</script>

<svelte:window on:click={handleGlobalClick} on:keydown={handleWindowKeydown} />

<svelte:head>
  <title>{$t('admin.users.title')} - Protest Listing</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-black dark:text-white">
        {$t('admin.users.title')}
      </h1>
      <p class="text-black/60 dark:text-white/60">
        {$t('admin.users.subtitle')}
      </p>
    </header>
    <Button variant="primary" on:click={openCreateUserModal} class="self-start md:self-auto">
      <Icon icon="heroicons:user-plus" class="w-5 h-5" />
      {translated('admin.users.create.openButton') ?? $t('admin.users.create.title')}
    </Button>
  </div>

  <section class="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
        <Icon icon="heroicons:users" class="w-5 h-5 text-[#E10600]" />
        {$t('admin.users.list.title')}
      </h2>
      <Button variant="ghost" on:click={() => loadUsers()}>
        <Icon icon="heroicons:arrow-path" class="w-5 h-5" />
        {$t('admin.users.list.refresh')}
      </Button>
    </div>

    {#if isLoading}
      <div class="flex items-center gap-3 text-black/60 dark:text-white/60">
        <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        {$t('admin.users.loading')}
      </div>
    {:else if users.length === 0}
      <p class="text-black/60 dark:text-white/60">{$t('admin.users.empty')}</p>
    {:else}
      <div class="overflow-x-auto relative">
        <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
          <thead class="bg-stone-50 dark:bg-stone-900/40 text-left text-sm text-black/60 dark:text-white/60">
            <tr>
              <th class="px-4 py-3">{$t('admin.users.list.headers.email')}</th>
              <th class="px-4 py-3">{$t('admin.users.list.headers.role')}</th>
              <th class="px-4 py-3">{$t('admin.users.list.headers.status')}</th>
              <th class="px-4 py-3">{$t('admin.users.list.headers.banned')}</th>
              <th class="px-4 py-3 text-right">{$t('admin.users.list.headers.actions')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-200 dark:divide-stone-700 text-sm">
            {#each users as user}
              <tr class="align-top">
                <td class="px-4 py-3 space-y-1">
                  <div class="font-medium text-black dark:text-white">{user.email}</div>
                  <div class="text-xs text-black/50 dark:text-white/50">{formatDate(user.createdAt, $locale)}</div>
                </td>
                <td class="px-4 py-3 text-black dark:text-white">
                  {$t(`admin.users.roles.${user.role.toLowerCase()}`)}
                </td>
                <td class="px-4 py-3 space-y-1 text-black dark:text-white">
                  <span class={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${user.emailVerified ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                    <Icon icon={user.emailVerified ? 'heroicons:check-circle' : 'heroicons:ellipsis-horizontal'} class="w-4 h-4" />
                    {user.emailVerified ? $t('admin.users.status.verified') : $t('admin.users.status.unverified')}
                  </span>
                  {#if isUserBanned(user)}
                    <span class="block text-xs text-red-500 dark:text-red-400">
                      {$t('admin.users.status.bannedUntil', { values: { date: formatDate(user.bannedUntil) } })}
                    </span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-black dark:text-white">
                  {#if isUserBanned(user)}
                    <span class="inline-flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
                      <Icon icon="heroicons:no-symbol" class="w-4 h-4" />
                      {formatDate(user.bannedUntil)}
                    </span>
                    {#if user.bannedReason}
                      <p class="text-xs text-black/50 dark:text-white/50 mt-1">{user.bannedReason}</p>
                    {/if}
                  {:else}
                    <span class="text-sm text-black/50 dark:text-white/50">{$t('admin.users.status.notBanned')}</span>
                  {/if}
                </td>
                <td class="px-4 py-3 relative">
                  <div class="relative flex justify-end">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-black dark:text-white transition-colors"
                      aria-label={translated('admin.users.list.actionsMenuAria') ?? $t('admin.users.list.headers.actions')}
                      on:click|stopPropagation={(e) => toggleActionMenu(user.id, e)}
                    >
                      <Icon icon="heroicons:ellipsis-vertical" class="w-5 h-5" />
                    </button>
                    {#if actionMenuUserId === user.id}
                      <div
                        class="fixed mt-2 w-56 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xl py-1 z-50"
                        style="top: {actionMenuPosition.top}px; right: {actionMenuPosition.right}px;"
                        role="menu"
                        tabindex="-1"
                        on:click|stopPropagation
                        on:keydown={(event) => {
                          if (event.key === 'Escape') {
                            event.stopPropagation();
                            closeActionMenu();
                          }
                        }}
                      >
                        <button
                          type="button"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          on:click={() => startEdit(user)}
                          disabled={isOtherAdmin(user)}
                        >
                          <Icon icon="heroicons:pencil-square" class="w-4 h-4" />
                          {translated('admin.users.actions.edit') ?? $t('admin.users.actions.edit')}
                        </button>
                        {#if !user.emailVerified}
                          <button
                            type="button"
                            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            on:click={() => handleResendVerification(user)}
                            disabled={resendTargetId === user.id}
                          >
                            {#if resendTargetId === user.id}
                              <Icon icon="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                            {:else}
                              <Icon icon="heroicons:envelope" class="w-4 h-4" />
                            {/if}
                            {translated('admin.users.actions.resend') ?? $t('admin.users.actions.resend')}
                          </button>
                        {/if}
                        {#if isUserBanned(user)}
                          <button
                            type="button"
                            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-black dark:text-white"
                            on:click={() => handleUnbanUser(user)}
                          >
                            <Icon icon="heroicons:arrow-uturn-left" class="w-4 h-4" />
                            {translated('admin.users.actions.unban') ?? $t('admin.users.actions.unban')}
                          </button>
                        {:else}
                          <button
                            type="button"
                            class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700 text-black dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            on:click={() => startBan(user)}
                            disabled={isOtherAdmin(user)}
                          >
                            <Icon icon="heroicons:no-symbol" class="w-4 h-4" />
                            {translated('admin.users.actions.ban') ?? $t('admin.users.actions.ban')}
                          </button>
                        {/if}
                        <button
                          type="button"
                          class="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          on:click={() => handleDeleteUser(user)}
                          disabled={isOtherAdmin(user)}
                        >
                          <Icon icon="heroicons:trash" class="w-4 h-4" />
                          {translated('admin.users.actions.delete') ?? $t('admin.users.actions.delete')}
                        </button>
                      </div>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>

<Modal
  bind:isOpen={showCreateModal}
  title={$t('admin.users.create.dialogTitle')}
  maxWidth="lg"
  on:close={closeCreateUserModal}
>
  <form class="grid gap-4" on:submit={handleCreateUser}>
    <Input
      bind:value={createForm.email}
      type="email"
      label={$t('admin.users.create.emailLabel')}
      required
    />
    <Input
      bind:value={createForm.password}
      type="password"
      label={$t('admin.users.create.passwordLabel')}
      helper={$t('admin.users.create.passwordHelper')}
      required
    />
    <div>
      <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="admin-create-role">{$t('admin.users.create.roleLabel')}</label>
      <select
        id="admin-create-role"
        bind:value={createForm.role}
        class="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E10600]"
      >
        {#each roleOptions as option}
          <option value={option}>{$t(`admin.users.roles.${option.toLowerCase()}`)}</option>
        {/each}
      </select>
    </div>
    <label class="flex items-center gap-2 text-sm text-black dark:text-white">
      <input type="checkbox" bind:checked={createForm.emailVerified} class="rounded text-[#E10600] accent-[#E10600]" />
      {$t('admin.users.create.emailVerifiedLabel')}
    </label>
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" on:click={closeCreateUserModal}>
        {$t('admin.users.edit.cancel')}
      </Button>
      <Button type="submit" variant="primary" disabled={isCreating}>
        {#if isCreating}
          <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          {$t('admin.users.create.submitting')}
        {:else}
          {$t('admin.users.create.submitLabel')}
        {/if}
      </Button>
    </div>
  </form>
</Modal>

<Modal
  bind:isOpen={showEditModal}
  title={$t('admin.users.edit.dialogTitle', { values: { email: editTarget?.email || '' } })}
  maxWidth="lg"
  on:close={cancelEdit}
>
  <form
    class="grid gap-4"
    on:submit={(event) => {
      event.preventDefault();
      handleUpdateUser(editTarget);
    }}
  >
    <Input
      bind:value={editForm.email}
      type="email"
      label={$t('admin.users.edit.emailLabel')}
      required
    />
    <Input
      bind:value={editForm.password}
      type="password"
      label={$t('admin.users.edit.passwordLabel')}
      helper={$t('admin.users.edit.passwordHelper')}
    />
    <div>
      <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="admin-edit-role">{$t('admin.users.create.roleLabel')}</label>
      <select
        id="admin-edit-role"
        bind:value={editForm.role}
        class="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E10600] disabled:opacity-50"
        disabled={!editTarget || !canEditRole(editTarget)}
      >
        {#each roleOptions as option}
          <option value={option}>{$t(`admin.users.roles.${option.toLowerCase()}`)}</option>
        {/each}
      </select>
    </div>
    <label class="flex items-center gap-2 text-sm text-black dark:text-white">
      <input type="checkbox" bind:checked={editForm.emailVerified} class="rounded text-[#E10600] accent-[#E10600]" />
      {$t('admin.users.edit.emailVerifiedLabel')}
    </label>
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" on:click={cancelEdit}>
        {$t('admin.users.edit.cancel')}
      </Button>
      <Button type="submit" variant="primary" disabled={isUpdating}>
        {#if isUpdating}
          <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          {$t('admin.users.edit.saving')}
        {:else}
          {$t('admin.users.edit.save')}
        {/if}
      </Button>
    </div>
  </form>
</Modal>

<Modal
  bind:isOpen={showBanModal}
  title={$t('admin.users.ban.dialogTitle', { values: { email: banTarget?.email || '' } })}
  maxWidth="lg"
  on:close={cancelBan}
>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <Input
        bind:value={banForm.value}
        type="number"
        min="1"
        label={$t('admin.users.ban.durationLabel')}
        placeholder={$t('admin.users.ban.durationPlaceholder')}
        disabled={banForm.forever}
      />
      <div>
        <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="admin-ban-unit">{$t('admin.users.ban.unitLabel')}</label>
        <select
          id="admin-ban-unit"
          bind:value={banForm.unit}
          class="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E10600]"
          disabled={banForm.forever}
        >
          <option value="minutes">{$t('admin.users.ban.unitMinutes')}</option>
          <option value="hours">{$t('admin.users.ban.unitHours')}</option>
          <option value="days">{$t('admin.users.ban.unitDays')}</option>
        </select>
      </div>
    </div>
    <label class="flex items-center gap-2 text-sm text-black dark:text-white">
      <input type="checkbox" bind:checked={banForm.forever} class="rounded text-[#E10600] accent-[#E10600]" />
      {$t('admin.users.ban.foreverLabel')}
    </label>
    <Input
      bind:value={banForm.reason}
      type="text"
      label={$t('admin.users.ban.reasonLabel')}
      placeholder={$t('admin.users.ban.reasonPlaceholder')}
    />
    <div class="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" on:click={cancelBan}>
        {$t('admin.users.ban.cancel')}
      </Button>
      <Button type="button" variant="primary" on:click={() => handleBanUser(banTarget)} disabled={isBanning}>
        {#if isBanning}
          <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        {:else}
          {$t('admin.users.ban.submit')}
        {/if}
      </Button>
    </div>
  </div>
</Modal>
