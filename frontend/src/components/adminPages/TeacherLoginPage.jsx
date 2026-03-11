import React from 'react';
import { useForm } from "react-hook-form";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/Api";
import AuthContext from "../context/AuthContext";

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    // Clear any previous server errors
    setServerError('');

    try {
      console.log("Attempting login with:", data.email);

      const response = await api.post("/teacher/login", {
        email: data.email,
        password: data.password,
      });

      console.log("Login response:", response.data);

      // Check if token exists in response
      if (!response.data.token) {
        console.error('No token in response!');
        setServerError('Server did not return authentication token');
        return;
      }

      // Log token for debugging
      console.log('Token received:', response.data.token.substring(0, 20) + '...');

      // Prepare user data with explicit role
      const userData = {
        ...response.data.user,
        role: 'teacher' // Ensure role is set
      };

      // ✅ FIX: Pass BOTH user data AND token to login function
      login(userData, response.data.token);

      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('Token stored after login:', !!storedToken);

      if (storedToken) {
        // Redirect to teacher home
        navigate("/teacher-home");
      } else {
        console.error('Token not stored in localStorage!');
        setServerError('Login failed: Could not save authentication token');
      }

    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);

      // Handle different error scenarios based on backend response
      if (error.code === 'ERR_NETWORK') {
        setServerError("Cannot connect to server. Please check if backend is running on port 4002.");
      }
      else if (error.response) {
        const { status, data } = error.response;
        console.log('Error status:', status);
        console.log('Error data:', data);

        // Handle 401 Unauthorized errors
        if (status === 401) {
          if (data.message === "No account found with this email") {
            setServerError("No account found with this email. Please create an account first.");
            setTimeout(() => {
              if (window.confirm("Would you like to create a teacher account?")) {
                navigate("/teacher/signup");
              }
            }, 1000);
          }
          else if (data.message === "Invalid Credentials") {
            setServerError("Invalid password. Please try again.");
          }
          else {
            setServerError(data.message || "Authentication failed");
          }
        }
        // Handle 404 Not Found
        else if (status === 404) {
          setServerError("Login endpoint not found. Please check if teacher routes are configured in backend.");
        }
        // Handle other status codes
        else if (status === 500) {
          setServerError("Server error. Please try again later.");
        }
        else {
          setServerError(data.message || "Login failed. Please try again.");
        }
      }
      // Network errors (no response)
      else if (error.request) {
        setServerError("Cannot connect to server. Please check if backend is running.");
      }
      // Other errors
      else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-96 p-8 bg-white rounded-2xl shadow-2xl transform transition-all hover:scale-105">

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Login</h1>
          <p className="text-gray-500">Welcome back! Please enter your details</p>
        </div>

        {/* Server Error Message */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{serverError}</span>
              <button
                onClick={() => setServerError('')}
                className="text-red-700 hover:text-red-900"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Email Address
            </label>
            <input
              type="email"
              placeholder="teacher@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/teacher/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition transform hover:translate-y-[-2px] ${!isValid || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>

        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/teacher/signup"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>Debug: localStorage token: {localStorage.getItem('token') ? '✅' : '❌'}</p>
          <p>Debug: localStorage role: {localStorage.getItem('userRole') || 'none'}</p>
        </div>

      </div>
    </div>
  );
};

export default TeacherLoginPage;