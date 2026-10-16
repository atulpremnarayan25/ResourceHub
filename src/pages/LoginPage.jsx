import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { AlertBanner } from '../components/common/UIFeedback';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = await authService.login(username.trim(), password);
      login(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await authService.login('admin', 'atul1234');
      login(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setUsername('admin');
    setPassword('atul1234');
    setError('');
  };

  return (
    <div className="container" style={{ maxWidth: '580px', padding: 'var(--space-12) var(--space-4)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 54,
            height: 54,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary-border)',
            marginBottom: 'var(--space-3)'
          }}
        >
          <GraduationCap size={30} />
        </div>
        <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)' }}>
          Sign In to ResourceHub
        </h1>
        <p className="page-subtitle">
          Academic Resource Portal &bull; System Administration
        </p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-8)' }}>
        <AlertBanner type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <span className="form-helper">Administrator username (e.g. <code>admin</code>).</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
          </button>
        </form>
      </div>

      {/* Admin Quick Access Card */}
      <div className="card" style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShieldCheck size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Administrator Account
            </span>
          </div>
          <span className="badge badge-role">ADMIN</span>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          The portal has been reset to a clean state with all sample data removed. Use the administrator credentials below to access governance controls:
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            marginBottom: 'var(--space-4)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div><strong>Username:</strong> <code>admin</code></div>
            <div style={{ marginTop: '2px' }}><strong>Password:</strong> <code>atul1234</code></div>
          </div>
          <button
            type="button"
            onClick={handleFillCredentials}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11px', gap: '4px' }}
          >
            <KeyRound size={12} />
            <span>Fill Form</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdminQuickLogin}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: '100%', gap: 'var(--space-2)' }}
        >
          <ShieldCheck size={16} />
          <span>1-Click Sign In as Administrator</span>
        </button>
      </div>
    </div>
  );
};
