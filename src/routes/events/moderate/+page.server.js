import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  // Check if user has auth token in cookies
  const authToken = cookies.get('auth-token');

  if (!authToken) {
    // Redirect to home if not authenticated
    throw redirect(303, '/');
  }

  // If authenticated, allow page to load
  return {};
}
