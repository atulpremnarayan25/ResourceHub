import React, { useEffect } from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

export const FilePreviewModal = ({ resource, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  const isPdf = resource.fileType.toUpperCase() === 'PDF';

  const handleDownload = () => {
    if (resource.fileUrl) {
      const a = document.createElement('a');
      a.href = resource.fileUrl;
      a.download = resource.storedFilename || resource.originalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Initiating download for: ${resource.storedFilename}`);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div className="modal-dialog modal-dialog-large">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={isPdf ? 'badge badge-pdf' : 'badge badge-pptx'}>
              {resource.fileType}
            </span>
            <h2 id="preview-modal-title" className="modal-title" style={{ fontSize: 'var(--text-base)' }}>
              {resource.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px', borderRadius: 'var(--radius-pill)' }}
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 'var(--space-4)' }}>
          {isPdf ? (
            <div style={{ width: '100%', height: '560px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <iframe
                src={`${resource.fileUrl}#toolbar=0`}
                title={resource.title}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className="state-box" style={{ padding: 'var(--space-12) var(--space-6)' }}>
              <div className="state-icon" style={{ backgroundColor: 'var(--color-pptx-bg)', color: 'var(--color-pptx-text)' }}>
                <FileText size={28} />
              </div>
              <h3 className="state-title">Presentation Slide Deck</h3>
              <p className="state-description">
                PowerPoint slides (.pptx) are optimized for desktop presentation software. Download the file to view and present all animations and lecture notes.
              </p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <button onClick={handleDownload} className="btn btn-primary">
                  <Download size={16} />
                  <span>Download Presentation ({resource.fileSize})</span>
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)'
            }}
          >
            <div><strong>Stored filename:</strong> <code style={{ fontSize: '11px' }}>{resource.storedFilename}</code></div>
            <div><strong>Uploaded by:</strong> {resource.uploaderName} ({resource.uploadedBy})</div>
            <div><strong>Original file:</strong> {resource.originalFilename} ({resource.fileSize})</div>
          </div>
        </div>

        <div className="modal-footer">
          {isPdf && resource.fileUrl && (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={14} />
              <span>Open in New Tab</span>
            </a>
          )}
          <button onClick={handleDownload} className="btn btn-primary btn-sm">
            <Download size={14} />
            <span>Download ({resource.fileSize})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
