import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { Card } from '../../components/common/Card.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  useGetAllAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
} from './adminApi.js';
import {
  Image,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

export default function AdminBanners() {
  const {
    data: banners = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllAdminBannersQuery();

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleBannerStatusMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const [toast, setToast] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteModalBanner, setDeleteModalBanner] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    linkUrl: '',
    position: 'forces_header',
    order: 1,
    isActive: true,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      name: '',
      imageUrl: '',
      linkUrl: '',
      position: 'forces_header',
      order: (banners?.length || 0) + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      name: b.name || '',
      imageUrl: b.imageUrl || '',
      linkUrl: b.linkUrl || '',
      position: b.position || 'forces_header',
      order: b.order !== undefined ? b.order : 0,
      isActive: b.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.imageUrl.trim()) {
      alert('Please provide banner name and image URL.');
      return;
    }

    try {
      if (editingBanner) {
        await updateBanner({
          id: editingBanner._id || editingBanner.id,
          ...formData,
        }).unwrap();
        showToast('✓ Banner updated successfully!');
      } else {
        await createBanner(formData).unwrap();
        showToast('✓ New banner created successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleToggle = async (b) => {
    try {
      await toggleStatus({
        id: b._id || b.id,
        isActive: !b.isActive,
      }).unwrap();
      showToast(`✓ Banner "${b.name}" ${!b.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalBanner) return;
    try {
      await deleteBanner(deleteModalBanner._id || deleteModalBanner.id).unwrap();
      showToast(`✓ Banner "${deleteModalBanner.name}" deleted successfully.`);
      setDeleteModalBanner(null);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to delete banner');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => b.isActive).length;
    const headerForces = banners.filter((b) => b.position === 'forces_header').length;
    const heroBanners = banners.filter((b) => b.position === 'home_hero').length;
    return { total, active, headerForces, heroBanners };
  }, [banners]);

  const columns = [
    {
      header: 'Preview',
      accessor: 'imageUrl',
      render: (row) => (
        <div
          style={{
            width: '64px',
            height: '42px',
            borderRadius: '6px',
            background: '#0b1f3a',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
          }}
        >
          <img
            src={row.imageUrl}
            alt={row.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ),
    },
    {
      header: 'Banner Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{row.name}</strong>
          {row.linkUrl && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
              <a
                href={row.linkUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#1e4fd8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <span>Link Target</span> <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Placement / Slot',
      accessor: 'position',
      render: (row) => {
        const isHeader = row.position === 'forces_header';
        const isHero = row.position === 'home_hero';
        const label = isHeader ? 'Top Header Forces' : isHero ? 'Home Hero Slider' : row.position;
        const bg = isHeader ? '#eff6ff' : isHero ? '#f0fdf4' : '#f1f5f9';
        const color = isHeader ? '#1d4ed8' : isHero ? '#15803d' : '#475569';
        const border = isHeader ? '#bfdbfe' : isHero ? '#bbf7d0' : '#cbd5e1';
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: bg,
              color: color,
              border: `1px solid ${border}`,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: 'Display Order',
      accessor: 'order',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <ArrowUpDown size={13} className="text-muted" />
          <span>#{row.order || 0}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) =>
        row.isActive ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#15803d',
              background: '#dcfce7',
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle2 size={12} /> Active
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#991b1b',
              background: '#fee2e2',
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              border: '1px solid #fecaca',
            }}
          >
            <XCircle size={12} /> Inactive
          </span>
        ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="outline"
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.55rem',
              color: row.isActive ? '#d97706' : '#16a34a',
              borderColor: row.isActive ? '#fde68a' : '#bbf7d0',
            }}
            onClick={() => handleToggle(row)}
            title="Toggle active display"
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
            onClick={() => openEditModal(row)}
            title="Edit Banner Details"
          >
            <Edit size={13} style={{ marginRight: '0.25rem' }} /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', color: '#dc2626', borderColor: '#fca5a5' }}
            onClick={() => setDeleteModalBanner(row)}
            title="Delete Banner"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-banners-page" style={{ paddingBottom: '3rem' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            background: '#15803d',
            color: '#fff',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      <PageHeader
        title="Banner & Forces Logo Management"
        subtitle="Manage dynamic banner graphics and Armed Forces logos rendered across the public storefront and header"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Banners' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw
                size={14}
                style={{
                  marginRight: '0.35rem',
                  animation: isFetching ? 'spin 1s linear infinite' : 'none',
                }}
              />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus size={14} style={{ marginRight: '0.35rem' }} /> Add Banner
            </Button>
          </div>
        }
      />

      {/* METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          title="Total Banners"
          value={String(metrics.total)}
          subtitle="All registered graphics"
          isPositive={true}
        />
        <StatCard
          title="Active On Site"
          value={String(metrics.active)}
          subtitle="Currently visible to visitors"
          isPositive={metrics.active > 0}
        />
        <StatCard
          title="Forces Header Logos"
          value={String(metrics.headerForces)}
          subtitle="Rendered in top navigation bar"
          isPositive={true}
        />
        <StatCard
          title="Home Hero Sliders"
          value={String(metrics.heroBanners)}
          subtitle="Rendered in home background slider"
          isPositive={true}
        />
      </div>

      {/* MAIN BANNER LIST CARD */}
      <Card
        title="Portal Banners & Placement Directory"
        actions={
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {banners.length} banners configured
          </span>
        }
      >
        <DataTable
          columns={columns}
          data={banners}
          loading={isLoading}
          emptyText="No banners found. Click 'Add Banner' to create one."
        />
      </Card>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingBanner ? `Edit Banner: ${editingBanner.name}` : 'Add New Banner'}
          subtitle="Enter image URL/path and placement settings for dynamic portal display"
          maxWidth="560px"
        >
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Banner Name: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Indian Army / Republic Day Special / Hero Banner 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Image URL or Path (e.g. /assets/home_page.png or https://...): <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="/assets/home_page.png or https://.../banner.png"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            {/* LIVE PREVIEW BOX */}
            {formData.imageUrl && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: '#0b1f3a',
                  border: '1px solid #334155',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Live Image Preview
                </div>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Position / Slot:
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                  }}
                >
                  <option value="forces_header">Top Header Forces Logo</option>
                  <option value="home_hero">Home Hero Slider</option>
                  <option value="home_footer">Home Footer Banner</option>
                  <option value="general">General / Global</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Display Order:
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Destination Link URL (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. /products?cat=car or https://..."
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="isActiveCheckbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="isActiveCheckbox" style={{ fontSize: '0.85rem', color: '#1e293b', cursor: 'pointer' }}>
                Enable banner on public storefront immediately
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Banner'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalBanner && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModalBanner(null)}
          title="Delete Banner"
          maxWidth="460px"
        >
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={24} className="text-danger flex-shrink-0" />
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#1e293b' }}>
                Are you sure you want to delete banner <strong>"{deleteModalBanner.name}"</strong>?
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                This graphic will immediately stop appearing on the portal.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalBanner(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              style={{ background: '#dc2626', color: '#fff', border: 'none', fontWeight: 600 }}
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
