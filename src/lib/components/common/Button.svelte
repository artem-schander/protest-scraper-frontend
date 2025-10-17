<script>
  export let variant = 'primary'; // primary, secondary, ghost
  export let size = 'md'; // sm, md, lg
  export let type = 'button';
  export let disabled = false;
  export let fullWidth = false;

  const variants = {
    primary: 'bg-[#E10600] text-white hover:bg-[#C10500] hover:shadow-lg',
    secondary: 'bg-white dark:bg-stone-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
    ghost: 'bg-transparent text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
</script>

<button
  {type}
  {disabled}
  on:click
  class="
    {variants[variant]}
    {sizes[size]}
    {fullWidth ? 'w-full' : ''}
    rounded-xl
    font-medium
    transform hover:scale-[1.02] active:scale-[0.98]
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    flex items-center justify-center gap-2
  "
>
  <slot />
</button>
