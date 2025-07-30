import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { User, Token, ExperimentResult, ExperimentCreate, ExperimentResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Simple in-memory cache (currently disabled to prevent infinite loops)
const cache = new Map<string, { data: any; timestamp: number }>();
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    return error.response?.status && [500, 502, 503, 504].includes(error.response.status);
  }
};

// Extend axios config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { cacheKey: string };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and cache key
api.interceptors.request.use((config: ExtendedAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  console.log('🔍 Request interceptor - Token from localStorage:', token ? 'Present' : 'Missing');
  console.log('🔍 Request URL:', config.url);
  console.log('🔍 Request method:', config.method);
  console.log('🔍 Full token:', token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token added to request headers');
    console.log('🔍 Authorization header:', config.headers.Authorization);
  } else {
    console.log('❌ No token found in localStorage');
  }
  
  // Add cache key for GET requests
  if (config.method === 'get') {
    config.metadata = { cacheKey: `${config.method}:${config.url}` };
  }
  
  return config;
});

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Response successful:', response.config.url);
    // Cache successful GET responses
    const config = response.config as ExtendedAxiosRequestConfig;
    if (config.method === 'get' && config.metadata?.cacheKey) {
      cache.set(config.metadata.cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ API Response error:', error.response?.status, error.config?.url);
    
    const originalRequest = error.config as any;
    
    // Handle 401 errors - clear invalid tokens
    if (error.response?.status === 401) {
      console.log('🚫 401 Unauthorized - Token might be invalid or expired');
      console.log('🔍 Current token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Clear invalid token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🧹 Cleared invalid token from localStorage');
      
      // Don't redirect automatically - let the AuthContext handle this
      // The AuthContext will detect the missing token and update the state
    }
    
    // Handle 403 errors
    if (error.response?.status === 403) {
      console.log('🚫 403 Forbidden - Token might be invalid');
      console.log('🔍 Current token in localStorage:', localStorage.getItem('token'));
    }
    
    // Retry logic for server errors
    if (originalRequest && !originalRequest._retry && RETRY_CONFIG.retryCondition(error)) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      if (originalRequest._retryCount <= RETRY_CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay * originalRequest._retryCount));
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API functions with caching and error handling (currently disabled to prevent infinite loops)
// const createAPIWithCache = <T>(apiCall: () => Promise<T>, cacheKey?: string): (() => Promise<T>) => {
//   return async () => {
//     // Check cache first
//     if (cacheKey) {
//       const cached = cache.get(cacheKey);
//       if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//         return cached.data;
//       }
//     }
//     
//     try {
//       const result = await apiCall();
//       return result;
//     } catch (error) {
//       console.error('API call failed:', error);
//       throw error;
//     }
//   };
// };

export const authAPI = {
  login: async (username: string, password: string): Promise<Token> => {
    console.log('🔐 Attempting login for:', username);
    try {
      const response = await api.post('/api/auth/login', { username, password });
      console.log('✅ Login successful, token received');
      console.log('📄 Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Login API error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  register: async (email: string, username: string, password: string): Promise<User> => {
    console.log('📝 Attempting registration for:', username, email);
    try {
      const response = await api.post('/api/auth/register', { email, username, password });
      console.log('✅ Registration successful, user data received');
      console.log('📄 Response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration API error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },
};

export const experimentsAPI = {
  createExperiment: async (experiment: ExperimentCreate): Promise<ExperimentResponse> => {
    console.log('🚀 Creating experiment:', experiment);
    const response = await api.post('/api/experiments/', experiment);
    console.log('✅ Experiment created successfully');
    // Clear cache after creating new experiment
    cache.clear();
    return response.data;
  },

  getExperiments: async (): Promise<ExperimentResult[]> => {
    console.log('🔍 Fetching experiments...');
    console.log('🔍 Current token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    try {
      const response = await api.get('/api/experiments/');
      console.log('✅ Experiments fetched successfully:', response.data.length, 'experiments');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch experiments:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  getExperiment: async (id: number): Promise<ExperimentResult> => {
    console.log('🔍 Fetching experiment:', id);
    const response = await api.get(`/api/experiments/${id}`);
    console.log('✅ Experiment fetched successfully');
    return response.data;
  },
};

// Cache management utilities
export const cacheUtils = {
  clear: () => cache.clear(),
  clearExperiment: (id: number) => cache.delete(`experiment:${id}`),
  clearExperiments: () => cache.delete('experiments'),
  getCacheSize: () => cache.size,
  getCacheKeys: () => Array.from(cache.keys())
};

export default api; 