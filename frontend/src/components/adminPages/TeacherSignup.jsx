// pages/TeacherSignup.jsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../api/Api";

const TeacherSignup = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/teacher/signup", data);
      alert("Registration successful! Please login.");
      navigate("/teacherlogin");
    } catch (error) {
      if(error.response?.status === 403){
        alert("Invalid secret key. Please contact admin.");
      }
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-96 p-8 bg-white rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">Teacher Registration</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            {...register("name", { required: "Name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required", minLength: 6 })}
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          <input
            type="text"
            placeholder="Teacher ID"
            {...register("teacherId", { required: "Teacher ID is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.teacherId && <p className="text-red-500">{errors.teacherId.message}</p>}

          <input
            type="text"
            placeholder="Subject"
            {...register("subject", { required: "Subject is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.subject && <p className="text-red-500">{errors.subject.message}</p>}

          <input
            type="text"
            placeholder="Department"
            {...register("department", { required: "Department is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.department && <p className="text-red-500">{errors.department.message}</p>}

          <input
            type="text"
            placeholder="Qualification"
            {...register("qualification", { required: "Qualification is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.qualification && <p className="text-red-500">{errors.qualification.message}</p>}
          <input
            type="text"
            placeholder="Secret Key"
            {...register("secretkey", { required: "Secret Key is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.secretkey && <p className="text-red-500">{errors.secretkey.message}</p>}

          <input
            type="number"
            placeholder="Years of Experience"
            {...register("experience")}
            className="w-full p-2 border rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <a href="/teacherlogin" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default TeacherSignup;