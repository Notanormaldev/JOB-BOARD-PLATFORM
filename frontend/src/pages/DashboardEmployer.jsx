import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { User, Briefcase, FileText, Plus, Check, Clock, Trash, ExternalLink, ChevronDown, CheckSquare, ListFilter, Eye } from 'lucide-react';

const DashboardEmployer = () => {
  const { user } = useContext(AuthContext);

  // States
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Active view tab: 'applicants' or 'jobs' or 'post'
  const [activeTab, setActiveTab] = useState('applicants');

  // New Job Post Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState('');

  // Modals & Details
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch both jobs posted by this employer and applicants
      const [jobsData, appsData] = await Promise.all([
        api.get('/jobs'), // Fetching all jobs; backend returns active, but we need to list our own. Wait!
        // To make it specific for the employer, let's filter jobs on the frontend where employer._id matches req.user._id, or backend returns all.
        // Wait, the backend GET /api/jobs returns active jobs. What if the employer has filled/archived jobs?
        // Let's check how we wrote the backend: GET /api/jobs returns only status: 'active'.
        // Wait, can we fetch all applications? Yes, applications are filtered by backend:
        // For Employer: find applications where job.employer === user._id. And populate job details!
        // This is perfect. From appsData, we can extract the jobs, OR we can query jobs and filter by employer ID on the frontend.
        // Let's filter jobs by employer ID: jobs.filter(j => j.employer._id === user._id)
        api.get('/applications')
      ]);

      // Fetch all active jobs first
      const allJobs = await api.get('/jobs');
      // Filter jobs owned by this employer
      const myJobs = allJobs.filter(j => j.employer && (j.employer._id === user._id || j.employer === user._id));
      
      setJobs(myJobs);
      setApplications(appsData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostSuccessMsg('');
    
    try {
      const newJob = await api.post('/jobs', {
        title,
        location,
        type,
        experienceLevel,
        salary,
        description,
        requirements,
      });

      setPostSuccessMsg('Job listing posted successfully!');
      
      // Clear form
      setTitle('');
      setLocation('');
      setSalary('');
      setDescription('');
      setRequirements('');

      // Refresh list
      fetchData();
      
      // Switch tab
      setTimeout(() => {
        setActiveTab('jobs');
        setPostSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post job listing');
    } finally {
      setPostLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}`, { status: newStatus });
      
      // Update local state
      setApplications(prev =>
        prev.map(app => (app._id === appId ? { ...app, status: newStatus } : app))
      );
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      setJobs(prev =>
        prev.map(j => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing? All associated applications will remain but reference deleted jobs.')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'reviewed':
        return 'bg-warning-light text-warning border-warning border-opacity-35';
      case 'interviewing':
        return 'bg-accent-light text-accent border-accent border-opacity-35';
      case 'offered':
        return 'bg-success-light text-success border-success border-opacity-35';
      case 'rejected':
        return 'bg-danger-light text-danger border-danger border-opacity-35';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Company name */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Employer Dashboard</h1>
          <p className="text-xs text-textMuted mt-0.5">
            Managing recruitments for <span className="font-semibold text-accent">{user.employerProfile?.companyName || 'your company'}</span>
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-md border border-border">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'applicants' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
            }`}
          >
            Applicants ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'jobs' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
            }`}
          >
            My Job Posts ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-1.5 text-xs font-semibold rounded flex items-center ${
              activeTab === 'post' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
            }`}
          >
            <Plus size={14} className="mr-1" />
            Post a Job
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-danger-light border border-danger text-danger text-sm rounded px-4 py-3 mb-6">
          {errorMsg}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-textMuted">Active Jobs</span>
          <span className="text-2xl font-bold text-textMain mt-1 block">
            {jobs.filter(j => j.status === 'active').length}
          </span>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-textMuted">Total Job Listings</span>
          <span className="text-2xl font-bold text-textMain mt-1 block">{jobs.length}</span>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-textMuted">Total Applicants</span>
          <span className="text-2xl font-bold text-textMain mt-1 block">{applications.length}</span>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-textMuted">Pending Review</span>
          <span className="text-2xl font-bold text-textMain mt-1 block">
            {applications.filter(a => a.status === 'applied').length}
          </span>
        </div>
      </div>

      {/* Main Content Areas */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card border border-border rounded-lg animate-pulse h-28"></div>
          ))}
        </div>
      ) : activeTab === 'applicants' ? (
        
        // Tab 1: Applicants List
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-slate-50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-textMain">Candidate Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-12 text-center text-textMuted text-sm">
              No candidates have applied to your job listings yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {applications.map((app) => (
                <div key={app._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                  
                  {/* Candidate Profile Details */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-textMain">{app.candidate?.name}</span>
                      <span className="text-xs text-textMuted">({app.candidate?.email})</span>
                    </div>
                    <p className="text-xs text-accent font-semibold">
                      Applied for: <span className="font-bold">{app.job?.title || 'Listing Removed'}</span>
                    </p>
                    <p className="text-[10px] text-textMuted">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions & Dropdown Status */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 border border-border bg-white text-xs font-semibold rounded hover:bg-slate-50 flex items-center"
                    >
                      <Eye size={14} className="mr-1" />
                      Review Details
                    </button>

                    <a
                      href={`http://localhost:5000${app.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-border bg-white text-xs font-semibold rounded hover:bg-slate-50 flex items-center"
                    >
                      <FileText size={14} className="mr-1" />
                      Resume
                    </a>

                    <div className="relative">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                        className={`text-xs font-bold uppercase border rounded px-3 py-1.5 cursor-pointer focus:outline-none ${getStatusColor(app.status)}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      ) : activeTab === 'jobs' ? (
        
        // Tab 2: My Jobs Posted
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border bg-slate-50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-textMain">My Job Listings</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center text-textMuted text-sm">
              You haven't posted any job listings yet. Click "Post a Job" to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {jobs.map((job) => (
                <div key={job._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-sm text-textMain leading-tight">{job.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-textMuted">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Change Job Status */}
                    <select
                      value={job.status}
                      onChange={(e) => handleUpdateJobStatus(job._id, e.target.value)}
                      className={`text-xs font-bold uppercase border rounded px-2.5 py-1.5 focus:outline-none bg-white`}
                    >
                      <option value="active">Active</option>
                      <option value="filled">Filled</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 text-textMuted hover:text-danger rounded border border-border hover:bg-slate-50"
                      title="Delete Listing"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        // Tab 3: Post a Job Form
        <div className="bg-card p-6 border border-border rounded-lg shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-textMain mb-6">Create New Job Listing</h2>

          {postSuccessMsg && (
            <div className="bg-success-light border border-success text-success text-sm rounded px-4 py-3 mb-6">
              {postSuccessMsg}
            </div>
          )}

          <form onSubmit={handlePostJobSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Node JS Developer"
                  className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, or New York, NY"
                  className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Employment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="block w-full px-3 py-2 border border-border rounded bg-white text-sm focus:outline-none focus:border-primary text-textMain"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Experience Level Required</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="block w-full px-3 py-2 border border-border rounded bg-white text-sm focus:outline-none focus:border-primary text-textMain"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Lead">Lead / Management</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Salary Range</label>
                <input
                  type="text"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $80k - $100k / year"
                  className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">
                Key Requirements (Comma separated list)
              </label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="NodeJS, MongoDB, REST APIs, Git"
                className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Job Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the job responsibilities, project scope, and background..."
                rows="6"
                className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={postLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded font-medium text-sm transition-colors text-center disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            >
              {postLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Publish Job Listing'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card max-w-xl w-full border border-border rounded-lg overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-base text-textMain leading-tight">Review Application</h2>
                <p className="text-xs text-textMuted mt-0.5">
                  Applicant: <span className="font-semibold text-accent">{selectedApp.candidate?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-textMuted hover:text-textMain p-1 rounded-full hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Candidate Info Card */}
              <div className="p-4 bg-slate-50 border border-border rounded">
                <p className="text-xs font-bold uppercase text-textMuted">Candidate Title</p>
                <p className="text-sm font-semibold text-textMain mt-0.5">
                  {selectedApp.candidate?.candidateProfile?.title || 'Not specified'}
                </p>

                {selectedApp.candidate?.candidateProfile?.skills?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase text-textMuted mb-1.5">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.candidate.candidateProfile.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-0.5 bg-white border border-border text-xs text-textMuted rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-textMain mb-2">Cover Letter</h4>
                <p className="text-sm text-textMuted whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 border border-border rounded">
                  {selectedApp.coverLetter || 'No cover letter attached.'}
                </p>
              </div>

              {/* Resume download */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-textMain mb-2">Resume Attachment</h4>
                <div className="flex items-center justify-between p-3 border border-border rounded">
                  <div className="flex items-center space-x-2">
                    <FileText size={18} className="text-textMuted" />
                    <span className="text-xs font-semibold text-textMain">
                      {selectedApp.resumeUrl.split('/').pop()}
                    </span>
                  </div>
                  <a
                    href={`http://localhost:5000${selectedApp.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline font-semibold"
                  >
                    Open Resume PDF
                  </a>
                </div>
              </div>

              {/* Quick Status Setter */}
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="text-xs font-semibold text-textMuted">Current Status:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleUpdateAppStatus(selectedApp._id, e.target.value)}
                  className={`text-xs font-bold uppercase border rounded px-3 py-1.5 cursor-pointer focus:outline-none ${getStatusColor(selectedApp.status)}`}
                >
                  <option value="applied">Applied</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardEmployer;
