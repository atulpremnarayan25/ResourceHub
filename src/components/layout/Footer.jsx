import React from 'react';

export const Footer = () => {
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
      </div>
    </footer>
  );
};
