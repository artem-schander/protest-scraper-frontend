import { VITE_API_URL } from '$env/static/private';

// SSR data loading for landing page
const API_BASE_URL = VITE_API_URL || 'http://localhost:3000/api';

export async function load({ url, fetch }) {
  const params = url.searchParams;

  // Build query parameters from filters matching API spec
  const queryParams = new URLSearchParams();

  // Text search
  if (params.get('search')) queryParams.append('search', params.get('search'));

  // Location filters
  if (params.get('city')) queryParams.append('city', params.get('city'));
  if (params.get('country')) queryParams.append('country', params.get('country'));

  // Date range - support both legacy 'days' param and new startDate/endDate
  if (params.get('startDate')) {
    queryParams.append('startDate', params.get('startDate'));
  } else if (params.get('days')) {
    // Legacy support
    queryParams.append('days', params.get('days'));
  }

  if (params.get('endDate')) {
    queryParams.append('endDate', params.get('endDate'));
  }

  // Geolocation
  if (params.get('lat') && params.get('lon')) {
    queryParams.append('lat', params.get('lat'));
    queryParams.append('lon', params.get('lon'));
    if (params.get('radius')) queryParams.append('radius', params.get('radius'));
  }

  // Pagination - convert page to skip
  const limit = parseInt(params.get('limit')) || 24;
  const page = parseInt(params.get('page')) || 1;
  const skip = (page - 1) * limit;

  queryParams.append('skip', skip.toString());
  queryParams.append('limit', limit.toString());

  try {
    const response = await fetch(`${API_BASE_URL}/protests?${queryParams}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      protests: data.protests || data || [],
      total: data.pagination?.total || 0,
      limit: data.pagination?.limit || 24,
      skip: data.pagination?.skip || 0,
      page: data.pagination
        ? Math.floor(data.pagination.skip / data.pagination.limit) + 1
        : parseInt(params.get('page')) || 1,
      filters: {
        search: params.get('search') || '',
        city: params.get('city') || '',
        country: params.get('country') || '',
        startDate: params.get('startDate') || '',
        endDate: params.get('endDate') || '',
        days: params.get('days') || '',
        lat: params.get('lat') || '',
        lon: params.get('lon') || '',
        radius: params.get('radius') || '10'
      }
    };
  } catch (error) {
    console.error('Error fetching protests:', error);

    // Return empty data on error
    return {
      protests: [],
      total: 0,
      page: 1,
      limit: 24,
      filters: {
        search: '',
        city: '',
        country: '',
        startDate: '',
        endDate: '',
        days: '',
        lat: '',
        lon: '',
        radius: '10'
      },
      error: error.message
    };
  }
}
