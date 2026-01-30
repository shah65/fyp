import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import awkumImage from '../../public/awkumimg1.png';

const Projects = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        const res = await api.get(`/student/project/${id}`, {
          withCredentials: true,
        });
        console.log(res.data);
        
        setProject(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProject();
  }, [id]);

  const changeR = () =>{
    navigate('/')
  }

  // ✨ shine effect
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-white animate-pulse">
        Loading your project...
      </div>
    );

  if (!project)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-400">
        No project found 🚫
      </div>
    );

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 🌄 Background */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-fixed scale-105 pointer-events-none"
        style={{ backgroundImage: `url(${awkumImage})` }}
      ></div>

      {/* 🌑 Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-black/20 via-black/20 to-indigo-800/20 backdrop-blur-[1px] pointer-events-none"></div>

      {/* 🌟 Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="shine-card max-w-3xl w-full rounded-2xl p-6 md:p-8 text-white
          bg-white/7 backdrop-blur-2xl border border-white/25
          shadow-[0_20px_60px_rgba(0,0,0,0.6)]
          transition-all duration-500 hover:scale-[1.02] animate-fadeIn"
        >
          {/* PROJECT NAME */}
          <div className="mb-3 p-3 rounded-xl bg-white/5 border border-emerald-300/30">
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 mb-1">
              Project Name
            </p>

            <h1
              className="text-2xl md:text-3xl font-extrabold
              bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 
              bg-clip-text text-transparent"
            >
              {project.title}
            </h1>
          </div>

          {/* TECHNOLOGY */}
          <div className="mb-3 p-3 rounded-xl bg-white/5 border border-sky-300/30">
            <p className="text-[10px] uppercase tracking-wider text-sky-300 mb-1">Technology</p>

            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
              bg-indigo-500/20 border border-indigo-300/40 text-indigo-200"
            >
              🚀 {project.technology} 
            </span>
          </div>

          {/* supervisor */}
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-purple-300/30">
            <p className="text-[10px] uppercase tracking-wider text-purple-400 mb-1">
              Supervisor Name
            </p>

            <p className="text-gray-100 leading-relaxed text-sm">{project.supervisor}</p>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3">
            {project.document && (
              <a
                href={project.document}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 
                text-black text-sm font-semibold transition-all hover:scale-105"
              >
                📄 Open Document
              </a>
            )}

            <button
              onClick={changeR}
              className="px-5 hover:cursor-pointer py-2 rounded-lg bg-white/10 hover:bg-white/20 
              border border-white/20 text-white text-sm transition-all hover:scale-105"
            >
              ⬅ Go Back
            </button>
          </div>
        </div>
      </div>

      {/* ✨ Effects CSS */}
      <style>{`
  .animate-fadeIn {
    animation: fadeIn 0.8s ease forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .shine-card {
    position: relative;
    overflow: hidden;
  }

  .shine-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      500px circle at var(--x) var(--y),
      rgba(255,255,255,0.15),
      transparent 40%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none; /* 🔥 FIX */
  }

  .shine-card:hover::before {
    opacity: 1;
  }
`}</style>
    </div>
  );
};

export default Projects;
