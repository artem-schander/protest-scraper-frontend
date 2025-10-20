<script>
  import Icon from '$lib/components/common/Icon.svelte';
  import { authStore } from '$lib/stores/auth';
  import LoginModal from '$lib/components/auth/LoginModal.svelte';
  import RegisterModal from '$lib/components/auth/RegisterModal.svelte';
  import EmailVerificationModal from '$lib/components/auth/EmailVerificationModal.svelte';
  import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
  import { LANGUAGE_OPTIONS, locale, setAppLocale, t } from '$lib/i18n';
  import { logout, getProtests } from '$lib/utils/api';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { pendingModerationStore } from '$lib/stores/moderation';
  import { browser } from '$app/environment';

  export let pendingCount = 0;

  if (browser) {
    pendingModerationStore.set(pendingCount);
  }

  let showLoginModal = false;
  let showRegisterModal = false;
  let showMobileMenu = false;
  let showUserMenu = false;
  let showLangMenu = false;
  let selectedLocale = 'en';
  let displayPendingCount = pendingCount;
  let showPendingBadge = false;
  let hasModerationAccess = false;
  let isLoadingPendingCount = false;
  let showVerificationModal = false;
  let verificationEmail = '';
  let verificationCode = '';
  let moderationCountInitialized = false;

  $: selectedLocale = $locale;

  // Extract username from email for display
  $: displayName = $authStore.user?.email?.split('@')[0] || 'Profile';
  $: hasModerationAccess =
    $authStore.isAuthenticated && ($authStore.user?.role === 'MODERATOR' || $authStore.user?.role === 'ADMIN');
  $: isAdmin = $authStore.isAuthenticated && $authStore.user?.role === 'ADMIN';
  $: displayPendingCount = browser ? $pendingModerationStore : pendingCount;
  $: showPendingBadge = hasModerationAccess && displayPendingCount > 0;
  $: if (browser) {
    if (hasModerationAccess) {
      if (!moderationCountInitialized) {
        moderationCountInitialized = true;
        refreshPendingModerationCount();
      }
    } else {
      moderationCountInitialized = false;
      pendingModerationStore.reset();
    }
  }

  $: if (!showVerificationModal) {
    verificationCode = '';
  }

  function formatPendingCount(count) {
    return count > 99 ? '99+' : count;
  }

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }

  function openLogin() {
    showLoginModal = true;
    showRegisterModal = false;
  }

  function openRegister() {
    showRegisterModal = true;
    showLoginModal = false;
  }

  async function handleLogout() {
    // Call backend to clear cookie
    await logout();
    // Clear local auth state
    authStore.logout();
    pendingModerationStore.reset();
    showMobileMenu = false;
    showUserMenu = false;
    await goto('/');
  }

  function setLanguage(nextLocale) {
    if (nextLocale && nextLocale !== get(locale)) {
      setAppLocale(nextLocale);
      showLangMenu = false;
    }
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
    showLangMenu = false;
  }

  function toggleLangMenu() {
    showLangMenu = !showLangMenu;
    showUserMenu = false;
  }

  // Close dropdowns when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.user-menu-container')) {
      showUserMenu = false;
    }
    if (!event.target.closest('.lang-menu-container')) {
      showLangMenu = false;
    }
  }

  function openVerificationFlow({ email: targetEmail, code }) {
    if (!targetEmail) {
      return;
    }
    verificationEmail = targetEmail.trim().toLowerCase();
    verificationCode = code || '';
    showVerificationModal = true;
    showLoginModal = false;
    showRegisterModal = false;
    showMobileMenu = false;
    showUserMenu = false;
  }

  function handleVerificationRequested(event) {
    const detail = event.detail || {};
    if (detail.email) {
      openVerificationFlow({ email: detail.email, code: detail.code });
    }
  }

  function handleVerificationRequired(event) {
    const detail = event.detail || {};
    if (detail.email) {
      openVerificationFlow({ email: detail.email, code: detail.code });
    } else if (verificationEmail) {
      openVerificationFlow({ email: verificationEmail, code: detail.code });
    }
  }

  function handleVerificationSuccess() {
    showVerificationModal = false;
    verificationEmail = '';
    verificationCode = '';
  }

  function handleVerifiedWithoutCode(event) {
    const detail = event.detail || {};
    if (detail.user) {
      authStore.login(detail.user);
    }
    showRegisterModal = false;
  }

  async function refreshPendingModerationCount() {
    if (isLoadingPendingCount) {
      return;
    }

    isLoadingPendingCount = true;
    const response = await getProtests({ verified: 'false', limit: 1 });

    if (!response.error && hasModerationAccess) {
      const parsedTotal = Number(response.total);
      let total = 0;

      if (Number.isFinite(parsedTotal) && parsedTotal >= 0) {
        total = parsedTotal;
      } else if (Array.isArray(response.protests)) {
        total = response.protests.length;
      }

      pendingModerationStore.set(total);
    }

    isLoadingPendingCount = false;
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="sticky top-0 z-40 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-sm transition-colors">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-[#E10600] flex items-center justify-center transform group-hover:scale-110 transition-transform">
          <Icon icon="heroicons:megaphone" class="w-5 h-5 text-white" />
        </div>
        <span class="hidden sm:block text-lg font-medium text-black dark:text-white">
          Protest Listing
        </span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-4">
        <!-- Create Event Button (Authenticated) -->
        {#if $authStore.isAuthenticated}
          <a
            href="/events/create"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            <Icon icon="heroicons:plus" class="w-4 h-4" />
            {$t('header.createEvent')}
          </a>

          <!-- Moderate Button (Moderator/Admin only) -->
          {#if hasModerationAccess}
            <div class="relative">
              <a
                href="/events/moderate"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
              >
                <Icon icon="heroicons:shield-check" class="w-4 h-4" />
                {$t('header.moderate')}
              </a>
              {#if showPendingBadge}
                <span
                  class="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-[#E10600] text-white text-xs font-semibold leading-none px-2 py-1 shadow-md"
                  aria-label={$t('header.pendingModerationCount', { values: { count: displayPendingCount } })}
                >
                  {formatPendingCount(displayPendingCount)}
                </span>
              {/if}
            </div>
          {/if}

          {#if isAdmin}
            <a
              href="/admin/users"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Icon icon="heroicons:user-group" class="w-4 h-4" />
              {$t('header.manageUsers')}
            </a>
          {/if}
        {/if}

        <!-- Settings Group -->
        <div class="flex items-center gap-2 border-l border-stone-200 dark:border-stone-700 pl-4">
          <!-- Language Dropdown -->
          <div class="relative lang-menu-container">
            <button
              type="button"
              on:click={toggleLangMenu}
              class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
              aria-label={$t('header.language')}
            >
              <span>{selectedLocale.toUpperCase()}</span>
              <Icon icon="heroicons:chevron-down" class="w-4 h-4" />
            </button>

            {#if showLangMenu}
              <div class="absolute right-0 mt-2 w-32 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 py-1 z-50">
                {#each LANGUAGE_OPTIONS as option}
                  <button
                    type="button"
                    on:click={() => setLanguage(option.code)}
                    class={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      option.code === selectedLocale
                        ? 'bg-[#E10600] text-white'
                        : 'text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700'
                    }`}
                  >
                    {option.label}
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Theme Toggle -->
          <ThemeToggle />
        </div>

        <!-- Auth Section -->
        {#if $authStore.isAuthenticated}
          <!-- User Dropdown -->
          <div class="relative user-menu-container">
            <button
              type="button"
              on:click={toggleUserMenu}
              class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Icon icon="heroicons:user-circle" class="w-5 h-5" />
              <span class="max-w-[150px] truncate">{displayName}</span>
              <Icon icon="heroicons:chevron-down" class="w-4 h-4" />
            </button>

            {#if showUserMenu}
              <div class="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 py-1 z-50">
                <div class="px-4 py-2 border-b border-stone-200 dark:border-stone-700">
                  <p class="text-xs text-black/60 dark:text-white/60">{$t('header.profile')}</p>
                  <p class="text-sm font-medium text-black dark:text-white truncate">{$authStore.user?.email}</p>
                </div>
                <button
                  on:click={() => { showUserMenu = false; handleLogout(); }}
                  class="w-full px-4 py-2 text-left text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center gap-2"
                >
                  <Icon icon="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
                  {$t('header.logout')}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Login & Sign Up Buttons -->
          <button
            on:click={openLogin}
            class="px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            {$t('header.login')}
          </button>
          <button
            on:click={openRegister}
            class="px-4 py-2 text-sm font-medium text-white bg-[#E10600] hover:bg-[#C10500] rounded-lg hover:shadow-lg transition-all"
          >
            {$t('header.signup')}
          </button>
        {/if}
      </nav>

      <!-- Mobile Menu with Theme Toggle -->
      <div class="flex lg:hidden items-center gap-2">
        <ThemeToggle />
        <button
          on:click={toggleMobileMenu}
          class="w-10 h-10 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
          aria-label="Toggle menu"
        >
          <Icon icon={showMobileMenu ? 'heroicons:x-mark' : 'heroicons:bars-3'} class="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    {#if showMobileMenu}
      <div class="lg:hidden py-4 border-t border-stone-100 dark:border-stone-700">
        <div class="px-4 pb-4">
          <p class="text-xs font-medium text-black/60 dark:text-white/60 mb-2">
            {$t('header.language')}
          </p>
          <div class="flex gap-2">
            {#each LANGUAGE_OPTIONS as option}
              <button
                type="button"
                class={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  option.code === selectedLocale
                    ? 'border-transparent bg-[#E10600] text-white'
                    : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
                on:click={() => setLanguage(option.code)}
                aria-pressed={option.code === selectedLocale}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
        <nav class="flex flex-col gap-2">
          {#if $authStore.isAuthenticated}
            <a href="/events/create" class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-2">
              <Icon icon="heroicons:plus" class="w-4 h-4" />
              {$t('header.createEvent')}
            </a>

            <!-- Moderate Button (Moderator/Admin only) -->
            {#if hasModerationAccess}
              <div class="relative">
                <a href="/events/moderate" class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-2 pr-10">
                  <Icon icon="heroicons:shield-check" class="w-4 h-4" />
                  {$t('header.moderate')}
                </a>
                {#if showPendingBadge}
                  <span
                    class="absolute top-0 right-3 inline-flex items-center justify-center rounded-full bg-[#E10600] text-white text-xs font-semibold leading-none px-2 py-1 shadow-md"
                    aria-label={$t('header.pendingModerationCount', { values: { count: displayPendingCount } })}
                  >
                    {formatPendingCount(displayPendingCount)}
                  </span>
                {/if}
              </div>
            {/if}

            {#if isAdmin}
              <a href="/admin/users" class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-2">
                <Icon icon="heroicons:user-group" class="w-4 h-4" />
                {$t('header.manageUsers')}
              </a>
            {/if}

            <button
              class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-2 text-left"
            >
              <Icon icon="heroicons:user-circle" class="w-4 h-4" />
              {displayName}
            </button>
            <button
              on:click={handleLogout}
              class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors text-left"
            >
              {$t('header.logout')}
            </button>
          {:else}
            <button
              on:click={openLogin}
              class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors text-left"
            >
              {$t('header.login')}
            </button>
            <button
              on:click={openRegister}
              class="px-4 py-2 text-sm text-white bg-[#E10600] hover:bg-[#C10500] rounded-lg text-left"
            >
              {$t('header.signup')}
            </button>
          {/if}
        </nav>
      </div>
    {/if}
  </div>
</header>

<!-- Auth Modals -->
<LoginModal
  bind:isOpen={showLoginModal}
  on:switchToRegister={openRegister}
  on:requireVerification={handleVerificationRequired}
/>
<RegisterModal
  bind:isOpen={showRegisterModal}
  on:switchToLogin={openLogin}
  on:verificationRequested={handleVerificationRequested}
  on:verifiedWithoutCode={handleVerifiedWithoutCode}
/>
<EmailVerificationModal
  bind:isOpen={showVerificationModal}
  email={verificationEmail}
  initialCode={verificationCode}
  on:verified={handleVerificationSuccess}
/>
