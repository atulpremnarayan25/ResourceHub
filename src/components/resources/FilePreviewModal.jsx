import React, { useEffect } from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { isSafeUrl, downloadFile } from '../../utils/security';

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

  const fileType = (resource.fileType || '').toUpperCase();
  const isPdf = fileType === 'PDF';
  const isGoogleDocViewable = ['PPT', 'PPTX', 'DOC', 'DOCX'].includes(fileType);
  const hasSafeUrl = isSafeUrl(resource.fileUrl);

  const isPublicHttpsUrl = typeof resource.fileUrl === 'string' && resource.fileUrl.startsWith('https://');
  const googleViewerUrl = isPublicHttpsUrl
    ? `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(resource.fileUrl)}`
    : null;

  const previewUrl = isPdf ? resource.fileUrl : googleViewerUrl;

  const getBadgeClass = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'PDF') return 'badge badge-pdf';
    if (t === 'DOC' || t === 'DOCX') return 'badge badge-docx';
    return 'badge badge-pptx';
  };

  const handleDownload = () => {
    downloadFile(resource.fileUrl, resource.storedFilename || resource.originalFilename);
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
            <span className={getBadgeClass(resource.fileType)}>
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
          {isPdf || (isGoogleDocViewable && googleViewerUrl) ? (
            <div style={{ width: '100%', height: '560px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {hasSafeUrl ? (
                <iframe
                  src={previewUrl}
                  title={resource.title}
                  width="100%"
                  height="100%"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  style={{ border: 'none', display: 'block' }}
                />
              ) : (
                <div className="state-box" style={{ padding: 'var(--space-12) var(--space-6)' }}>
                  <p className="state-description">Direct preview is unavailable for this resource protocol.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="state-box" style={{ padding: 'var(--space-12) var(--space-6)' }}>
              <div
                className="state-icon"
                style={{
                  backgroundColor: ['DOC', 'DOCX'].includes(fileType)
                    ? 'var(--color-docx-bg)'
                    : 'var(--color-pptx-bg)',
                  color: ['DOC', 'DOCX'].includes(fileType)
                    ? 'var(--color-docx-text)'
                    : 'var(--color-pptx-text)'
                }}
              >
                <FileText size={28} />
              </div>
              <h3 className="state-title">{resource.fileType} Document</h3>
              <p className="state-description">
                Direct in-browser preview requires an active network connection to Google Docs Viewer. Download the document to view and edit it locally.
              </p>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <button onClick={handleDownload} className="btn btn-primary">
                  <Download size={16} />
                  <span>Download File ({resource.fileSize})</span>
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
          {previewUrl && hasSafeUrl && (
            <a
              href={previewUrl}
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
