import React, { useContext } from 'react'
import mg from '../../assets/img.jpeg'
import { useNavigate } from 'react-router-dom';
import awkumImage from '../../public/awkumimg1.png';
import tchrlogo from '../../public/tchlogo.png';
import stdlgo from '../../public/stdlogo.png';
import Header from '../../components/pages/Header';
import Singup from './Singup';
import AuthContext from '../context/AuthContext';
import Footer from './Footer';
const Home = () => {
  const navigate = useNavigate();
   const { user } = useContext(AuthContext);
   console.log("User data =>",user);
   

   return (
     <>
       {user && (
         <div
           className="
    fixed top-0 left-0 z-50
    w-full h-16
    flex items-center
    bg-white/20 backdrop-blur-xl
    border-b border-white/30
    shadow-[0_10px_30px_rgba(0,0,0,0.25)]
    transition-all duration-300
    hover:bg-white/30
  "
         >
           <Header user={user} />
         </div>
       )}

       <main className="relative mt-0.5  w-screen min-h-screen  overflow-hidden ">
         {/* Background Image */}
         <div
           className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-fixed"
           style={{ backgroundImage: `url(${awkumImage})` }}
         ></div>

         {/* Color overlay / shadow effect */}
         <div className="absolute inset-0 bg-linear-to-br from-black/15 via-black/10 to-indigo-800/35">
           {user && (
             <div className="relative z-20 mt-20 ml-6 flex gap-6 items-start">
               {/* ===== STUDENT DETAILS CARD ===== */}
               <div
                 className="w-[760px] h-[360px]
        bg-white/15 backdrop-blur-lg hover:backdrop-blur-[6px]
        border border-white/30
        shadow-[0_20px_40px_rgba(247, 247, 247, 0.35)]
        rounded-2xl
        flex items-center gap-8 px-10
        transition-all duration-300
        hover:bg-white/20 hover:-translate-y-3"
               >
                 <img src={mg} className="w-44 h-44 rounded-2xl border border-white object-cover" />

                 <div className="text-white space-y-1">
                   <h1 className="text-2xl font-bold mb-2">Student Details</h1>
                   <p>
                     <span className="text-indigo-300">Name:</span> {user.name}
                   </p>
                   <p>
                     <span className="text-indigo-300">Email:</span> {user.email}
                   </p>
                   <p>
                     <span className="text-indigo-300">Subject:</span> {user.subject}
                   </p>
                   <p>
                     <span className="text-indigo-300">Department:</span> {user.department}
                   </p>
                   <p>
                     <span className="text-indigo-300">Semester:</span> {user.semester}
                   </p>
                   <p>
                     <span className="text-indigo-300">Student ID:</span> {user.stdId}
                   </p>
                 </div>
               </div>

               {/* ===== ACTION CARD (UPLOAD / EDIT) ===== */}
               <div
                 className="w-[360px] h-[360px]
        bg-white/15 backdrop-blur-xl
        border border-white/30 hover:backdrop-blur-[6px]
        shadow-[0_20px_40px_rgba(231, 227, 227, 0.35)]
        rounded-2xl
        flex flex-col items-center justify-center gap-6
        transition-all duration-300
        hover:bg-white/20 hover:-translate-y-2"
               >
                 <h2 className="text-xl font-bold text-white">Project Actions</h2>

                 <button className="w-48 py-3 rounded-xl bg-indigo-500/80 text-white font-semibold hover:bg-indigo-300 hover:border-2 hover:border-blue-400 hover:text-zinc-700 transition">
                   Upload Project
                 </button>

                 <button className="w-48 py-3 rounded-xl bg-emerald-600/80 text-white font-semibold hover:bg-emerald-400 hover:text-zinc-700 hover:border-2 hover:border-green-200 transition">
                   Edit Project
                 </button>
               </div>
             </div>
           )}
         </div>

         {/* Content layer */}
         <div className="relative z-10   h-full flex items-center justify-center text-white">
           {!user && (
             <div className="grid   grid-cols-2 gap-10">
               {/* STUDENT CARD */}
               <div
                 onClick={() => navigate('/login')}
                 className="group w-80 h-48 rounded-2xl
                bg-white/20  
                border border-white/40
                shadow-[0_20px_40px_rgba(238, 226, 226, 0.35)]
                flex flex-col items-center justify-center gap-3
                transition-all duration-300
                hover:bg-white/10 mt-20
                hover:-translate-y-2 hover:scale-105
                hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)]
                cursor-pointer  "
               >
                 <img
                   src={stdlgo}
                   alt="Student"
                   className="w-14 h-14 object-contain transition group-hover:brightness-90"
                 />

                 <h2 className="text-2xl font-semibold transition group-hover:text-zinc-900">
                   <a href="/login">Are you a Student?</a>
                 </h2>
               </div>

               {/* TEACHER CARD */}
               <div
                 className="group w-80 h-48 rounded-2xl
    bg-white/20 mt-20
    border border-white/30
    shadow-[0_20px_40px_rgba(0,0,0,0.35)]
    flex flex-col items-center justify-center gap-3
    transition-all duration-300
    hover:bg-white/10
    hover:-translate-y-2 hover:scale-105
    cursor-pointer"
               >
                 <img
                   src={tchrlogo}
                   alt="Teacher"
                   className="w-14 h-14 rounded-xl transition group-hover:brightness-90"
                 />

                 <h2 className="text-2xl font-semibold transition group-hover:text-zinc-900">
                   Are you a Teacher?
                 </h2>
               </div>

               {/* GUEST CARD */}
               <div className="col-span-2 flex justify-center">
                 <div
                   className="group w-80 h-48 rounded-2xl
      bg-white/20  
      border border-white/30
      shadow-[0_20px_40px_rgba(0,0,0,0.35)]
      flex flex-col items-center justify-center gap-3
      transition-all duration-300
      hover:bg-white/10
      hover:-translate-y-2 hover:scale-105
      cursor-pointer"
                 >
                   <img
                     src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                     alt="Guest"
                     className="w-12 h-12 transition group-hover:brightness-90"
                   />

                   <h2 className="text-2xl font-semibold transition group-hover:text-zinc-900">
                     Continue as Guest
                   </h2>
                 </div>
               </div>
             </div>
           )}

           {user && (
             <div className="  mt-100 h-25 w-screen">
               <Footer />
             </div>
           )}
         </div>
       </main>
     </>
   );
}

export default Home