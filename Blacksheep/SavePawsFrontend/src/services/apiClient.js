import axios from 'axios';
import { Platform } from 'react-native';
import { getAuthHeaders } from '../utils/auth';

// Get API base URL - compatible with both config files
const getBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com';
  }
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const API_BASE_URL = getBaseUrl();

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const authHeaders = await getAuthHeaders();
      
      // Add Authorization header if token exists
      if (authHeaders['Authorization']) {
        config.headers['Authorization'] = authHeaders['Authorization'];
      }
      
      // Add x-user-id header if exists
      if (authHeaders['x-user-id']) {
        config.headers['x-user-id'] = authHeaders['x-user-id'];
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Token missing/expired.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

