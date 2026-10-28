import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
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
  Building,
  X,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetDepotsQuery,
  useUpdateDepotMutation,
} from '../org/orgApi.js';

export default function CsdDepots() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: depots = [], isLoading: loading, isFetching: refreshing, refetch } = useGetDepotsQuery();
  const [updateDepot] = useUpdateDepotMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepotForView, setSelectedDepotForView] = useState(null);
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

  const handleToggleStatus = async (depot) => {
    try {
      const nextActive = !depot.active;
      await updateDepot({
        id: depot._id || depot.id,
        active: nextActive,
      }).unwrap();
      showToast(`Depot "${depot.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      showToast('⚠️ ' + (err?.data?.message || err.message || 'Failed to toggle status'));
    }
  };

  const filteredDepots = depots.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.code || '').toLowerCase().includes(q) ||
      (d.city || '').toLowerCase().includes(q) ||
      (d.state || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Depot Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong className="csd-row-title">{row.name}</strong>
          <span className="csd-loc-secondary">{row.address || row.city}</span>
        </div>
      ),
    },
    {
      header: 'Depot Code',
      accessor: 'code',
      render: (row) => (
        <span className="csd-code-badge">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Price Zone',
      accessor: 'priceZoneId',
      render: (row) => {
        const zone = row.priceZoneId && typeof row.priceZoneId === 'object' ? row.priceZoneId : priceZones.find((z) => (z._id || z.id) === row.priceZoneId);
        return (
          <span className="portal-code-badge" style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
            {zone?.name || zone?.code || '—'}
          </span>
        );
      },
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
      header: 'Commanding Officer / Nodal',
      accessor: 'person',
      render: (row) => (
        <div>
          <span className="csd-contact-name">{row.person || 'Depot Manager'}</span>
          <span className="csd-contact-phone">{row.phone || row.email || ''}</span>
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
            onClick={() => setSelectedDepotForView(row)}
            className="csd-btn-action-view"
            title="Inspect Depot"
          >
            <Eye size={13} /> View
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csd/depots/${row._id || row.id}/edit`)}
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
        title="Regional CSD Depots Directorate"
        subtitle="Operational oversight of Area Depots managing regional AFD sanction queues and supply orders"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'Depots' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Depots'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/csd/depots/new')}>
              <Plus size={14} className="mr-xs" /> Add New Depot
            </Button>
          </div>
        }
      />

      <Card
        title="Regional Depot Roster"
        subtitle="Jurisdictional hubs executing demand sanctioning, payment verification, and Supply Order issuance"
        actions={
          <div className="csd-search-wrap">
            <Search size={14} className="csd-search-icon-pos" />
            <input
              type="text"
              placeholder="Search depot name, code, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredDepots}
          loading={loading}
          emptyText="No depots found. Click 'Add New Depot' to create one."
        />
      </Card>



      {/* DEPOT DETAILS INSPECTION INLINE CARD */}
      {selectedDepotForView && (
        <Card className="mb-3 border-brand">
          <div className="card-header between mb-2">
            <div>
              <h3 className="card-title">Depot Profile: {selectedDepotForView.name}</h3>
              <p className="micro muted">Reviewing depot jurisdiction and operational contact info</p>
            </div>
            <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedDepotForView(null)}>
              Close
            </Button>
          </div>
          <div className="director-modal-form">
            <div className="csd-card-preview-box">
              <div className="csd-card-preview-header">
                <h3 className="csd-card-preview-title">{selectedDepotForView.name}</h3>
                <span className={selectedDepotForView.active ? 'csd-badge-active' : 'csd-badge-inactive'}>
                  {selectedDepotForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="csd-subtext-muted">
                Code: <strong>{selectedDepotForView.code}</strong>
              </div>
            </div>

            <div className="csd-preview-grid-2">
              <div>
                <span className="csd-preview-field-label">Commanding Officer / Nodal</span>
                <div className="csd-preview-field-value">{selectedDepotForView.person || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Contact Phone</span>
                <div className="csd-preview-field-value">{selectedDepotForView.phone || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Official Email</span>
                <div className="csd-preview-field-value">{selectedDepotForView.email || '—'}</div>
              </div>
              <div>
                <span className="csd-preview-field-label">Jurisdiction</span>
                <div className="csd-preview-field-value">{selectedDepotForView.city ? `${selectedDepotForView.city}, ${selectedDepotForView.state || ''}` : '—'}</div>
              </div>
            </div>

            {selectedDepotForView.address && (
              <div>
                <span className="csd-preview-field-label">Premises Address</span>
                <div className="csd-preview-field-value">{selectedDepotForView.address}</div>
              </div>
            )}

            <div className="row gap-1 justify-end mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const target = selectedDepotForView;
                  setSelectedDepotForView(null);
                  navigate(`/csd/depots/${target._id || target.id}/edit`);
                }}
              >
                <Edit2 size={13} className="mr-xs" /> Edit Depot
              </Button>
              <Button variant="primary" onClick={() => setSelectedDepotForView(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
