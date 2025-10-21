<script>
import Icon from '$lib/components/common/Icon.svelte';
import { locale, t } from '$lib/i18n';

const missionParagraphs = ['about.mission.paragraphs.0', 'about.mission.paragraphs.1'];
const openSourceParagraphs = ['about.openSource.paragraphs.0', 'about.openSource.paragraphs.1'];
const importantParagraphs = ['about.important.paragraphs.0', 'about.important.paragraphs.1'];
const howCards = [
  { icon: 'heroicons:arrow-path', title: 'about.how.cards.automation.title', description: 'about.how.cards.automation.description' },
  { icon: 'heroicons:users', title: 'about.how.cards.community.title', description: 'about.how.cards.community.description' }
];
const sources = [
  { icon: 'heroicons:shield-check', title: 'about.sources.items.0.title', description: 'about.sources.items.0.description' },
  { icon: 'heroicons:building-office', title: 'about.sources.items.1.title', description: 'about.sources.items.1.description' },
  { icon: 'heroicons:hand-raised', title: 'about.sources.items.2.title', description: 'about.sources.items.2.description' },
  { icon: 'heroicons:heart', title: 'about.sources.items.3.title', description: 'about.sources.items.3.description' }
];
const comingSoonItems = [
  { icon: 'heroicons:arrow-down-tray', title: 'about.comingSoon.items.0.title', description: 'about.comingSoon.items.0.description' },
  { icon: 'heroicons:calendar', title: 'about.comingSoon.items.1.title', description: 'about.comingSoon.items.1.description' },
  { icon: 'heroicons:funnel', title: 'about.comingSoon.items.2.title', description: 'about.comingSoon.items.2.description' },
  { icon: 'heroicons:envelope', title: 'about.comingSoon.items.3.title', description: 'about.comingSoon.items.3.description' },
  { icon: 'heroicons:user-plus', title: 'about.comingSoon.items.4.title', description: 'about.comingSoon.items.4.description' }
];
const developerCards = [
  { icon: 'heroicons:server', title: 'about.developers.cards.0.title', stack: 'about.developers.cards.0.stack', href: 'https://github.com/artem-schander/protest-scraper' },
  { icon: 'heroicons:computer-desktop', title: 'about.developers.cards.1.title', stack: 'about.developers.cards.1.stack', href: 'https://github.com/artem-schander/protest-scraper-frontend' }
];
const contactSections = [
  { icon: 'heroicons:envelope', title: 'about.contact.sections.0.title', description: 'about.contact.sections.0.description' },
  { icon: 'heroicons:bug-ant', title: 'about.contact.sections.1.title', description: 'about.contact.sections.1.description' }
];
const lastUpdated = new Date('2025-10-20');
</script>

<svelte:head>
  <title>{$t('about.metaTitle')}</title>
  <meta name="description" content={$t('about.metaDescription')} />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12 md:py-16">
  <div class="mb-8">
    <h1 class="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
      {$t('about.title')}
    </h1>
    <p class="text-black/60 dark:text-white/60">
      {$t('about.heroSubtitle')}
    </p>
  </div>

  <div class="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-6 md:p-8 space-y-8">
    <section>
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:megaphone" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {$t('about.mission.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        {#each missionParagraphs as key}
          <p>{$t(key)}</p>
        {/each}
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:cog-6-tooth" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {$t('about.how.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('about.how.intro')}</p>
        <div class="grid md:grid-cols-2 gap-6">
          {#each howCards as card}
            <div class="bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/30 dark:to-lime-900/30 rounded-lg p-4">
              <h3 class="font-medium text-black dark:text-white mb-3 flex items-center gap-2">
                <Icon icon={card.icon} class="w-4 h-4" />
                {$t(card.title)}
              </h3>
              <p class="text-sm text-black/70 dark:text-white/70">{$t(card.description)}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:globe-alt" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {$t('about.sources.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('about.sources.intro')}</p>
        <div class="grid sm:grid-cols-2 gap-3">
          {#each sources as source}
            <div class="flex items-center gap-3 bg-stone-50 dark:bg-stone-700/50 rounded-lg p-3">
              <Icon icon={source.icon} class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p class="font-medium text-sm">{$t(source.title)}</p>
                <p class="text-xs text-black/60 dark:text-white/60">{$t(source.description)}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:rocket-launch" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {$t('about.comingSoon.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('about.comingSoon.intro')}</p>
        <div class="space-y-3">
          {#each comingSoonItems as item}
            <div class="flex items-start gap-3">
              <Icon icon={item.icon} class="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <h3 class="font-medium">{$t(item.title)}</h3>
                <p class="text-sm text-black/70 dark:text-white/70">{$t(item.description)}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:code-bracket" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {$t('about.developers.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('about.developers.intro')}</p>
        <div class="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-700/50 dark:to-stone-800/50 rounded-lg p-4 space-y-3">
          <h3 class="font-medium text-black dark:text-white">{$t('about.developers.apiTitle')}</h3>
          <p class="text-sm text-black/70 dark:text-white/70">{$t('about.developers.apiDescription')}</p>
          <div class="bg-black/5 dark:bg-white/5 rounded p-3 font-mono text-xs overflow-x-auto">
            <div class="text-emerald-600 dark:text-emerald-400">{$t('about.developers.apiEndpoint')}</div>
            <div class="text-black/60 dark:text-white/60 mt-1">{$t('about.developers.apiFilters')}</div>
          </div>
          <p class="text-sm text-black/70 dark:text-white/70">{$t('about.developers.apiMore')}</p>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          {#each developerCards as card, index}
            <a href={card.href} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/30 dark:to-lime-900/30 rounded-lg p-4 hover:shadow-md transition-shadow">
              <Icon icon={card.icon} class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 class="font-medium text-black dark:text-white">{$t(card.title)}</h4>
                <p class="text-sm text-black/70 dark:text-white/70">{$t(card.stack)}</p>
              </div>
            </a>
          {/each}
        </div>
        <p class="text-sm text-black/70 dark:text-white/70">{$t('about.developers.cta')}</p>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:heart" class="w-5 h-5 text-red-500" />
        {$t('about.openSource.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        {#each openSourceParagraphs as key}
          <p>{$t(key)}</p>
        {/each}
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:chat-bubble-left-right" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {$t('about.contact.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        <p>{$t('about.contact.intro')}</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <a href="/contact?topic=Suggest%20Data%20Source" class="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors block">
            <h3 class="font-medium text-black dark:text-white mb-2 flex items-center gap-2">
              <Icon icon="heroicons:envelope" class="w-4 h-4" />
              {$t('about.contact.sections.0.title')}
            </h3>
            <p class="text-sm text-black/70 dark:text-white/70">{$t('about.contact.sections.0.description')}</p>
          </a>
          <a href="/contact?topic=Technical%20Support" class="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors block">
            <h3 class="font-medium text-black dark:text-white mb-2 flex items-center gap-2">
              <Icon icon="heroicons:bug-ant" class="w-4 h-4" />
              {$t('about.contact.sections.1.title')}
            </h3>
            <p class="text-sm text-black/70 dark:text-white/70">{$t('about.contact.sections.1.description')}</p>
          </a>
        </div>
      </div>
    </section>

    <section class="border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
        <Icon icon="heroicons:information-circle" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
        {$t('about.important.title')}
      </h2>
      <div class="text-black/80 dark:text-white/80 space-y-4">
        {#each importantParagraphs as key}
          <p>{$t(key)}</p>
        {/each}
      </div>
    </section>

    <section class="text-sm text-black/40 dark:text-white/40">
      <p>{$t('common.lastUpdated')}: {new Intl.DateTimeFormat($locale || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(lastUpdated)}</p>
    </section>
  </div>

  <div class="mt-8">
    <a href="/" class="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline">
      <Icon icon="heroicons:arrow-left" class="w-5 h-5" />
      {$t('common.backToHome')}
    </a>
  </div>
</div>
