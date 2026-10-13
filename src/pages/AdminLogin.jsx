import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide admin credentials');
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth-bg">
      <div className="auth-card admin-card">
        <div className="auth-header">
          <div style={{ display: 'inline-block', padding: '6px 12px', background: '#0f172a', color: '#38bdf8', borderRadius: '4px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Faculty & Admin Only
          </div>
          <h1 style={{ color: '#0f172a' }}>Examination Management</h1>
          <p>Access exams, students, questions, and system logs</p>
        </div>

        {error && <div className="alert-box alert-danger">{error}</div>}

        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div><strong>Email:</strong> admin@college.edu</div>
            <div><strong>Password:</strong> AdminSecurePass123!</div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
            onClick={() => {
              setEmail('admin@college.edu');
              setPassword('AdminSecurePass123!');
              setError('');
            }}
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Administrator Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@college.edu"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Administrator Password</label>
            <div className="input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-admin btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Are you a student taking an exam? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Go to Student Portal</Link>
        </div>
      </div>
    </div>
  );
}
