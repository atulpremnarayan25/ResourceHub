import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Search, ArrowLeft, FileText } from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import { ResourceCard } from '../components/resources/ResourceCard';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';
import { useDebounce } from '../utils/useDebounce';

export const MyResourcesPage = () => {
  const { currentUser, role } = useAuth();
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    const loadResources = async () => {
      try {
        if (resources.length === 0) setLoading(true);
        setError('');
        const list = await resourceService.getResources({
          uploader: currentUser.username,
          searchQuery: debouncedSearchQuery
        });
        if (!cancelled) {
          setResources(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load your resources.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResources();
    return () => {
      cancelled = true;
    };
  }, [currentUser, debouncedSearchQuery]);

  const handleDelete = async (id) => {
    try {
      await resourceService.deleteResource(id, currentUser.username, role);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link
          to="/facilitator"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, gap: 'var(--space-1)', color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Facilitator Dashboard</span>
        </Link>
      </div>

      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">My Uploaded Resources</h1>
          <p className="page-subtitle">
            Manage your published course documents, verify stored academic filenames, and review student likes.
          </p>
        </div>

        <Link to="/facilitator/resources/new" className="btn btn-primary">
          <UploadCloud size={16} />
          <span>Upload Resource</span>
        </Link>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      {/* Search Input */}
      <div style={{ marginBottom: 'var(--space-6)', maxWidth: '480px', position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)'
          }}
        />
        <input
          type="search"
          className="form-input"
          style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-sm)' }}
          placeholder="Search by title or stored filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your uploaded documents..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No uploaded resources"
          description={
            searchQuery
              ? `No resources match "${searchQuery}".`
              : 'You have not uploaded any resources yet.'
          }
          action={
            <Link to="/facilitator/resources/new" className="btn btn-primary btn-sm">
              <UploadCloud size={14} />
              <span>Upload Your First Resource</span>
            </Link>
          }
        />
      ) : (
        <div className="resources-list">
          {resources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onDelete={handleDelete}
              canDelete={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
