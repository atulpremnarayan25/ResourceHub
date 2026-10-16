import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, User, Lock, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
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
      setError('Please enter your university username.');
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

  const handleQuickLogin = async (demoUsername) => {
    try {
      setLoading(true);
      setError('');
      const user = await authService.login(demoUsername, 'demo');
      login(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '640px', padding: 'var(--space-12) var(--space-4)' }}>
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
          University Course CSF303: Web Engineering Resource Sharing Portal
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
                placeholder="e.g. student_arun or prof_sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <span className="form-helper">Enter your registered student, facilitator, or admin username.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Any password in demo mode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>

      {/* Demo Persona Quick Access Cards */}
      <div className="card" style={{ backgroundColor: 'var(--color-bg-surface)', padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
          Evaluation Quick Sign-In (1-Click)
        </h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          Select any role preset to immediately evaluate permissions and features:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('student_arun')}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-3)', height: 'auto', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-primary)', fontWeight: 600 }}>
              <BookOpen size={14} />
              <span>Student</span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-main)', marginTop: '2px' }}>
              Arun Patel
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              Browse, download, like
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('prof_sharma')}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-3)', height: 'auto', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-success)', fontWeight: 600 }}>
              <User size={14} />
              <span>Facilitator</span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-main)', marginTop: '2px' }}>
              Prof. Rahul Sharma
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              Uploads &amp; my resources
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin_dean')}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-3)', height: 'auto', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: '#7c3aed', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>Administrator</span>
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-main)', marginTop: '2px' }}>
              Dean Academic
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
              Manage topics &amp; users
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
