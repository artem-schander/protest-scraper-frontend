<script>
  import { createEventDispatcher, onDestroy, tick } from 'svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import { t } from '$lib/i18n';
  import { verifyEmailCode, resendVerification } from '$lib/utils/api';
  import { authStore } from '$lib/stores/auth';
  import { translateError } from '$lib/utils/errorHandler';

  const RESEND_COOLDOWN_SECONDS = 45;

  export let isOpen = false;
  export let email = '';
  export let initialCode = '';

  const dispatch = createEventDispatcher();

  let error = '';
  let info = '';
  let isLoading = false;
  let isResending = false;
  let resendCooldown = 0;
  let countdownTimer;
  let codeDigits = Array(6).fill('');
  let debugCode = '';
  let lastAppliedCode = '';

  const allowedCharacters = /[A-Z0-9]/;

  function resetForm(preserveEmail = true) {
    error = '';
    info = '';
    isLoading = false;
    isResending = false;
    resendCooldown = 0;
    debugCode = '';
    codeDigits = Array(6).fill('');
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = undefined;
    }
  }

  function startCountdown() {
    stopCountdown();
    resendCooldown = RESEND_COOLDOWN_SECONDS;
    countdownTimer = setInterval(() => {
      resendCooldown -= 1;
      if (resendCooldown <= 0) {
        stopCountdown();
        resendCooldown = 0;
      }
    }, 1000);
  }

  async function focusInput(index = 0) {
    if (typeof document === 'undefined') return;
    await tick();
    const field = document.getElementById(`verification-code-${index}`);
    if (field && field instanceof HTMLInputElement) {
      field.focus();
      field.select();
    }
  }

  function handleCharacterInput(index, value) {
    if (!value) {
      codeDigits[index] = '';
      return;
    }

    const upper = value.toUpperCase();
    const char = upper[upper.length - 1];
    if (allowedCharacters.test(char)) {
      codeDigits[index] = char;
      if (index < codeDigits.length - 1) {
        focusInput(index + 1);
      }
    } else {
      // revert to previous character
      codeDigits[index] = '';
    }
  }

  function handleInput(event, index) {
    const { value } = event.target;
    handleCharacterInput(index, value);
  }

  function handleKeyDown(event, index) {
    if (event.key === 'Backspace') {
      if (codeDigits[index]) {
        codeDigits[index] = '';
      } else if (index > 0) {
        focusInput(index - 1);
      }
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && index < codeDigits.length - 1) {
      focusInput(index + 1);
      event.preventDefault();
    }
  }

  function handlePaste(event) {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleaned) return;

    for (let i = 0; i < codeDigits.length; i += 1) {
      codeDigits[i] = cleaned[i] || '';
    }
    focusInput(Math.min(cleaned.length, codeDigits.length - 1));
  }

  function combinedCode() {
    return codeDigits.join('');
  }

  async function submitVerification() {
    if (!email) {
      error = $t('auth.verification.missingEmail');
      return;
    }

    const code = combinedCode();
    if (code.length !== 6) {
      error = $t('auth.verification.enterCode');
      return;
    }

    isLoading = true;
    error = '';
    info = '';

    const response = await verifyEmailCode(email, code);

    if (response.error) {
      error = translateError(response);
      if (response.requiresResend) {
        startCountdown();
      }
    } else if (response.user) {
      authStore.login(response.user);
      dispatch('verified', { user: response.user });
      info = $t('auth.verification.success');
      resetForm();
      isOpen = false;
    } else {
      error = $t('auth.verification.unexpectedResponse');
    }

    isLoading = false;
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) {
      return;
    }

    isResending = true;
    error = '';
    info = '';

    const response = await resendVerification(email);
    if (response.error) {
      error = translateError(response);
    } else {
      info = $t('auth.verification.codeSent');
      if (response.debugVerificationCode) {
        debugCode = response.debugVerificationCode;
        if (debugCode.length === 6) {
          codeDigits = debugCode.split('');
        }
      }
      startCountdown();
    }

    isResending = false;
  }

  $: if (isOpen) {
    if (initialCode && initialCode.length === 6 && initialCode !== lastAppliedCode) {
      const cleaned = initialCode.toUpperCase();
      codeDigits = cleaned.split('');
      debugCode = cleaned;
      lastAppliedCode = initialCode;
      focusInput(cleaned.length < 6 ? cleaned.length : codeDigits.length - 1);
    } else if (!codeDigits.some(Boolean)) {
      focusInput(0);
    }
  } else {
    stopCountdown();
    lastAppliedCode = '';
  }

  onDestroy(() => {
    stopCountdown();
  });
</script>

<Modal bind:isOpen maxWidth="md">
  <form
    class="space-y-6"
    on:submit|preventDefault={submitVerification}
  >
    <div class="text-center space-y-2">
      <h2 class="text-2xl font-medium text-black dark:text-white">{$t('auth.verification.title')}</h2>
      <p class="text-sm text-black/60 dark:text-white/60">
        {$t('auth.verification.instructions', { values: { email } })}
      </p>
    </div>

    {#if debugCode}
      <div class="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-200">
        <p class="font-medium">{$t('auth.verification.devMode')}</p>
        <p>{$t('auth.verification.devCodeHint', { values: { code: debugCode } })}</p>
      </div>
    {/if}

    {#if error}
      <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-start gap-3">
        <Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <p class="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    {/if}

    {#if info}
      <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
        <Icon icon="heroicons:check-circle" class="w-5 h-5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
        <p class="text-sm text-emerald-700 dark:text-emerald-300">{info}</p>
      </div>
    {/if}

    <div class="flex justify-center gap-2" on:paste={handlePaste}>
      {#each codeDigits as digit, index (index)}
        <input
          id={`verification-code-${index}`}
          value={digit}
          maxlength="1"
          autocapitalize="characters"
          autocomplete="one-time-code"
          inputmode="text"
          class="w-12 h-14 text-center text-xl font-semibold border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E10600]"
          on:input={(event) => handleInput(event, index)}
          on:keydown={(event) => handleKeyDown(event, index)}
        />
      {/each}
    </div>

    <div class="space-y-3 text-sm text-black/60 dark:text-white/60">
      <p>{$t('auth.verification.notReceived')}</p>
      <button
        type="button"
        class="font-medium text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600]"
        on:click={handleResend}
        disabled={resendCooldown > 0 || isResending}
      >
        {#if resendCooldown > 0}
          {$t('auth.verification.resendCooldown', { values: { seconds: resendCooldown } })}
        {:else if isResending}
          {$t('auth.verification.sending')}
        {:else}
          {$t('auth.verification.resend')}
        {/if}
      </button>
    </div>

    <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
      {#if isLoading}
        <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        {$t('auth.verification.verifying')}
      {:else}
        {$t('auth.verification.submit')}
      {/if}
    </Button>
  </form>
</Modal>
