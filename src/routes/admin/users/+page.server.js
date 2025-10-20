import { redirect } from '@sveltejs/kit';
import { VITE_API_URL } from '$env/static/private';

const API_BASE_URL = VITE_API_URL || 'http://localhost:3000/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals, cookies, fetch }) {
  const user = locals.user;

  if (!user || user.role !== 'ADMIN') {
    throw redirect(303, '/');
  }

  const authToken = cookies.get('auth-token');

  if (!authToken) {
    return { initialUsers: [] };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        Cookie: `auth-token=${authToken}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      throw redirect(303, '/');
    }

    if (response.ok) {
      const data = await response.json();
      return {
        initialUsers: Array.isArray(data.users) ? data.users : []
      };
    }
  } catch (error) {
    console.error('Failed to load admin users list:', error);
  }

  return {
    initialUsers: []
  };
}
