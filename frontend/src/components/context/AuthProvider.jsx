import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import api from '../../api/Api';

const AuthProvider = ({children}) =>{
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true);
const login = (userData) =>{
  setUser(userData);
  console.log("User logged in:", userData);
}

const logout = () =>{
  setUser(null)
}
const checkAuth = async () => {
  try {
    const res = await api.get('/me',{withCredentials:true});
     
    setUser(res.data.user);
  } catch (error) {
    setUser(null);
  } finally {
    setLoading(false);
  }
};
useEffect(()=>{
   
  checkAuth();
},[])

if(loading) return null;

return (
  <AuthContext.Provider value={{user, login , logout}}>
    {children}
  </AuthContext.Provider>
)

}

export default AuthProvider