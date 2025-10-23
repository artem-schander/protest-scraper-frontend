import { get } from 'svelte/store';
import { t } from '$lib/i18n';

/**
 * Translates API error responses to user-friendly localized messages
 *
 * Priority order:
 * 1. Error code from backend (`response.code`)
 * 2. HTTP status code (`response.status`)
 * 3. Raw error message from backend (fallback)
 * 4. Generic error message
 *
 * @param {Object} response - API error response object
 * @param {string} [response.code] - Error code from backend (e.g., 'EMAIL_ALREADY_EXISTS')
 * @param {string} [response.error] - Error message from backend
 * @param {string} [response.message] - Alternative message field
 * @param {number} [response.status] - HTTP status code
 * @returns {string} Translated error message
 *
 * @example
 * // Backend sends: { error: "...", code: "EMAIL_ALREADY_EXISTS", status: 409 }
 * const message = translateError(response);
 * // Returns: "Another user already uses this email" (EN) or
 * //          "Ein anderer Benutzer verwendet bereits diese E-Mail" (DE)
 */
export function translateError(response) {
  const translate = get(t);

  // 1. Try error code first (best - specific translation)
  if (response?.code) {
    const translationKey = `errors.${response.code}`;
    const translated = translate(translationKey);

    // Check if translation exists (doesn't return the key itself)
    if (translated !== translationKey) {
      return translated;
    }
  }

  // 2. Fall back to HTTP status code (generic translation)
  if (response?.status) {
    const translationKey = `errors.HTTP_${response.status}`;
    const translated = translate(translationKey);

    if (translated !== translationKey) {
      return translated;
    }
  }

  // 3. Fall back to server message (English, not translated)
  if (response?.error || response?.message) {
    return response.error || response.message;
  }

  // 4. Generic fallback
  return translate('common.errorOccurred');
}

/**
 * Checks if an error response indicates that email verification is required
 *
 * @param {Object} response - API error response
 * @returns {boolean} True if verification is required
 */
export function requiresVerification(response) {
  return response?.code === 'EMAIL_NOT_VERIFIED' ||
         response?.requiresVerification === true;
}

/**
 * Checks if an error response indicates the account is banned
 *
 * @param {Object} response - API error response
 * @returns {boolean} True if account is banned
 */
export function isAccountBanned(response) {
  return response?.code === 'ACCOUNT_BANNED' ||
         response?.banned === true;
}
