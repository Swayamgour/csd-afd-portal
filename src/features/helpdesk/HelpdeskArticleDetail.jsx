import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';
import { kbService } from '../../services/kb.service';

export const HelpdeskArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await kbService.getArticleById(id);
      setArticle(res.data || res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (isHelpful) => {
    if (voted || !article) return;
    await kbService.rateArticle(article.id, isHelpful);
    setVoted(true);
    setArticle(prev => ({
      ...prev,
      helpfulCount: isHelpful ? (prev.helpfulCount || 0) + 1 : prev.helpfulCount
    }));
  };

  if (loading) return <LoadingState text="Loading Knowledge Base SOP and policy references..." />;
  if (!article) return <div className="alert alert-danger">Knowledge Base Article not found.</div>;

  return (
    <div className="helpdesk-article-detail">
      <PageHeader
        title={article.title}
        subtitle={`Category: ${article.category} • Last Updated: ${article.updatedAt || 'Recent'}`}
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Knowledge Base', href: '/helpdesk/knowledge-base' },
          { label: article.id }
        ]}
        actions={
          <Link to="/helpdesk/knowledge-base">
            <Button variant="outline" size="sm">Back to Articles</Button>
          </Link>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'start' }}>
        <Card>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#f1f5f9', color: 'var(--navy)' }}>
              {article.category}
            </span>
            {(article.tags || []).map((t, idx) => (
              <span key={idx} className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                #{t}
              </span>
            ))}
          </div>

          <div style={{ lineHeight: 1.8, fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'pre-line' }}>
            {article.content}
          </div>

          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Was this knowledge article helpful?</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {article.helpfulCount || 14} support specialists found this article helpful.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant={voted ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => handleVote(true)}
                disabled={voted}
              >
                👍 Yes ({article.helpfulCount || 14})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote(false)}
                disabled={voted}
              >
                👎 No
              </Button>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Article Metadata">
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>DOC ID</span>
                <strong>{article.id}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>AUTHENTICATED BY</span>
                <span>CSD HQ IT Operations Desk</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>APPLICABILITY</span>
                <span>All Depot & Helpdesk Triage Tiers</span>
              </div>
            </div>
          </Card>

          <Card title="Related Resources">
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link to="/helpdesk/faqs" style={{ color: 'var(--brand)' }}>
                  AFD Portal Citizen FAQs
                </Link>
              </li>
              <li>
                <Link to="/csd/content" style={{ color: 'var(--brand)' }}>
                  Quartermaster General Circulars
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
