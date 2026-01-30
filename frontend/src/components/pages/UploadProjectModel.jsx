import { useState } from 'react';
import { X } from 'lucide-react'; // optional (npm i lucide-react)
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';
const UploadProjectModal = ({onClose }) => {
  const navigate = useNavigate();
   
  const [form, setForm] = useState({
    title: '',
    technology: '',
    supervisor: '', // ✅ correct
  });
  const [file,setFile] = useState(null)

  const handleChange = (e) =>{
    setForm({
      ...form,[e.target.name] : e.target.value
    });
  };

  const handleFile = (e) =>{
    setFile(e.target.files[0]);
  };
 
  const handleSubmit = async  (e ) => {
        e.preventDefault();
    try {
       const data = new FormData();
      data.append("title", form.title);
      data.append("technology", form.technology);
      data.append("supervisor", form.supervisor);
      data.append("file", file);
      const response = await api.post('/upload',data,{
        headers:{
          "Content-Type":"multipart/form-data",
          withCredentials:true,
        }
      });
      console.log('Project Data =>',response.data);
      alert('Project uploaded successfully 🚀');
      navigate('/');

    } catch (error) {
      //console.error("upload Error =>",error);
      if(error.response){
        alert((error.response.data.message) || 'Upload failed ❌');
        navigate('/') 
        onClose()
      }else{
 alert('Internal server error  ❌');
      }
      
    }
     
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Card */}
      <div
        className="
        w-[520px] rounded-2xl
        bg-white/15 backdrop-blur-xl
        border border-white/30
        shadow-[0_25px_60px_rgba(0,0,0,0.6)]
        p-8 text-white relative
        animate-fadeIn
      "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-red-400 transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-200">Upload Your Project</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            placeholder="Project Title"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
          />

          <input
            type="text"
            name="technology"
            placeholder="Technologies (React, Node, Blockchain...)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
          />
          <input
            type="text"
            name="supervisor"
            placeholder="Supervisor name"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
          />

          {/* <textarea
            name="description"
            placeholder="Project Description"
            rows="4"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          /> */}

          <input
            type="file"
            onChange={handleFile}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:bg-indigo-500/80 file:text-white
            hover:file:bg-indigo-400 transition"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600
            font-semibold tracking-wide hover:opacity-90 hover:scale-[1.02] transition"
          >
            🚀 Submit Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProjectModal;
