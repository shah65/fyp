// frontend/src/components/context/AuthContext.js
import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  setUser:() =>{},
  login: () => { },
  logout: () => { },
  refreshUser: () => { },
  token: null,
  isAuthenticated: false,
  hasRole: (role) => false,
  loading: true,
  getAuthHeaders: () => ({})

});

export default AuthContext;