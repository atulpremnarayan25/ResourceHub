import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Power, Trash2, X, Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';

const initialFacForm = { username: '', name: '', password: '' };

export const AdminFacilitatorsPage = () => {
  const [facilitators, setFacilitators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Facilitator Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFacForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetFac, setResetTargetFac] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(initialFacForm);
    setShowPassword(false);
    setModalOpen(false);
  };

  const openResetModal = (fac) => {
    setResetTargetFac(fac);
    setNewPassword('');
    setShowResetPassword(false);
    setResetModalOpen(true);
  };

  const closeResetModal = () => {
    setResetTargetFac(null);
    setNewPassword('');
    setShowResetPassword(false);
    setResetModalOpen(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTargetFac) return;

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    try {
      setResetSubmitting(true);
      setError('');
      setSuccess('');
      await adminService.resetFacilitatorPassword(resetTargetFac.id, newPassword);
      setSuccess(`Password for facilitator "${resetTargetFac.name}" has been successfully reset.`);
      closeResetModal();
    } catch (err) {
      setError(err.message || 'Failed to reset facilitator password.');
    } finally {
      setResetSubmitting(false);
    }
  };

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
    if (!formData.username.trim() || !formData.name.trim() || !formData.password) {
      setError('Full name, username, and initial password are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Initial password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const created = await adminService.createFacilitator(formData);
      await loadFacilitators();
      setSuccess(`Facilitator "${created.name}" created with username "${created.username}".`);
      resetForm();
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
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} autoDismiss={4000} />

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
                          onClick={() => openResetModal(f)}
                          className="btn btn-secondary btn-sm"
                          style={{ marginRight: 'var(--space-2)' }}
                          title={`Reset password for ${f.name}`}
                          aria-label={`Reset password for ${f.name}`}
                        >
                          <KeyRound size={13} />
                          <span>Reset Password</span>
                        </button>
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
            if (e.target === e.currentTarget) resetForm();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">Provision Facilitator Account</h2>
              <button
                onClick={resetForm}
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
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    disabled={submitting}
                  />
                  <span className="form-helper">Used for login and in standardized academic filenames.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="facPassword">
                    Initial Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <div className="input-with-toggle">
                    <input
                      id="facPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter initial password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      autoComplete="new-password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      disabled={submitting}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <span className="form-helper">Initial login password for the instructor.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={resetForm}
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

      {/* Reset Facilitator Password Modal */}
      {resetModalOpen && resetTargetFac && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeResetModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
        >
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 id="reset-modal-title" className="modal-title">Reset Facilitator Password</h2>
              <button
                onClick={closeResetModal}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px', borderRadius: 'var(--radius-pill)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Set a new password for <strong>{resetTargetFac.name}</strong> (<code>{resetTargetFac.username}</code>).
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="resetNewPassword">
                    New Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <div className="input-with-toggle">
                    <input
                      id="resetNewPassword"
                      name="newPassword"
                      type={showResetPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={resetSubmitting}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowResetPassword((prev) => !prev)}
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showResetPassword}
                      title={showResetPassword ? 'Hide password' : 'Show password'}
                      disabled={resetSubmitting}
                    >
                      {showResetPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <span className="form-helper">The facilitator will immediately use this new password to authenticate.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="btn btn-secondary"
                  disabled={resetSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={resetSubmitting}>
                  <Check size={16} />
                  <span>{resetSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
