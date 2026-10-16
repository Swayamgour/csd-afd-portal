import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingState } from '../../components/common/States';
import { kbService } from '../../services/kb.service';

export const HelpdeskKnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', category: 'Payment', content: '', tags: '' });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        kbService.getArticles(),
        kbService.getCategories()
      ]);
      setArticles(artRes.data || []);
      setCategories(catRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val) => {
    setQuery(val);
    if (!val) {
      loadData();
      return;
    }
    const res = await kbService.searchArticles(val);
    setArticles(res.data || []);
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    await kbService.createArticle({
      ...newArticle,
      tags: newArticle.tags.split(',').map(t => t.trim()),
      views: 1,
      helpfulCount: 0
    });
    setShowCreateModal(false);
    setSuccessMsg('Knowledge Base article authored and published into staff repository.');
    loadData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredArticles = selectedCat === 'ALL'
    ? articles
    : articles.filter(a => a.category === selectedCat);

  return (
    <div className="helpdesk-kb-page">
      <PageHeader
        title="Knowledge Base Repository"
        subtitle="Standard operating procedures, policy guidelines, and citizen resolution templates"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Knowledge Base' }
        ]}
        actions={
          <Button onClick={() => setShowCreateModal(true)}>+ Publish New Article</Button>
        }
      />

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✓ {successMsg}</div>
      )}

      {/* TOP SEARCH HERO */}
      <Card style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0b1f3a, #16365f)', color: '#fff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '1rem 0' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.3rem' }}>How can we assist the citizen today?</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
            Search over 120 verified articles on AFD entitlements, SBI ePay UTR reconciliation, and delivery SOPs.
          </p>
          <SearchInput
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type keyword e.g. Challan, Chassis, Rank Ceiling, CSD Surcharge..."
          />
        </div>
      </Card>

      {/* CATEGORY FILTER PILLS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSelectedCat('ALL')}
          className="btn"
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            background: selectedCat === 'ALL' ? 'var(--navy)' : '#e2e8f0',
            color: selectedCat === 'ALL' ? '#fff' : '#1e293b',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          All Topics ({articles.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat.name}
            onClick={() => setSelectedCat(cat.name)}
            className="btn"
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              background: selectedCat === cat.name ? 'var(--navy)' : '#e2e8f0',
              color: selectedCat === cat.name ? '#fff' : '#1e293b',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {cat.name} ({cat.count || 4})
          </button>
        ))}
      </div>

      {/* ARTICLE GRID */}
      {loading ? (
        <LoadingState text="Loading certified operating guidelines..." />
      ) : filteredArticles.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '2rem 0' }}>
            No articles match your criteria. Try adjusting keywords or clear category filter.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredArticles.map((art) => (
            <Card key={art.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge" style={{ background: '#f1f5f9', color: 'var(--navy)', fontSize: '0.75rem' }}>
                  {art.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  👁 {art.views || 45} views
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>
                <Link to={`/helpdesk/knowledge-base/${art.id}`} style={{ color: 'var(--navy)' }}>
                  {art.title}
                </Link>
              </h4>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                {art.summary || (art.content ? art.content.slice(0, 120) + '...' : 'Operating guidelines & grievance protocols.')}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                  👍 {art.helpfulCount || 12} found helpful
                </span>
                <Link to={`/helpdesk/knowledge-base/${art.id}`}>
                  <Button variant="outline" size="sm">Read Article →</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE ARTICLE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Author Knowledge Article">
        <form onSubmit={handleCreateArticle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              { value: 'Technical', label: 'Technical & System Gateway' }
            ]}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Article Content / SOP Steps</label>
            <textarea
              rows={6}
              className="form-control"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              placeholder="Detail the root cause, standard steps for resolution, citizen advice, and escalation triggers..."
              value={newArticle.content}
              onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
              required
            />
          </div>
          <Input
            label="Search Tags (comma separated)"
            placeholder="utr, challan, sbi epay, double debit"
            value={newArticle.tags}
            onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Publish to Repository</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
