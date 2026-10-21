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
          <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>{row.name}</strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>GSTIN: {row.gstin || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Code',
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
            onClick={() => setSelectedOemForView(row)}
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
            title="Inspect OEM Profile"
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
    <div className="csd-oems-page" style={{ paddingBottom: '3rem' }}>
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
        title="Empaneled Original Equipment Manufacturers (OEMs)"
        subtitle="Automobile and white-goods manufacturers with valid Rate Contracts with CSD Head Office"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'OEMs' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} style={{ marginRight: '0.35rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Syncing...' : 'Sync OEMs'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={14} style={{ marginRight: '0.35rem' }} /> Add New OEM
            </Button>
          </div>
        }
      />

      <Card
        title="Active OEM Registry"
        subtitle="Manufacturers authorized to supply AFD-I and AFD-II inventory through CSD Depots"
        actions={
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search OEM name, code, city..."
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
          data={filteredOems}
          loading={loading}
          emptyText="No OEMs found in database. Click 'Add New OEM' to register one."
        />
      </Card>

      {/* CREATE / EDIT OEM MODAL */}
      {(isAddModalOpen || selectedOemForEdit) && (
        <Modal
          title={selectedOemForEdit ? `Edit OEM: ${selectedOemForEdit.name}` : 'Register New Manufacturer (OEM)'}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedOemForEdit(null);
          }}
        >
          <form onSubmit={handleSaveOem} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  OEM Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Suzuki India Ltd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  OEM Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MSIL"
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
                  placeholder="Institutional Head"
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
                  placeholder="csd.sales@oem.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Mobile / Phone
                </label>
                <input
                  type="text"
                  placeholder="Official Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Corporate Address
              </label>
              <input
                type="text"
                placeholder="HQ Plant / Office Address"
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
                  GSTIN Number
                </label>
                <input
                  type="text"
                  placeholder="GSTIN"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                id="oemActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="oemActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                Active in CSD Catalog (Dealers & products can be assigned)
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
          title={`OEM Profile: ${selectedOemForView.name}`}
          onClose={() => setSelectedOemForView(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selectedOemForView.name}</h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    background: selectedOemForView.active ? '#dcfce7' : '#fee2e2',
                    color: selectedOemForView.active ? '#15803d' : '#991b1b',
                  }}
                >
                  {selectedOemForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Code: <strong>{selectedOemForView.code}</strong> | GSTIN: <strong>{selectedOemForView.gstin || 'N/A'}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Institutional Head</span>
                <strong>{selectedOemForView.person || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Contact Mobile</span>
                <strong>{selectedOemForView.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Official Email</span>
                <strong>{selectedOemForView.email || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Location / City</span>
                <strong>{selectedOemForView.city ? `${selectedOemForView.city}, ${selectedOemForView.state || ''}` : '—'}</strong>
              </div>
            </div>

            {selectedOemForView.address && (
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Plant / Head Office Address</span>
                <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedOemForView.address}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={() => setSelectedOemForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
