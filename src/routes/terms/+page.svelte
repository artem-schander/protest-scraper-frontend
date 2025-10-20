<script>
  import { locale, t } from '$lib/i18n';
  import Icon from '$lib/components/common/Icon.svelte';
  import * as env from '$env/static/public';

  const lastUpdated = new Date('2025-10-20');
  const contactEmail = env.PUBLIC_IMPRINT_EMAIL || env.PUBLIC_PRIVACY_EMAIL || 'contact@protest-listing.com';

  const sections = [
    {
      key: 'platformPurpose',
      icon: 'heroicons:megaphone',
      paragraphKeys: [
        'terms.sections.platformPurpose.paragraphs.0',
        'terms.sections.platformPurpose.paragraphs.1'
      ]
    },
    {
      key: 'accountResponsibilities',
      icon: 'heroicons:identification',
      paragraphKeys: [
        'terms.sections.accountResponsibilities.paragraphs.0',
        'terms.sections.accountResponsibilities.paragraphs.1'
      ],
      listKeys: [
        'terms.sections.accountResponsibilities.list.0',
        'terms.sections.accountResponsibilities.list.1',
        'terms.sections.accountResponsibilities.list.2'
      ]
    },
    {
      key: 'communitySubmissions',
      icon: 'heroicons:user-group',
      paragraphKeys: [
        'terms.sections.communitySubmissions.paragraphs.0',
        'terms.sections.communitySubmissions.paragraphs.1'
      ],
      listKeys: [
        'terms.sections.communitySubmissions.list.0',
        'terms.sections.communitySubmissions.list.1',
        'terms.sections.communitySubmissions.list.2'
      ]
    },
    {
      key: 'moderation',
      icon: 'heroicons:shield-check',
      paragraphKeys: [
        'terms.sections.moderation.paragraphs.0',
        'terms.sections.moderation.paragraphs.1'
      ]
    },
    {
      key: 'acceptableUse',
      icon: 'heroicons:hand-raised',
      paragraphKeys: [
        'terms.sections.acceptableUse.paragraphs.0'
      ],
      listKeys: [
        'terms.sections.acceptableUse.list.0',
        'terms.sections.acceptableUse.list.1',
        'terms.sections.acceptableUse.list.2',
        'terms.sections.acceptableUse.list.3'
      ]
    },
    {
      key: 'dataApi',
      icon: 'heroicons:cloud-arrow-down',
      paragraphKeys: [
        'terms.sections.dataApi.paragraphs.0',
        'terms.sections.dataApi.paragraphs.1'
      ]
    },
    {
      key: 'emailVerification',
      icon: 'heroicons:envelope-open',
      paragraphKeys: [
        'terms.sections.emailVerification.paragraphs.0'
      ]
    },
    {
      key: 'termination',
      icon: 'heroicons:stop-circle',
      paragraphKeys: [
        'terms.sections.termination.paragraphs.0'
      ]
    },
    {
      key: 'disclaimer',
      icon: 'heroicons:scale',
      paragraphKeys: [
        'terms.sections.disclaimer.paragraphs.0',
        'terms.sections.disclaimer.paragraphs.1'
      ]
    },
    {
      key: 'changes',
      icon: 'heroicons:arrow-path-rounded-square',
      paragraphKeys: [
        'terms.sections.changes.paragraphs.0'
      ]
    }
  ];

  let formattedDate = '';

  $: currentLocale = $locale === 'de' ? 'de' : 'en';
  $: formattedDate = lastUpdated.toLocaleDateString(
    currentLocale === 'de' ? 'de-DE' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
</script>

<svelte:head>
  <title>{$t('terms.title')} - Protest Listing</title>
  <meta
    name="description"
    content={$t('terms.metaDescription')}
  />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12 md:py-16">
  <div class="mb-8 space-y-4">
    <h1 class="text-3xl md:text-4xl font-bold text-black dark:text-white">
      {$t('terms.title')}
    </h1>
    <p class="text-black/60 dark:text-white/60">
      {$t('terms.subtitle')}
    </p>
  </div>

  <div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 md:p-8 space-y-10">
    {#each sections as section}
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
          <Icon icon={section.icon} class="w-5 h-5 text-[#E10600]" />
          {$t(`terms.sections.${section.key}.title`)}
        </h2>
        <div class="space-y-3 text-black/80 dark:text-white/80">
          {#each section.paragraphKeys as key}
            <p>{$t(key)}</p>
          {/each}
          {#if section.listKeys?.length}
            <ul class="list-disc list-inside space-y-2">
              {#each section.listKeys as key}
                <li>{$t(key)}</li>
              {/each}
            </ul>
          {/if}
        </div>
      </section>
    {/each}

    <section class="border-t border-stone-200 dark:border-stone-700 pt-6 space-y-3 text-black/80 dark:text-white/80">
      <h2 class="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
        <Icon icon="heroicons:envelope" class="w-5 h-5 text-[#E10600]" />
        {$t('terms.contact.title')}
      </h2>
      <p>{$t('terms.contact.intro')}</p>
      <p>
        <a href={`mailto:${contactEmail}`} class="text-[#E10600] dark:text-red-400 hover:text-[#C10500] dark:hover:text-[#E10600]">
          {contactEmail}
        </a>
      </p>
      <p class="text-sm text-black/50 dark:text-white/50 pt-2">
        {$t('common.lastUpdated')}: {formattedDate}
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
