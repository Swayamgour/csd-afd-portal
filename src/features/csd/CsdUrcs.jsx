import React, { useState } from 'react';
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
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  useGetUrcsQuery,
  useGetDepotsQuery,
  useCreateUrcMutation,
  useUpdateUrcMutation,
} from '../org/orgApi.js';

export default function CsdUrcs() {
  const { data: urcs = [], isLoading: loading, isFetching: refreshing, refetch } = useGetUrcsQuery();
  const { data: depots = [] } = useGetDepotsQuery({ active: true });
  const [createUrc, { isLoading: isCreating }] = useCreateUrcMutation();
  const [updateUrc, { isLoading: isUpdating }] = useUpdateUrcMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUrcForEdit, setSelectedUrcForEdit] = useState(null);
  const [selectedUrcForView, setSelectedUrcForView] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    depotId: '',
    name: '',
    code: '',
    person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    active: true,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleOpenAdd = () => {
    setFormData({
      depotId: depots[0]?._id || '',
      name: '',
      code: '',
      person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (urc) => {
    setSelectedUrcForEdit(urc);
    setFormData({
      depotId: urc.depotId?._id || urc.depotId || '',
      name: urc.name || '',
      code: urc.code || '',
      person: urc.person || '',
      email: urc.email || '',
      phone: urc.phone || '',
      address: urc.address || '',
      city: urc.city || '',
      state: urc.state || '',
      active: urc.active ?? true,
    });
  };

  const handleSaveUrc = async (e) => {
    e.preventDefault();
    if (!formData.depotId) {
      alert('URC must be operationally associated with an active Regional Depot.');
      return;
    }

    try {
      if (selectedUrcForEdit) {
        await updateUrc({
          id: selectedUrcForEdit._id || selectedUrcForEdit.id,
          ...formData,
        }).unwrap();
        showToast(`✓ Station Canteen "${formData.name}" successfully updated.`);
        setSelectedUrcForEdit(null);
      } else {
        await createUrc(formData).unwrap();
        showToast(`✓ Station Canteen "${formData.name}" registered under Parent Depot.`);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to save URC record');
    }
  };

  const handleToggleStatus = async (urc) => {
    try {
      const nextActive = !urc.active;
      await updateUrc({
        id: urc._id || urc.id,
        active: nextActive,
      }).unwrap();
      showToast(`URC "${urc.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to toggle status');
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
            onClick={() => handleOpenEdit(row)}
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
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
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
              className="csd-search-field-input director-field-input"
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

      {/* CREATE / EDIT URC MODAL */}
      {(isAddModalOpen || selectedUrcForEdit) && (
        <Modal
          title={selectedUrcForEdit ? `Edit URC: ${selectedUrcForEdit.name}` : 'Register Unit Run Canteen (URC)'}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedUrcForEdit(null);
          }}
        >
          <form onSubmit={handleSaveUrc} className="director-modal-form">
            <div>
              <label className="director-field-label">
                Select Parent Regional Depot *
              </label>
              <select
                required
                value={formData.depotId}
                onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                className="director-field-input"
              >
                <option value="">-- Choose Parent Depot --</option>
                {depots.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              <span className="csd-loc-secondary">
                * URC is operationally attached to this CSD Depot for supply chain dispatch.
              </span>
            </div>

            <div className="csd-form-grid-2-1">
              <div>
                <label className="director-field-label">
                  URC Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 WING AF CANTEEN"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  URC Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URC-7AF"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div className="csd-form-grid-3">
              <div>
                <label className="director-field-label">
                  Officer-in-Charge
                </label>
                <input
                  type="text"
                  placeholder="Canteen Officer"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="urc@station.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="Canteen Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div>
              <label className="director-field-label">
                Station Address
              </label>
              <input
                type="text"
                placeholder="Military Base / Station Location"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="director-field-input"
              />
            </div>

            <div className="csd-form-grid-2">
              <div>
                <label className="director-field-label">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div className="portal-flex-wrap-gap-sm">
              <input
                type="checkbox"
                id="urcActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="urcActive" className="director-field-label">
                Operational & Open for Beneficiary Deliveries
              </label>
            </div>

            <div className="director-modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedUrcForEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : selectedUrcForEdit ? 'Update URC' : 'Register URC'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* URC DETAILS INSPECTION MODAL */}
      {selectedUrcForView && (
        <Modal
          title={`URC Station Profile: ${selectedUrcForView.name}`}
          onClose={() => setSelectedUrcForView(null)}
        >
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

            <div className="director-modal-actions">
              <Button variant="outline" onClick={() => setSelectedUrcForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
