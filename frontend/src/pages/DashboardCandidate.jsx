import React, { useState, useEffect, useContext } from 'react';
import api, { API_URL } from '../utils/api';
import AuthContext from '../context/AuthContext';
import { User, Briefcase, FileText, CheckCircle, Clock, Send, Upload, Edit, Save, Tag } from 'lucide-react';

const DashboardCandidate = () => {
  const { user, updateProfile, setUser } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [appsError, setAppsError] = useState('');

  // Editing profile state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Detail Modal
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const data = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      setAppsError(err.message || 'Failed to fetch applications');
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    if (user) {
      setName(user.name || '');
      setTitle(user.candidateProfile?.title || '');
      setSkills(user.candidateProfile?.skills?.join(', ') || '');
      setBio(user.candidateProfile?.bio || '');
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile({
        name,
        title,
        skills,
        bio,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.message || 'Failed to update profile' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setResumeUploading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      // Let's create the profile resume upload request.
      // Wait, we can reuse the application/upload logic. We can post it to a new backend route or we can upload via applications.
      // Since we want this to be extremely solid, we can implement an endpoint /api/applications/upload-resume (we will add it to applications route in the backend).
      // Or we can just build a custom backend route /api/auth/resume that saves user profile resume.
      // Let's call /api/auth/resume which we will write in server.js/auth.js.
      const response = await fetch('http://localhost:5000/api/auth/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Resume upload failed');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setResumeFile(null);
      setProfileMsg({ type: 'success', text: 'Profile resume uploaded successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.message || 'Resume upload failed' });
    } finally {
      setResumeUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'reviewed':
        return 'bg-warning-light text-warning border-warning border-opacity-30';
      case 'interviewing':
        return 'bg-accent-light text-accent border-accent border-opacity-30';
      case 'offered':
        return 'bg-success-light text-success border-success border-opacity-30';
      case 'rejected':
        return 'bg-danger-light text-danger border-danger border-opacity-30';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-textMain tracking-tight mb-8">Candidate Dashboard</h1>

      {profileMsg.text && (
        <div className={`border p-4 rounded text-sm mb-6 ${
          profileMsg.type === 'success' ? 'bg-success-light border-success text-success' : 'bg-danger-light border-danger text-danger'
        }`}>
          {profileMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 border border-border rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-textMain">My Profile</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center"
                >
                  <Edit size={14} className="mr-1" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, JavaScript, CSS"
                    className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase mb-1.5">Professional Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="3"
                    className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain resize-none"
                  ></textarea>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 rounded text-xs font-semibold flex items-center justify-center"
                  >
                    <Save size={14} className="mr-1.5" />
                    Save Updates
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-textMain py-2 rounded text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-lg font-bold text-textMain leading-tight">{user.name}</p>
                  <p className="text-sm text-accent font-medium mt-0.5">{user.candidateProfile?.title || 'No title set'}</p>
                </div>

                {user.candidateProfile?.bio && (
                  <div>
                    <h3 className="text-xxs uppercase tracking-widest font-bold text-textMuted mb-1">Professional Bio</h3>
                    <p className="text-sm text-textMuted leading-relaxed">{user.candidateProfile.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xxs uppercase tracking-widest font-bold text-textMuted mb-2">My Skills</h3>
                  {user.candidateProfile?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {user.candidateProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-textMuted rounded text-xs flex items-center"
                        >
                          <Tag size={10} className="mr-1 opacity-70" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-textMuted">No skills specified yet.</p>
                  )}
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="text-xxs uppercase tracking-widest font-bold text-textMuted mb-3">Saved Resume</h3>
                  {user.candidateProfile?.resumeUrl ? (
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-border rounded">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <FileText size={18} className="text-textMuted flex-shrink-0" />
                        <span className="text-xs font-semibold text-textMain truncate">
                          {user.candidateProfile.resumeUrl.split('/').pop()}
                        </span>
                      </div>
                      <a
                        href={`http://localhost:5000${user.candidateProfile.resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline font-semibold flex-shrink-0"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-textMuted mb-3">No default resume uploaded yet.</p>
                  )}

                  <form onSubmit={handleResumeUpload} className="mt-4 space-y-2">
                    <label className="block text-[10px] font-bold text-textMuted uppercase">Upload Profile Resume</label>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="block w-full text-xs text-textMuted file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-border file:text-xs file:font-semibold file:bg-slate-100 file:text-textMain file:cursor-pointer hover:file:bg-slate-200"
                      />
                      <button
                        type="submit"
                        disabled={resumeUploading}
                        className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1 rounded flex items-center justify-center disabled:bg-slate-400"
                      >
                        {resumeUploading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Upload size={14} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 border border-border rounded-lg shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-textMain mb-6">Submitted Applications</h2>

            {loadingApps ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-slate-50 border border-border rounded-lg animate-pulse h-20"></div>
                ))}
              </div>
            ) : appsError ? (
              <div className="bg-danger-light text-danger border border-danger p-4 rounded text-sm">
                {appsError}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-textMuted text-sm">You haven't submitted any job applications yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => setSelectedApp(app)}
                    className="p-4 border border-border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <div className="overflow-hidden pr-4">
                      <h3 className="font-bold text-sm text-textMain truncate leading-tight">
                        {app.job?.title || 'Job Listing Deleted'}
                      </h3>
                      <p className="text-xs font-semibold text-accent mt-0.5">
                        {app.job?.company || 'N/A'}
                      </p>
                      <p className="text-[10px] text-textMuted mt-1">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wide border rounded capitalize ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-card max-w-xl w-full border border-border rounded-lg overflow-hidden shadow-2xl relative">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-bold text-base text-textMain leading-tight">Application Details</h2>
                <p className="text-xs text-textMuted mt-1">
                  Submitted for <span className="font-semibold text-accent">{selectedApp.job?.title || 'Unknown Job'}</span>
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
              <div className="flex items-center justify-between border border-border p-3 rounded">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-textMuted">Application Status</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold uppercase border rounded capitalize ${getStatusColor(selectedApp.status)}`}>
                    {selectedApp.status}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-textMuted text-right">Applied Date</span>
                  <span className="text-xs font-semibold text-textMain">
                    {new Date(selectedApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-textMain mb-2">My Cover Letter</h4>
                <p className="text-sm text-textMuted whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 border border-border rounded">
                  {selectedApp.coverLetter || 'No cover letter was attached.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-textMain mb-2">Submitted Resume</h4>
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
                    Download Resume
                  </a>
                </div>
              </div>
              
              {selectedApp.status !== 'applied' && (
                <div className="p-3.5 bg-accent-light bg-opacity-20 border border-accent border-opacity-30 rounded text-xs text-textMain leading-relaxed flex items-start space-x-2">
                  <Clock size={16} className="text-accent flex-shrink-0 mt-0.5" />
                  <span>
                    Your status has been updated to <strong>{selectedApp.status}</strong>. Please check your notifications or look out for an email from the employer regarding the next steps.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCandidate;
