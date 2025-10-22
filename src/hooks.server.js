import 'dotenv/config';
import { COOKIE_MAX_AGE, LOCALE_COOKIE_KEY, setupI18n } from '$lib/i18n';
import { VITE_API_URL } from '$env/static/private';

const API_BASE_URL = VITE_API_URL || 'http://localhost:3000/api';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
  // Handle locale
  const cookieLocale = event.cookies.get(LOCALE_COOKIE_KEY);
  const acceptLanguage = event.request.headers.get('accept-language');

  const resolvedLocale = setupI18n(cookieLocale ?? acceptLanguage, { persist: false });
  event.locals.locale = resolvedLocale;

  if (!cookieLocale || cookieLocale !== resolvedLocale) {
    event.cookies.set(LOCALE_COOKIE_KEY, resolvedLocale, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    });
  }

  // Handle auth - check for auth token cookie
  const authToken = event.cookies.get('auth-token');
  if (authToken) {
    try {
      // Validate token by calling backend
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Cookie': `auth-token=${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        event.locals.user = data.user;
      }
    } catch (error) {
      console.error('Failed to validate auth token:', error);
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('<html lang="en">', `<html lang="${event.locals.locale}">`);
    }
  });
};
