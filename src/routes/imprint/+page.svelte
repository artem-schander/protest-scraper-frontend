<script>
  import { get } from 'svelte/store';
  import Icon from '$lib/components/common/Icon.svelte';
  import { env } from '$env/dynamic/public';
  import { LANGUAGE_OPTIONS, locale, setAppLocale, t } from '$lib/i18n';

  const imprintData = {
    name: env.PUBLIC_IMPRINT_NAME,
    street: env.PUBLIC_IMPRINT_STREET,
    postalCode: env.PUBLIC_IMPRINT_POSTAL_CODE,
    city: env.PUBLIC_IMPRINT_CITY,
    email: env.PUBLIC_IMPRINT_EMAIL,
    phone: env.PUBLIC_IMPRINT_PHONE,
    representative: env.PUBLIC_IMPRINT_REPRESENTATIVE,
    vatId: env.PUBLIC_IMPRINT_VAT_ID,
    contentResponsible: env.PUBLIC_IMPRINT_CONTENT_RESPONSIBLE,
    contentAddress: env.PUBLIC_IMPRINT_CONTENT_ADDRESS
  };

  const legalSections = [
    {
      heading: 'liabilityContent',
      paragraphs: ['liabilityContentText1', 'liabilityContentText2']
    },
    {
      heading: 'liabilityLinks',
      paragraphs: ['liabilityLinksText1', 'liabilityLinksText2']
    },
    {
      heading: 'copyright',
      paragraphs: ['copyrightText1', 'copyrightText2']
    }
  ];

  const hasServiceProvider = imprintData.name || imprintData.street || imprintData.postalCode || imprintData.city;
  const hasContact = imprintData.email || imprintData.phone;
  const hasContentResponsible = imprintData.contentResponsible || imprintData.contentAddress;
</script>

<svelte:head>
  <title>{$t('imprint.title')} - Protest Listing</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12 md:py-16">
  <div class="mb-8">
    <h1 class="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
      {$t('imprint.title')}
    </h1>

    <p class="text-black/60 dark:text-white/60">
      {$t('imprint.subtitle')}
    </p>
  </div>

  <div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 md:p-8 space-y-8">
    {#if hasServiceProvider}
      <section>
        <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="heroicons:building-office" class="w-5 h-5 text-red-600" />
          {$t('imprint.serviceProvider')}
        </h2>
        <div class="text-black/80 dark:text-white/80 space-y-2">
          {#if imprintData.name}
            <p>{imprintData.name}</p>
          {/if}
          {#if imprintData.street}
            <p>{imprintData.street}</p>
          {/if}
          {#if imprintData.postalCode || imprintData.city}
            <p>{imprintData.postalCode || ''} {imprintData.city || ''}</p>
          {/if}
          <p>{$t('imprint.country')}</p>
        </div>
      </section>
    {/if}

    {#if hasContact}
      <section>
        <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="heroicons:envelope" class="w-5 h-5 text-red-600" />
          {$t('imprint.contact')}
        </h2>
        <div class="text-black/80 dark:text-white/80 space-y-2">
          {#if imprintData.email}
            <p>
              <span class="font-medium">{$t('imprint.email')}</span>
              <a href="mailto:{imprintData.email}" class="text-red-600 dark:text-red-400 hover:underline ml-2">
                {imprintData.email}
              </a>
            </p>
          {/if}
          {#if imprintData.phone}
            <p>
              <span class="font-medium">{$t('imprint.phone')}</span>
              <span class="ml-2">{imprintData.phone}</span>
            </p>
          {/if}
        </div>
      </section>
    {/if}

    {#if imprintData.representative}
      <section>
        <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="heroicons:user" class="w-5 h-5 text-red-600" />
          {$t('imprint.representedBy')}
        </h2>
        <div class="text-black/80 dark:text-white/80">
          <p>{imprintData.representative}</p>
        </div>
      </section>
    {/if}

    {#if imprintData.vatId}
      <section>
        <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="heroicons:document-text" class="w-5 h-5 text-red-600" />
          {$t('imprint.vatId')}
        </h2>
        <div class="text-black/80 dark:text-white/80">
          <p>{$t('imprint.vatIdText')}</p>
          <p class="font-mono mt-2">{imprintData.vatId}</p>
        </div>
      </section>
    {/if}

    {#if hasContentResponsible}
      <section>
        <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Icon icon="heroicons:identification" class="w-5 h-5 text-red-600" />
          {$t('imprint.contentResponsible')}
        </h2>
        <div class="text-black/80 dark:text-white/80 space-y-2">
          <p>{$t('imprint.contentResponsibleText')}</p>
          {#if imprintData.contentResponsible}
            <p class="mt-2">{imprintData.contentResponsible}</p>
          {/if}
          {#if imprintData.contentAddress}
            <p>{imprintData.contentAddress}</p>
          {/if}
        </div>
      </section>
    {/if}

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:scale" class="w-5 h-5 text-red-600" />
        {$t('imprint.onlineDispute')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-2">
        <p>{$t('imprint.onlineDisputeText1')}</p>
        <p>
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-red-600 dark:text-red-400 hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p class="mt-4">
          {$t('imprint.onlineDisputeText2')}
        </p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:shield-check" class="w-5 h-5 text-red-600" />
        {$t('imprint.dataProtection')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-2">
        <p>
          {$t('imprint.dataProtectionText')}
          <a href="/privacy" class="text-red-600 dark:text-red-400 hover:underline">
            {$t('imprint.privacyPolicy')}
          </a>
        </p>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600" />
        {$t('imprint.liabilityDisclaimer')}
      </h2>
      <div class="text-sm text-black/60 dark:text-white/60 space-y-6">
        {#each legalSections as section}
          <div>
            <h3 class="font-semibold text-black/80 dark:text-white/80">{$t(`imprint.${section.heading}`)}</h3>
            {#each section.paragraphs as paragraph}
              <p class="mt-2 first:mt-3 text-black/70 dark:text-white/70">
                {$t(`imprint.${paragraph}`)}
              </p>
            {/each}
          </div>
        {/each}
      </div>
    </section>
  </div>

  <div class="mt-8">
    <a href="/" class="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline">
      <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
      {$t('common.backToHome')}
    </a>
  </div>
</div>
