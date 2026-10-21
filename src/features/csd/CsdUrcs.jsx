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
          <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>{row.name}</strong>
          <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
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
      header: 'Location / State',
      accessor: 'city',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#334155' }}>{row.city || '—'}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{row.state || ''}</span>
        </div>
      ),
    },
    {
      header: 'Officer-in-Charge / Contact',
      accessor: 'person',
      render: (row) => (
        <div>
          <span style={{ color: '#1e293b', fontWeight: 500 }}>{row.person || 'Canteen Officer'}</span>
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
            onClick={() => setSelectedUrcForView(row)}
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
            title="Inspect URC"
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
    <div className="csd-urcs-page" style={{ paddingBottom: '3rem' }}>
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
        title="Unit Run Canteen (URC) Management"
        subtitle="Military station delivery checkpoints affiliated with Regional CSD Supply Depots"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'URCs' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} style={{ marginRight: '0.35rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Syncing...' : 'Sync URCs'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={14} style={{ marginRight: '0.35rem' }} /> Add New URC
            </Button>
          </div>
        }
      />

      <Card
        title="Operational URC Roster"
        subtitle="Base and station canteens authorized for beneficiary order receipt and completion"
        actions={
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search URC name, code, depot..."
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
          <form onSubmit={handleSaveUrc} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                Select Parent Regional Depot *
              </label>
              <select
                required
                value={formData.depotId}
                onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #94a3b8', fontSize: '0.85rem' }}
              >
                <option value="">-- Choose Parent Depot --</option>
                {depots.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                * URC is operationally attached to this CSD Depot for supply chain dispatch.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  URC Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 WING AF CANTEEN"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  URC Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URC-7AF"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Officer-in-Charge
                </label>
                <input
                  type="text"
                  placeholder="Canteen Officer"
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
                  placeholder="urc@station.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="Canteen Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Station Address
              </label>
              <input
                type="text"
                placeholder="Military Base / Station Location"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="urcActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="urcActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                Operational & Open for Beneficiary Deliveries
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selectedUrcForView.name}</h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    background: selectedUrcForView.active ? '#dcfce7' : '#fee2e2',
                    color: selectedUrcForView.active ? '#15803d' : '#991b1b',
                  }}
                >
                  {selectedUrcForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: '1rem' }}>
                <span>Code: <strong>{selectedUrcForView.code}</strong></span>
                <span>Parent Depot: <strong>{selectedUrcForView.depotId?.name || 'Attached Depot'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Officer-in-Charge</span>
                <strong>{selectedUrcForView.person || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Phone</span>
                <strong>{selectedUrcForView.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Email</span>
                <strong>{selectedUrcForView.email || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Station Location</span>
                <strong>{selectedUrcForView.city ? `${selectedUrcForView.city}, ${selectedUrcForView.state || ''}` : '—'}</strong>
              </div>
            </div>

            {selectedUrcForView.address && (
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Address</span>
                <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedUrcForView.address}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
