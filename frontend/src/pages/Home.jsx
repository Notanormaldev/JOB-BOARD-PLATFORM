import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_URL } from '../utils/api';
import AuthContext from '../context/AuthContext';
import { Search, MapPin, Briefcase, DollarSign, Clock, X, FileText, Upload, AlertCircle, ArrowRight, Layers } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for jobs and loading
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedExp, setSelectedExp] = useState('');

  // Modal & Selection States
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  // Application Form States
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);

  // Fetch Jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (selectedType) params.append('type', selectedType);
      if (selectedExp) params.append('experienceLevel', selectedExp);

      const data = await api.get(`/jobs?${params.toString()}`);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedType, selectedExp]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setSelectedType('');
    setSelectedExp('');
    // We have to wait for state to clear or fetch manually with empty params
    setTimeout(() => {
      fetchJobs();
    }, 50);
  };

  const handleOpenJob = (job) => {
    setSelectedJob(job);
    setAppliedSuccessfully(false);
    setApplyError('');
    setCoverLetter('');
    setResumeFile(null);
    setUseProfileResume(false);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      setApplyError('Only candidates can apply to job listings.');
      return;
    }

    setApplying(true);
    setApplyError('');

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob._id);
      formData.append('coverLetter', coverLetter);
      
      if (useProfileResume) {
        formData.append('useProfileResume', 'true');
      } else if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        throw new Error('Please upload a resume file or choose to use your profile resume.');
      }

      await api.post('/applications', formData, true);
      setAppliedSuccessfully(true);
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="bg-primary text-white p-8 sm:p-12 rounded-lg mb-8 border border-primary relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-light opacity-80">
            Welcome to HireHub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 leading-tight">
            Discover Your Next Career Move
          </h1>
          <p className="text-sm text-slate-300 mt-3 max-w-lg">
            Explore thousands of jobs posted by industry leaders. Filter by location, job type, and experience level.
          </p>
        </div>
      </div>

      {/* Main Search Panel */}
      <form onSubmit={handleSearchSubmit} className="bg-card p-4 rounded-lg border border-border flex flex-col md:flex-row gap-3 mb-8 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, keywords, or company name..."
            className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
          />
        </div>
        
        <div className="w-full md:w-64 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
            <MapPin size={18} />
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state, or Remote"
            className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
          />
        </div>

        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded text-sm font-medium transition-colors"
        >
          Search Jobs
        </button>
      </form>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-textMain">Filter Options</h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-danger font-medium hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Job Type Filter */}
            <div className="mb-6 pt-4 border-t border-border">
              <label className="block text-xs font-semibold uppercase text-textMuted tracking-wider mb-3">
                Job Type
              </label>
              <div className="space-y-2">
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 text-sm text-textMain cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="rounded text-primary focus:ring-primary h-4 w-4 border-border"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="pt-4 border-t border-border">
              <label className="block text-xs font-semibold uppercase text-textMuted tracking-wider mb-3">
                Experience Level
              </label>
              <div className="space-y-2">
                {['Entry', 'Mid', 'Senior', 'Lead'].map((exp) => (
                  <label key={exp} className="flex items-center space-x-2 text-sm text-textMain cursor-pointer">
                    <input
                      type="radio"
                      name="expLevel"
                      checked={selectedExp === exp}
                      onChange={() => setSelectedExp(exp)}
                      className="rounded text-primary focus:ring-primary h-4 w-4 border-border"
                    />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-card p-6 border border-border rounded-lg animate-pulse h-36"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-danger-light text-danger border border-danger p-4 rounded text-sm">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-card p-12 border border-border rounded-lg text-center">
              <p className="text-textMuted text-sm">No jobs match your search criteria. Try a different keyword or location.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 bg-primary-light text-primary px-4 py-2 rounded text-xs font-semibold hover:bg-slate-200"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => handleOpenJob(job)}
                  className="bg-card p-6 border border-border rounded-lg interactive-card cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-textMain leading-snug">{job.title}</h3>
                        <p className="text-sm font-semibold text-accent mt-0.5">{job.company}</p>
                      </div>
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-primary-light text-primary rounded">
                        {job.type}
                      </span>
                    </div>

                    <p className="text-sm text-textMuted mt-3 line-clamp-2">{job.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 pt-4 border-t border-border text-xs text-textMuted">
                    <span className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Layers size={14} />
                      <span>{job.experienceLevel} Level</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign size={14} />
                      <span>{job.salary}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details & Apply Drawer/Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card max-w-2xl w-full border border-border rounded-lg overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-lg text-textMain leading-tight">{selectedJob.title}</h2>
                <p className="text-xs text-textMuted mt-1">
                  Posted by <span className="font-semibold text-accent">{selectedJob.company}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-textMuted hover:text-textMain p-1 rounded-full hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Job Tags */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-border rounded text-center">
                  <span className="block text-[10px] uppercase font-bold text-textMuted">Location</span>
                  <span className="text-xs font-semibold text-textMain">{selectedJob.location}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded text-center">
                  <span className="block text-[10px] uppercase font-bold text-textMuted">Type</span>
                  <span className="text-xs font-semibold text-textMain">{selectedJob.type}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded text-center">
                  <span className="block text-[10px] uppercase font-bold text-textMuted">Salary Range</span>
                  <span className="text-xs font-semibold text-textMain">{selectedJob.salary}</span>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-textMain mb-2">Job Description</h3>
                <p className="text-sm text-textMuted whitespace-pre-wrap leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Job Requirements */}
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-textMain mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-sm text-textMuted space-y-1">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Employer Details (Website/Bio) */}
              {selectedJob.employer && selectedJob.employer.employerProfile && (
                <div className="bg-slate-50 p-4 border border-border rounded">
                  <h4 className="text-xs font-bold uppercase text-textMain mb-1">About {selectedJob.company}</h4>
                  <p className="text-xs text-textMuted leading-relaxed mb-2">
                    {selectedJob.employer.employerProfile.companyBio || 'No company biography provided.'}
                  </p>
                  {selectedJob.employer.employerProfile.companyWebsite && (
                    <a
                      href={selectedJob.employer.employerProfile.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline font-semibold"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              )}

              {/* Apply Form Section */}
              <div className="border-t border-border pt-6">
                {!showApplyModal ? (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        setShowApplyModal(true);
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded font-medium text-sm transition-colors text-center"
                  >
                    {!user ? 'Log in to Apply for this Job' : 'Apply Now'}
                  </button>
                ) : appliedSuccessfully ? (
                  <div className="bg-success-light border border-success text-success p-4 rounded text-sm text-center">
                    <p className="font-semibold">Application Submitted Successfully!</p>
                    <p className="text-xs mt-1 text-success opacity-90">
                      The employer has been notified and will review your profile shortly.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedJob(null);
                        setShowApplyModal(false);
                      }}
                      className="mt-3 bg-white border border-success text-success text-xs font-semibold px-4 py-1.5 rounded hover:bg-success-light transition-colors"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-textMain">Submit Your Application</h4>
                      <button
                        type="button"
                        onClick={() => setShowApplyModal(false)}
                        className="text-xs text-textMuted hover:text-textMain font-medium"
                      >
                        Cancel
                      </button>
                    </div>

                    {applyError && (
                      <div className="bg-danger-light border border-danger text-danger text-xs rounded px-4 py-2.5">
                        {applyError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">
                        Cover Letter
                      </label>
                      <textarea
                        required
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Explain why you are a great fit for this position..."
                        rows="4"
                        className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain resize-none"
                      ></textarea>
                    </div>

                    {/* Resume Source Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">
                        Resume Attachment
                      </label>

                      {user.candidateProfile?.resumeUrl && (
                        <label className="flex items-center space-x-2 text-xs font-semibold text-textMain mb-3 bg-slate-50 border border-border p-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useProfileResume}
                            onChange={(e) => {
                              setUseProfileResume(e.target.checked);
                              if (e.target.checked) setResumeFile(null);
                            }}
                            className="rounded text-primary focus:ring-primary h-4 w-4 border-border"
                          />
                          <span>Use the resume saved on my profile</span>
                        </label>
                      )}

                      {!useProfileResume && (
                        <div className="relative border border-dashed border-border p-4 rounded text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            required={!useProfileResume}
                            onChange={(e) => setResumeFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <Upload className="text-textMuted" size={24} />
                            <p className="text-xs font-semibold text-textMain">
                              {resumeFile ? resumeFile.name : 'Upload custom resume PDF / Word'}
                            </p>
                            <p className="text-[10px] text-textMuted">Max size 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={applying}
                      className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded font-medium text-sm transition-colors text-center disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {applying ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
