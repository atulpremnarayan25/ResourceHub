import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDeniedPage = () => {
  const { role, currentUser } = useAuth();

  return (
    <div className="container" style={{ maxWidth: '600px', padding: 'var(--space-12) var(--space-4)', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-danger-border)',
          marginBottom: 'var(--space-4)'
        }}
      >
        <ShieldAlert size={32} />
      </div>

      <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
        Access Restricted (403)
      </h1>

      <p className="page-subtitle" style={{ marginBottom: 'var(--space-6)' }}>
        Your account role (<strong>{role || 'GUEST'}</strong>) does not have sufficient permissions to access this administrative or facilitator resource.
      </p>

      <div
        className="card"
        style={{
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--color-bg-surface)',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <UserCheck size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-main)' }}>
            Signed in as: {currentUser?.name || 'Guest'} (<code>{currentUser?.username || 'none'}</code>)
          </span>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
          If you require elevated access to this section, please sign in with an authorized Facilitator or Administrator account, or return to the course topics directory.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
        <Link to="/topics" className="btn btn-primary">
          <Home size={16} />
          <span>Browse Course Topics</span>
        </Link>
        <Link to="/login" className="btn btn-secondary">
          <span>Switch Account</span>
        </Link>
      </div>
    </div>
  );
};
