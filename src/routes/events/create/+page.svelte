<script>
  import { goto } from '$app/navigation';
  import { createProtest } from '$lib/utils/api';
  import { authStore } from '$lib/stores/auth';
  import { t } from '$lib/i18n';
  import Icon from '$lib/components/common/Icon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import AddressGeocoder from '$lib/components/common/AddressGeocoder.svelte';
  import DateTimePicker from '$lib/components/common/DateTimePicker.svelte';

  let step = 1;
  const totalSteps = 3;

  // Form data
  let formData = {
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    address: '',
    city: '',
    country: '',
    lat: '',
    lon: '',
    detailsUrl: '',
    tags: '',
    expectedAttendees: ''
  };

  let error = '';
  let isLoading = false;

  // Helper to determine if error is a translation key or plain message
  $: errorMessage = error && error.startsWith('createEvent.') ? $t(error) : error;

  // Check authentication
  $: if (!$authStore.isAuthenticated && typeof window !== 'undefined') {
    goto('/');
  }

  function nextStep() {
    // Validate current step
    if (step === 1 && (!formData.title || !formData.description || !formData.startDateTime)) {
      error = 'createEvent.errorRequired';
      return;
    }
    if (step === 2 && (!formData.lat || !formData.lon || !formData.address)) {
      error = 'createEvent.errorLocation';
      return;
    }

    error = '';
    step++;
  }

  function handleAddressSelect(event) {
    const { lat, lon, address, city, country } = event.detail;
    formData.lat = lat.toString();
    formData.lon = lon.toString();
    formData.address = address;
    formData.city = city;
    formData.country = country;
  }

  function handleAddressClear() {
    formData.lat = '';
    formData.lon = '';
    formData.address = '';
    formData.city = '';
    formData.country = '';
  }

  function prevStep() {
    error = '';
    step--;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    isLoading = true;
    error = '';

    try {
      // Prepare data for API (matching backend schema)
      const protestData = {
        title: formData.title,
        start: new Date(formData.startDateTime),
        end: formData.endDateTime ? new Date(formData.endDateTime) : null,
        location: formData.address,
        city: formData.city || null,
        country: formData.country || null,
        source: 'Manual Submission',
        url: formData.detailsUrl || '',
        attendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null,
        language: null // Could be added based on user's locale
      };

      const response = await createProtest(protestData);

      if (response.error) {
        error = response.error;
      } else {
        // Success! Redirect to home or event detail
        goto('/');
      }
    } catch (err) {
      error = err.message || 'An error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>{$t('createEvent.title')} - Protest Listing</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-900 py-8 px-4">
  <div class="max-w-2xl mx-auto">
    <!-- Back Button -->
    <button
      on:click={() => goto('/')}
      class="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white mb-6 transition-colors"
    >
      <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
      {$t('common.backToHome')}
    </button>

    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex justify-between text-sm text-black/60 dark:text-white/60 mb-2">
        <span>{$t('createEvent.stepOf', { values: { current: step, total: totalSteps } })}</span>
        <span>{Math.round((step / totalSteps) * 100)}%</span>
      </div>
      <div class="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-[#E10600] transition-all duration-300"
          style="width: {(step / totalSteps) * 100}%"
        ></div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 md:p-8">
      {#if error}
        <div class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 flex items-start gap-3">
          <Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      {/if}

      <form on:submit={handleSubmit}>
        {#if step === 1}
          <!-- Step 1: Basic Info & Date/Time -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white">{$t('createEvent.step1Title')}</h2>

            <Input
              bind:value={formData.title}
              label={$t('createEvent.eventTitle')}
              required
            />

            <div>
              <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="event-description">
                {$t('createEvent.description')} <span class="text-red-500">*</span>
              </label>
              <textarea
                id="event-description"
                bind:value={formData.description}
                required
                rows="5"
                class="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-700 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 resize-none transition-all"
              ></textarea>
              <span class="text-xs text-black/40 dark:text-white/40">
                {$t('createEvent.charactersCount', { values: { count: formData.description.length } })}
              </span>
            </div>

            <DateTimePicker
              bind:startDateTime={formData.startDateTime}
              bind:endDateTime={formData.endDateTime}
              required={true}
            />
          </div>
        {:else if step === 2}
          <!-- Step 2: Location -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white">{$t('createEvent.step3Title')}</h2>

            <AddressGeocoder
              initialAddress={formData.address}
              initialCity={formData.city}
              initialCountry={formData.country}
              on:select={handleAddressSelect}
              on:clear={handleAddressClear}
            />
          </div>
        {:else if step === 3}
          <!-- Step 3: Additional Info -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white">{$t('createEvent.step4Title')}</h2>

            <Input
              bind:value={formData.detailsUrl}
              label={$t('createEvent.detailsUrl')}
              type="url"
              placeholder={$t('createEvent.detailsUrlPlaceholder')}
              helper={$t('createEvent.detailsUrlHelper')}
            />

            <Input
              bind:value={formData.tags}
              label={$t('createEvent.tags')}
              placeholder={$t('createEvent.tagsPlaceholder')}
              helper={$t('createEvent.tagsHelper')}
            />

            <Input
              bind:value={formData.expectedAttendees}
              label={$t('createEvent.expectedAttendees')}
              type="number"
              placeholder={$t('createEvent.attendeesPlaceholder')}
              helper={$t('createEvent.attendeesHelper')}
            />
          </div>
        {/if}

        <!-- Navigation Buttons -->
        <div class="flex gap-4 mt-8">
          {#if step > 1}
            <Button variant="secondary" on:click={prevStep} fullWidth>
              <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
              {$t('createEvent.back')}
            </Button>
          {/if}

          {#if step < totalSteps}
            <Button variant="primary" on:click={nextStep} fullWidth>
              {$t('createEvent.next')}
              <Icon icon="heroicons:arrow-right" class="w-5 h-5" />
            </Button>
          {:else}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
              {#if isLoading}
                <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                {$t('createEvent.submitting')}
              {:else}
                <Icon icon="heroicons:check" class="w-5 h-5" />
                {$t('createEvent.submit')}
              {/if}
            </Button>
          {/if}
        </div>
      </form>
    </div>
  </div>
</div>
