/** @type {import('./$types').LayoutServerLoad} */
import { VITE_API_URL } from '$env/static/private';

const API_BASE_URL = VITE_API_URL || 'http://localhost:3000/api';

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

  return {
    locale,
    user,
    pendingModerationCount
  };
}
