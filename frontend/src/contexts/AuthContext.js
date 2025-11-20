import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

// Authentication context: exposes user state and auth actions across the app.
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Set the token in API client
          api.setAuthToken(token);
          
          // Get current user data
          try {
            const userData = await api.getCurrentUser();
            setUser(userData);
          } catch (error) {
            console.error('Failed to get current user:', error);
            // Token might be invalid, clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            api.clearAuthToken();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Kick off login (username or email is acceptable)
      const response = await api.login(username, password);
      // Response should include tokens and user payload
      
      const { access, refresh, user: userData } = response;

      if (!access || !refresh) {
        throw new Error('Invalid response from server - missing tokens');
      }

      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Set auth token in API client
      api.setAuthToken(access);

      // Set user data
      setUser(userData);

      // Login succeeded
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      // Handle different types of login errors
      const responseData = error.response?.data;
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (responseData) {
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
          errorMessage = responseData.non_field_errors[0];
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      // Create account and get tokens
      const response = await api.register(userData);
      // Registration response contains user and tokens
      
      const { access, refresh, user: newUser } = response;

      if (!access || !refresh) {
        throw new Error('Invalid response from server - missing tokens');
      }

      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Set auth token in API client
      api.setAuthToken(access);

      // Set user data
      setUser(newUser);

      // Registration succeeded
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle field-specific validation errors
      const responseData = error.response?.data;
      if (responseData && typeof responseData === 'object') {
        // If we have field-specific errors, return them
        const fieldErrors = {};
        let generalError = '';
        
        Object.keys(responseData).forEach(field => {
          const fieldError = responseData[field];
          if (Array.isArray(fieldError)) {
            fieldErrors[field] = fieldError[0]; // Take first error message
          } else if (typeof fieldError === 'string') {
            fieldErrors[field] = fieldError;
          } else if (field === 'non_field_errors' || field === 'detail') {
            generalError = Array.isArray(fieldError) ? fieldError[0] : fieldError;
          }
        });

        // If we have field errors, use the first one as the general error for display
        const errorMessage = generalError || 
                            Object.values(fieldErrors)[0] || 
                            'Registration failed. Please check your information.';
        
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
        };
      }
      
      const errorMessage = error.response?.data?.detail ||
                          error.message ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear auth token in API client
      api.clearAuthToken();

      // Clear user data
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

 // Memoize value to avoid unnecessary re-renders
 const value = React.useMemo(() => ({
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};