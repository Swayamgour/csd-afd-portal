import React, { useState } from 'react';
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
import { Modal } from '../../components/common/Modal.jsx';
import {
  useGetOemsQuery,
  useCreateOemMutation,
  useUpdateOemMutation,
} from '../org/orgApi.js';

export default function CsdOems() {
  const { data: oems = [], isLoading: loading, isFetching: refreshing, refetch } = useGetOemsQuery();
  const [createOem, { isLoading: isCreating }] = useCreateOemMutation();
  const [updateOem, { isLoading: isUpdating }] = useUpdateOemMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOemForEdit, setSelectedOemForEdit] = useState(null);
  const [selectedOemForView, setSelectedOemForView] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    gstin: '',
    active: true,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      gstin: '',
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (oem) => {
    setSelectedOemForEdit(oem);
    setFormData({
      name: oem.name || '',
      code: oem.code || '',
      person: oem.person || '',
      email: oem.email || '',
      phone: oem.phone || '',
      address: oem.address || '',
      city: oem.city || '',
      state: oem.state || '',
      gstin: oem.gstin || '',
      active: oem.active ?? true,
    });
  };

  const handleSaveOem = async (e) => {
    e.preventDefault();
    try {
      if (selectedOemForEdit) {
        await updateOem({
          id: selectedOemForEdit._id || selectedOemForEdit.id,
          ...formData,
        }).unwrap();
        showToast(`✓ OEM "${formData.name}" successfully updated.`);
        setSelectedOemForEdit(null);
      } else {
        await createOem(formData).unwrap();
        showToast(`✓ OEM "${formData.name}" successfully registered in CSD Catalog.`);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to save OEM record');
    }
  };

  const handleToggleStatus = async (oem) => {
    try {
      const nextActive = !oem.active;
      await updateOem({
        id: oem._id || oem.id,
        active: nextActive,
      }).unwrap();
      showToast(`OEM "${oem.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to toggle status');
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
        title="Empaneled Original Equipment Manufacturers (OEMs)"
        subtitle="Automobile and white-goods manufacturers with valid Rate Contracts with CSD Head Office"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'OEMs' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync OEMs'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
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
              className="csd-search-field-input director-field-input"
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

      {/* CREATE / EDIT OEM MODAL */}
      {(isAddModalOpen || selectedOemForEdit) && (
        <Modal
          isOpen={Boolean(isAddModalOpen || selectedOemForEdit)}
          title={selectedOemForEdit ? `Edit OEM: ${selectedOemForEdit.name}` : 'Register New Manufacturer (OEM)'}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedOemForEdit(null);
          }}
        >
          <form onSubmit={handleSaveOem} className="director-modal-form">
            <div className="csd-form-grid-2-1">
              <div>
                <label className="director-field-label">
                  OEM Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Suzuki India Ltd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  OEM Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MSIL"
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
                  placeholder="Institutional Head"
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
                  placeholder="csd.sales@oem.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="director-field-input"
                />
              </div>
              <div>
                <label className="director-field-label">
                  Mobile / Phone
                </label>
                <input
                  type="text"
                  placeholder="Official Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div>
              <label className="director-field-label">
                Corporate Address
              </label>
              <input
                type="text"
                placeholder="HQ Plant / Office Address"
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
                  GSTIN Number
                </label>
                <input
                  type="text"
                  placeholder="GSTIN"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="director-field-input"
                />
              </div>
            </div>

            <div className="portal-flex-wrap-gap-sm">
              <input
                type="checkbox"
                id="oemActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="oemActive" className="director-field-label">
                Active in CSD Catalog (Dealers & products can be assigned)
              </label>
            </div>

            <div className="director-modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedOemForEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : selectedOemForEdit ? 'Update OEM' : 'Register OEM'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* OEM DETAILS INSPECTION MODAL */}
      {selectedOemForView && (
        <Modal
          isOpen={Boolean(selectedOemForView)}
          title={`OEM Profile: ${selectedOemForView.name}`}
          onClose={() => setSelectedOemForView(null)}
          maxWidth="640px"
        >
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

            <div className="director-modal-actions">
              <Button
                variant="outline"
                onClick={() => {
                  const target = selectedOemForView;
                  setSelectedOemForView(null);
                  handleOpenEdit(target);
                }}
              >
                <Edit2 size={13} className="mr-xs" /> Edit OEM
              </Button>
              <Button variant="primary" onClick={() => setSelectedOemForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
