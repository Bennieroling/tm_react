import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Telemetry API endpoints
export const telemetryApi = {
  // Get global telemetry status for all countries
  getGlobalStatus: async () => {
    const response = await apiClient.get('/telemetry/global');
    return response.data;
  },

  // Get detailed telemetry status for a specific country
  getCountryStatus: async (countryId) => {
    const response = await apiClient.get(`/telemetry/country/${countryId}`);
    return response.data;
  }
};

// History API endpoints
export const historyApi = {
  // Get status history with time-based filtering
  getStatusHistory: async (timeRange = '5d', startDate = null, endDate = null) => {
    const params = { timeRange };
    
    if (timeRange === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    
    const response = await apiClient.get('/history', { params });
    return response.data;
  },
  
  // Get phone number history with time-based filtering
  getPhoneHistory: async (timeRange = '5d', startDate = null, endDate = null, number = null) => {
    const params = { timeRange };
    
    if (timeRange === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    
    if (number) {
      params.number = number;
    }
    
    const response = await apiClient.get('/history/phone', { params });
    return response.data;
  }
};

// Phone Numbers API endpoints
export const phoneApi = {
  // Get phone numbers for a specific country
  getPhoneNumbersByCountry: async (country) => {
    const response = await apiClient.get(`/phone/country/${encodeURIComponent(country)}`);
    return response.data;
  }
};

export default apiClient;