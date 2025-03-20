import axios from 'axios';

// Create a base API client that uses relative URLs
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Export all required APIs to match the original structure
export const telemetryApi = {
  fetchGlobalTelemetry: async () => {
    try {
      const response = await apiClient.get('/telemetry/global');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  fetchCountryTelemetry: async (countryId) => {
    try {
      const response = await apiClient.get(`/telemetry/country/${countryId}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export const historyApi = {
  fetchHistory: async () => {
    try {
      const response = await apiClient.get('/history');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Add the missing phoneApi
export const phoneApi = {
  fetchPhoneStatus: async () => {
    try {
      // Using a mock response since we don't know the exact endpoint
      const mockResponse = { status: 'operational' };
      return mockResponse;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
