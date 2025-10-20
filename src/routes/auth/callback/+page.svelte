<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import { notificationStore } from '$lib/stores/notification';

  onMount(() => {
    // Get user from URL query params (token is in HTTP-only cookie)
    const userParam = $page.url.searchParams.get('user');
    const error = $page.url.searchParams.get('error');

    if (error) {
      notificationStore.add({
        type: 'error',
        title: 'Authentication Failed',
        message: error || 'OAuth authentication failed',
        duration: 5000
      });
      goto('/');
      return;
    }

    if (!userParam) {
      notificationStore.add({
        type: 'error',
        title: 'Authentication Failed',
        message: 'No user information received',
        duration: 5000
      });
      goto('/');
      return;
    }

    try {
      // Parse user info from query param
      const user = JSON.parse(decodeURIComponent(userParam));

      // Store user info (token is already in HTTP-only cookie)
      authStore.login(user);

      notificationStore.add({
        type: 'success',
        title: 'Welcome Back!',
        message: `Successfully signed in as ${user.email}`,
        duration: 5000
      });

      // Immediate redirect
      goto('/');
    } catch (err) {
      notificationStore.add({
        type: 'error',
        title: 'Authentication Error',
        message: 'Failed to process authentication',
        duration: 5000
      });
      goto('/');
    }
  });
</script>

<svelte:head>
  <title>Authenticating - Protest Listing</title>
</svelte:head>

<!-- OAuth callback redirects immediately to home with notification -->
<!-- This page is shown only briefly during the redirect -->
