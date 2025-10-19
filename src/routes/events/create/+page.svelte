<script>
  import { goto } from '$app/navigation';
  import { createProtest } from '$lib/utils/api';
  import { authStore } from '$lib/stores/auth';
  import Icon from '$lib/components/common/Icon.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import Input from '$lib/components/common/Input.svelte';

  let step = 1;
  const totalSteps = 4;

  // Form data
  let formData = {
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    address: '',
    city: '',
    country: '',
    lat: '',
    lon: '',
    source: '',
    sourceUrl: '',
    tags: '',
    expectedAttendees: ''
  };

  let error = '';
  let isLoading = false;
  let useGeolocation = false;

  // Check authentication
  $: if (!$authStore.isAuthenticated && typeof window !== 'undefined') {
    goto('/');
  }

  function nextStep() {
    // Validate current step
    if (step === 1 && (!formData.title || !formData.description)) {
      error = 'Please fill in all required fields';
      return;
    }
    if (step === 2 && (!formData.startDate || !formData.startTime)) {
      error = 'Please select start date and time';
      return;
    }
    if (step === 3 && (!formData.address || !formData.city || !formData.country)) {
      error = 'Please fill in all location fields';
      return;
    }

    error = '';
    step++;
  }

  function prevStep() {
    error = '';
    step--;
  }

  function handleUseLocation() {
    if (navigator.geolocation) {
      useGeolocation = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          formData.lat = position.coords.latitude.toString();
          formData.lon = position.coords.longitude.toString();
          useGeolocation = false;
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
          useGeolocation = false;
        }
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.source) {
      error = 'Please select a source';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Prepare data for API (matching backend schema)
      const protestData = {
        title: formData.title,
        start: new Date(`${formData.startDate}T${formData.startTime}`),
        end: formData.endDate && formData.endTime
          ? new Date(`${formData.endDate}T${formData.endTime}`)
          : null,
        location: formData.address,
        city: formData.city || null,
        country: formData.country || null,
        source: formData.source || 'Manual Submission',
        url: formData.sourceUrl || '',
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
  <title>Create Event - Protest Listing</title>
</svelte:head>

<div class="min-h-screen bg-[#EEEEEE] dark:bg-gray-900 py-8 px-4">
  <div class="max-w-2xl mx-auto">
    <!-- Back Button -->
    <button
      on:click={() => goto('/')}
      class="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white mb-6 transition-colors"
    >
      <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
      Back to Home
    </button>

    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex justify-between text-sm text-black/60 dark:text-white/60 mb-2">
        <span>Step {step} of {totalSteps}</span>
        <span>{Math.round((step / totalSteps) * 100)}%</span>
      </div>
      <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-[#E10600] transition-all duration-300"
          style="width: {(step / totalSteps) * 100}%"
        ></div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      {#if error}
        <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-red-700">{error}</p>
        </div>
      {/if}

      <form on:submit={handleSubmit}>
        {#if step === 1}
          <!-- Step 1: Basic Info -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white dark:text-white">Basic Information</h2>

            <Input
              bind:value={formData.title}
              label="Event Title"
              placeholder="Climate Action March"
              required
            />

            <div>
              <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="event-description">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                id="event-description"
                bind:value={formData.description}
                required
                rows="5"
                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 resize-none transition-all"
                placeholder="Describe the event..."
              ></textarea>
              <span class="text-xs text-black/40 dark:text-white/40">
                {formData.description.length}/500 characters
              </span>
            </div>

            <Input
              bind:value={formData.imageUrl}
              label="Event Image URL"
              type="url"
              placeholder="https://images.unsplash.com/..."
              helper="Optional: Link to image from Unsplash or Pexels"
            />
          </div>
        {:else if step === 2}
          <!-- Step 2: Date & Time -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white">Date & Time</h2>

            <div class="grid grid-cols-2 gap-4">
              <Input
                bind:value={formData.startDate}
                label="Start Date"
                type="date"
                required
              />
              <Input
                bind:value={formData.startTime}
                label="Start Time"
                type="time"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <Input
                bind:value={formData.endDate}
                label="End Date"
                type="date"
                helper="Optional"
              />
              <Input
                bind:value={formData.endTime}
                label="End Time"
                type="time"
                helper="Optional"
              />
            </div>
          </div>
        {:else if step === 3}
          <!-- Step 3: Location -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white">Location</h2>

            <Input
              bind:value={formData.address}
              label="Address/Meeting Point"
              placeholder="Brandenburg Gate"
              required
            />

            <Input
              bind:value={formData.city}
              label="City"
              placeholder="Berlin"
              required
            />

            <div>
              <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="event-country">
                Country <span class="text-red-500">*</span>
              </label>
              <select
                id="event-country"
                bind:value={formData.country}
                required
                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
              >
                <option value="">Select country</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="Austria">🇦🇹 Austria</option>
                <option value="Switzerland">🇨🇭 Switzerland</option>
                <option value="France">🇫🇷 France</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Netherlands">🇳🇱 Netherlands</option>
                <option value="Belgium">🇧🇪 Belgium</option>
                <option value="Other">🌍 Other</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <Input
                bind:value={formData.lat}
                label="Latitude"
                type="number"
                step="any"
                placeholder="52.516"
                helper="Optional"
              />
              <Input
                bind:value={formData.lon}
                label="Longitude"
                type="number"
                step="any"
                placeholder="13.377"
                helper="Optional"
              />
            </div>

            <button
              type="button"
              on:click={handleUseLocation}
              disabled={useGeolocation}
              class="flex items-center gap-2 text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600] text-sm font-medium disabled:opacity-50"
            >
              {#if useGeolocation}
                <Icon icon="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                Getting location...
              {:else}
                <Icon icon="heroicons:map-pin" class="w-4 h-4" />
                Use my location
              {/if}
            </button>
          </div>
        {:else if step === 4}
          <!-- Step 4: Additional Info -->
          <div class="space-y-6">
            <h2 class="text-2xl font-medium text-black dark:text-white">Additional Details</h2>

            <div>
              <label class="block text-sm text-black/60 dark:text-white/60 mb-2" for="event-source">
                Source/Organization <span class="text-red-500">*</span>
              </label>
              <select
                id="event-source"
                bind:value={formData.source}
                required
                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl focus:outline-none focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
              >
                <option value="">Select source</option>
                <option value="Berlin Police">Berlin Police</option>
                <option value="Dresden City">Dresden City</option>
                <option value="Friedenskooperative">Friedenskooperative</option>
                <option value="DemokraTEAM">DemokraTEAM</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              bind:value={formData.sourceUrl}
              label="Source URL"
              type="url"
              placeholder="https://..."
              helper="Optional: Link to original announcement"
            />

            <Input
              bind:value={formData.tags}
              label="Tags"
              placeholder="climate, protest, environment"
              helper="Separate multiple tags with commas"
            />

            <Input
              bind:value={formData.expectedAttendees}
              label="Expected Attendees"
              type="number"
              placeholder="500"
              helper="Optional: Estimated number of participants"
            />
          </div>
        {/if}

        <!-- Navigation Buttons -->
        <div class="flex gap-4 mt-8">
          {#if step > 1}
            <Button variant="secondary" on:click={prevStep} fullWidth>
              <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
              Back
            </Button>
          {/if}

          {#if step < totalSteps}
            <Button variant="primary" on:click={nextStep} fullWidth>
              Next
              <Icon icon="heroicons:arrow-right" class="w-5 h-5" />
            </Button>
          {:else}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
              {#if isLoading}
                <Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                Creating Event...
              {:else}
                <Icon icon="heroicons:check" class="w-5 h-5" />
                Create Event
              {/if}
            </Button>
          {/if}
        </div>
      </form>
    </div>
  </div>
</div>
