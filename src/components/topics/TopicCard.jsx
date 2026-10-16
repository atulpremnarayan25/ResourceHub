import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

export const TopicCard = ({ topic }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        {topic.code ? (
          <span className="badge badge-role">{topic.code}</span>
        ) : (
          <span className="badge badge-role">TOPIC</span>
        )}
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontWeight: 500
          }}
        >
          <BookOpen size={14} />
          {topic.resourceCount || 0} {topic.resourceCount === 1 ? 'Resource' : 'Resources'}
        </span>
      </div>

      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-text-main)' }}>
        <Link to={`/topics/${topic.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {topic.name}
        </Link>
      </h3>

      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          flex: 1,
          marginBottom: 'var(--space-4)'
        }}
      >
        {topic.description || 'No description provided.'}
      </p>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
        <Link
          to={`/topics/${topic.id}`}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>Explore Resources</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
