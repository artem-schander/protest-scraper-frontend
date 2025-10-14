// API Base URL - Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('authToken');
	}
	return null;
}

/**
 * Make an authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
	const token = getAuthToken();
	const headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers
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
	const queryParams = new URLSearchParams(filters);
	return `${API_BASE_URL}/export/${format}?${queryParams}`;
}

export function getCalendarSubscriptionUrl() {
	return `${API_BASE_URL}/export/ics`;
}
