<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Input from '$lib/components/common/Input.svelte';
  import Icon from '$lib/components/common/Icon.svelte';
  import AddressGeocoder from '$lib/components/common/AddressGeocoder.svelte';
  import DateTimePicker from '$lib/components/common/DateTimePicker.svelte';
  import { t } from '$lib/i18n';
  import { updateProtest, getProtestById } from '$lib/utils/api';
  import { translateError } from '$lib/utils/errorHandler';
  import { notificationStore } from '$lib/stores/notification';

  export let isOpen = false;
  export let protestId = '';

  const dispatch = createEventDispatcher();

  let error = '';
  let isLoading = false;
  let isFetching = true;

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

  // Load event data when modal opens
  $: if (isOpen && protestId) {
    loadEventData();
  } else if (!isOpen) {
    resetForm();
  }

  async function loadEventData() {
    isFetching = true;
    error = '';

    try {
      const response = await getProtestById(protestId);

      if (response.error) {
        error = translateError(response);
        isFetching = false;
        return;
      }

      // Populate form with existing data
      formData.title = response.title || '';
      formData.description = ''; // Description not stored in backend yet
      formData.startDateTime = response.start ? new Date(response.start).toISOString().slice(0, 16) : '';
      formData.endDateTime = response.end ? new Date(response.end).toISOString().slice(0, 16) : '';
      formData.address = response.location || '';
      formData.city = response.city || '';
      formData.country = response.country || '';
      formData.lat = response.coordinates?.lat?.toString() || '';
      formData.lon = response.coordinates?.lon?.toString() || '';
      formData.detailsUrl = response.url || '';
      formData.tags = response.categories?.join(', ') || '';
      formData.expectedAttendees = response.attendees?.toString() || '';

      isFetching = false;
    } catch (err) {
      error = translateError(err);
      isFetching = false;
    }
  }

  function resetForm() {
    error = '';
    isLoading = false;
    isFetching = true;
    formData = {
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

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.startDateTime) {
      error = $t('createEvent.errorRequired');
      return;
    }
    if (!formData.lat || !formData.lon || !formData.address) {
      error = $t('createEvent.errorLocation');
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Prepare data for API
      const protestData = {
        title: formData.title,
        start: new Date(formData.startDateTime),
        end: formData.endDateTime ? new Date(formData.endDateTime) : null,
        location: formData.address,
        city: formData.city || null,
        country: formData.country || null,
        url: formData.detailsUrl || '',
        attendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null
      };

      const response = await updateProtest(protestId, protestData);

      if (response.error) {
        error = translateError(response);
      } else {
        notificationStore.add({
          type: 'success',
          title: $t('common.success'),
          message: $t('editEvent.updateSuccess'),
          duration: 5000
        });

        isOpen = false;
        dispatch('updated');
      }
    } catch (err) {
      error = translateError(err);
    } finally {
      isLoading = false;
    }
  }
</script>

<Modal bind:isOpen maxWidth="2xl">
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-medium text-black dark:text-white">{$t('editEvent.title')}</h2>
      <button
        type="button"
        on:click={() => (isOpen = false)}
        class="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
      >
        <Icon icon="heroicons:x-mark" class="w-6 h-6" />
      </button>
    </div>

    {#if isFetching}
      <div class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-3 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin"></div>
      </div>
    {:else}
      {#if error}
        <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 flex items-start gap-3">
          <Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      {/if}

      <form on:submit={handleSubmit} class="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
        <!-- Basic Info -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-black dark:text-white border-b border-stone-200 dark:border-stone-700 pb-2">
            {$t('createEvent.step1Title')}
          </h3>

          <Input
            bind:value={formData.title}
            label={$t('createEvent.eventTitle')}
            required
          />

          <DateTimePicker
            bind:startDateTime={formData.startDateTime}
            bind:endDateTime={formData.endDateTime}
            required={true}
          />
        </div>

        <!-- Location -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-black dark:text-white border-b border-stone-200 dark:border-stone-700 pb-2">
            {$t('createEvent.step3Title')}
          </h3>

          <AddressGeocoder
            showMap={false}
            required={true}
            label={$t('createEvent.address')}
            initialAddress={formData.address}
            initialCity={formData.city}
            initialCountry={formData.country}
            initialLat={formData.lat}
            initialLon={formData.lon}
            on:select={handleAddressSelect}
            on:clear={handleAddressClear}
          />
        </div>

        <!-- Additional Info -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-black dark:text-white border-b border-stone-200 dark:border-stone-700 pb-2">
            {$t('createEvent.step4Title')}
          </h3>

          <Input
            bind:value={formData.detailsUrl}
            label={$t('createEvent.detailsUrl')}
            type="url"
            placeholder={$t('createEvent.detailsUrlPlaceholder')}
            helper={$t('createEvent.detailsUrlHelper')}
          />

          <Input
            bind:value={formData.expectedAttendees}
            label={$t('createEvent.expectedAttendees')}
            type="number"
            placeholder={$t('createEvent.attendeesPlaceholder')}
            helper={$t('createEvent.attendeesHelper')}
          />
        </div>

        <!-- Submit Button -->
        <div class="sticky bottom-0 bg-white dark:bg-stone-800 pt-4 -mx-2 px-2 border-t border-stone-200 dark:border-stone-700">
          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {#if isLoading}
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {$t('editEvent.saving')}
            {:else}
              <Icon icon="heroicons:check" class="w-5 h-5" />
              {$t('editEvent.save')}
            {/if}
          </Button>
        </div>
      </form>
    {/if}
  </div>
</Modal>
