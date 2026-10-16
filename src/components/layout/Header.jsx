import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  UploadCloud,
  Layers,
  Users,
  LogOut,
  LogIn,
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
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

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
            <li>
              <NavLink
                to="/topics"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
              >
                Topics
              </NavLink>
            </li>

            {role === 'FACILITATOR' && (
              <>
                <li>
                  <NavLink
                    to="/facilitator/resources"
                    className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  >
                    My Resources
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/facilitator/resources/new"
                    className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  >
                    Upload Resource
                  </NavLink>
                </li>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <li>
                  <NavLink
                    to="/admin/topics"
                    className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  >
                    Manage Topics
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/facilitators"
                    className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                  >
                    Manage Facilitators
                  </NavLink>
                </li>
              </>
            )}
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
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
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
          <NavLink
            to="/topics"
            className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            Topics
          </NavLink>

          {role === 'FACILITATOR' && (
            <>
              <NavLink
                to="/facilitator/resources"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                My Resources
              </NavLink>
              <NavLink
                to="/facilitator/resources/new"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Upload Resource
              </NavLink>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <NavLink
                to="/admin/topics"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Manage Topics
              </NavLink>
              <NavLink
                to="/admin/facilitators"
                className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                Manage Facilitators
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};
