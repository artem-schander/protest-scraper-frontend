<script>
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/common/Icon.svelte';

  export let activeFilter = 'all';

  const filters = [
    { id: 'all', label: 'All', icon: 'heroicons:squares-2x2' },
    { id: 'today', label: 'Today', icon: 'heroicons:calendar' },
    { id: 'week', label: 'This Week', icon: 'heroicons:calendar-days' },
    { id: 'month', label: 'This Month', icon: 'heroicons:calendar' },
    { id: 'near', label: 'Near Me', icon: 'heroicons:map-pin' }
  ];

  function handleFilterClick(filterId) {
    // Update URL with filter parameter
    const url = new URL(window.location.href);

    switch (filterId) {
      case 'today':
        url.searchParams.set('dateRange', '1');
        break;
      case 'week':
        url.searchParams.set('dateRange', '7');
        break;
      case 'month':
        url.searchParams.set('dateRange', '30');
        break;
      case 'near':
        // Trigger geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              url.searchParams.set('lat', position.coords.latitude.toString());
              url.searchParams.set('lon', position.coords.longitude.toString());
              url.searchParams.set('radius', '50');
              goto(url.toString());
            },
            (error) => {
              console.error('Geolocation error:', error);
              alert('Unable to get your location. Please enable location services.');
            }
          );
        }
        return;
      default:
        url.searchParams.delete('dateRange');
        url.searchParams.delete('lat');
        url.searchParams.delete('lon');
        url.searchParams.delete('radius');
    }

    goto(url.toString());
  }
</script>

<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
  {#each filters as filter}
    <button
      on:click={() => handleFilterClick(filter.id)}
      class="
        flex items-center gap-2
        px-4 py-2 rounded-full
        text-sm font-bold
        whitespace-nowrap
        transition-all duration-200
        {activeFilter === filter.id
          ? 'bg-[#E10600] text-white shadow-md hover:bg-[#C10500]'
          : 'bg-white dark:bg-stone-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'}
      "
    >
      <Icon icon={filter.icon} class="w-4 h-4" />
      {filter.label}
    </button>
  {/each}
</div>
