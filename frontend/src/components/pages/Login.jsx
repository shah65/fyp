import { useForm } from "react-hook-form";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/Api";
import AuthContext from "../context/AuthContext";

const Login = ( ) => {
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

      login(response.data.user);

      // Role based redirect
      
        navigate("/");
      

    } catch (error) {
      if(error.response && error.response.status === 401) {
        alert("Password Incorect");
      } else {
        alert(error.response?.data?.message || "Login failed");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-96 p-8 bg-white rounded-xl shadow-xl">
         

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            type="email"
            placeholder={`  Email `}
            {...register("email", { required: "Email is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          <button
            disabled={!isValid}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Login
          </button>

        </form>
        <button className="w-full mt-4 bg-gray-500 text-white p-2 rounded" onClick={() => navigate("/signup")}>
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;