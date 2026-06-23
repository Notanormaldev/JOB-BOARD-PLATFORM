import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Lock, Building, Globe, Briefcase, FileText } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate'); // candidate, employer
  
  // Employer Profile Fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyBio, setCompanyBio] = useState('');

  // Candidate Profile Fields
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all general fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const userData = {
      name,
      email,
      password,
      role,
    };

    if (role === 'employer') {
      userData.companyName = companyName;
      userData.companyWebsite = companyWebsite;
      userData.companyBio = companyBio;
    } else {
      userData.title = title;
      userData.skills = skills;
      userData.bio = bio;
    }

    try {
      const profile = await register(userData);
      if (profile.role === 'employer') navigate('/employer');
      else navigate('/candidate');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-lg w-full bg-card p-8 rounded-lg border border-border shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-textMain">Create Your Account</h2>
          <p className="text-sm text-textMuted mt-1">Get started with HireHub today</p>
        </div>

        {errorMsg && (
          <div className="bg-danger-light border border-danger text-danger text-sm rounded px-4 py-3 mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection tab buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-100 p-1.5 rounded">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-2 text-xs font-semibold rounded transition-all ${
                role === 'candidate'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`py-2 text-xs font-semibold rounded transition-all ${
                role === 'employer'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-textMuted hover:text-textMain'
              }`}
            >
              Employer
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
              />
            </div>
          </div>

          {/* Conditional Fields based on Role Selection */}
          {role === 'employer' ? (
            <div className="space-y-4 pt-2 border-t border-border mt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-textMuted">Company Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                      <Building size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                      <Globe size={18} />
                    </span>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://acme.com"
                      className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                  Company Bio / Description
                </label>
                <textarea
                  value={companyBio}
                  onChange={(e) => setCompanyBio(e.target.value)}
                  placeholder="Describe your company culture, mission, and industry..."
                  rows="3"
                  className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain resize-none"
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-border mt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-textMuted">Candidate Profile</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                    Professional Title
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                      <Briefcase size={18} />
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Software Engineer"
                      className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                    Skills (Comma separated)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-textMuted">
                      <FileText size={18} />
                    </span>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, Node.js, Express"
                      className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain uppercase tracking-wider mb-2">
                  Short Professional Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your work experience and achievements..."
                  rows="3"
                  className="block w-full px-3 py-2 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain resize-none"
                ></textarea>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm mt-6"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4">
          <p className="text-xs text-textMuted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:text-accent-hover transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
