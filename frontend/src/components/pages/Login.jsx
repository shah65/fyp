import { useForm } from 'react-hook-form';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import awkumImage from '../../public/awkumimg1.png';
import AuthContext from '../context/AuthContext';

const Login = ( ) => {
  const navigate = useNavigate();
  const {login} = useContext(AuthContext)
   const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange' });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/login', {
        email: data.email,
        password: data.password,
      });
       console.log('Login Success: ', response.data);
       login(response.data.user)
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';

      alert(message);
        
    }

     
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${awkumImage})` }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Student Login</h1>

        <form   onSubmit={handleSubmit(onSubmit)}   className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Student Email"
            {...register('email', {
              required: 'Email is required',
            })}
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            {...register('password', {
              required: 'Password is required',
            })}
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}

          {/* Button */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2 mt-4 rounded-lg font-semibold text-lg transition-all
              ${
                isValid ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'
              } text-white`}
          >
            Login
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-white mt-6 text-sm">
          Don’t have an account?{' '}
          <a href="/signup" className="text-red-300 hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
