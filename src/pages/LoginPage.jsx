import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { BookOpen, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { AlertBanner } from '../components/common/UIFeedback';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  /**
   * Validates and returns a safe internal destination path, preventing open redirects.
   */
  const getSafeDestination = (user) => {
    const rawTarget =
      location.state?.from?.pathname ||
      searchParams.get('returnUrl') ||
      searchParams.get('redirect');

    if (rawTarget && typeof rawTarget === 'string') {
      const trimmed = rawTarget.trim();
      // Ensure target is an internal relative route, blocking open redirect vectors (// or external schemes)
      if (
        trimmed.startsWith('/') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/\\') &&
        !trimmed.includes(':')
      ) {
        // Enforce role authorization against target route
        if (trimmed.startsWith('/admin') && user.role !== 'ADMIN') {
          return user.role === 'FACILITATOR' ? '/facilitator' : '/topics';
        }
        if (
          trimmed.startsWith('/facilitator') &&
          user.role !== 'FACILITATOR' &&
          user.role !== 'ADMIN'
        ) {
          return '/topics';
        }
        return trimmed;
      }
    }

    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'FACILITATOR') return '/facilitator';
    return '/topics';
  };

  // If already authenticated, redirect to appropriate destination
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate(getSafeDestination(currentUser), { replace: true });
    }
  }, [isAuthenticated, currentUser]);

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
      navigate(getSafeDestination(user), { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <div className="auth-logo" aria-hidden="true">
            <BookOpen size={24} strokeWidth={2.2} />
          </div>
          <h1 className="auth-title">Sign in to ResourceHub</h1>
          <p className="auth-subtitle">Your academic resources, all in one place.</p>
        </header>

        <section className="auth-card" aria-label="Sign in form">
          <AlertBanner type="danger" message={error} onClose={() => setError('')} />

          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="username"
                disabled={loading}
                autoFocus
                required
              />
              <span className="form-helper">
                Enter your registered academic or administrator username.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-with-toggle">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: 'var(--space-2)' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} aria-hidden="true" />
                  <span>Sign in</span>
                </>
              )}
            </button>

            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              New student?{' '}
              <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Create an account
              </Link>
            </div>
          </form>
        </section>

        <footer className="auth-footer">
          <p>ResourceHub &bull; Academic Resource Portal</p>
        </footer>
      </div>
    </main>
  );
};
