import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import api from '../../api/Api';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData, authToken) => {
    // Make sure userData has a role property
    const userWithRole = {
      ...userData,
      role: userData.role || 'student' // Default to student if not provided
    };

    setUser(userWithRole);
    setToken(authToken);
    setIsAuthenticated(true);

    // Store in localStorage
    if (authToken) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('userRole', userWithRole.role);
      localStorage.setItem('userName', userWithRole.name || '');
      localStorage.setItem('userEmail', userWithRole.email || '');
    }

    console.log("User logged in:", userWithRole);
    console.log("Token stored:", !!authToken);
    console.log("Is authenticated set to:", true);
  };

  const logout = async () => {
    try {
      // Call logout endpoint if you have one
      await api.post('/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      console.log("User logged out, isAuthenticated set to false");
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);

      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      const storedName = localStorage.getItem('userName');
      const storedEmail = localStorage.getItem('userEmail');

      console.log('Checking auth - stored token:', !!storedToken);
      console.log('Checking auth - stored role:', storedRole);

      if (storedToken) {
        try {
          // Try to verify with backend
          const res = await api.get('/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (res.data.success) {
            const userData = res.data.user;
            setUser(userData);
            setToken(storedToken);
            setIsAuthenticated(true);

            // Update localStorage with latest user data
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userName', userData.name || '');
            localStorage.setItem('userEmail', userData.email || '');

            console.log('Auth check successful - User:', userData);
            console.log('Is authenticated set to:', true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Backend auth check failed:', error.message);

          // If backend fails but we have stored data, use it temporarily
          if (storedRole) {
            console.log('Using stored credentials as fallback');
            const userData = {
              role: storedRole,
              name: storedName || '',
              email: storedEmail || '',
            };
            setToken(storedToken);
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Is authenticated set to true (fallback)');
          } else {
            setIsAuthenticated(false);
          }
        }
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };
  const refreshUser = async () => {
    try {
      const storedToken = token || localStorage.getItem('token');
      if (!storedToken) return;
      const res = await api.get('/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('userRole', res.data.user.role);
        localStorage.setItem('userName', res.data.user.name || '');
        localStorage.setItem('userEmail', res.data.user.email || '');
      }
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const storedToken = token || localStorage.getItem('token');
    return storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Show nothing while loading initial auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const value = {
    user,
    setUser,
    login,
    logout,
    refreshUser,
    token: token || localStorage.getItem('token'),
    isAuthenticated, // Now this is a boolean, not a function
    hasRole,
    loading,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;