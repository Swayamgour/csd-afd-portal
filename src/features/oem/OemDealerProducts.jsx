import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemDealerProductsListQuery,
  useUpdateOemDealerProductMutation,
  useDeleteOemDealerProductMutation,
  useGetOemDealersQuery,
  useGetOemProductsQuery,
} from './oemApi.js';

export default function OemDealerProducts() {
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [selectedDealerFilter, setSelectedDealerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formError, setFormError] = useState('');
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

  const [updateMapping, { isLoading: isUpdating }] = useUpdateOemDealerProductMutation();
  const [deleteMapping, { isLoading: isDeleting }] = useDeleteOemDealerProductMutation();

  const mappings = mappingsData?.items || [];
  const meta = mappingsData?.meta || {};
  const dealers = dealersData?.items || [];
  const products = productsData?.items || [];

  const handleOpenCreate = () => {
    navigate('/oem/dealer-products/new');
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

      {formError && (
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
    </div>
  );
}
