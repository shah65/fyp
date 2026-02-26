import { React,useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({children,allowedRoles}) =>{
const {user} = useContext(AuthContext);

if(!user){
  return 
   <>
      <Navigate to='/login' replace/>;
   </>;
}
console.log("User role:", user.role);
if(allowedRoles && !allowedRoles.includes(user.role)){
   return <Navigate to='/unauthorized' replace/>;
}
return children;
}

export default ProtectedRoute;