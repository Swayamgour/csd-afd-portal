import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Warehouse,
  CheckCircle2,
  Plus,
  Edit2,
  Eye,
  RefreshCw,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetUrcsQuery,
  useUpdateUrcMutation,
} from '../org/orgApi.js';

export default function CsdUrcs() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: urcs = [], isLoading: loading, isFetching: refreshing, refetch } = useGetUrcsQuery();
  const [updateUrc] = useUpdateUrcMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrcForView, setSelectedUrcForView] = useState(null);
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

  const handleToggleStatus = async (urc) => {
    try {
      const nextActive = !urc.active;
      await updateUrc({
        id: urc._id || urc.id,
        active: nextActive,
      }).unwrap();
      showToast(`URC "${urc.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      showToast('⚠️ ' + (err?.data?.message || err.message || 'Failed to toggle status'));
    }
  };

  const filteredUrcs = urcs.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const depotName = u.depotId?.name || '';
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.code || '').toLowerCase().includes(q) ||
      (u.city || '').toLowerCase().includes(q) ||
      depotName.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Station Canteen (URC)',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong className="csd-row-title">{row.name}</strong>
          <span className="csd-subtext-muted">
            <Warehouse size={12} color="#0d9488" />
            Parent Depot: <strong>{row.depotId?.name || 'Attached Depot'}</strong>
          </span>
        </div>
      ),
    },
    {
      header: 'URC Code',
      accessor: 'code',
      render: (row) => (
        <span className="csd-code-badge">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Location / State',
      accessor: 'city',
      render: (row) => (
        <div>
          <span className="csd-loc-primary">{row.city || '—'}</span>
          <span className="csd-loc-secondary">{row.state || ''}</span>
        </div>
      ),
    },
    {
      header: 'Officer-in-Charge / Contact',
      accessor: 'person',
      render: (row) => (
        <div>
          <span className="csd-contact-name">{row.person || 'Canteen Officer'}</span>
          <span className="csd-contact-phone">{row.phone || ''}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (row) => (
        <span className={row.active ? 'csd-badge-active' : 'csd-badge-inactive'}>
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
            onClick={() => setSelectedUrcForView(row)}
            className="csd-btn-action-view"
            title="Inspect URC"
          >
            <Eye size={13} /> View
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csd/urcs/${row._id || row.id}/edit`)}
            className="csd-btn-action-edit"
            title="Edit Details"
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className={row.active ? 'csd-btn-action-delete' : 'csd-btn-action-view'}
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
        title="Unit Run Canteen (URC) Management"
        subtitle="Military station delivery checkpoints affiliated with Regional CSD Supply Depots"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'URCs' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync URCs'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/csd/urcs/new')}>
              <Plus size={14} className="mr-xs" /> Add New URC
            </Button>
          </div>
        }
      />

      <Card
        title="Operational URC Roster"
        subtitle="Base and station canteens authorized for beneficiary order receipt and completion"
        actions={
          <div className="csd-search-wrap">
            <Search size={14} className="csd-search-icon-pos" />
            <input
              type="text"
              placeholder="Search URC name, code, depot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredUrcs}
          loading={loading}
          emptyText="No URCs found. Click 'Add New URC' to create one."
        />
      </Card>



      {/* URC DETAILS INSPECTION INLINE CARD */}
      {selectedUrcForView && (
        <Card className="mb-3 border-brand">
          <div className="card-header between mb-2">
            <div>
              <h3 className="card-title">URC Station Profile: {selectedUrcForView.name}</h3>
              <p className="micro muted">Reviewing URC base details and parent supply depot attachment</p>
            </div>
            <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedUrcForView(null)}>
              Close
            </Button>
          </div>
          <div className="director-modal-form">
            <div className="csd-card-preview-box">
              <div className="csd-card-preview-header">
                <h3 className="csd-card-preview-title">{selectedUrcForView.name}</h3>
                <span className={selectedUrcForView.active ? 'csd-badge-active' : 'csd-badge-inactive'}>
                  {selectedUrcForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="csd-subtext-muted">
                <span>Code: <strong>{selectedUrcForView.code}</strong></span>
                <span>Parent Depot: <strong>{selectedUrcForView.depotId?.name || 'Attached Depot'}</strong></span>
              </div>
            </div>

            <div className="csd-preview-grid-2">
              <div>
                <span className="csd-preview-field-label">Officer-in-Charge</span>
                <div className="csd-preview-field-value">{selectedUrcForView.person || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Phone</span>
                <div className="csd-preview-field-value">{selectedUrcForView.phone || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Email</span>
                <div className="csd-preview-field-value">{selectedUrcForView.email || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Station Location</span>
                <div className="csd-preview-field-value">{selectedUrcForView.city ? `${selectedUrcForView.city}, ${selectedUrcForView.state || ''}` : '—'}</div>
              </div>
            </div>

            {selectedUrcForView.address && (
              <div>
                <span className="csd-preview-field-label">Address</span>
                <div className="csd-preview-field-value">{selectedUrcForView.address}</div>
              </div>
            )}

            <div className="row gap-1 justify-end mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const target = selectedUrcForView;
                  setSelectedUrcForView(null);
                  navigate(`/csd/urcs/${target._id || target.id}/edit`);
                }}
              >
                <Edit2 size={13} className="mr-xs" /> Edit URC
              </Button>
              <Button variant="primary" onClick={() => setSelectedUrcForView(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
