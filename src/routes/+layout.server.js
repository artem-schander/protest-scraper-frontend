import { env as publicEnv } from '$env/dynamic/public';
import { VITE_API_URL } from '$env/static/private';

const API_BASE_URL = VITE_API_URL || 'http://localhost:3000/api';
const PUBLIC_ENV_KEYS = [
  'PUBLIC_IMPRINT_NAME',
  'PUBLIC_IMPRINT_STREET',
  'PUBLIC_IMPRINT_POSTAL_CODE',
  'PUBLIC_IMPRINT_CITY',
  'PUBLIC_IMPRINT_EMAIL',
  'PUBLIC_IMPRINT_PHONE',
  'PUBLIC_IMPRINT_REPRESENTATIVE',
  'PUBLIC_IMPRINT_VAT_ID',
  'PUBLIC_IMPRINT_CONTENT_RESPONSIBLE',
  'PUBLIC_IMPRINT_CONTENT_ADDRESS',
  'PUBLIC_PRIVACY_COUNTRY',
  'PUBLIC_PRIVACY_EMAIL',
  'PUBLIC_PRIVACY_PHONE',
  'PUBLIC_PRIVACY_DPO_NAME',
  'PUBLIC_PRIVACY_DPO_EMAIL',
  'PUBLIC_PRIVACY_SUPERVISORY_AUTHORITY',
  'PUBLIC_PRIVACY_SUPERVISORY_ADDRESS',
  'PUBLIC_PRIVACY_SUPERVISORY_URL',
  'PUBLIC_GITHUB_URL'
];

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, cookies, fetch }) {
  let pendingModerationCount = 0;

  const user = locals.user || null;
  const locale = locals.locale;

  if (user && (user.role === 'MODERATOR' || user.role === 'ADMIN')) {
    const authToken = cookies.get('auth-token');
    if (authToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/protests?verified=false&limit=1`, {
          headers: {
            Cookie: `auth-token=${authToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const total = Number.isFinite(data.total) ? data.total : Array.isArray(data.protests) ? data.protests.length : 0;
          pendingModerationCount = total;
        }
      } catch (error) {
        console.error('Failed to load pending moderation count:', error);
      }
    }
  }

  const publicEnvData = Object.fromEntries(
    PUBLIC_ENV_KEYS.map((key) => [key, publicEnv[key] ?? ''])
  );

  return {
    locale,
    user,
    pendingModerationCount,
    publicEnv: publicEnvData
  };
}
