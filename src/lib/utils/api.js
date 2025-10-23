// API Base URL - Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

/**
 * Make an API request with credentials (cookies)
 * Automatically handles token refresh on 401 errors
 */
export async function apiRequest(endpoint, options = {}, retryCount = 0) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Include cookies in requests
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // If 401 and not already the refresh endpoint, try to refresh token
  if (response.status === 401 && endpoint !== '/auth/refresh' && retryCount === 0) {
    try {
      // If already refreshing, wait for that refresh to complete
      if (isRefreshing && refreshPromise) {
        await refreshPromise;
      } else {
        // Start refresh process
        isRefreshing = true;
        refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const refreshResponse = await refreshPromise;

        if (!refreshResponse.ok) {
          // Refresh failed - token is truly expired (past 30 days)
          isRefreshing = false;
          refreshPromise = null;

          // Import authStore dynamically to avoid circular dependency
          if (typeof window !== 'undefined') {
            const { authStore } = await import('$lib/stores/auth');
            authStore.logout();
          }

          const error = new Error('Session expired. Please log in again.');
          error.status = 401;
          throw error;
        }

        isRefreshing = false;
        refreshPromise = null;
      }

      // Retry the original request with new token (from cookie)
      return await apiRequest(endpoint, options, retryCount + 1);
    } catch (error) {
      isRefreshing = false;
      refreshPromise = null;
      throw error;
    }
  }

  if (!response.ok) {
    const error = new Error(
      (data && (data.error || data.message)) || response.statusText || 'An error occurred'
    );
    error.status = response.status;
    error.code = data?.code; // Preserve error code from backend
    error.data = data;
    throw error;
  }

  return data ?? {};
}

/**
 * Authentication API
 */
export async function login(email, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function register(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function verifyEmailCode(email, code) {
  try {
    const response = await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function resendVerification(email) {
  try {
    const response = await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function logout() {
  try {
    const response = await apiRequest('/auth/logout', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function refreshToken() {
  try {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function fetchUsers() {
  try {
    const response = await apiRequest('/admin/users');
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function createUserAccount(payload) {
  try {
    const response = await apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function updateUserAccount(id, payload) {
  try {
    const response = await apiRequest(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function deleteUserAccount(id) {
  try {
    await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    });
    return { success: true };
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function banUserAccount(id, payload) {
  try {
    const response = await apiRequest(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function unbanUserAccount(id) {
  try {
    const response = await apiRequest(`/admin/users/${id}/unban`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function resendUserVerification(id) {
  try {
    const response = await apiRequest(`/admin/users/${id}/resend-verification`, {
      method: 'POST'
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

/**
 * OAuth API
 */
export function initiateGoogleOAuth() {
  // Redirect to backend OAuth endpoint
  window.location.href = `${API_BASE_URL}/auth/google`;
}

export function initiateAppleOAuth() {
  // Redirect to backend OAuth endpoint
  window.location.href = `${API_BASE_URL}/auth/apple`;
}

/**
 * Protest/Event API
 */
export async function getProtests(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.city) queryParams.append('city', filters.city);
  if (filters.source) queryParams.append('source', filters.source);
  if (filters.language) queryParams.append('language', filters.language);
  if (filters.dateRange) queryParams.append('dateRange', filters.dateRange);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.lat) queryParams.append('lat', filters.lat);
  if (filters.lon) queryParams.append('lon', filters.lon);
  if (filters.radius) queryParams.append('radius', filters.radius);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.verified !== undefined) queryParams.append('verified', filters.verified);

  try {
    const response = await apiRequest(`/protests?${queryParams}`);
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      protests: [],
      total: 0,
      ...error.data
    };
  }
}

export async function getProtestById(id) {
  try {
    const response = await apiRequest(`/protests/${id}`);
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function createProtest(protestData) {
  try {
    const response = await apiRequest('/protests', {
      method: 'POST',
      body: JSON.stringify(protestData)
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function updateProtest(id, protestData) {
  try {
    const response = await apiRequest(`/protests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(protestData)
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

export async function deleteProtest(id) {
  try {
    const response = await apiRequest(`/protests/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
      ...error.data
    };
  }
}

/**
 * Export API
 */
export function getExportUrl(format = 'json', filters = {}) {
  const queryParams = new URLSearchParams();

  // Manually build query params from filters object
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${API_BASE_URL}/export/${format}?${queryString}` : `${API_BASE_URL}/export/${format}`;
}

export function getCalendarSubscriptionUrl(filters = {}) {
  const queryParams = new URLSearchParams();

  // Manually build query params from filters object
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${API_BASE_URL}/export/ics?${queryString}` : `${API_BASE_URL}/export/ics`;
}
