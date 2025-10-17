import { browser } from '$app/environment';
import { init, addMessages, getLocaleFromNavigator, locale as localeStore, t } from 'svelte-i18n';
import enMessages from './locales/en.json';
import deMessages from './locales/de.json';

const FALLBACK_LOCALE = 'en';
export const LOCALE_COOKIE_KEY = 'protest-scraper-locale';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const SUPPORTED_LOCALES = ['en', 'de'];
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' }
];

addMessages('en', enMessages);
addMessages('de', deMessages);

let initialized = false;

function normalizeLocale(value) {
  if (!value) {
    return undefined;
  }

  const primary = value.trim().split(',')[0];
  const [language] = primary.split('-');
  return language?.toLowerCase();
}

function isSupported(code) {
  return Boolean(code) && SUPPORTED_LOCALES.includes(code);
}

function getCookieLocale() {
  if (!browser) {
    return undefined;
  }

  const segments = document.cookie.split(';').map((segment) => segment.trim());
  const match = segments.find((segment) => segment.startsWith(`${LOCALE_COOKIE_KEY}=`));

  if (!match) {
    return undefined;
  }

  const [, value] = match.split('=');
  return decodeURIComponent(value);
}

function persistLocale(code) {
  if (!browser) {
    return;
  }

  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(
    code
  )}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function resolveLocale(preferred) {
  const normalized = normalizeLocale(preferred);

  if (isSupported(normalized)) {
    return normalized;
  }

  if (browser) {
    const cookieLocale = normalizeLocale(getCookieLocale());
    if (isSupported(cookieLocale)) {
      return cookieLocale;
    }

    const navigatorLocale = normalizeLocale(getLocaleFromNavigator());
    if (isSupported(navigatorLocale)) {
      return navigatorLocale;
    }
  }

  return FALLBACK_LOCALE;
}

export function setupI18n(initialLocale, options = {}) {
  const { persist = true } = options;
  const targetLocale = resolveLocale(initialLocale);

  if (!initialized) {
    init({
      fallbackLocale: FALLBACK_LOCALE,
      initialLocale: targetLocale
    });
    initialized = true;
  } else {
    localeStore.set(targetLocale);
  }

  if (persist) {
    persistLocale(targetLocale);
  }

  return targetLocale;
}

export function setAppLocale(nextLocale) {
  if (!isSupported(nextLocale)) {
    return;
  }

  localeStore.set(nextLocale);
  persistLocale(nextLocale);
}

export { localeStore as locale, t };
