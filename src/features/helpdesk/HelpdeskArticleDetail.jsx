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

      <div className="helpdesk-article-detail-grid">
        <div className="portal-flex-col-gap-md">
          <Card>
            <div className="helpdesk-article-full-content">
              {article.content}
            </div>
          </Card>

          <Card>
            <div className="portal-flex-between-center">
              <div>
                <h4 className="helpdesk-feedback-title">Was this SOP or guidance helpful?</h4>
                <p className="portal-subtext-muted">
                  Your feedback helps maintain accurate resolution templates.
                </p>
              </div>
              <div className="portal-flex-gap-sm">
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

        <div className="portal-flex-col-gap-md">
          <Card>
            <h4 className="helpdesk-sidebar-heading">Article Information</h4>
            <div className="portal-flex-col-gap-xs small">
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
