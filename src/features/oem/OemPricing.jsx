import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemPricingQuery,
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
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [stateFilter, setStateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (location.state?.toast) {
      setToastMessage(location.state.toast);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

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

  const prices = pricingData?.items || [];
  const meta = pricingData?.meta || {};
  const products = productsData?.items || [];

  const handleOpenCreate = () => {
    navigate('/oem/pricing/new');
  };

  const handleOpenEdit = (priceDoc) => {
    navigate(`/oem/pricing/${priceDoc._id || priceDoc.id}/edit`);
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
        title="State-wise Prices"
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
              Set State Prices
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
    </div>
  );
}
