import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { AlertBanner } from '../components/common/UIFeedback';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to appropriate destination
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (currentUser.role === 'FACILITATOR') navigate('/facilitator', { replace: true });
      else navigate('/topics', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long and contain only letters, numbers, or underscores.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const student = await authService.signup({
        name: trimmedName,
        username: cleanUsername,
        password
      });

      // Automatically authenticate the newly registered student
      login(student);
      navigate('/topics', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h1 className="auth-title">Create Student Account</h1>
          <p className="auth-subtitle">Join ResourceHub to access and interact with course materials.</p>
        </header>

        <section className="auth-card" aria-label="Student registration form">
          <AlertBanner type="danger" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSignupSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="studentName">
                Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="studentName"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Arun Kumar"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="name"
                disabled={loading}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentUsername">
                Username <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="studentUsername"
                name="username"
                type="text"
                className="form-input"
                placeholder="e.g. arun_kumar"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="username"
                disabled={loading}
                required
              />
              <span className="form-helper">
                Only letters, numbers, and underscores (min 3 characters).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentPassword">
                Password <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div className="input-with-toggle">
                <input
                  id="studentPassword"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter a secure password (min 6 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="studentConfirmPassword">
                Confirm Password <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div className="input-with-toggle">
                <input
                  id="studentConfirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  aria-pressed={showConfirmPassword}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} aria-hidden="true" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
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
export default SignupPage;
