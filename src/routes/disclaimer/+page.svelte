<script>
  import Icon from '$lib/components/common/Icon.svelte';
  import { locale, t } from '$lib/i18n';

  export let data;
  const env = data?.publicEnv ?? {};

  $: contactEmail = env.PUBLIC_IMPRINT_EMAIL || 'contact@example.com';
  const lastUpdated = new Date('2025-10-20');

  const generalInfoParagraphs = ['generalInfoText1', 'generalInfoText2'];
  const liabilityContentParagraphs = ['liabilityContentText1', 'liabilityContentText2', 'liabilityContentText3'];
  const liabilityLinksParagraphs = ['liabilityLinksText1', 'liabilityLinksText2'];
  const userContentItems = ['accurate', 'legal', 'rights', 'offensive', 'violence'];
  const noWarrantyItems = ['accuracy', 'availability', 'suitability', 'safety'];
  const limitationLiabilityItems = ['use', 'inaccurate', 'attendance', 'interactions', 'technical', 'data'];
  const safetyNoticeItems = ['verify', 'aware', 'consider', 'follow', 'respect'];
</script>

<svelte:head>
  <title>{$t('disclaimer.title')} - Protest Listing</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12 md:py-16">
  <div class="mb-8">
    <h1 class="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
      {$t('disclaimer.title')}
    </h1>
    <p class="text-black/60 dark:text-white/60">
      {$t('disclaimer.subtitle')}
    </p>
  </div>

  <div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 md:p-8 space-y-8">
    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:information-circle" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.generalInfo')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        {#each generalInfoParagraphs as paragraphKey}
          <p>{$t(`disclaimer.${paragraphKey}`)}</p>
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:document-text" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.liabilityContent')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        {#each liabilityContentParagraphs as paragraphKey}
          <p>{$t(`disclaimer.${paragraphKey}`)}</p>
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:link" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.liabilityLinks')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        {#each liabilityLinksParagraphs as paragraphKey}
          <p>{$t(`disclaimer.${paragraphKey}`)}</p>
        {/each}
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:users" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.userContent')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('disclaimer.userContentText')}</p>
        <ul class="list-disc list-outside space-y-2 pl-5">
          {#each userContentItems as itemKey}
            <li>{$t(`disclaimer.userContentItems.${itemKey}`)}</li>
          {/each}
        </ul>
        <p>{$t('disclaimer.userContentNote')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:shield-exclamation" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.noWarranty')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('disclaimer.noWarrantyText')}</p>
        <ul class="list-disc list-outside space-y-2 pl-5">
          {#each noWarrantyItems as itemKey}
            <li>{$t(`disclaimer.noWarrantyItems.${itemKey}`)}</li>
          {/each}
        </ul>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:exclamation-triangle" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.limitationLiability')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('disclaimer.limitationLiabilityText')}</p>
        <ul class="list-disc list-outside space-y-2 pl-5">
          {#each limitationLiabilityItems as itemKey}
            <li>{$t(`disclaimer.limitationLiabilityItems.${itemKey}`)}</li>
          {/each}
        </ul>
        <p class="text-sm text-black/60 dark:text-white/60 mt-4">
          {$t('disclaimer.limitationLiabilityNote')}
        </p>
      </div>
    </section>

    <section class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:shield-check" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
        {$t('disclaimer.safetyNotice')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('disclaimer.safetyNoticeText')}</p>
        <ul class="list-disc list-outside space-y-2 pl-5">
          {#each safetyNoticeItems as itemKey}
            <li>{$t(`disclaimer.safetyNoticeItems.${itemKey}`)}</li>
          {/each}
        </ul>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:envelope" class="w-5 h-5 text-[#E10600]" />
        {$t('disclaimer.contact')}
      </h2>
      <div class="text-black/80 dark:text-white/80">
        <p>
          {$t('disclaimer.contactText')}
          {#if contactEmail}
            <a href={`mailto:${contactEmail}`} class="text-[#E10600] dark:text-red-400 hover:underline ml-1">
              {contactEmail}
            </a>
          {/if}
        </p>
      </div>
    </section>

    <section class="text-sm text-black/40 dark:text-white/40">
      <p>
        {$t('common.lastUpdated')}: {new Intl.DateTimeFormat($locale || 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(lastUpdated)}
      </p>
    </section>
  </div>

  <div class="mt-8">
    <a href="/" class="inline-flex items-center gap-2 text-[#E10600] dark:text-red-400 hover:underline">
      <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
      {$t('common.backToHome')}
    </a>
  </div>
</div>
