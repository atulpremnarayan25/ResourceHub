import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Power, Trash2, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';

export const AdminFacilitatorsPage = () => {
  const [facilitators, setFacilitators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFacilitators = async () => {
    try {
      setLoading(true);
      setError('');
      const list = await adminService.getFacilitators();
      setFacilitators(list);
    } catch (err) {
      setError(err.message || 'Failed to load facilitators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilitators();
  }, []);

  const handleCreateFacilitator = async (e) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      setError('Username and full name are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const created = await adminService.createFacilitator({ username, name });
      setFacilitators((prev) => [...prev, created]);
      setSuccess(`Facilitator "${created.name}" created with username "${created.username}".`);
      setUsername('');
      setName('');
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create facilitator.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus, facName) => {
    try {
      setError('');
      setSuccess('');
      const updated = await adminService.toggleFacilitatorStatus(id);
      setFacilitators((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: updated.status } : f))
      );
      setSuccess(`Account for ${facName} is now ${updated.status}.`);
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (id, facName) => {
    if (!window.confirm(`Are you sure you want to remove facilitator ${facName}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await adminService.deleteFacilitator(id);
      setFacilitators((prev) => prev.filter((f) => f.id !== id));
      setSuccess(`Facilitator "${facName}" removed.`);
    } catch (err) {
      setError(err.message || 'Failed to delete facilitator.');
    }
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-role">ADMINISTRATION</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Faculty &amp; Teaching Staff
            </span>
          </div>
          <h1 className="page-title">Manage Course Facilitators</h1>
          <p className="page-subtitle">
            Provision facilitator accounts, manage access states, and audit uploaded content.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <UserPlus size={16} />
          <span>Add Facilitator</span>
        </button>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Facilitator Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)' }}>
            <LoadingSpinner text="Loading instructor directory..." />
          </div>
        ) : facilitators.length === 0 ? (
          <div style={{ padding: 'var(--space-8)' }}>
            <EmptyState
              icon={Users}
              title="No facilitators found"
              description="Add teaching assistants and professors to grant upload privileges."
              action={
                <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
                  Add Facilitator
                </button>
              }
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Name</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Username</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>Uploads</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilitators.map((f) => {
                  const isActive = f.status === 'ACTIVE';
                  return (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        {f.name}
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                        <code>{f.username}</code>
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-main)' }}>
                          {f.uploadCount || 0}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <span className={isActive ? 'badge badge-success' : 'badge badge-disabled'}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleToggleStatus(f.id, f.status, f.name)}
                          className={isActive ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                          style={{ marginRight: 'var(--space-2)' }}
                          title={isActive ? 'Disable account' : 'Enable account'}
                        >
                          <Power size={13} />
                          <span>{isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.name)}
                          className="btn btn-danger btn-sm"
                          title="Delete facilitator"
                          aria-label={`Delete facilitator ${f.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Facilitator Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">Provision Facilitator Account</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px', borderRadius: 'var(--radius-pill)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFacilitator}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="facFullName">
                    Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="facFullName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Kavita Raman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <span className="form-helper">Official faculty or instructor display name.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="facUsername">
                    Account Username <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="facUsername"
                    type="text"
                    className="form-input"
                    placeholder="e.g. kavita_raman"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <span className="form-helper">Used for login and in standardized academic filenames.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Check size={16} />
                  <span>{submitting ? 'Creating...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
