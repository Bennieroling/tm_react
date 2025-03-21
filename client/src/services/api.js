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
      return response;
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
      return response;
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
      return response;
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
      return response;
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
      console.log(`Calling getPhoneNumbersByCountry API for country: ${country}`);
      const response = await apiClient.get(`/phone/country/${encodeURIComponent(country)}`);
      console.log('Received API response:', response.data);
      return response;
    } catch (error) {
      // If 404, provide a nicer error message
      if (error.response && error.response.status === 404) {
        console.error(`API Error in getPhoneNumbersByCountry for ${country}: Endpoint not found (404)`);
        // Create a structured error object for better debugging
        const enhancedError = { 
          ...error,
          response: {
            ...error.response,
            data: {
              success: false,
              message: `No phone numbers found for ${country}`
            }
          }
        };
        throw enhancedError;
      }
      
      console.error(`API Error in getPhoneNumbersByCountry for ${country}:`, error);
      throw error;
    }
  },
  
  // If you have other phone-related endpoints, add them here
  getPhoneDetails: async (phoneId) => {
    try {
      const response = await apiClient.get(`/phone/${phoneId}`);
      return response;
    } catch (error) {
      console.error(`API Error in getPhoneDetails for ${phoneId}:`, error);
      throw error;
    }
  }
};

export default apiClient;