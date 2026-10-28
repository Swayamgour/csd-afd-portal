import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Plus,
  Edit2,
  Eye,
  Check,
  X,
  RefreshCw,
  Search,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetOemsQuery,
  useUpdateOemMutation,
} from '../org/orgApi.js';

export default function CsdOems() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: oems = [], isLoading: loading, isFetching: refreshing, refetch } = useGetOemsQuery();
  const [updateOem] = useUpdateOemMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOemForView, setSelectedOemForView] = useState(null);
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

  const handleToggleStatus = async (oem) => {
    try {
      const nextActive = !oem.active;
      await updateOem({
        id: oem._id || oem.id,
        active: nextActive,
      }).unwrap();
      showToast(`OEM "${oem.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      showToast('⚠️ ' + (err?.data?.message || err.message || 'Failed to toggle status'));
    }
  };

  const filteredOems = oems.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (o.name || '').toLowerCase().includes(q) ||
      (o.code || '').toLowerCase().includes(q) ||
      (o.person || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.city || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'OEM Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <strong className="csd-row-title">{row.name}</strong>
          <span className="csd-loc-secondary">GSTIN: {row.gstin || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Code',
      accessor: 'code',
      render: (row) => (
        <span className="csd-code-badge">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Contact Person',
      accessor: 'person',
      render: (row) => row.person || 'Institutional Officer',
    },
    {
      header: 'Official Email',
      accessor: 'email',
      render: (row) => row.email || '—',
    },
    {
      header: 'Mobile',
      accessor: 'phone',
      render: (row) => row.phone || '—',
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (row.city ? `${row.city}, ${row.state || ''}` : row.address || '—'),
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
            onClick={() => setSelectedOemForView(row)}
            className="csd-btn-action-view"
            title="Inspect OEM Profile"
          >
            <Eye size={13} /> View
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csd/oems/${row._id || row.id}/edit`)}
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
        title="Empaneled Original Equipment Manufacturers (OEMs)"
        subtitle="Automobile and white-goods manufacturers with valid Rate Contracts with CSD Head Office"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'OEMs' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync OEMs'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/csd/oems/new')}>
              <Plus size={14} className="mr-xs" /> Add New OEM
            </Button>
          </div>
        }
      />

      <Card
        title="Active OEM Registry"
        subtitle="Manufacturers authorized to supply AFD-I and AFD-II inventory through CSD Depots"
        actions={
          <div className="csd-search-wrap">
            <Search size={14} className="csd-search-icon-pos" />
            <input
              type="text"
              placeholder="Search OEM name, code, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={filteredOems}
          loading={loading}
          emptyText="No OEMs found in database. Click 'Add New OEM' to register one."
        />
      </Card>

      {/* OEM DETAILS INSPECTION INLINE CARD */}
      {selectedOemForView && (
        <Card className="mb-3 border-brand">
          <div className="card-header between mb-2">
            <div>
              <h3 className="card-title">OEM Profile: {selectedOemForView.name}</h3>
              <p className="micro muted">Corporate registration and institutional contact data</p>
            </div>
            <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedOemForView(null)}>
              Close
            </Button>
          </div>
          <div className="director-modal-form">
            <div className="csd-card-preview-box">
              <div className="csd-card-preview-header">
                <h3 className="csd-card-preview-title">{selectedOemForView.name}</h3>
                <span className={selectedOemForView.active ? 'csd-badge-active' : 'csd-badge-inactive'}>
                  {selectedOemForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="csd-subtext-muted">
                Code: <strong>{selectedOemForView.code}</strong>
                {selectedOemForView.vendorCode ? <> | Vendor Code: <strong>{selectedOemForView.vendorCode}</strong></> : null}
                {selectedOemForView.firmCode ? <> | Firm Code: <strong>{selectedOemForView.firmCode}</strong></> : null}
                {' '}| GSTIN: <strong>{selectedOemForView.gstin || selectedOemForView.gstNumber || 'N/A'}</strong>
                {selectedOemForView.panNumber ? <> | PAN: <strong>{selectedOemForView.panNumber}</strong></> : null}
              </div>
            </div>

            <div className="csd-preview-grid-2">
              <div>
                <span className="csd-preview-field-label">Institutional Head</span>
                <div className="csd-preview-field-value">
                  {selectedOemForView.person || selectedOemForView.contactPerson?.name || (typeof selectedOemForView.contactPerson === 'string' ? selectedOemForView.contactPerson : '') || '—'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Contact Mobile</span>
                <div className="csd-preview-field-value">
                  {selectedOemForView.phone || selectedOemForView.contactPerson?.phone || selectedOemForView.alternatePhone || '—'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Official Email</span>
                <div className="csd-preview-field-value">
                  {selectedOemForView.email || selectedOemForView.contactPerson?.email || '—'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Location / City</span>
                <div className="csd-preview-field-value">
                  {selectedOemForView.city
                    ? `${selectedOemForView.city}${selectedOemForView.state ? `, ${selectedOemForView.state}` : ''}${selectedOemForView.pincode ? ` - ${selectedOemForView.pincode}` : ''}`
                    : selectedOemForView.state || '—'}
                </div>
              </div>
            </div>

            {selectedOemForView.address && (
              <div>
                <span className="csd-preview-field-label">Plant / Head Office Address</span>
                <div className="csd-preview-field-value">{selectedOemForView.address}</div>
              </div>
            )}

            <div className="row gap-1 justify-end mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  const target = selectedOemForView;
                  setSelectedOemForView(null);
                  navigate(`/csd/oems/${target._id || target.id}/edit`);
                }}
              >
                <Edit2 size={13} className="mr-xs" /> Edit OEM
              </Button>
              <Button variant="primary" onClick={() => setSelectedOemForView(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
