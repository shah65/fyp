import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, Upload, FileText, AlertCircle, Eye, Copy, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Api';
import { toast } from 'react-toastify';

const UploadProjectModal = ({ onClose, onSuccess, project, userStage, approvalCode }) => {
  const navigate = useNavigate();

  // Determine initial step based on userStage from parent
  const getInitialStep = () => {
    if (userStage === 'no-project') return 'form';
    if (userStage === 'waiting') return 'waiting';
    if (userStage === 'approved') return 'upload';
    if (userStage === 'uploaded') return 'success';
    if (userStage === 'rejected') return 'rejected';
    return 'form';
  };

  const [step, setStep] = useState(getInitialStep());
  const [form, setForm] = useState({
    title: project?.title || '',
    technology: project?.technology || '',
    supervisorId: project?.supervisor?._id || project?.supervisorId || '',
    description: project?.description || '',
    approvalCode: approvalCode || '', // Auto-fill from parent
  });

  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [proposalPdf, setProposalPdf] = useState(project?.proposalDocumentUrl || null);

  // Update form when approvalCode prop changes
  useEffect(() => {
    if (approvalCode) {
      setForm(prev => ({
        ...prev,
        approvalCode: approvalCode
      }));
    }
  }, [approvalCode]);

  // Update form when project prop changes
  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        technology: project.technology || '',
        supervisorId: project.supervisor?._id || project.supervisorId || '',
        description: project.description || '',
        approvalCode: approvalCode || project.approvalCode || '',
      });

      if (project.proposalDocumentUrl) {
        setProposalPdf(project.proposalDocumentUrl);
      }
    }
  }, [project, approvalCode]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Please select a valid PDF file');
        toast.error('Invalid file type. Please select a PDF.');
        e.target.value = null;
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('File size exceeds 10MB limit');
        toast.error('File too large. Maximum size is 10MB.');
        e.target.value = null;
        return;
      }

      setPdf(file);
      setErrorMessage('');
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleRequestApproval = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) {
      setErrorMessage('Project title is required');
      return;
    }
    if (!form.technology.trim()) {
      setErrorMessage('Technologies are required');
      return;
    }
    if (!form.supervisorId) {
      setErrorMessage('Please enter supervisor ID');
      return;
    }
    if (!form.description.trim()) {
      setErrorMessage('Description is required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/request-approval', form, {
        withCredentials: true,
      });

      if (response.data.success) {
        setStep('waiting');
        setSuccessMessage('Your proposal has been submitted for approval. You will be notified once your supervisor responds.');
        toast.success('Proposal submitted successfully!');

        if (onSuccess) {
          onSuccess(response.data.project);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Request failed. Please try again.';
      setErrorMessage(errorMsg);
     } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();

    if (!form.approvalCode.trim()) {
      setErrorMessage('Please enter the approval code provided by your supervisor');
      return;
    }

    if (!pdf) {
      setErrorMessage('Please select a PDF file to upload');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append("approvalCode", form.approvalCode.trim());
      data.append("pdf", pdf);

      const response = await api.post('/upload-document', data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setStep('success');
        setSuccessMessage('🎉 Your project has been uploaded successfully!');
        toast.success('Project uploaded successfully & Group created automatically.');

        if (onSuccess) {
          onSuccess(response.data.project);
        }

        setTimeout(() => {
          if (typeof onClose === 'function') {
            onClose();
          }
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Upload failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleResubmit = () => {
    setStep('form');
    setErrorMessage('');
    setSuccessMessage('');
    setPdf(null);
  };

  const handleViewDocument = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Approval code copied to clipboard!');
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Progress steps mapping
  const getCurrentStepIndex = () => {
    const stepMap = { form: 0, waiting: 1, upload: 2, success: 3, rejected: 1 };
    return stepMap[step] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white relative animate-fadeIn max-h-[90vh] flex flex-col">

        {/* Fixed Header */}
        <div className="p-6 pb-2 border-b border-white/10 flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 hover:text-red-400 transition z-10 hover:scale-110"
            disabled={loading}
            title="Close"
          >
            <X size={20} />
          </button>

          {/* Header with status icon */}
          <div className="flex items-center mb-4">
            {step === 'form' && <FileText className="w-8 h-8 text-indigo-300 mr-2" />}
            {step === 'waiting' && <Clock className="w-8 h-8 text-yellow-300 mr-2 animate-pulse" />}
            {step === 'upload' && <Upload className="w-8 h-8 text-green-300 mr-2" />}
            {step === 'success' && <CheckCircle className="w-8 h-8 text-green-400 mr-2" />}
            {step === 'rejected' && <XCircle className="w-8 h-8 text-red-400 mr-2" />}
            <h2 className="text-2xl font-bold text-indigo-200">
              {step === 'form' && 'Submit Project Proposal'}
              {step === 'waiting' && 'Waiting for Review'}
              {step === 'upload' && 'Upload Project Document'}
              {step === 'success' && 'Upload Successful!'}
              {step === 'rejected' && 'Proposal Rejected'}
            </h2>
          </div>

          {/* Progress Steps - Only show for relevant steps */}
          {step !== 'rejected' && (
            <div className="flex items-center justify-between mt-4 px-2">
              {['Request', 'Review', 'Upload', 'Complete'].map((label, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${isActive ? 'bg-indigo-500' : 'bg-white/10'}
                        ${isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent' : ''}
                      `}>
                        {isActive ? (
                          index < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : <span>{index + 1}</span>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs mt-1 text-white/60">{label}</span>
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-1 ${index < currentStepIndex ? 'bg-indigo-500' : 'bg-white/20'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          {/* Success Message */}
          {successMessage && step !== 'success' && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-green-200 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start">
              <XCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* FORM STEP - For new project request */}
          {step === 'form' && (
            <form onSubmit={handleRequestApproval} className="space-y-5">
              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Blockchain-based Voting System"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
                  focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                  placeholder-white/40 text-white transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Technologies <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="technology"
                  placeholder="e.g., React, Node.js, MongoDB"
                  value={form.technology}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
                  focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                  placeholder-white/40 text-white transition-all"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-white/40 mt-1">Separate multiple technologies with commas</p>
              </div>

              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your project idea in detail..."
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
                  focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                  placeholder-white/40 resize-none text-white transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Supervisor ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="supervisorId"
                  placeholder="e.g., T2024001 or teacher@example.com"
                  value={form.supervisorId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 
                  focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                  placeholder-white/40 text-white transition-all"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-white/40 mt-1">
                  Enter your supervisor's teacher ID or email address
                </p>
              </div>

              {/* Proposal PDF Upload - Optional */}
              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Proposal Document (PDF) <span className="text-white/40 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFile}
                    accept=".pdf"
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:bg-indigo-500/80 file:text-white
                    hover:file:bg-indigo-400 transition-all
                    file:cursor-pointer text-white/60
                    file:font-medium"
                    disabled={loading}
                  />
                </div>
                {pdf && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center truncate">
                      <FileText className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm text-green-200 truncate">{pdf.name}</span>
                      <span className="text-xs text-white/40 ml-2">
                        ({(pdf.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdf(null)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-white/40 mt-1">Max file size: 10MB</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600
                font-semibold tracking-wide hover:opacity-90 hover:scale-[1.02] transition-all
                flex items-center justify-center space-x-2
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>🚀 Submit for Approval</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* WAITING STEP - Show when waiting for approval */}
          {step === 'waiting' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-indigo-400"></div>
                  <Clock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-300" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-indigo-200 text-xl">Waiting for Supervisor Review</p>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  Your proposal has been submitted and is pending review. You'll be notified once your supervisor responds.
                </p>
              </div>

              {project && (
                <div className="bg-white/10 rounded-xl p-5 text-left space-y-4">
                  <h3 className="font-semibold text-indigo-200 mb-3">Submitted Proposal Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-white/40">Title</p>
                      <p className="text-sm text-white">{project.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Technologies</p>
                      <p className="text-sm text-white">{project.technology}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-white/40">Description</p>
                      <p className="text-sm text-white">{project.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Supervisor ID</p>
                      <p className="text-sm text-white">{form.supervisorId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Submitted on</p>
                      <p className="text-sm text-white">{formatDate(project.createdAt)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleResubmit}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm transition-all"
                >
                  Edit and Resubmit
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white/60 hover:text-white text-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD STEP - For approved projects with approval code field */}
          {step === 'upload' && (
            <form onSubmit={handleUploadDocument} className="space-y-5">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-200 text-sm flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  Your proposal has been approved! Please upload your final project document.
                </p>
              </div>

              {project && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/40 mb-1">Project Title</p>
                  <p className="text-white font-medium">{project.title}</p>
                </div>
              )}

              {/* Approval Code Field - Auto-filled from props */}
              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Approval Code <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="approvalCode"
                    placeholder="Enter the 8-character code from your supervisor"
                    value={form.approvalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-20 rounded-xl bg-black/30 border border-white/20 
                    focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                    placeholder-white/40 text-white uppercase"
                    required
                    disabled={loading}
                    maxLength="16"
                  />
                  {form.approvalCode && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(form.approvalCode)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 
                        p-2 text-white/60 hover:text-white transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-1">Enter the approval code exactly as provided</p>
              </div>

              {/* PDF Upload Field */}
              <div>
                <label className="block text-sm text-indigo-200 mb-2 font-medium">
                  Project Document (PDF) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFile}
                    accept=".pdf"
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:bg-indigo-500/80 file:text-white
                    hover:file:bg-indigo-400 transition-all
                    file:cursor-pointer text-white/60
                    file:font-medium"
                    required
                    disabled={loading}
                  />
                </div>
                {pdf && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center truncate">
                      <FileText className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm text-green-200 truncate">{pdf.name}</span>
                      <span className="text-xs text-white/40 ml-2">
                        ({(pdf.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdf(null)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-white/40 mt-1">Max file size: 10MB</p>
              </div>

              {proposalPdf && (
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-white/40 mb-1">Your Original Proposal</p>
                  <button
                    type="button"
                    onClick={() => handleViewDocument(proposalPdf)}
                    className="flex items-center text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Submitted Proposal
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pdf}
                className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600
                font-semibold tracking-wide hover:opacity-90 hover:scale-[1.02] transition-all
                flex items-center justify-center space-x-2
                ${(loading || !pdf) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>📤 Upload Document</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REJECTED STEP */}
          {step === 'rejected' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-500/20 rounded-full p-4">
                  <XCircle className="w-16 h-16 text-red-400" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-red-200 text-xl">Proposal Rejected</p>
                {project?.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-red-200 text-sm">{project.rejectionReason}</p>
                  </div>
                )}
                <p className="text-white/60 text-sm">
                  Your proposal was not approved. Please review the feedback and submit a revised proposal.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleResubmit}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600
                    text-white text-sm font-medium hover:opacity-90 transition-all"
                >
                  Submit Revised Proposal
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white/60 hover:text-white text-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-500/20 rounded-full p-4">
                  <CheckCircle className="w-20 h-20 text-green-400" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-green-200 text-2xl font-bold">Upload Successful!</p>
                <p className="text-white/70">
                  Your project has been verified and uploaded successfully.
                  {project && <span className="block mt-2 text-sm">Group has been created automatically.</span>}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {project?.document && (
                  <button
                    onClick={() => handleViewDocument(project.document)}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 
                      border border-white/20 text-white text-sm transition-all flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Uploaded Document
                  </button>
                )}

                {proposalPdf && (
                  <button
                    onClick={() => handleViewDocument(proposalPdf)}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 
                      border border-white/20 text-white text-sm transition-all flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Original Proposal
                  </button>
                )}
              </div>

              <p className="text-white/40 text-sm animate-pulse">
                This window will close automatically in a few seconds...
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default UploadProjectModal;