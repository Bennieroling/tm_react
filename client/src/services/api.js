import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://we-test-tm-applinux-01.azurewebsites.net/api';

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
    try {
      console.log('Calling getGlobalStatus API');
      const response = await apiClient.get('/telemetry/global');
      console.log('Received API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error in getGlobalStatus:', error);
      throw error;
    }
  },

  // Get detailed telemetry status for a specific country
  getCountryStatus: async (countryId) => {
    try {
      console.log(`Calling getCountryStatus API for country: ${countryId}`);
      const response = await apiClient.get(`/telemetry/country/${countryId}`);
      console.log('Received API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`API Error in getCountryStatus for ${countryId}:`, error);
      throw error;
    }
  }
};

// History API endpoints
export const historyApi = {
  // Get status history with time-based filtering
  getStatusHistory: async (timeRange = '5d', startDate = null, endDate = null) => {
    try {
      const params = { timeRange };
      
      if (timeRange === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const response = await apiClient.get('/history', { params });
      return response; // Return the entire response, not just response.data
    } catch (error) {
      console.error('API Error in getStatusHistory:', error);
      throw error;
    }
  },
  
  // Get phone number history with time-based filtering
  getPhoneHistory: async (timeRange = '5d', startDate = null, endDate = null, number = null) => {
    try {
      const params = { timeRange };
      
      if (timeRange === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      if (number) {
        params.number = number;
      }
      
      const response = await apiClient.get('/history/phone', { params });
      return response; // Return the entire response, not just response.data
    } catch (error) {
      console.error('API Error in getPhoneHistory:', error);
      throw error;
    }
  }
};

// Phone Numbers API endpoints
export const phoneApi = {
  // Get phone numbers for a specific country
  getPhoneNumbersByCountry: async (country) => {
    try {
      const response = await apiClient.get(`/phone/country/${encodeURIComponent(country)}`);
      return response;
    } catch (error) {
      console.error(`API Error in getPhoneNumbersByCountry for ${country}:`, error);
      throw error;
    }
  }
};

export default apiClient;