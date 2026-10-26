import React, { useState, useMemo } from 'react';
import {
  Layers,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Store,
  Package,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemDealerProductsListQuery,
  useCreateOemDealerProductMutation,
  useUpdateOemDealerProductMutation,
  useDeleteOemDealerProductMutation,
  useGetOemDealersQuery,
  useGetOemProductsQuery,
} from './oemApi.js';

export default function OemDealerProducts() {
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [selectedDealerFilter, setSelectedDealerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formDealerId, setFormDealerId] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formDeliveryDays, setFormDeliveryDays] = useState('15');
  const [formAvailability, setFormAvailability] = useState('AVAILABLE');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (selectedDealerFilter) p.dealerId = selectedDealerFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [selectedDealerFilter, statusFilter, page]);

  const {
    data: mappingsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemDealerProductsListQuery(queryParams);

  const { data: dealersData } = useGetOemDealersQuery({ limit: 50, active: true });
  const { data: productsData } = useGetOemProductsQuery({ limit: 50, status: 'ACTIVE' });

  const [createMapping, { isLoading: isCreating }] = useCreateOemDealerProductMutation();
  const [updateMapping, { isLoading: isUpdating }] = useUpdateOemDealerProductMutation();
  const [deleteMapping, { isLoading: isDeleting }] = useDeleteOemDealerProductMutation();

  const mappings = mappingsData?.items || [];
  const meta = mappingsData?.meta || {};
  const dealers = dealersData?.items || [];
  const products = productsData?.items || [];

  const handleOpenCreate = () => {
    setFormError('');
    setFormDealerId(dealers[0]?._id || '');
    setFormProductId(products[0]?._id || '');
    setFormDeliveryDays('');
    setFormAvailability('AVAILABLE');
    setModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formDealerId || !formProductId) {
      setFormError('Please select both a dealership and a vehicle model.');
      return;
    }

    try {
      await createMapping({
        dealerId: formDealerId,
        productId: formProductId,
        availabilityStatus: formAvailability || undefined,
        estimatedDeliveryDays: formDeliveryDays ? Number(formDeliveryDays) : undefined,
      }).unwrap();

      setToastMessage('Dealer-Product mapping created successfully.');
      setModalOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to authorize dealership for model.');
    }
  };

  const handleToggleActive = async (mapping) => {
    try {
      if (mapping.active) {
        await deleteMapping(mapping._id).unwrap();
        setToastMessage(`Deactivated allotment for ${mapping.dealerId?.name || 'dealer'}.`);
      } else {
        await updateMapping({
          id: mapping._id,
          active: true,
          status: 'ACTIVE',
        }).unwrap();
        setToastMessage(`Activated allotment for ${mapping.dealerId?.name || 'dealer'}.`);
      }
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to update mapping status.');
    }
  };

  const columns = [
    {
      header: 'Dealership Showroom',
      accessor: 'dealerId',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.dealerId?.name || '—'}</div>
          <div className="muted small font-mono">
            {r.dealerId?.code} {r.dealerId?.city ? `· ${r.dealerId.city}, ${r.dealerId.state || ''}` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Allotted Vehicle Model',
      accessor: 'productId',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800">{r.productId?.name || '—'}</div>
          <div className="muted small font-mono">SKU: {r.productId?.sku || '—'}</div>
        </div>
      ),
    },
    {
      header: 'CSD Rate',
      accessor: 'price',
      render: (r) => (
        <span className="font-mono font-medium text-brand">
          {r.productId?.price ? formatCurrency(r.productId.price) : '—'}
        </span>
      ),
    },
    {
      header: 'Availability / Delivery',
      accessor: 'availabilityStatus',
      render: (r) => (
        <div>
          {r.availabilityStatus ? (
            <Badge variant={r.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}>
              {r.availabilityStatus}
            </Badge>
          ) : (
            <span className="muted small">—</span>
          )}
          {r.estimatedDeliveryDays ? (
            <div className="muted small mt-0.5">Est. {r.estimatedDeliveryDays} days</div>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Allotment Status',
      accessor: 'active',
      render: (r) => (
        <Badge variant={r.active ? 'success' : 'neutral'}>
          {r.active ? 'Authorized' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <Button
          size="sm"
          variant={r.active ? 'outline' : 'primary'}
          loading={isUpdating || isDeleting}
          onClick={() => handleToggleActive(r)}
        >
          {r.active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="oem-dealer-products-page space-y-6">
      <PageHeader
        title="Dealership Product Allotments"
        subtitle="Authorize specific showrooms to inventory and handover OEM defense rate contract models"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Dealer Products' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={handleOpenCreate}
            >
              Authorize Dealership
            </Button>
          </div>
        }
      />

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {formError && !modalOpen && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span className="font-medium">{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
          <div className="flex gap-2 items-center flex-1 max-w-md">
            <select
              className="form-control w-64"
              value={selectedDealerFilter}
              onChange={(e) => {
                setSelectedDealerFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Dealerships</option>
              {dealers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.city})
                </option>
              ))}
            </select>

            <select
              className="form-control w-44"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={mappings}
          loading={isLoading}
          pagination={
            meta.totalPages > 1
              ? {
                  page: meta.page || page,
                  totalPages: meta.totalPages,
                  totalItems: meta.total,
                  onPageChange: setPage,
                  pageSize,
                }
              : null
          }
          emptyTitle="No dealership mappings found"
          emptyText="No dealership product allotments found matching your filter."
        />
      </Card>

      {/* Authorize Dealership Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Authorize Dealership for Vehicle Model"
        subtitle="Grant dealership showroom permission to accept orders and handover vehicles"
        maxWidth="540px"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isCreating}
              onClick={handleCreateSubmit}
            >
              Confirm Allotment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Select Dealership <span className="req-star">*</span></label>
            <select
              className="form-control"
              value={formDealerId}
              onChange={(e) => setFormDealerId(e.target.value)}
              required
            >
              <option value="">Select Showroom</option>
              {dealers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} · {d.city}, {d.state} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Select Empaneled Model <span className="req-star">*</span></label>
            <select
              className="form-control"
              value={formProductId}
              onChange={(e) => setFormProductId(e.target.value)}
              required
            >
              <option value="">Select Vehicle Model</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (SKU: {p.sku}) · ₹ {(p.price || 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">Stock Availability</label>
              <select
                className="form-control"
                value={formAvailability}
                onChange={(e) => setFormAvailability(e.target.value)}
              >
                <option value="AVAILABLE">Available for Dispatch</option>
                <option value="WAITING_PERIOD">Waiting Period</option>
                <option value="UNAVAILABLE">Temporarily Unavailable</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Est. Handover Days</label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="15"
                value={formDeliveryDays}
                onChange={(e) => setFormDeliveryDays(e.target.value)}
                min="1"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
