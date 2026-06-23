import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Briefcase, FileText, Trash2, CheckCircle2, ShieldAlert, Users, FolderCheck } from 'lucide-react';

const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Navigation Tabs: 'stats' | 'users' | 'jobs'
  const [activeTab, setActiveTab] = useState('stats');

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [statsData, usersData, jobsData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/jobs') // Returns active jobs, let's fetch jobs directly
      ]);
      setStats(statsData);
      setUsers(usersData);
      setJobs(jobsData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting this user will remove their profile and all related records (jobs posted or applications submitted). Are you sure you want to proceed?')) return;
    
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      // Refresh stats
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
      alert(res.message || 'User deleted successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      setJobs(prev =>
        prev.map(j => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
      // Refresh stats
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      // Refresh stats
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-textMuted mt-0.5">Platform management control panel</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-md border border-border">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'stats' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
            }`}
          >
            Overview Stats
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
            }`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-1.5 text-xs font-semibold rounded ${
              activeTab === 'jobs' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
            }`}
          >
            Moderate Jobs ({jobs.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-danger-light border border-danger text-danger text-sm rounded px-4 py-3 mb-6">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card border border-border rounded-lg animate-pulse h-28"></div>
          ))}
        </div>
      ) : activeTab === 'stats' ? (
        
        // Tab 1: Overview Stats
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="text-accent mb-2">
                <Briefcase size={22} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-textMuted">Active Jobs</span>
              <span className="text-2xl font-bold text-textMain mt-1 block">
                {stats?.counts?.activeJobs || 0}
              </span>
            </div>
            
            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="text-primary mb-2">
                <FolderCheck size={22} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-textMuted">Total Jobs</span>
              <span className="text-2xl font-bold text-textMain mt-1 block">
                {stats?.counts?.totalJobs || 0}
              </span>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="text-success mb-2">
                <FileText size={22} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-textMuted">Applications</span>
              <span className="text-2xl font-bold text-textMain mt-1 block">
                {stats?.counts?.totalApplications || 0}
              </span>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="text-warning mb-2">
                <User size={22} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-textMuted">Candidates</span>
              <span className="text-2xl font-bold text-textMain mt-1 block">
                {stats?.counts?.totalCandidates || 0}
              </span>
            </div>

            <div className="bg-card p-5 rounded-lg border border-border shadow-sm">
              <div className="text-primary mb-2">
                <Users size={22} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-textMuted">Employers</span>
              <span className="text-2xl font-bold text-textMain mt-1 block">
                {stats?.counts?.totalEmployers || 0}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Application Breakdown */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-textMain mb-4">Application Statuses</h3>
              <div className="space-y-3">
                {stats?.statusStats?.map(stat => (
                  <div key={stat._id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                    <span className="capitalize font-semibold text-textMuted">{stat._id}</span>
                    <span className="font-bold text-textMain">{stat.count}</span>
                  </div>
                ))}
                {stats?.statusStats?.length === 0 && (
                  <p className="text-xs text-textMuted">No applications yet.</p>
                )}
              </div>
            </div>

            {/* Job Type Breakdown */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-textMain mb-4">Job Type Distribution</h3>
              <div className="space-y-3">
                {stats?.jobTypeStats?.map(stat => (
                  <div key={stat._id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                    <span className="font-semibold text-textMuted">{stat._id}</span>
                    <span className="font-bold text-textMain">{stat.count}</span>
                  </div>
                ))}
                {stats?.jobTypeStats?.length === 0 && (
                  <p className="text-xs text-textMuted">No job listings yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      ) : activeTab === 'users' ? (
        
        // Tab 2: Manage Users Table
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-textMain">{u.name}</td>
                  <td className="px-6 py-4 text-textMuted">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase rounded ${
                      u.role === 'admin' ? 'bg-danger-light text-danger border border-danger border-opacity-20' :
                      u.role === 'employer' ? 'bg-accent-light text-accent border border-accent border-opacity-20' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-textMuted text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-danger hover:text-red-700 p-1 rounded hover:bg-danger-light transition-all"
                        title="Delete User Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : (
        
        // Tab 3: Moderate Jobs
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-textMuted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {jobs.map(job => (
                <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-textMain">{job.title}</td>
                  <td className="px-6 py-4 text-textMuted">{job.company}</td>
                  <td className="px-6 py-4 text-textMuted">{job.location}</td>
                  <td className="px-6 py-4">
                    <select
                      value={job.status}
                      onChange={(e) => handleUpdateJobStatus(job._id, e.target.value)}
                      className="text-xs font-semibold border border-border rounded px-2 py-1 bg-white focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="filled">Filled</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-danger hover:text-red-700 p-1 rounded hover:bg-danger-light transition-all"
                      title="Delete Job listing"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default DashboardAdmin;
