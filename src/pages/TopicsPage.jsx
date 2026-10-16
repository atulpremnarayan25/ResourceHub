import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, PlusCircle } from 'lucide-react';
import { topicService } from '../services/topicService';
import { TopicCard } from '../components/topics/TopicCard';
import { LoadingSpinner, EmptyState, AlertBanner } from '../components/common/UIFeedback';
import { useAuth } from '../context/AuthContext';

export const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth();

  const fetchTopics = async (query = '', isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError('');
      const list = await topicService.getTopics(query);
      setTopics(list);
    } catch (err) {
      setError(err.message || 'Failed to load topics.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(searchQuery, topics.length === 0);
  }, [searchQuery]);

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Course Topics &amp; Resources</h1>
          <p className="page-subtitle">
            Browse curricular subject areas to view lecture slides, guides, and download study notes.
          </p>
        </div>

        {role === 'ADMIN' && (
          <Link to="/admin/topics" className="btn btn-secondary btn-sm">
            <PlusCircle size={15} />
            <span>Manage Topics</span>
          </Link>
        )}
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError('')} />

      {/* Search Bar */}
      <div style={{ marginBottom: 'var(--space-6)', maxWidth: '520px', position: 'relative' }}>
        <Search
          size={18}
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
          style={{ paddingLeft: '2.5rem' }}
          placeholder="Search by topic name, course code (e.g. CS303), or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search topics"
        />
      </div>

      {/* Content State */}
      {loading ? (
        <LoadingSpinner text="Fetching academic topics..." />
      ) : topics.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No topics found"
          description={
            searchQuery
              ? `No subject areas matched "${searchQuery}". Try a different keyword.`
              : 'There are currently no topics available.'
          }
          action={
            searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="btn btn-secondary btn-sm">
                Clear Search
              </button>
            ) : null
          }
        />
      ) : (
        <div className="topics-grid">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
};
