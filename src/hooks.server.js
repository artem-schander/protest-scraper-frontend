import { COOKIE_MAX_AGE, LOCALE_COOKIE_KEY, setupI18n } from '$lib/i18n';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
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

	return resolve(event);
};
