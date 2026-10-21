import React, { useState } from 'react';
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
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  useGetDepotsQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
} from '../org/orgApi.js';

export default function CsdDepots() {
  const { data: depots = [], isLoading: loading, isFetching: refreshing, refetch } = useGetDepotsQuery();
  const [createDepot, { isLoading: isCreating }] = useCreateDepotMutation();
  const [updateDepot, { isLoading: isUpdating }] = useUpdateDepotMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDepotForEdit, setSelectedDepotForEdit] = useState(null);
  const [selectedDepotForView, setSelectedDepotForView] = useState(null);
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
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (depot) => {
    setSelectedDepotForEdit(depot);
    setFormData({
      name: depot.name || '',
      code: depot.code || '',
      person: depot.person || '',
      email: depot.email || '',
      phone: depot.phone || '',
      address: depot.address || '',
      city: depot.city || '',
      state: depot.state || '',
      active: depot.active ?? true,
    });
  };

  const handleSaveDepot = async (e) => {
    e.preventDefault();
    try {
      if (selectedDepotForEdit) {
        await updateDepot({
          id: selectedDepotForEdit._id || selectedDepotForEdit.id,
          ...formData,
        }).unwrap();
        showToast(`✓ Regional Depot "${formData.name}" successfully updated.`);
        setSelectedDepotForEdit(null);
      } else {
        await createDepot(formData).unwrap();
        showToast(`✓ Regional Depot "${formData.name}" registered in CSD network.`);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to save Depot record');
    }
  };

  const handleToggleStatus = async (depot) => {
    try {
      const nextActive = !depot.active;
      await updateDepot({
        id: depot._id || depot.id,
        active: nextActive,
      }).unwrap();
      showToast(`Depot "${depot.name}" is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to toggle status');
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
          <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.88rem' }}>{row.name}</strong>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.address || row.city}</span>
        </div>
      ),
    },
    {
      header: 'Depot Code',
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
      header: 'Commanding Officer / Nodal',
      accessor: 'person',
      render: (row) => (
        <div>
          <span style={{ color: '#1e293b', fontWeight: 500 }}>{row.person || 'Depot Manager'}</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>{row.phone || row.email || ''}</span>
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
            onClick={() => setSelectedDepotForView(row)}
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
            title="Inspect Depot"
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
    <div className="csd-depots-page" style={{ paddingBottom: '3rem' }}>
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
        title="Regional CSD Depots Directorate"
        subtitle="Operational oversight of Area Depots managing regional AFD sanction queues and supply orders"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'Depots' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} style={{ marginRight: '0.35rem', animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Syncing...' : 'Sync Depots'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={14} style={{ marginRight: '0.35rem' }} /> Add New Depot
            </Button>
          </div>
        }
      />

      <Card
        title="Regional Depot Roster"
        subtitle="Jurisdictional hubs executing demand sanctioning, payment verification, and Supply Order issuance"
        actions={
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search depot name, code, state..."
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
          data={filteredDepots}
          loading={loading}
          emptyText="No depots found. Click 'Add New Depot' to create one."
        />
      </Card>

      {/* CREATE / EDIT DEPOT MODAL */}
      {(isAddModalOpen || selectedDepotForEdit) && (
        <Modal
          title={selectedDepotForEdit ? `Edit Depot: ${selectedDepotForEdit.name}` : 'Register Regional CSD Depot'}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDepotForEdit(null);
          }}
        >
          <form onSubmit={handleSaveDepot} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Depot Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DELHI CSD DEPOT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Depot Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEP-DEL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Commanding Officer / Nodal
                </label>
                <input
                  type="text"
                  placeholder="Depot Manager"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="depot@csdindia.gov.in"
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
                  placeholder="Depot Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '5px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Premises Address
              </label>
              <input
                type="text"
                placeholder="Station / Area Depot Address"
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
                id="depotActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="depotActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                Operational & Open for Inbound Demands
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedDepotForEdit(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : selectedDepotForEdit ? 'Update Depot' : 'Register Depot'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DEPOT DETAILS INSPECTION MODAL */}
      {selectedDepotForView && (
        <Modal
          title={`Depot Profile: ${selectedDepotForView.name}`}
          onClose={() => setSelectedDepotForView(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{selectedDepotForView.name}</h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                    background: selectedDepotForView.active ? '#dcfce7' : '#fee2e2',
                    color: selectedDepotForView.active ? '#15803d' : '#991b1b',
                  }}
                >
                  {selectedDepotForView.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Code: <strong>{selectedDepotForView.code}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Commanding Officer / Nodal</span>
                <strong>{selectedDepotForView.person || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Contact Phone</span>
                <strong>{selectedDepotForView.phone || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Official Email</span>
                <strong>{selectedDepotForView.email || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Jurisdiction</span>
                <strong>{selectedDepotForView.city ? `${selectedDepotForView.city}, ${selectedDepotForView.state || ''}` : '—'}</strong>
              </div>
            </div>

            {selectedDepotForView.address && (
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Premises Address</span>
                <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedDepotForView.address}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={() => setSelectedDepotForView(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
