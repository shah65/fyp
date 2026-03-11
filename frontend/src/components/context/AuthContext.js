// frontend/src/components/context/AuthContext.js
import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  login: () => { },
  logout: () => { },
  token: null,
  isAuthenticated: false,
  hasRole: (role) => false,
  loading: true
});

export default AuthContext;