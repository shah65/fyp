import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import api from '../../api/Api';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    // Make sure userData has a role property
    const userWithRole = {
      ...userData,
      role: userData.role || 'student' // Default to student if not provided
    };
    setUser(userWithRole);
    console.log("User logged in:", userWithRole);
  };

  const logout = () => {
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      const res = await api.get('/me', { withCredentials: true });

      // Ensure the user object has a role property
      const userData = res.data.user;
      if (userData && !userData.role) {
        userData.role = 'student'; // Default role
      }

      setUser(userData);
      console.log('Auth check - User:', userData);
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;