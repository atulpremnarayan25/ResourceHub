import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { currentUser, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true, state: null });
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navItems = [
    { to: '/topics', label: 'Topics' },
    ...(role === 'FACILITATOR'
      ? [
          { to: '/facilitator/resources', label: 'My Resources' },
          { to: '/facilitator/resources/new', label: 'Upload Resource' }
        ]
      : []),
    ...(role === 'ADMIN'
      ? [
          { to: '/admin/topics', label: 'Manage Topics' },
          { to: '/admin/facilitators', label: 'Manage Facilitators' }
        ]
      : [])
  ];

  return (
    <header className="app-header">
      <div className="container header-container">
        {/* Brand */}
        <Link to="/" className="brand-link" onClick={closeMobile}>
          <div className="brand-icon">
            <BookOpen size={18} strokeWidth={2.2} />
          </div>
          <span>ResourceHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {currentUser ? (
            <>
              {/* User badge */}
              <div className="user-badge-group">
                <GraduationCap size={14} className="text-muted" />
                <span className="user-name-label">{currentUser.name || currentUser.username}</span>
                <span className="badge badge-role">{currentUser.role}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Sign out of active account"
              >
                <LogOut size={15} />
                <span className="desktop-only">Sign Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              {item.label}
            </NavLink>
          ))}
          {!currentUser && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMobile}>
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" onClick={closeMobile}>
                <UserPlus size={15} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
