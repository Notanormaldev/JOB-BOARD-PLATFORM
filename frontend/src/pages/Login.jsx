import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const profile = await login(email, password);
      // Redirect based on role
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'employer') navigate('/employer');
      else navigate('/candidate');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full bg-card p-8 rounded-lg border border-border shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-textMain">Welcome Back</h2>
          <p className="text-sm text-textMuted mt-1">Log in to manage your job listings or applications</p>
        </div>

        {errorMsg && (
          <div className="bg-danger-light border border-danger text-danger text-sm rounded px-4 py-3 mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="you@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
              />
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
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-border rounded bg-transparent text-sm focus:outline-none focus:border-primary text-textMain"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn size={18} className="mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4">
          <p className="text-xs text-textMuted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-accent hover:text-accent-hover transition-colors">
              Sign Up Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
