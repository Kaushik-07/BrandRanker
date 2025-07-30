import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've checked localStorage

  // Function to validate token by checking if it exists and has valid format
  const validateToken = (token: string): boolean => {
    try {
      console.log('🔍 Validating token...');
      
      if (!token || typeof token !== 'string') {
        console.log('❌ Token is empty or not a string');
        return false;
      }
      
      // Basic JWT token validation - check if it has 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('❌ Token does not have 3 parts');
        return false;
      }
      
      // Check if token is not expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log('🔍 Token payload:', payload);
      console.log('🔍 Current time:', currentTime);
      console.log('🔍 Token expiration:', payload.exp);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('❌ Token expired');
        return false;
      }
      
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication state...');
      
      // Check for stored token and user data on app load
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Stored token:', storedToken ? 'Present' : 'Missing');
      console.log('🔍 Stored user:', storedUser ? 'Present' : 'Missing');
      
      if (storedToken && storedUser) {
        try {
          const userData: User = JSON.parse(storedUser);
          console.log('🔍 Parsed user data:', userData);
          
          // Validate the token locally first
          const isValid = validateToken(storedToken);
          console.log('🔍 Token validation result:', isValid);
          
          if (isValid) {
            // Set the user and token immediately for better UX
            setUser(userData);
            setToken(storedToken);
            console.log('✅ Token validated locally, user restored:', userData.username);
            console.log('✅ Current user state after restoration:', userData);
            console.log('✅ Current token state after restoration:', storedToken ? 'Present' : 'Missing');
            
            // Test the token with a simple API call
            try {
              console.log('🧪 Testing token with API call...');
              const testResponse = await fetch('http://localhost:8000/api/experiments/', {
                headers: {
                  'Authorization': `Bearer ${storedToken}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('🧪 Test API response status:', testResponse.status);
              if (testResponse.ok) {
                console.log('✅ Token is working with backend');
              } else {
                console.log('❌ Token not working with backend');
              }
            } catch (error) {
              console.log('❌ Token test failed:', error);
            }
          } else {
            console.log('❌ Token invalid locally, clearing stored data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } else {
        console.log('ℹ️ No stored authentication data found');
        setUser(null);
        setToken(null);
      }
      
      setIsInitialized(true);
      setIsLoading(false);
      console.log('✅ Authentication initialization complete');
      console.log('🔍 Final user state:', user);
      console.log('🔍 Final token state:', token ? 'Present' : 'Missing');
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Starting login process for:', username);
      const response = await authAPI.login(username, password);
      const { access_token } = response;
      
      // Create user object from username since backend doesn't return user data in login
      const user: User = {
        id: 0, // We'll get this from the token or a separate call if needed
        email: '', // We'll get this from the token or a separate call if needed
        username: username,
      };
      
      console.log('🔍 Setting new user data:', user);
      console.log('🔍 Setting new token:', access_token ? 'Present' : 'Missing');
      console.log('🔍 Full token:', access_token);
      
      setUser(user);
      setToken(access_token);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Login successful, user data stored');
      console.log('🔍 Token in localStorage after login:', localStorage.getItem('token'));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('📝 Starting registration process for:', username);
      // Register returns user data
      const userData = await authAPI.register(email, username, password);
      
      // After successful registration, automatically log in
      console.log('🔐 Auto-login after registration for:', username);
      const loginResponse = await authAPI.login(username, password);
      const { access_token } = loginResponse;
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
      };
      
      console.log('🔍 Setting new user data after registration:', user);
      console.log('🔍 Setting new token after registration:', access_token ? 'Present' : 'Missing');
      
      setUser(user);
      setToken(access_token);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Registration and login successful');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Logout successful, data cleared');
  };

  // Function to handle token expiration
  const handleTokenExpiration = () => {
    console.log('🔄 Token expired, logging out user');
    logout();
  };

  // Function to check if token is about to expire (within 1 hour)
  const isTokenExpiringSoon = (token: string): boolean => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const oneHour = 60 * 60; // 1 hour in seconds
      
      return payload.exp && (payload.exp - currentTime) < oneHour;
    } catch (error) {
      return false;
    }
  };

  // Check token expiration periodically
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      if (token && !validateToken(token)) {
        console.log('🔄 Token expired during periodic check, logging out user');
        handleTokenExpiration();
      }
    };

    // Check every 10 minutes instead of 5 to reduce overhead
    const interval = setInterval(checkTokenExpiration, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 