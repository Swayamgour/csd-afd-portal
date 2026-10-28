import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Store,
  Building2,
  CheckCircle2,
  Plus,
  Edit2,
  Eye,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetDealersQuery,
  useGetOemsQuery,
  useUpdateDealerMutation,
} from '../org/orgApi.js';

export default function CsdDealers() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: dealers = [], isLoading: loading, isFetching: refreshing, refetch } = useGetDealersQuery();
  const { data: oems = [] } = useGetOemsQuery({ active: true });
  const [updateDealer] = useUpdateDealerMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealerForView, setSelectedDealerForView] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleToggleStatus = async (dealer) => {
    try {
      const nextActive = !dealer.active;
      await updateDealer({
        id: dealer._id || dealer.id,
        active: nextActive,
      }).unwrap();
      showToast(`Dealership "${dealer.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      showToast('⚠️ ' + (err?.data?.message || err.message || 'Failed to toggle status'));
    }
  };

  const filteredDealers = dealers.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const oemName = d.oemId?.name || '';
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.code || '').toLowerCase().includes(q) ||
      (d.city || '').toLowerCase().includes(q) ||
      (d.state || '').toLowerCase().includes(q) ||
      oemName.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Showroom / Dealership',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong className="csd-row-title">
            {row.name || '—'}
          </strong>
        </div>
      ),
    },

    {
      header: 'Dealer Code',
      accessor: 'code',
      render: (row) => (
        <span className="csd-code-badge">
          {row.code || '—'}
        </span>
      ),
    },

    {
      header: 'OEM',
      accessor: 'oemId',
      render: (row) => (
        <div>
          <span className="csd-loc-primary">
            {row.oemId?.name || '—'}
          </span>

          {row.oemId?.code && (
            <span className="csd-loc-secondary">
              {row.oemId.code}
            </span>
          )}
        </div>
      ),
    },

    {
      header: 'Jurisdiction & City',
      accessor: 'city',
      render: (row) => (
        <div>
          <span className="csd-loc-primary">
            {row.city || '—'}
          </span>

          <span className="csd-loc-secondary">
            {row.state || '—'}
          </span>
        </div>
      ),
    },

    {
      header: 'Contact Person',
      accessor: 'person',
      render: (row) => (
        <div>
          <span className="csd-contact-name">
            {row.person || 'Nodal Officer'}
          </span>

          <span className="csd-contact-phone">
            {row.phone || '—'}
          </span>
        </div>
      ),
    },

    {
      header: 'Status',
      accessor: 'active',
      render: (row) => (
        <span
          className={
            row.active
              ? 'csd-badge-active'
              : 'csd-badge-inactive'
          }
        >
          {row.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },

    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="csd-action-row">
          <button
            type="button"
            onClick={() => navigate('/csd/dealer-products')}
            className="csd-btn-action-view"
            title="Authorize Products (DealerProduct Matrix)"
            style={{
              color: '#047857',
              borderColor: '#a7f3d0',
              background: '#ecfdf5',
            }}
          >
            <ShieldCheck size={13} />
            Products
          </button>

          <button
            type="button"
            onClick={() => setSelectedDealerForView(row)}
            className="csd-btn-action-view"
            title="Inspect Dealership"
          >
            <Eye size={13} />
            View
          </button>

          <button
            type="button"
            onClick={() => navigate(`/csd/dealers/${row._id || row.id}/edit`)}
            className="csd-btn-action-edit"
            title="Edit Details"
          >
            <Edit2 size={13} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className={
              row.active
                ? 'csd-btn-action-delete'
                : 'csd-btn-action-view'
            }
          >
            {row.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="csd-module-page">
      {toastMessage && (
        <div className="portal-toast-fixed">
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      <PageHeader
        title="Authorized Dealership Network"
        subtitle="Zero-handling fee delivery showrooms affiliated with authorized OEM manufacturers"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'Dealers' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Dealers'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/csd/dealers/new')}>
              <Plus size={14} className="mr-xs" /> Add New Dealer
            </Button>
          </div>
        }
      />

      <Card
        title="Dealer Network Roster"
        subtitle="Empaneled delivery points across all national price zones"
        actions={
          <div className="csd-search-wrap">
            <Search size={14} className="csd-search-icon-pos" />
            <input
              type="text"
              placeholder="Search dealer name, city, OEM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredDealers}
          loading={loading}
          emptyText="No dealerships registered yet. Click 'Add New Dealer' to register."
        />
      </Card>



      {/* DEALER DETAILS INSPECTION INLINE CARD */}
      {selectedDealerForView && (
        <Card className="mb-3 border-brand">
          <div className="card-header between mb-2">
            <div>
              <h3 className="card-title">Dealership Profile: {selectedDealerForView.name}</h3>
              <p className="micro muted">Inspecting dealer credentials and registered address</p>
            </div>
            <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedDealerForView(null)}>
              Close
            </Button>
          </div>
          <div className="director-modal-form">
            <div className="csd-card-preview-box">
              <div className="csd-card-preview-header">
                <h3 className="csd-card-preview-title">{selectedDealerForView.name}</h3>
                <span className={selectedDealerForView.active ? 'csd-badge-active' : 'csd-badge-inactive'}>
                  {selectedDealerForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="csd-subtext-muted">
                <span>Code: <strong>{selectedDealerForView.code}</strong></span>
                <span>OEM: <strong>{selectedDealerForView.oemId?.name || 'Authorized OEM'}</strong></span>
              </div>
            </div>

            <div className="csd-preview-grid-2">
              <div>
                <span className="csd-preview-field-label">Nodal Manager</span>
                <div className="csd-preview-field-value">{selectedDealerForView.person || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Phone Number</span>
                <div className="csd-preview-field-value">{selectedDealerForView.phone || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Official Email</span>
                <div className="csd-preview-field-value">{selectedDealerForView.email || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Station / City</span>
                <div className="csd-preview-field-value">{selectedDealerForView.city ? `${selectedDealerForView.city}, ${selectedDealerForView.state || ''}` : '—'}</div>
              </div>
            </div>

            {selectedDealerForView.address && (
              <div>
                <span className="csd-preview-field-label">Showroom Address</span>
                <div className="csd-preview-field-value">{selectedDealerForView.address}</div>
              </div>
            )}

            <div className="row gap-1 justify-end mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const target = selectedDealerForView;
                  setSelectedDealerForView(null);
                  navigate(`/csd/dealers/${target._id || target.id}/edit`);
                }}
              >
                <Edit2 size={13} className="mr-xs" /> Edit Dealer
              </Button>
              <Button variant="primary" onClick={() => setSelectedDealerForView(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
