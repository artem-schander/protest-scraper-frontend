<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import { authStore } from '$lib/stores/auth';
  import { login, initiateGoogleOAuth } from '$lib/utils/api';
  import { t } from '$lib/i18n';
  import { translateError, requiresVerification } from '$lib/utils/errorHandler';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    isLoading = true;

    try {
      const response = await login(email, password);

      if (response.user) {
        authStore.login(response.user);
        isOpen = false;
        email = '';
        password = '';
      } else if (requiresVerification(response)) {
        isOpen = false;
        dispatch('requireVerification', {
          email,
          code: response.debugVerificationCode
        });
        password = '';
      } else {
        error = translateError(response);
      }
    } catch (err) {
      error = translateError(err);
    } finally {
      isLoading = false;
    }
  }

  function switchToRegister() {
    isOpen = false;
    dispatch('switchToRegister');
  }

  function handleGoogleLogin() {
    initiateGoogleOAuth();
  }
</script>

<Modal bind:isOpen maxWidth="md">
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-medium text-black dark:text-white mb-2">{$t('auth.login.title')}</h2>
      <p class="text-sm text-black/60 dark:text-white/60">{$t('auth.login.subtitle')}</p>
    </div>

    <form on:submit={handleLogin} class="space-y-4">
      {#if error}
        <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-start gap-3">
          <Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      {/if}

      <Input
        bind:value={email}
        type="email"
        label={$t('auth.email')}
        required
        icon="heroicons:envelope"
      >
        <svelte:fragment slot="icon">
          <Icon icon="heroicons:envelope" class="w-5 h-5" />
        </svelte:fragment>
      </Input>

      <Input
        bind:value={password}
        type="password"
        label={$t('auth.password')}
        required
        icon="heroicons:lock-closed"
      >
        <svelte:fragment slot="icon">
          <Icon icon="heroicons:lock-closed" class="w-5 h-5" />
        </svelte:fragment>
      </Input>

      <div class="flex justify-end text-sm">
        <a href="/forgot-password" class="text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600] font-medium">
          {$t('auth.forgotPassword')}
        </a>
      </div>

      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {#if isLoading}
          <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
          {$t('auth.signingIn')}
        {:else}
          {$t('header.login')}
        {/if}
      </Button>
    </form>

    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-stone-200 dark:border-stone-700"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white dark:bg-stone-800 text-black/40 dark:text-white/40">{$t('common.or')}</span>
      </div>
    </div>

    <button
      type="button"
      on:click={handleGoogleLogin}
      class="w-full py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-2"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {$t('auth.continueWithGoogle')}
    </button>

    <p class="text-center text-sm text-black/60 dark:text-white/60">
      {$t('auth.noAccount')}
      <button
        type="button"
        on:click={switchToRegister}
        class="text-[#E10600] dark:text-red-400 font-medium hover:text-[#C10500] dark:hover:text-[#E10600]"
      >
        {$t('auth.signUp')}
      </button>
    </p>
  </div>
</Modal>
