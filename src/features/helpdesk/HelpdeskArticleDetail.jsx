import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';
import { useGetKbArticleByIdQuery } from './ticketApi';

export const HelpdeskArticleDetail = () => {
  const { id } = useParams();
  const { data: article, isLoading: loading } = useGetKbArticleByIdQuery(id);
  const [voted, setVoted] = useState(false);

  const handleVote = () => {
    if (voted || !article) return;
    setVoted(true);
  };

  if (loading) return <LoadingState text="Loading Knowledge Base SOP and policy references..." />;
  if (!article) return <div className="alert alert-danger">Knowledge Base Article not found.</div>;

  return (
    <div className="helpdesk-article-detail">
      <PageHeader
        title={article.title}
        subtitle={`Category: ${article.category || 'General'} • Status: ${article.status || 'PUBLISHED'}`}
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Knowledge Base', href: '/helpdesk/knowledge-base' },
          { label: article.title },
        ]}
        actions={
          <Link to="/helpdesk/knowledge-base">
            <Button variant="outline" size="sm">Back to Articles</Button>
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card>
            <div style={{ lineHeight: 1.7, fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
              {article.content}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Was this SOP or guidance helpful?</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Your feedback helps maintain accurate resolution templates.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant={voted ? 'success' : 'outline'}
                  size="sm"
                  onClick={handleVote}
                  disabled={voted}
                >
                  {voted ? '✓ Feedback Logged' : '👍 Yes, Helpful'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--navy)' }}>Article Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div><b>Type:</b> {article.type || 'FAQ'}</div>
              <div><b>Category:</b> {article.category || 'General'}</div>
              <div><b>Version:</b> v{article.version || 1}</div>
              <div><b>Created:</b> {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-IN') : '-'}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpdeskArticleDetail;
