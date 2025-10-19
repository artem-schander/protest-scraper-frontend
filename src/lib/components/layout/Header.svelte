<script>
  import Icon from '$lib/components/common/Icon.svelte';
  import { authStore } from '$lib/stores/auth';
  import LoginModal from '$lib/components/auth/LoginModal.svelte';
  import RegisterModal from '$lib/components/auth/RegisterModal.svelte';
  import ThemeToggle from '$lib/components/common/ThemeToggle.svelte';
  import { LANGUAGE_OPTIONS, locale, setAppLocale, t } from '$lib/i18n';
  import { get } from 'svelte/store';

  let showLoginModal = false;
  let showRegisterModal = false;
  let showMobileMenu = false;
  let selectedLocale = 'en';

  $: selectedLocale = $locale;

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

  function handleLogout() {
    authStore.logout();
  }

  function setLanguage(nextLocale) {
    if (nextLocale && nextLocale !== get(locale)) {
      setAppLocale(nextLocale);
    }
  }
</script>

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

      <!-- Auth Buttons (Desktop) -->
      <div class="hidden lg:flex items-center gap-3">
        <div class="flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1" aria-label={$t('header.language')}>
          {#each LANGUAGE_OPTIONS as option}
            <button
              type="button"
              class={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                option.code === selectedLocale
                  ? 'bg-[#E10600] text-white'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
              on:click={() => setLanguage(option.code)}
              aria-pressed={option.code === selectedLocale}
            >
              {option.label}
            </button>
          {/each}
        </div>
        <ThemeToggle />
        <!-- TODO: auth -->
        <!-- {#if $authStore.isAuthenticated} -->
        <!--  <button -->
        <!--    on:click={() => window.location.href = '/events/create'} -->
        <!--    class="flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors" -->
        <!--  > -->
        <!--    <Icon icon="heroicons:plus" class="w-4 h-4" /> -->
        <!--    Create Event -->
        <!--  </button> -->
        <!--  <button -->
        <!--    class="flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors" -->
        <!--  > -->
        <!--    <Icon icon="heroicons:user-circle" class="w-5 h-5" /> -->
        <!--    {$authStore.user?.email || 'Profile'} -->
        <!--  </button> -->
        <!--  <button -->
        <!--    on:click={handleLogout} -->
        <!--    class="px-4 py-2 text-sm text-black dark:text-white border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors" -->
        <!--  > -->
        <!--    Logout -->
        <!--  </button> -->
        <!-- {:else} -->
        <!--  <button -->
        <!--    on:click={openLogin} -->
        <!--    class="px-4 py-2 text-sm text-black dark:text-white hover:bg-stone-50 dark:hover:bg-stone-700 rounded-lg transition-colors" -->
        <!--  > -->
        <!--    Login -->
        <!--  </button> -->
        <!--  <button -->
        <!--    on:click={openRegister} -->
        <!--    class="px-4 py-2 text-sm text-white bg-[#E10600] hover:bg-[#C10500] rounded-lg hover:shadow-lg transition-all" -->
        <!--  > -->
        <!--    Sign Up -->
        <!--  </button> -->
        <!-- {/if} -->
      </div>

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
      </div>
    {/if}
  </div>
</header>

<!-- Auth Modals -->
<LoginModal bind:isOpen={showLoginModal} on:switchToRegister={openRegister} />
<RegisterModal bind:isOpen={showRegisterModal} on:switchToLogin={openLogin} />
