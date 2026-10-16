import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, UploadCloud, BookOpen } from 'lucide-react';
import { topicService } from '../services/topicService';
import { resourceService } from '../services/resourceService';
import { likeService } from '../services/likeService';
import { ResourceCard } from '../components/resources/ResourceCard';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';
import { useAuth } from '../context/AuthContext';

export const TopicDetailPage = () => {
  const { topicId } = useParams();
  const { currentUser, role } = useAuth();

  const [topic, setTopic] = useState(null);
  const [resources, setResources] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTopicAndResources = async () => {
    try {
      setLoading(true);
      setError('');
      const [tData, rList, likes] = await Promise.all([
        topicService.getTopicById(topicId),
        resourceService.getResources({ topicId, searchQuery, fileType: fileTypeFilter }),
        currentUser ? likeService.getLikedResourceIds(currentUser.id) : []
      ]);
      setTopic(tData);
      setResources(rList);
      setLikedIds(likes);
    } catch (err) {
      setError(err.message || 'Failed to load topic details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopicAndResources();
  }, [topicId, fileTypeFilter, searchQuery]);

  const handleToggleLike = async (resourceId) => {
    if (!currentUser) return;
    try {
      const result = await likeService.toggleLike(currentUser.id, resourceId);
      setLikedIds((prev) =>
        result.liked ? [...prev, resourceId] : prev.filter((id) => id !== resourceId)
      );
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, likeCount: result.likeCount } : r))
      );
    } catch (err) {
      alert(err.message || 'Could not update like.');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!currentUser) return;
    try {
      await resourceService.deleteResource(resourceId, currentUser.username, role);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err) {
      alert(err.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="container">
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link
          to="/topics"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, gap: 'var(--space-1)', color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Topics</span>
        </Link>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      {topic && (
        <div
          className="card"
          style={{
            marginBottom: 'var(--space-8)',
            backgroundColor: 'var(--color-bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            {topic.code && <span className="badge badge-role">{topic.code}</span>}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Course Subject
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
            <div style={{ maxWidth: '800px' }}>
              <h1 className="page-title" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                {topic.name}
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {topic.description}
              </p>
            </div>

            {role === 'FACILITATOR' && (
              <Link
                to={`/facilitator/resources/new?topicId=${topic.id}`}
                className="btn btn-primary btn-sm"
              >
                <UploadCloud size={15} />
                <span>Upload to Topic</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '450px' }}>
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
            placeholder="Search topic resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Format Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          {['ALL', 'PDF', 'PPTX'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFileTypeFilter(type)}
              className="btn btn-sm"
              style={{
                backgroundColor: fileTypeFilter === type ? 'var(--color-primary)' : 'var(--color-bg-surface)',
                color: fileTypeFilter === type ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: fileTypeFilter === type ? 'var(--color-primary)' : 'var(--color-border-strong)',
                fontWeight: 600
              }}
            >
              {type === 'ALL' ? 'All Files' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Listings */}
      {loading ? (
        <LoadingSpinner text="Loading topic resources..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          description={
            searchQuery || fileTypeFilter !== 'ALL'
              ? 'No resources match the selected search or filter criteria.'
              : 'There are currently no resources uploaded for this topic.'
          }
          action={
            role === 'FACILITATOR' ? (
              <Link to={`/facilitator/resources/new?topicId=${topicId}`} className="btn btn-primary btn-sm">
                <UploadCloud size={14} />
                <span>Upload First Resource</span>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="resources-list">
          {resources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              isLiked={likedIds.includes(res.id)}
              onToggleLike={handleToggleLike}
              onDelete={handleDeleteResource}
              canDelete={role === 'ADMIN' || (currentUser && res.uploadedBy === currentUser.username)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
