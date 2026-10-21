import React, { useState } from 'react';
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
          <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>{row.name}</strong>
          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#1e40af',
            background: '#eff6ff',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
          }}
        >
          {row.code}
        </span>
      ),
    },
    {
      header: 'Jurisdiction & City',
      accessor: 'city',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#334155' }}>{row.city || '—'}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{row.state || ''}</span>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      accessor: 'person',
      render: (row) => (
        <div>
          <span style={{ color: '#1e293b', fontWeight: 500 }}>{row.person || 'Nodal Officer'}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{row.phone || ''}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (row) => (
        <span
          style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            fontWeight: 700,
            background: row.active ? '#dcfce7' : '#fee2e2',
            color: row.active ? '#15803d' : '#991b1b',
            border: `1px solid ${row.active ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {row.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setSelectedDealerForView(row)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
            }}
            title="Inspect Dealership"
          >
            <Eye size={13} /> View
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
            title="Edit Details"
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid',
              borderColor: row.active ? '#fca5a5' : '#86efac',
              background: row.active ? '#fef2f2' : '#f0fdf4',
              color: row.active ? '#dc2626' : '#16a34a',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}
          >
            {row.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="csd-dealers-page" style={{ paddingBottom: '3rem' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            background: '#065f46',
            color: '#fff',
            padding: '0.85rem 1.35rem',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      <PageHeader
        title="Authorized Dealership Network"
        subtitle="Zero-handling fee delivery showrooms affiliated with authorized OEM manufacturers"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'Dealers' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} style={{ marginRight: '0.35rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Syncing...' : 'Sync Dealers'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={14} style={{ marginRight: '0.35rem' }} /> Add New Dealer
            </Button>
          </div>
        }
      />

      <Card
        title="Dealer Network Roster"
        subtitle="Empaneled delivery points across all national price zones"
        actions={
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search dealer name, city, OEM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.65rem 0.35rem 1.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
              }}
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
          <form onSubmit={handleSaveDealer} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                Select Affiliated OEM / Manufacturer *
              </label>
              <select
                required
                value={formData.oemId}
                onChange={(e) => setFormData({ ...formData, oemId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #94a3b8', fontSize: '0.85rem' }}
              >
                <option value="">-- Choose OEM Manufacturer --</option>
                {oems.map((o) => (
                  <option key={o._id || o.id} value={o._id || o.id}>
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                * Dealerships must belong to an active OEM in CSD master records.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Dealership Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AAA Vehicleades Pvt. Ltd. Mundka"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Dealer Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLR-101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="Showroom Manager"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="dealer@dealership.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Contact Mobile"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Showroom Address
              </label>
              <input
                type="text"
                placeholder="Full Street Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  PIN Code
                </label>
                <input
                  type="text"
                  placeholder="6-digit PIN"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="dealerActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="dealerActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                Active for Beneficiary Delivery Selection
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selectedDealerForView.name}</h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    background: selectedDealerForView.active ? '#dcfce7' : '#fee2e2',
                    color: selectedDealerForView.active ? '#15803d' : '#991b1b',
                  }}
                >
                  {selectedDealerForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '1rem' }}>
                <span>Code: <strong>{selectedDealerForView.code}</strong></span>
                <span>OEM: <strong>{selectedDealerForView.oemId?.name || 'Authorized OEM'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Nodal Manager</span>
                <strong>{selectedDealerForView.person || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Phone Number</span>
                <strong>{selectedDealerForView.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Official Email</span>
                <strong>{selectedDealerForView.email || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Station / City</span>
                <strong>{selectedDealerForView.city ? `${selectedDealerForView.city}, ${selectedDealerForView.state || ''}` : '—'}</strong>
              </div>
            </div>

            {selectedDealerForView.address && (
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Showroom Address</span>
                <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedDealerForView.address}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
