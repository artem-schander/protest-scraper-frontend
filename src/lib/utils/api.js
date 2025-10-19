// API Base URL - Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Make an API request with credentials (cookies)
 */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Include cookies in requests
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
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
    return { error: error.message };
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
    return { error: error.message };
  }
}

export async function logout() {
  try {
    const response = await apiRequest('/auth/logout', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    return { error: error.message };
  }
}

export async function refreshToken() {
  try {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST'
    });
    return response;
  } catch (error) {
    return { error: error.message };
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

  try {
    const response = await apiRequest(`/protests?${queryParams}`);
    return response;
  } catch (error) {
    return { error: error.message, protests: [], total: 0 };
  }
}

export async function getProtestById(id) {
  try {
    const response = await apiRequest(`/protests/${id}`);
    return response;
  } catch (error) {
    return { error: error.message };
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
    return { error: error.message };
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
    return { error: error.message };
  }
}

export async function deleteProtest(id) {
  try {
    const response = await apiRequest(`/protests/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    return { error: error.message };
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
