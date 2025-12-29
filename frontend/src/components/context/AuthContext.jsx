 import { createContext,useContext,useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUse] = useState(null);
  return (
    <>
    <AuthContext.Provider value={{user,setUse}}>
      {children}
    </AuthContext.Provider>
    </>
  )

}

export const useAuth = () => useContext(AuthContext);