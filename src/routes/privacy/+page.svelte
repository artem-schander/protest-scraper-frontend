<script>
  import Icon from '$lib/components/common/Icon.svelte';
  import * as env from '$env/static/public';
  import { locale, t } from '$lib/i18n';

  const controllerAddress = [
    env.PUBLIC_IMPRINT_NAME,
    env.PUBLIC_IMPRINT_STREET,
    [env.PUBLIC_IMPRINT_POSTAL_CODE, env.PUBLIC_IMPRINT_CITY].filter(Boolean).join(' ').trim() || undefined
  ].filter(Boolean);

  const controllerCountry = env.PUBLIC_PRIVACY_COUNTRY;
  const controllerEmail = env.PUBLIC_PRIVACY_EMAIL || env.PUBLIC_IMPRINT_EMAIL || 'privacy@example.com';
  const controllerPhone = env.PUBLIC_PRIVACY_PHONE || env.PUBLIC_IMPRINT_PHONE;

  const dataProtectionOfficer = {
    name: env.PUBLIC_PRIVACY_DPO_NAME,
    email: env.PUBLIC_PRIVACY_DPO_EMAIL
  };
  const hasDataProtectionOfficer = Boolean(dataProtectionOfficer.name || dataProtectionOfficer.email);

  const supervisoryAuthority = {
    name: env.PUBLIC_PRIVACY_SUPERVISORY_AUTHORITY,
    address: env.PUBLIC_PRIVACY_SUPERVISORY_ADDRESS,
    url: env.PUBLIC_PRIVACY_SUPERVISORY_URL
  };
  const hasSupervisoryAuthority =
    Boolean(supervisoryAuthority.name) ||
    Boolean(supervisoryAuthority.address) ||
    Boolean(supervisoryAuthority.url);

  const accountInfoKeys = ['email', 'username', 'password', 'creationDate'];
  const eventSubmissionKeys = ['details', 'contact', 'timestamp', 'userId'];
  const autoCollectedKeys = ['ip', 'browser', 'os', 'referrer', 'pages', 'device'];
  const dataUsageKeys = ['provide', 'manage', 'display', 'communicate', 'improve', 'prevent', 'comply', 'analyze'];
  const legalBasisKeys = ['consent', 'contract', 'legal', 'legitimate'];
  const dataSharingKeys = ['providers', 'legal', 'public'];
  // const cookiesKeys = ['login', 'preferences', 'analyze', 'improve'];
  const cookiesKeys = ['login', 'preferences'];
  const dataSecurityKeys = ['encryption', 'passwords', 'updates', 'access', 'audits', 'backup'];
  const dataRetentionKeys = ['active', 'necessary', 'required', 'needed'];
  const yourRightsKeys = ['access', 'rectification', 'erasure', 'restriction', 'portability', 'object', 'withdraw', 'complaint'];

  const lastUpdated = new Date();
</script>

<svelte:head>
  <title>{$t('privacy.title')} - Protest Listing</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12 md:py-16">
  <div class="mb-8">
    <h1 class="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
      {$t('privacy.title')}
    </h1>
    <p class="text-black/60 dark:text-white/60">
      {$t('privacy.subtitle')}
    </p>
  </div>

  <div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 md:p-8 space-y-8">
    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:shield-check" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.introduction')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.introText1')}</p>
        <p>{$t('privacy.introText2')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:building-office" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.dataController')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.dataControllerNote')}</p>
        <div class="space-y-1">
          {#each controllerAddress as line}
            <p>{line}</p>
          {/each}
          {#if env.PUBLIC_IMPRINT_POSTAL_CODE || env.PUBLIC_IMPRINT_CITY}
            <!-- Already included above -->
          {/if}
          <p>{controllerCountry || $t('imprint.country')}</p>
        </div>

        <p class="font-medium mt-4">{$t('privacy.dataControllerContact')}</p>
        <ul class="space-y-2">
          <li>
            <span class="font-medium">{$t('imprint.contact')}</span>:
            {#if controllerEmail}
              <a href={`mailto:${controllerEmail}`} class="text-[#E10600] dark:text-red-400 hover:underline ml-1">
                {controllerEmail}
              </a>
            {/if}
            {#if controllerPhone}
              <span class="block sm:inline sm:ml-2">
                <span class="font-medium">{$t('imprint.phone')}</span>
                <span class="ml-1">{controllerPhone}</span>
              </span>
            {/if}
          </li>
        </ul>

        {#if hasDataProtectionOfficer}
          <div class="border-t border-stone-200 dark:border-stone-700 pt-4">
            <p class="font-medium mb-2">{$t('privacy.dataProtectionOfficer')}</p>
            <p>{$t('privacy.dataProtectionOfficerText')}</p>
            <ul class="mt-2 space-y-1">
              {#if dataProtectionOfficer.name}
                <li>{dataProtectionOfficer.name}</li>
              {/if}
              {#if dataProtectionOfficer.email}
                <li>
                  <a href={`mailto:${dataProtectionOfficer.email}`} class="text-[#E10600] dark:text-red-400 hover:underline">
                    {dataProtectionOfficer.email}
                  </a>
                </li>
              {/if}
            </ul>
          </div>
        {/if}

        {#if hasSupervisoryAuthority}
          <div class="border-t border-stone-200 dark:border-stone-700 pt-4">
            <p class="font-medium mb-2">{$t('privacy.supervisoryAuthority')}</p>
            <p>{$t('privacy.supervisoryAuthorityText')}</p>
            <ul class="mt-2 space-y-1">
              {#if supervisoryAuthority.name}
                <li>{supervisoryAuthority.name}</li>
              {/if}
              {#if supervisoryAuthority.address}
                <li>{supervisoryAuthority.address}</li>
              {/if}
              {#if supervisoryAuthority.url}
                <li>
                  <a href={supervisoryAuthority.url} target="_blank" rel="noopener noreferrer" class="text-[#E10600] dark:text-red-400 hover:underline">
                    {supervisoryAuthority.url}
                  </a>
                </li>
              {/if}
            </ul>
          </div>
        {/if}
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:document-text" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.dataCollection')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-6">
        <div>
          <h3 class="font-semibold text-black dark:text-white">{$t('privacy.accountInfo')}</h3>
          <p>{$t('privacy.accountInfoText')}</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            {#each accountInfoKeys as key}
              <li>{$t(`privacy.accountInfoItems.${key}`)}</li>
            {/each}
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-black dark:text-white">{$t('privacy.eventSubmissions')}</h3>
          <p>{$t('privacy.eventSubmissionsText')}</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            {#each eventSubmissionKeys as key}
              <li>{$t(`privacy.eventSubmissionsItems.${key}`)}</li>
            {/each}
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-black dark:text-white">{$t('privacy.autoCollected')}</h3>
          <p>{$t('privacy.autoCollectedText')}</p>
          <ul class="list-disc list-inside space-y-2 ml-4">
            {#each autoCollectedKeys as key}
              <li>{$t(`privacy.autoCollectedItems.${key}`)}</li>
            {/each}
          </ul>
        </div>

        <div>
          <h3 class="font-semibold text-black dark:text-white">{$t('privacy.locationData')}</h3>
          <p>{$t('privacy.locationDataText')}</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:chart-bar" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.dataUsage')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.dataUsageText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each dataUsageKeys as key}
            <li>{$t(`privacy.dataUsageItems.${key}`)}</li>
          {/each}
        </ul>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:scale" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.legalBasis')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.legalBasisText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each legalBasisKeys as key}
            <li>{$t(`privacy.legalBasisItems.${key}`)}</li>
          {/each}
        </ul>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:share" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.dataSharing')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.dataSharingText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each dataSharingKeys as key}
            <li>{$t(`privacy.dataSharingItems.${key}`)}</li>
          {/each}
        </ul>
        <p>{$t('privacy.dataSharingNote')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:adjustments-horizontal" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.cookies')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.cookiesText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each cookiesKeys as key}
            <li>{$t(`privacy.cookiesItems.${key}`)}</li>
          {/each}
        </ul>
        <p>{$t('privacy.cookiesNote')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:lock-closed" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.dataSecurity')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.dataSecurityText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each dataSecurityKeys as key}
            <li>{$t(`privacy.dataSecurityItems.${key}`)}</li>
          {/each}
        </ul>
        <p>{$t('privacy.dataSecurityNote')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:clock" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.dataRetention')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.dataRetentionText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each dataRetentionKeys as key}
            <li>{$t(`privacy.dataRetentionItems.${key}`)}</li>
          {/each}
        </ul>
        <p>{$t('privacy.dataRetentionNote')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:user-circle" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.yourRights')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.yourRightsText')}</p>
        <ul class="list-disc list-inside space-y-2 ml-4">
          {#each yourRightsKeys as key}
            <li>{$t(`privacy.yourRightsItems.${key}`)}</li>
          {/each}
        </ul>
        <p>
          {$t('privacy.yourRightsContact')}
          {#if controllerEmail}
            <a href={`mailto:${controllerEmail}`} class="text-[#E10600] dark:text-red-400 hover:underline ml-1">
              {controllerEmail}
            </a>
          {/if}
        </p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:user-group" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.childrenPrivacy')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.childrenPrivacyText')}</p>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:arrow-path" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.changesToPolicy')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.changesToPolicyText')}</p>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:envelope" class="w-5 h-5 text-[#E10600]" />
        {$t('privacy.contactUs')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('privacy.contactUsText')}</p>
        {#if controllerEmail}
          <p>
            <a href={`mailto:${controllerEmail}`} class="text-[#E10600] dark:text-red-400 hover:underline">
              {controllerEmail}
            </a>
          </p>
        {/if}
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
