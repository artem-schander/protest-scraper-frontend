<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import Icon from '$lib/components/common/Icon.svelte';

  let status = 'processing'; // processing, success, error
  let errorMessage = '';

  onMount(() => {
    // Get token from URL query params
    const token = $page.url.searchParams.get('token');
    const error = $page.url.searchParams.get('error');

    if (error) {
      status = 'error';
      errorMessage = error || 'OAuth authentication failed';
      setTimeout(() => goto('/'), 3000);
      return;
    }

    if (!token) {
      status = 'error';
      errorMessage = 'No authentication token received';
      setTimeout(() => goto('/'), 3000);
      return;
    }

    try {
      // Note: We don't have user info from the backend in production mode
      // The token contains the user info, but we'd need to decode it
      // For now, we'll just store the token and let the app fetch user info if needed
      authStore.login(token, {
        // User info will be loaded by checkAuth() or subsequent API calls
        id: '',
        email: '',
        role: 'USER'
      });

      status = 'success';

      // Redirect to home after short delay
      setTimeout(() => goto('/'), 1500);
    } catch (err) {
      status = 'error';
      errorMessage = 'Failed to process authentication';
      setTimeout(() => goto('/'), 3000);
    }
  });
</script>

<svelte:head>
  <title>Authentication - Protest Listing</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
      {#if status === 'processing'}
        <div class="flex justify-center">
          <Icon icon="heroicons:arrow-path" class="w-16 h-16 text-emerald-500 animate-spin" />
        </div>
        <div>
          <h1 class="text-2xl font-medium text-black dark:text-white mb-2">
            Authenticating...
          </h1>
          <p class="text-black/60 dark:text-white/60">
            Please wait while we complete your sign-in
          </p>
        </div>
      {:else if status === 'success'}
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Icon icon="heroicons:check" class="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-medium text-black dark:text-white mb-2">
            Welcome Back!
          </h1>
          <p class="text-black/60 dark:text-white/60">
            You've successfully signed in. Redirecting...
          </p>
        </div>
      {:else if status === 'error'}
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Icon icon="heroicons:x-mark" class="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-medium text-black dark:text-white mb-2">
            Authentication Failed
          </h1>
          <p class="text-black/60 dark:text-white/60">
            {errorMessage}
          </p>
          <p class="text-sm text-black/40 dark:text-white/40 mt-2">
            Redirecting to home page...
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
