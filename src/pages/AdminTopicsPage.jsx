import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, Layers, BookOpen, AlertCircle, X, Check } from 'lucide-react';
import { topicService } from '../services/topicService';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';

export const AdminTopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError('');
      const list = await topicService.getTopics();
      setTopics(list);
    } catch (err) {
      setError(err.message || 'Failed to load topics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const created = await topicService.createTopic({ name, code, description });
      setTopics((prev) => [...prev, created]);
      setSuccess(`Topic "${created.name}" created successfully.`);
      setName('');
      setCode('');
      setDescription('');
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (id, topicName) => {
    if (!window.confirm(`Are you sure you want to delete the topic "${topicName}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await topicService.deleteTopic(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      setSuccess(`Topic "${topicName}" was removed.`);
    } catch (err) {
      setError(err.message || 'Failed to delete topic.');
    }
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-role">ADMINISTRATION</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Course Management
            </span>
          </div>
          <h1 className="page-title">Manage Academic Topics</h1>
          <p className="page-subtitle">
            Create new subject syllabus areas, organize course codes, and monitor resource allocations.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Create New Topic</span>
        </button>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess('')} />

      {/* Topics Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)' }}>
            <LoadingSpinner text="Loading course topics..." />
          </div>
        ) : topics.length === 0 ? (
          <div style={{ padding: 'var(--space-8)' }}>
            <EmptyState
              icon={Layers}
              title="No topics exist"
              description="Create your first academic topic to organize course files."
              action={
                <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm">
                  Create Topic
                </button>
              }
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Code</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Topic Name</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Description</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>Resources</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid var(--color-border-subtle)' }}>
                {topics.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: 'var(--space-4)', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-role">{t.code || 'CORE'}</span>
                    </td>
                    <td style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                      <Link to={`/topics/${t.id}`} style={{ color: 'inherit' }}>
                        {t.name}
                      </Link>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', maxWidth: '380px' }}>
                      {t.description || 'No description provided.'}
                    </td>
                    <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-main)' }}>
                        {t.resourceCount || 0}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-4)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link
                        to={`/topics/${t.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: 'var(--space-2)' }}
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteTopic(t.id, t.name)}
                        className="btn btn-danger btn-sm"
                        title="Delete topic"
                        aria-label={`Delete topic ${t.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Topic Modal */}
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
              <h2 className="modal-title">Create Academic Topic</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px', borderRadius: 'var(--radius-pill)' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTopic}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="newTopicCode">
                    Course Code (e.g. CS303)
                  </label>
                  <input
                    id="newTopicCode"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS201, CS303"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newTopicName">
                    Topic Subject Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="newTopicName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cloud Infrastructure and Microservices"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newTopicDesc">
                    Topic Description
                  </label>
                  <textarea
                    id="newTopicDesc"
                    className="form-textarea"
                    rows={3}
                    placeholder="Curricular coverage, topics included, target learning outcomes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                  />
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
                  <span>{submitting ? 'Creating...' : 'Create Topic'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
