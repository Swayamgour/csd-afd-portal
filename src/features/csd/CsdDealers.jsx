import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  useGetDealersQuery,
  useGetOemsQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
} from '../org/orgApi.js';

export default function CsdDealers() {
  const navigate = useNavigate();
  const { data: dealers = [], isLoading: loading, isFetching: refreshing, refetch } = useGetDealersQuery();
  const { data: oems = [] } = useGetOemsQuery({ active: true });
  const [createDealer, { isLoading: isCreating }] = useCreateDealerMutation();
  const [updateDealer, { isLoading: isUpdating }] = useUpdateDealerMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDealerForEdit, setSelectedDealerForEdit] = useState(null);
  const [selectedDealerForView, setSelectedDealerForView] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    oemId: '',
    name: '',
    code: '',
    person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    active: true,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleOpenAdd = () => {
    setFormData({
      oemId: oems[0]?._id || '',
      name: '',
      code: '',
      person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstin: '',
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dealer) => {
    setSelectedDealerForEdit(dealer);
    setFormData({
      oemId: dealer.oemId?._id || dealer.oemId || '',
      name: dealer.name || '',
      code: dealer.code || '',
      person: dealer.person || '',
      email: dealer.email || '',
      phone: dealer.phone || '',
      address: dealer.address || '',
      city: dealer.city || '',
      state: dealer.state || '',
      pincode: dealer.pincode || '',
      gstin: dealer.gstin || '',
      active: dealer.active ?? true,
    });
  };

  const handleSaveDealer = async (e) => {
    e.preventDefault();
    if (!formData.oemId) {
      alert('Dealer must be assigned to an authorized Manufacturer (OEM).');
      return;
    }

    try {
      if (selectedDealerForEdit) {
        await updateDealer({
          id: selectedDealerForEdit._id || selectedDealerForEdit.id,
          ...formData,
        }).unwrap();
        showToast(`✓ Dealership "${formData.name}" successfully updated.`);
        setSelectedDealerForEdit(null);
      } else {
        await createDealer(formData).unwrap();
        showToast(`✓ Dealership "${formData.name}" registered under OEM.`);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to save Dealer record');
    }
  };

  const handleToggleStatus = async (dealer) => {
    try {
      const nextActive = !dealer.active;
      await updateDealer({
        id: dealer._id || dealer.id,
        active: nextActive,
      }).unwrap();
      showToast(`Dealership "${dealer.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to toggle status');
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
          <strong className="csd-row-title">{row.name}</strong>
          <span className="csd-subtext-muted">
            <Building2 size={12} color="#6366f1" />
            OEM: <strong>{row.oemId?.name || 'Assigned OEM'}</strong>
          </span>
        </div>
      ),
    },
    {
      header: 'Dealer Code',
      accessor: 'code',
      render: (row) => (
        <span className="csd-code-badge">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Jurisdiction & City',
      accessor: 'city',
      render: (row) => (
        <div>
          <span className="csd-loc-primary">{row.city || '—'}</span>
          <span className="csd-loc-secondary">{row.state || ''}</span>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      accessor: 'person',
      render: (row) => (
        <div>
          <span className="csd-contact-name">{row.person || 'Nodal Officer'}</span>
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
            onClick={() => navigate('/csd/dealer-products')}
            className="csd-btn-action-view"
            title="Authorize Products (DealerProduct Matrix)"
            style={{ color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}
          >
            <ShieldCheck size={13} /> Products
          </button>
          <button
            type="button"
            onClick={() => setSelectedDealerForView(row)}
            className="csd-btn-action-view"
            title="Inspect Dealership"
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
        title="Authorized Dealership Network"
        subtitle="Zero-handling fee delivery showrooms affiliated with authorized OEM manufacturers"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'Dealers' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Dealers'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
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
              className="csd-search-field-input director-field-input"
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

      {/* CREATE / EDIT DEALER MODAL */}
      {(isAddModalOpen || selectedDealerForEdit) && (
        <Modal
          title={selectedDealerForEdit ? `Edit Dealer: ${selectedDealerForEdit.name}` : 'Register Authorized Dealership'}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDealerForEdit(null);
          }}
        >
          <form onSubmit={handleSaveDealer} className="director-modal-form">
            <div>
              <label className="director-field-label">
                Select Affiliated OEM / Manufacturer *
              </label>
              <select
                required
                value={formData.oemId}
                onChange={(e) => setFormData({ ...formData, oemId: e.target.value })}
                className="director-field-input"
              >
                <option value="">-- Choose OEM Manufacturer --</option>
                {oems.map((o) => (
                  <option key={o._id || o.id} value={o._id || o.id}>
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
              <span className="csd-loc-secondary">
                * Dealerships must belong to an active OEM in CSD master records.
              </span>
            </div>

            <div className="csd-form-grid-2-1">
              <div>
                <label className="director-field-label">
                  Dealership Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AAA Vehicleades Pvt. Ltd. Mundka"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  Dealer Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLR-101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div className="csd-form-grid-3">
              <div>
                <label className="director-field-label">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="Showroom Manager"
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
                  placeholder="dealer@dealership.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Contact Mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div>
              <label className="director-field-label">
                Showroom Address
              </label>
              <input
                type="text"
                placeholder="Full Street Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="director-field-input"
              />
            </div>

            <div className="csd-form-grid-3">
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
              <div>
                <label className="director-field-label">
                  PIN Code
                </label>
                <input
                  type="text"
                  placeholder="6-digit PIN"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div className="portal-flex-wrap-gap-sm">
              <input
                type="checkbox"
                id="dealerActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="dealerActive" className="director-field-label">
                Active for Beneficiary Delivery Selection
              </label>
            </div>

            <div className="director-modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedDealerForEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : selectedDealerForEdit ? 'Update Dealer' : 'Register Dealer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DEALER DETAILS INSPECTION MODAL */}
      {selectedDealerForView && (
        <Modal
          title={`Dealership Profile: ${selectedDealerForView.name}`}
          onClose={() => setSelectedDealerForView(null)}
        >
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

            <div className="director-modal-actions">
              <Button variant="outline" onClick={() => setSelectedDealerForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
