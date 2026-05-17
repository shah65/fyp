import { useForm } from "react-hook-form";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/Api";
import AuthContext from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/login", {
        email: data.email,
        password: data.password,
      });

      console.log('Login response:', response.data); // Debug log

      // Check if response has token
      if (!response.data.token) {
        console.error('No token in response');
        alert('Server did not return authentication token');
        return;
      }

      // IMPORTANT: Ensure user object has a role property
      // If the API doesn't return role, set it explicitly
      const userData = response.data.user || {};

      // Make sure role is set - default to 'student' for student login
      const userWithRole = {
        ...userData,
        role: userData.role || 'student', // Force role to be 'student'
        name: userData.name || userData.email || 'Student',
        email: userData.email || data.email
      };

      console.log('User data with role:', userWithRole);

      // Pass both user data AND token to login function
      login(userWithRole, response.data.token);

      // Role based redirect
      navigate("/home");

    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || "Login failed");

    
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-96 p-8 bg-white rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              // pattern: {
              //   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              //   message: "Invalid email address"
              // }
            })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 1,
                message: "Password must be at least 6 characters"
              }
            })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full text-white p-2 rounded transition-colors ${isValid
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Login
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default Login;