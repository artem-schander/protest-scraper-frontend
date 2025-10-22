<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import { apiRequest } from '$lib/utils/api';
  import { notificationStore } from '$lib/stores/notification';
  import Icon from '@iconify/svelte';

  const TOPICS = [
    'General Inquiry',
    'Suggest Data Source',
    'Technical Support',
    'Report Event Issue',
    'Partnership Inquiry',
    'Press & Media',
    'Privacy Concerns',
    'Legal Question',
    'Other'
  ];

  let formData = {
    name: '',
    email: '',
    topic: '',
    customTopic: '',
    message: ''
  };

  let errors = {
    name: '',
    email: '',
    topic: '',
    customTopic: '',
    message: ''
  };

  let isSubmitting = false;
  let showCustomTopic = false;

  // Anti-spam measures
  let honeypot = ''; // Should remain empty
  let formLoadTime = 0;
  let proofOfWork = null; // Will contain challenge and solution

  // Pre-select topic from URL parameter
  onMount(() => {
    formLoadTime = Date.now();

    // Generate invisible proof-of-work challenge
    generateProofOfWork();

    const topicParam = $page.url.searchParams.get('topic');
    if (topicParam && TOPICS.includes(topicParam)) {
      formData.topic = topicParam;
      showCustomTopic = topicParam === 'Other';
    }
  });

  /**
   * Generate SHA-256 proof-of-work challenge
   * Client must find a nonce where hash(challenge + nonce) starts with '000'
   * Takes ~100ms on modern devices, makes mass spam harder
   */
  async function generateProofOfWork() {
    const challenge = Math.random().toString(36).substring(2, 15);
    const difficulty = '000'; // 3 leading zeros = ~16^3 = 4096 attempts average
    let nonce = 0;
    let hash = '';

    const startTime = Date.now();

    while (!hash.startsWith(difficulty)) {
      const text = challenge + nonce;
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      nonce++;
    }

    const timeSpent = Date.now() - startTime;
    console.log(`Proof-of-work completed in ${timeSpent}ms (${nonce} attempts)`);

    proofOfWork = { challenge, nonce: nonce - 1, hash };
  }

  $: showCustomTopic = formData.topic === 'Other';

  function validateForm() {
    let isValid = true;
    errors = { name: '', email: '', topic: '', customTopic: '', message: '' };

    // Name validation
    if (!formData.name.trim()) {
      errors.name = $t('contact.errors.nameRequired');
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = $t('contact.errors.nameTooShort');
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = $t('contact.errors.emailRequired');
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = $t('contact.errors.emailInvalid');
      isValid = false;
    }

    // Topic validation
    if (!formData.topic) {
      errors.topic = $t('contact.errors.topicRequired');
      isValid = false;
    }

    // Custom topic validation
    if (formData.topic === 'Other' && !formData.customTopic.trim()) {
      errors.customTopic = $t('contact.errors.customTopicRequired');
      isValid = false;
    } else if (formData.topic === 'Other' && formData.customTopic.trim().length < 3) {
      errors.customTopic = $t('contact.errors.customTopicTooShort');
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = $t('contact.errors.messageRequired');
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = $t('contact.errors.messageTooShort');
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Anti-spam checks
    if (honeypot) {
      // Honeypot filled - likely a bot
      console.warn('Spam detected: honeypot filled');
      return;
    }

    const timeSpent = Date.now() - formLoadTime;
    if (timeSpent < 3000) {
      // Submitted too quickly (less than 3 seconds)
      notificationStore.add({
        type: 'error',
        title: 'Too Fast',
        message: 'Please take a moment to review your message before submitting.',
        duration: 5000
      });
      return;
    }

    if (!proofOfWork) {
      // Proof-of-work not completed
      notificationStore.add({
        type: 'error',
        title: 'Please Wait',
        message: 'Security check is still processing. Please try again in a moment.',
        duration: 5000
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          proofOfWork
        })
      });

      notificationStore.add({
        type: 'success',
        title: $t('contact.success.title'),
        message: $t('contact.success.message'),
        duration: 5000
      });

      // Reset form
      formData = {
        name: '',
        email: '',
        topic: '',
        customTopic: '',
        message: ''
      };
      showCustomTopic = false;

      // Redirect to home after short delay
      setTimeout(() => {
        goto('/');
      }, 2000);
    } catch (error) {
      notificationStore.add({
        type: 'error',
        title: $t('contact.error.title'),
        message: error.message || $t('contact.error.message'),
        duration: 5000
      });
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('contact.pageTitle')} - Protest Listing</title>
  <meta name="description" content={$t('contact.metaDescription')} />
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-900 py-12 px-4 transition-colors">
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6">
        <Icon icon="heroicons:envelope" class="w-8 h-8 text-white" />
      </div>
      <h1 class="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
        {$t('contact.title')}
      </h1>
      <p class="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
        {$t('contact.subtitle')}
      </p>
    </div>

    <!-- Contact Form -->
    <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 md:p-12 transition-colors">
      <form on:submit={handleSubmit} class="space-y-6">
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-semibold text-black dark:text-white mb-2">
            {$t('contact.form.name')} <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            disabled={isSubmitting}
            class="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 rounded-xl
                   bg-white dark:bg-stone-700 text-black dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all"
            placeholder={$t('contact.form.namePlaceholder')}
          />
          {#if errors.name}
            <p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.name}</p>
          {/if}
        </div>

        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-semibold text-black dark:text-white mb-2">
            {$t('contact.form.email')} <span class="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            bind:value={formData.email}
            disabled={isSubmitting}
            class="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 rounded-xl
                   bg-white dark:bg-stone-700 text-black dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all"
            placeholder={$t('contact.form.emailPlaceholder')}
          />
          {#if errors.email}
            <p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
          {/if}
        </div>

        <!-- Topic Field -->
        <div>
          <label for="topic" class="block text-sm font-semibold text-black dark:text-white mb-2">
            {$t('contact.form.topic')} <span class="text-red-500">*</span>
          </label>
          <select
            id="topic"
            bind:value={formData.topic}
            disabled={isSubmitting}
            class="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 rounded-xl
                   bg-white dark:bg-stone-700 text-black dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3cpath%20fill%3D%22%23374151%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3c%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat
                   dark:bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3cpath%20fill%3D%22%23d1d5db%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3c%2Fsvg%3E')]
                   transition-all"
          >
            <option value="">{$t('contact.form.topicPlaceholder')}</option>
            {#each TOPICS as topic}
              <option value={topic}>{$t(`contact.topics.${topic.toLowerCase().replace(/ /g, '_')}`)}</option>
            {/each}
          </select>
          {#if errors.topic}
            <p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.topic}</p>
          {/if}
        </div>

        <!-- Custom Topic Field (conditional) -->
        {#if showCustomTopic}
          <div class="transition-all">
            <label for="customTopic" class="block text-sm font-semibold text-black dark:text-white mb-2">
              {$t('contact.form.customTopic')} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customTopic"
              bind:value={formData.customTopic}
              disabled={isSubmitting}
              class="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 rounded-xl
                     bg-white dark:bg-stone-700 text-black dark:text-white
                     focus:ring-2 focus:ring-red-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all"
              placeholder={$t('contact.form.customTopicPlaceholder')}
            />
            {#if errors.customTopic}
              <p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.customTopic}</p>
            {/if}
          </div>
        {/if}

        <!-- Message Field -->
        <div>
          <label for="message" class="block text-sm font-semibold text-black dark:text-white mb-2">
            {$t('contact.form.message')} <span class="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            bind:value={formData.message}
            disabled={isSubmitting}
            rows="8"
            class="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 rounded-xl
                   bg-white dark:bg-stone-700 text-black dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   resize-y transition-all"
            placeholder={$t('contact.form.messagePlaceholder')}
          />
          <div class="flex">
            {#if errors.message}
              <p class="mt-2 text-sm text-red-500 dark:text-red-400">{errors.message}</p>
            {/if}
            <div class="grow"></div>
            <p class="mt-2 text-sm text-black/60 dark:text-white/60">
              {formData.message.length} / 5000 {$t('contact.form.characters')}
            </p>
          </div>
        </div>

        <!-- Honeypot Field (hidden from humans, visible to bots) -->
        <div class="hidden" aria-hidden="true">
          <label for="website">Website (leave blank)</label>
          <input
            type="text"
            id="website"
            name="website"
            bind:value={honeypot}
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex items-center justify-between pt-4">
          <button
            type="button"
            on:click={() => goto('/')}
            disabled={isSubmitting}
            class="px-6 py-3 text-black dark:text-white dark:bg-stone-700/50 bg-stone-200/50 hover:bg-stone-200 dark:hover:bg-stone-700
                   rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {$t('contact.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold
                   rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   transition-all duration-200 flex items-center gap-2"
          >
            {#if isSubmitting}
              <Icon icon="svg-spinners:ring-resize" class="w-5 h-5" />
              {$t('contact.form.sending')}
            {:else}
              <Icon icon="heroicons:paper-airplane" class="w-5 h-5" />
              {$t('contact.form.send')}
            {/if}
          </button>
        </div>
      </form>
    </div>

    <!-- Additional Info -->
    <div class="mt-8 text-center">
      <p class="text-sm text-black/60 dark:text-white/60">
        {$t('contact.responseTime')}
      </p>
    </div>
  </div>
</div>
