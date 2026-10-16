import React from 'react';
import { AlertCircle, CheckCircle, Info, Inbox } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...' }) => (
  <div className="state-box" style={{ padding: 'var(--space-8)' }} role="status" aria-live="polite">
    <div
      style={{
        width: 32,
        height: 32,
        border: '3px solid var(--color-border-subtle)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 'var(--space-3)'
      }}
    />
    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
      {text}
    </p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  action = null
}) => (
  <div className="state-box">
    <div className="state-icon" aria-hidden="true">
      <Icon size={24} />
    </div>
    <h3 className="state-title">{title}</h3>
    <p className="state-description">{description}</p>
    {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
  </div>
);

export const AlertBanner = ({ type = 'info', message, onClose = null }) => {
  if (!message) return null;

  const icons = {
    info: Info,
    success: CheckCircle,
    danger: AlertCircle,
    warning: AlertCircle
  };

  const Icon = icons[type] || Info;

  return (
    <div
      className={`alert alert-${type}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-4)',
        fontSize: 'var(--text-sm)'
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            cursor: 'pointer',
            padding: '2px',
            color: 'inherit',
            opacity: 0.8
          }}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};
