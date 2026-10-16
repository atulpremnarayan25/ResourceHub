import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, FileText, Heart, Layers, ArrowRight, User } from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import { ResourceCard } from '../components/resources/ResourceCard';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';

export const FacilitatorDashboardPage = () => {
  const { currentUser, role } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError('');
      const list = await resourceService.getResources({ uploader: currentUser.username });
      setResources(list);
    } catch (err) {
      setError(err.message || 'Failed to load facilitator metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleDeleteResource = async (id) => {
    try {
      await resourceService.deleteResource(id, currentUser.username, role);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete resource.');
    }
  };

  const totalUploads = resources.length;
  const totalLikes = resources.reduce((acc, r) => acc + (r.likeCount || 0), 0);
  const uniqueTopics = new Set(resources.map((r) => r.topicId)).size;

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-role">FACILITATOR PORTAL</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Course Management
            </span>
          </div>
          <h1 className="page-title">
            Welcome back, {currentUser?.name || 'Instructor'}
          </h1>
          <p className="page-subtitle">
            Upload course materials, monitor student engagement, and manage topic slide decks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/facilitator/resources/new" className="btn btn-primary">
            <UploadCloud size={16} />
            <span>Upload New Resource</span>
          </Link>
          <Link to="/facilitator/resources" className="btn btn-secondary">
            <span>Manage My Uploads</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {totalUploads}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Published Resources
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Heart size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {totalLikes}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Student Likes Received
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-subtle)',
              color: 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {uniqueTopics}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Active Course Topics
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Recent Course Uploads
          </h2>
          {resources.length > 3 && (
            <Link to="/facilitator/resources" style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              View all ({resources.length})
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading recent uploads..." />
        ) : resources.length === 0 ? (
          <EmptyState
            icon={UploadCloud}
            title="No resources uploaded yet"
            description="You have not published any course notes or presentations yet. Get started by uploading your first document."
            action={
              <Link to="/facilitator/resources/new" className="btn btn-primary btn-sm">
                <UploadCloud size={14} />
                <span>Upload First Resource</span>
              </Link>
            }
          />
        ) : (
          <div className="resources-list">
            {resources.slice(0, 4).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onDelete={handleDeleteResource}
                canDelete={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
