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
        <div className="banner-thumb-container">
          <img
            src={row.imageUrl}
            alt={row.name}
            className="banner-thumb-img"
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
          <strong className="portal-profile-name">{row.name}</strong>
          {row.linkUrl && (
            <div className="portal-subtext-muted fs-xs mt-xs">
              <a
                href={row.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="portal-link-brand flex-align-center-gap-xs"
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
        return (
          <span className={`badge-pill badge-sm ${isHeader ? 'badge-info-subtle' : isHero ? 'badge-success-subtle-sm' : 'badge-slate-subtle-sm'}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Display Order',
      accessor: 'order',
      render: (row) => (
        <div className="flex-align-center-gap-xs font-semibold">
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
          <span className="badge-active-pill">
            <CheckCircle2 size={12} /> Active
          </span>
        ) : (
          <span className="badge-inactive-pill">
            <XCircle size={12} /> Inactive
          </span>
        ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="portal-flex-wrap-gap-xs flex-align-center-gap-xs">
          <Button
            size="sm"
            variant="outline"
            className={row.isActive ? 'btn-toggle-inactive' : 'btn-toggle-active'}
            onClick={() => handleToggle(row)}
            title="Toggle active display"
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="btn-action-edit-pill"
            onClick={() => openEditModal(row)}
            title="Edit Banner Details"
          >
            <Edit size={13} className="mr-xs" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="btn-action-delete-pill"
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
    <div className="admin-banners-page pb-3xl">
      {toast && (
        <div className="director-toast">
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
          <div className="portal-flex-align-center-gap-sm">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw
                size={14}
                className={`mr-xs ${isFetching ? 'spin' : ''}`}
              />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus size={14} className="mr-xs" /> Add Banner
            </Button>
          </div>
        }
      />

      {/* METRICS */}
      <div className="csd-stats-grid">
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
          <span className="portal-subtext-muted fs-sm">
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
          <form onSubmit={handleFormSubmit} className="director-modal-form">
            <div className="portal-form-group">
              <label className="director-field-label">
                Banner Name: <span className="doc-upload-required-star">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Indian Army / Republic Day Special / Hero Banner 1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="director-field-input"
              />
            </div>

            <div className="portal-form-group">
              <label className="director-field-label">
                Image URL or Path (e.g. /assets/home_page.png or https://...): <span className="doc-upload-required-star">*</span>
              </label>
              <input
                type="text"
                placeholder="/assets/home_page.png or https://.../banner.png"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
                className="director-field-input"
              />
            </div>

            {/* LIVE PREVIEW BOX */}
            {formData.imageUrl && (
              <div className="banner-preview-box mb-sm">
                <div className="portal-subtext-muted fs-xs mb-xs">
                  Live Image Preview
                </div>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="banner-preview-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="checkout-form-row-2 mb-sm">
              <div>
                <label className="director-field-label">
                  Position / Slot:
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="director-field-input"
                >
                  <option value="forces_header">Top Header Forces Logo</option>
                  <option value="home_hero">Home Hero Slider</option>
                  <option value="home_footer">Home Footer Banner</option>
                  <option value="general">General / Global</option>
                </select>
              </div>

              <div>
                <label className="director-field-label">
                  Display Order:
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div className="portal-form-group">
              <label className="director-field-label">
                Destination Link URL (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. /products?cat=car or https://..."
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="director-field-input"
              />
            </div>

            <div className="flex-align-center-gap-sm mb-md">
              <input
                type="checkbox"
                id="isActiveCheckbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="checkbox-sm"
              />
              <label htmlFor="isActiveCheckbox" className="label-checkbox">
                Enable banner on public storefront immediately
              </label>
            </div>

            <div className="portal-flex-end gap-sm">
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
          <div className="flex-align-center-gap-sm mb-md">
            <AlertTriangle size={24} className="text-danger flex-shrink-0" />
            <div>
              <p className="portal-profile-name mb-xs">
                Are you sure you want to delete banner <strong>"{deleteModalBanner.name}"</strong>?
              </p>
              <p className="portal-subtext-muted fs-xs m-0">
                This graphic will immediately stop appearing on the portal.
              </p>
            </div>
          </div>
          <div className="portal-flex-end gap-sm">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalBanner(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="portal-btn-deny-danger"
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
