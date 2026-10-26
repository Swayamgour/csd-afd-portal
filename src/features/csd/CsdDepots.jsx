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
  useGetPriceZonesQuery,
} from '../org/orgApi.js';

export default function CsdDepots() {
  const { data: depots = [], isLoading: loading, isFetching: refreshing, refetch } = useGetDepotsQuery();
  const { data: priceZones = [] } = useGetPriceZonesQuery({ active: true });
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
    priceZoneId: '',
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
      priceZoneId: priceZones[0]?._id || '',
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
      priceZoneId: depot.priceZoneId?._id || depot.priceZoneId || '',
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
    if (!formData.priceZoneId) {
      alert('Depot must be associated with a valid Price Zone according to CSD location hierarchy.');
      return;
    }
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
        title="Regional CSD Depots Directorate"
        subtitle="Operational oversight of Area Depots managing regional AFD sanction queues and supply orders"
        breadcrumbs={[{ label: 'Catalog Master', href: '/csd/products' }, { label: 'Depots' }]}
        actions={
          <div className="csd-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
              <RefreshCw size={14} className={`mr-xs ${refreshing ? 'spin-icon' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Depots'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
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

      {/* CREATE / EDIT DEPOT MODAL */}
      {(isAddModalOpen || selectedDepotForEdit) && (
        <Modal
          title={selectedDepotForEdit ? `Edit Depot: ${selectedDepotForEdit.name}` : 'Register Regional CSD Depot'}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedDepotForEdit(null);
          }}
        >
          <form onSubmit={handleSaveDepot} className="director-modal-form">
            <div className="csd-form-grid-2-1">
              <div>
                <label className="form-label">
                  Depot Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DELHI CSD DEPOT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">
                  Depot Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DEP-DEL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="form-control"
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Jurisdictional Price Zone *
              </label>
              <select
                required
                value={formData.priceZoneId}
                onChange={(e) => setFormData({ ...formData, priceZoneId: e.target.value })}
                className="form-control"
              >
                <option value="">Select Price Zone...</option>
                {priceZones.map((pz) => (
                  <option key={pz._id || pz.id} value={pz._id || pz.id}>
                    {pz.name} ({pz.code}) - {pz.state || 'National'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-3-col">
              <div>
                <label className="form-label">
                  Commanding Officer / Nodal
                </label>
                <input
                  type="text"
                  placeholder="Depot Manager"
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="depot@csdindia.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="Depot Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Premises Address
              </label>
              <input
                type="text"
                placeholder="Station / Area Depot Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-grid-2">
              <div>
                <label className="form-label">
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="portal-flex-wrap-gap-sm">
              <input
                type="checkbox"
                id="depotActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="depotActive" className="form-label">
                Operational & Open for Inbound Demands
              </label>
            </div>

            <div className="director-modal-actions">
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

            <div className="director-modal-actions">
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
