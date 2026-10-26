import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Calendar,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemPricingQuery,
  useCreateOemPricingMutation,
  useUpdateOemPricingMutation,
  useGetOemProductsQuery,
} from './oemApi.js';

const INDIAN_STATES = [
  'ANDAMAN AND NICOBAR ISLANDS', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM',
  'BIHAR', 'CHANDIGARH', 'CHHATTISGARH', 'DADRA AND NAGAR HAVELI', 'DAMAN AND DIU',
  'DELHI', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JAMMU AND KASHMIR',
  'JHARKHAND', 'KARNATAKA', 'KERALA', 'LADAKH', 'LAKSHADWEEP', 'MADHYA PRADESH',
  'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA',
  'PUDUCHERRY', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA',
  'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL'
];

export default function OemPricing() {
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [stateFilter, setStateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [formError, setFormError] = useState('');

  const [formState, setFormState] = useState({
    productId: '',
    state: 'DELHI',
    basePrice: '',
    salePrice: '',
    taxPercent: '',
    status: 'PUBLISHED',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
  });

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (stateFilter) p.state = stateFilter;
    if (productFilter) p.productId = productFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [stateFilter, productFilter, statusFilter, page]);

  const {
    data: pricingData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemPricingQuery(queryParams);

  const { data: productsData } = useGetOemProductsQuery({ limit: 50, status: 'ACTIVE' });

  const [createPricing, { isLoading: isCreating }] = useCreateOemPricingMutation();
  const [updatePricing, { isLoading: isUpdating }] = useUpdateOemPricingMutation();

  const prices = pricingData?.items || [];
  const meta = pricingData?.meta || {};
  const products = productsData?.items || [];

  const handleOpenCreate = () => {
    setEditingPrice(null);
    setFormError('');
    setFormState({
      productId: products[0]?._id || '',
      state: 'DELHI',
      basePrice: products[0]?.price || '',
      salePrice: '',
      taxPercent: products[0]?.taxPercent !== undefined && products[0]?.taxPercent !== null ? String(products[0].taxPercent) : '',
      status: 'PUBLISHED',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (priceDoc) => {
    setEditingPrice(priceDoc);
    setFormError('');
    setFormState({
      productId: priceDoc.productId?._id || priceDoc.productId,
      state: priceDoc.state || 'DELHI',
      basePrice: priceDoc.basePrice || '',
      salePrice: priceDoc.salePrice || '',
      taxPercent: priceDoc.taxPercent !== undefined && priceDoc.taxPercent !== null ? String(priceDoc.taxPercent) : '',
      status: priceDoc.status || 'PUBLISHED',
      effectiveFrom: priceDoc.effectiveFrom ? new Date(priceDoc.effectiveFrom).toISOString().slice(0, 10) : '',
      effectiveTo: priceDoc.effectiveTo ? new Date(priceDoc.effectiveTo).toISOString().slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formState.productId || !formState.state || !formState.basePrice || !formState.salePrice) {
      setFormError('Please enter all required fields.');
      return;
    }

    if (formState.effectiveFrom && formState.effectiveTo) {
      if (new Date(formState.effectiveFrom) >= new Date(formState.effectiveTo)) {
        setFormError('Effective From date must be earlier than Effective To date.');
        return;
      }
    }

    const payload = {
      productId: formState.productId,
      state: formState.state.toUpperCase().trim(),
      basePrice: Number(formState.basePrice),
      salePrice: Number(formState.salePrice),
      taxPercent: Number(formState.taxPercent || 0),
      status: formState.status,
      effectiveFrom: formState.effectiveFrom ? new Date(formState.effectiveFrom) : undefined,
      effectiveTo: formState.effectiveTo ? new Date(formState.effectiveTo) : undefined,
    };

    try {
      if (editingPrice) {
        await updatePricing({ id: editingPrice._id, ...payload }).unwrap();
        setToastMessage(`Pricing updated for ${payload.state}.`);
      } else {
        await createPricing(payload).unwrap();
        setToastMessage(`Published state pricing created for ${payload.state}.`);
      }
      setModalOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to save state pricing.');
    }
  };

  const columns = [
    {
      header: 'Vehicle Model',
      accessor: 'productId',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.productId?.name || 'Empaneled Model'}</div>
          <div className="muted small font-mono">SKU: {r.productId?.sku}</div>
        </div>
      ),
    },
    {
      header: 'State / Territory',
      accessor: 'state',
      render: (r) => (
        <span className="font-semibold text-brand text-xs uppercase">{r.state}</span>
      ),
    },
    {
      header: 'Base Rate (Ex-Factory)',
      accessor: 'basePrice',
      render: (r) => (
        <span className="font-mono text-slate-700">{formatCurrency(r.basePrice || 0)}</span>
      ),
    },
    {
      header: 'Final CSD Price',
      accessor: 'salePrice',
      render: (r) => (
        <span className="font-mono font-bold text-slate-900">{formatCurrency(r.salePrice || 0)}</span>
      ),
    },
    {
      header: 'Tax Rate',
      accessor: 'taxPercent',
      render: (r) => <span className="small">{r.taxPercent}% GST</span>,
    },
    {
      header: 'Effective Period',
      accessor: 'effectiveFrom',
      render: (r) => (
        <div className="small muted">
          <span>{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : 'Immediate'}</span>
          {r.effectiveTo && <span> &rarr; {new Date(r.effectiveTo).toLocaleDateString()}</span>}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <Button size="sm" variant="outline" icon={Edit3} onClick={() => handleOpenEdit(r)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="oem-pricing-page space-y-6">
      <PageHeader
        title="State-Wise AFD Rate Schedules"
        subtitle="Manage state ceiling rates, local road tax offsets, and published rate contracts"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'State Pricing' },
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
              Publish State Rate
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

      <Card>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
          <div className="flex gap-2 items-center flex-1 max-w-lg">
            <select
              className="form-control w-48"
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All States</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="form-control w-64"
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Vehicle Models</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              className="form-control w-36"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={prices}
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
          emptyTitle="No state pricing schedules found"
          emptyText="No state pricing tiers found matching your filter."
        />
      </Card>

      {/* Add / Edit Pricing Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPrice ? 'Update State Rate Contract' : 'Publish State Rate Contract'}
        subtitle="Final price schedule for beneficiary payment sanction across regional depots"
        maxWidth="600px"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isCreating || isUpdating}
              onClick={handleSubmit}
            >
              {editingPrice ? 'Save Pricing' : 'Publish Rate'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Empaneled Vehicle Model <span className="req-star">*</span></label>
            <select
              className="form-control"
              value={formState.productId}
              onChange={(e) => {
                const prod = products.find((p) => p._id === e.target.value);
                setFormState({
                  ...formState,
                  productId: e.target.value,
                  basePrice: prod?.price ? String(prod.price) : formState.basePrice,
                  taxPercent: prod?.taxPercent !== undefined && prod?.taxPercent !== null ? String(prod.taxPercent) : formState.taxPercent,
                });
              }}
              disabled={Boolean(editingPrice)}
              required
            >
              <option value="">Select Model</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">State / Union Territory <span className="req-star">*</span></label>
            <select
              className="form-control"
              value={formState.state}
              onChange={(e) => setFormState({ ...formState, state: e.target.value })}
              required
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-field">
              <label className="form-label">Base Price (₹) <span className="req-star">*</span></label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="e.g. 1000000"
                value={formState.basePrice}
                onChange={(e) => setFormState({ ...formState, basePrice: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">GST Tax (%)</label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="e.g. 18 or 28"
                value={formState.taxPercent}
                onChange={(e) => setFormState({ ...formState, taxPercent: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Final Sale Price (₹) <span className="req-star">*</span></label>
              <input
                type="number"
                className="form-control font-mono"
                placeholder="e.g. 1280000"
                value={formState.salePrice}
                onChange={(e) => setFormState({ ...formState, salePrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">Effective From</label>
              <input
                type="date"
                className="form-control"
                value={formState.effectiveFrom}
                onChange={(e) => setFormState({ ...formState, effectiveFrom: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Effective To (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={formState.effectiveTo}
                onChange={(e) => setFormState({ ...formState, effectiveTo: e.target.value })}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Schedule Status</label>
            <select
              className="form-control"
              value={formState.status}
              onChange={(e) => setFormState({ ...formState, status: e.target.value })}
            >
              <option value="PUBLISHED">PUBLISHED (Active Ceiling)</option>
              <option value="DRAFT">DRAFT</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
