import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingState } from '../../components/common/States';
import { useGetKbArticlesQuery, useCreateKbArticleMutation } from './ticketApi';

export const HelpdeskKnowledgeBase = () => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', category: 'Payment', content: '', tags: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const { data: articlesData, isLoading: loading, isFetching, refetch } = useGetKbArticlesQuery(
    query ? { q: query } : undefined
  );
  const [createKbArticle, { isLoading: isPublishing }] = useCreateKbArticleMutation();

  const articles = Array.isArray(articlesData)
    ? articlesData
    : Array.isArray(articlesData?.items)
    ? articlesData.items
    : [];

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      await createKbArticle({
        title: newArticle.title,
        category: newArticle.category,
        content: newArticle.content,
        keywords: newArticle.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: 'PUBLISHED',
      }).unwrap();

      setShowCreateModal(false);
      setNewArticle({ title: '', category: 'Payment', content: '', tags: '' });
      setSuccessMsg('Knowledge Base article authored and published into staff repository.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to author article');
    }
  };

  const filteredArticles = selectedCat === 'ALL'
    ? articles
    : articles.filter((a) => a.category === selectedCat);

  return (
    <div className="helpdesk-kb-page">
      <PageHeader
        title="Knowledge Base Repository"
        subtitle="Standard operating procedures, policy guidelines, and citizen resolution templates"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Knowledge Base' },
        ]}
        actions={
          <div className="portal-flex-gap-sm">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>+ Publish New Article</Button>
          </div>
        }
      />

      {successMsg && (
        <div className="alert alert-success mb-md">✓ {successMsg}</div>
      )}

      {/* TOP SEARCH HERO */}
      <Card className="helpdesk-kb-hero-card">
        <div className="helpdesk-kb-hero-inner">
          <h3 className="helpdesk-kb-hero-title">How can we assist the citizen today?</h3>
          <p className="helpdesk-kb-hero-sub">
            Search verified articles on AFD entitlements, SBI ePay UTR reconciliation, and delivery SOPs.
          </p>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type keyword e.g. Challan, Chassis, Rank Ceiling, CSD Surcharge..."
          />
        </div>
      </Card>

      {/* ARTICLE GRID */}
      {loading ? (
        <LoadingState text="Loading certified operating guidelines..." />
      ) : filteredArticles.length === 0 ? (
        <Card>
          <p className="csd-notif-empty">
            No articles match your criteria. Try adjusting keywords or publish an article.
          </p>
        </Card>
      ) : (
        <div className="helpdesk-kb-grid">
          {filteredArticles.map((art) => (
            <Card key={art._id || art.id}>
              <div className="portal-flex-between mb-xs">
                <span className="badge csd-badge-notif">
                  {art.category || 'General'}
                </span>
                <span className="csd-notif-date">
                  v{art.version || 1}
                </span>
              </div>
              <h4 className="helpdesk-article-card-title">
                <Link to={`/helpdesk/knowledge-base/${art._id || art.id}`} className="helpdesk-article-link">
                  {art.title}
                </Link>
              </h4>
              <p className="helpdesk-article-snippet">
                {art.content ? art.content.slice(0, 140) + '...' : 'Operating guidelines & grievance protocols.'}
              </p>
              <div className="helpdesk-article-footer">
                <span className="sla-compliant-text">
                  Status: {art.status || 'PUBLISHED'}
                </span>
                <Link to={`/helpdesk/knowledge-base/${art._id || art.id}`}>
                  <Button variant="outline" size="sm">Read Article →</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE ARTICLE INLINE SECTION */}
      {showCreateModal && (
        <Card
          className="mt-4 border-primary"
          title="Author Knowledge Article"
          subtitle="Standard Operating Procedure & Troubleshooting Guide for Beneficiaries"
          headerAction={
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          }
        >
          <form onSubmit={handleCreateArticle} className="space-y-4">
            <Input
              label="Article Title"
              placeholder="e.g. Procedure for Manual UTR Reconciliation with SBI ePay"
              value={newArticle.title}
              onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={newArticle.category}
              onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
              options={[
                { value: 'Payment', label: 'Payment & Treasury' },
                { value: 'Eligibility', label: 'Eligibility & Pay Levels' },
                { value: 'Demands', label: 'Demand Approval & Sanction' },
                { value: 'Delivery', label: 'Dealer Delivery & Inspection' },
                { value: 'Technical', label: 'Technical & System Gateway' },
              ]}
            />
            <div className="form-field">
              <label className="form-label">Article Content / SOP Steps</label>
              <textarea
                rows={6}
                className="form-control"
                placeholder="Detail the root cause, standard steps for resolution, citizen advice, and escalation triggers..."
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                required
              />
            </div>
            <Input
              label="Search Keywords (comma separated)"
              placeholder="utr, challan, sbi epay, double debit"
              value={newArticle.tags}
              onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isPublishing}>
                Publish to Repository
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default HelpdeskKnowledgeBase;
