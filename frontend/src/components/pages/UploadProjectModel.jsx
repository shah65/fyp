import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';

const UploadProjectModal = ({ onClose }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    technology: '',
    supervisorId: '',
    description: '',
  });
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFile = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!form.title || !form.technology || !form.supervisorId || !form.description) {
      alert('Please fill all fields');
      return;
    }

    if (!pdf) {
      alert('Please select a PDF file');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("technology", form.technology);
      data.append("supervisorId", form.supervisorId);
      data.append("description", form.description);
      data.append("pdf", pdf); // Make sure this matches your backend field name

      const response = await api.post('/upload', data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      console.log('Project Data =>', response.data);
      alert('Project uploaded successfully 🚀');

      // Check if onClose is a function before calling
      if (typeof onClose === 'function') {
        onClose();
      }

      navigate('/');

    } catch (error) {
      console.error("Upload Error =>", error);

      let errorMessage = 'Upload failed ❌';

      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server';
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }

      alert(errorMessage);
      navigate('/');

      // Only close modal if onClose is a function
      if (typeof onClose === 'function') {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="
        w-130 rounded-2xl
        bg-white/15 backdrop-blur-xl
        border border-white/30
        shadow-[0_25px_60px_rgba(0,0,0,0.6)]
        p-8 text-white relative
        animate-fadeIn
      "
      >
        <button
          onClick={() => {
            if (typeof onClose === 'function') {
              onClose();
            }
          }}
          className="absolute top-4 right-4 text-white/70 hover:text-red-400 transition"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-200">Upload Your Project</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            placeholder="Project Title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
            disabled={loading}
          />

          <input
            type="text"
            name="technology"
            placeholder="Technologies (React, Node, Blockchain...)"
            value={form.technology}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
            disabled={loading}
          />
          <input
            type="text"
            name="description"
            placeholder="Description..."
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
            disabled={loading}
          />

          <input
            type="text"
            name="supervisorId"
            placeholder="Supervisor ID"
            value={form.supervisorId}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
            focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            required
            disabled={loading}
          />

          <input
            type="file"
            onChange={handleFile}
            accept=".pdf" // Only accept PDF files
            className="w-full text-sm file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:bg-indigo-500/80 file:text-white
            hover:file:bg-indigo-400 transition"
            required
            disabled={loading}
          />

          {pdf && (
            <p className="text-sm text-green-300">
              Selected: {pdf.name}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600
            font-semibold tracking-wide hover:opacity-90 hover:scale-[1.02] transition
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Uploading...' : '🚀 Submit Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProjectModal;