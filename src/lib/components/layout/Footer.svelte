<script>
  import { env } from '$env/dynamic/public';
  import Icon from '$lib/components/common/Icon.svelte';
  import { t } from '$lib/i18n';

  const currentYear = new Date().getFullYear();
  const githubUrl = env.PUBLIC_GITHUB_URL;
</script>

<footer class="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700">
  <div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <Icon icon="heroicons:megaphone" class="w-6 h-6 text-[#E10600]" />
          <span class="font-bold text-lg text-black dark:text-white">
            {$t('footer.brandName')}
          </span>
        </div>
        <p class="text-sm text-black/60 dark:text-white/60">
          {$t('footer.tagline')}
        </p>
      </div>

      <div class="space-y-3">
        <h3 class="font-semibold text-black dark:text-white">
          {$t('footer.quickLinks')}
        </h3>
        <nav class="flex flex-col space-y-2 text-sm">
          <a href="/" class="text-black/60 dark:text-white/60 hover:text-[#E10600] dark:hover:text-red-400 transition-colors">
            {$t('footer.links.home')}
          </a>
          <a href="/about" class="text-black/60 dark:text-white/60 hover:text-[#E10600] dark:hover:text-red-400 transition-colors">
            {$t('footer.links.about')}
          </a>
        </nav>
      </div>

      <div class="space-y-3">
        <h3 class="font-semibold text-black dark:text-white">
          {$t('footer.legal')}
        </h3>
        <nav class="flex flex-col space-y-2 text-sm">
          <a href="/imprint" class="text-black/60 dark:text-white/60 hover:text-[#E10600] dark:hover:text-red-400 transition-colors">
            {$t('footer.links.imprint')}
          </a>
          <a href="/disclaimer" class="text-black/60 dark:text-white/60 hover:text-[#E10600] dark:hover:text-red-400 transition-colors">
            {$t('footer.links.disclaimer')}
          </a>
          <a href="/privacy" class="text-black/60 dark:text-white/60 hover:text-[#E10600] dark:hover:text-red-400 transition-colors">
            {$t('footer.links.privacy')}
          </a>
        </nav>
      </div>
    </div>

    <div class="mt-8 pt-8 border-t border-stone-200 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-black/60 dark:text-white/60">
      <p>
        {$t('footer.copyright', { values: { year: currentYear } })}
      </p>

      {#if githubUrl}
        <div class="flex items-center gap-4">
          <a href="{githubUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-[#E10600] dark:hover:text-red-400 transition-colors" aria-label={$t('footer.githubAria')}>
            <Icon icon="heroicons:code-bracket" class="w-5 h-5" />
          </a>
        </div>
      {/if}
    </div>
  </div>
</footer>
