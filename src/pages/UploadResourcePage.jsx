import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UploadCloud, ArrowLeft, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { topicService } from '../services/topicService';
import { resourceService } from '../services/resourceService';
import { generateStoredFilename } from '../utils/namingConvention';
import { validateFileHeader } from '../utils/security';
import { useAuth } from '../context/AuthContext';
import { AlertBanner } from '../components/common/UIFeedback';

export const UploadResourcePage = () => {
  const [searchParams] = useSearchParams();
  const preselectedTopicId = searchParams.get('topicId') || '';

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [topicId, setTopicId] = useState(preselectedTopicId);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const list = await topicService.getTopics();
        setTopics(list);
        if (!topicId && list.length > 0) {
          setTopicId(preselectedTopicId || list[0].id);
        }
      } catch (err) {
        setError('Failed to load topic list.');
      }
    };
    loadTopics();
  }, [preselectedTopicId]);

  const fileExt = selectedFile
    ? selectedFile.name.split('.').pop().toLowerCase()
    : 'pdf';
  const cleanExt = ['pdf', 'ppt', 'pptx'].includes(fileExt) ? fileExt : 'pdf';

  // Live preview of the academic stored filename
  const liveStoredFilename = currentUser
    ? generateStoredFilename(currentUser.username, title || 'resource-title', cleanExt)
    : '';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['pdf', 'ppt', 'pptx'];

    if (!validExts.includes(ext)) {
      setError('Invalid file format. Please upload a PDF, PPT, or PPTX file.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15 MB limit. Please select a smaller file.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    // Defensive binary inspection: verify magic bytes before accepting file
    const headerCheck = await validateFileHeader(file);
    if (!headerCheck.valid) {
      setError(`Security rejection: ${headerCheck.reason}`);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);

    // If title is empty, prefill sensible title from original filename
    if (!title.trim()) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const formattedTitle = nameWithoutExt
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(formattedTitle);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicId) {
      setError('Please select a topic.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a descriptive title for the resource.');
      return;
    }
    if (!selectedFile) {
      setError('Please choose a PDF or PPTX document to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await resourceService.uploadResource({
        topicId,
        title: title.trim(),
        file: selectedFile,
        uploader: currentUser
      });

      navigate('/facilitator/resources');
    } catch (err) {
      setError(err.message || 'Failed to upload resource.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link
          to="/facilitator"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, gap: 'var(--space-1)', color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">Upload Academic Resource</h1>
        <p className="page-subtitle">
          Publish lecture slides, lab manuals, and course references for enrolled students.
        </p>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-8)' }}>
        {/* Topic Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="topicSelect">
            Subject Topic <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <select
            id="topicSelect"
            className="form-select"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            disabled={submitting}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code ? `[${t.code}] ` : ''}{t.name}
              </option>
            ))}
          </select>
          <span className="form-helper">The topic folder where students will locate this resource.</span>
        </div>

        {/* Resource Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="resourceTitle">
            Resource Title <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="resourceTitle"
            type="text"
            className="form-input"
            placeholder="e.g. Asymptotic Notation and Master Theorem Analysis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          <span className="form-helper">Clear, human-readable name displayed in student directories.</span>
        </div>

        {/* File Picker */}
        <div className="form-group">
          <label className="form-label" htmlFor="fileUpload">
            Document File (.pdf, .ppt, .pptx) <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div
            style={{
              border: '2px dashed var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-subtle)',
              position: 'relative'
            }}
          >
            <input
              id="fileUpload"
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileChange}
              disabled={submitting}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UploadCloud size={22} />
              </div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop a file'}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {selectedFile
                  ? `Size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB (${selectedFile.name.split('.').pop().toUpperCase()})`
                  : 'PDF and PowerPoint slide decks up to 15 MB allowed'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Stored Filename Academic Standard Preview */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-app)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-main)' }}>
              Standardized Academic Stored Filename
            </span>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            Course convention: <code>&lt;username&gt;_&lt;YYYYMMDD&gt;_&lt;HHMM&gt;_&lt;resource-slug&gt;.&lt;ext&gt;</code>
          </p>

          <code
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-bg-surface)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-strong)',
              wordBreak: 'break-all'
            }}
          >
            {liveStoredFilename}
          </code>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Link to="/facilitator" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <UploadCloud size={16} />
            <span>{submitting ? 'Uploading & Verifying...' : 'Publish Resource'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
