import React, { useState } from 'react';
import { Download, Eye, Heart, Trash2, User, Clock } from 'lucide-react';
import { formatTimestamp } from '../../utils/namingConvention';
import { downloadFile } from '../../utils/security';
import { FilePreviewModal } from './FilePreviewModal';
import { useAuth } from '../../context/AuthContext';

export const ResourceCard = ({
  resource,
  isLiked = false,
  onToggleLike,
  onDelete,
  canDelete = false
}) => {
  const { role } = useAuth();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [likePending, setLikePending] = useState(false);

  const isStudent = role === 'STUDENT';
  const getBadgeClass = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'PDF') return 'badge badge-pdf';
    if (t === 'DOC' || t === 'DOCX') return 'badge badge-docx';
    return 'badge badge-pptx';
  };

  const handleLikeClick = async () => {
    if (!isStudent) {
      alert('Only students can like resources.');
      return;
    }
    if (likePending || !onToggleLike) return;

    try {
      setLikePending(true);
      await onToggleLike(resource.id);
    } finally {
      setLikePending(false);
    }
  };

  const handleDownload = () => {
    downloadFile(resource.fileUrl, resource.storedFilename || resource.originalFilename);
  };

  return (
    <>
      <div className="resource-card">
        <div className="resource-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className={getBadgeClass(resource.fileType)}>
              {resource.fileType}
            </span>
            {resource.topicName && (
              <span className="badge badge-role" style={{ fontSize: '10px' }}>
                {resource.topicName}
              </span>
            )}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              {resource.fileSize}
            </span>
          </div>

          <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-main)', margin: 'var(--space-1) 0' }}>
            {resource.title}
          </h4>

          <div style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
              Academic Stored Filename:
            </span>
            <code
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                wordBreak: 'break-all'
              }}
            >
              {resource.storedFilename}
            </code>
          </div>

          <div className="resource-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <User size={13} />
              {resource.uploaderName}
            </span>
            <span>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Clock size={13} />
              {formatTimestamp(resource.uploadedAt)}
            </span>
          </div>
        </div>

        <div className="resource-actions">
          {/* Like Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={likePending}
            className="btn btn-sm"
            style={{
              border: '1px solid',
              borderColor: isLiked ? '#f43f5e' : 'var(--color-border-strong)',
              backgroundColor: isLiked ? '#fff1f2' : 'var(--color-bg-surface)',
              color: isLiked ? '#e11d48' : 'var(--color-text-secondary)',
              gap: 'var(--space-1)',
              padding: '0.35rem 0.65rem'
            }}
            title={isStudent ? (isLiked ? 'Unlike resource' : 'Like resource') : 'Only students can like resources'}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} ${resource.title}`}
          >
            <Heart
              size={14}
              style={{
                fill: isLiked ? '#e11d48' : 'none',
                color: isLiked ? '#e11d48' : 'currentColor'
              }}
            />
            <span style={{ fontWeight: 600 }}>{resource.likeCount || 0}</span>
          </button>

          {/* View / Preview Button */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="btn btn-secondary btn-sm"
            title="Preview resource document"
          >
            <Eye size={14} />
            <span>View</span>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-primary btn-sm"
            title="Download original file"
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          {/* Delete Button (if permitted) */}
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
                  onDelete(resource.id);
                }
              }}
              className="btn btn-danger btn-sm"
              style={{ padding: '0.35rem' }}
              title="Delete resource"
              aria-label="Delete resource"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <FilePreviewModal
        resource={resource}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
};
