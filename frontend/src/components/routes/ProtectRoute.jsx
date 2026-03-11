import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
   const { user, loading, isAuthenticated } = useContext(AuthContext);
   const location = useLocation();

   useEffect(() => {
      console.log('Protected Route Check:', {
         path: location.pathname,
         isAuthenticated,
         user: user,
         userRole: user?.role,
         allowedRoles,
         loading
      });
   }, [location, isAuthenticated, user, allowedRoles, loading]);

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

   // Not authenticated - redirect to appropriate login page
   if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login from:', location.pathname);

      // Check if this route is specifically for teachers
      if (allowedRoles?.includes('teacher')) {
         return <Navigate to='/teacherlogin' state={{ from: location }} replace />;
      }

      // For all other protected routes (including student routes), redirect to student login
      return <Navigate to='/login' state={{ from: location }} replace />;
   }

   const userRole = user?.role?.toLowerCase() || 'student';
   console.log('User role:', userRole);

   // Check role-based access if allowedRoles is provided
   if (allowedRoles && allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some(role =>
         role.toLowerCase() === userRole
      );

      if (!hasRequiredRole) {
         const errorMessage = `Access Denied: This page is for ${allowedRoles.join(' or ')} only.`;
         console.log('Role mismatch:', { userRole, requiredRoles: allowedRoles });

         // Redirect based on user's actual role
         if (userRole === 'teacher') {
            return <Navigate to='/teacher-home' state={{ error: errorMessage }} replace />;
         } else if (userRole === 'student') {
            return <Navigate to='/home' state={{ error: errorMessage }} replace />;
         } else {
            return <Navigate to='/' state={{ error: errorMessage }} replace />;
         }
      }
   }

   return children;
};

export default ProtectedRoute;