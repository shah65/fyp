import { React, useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
   const { user } = useContext(AuthContext);

   console.log('ProtectedRoute - User:', user);
   console.log('ProtectedRoute - Allowed Roles:', allowedRoles);

   if (!user) {
      return <Navigate to='/login' replace />;
   }

   // Check if user has role property
   const userRole = user.role || 'student'; // Default to 'student' if role not set

   if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log('Role not allowed. User role:', userRole);
      return <Navigate to='/unauthorized' replace />;
   }

   return children;
};

export default ProtectedRoute;