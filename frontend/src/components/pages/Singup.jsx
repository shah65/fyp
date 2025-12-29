import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import awkumImage from '../../public/awkumimg1.png';
import { useState } from 'react';

const Signup = () => {
  const navigate = useNavigate();
 
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange' });
// useEffect(() => {
//   reset({
//     studentName: '',
//     studentId: '',
//     email: '',
//     password: '',
//     subject: '',
//     semester: '',
//   });
// }, [reset]);
  const onSubmit = async (data) => {
    
    try {
      await api.post('/signup', {
        name: data.studentName,
        email: data.email,
        password: data.password,
        stdId: data.studentId,
        subject:data.subject,
        semester:data.semester
        
      });

      alert('Account Created Succfully');
      reset();
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${awkumImage})` }}
      ></div>

      {/* Overlay (optional for readability) */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Signup Card */}
      <div
        className="relative z-10 w-full max-w-md p-8 rounded-2xl
                      bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-6">Create Student Account</h1>

        {/* Form */}
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            autoComplete="off"
            {...register('studentName', { required: 'Student name is required' })}
            placeholder="Student Name"
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white
                       placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.studentName && <span className="text-red-500">Field must be required</span>}

          <input
            type="text"
            autoComplete="off"
            placeholder="Student ID"
            {...register('studentId', { required: 'Student ID is required' })}
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white
                       placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.studentId && (
            <p className="text-red-400 text-sm mt-1">{errors.studentId.message}</p>
          )}

          <input
            type="email"
            autoComplete="new-Email"
            placeholder="Student Email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email format',
              },
            })}
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white
                       placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white
                       placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>}

          <input
            {...register('subject', { required: 'Subject is required' })}
            type="text"
            placeholder="Subject"
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white
                       placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>}

          <input
            type="text"
            {...register('semester', { required: 'Semester is required' })}
            placeholder="Semester"
            className="w-full px-4 py-2 rounded-lg bg-white/30 text-white
                       placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.semester && (
            <p className="text-red-400 text-sm mt-1">{errors.semester.message}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-2 mt-4 rounded-lg text-white font-semibold text-lg shadow-md transition-all duration-300
    ${isValid ? 'bg-red-500 hover:bg-amber-700 cursor-pointer' : 'bg-red-300 cursor-not-allowed'}`}
          >
            Sign Up
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-white mt-6 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-red-300 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
