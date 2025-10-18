import { get } from 'svelte/store';
import {
  differenceInCalendarDays,
  format as formatDateFns,
  formatDistanceToNow,
  isSameDay,
  isSameMonth,
  isSameYear,
  isValid,
  parseISO
} from 'date-fns';
import { enUS, de } from 'date-fns/locale';
import { locale as localeStore } from '$lib/i18n';

const localeMap = {
  en: enUS,
  de
};

function resolveLocale(localeCode) {
  const code = localeCode || get(localeStore) || 'en';
  return localeMap[code] || enUS;
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  }
  return null;
}

export function formatDate(date, formatStr = 'd MMM yyyy', localeCode) {
  const value = toDate(date);
  if (!value) return '';
  return formatDateFns(value, formatStr, { locale: resolveLocale(localeCode) });
}

export function formatTime(date, { use24Hour = true } = {}, localeCode) {
  const value = toDate(date);
  if (!value) return '';
  const formatToken = use24Hour ? 'HH:mm' : 'p';
  return formatDateFns(value, formatToken, { locale: resolveLocale(localeCode) });
}

export function formatTimeRange(startDate, endDate, options = {}, localeCode) {
  const start = toDate(startDate);
  if (!start) return '';
  const startLabel = formatTime(start, options, localeCode);

  const end = toDate(endDate);
  if (!end || start.getTime() === end.getTime()) {
    return startLabel;
  }

  return `${startLabel} – ${formatTime(end, options, localeCode)}`;
}

export function getDaysUntil(date) {
  const target = toDate(date);
  if (!target) return null;

  const today = new Date();
  const normalizedTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return differenceInCalendarDays(normalizedTarget, normalizedToday);
}

export function formatDateRange(startDate, endDate, localeCode) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start) return '';

  const locale = resolveLocale(localeCode);

  if (!end) {
    return formatDateFns(start, 'd MMM yyyy', { locale });
  }

  if (isSameDay(start, end)) {
    return formatDateFns(start, 'd MMM yyyy', { locale });
  }

  if (isSameMonth(start, end) && isSameYear(start, end)) {
    const startLabel = formatDateFns(start, 'd', { locale });
    const endLabel = formatDateFns(end, 'd MMM yyyy', { locale });
    return `${startLabel} – ${endLabel}`;
  }

  if (isSameYear(start, end)) {
    const startLabel = formatDateFns(start, 'd MMM', { locale });
    const endLabel = formatDateFns(end, 'd MMM yyyy', { locale });
    return `${startLabel} – ${endLabel}`;
  }

  const startLabel = formatDateFns(start, 'd MMM yyyy', { locale });
  const endLabel = formatDateFns(end, 'd MMM yyyy', { locale });
  return `${startLabel} – ${endLabel}`;
}

export function getRelativeTime(date, localeCode) {
  const value = toDate(date);
  if (!value) return '';
  return formatDistanceToNow(value, { addSuffix: true, locale: resolveLocale(localeCode) });
}
