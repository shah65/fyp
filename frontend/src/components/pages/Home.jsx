import React from 'react'
import { useNavigate } from 'react-router-dom';
import awkumImage from '../../public/awkumimg1.png';
import tchrlogo from '../../public/tchlogo.png';
import stdlgo from '../../public/stdlogo.png';
import Header from '../../components/pages/Header';
import Singup from './Singup';
const Home = () => {
  const navigate = useNavigate();
   return (
     <>
       
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
           <Header />
         </div>
        

       <main className="relative mt-0.5  w-screen h-screen overflow-hidden">
         {/* Background Image */}
         <div
           className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-fixed"
           style={{ backgroundImage: `url(${awkumImage})` }}
         ></div>

         {/* Color overlay / shadow effect */}
         <div className="absolute inset-0 bg-linear-to-br from-black/60 via-black/30 to-indigo-900/40"></div>

         {/* Content layer */}
         <div className="relative z-10 h-full flex items-center justify-center text-white">
         <div className="grid grid-cols-2 gap-10">
             {/* STUDENT CARD */}
             <div
               onClick={() => navigate('/login')}
               className="group w-80 h-48 rounded-2xl
    bg-white/20  
    border border-white/40
    shadow-[0_20px_40px_rgba(0,0,0,0.35)]
    flex flex-col items-center justify-center gap-3
    transition-all duration-300
    hover:bg-white/10
    hover:-translate-y-2 hover:scale-105
    hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)]
    cursor-pointer"
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
         </div>
       </main>
     </>
   );
}

export default Home