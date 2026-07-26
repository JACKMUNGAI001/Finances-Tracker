import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulated login - replace with actual API call
      console.log('Login attempt:', formData);
      
      // Store user in localStorage (simulated)
      localStorage.setItem('user', JSON.stringify({ email: formData.email }));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="auth-badge">Welcome back</p>
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Welcome back to Finances Tracker.</p>

        <form onSubmit={handleSubmit} className="form-stack">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="app-shell input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="app-shell input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-subtitle" style={{ marginTop: '18px', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </p>

        <Link to="/" className="auth-link" style={{ display: 'inline-flex', marginTop: '14px' }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
