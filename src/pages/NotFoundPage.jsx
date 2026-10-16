import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
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
          backgroundColor: 'var(--color-bg-subtle)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: 'var(--space-4)'
        }}
      >
        <HelpCircle size={32} />
      </div>

      <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
        Page Not Found (404)
      </h1>

      <p className="page-subtitle" style={{ marginBottom: 'var(--space-6)' }}>
        The requested URL path does not correspond to an active course subject, resource, or dashboard view.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
        <Link to="/topics" className="btn btn-primary">
          <Home size={16} />
          <span>Return to Topics Directory</span>
        </Link>
      </div>
    </div>
  );
};
