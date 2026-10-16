import React from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { resetDatabase } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

export const Footer = () => {
  const { currentUser } = useAuth();

  const handleReset = () => {
    if (window.confirm('Reset all topics, resources, likes, and accounts to the initial sample seed data?')) {
      resetDatabase();
      window.location.reload();
    }
  };

  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <div className="footer-meta">
          <p>
            <strong>ResourceHub</strong> &bull; University Academic Resource Sharing Portal
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Course project demonstration. All uploaded files and accounts are simulated with local storage.
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <div className="footer-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary btn-sm"
              title="Reset simulated database to pristine sample data (Administrator only)"
            >
              <RotateCcw size={14} />
              <span>Reset Sample Data</span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};
