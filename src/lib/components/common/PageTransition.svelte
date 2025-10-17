<script>
  import { fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let key;
</script>

{#key key}
  <div
    in:fade|global={{ duration: 200, delay: 200, easing: quintOut }}
    out:fade|global={{ duration: 200, easing: quintOut }}
  >
    <slot />
  </div>
{/key}
