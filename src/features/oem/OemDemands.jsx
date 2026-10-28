import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Eye,
  FileText,
  Building2,
  Store,
  CreditCard,
  Calendar,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useGetOemDemandsQuery, useGetOemDemandByIdQuery } from './oemApi.js';

export default function OemDemands() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [selectedDemandId, setSelectedDemandId] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (searchTerm) p.q = searchTerm;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [searchTerm, statusFilter, page]);

  const {
    data: demandsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemDemandsQuery(queryParams);

  const { data: demandDetail, isLoading: loadingDetail } = useGetOemDemandByIdQuery(
    selectedDemandId,
    { skip: !selectedDemandId }
  );

  const demands = demandsData?.items || [];
  const meta = demandsData?.meta || {};

  const columns = [
    {
      header: 'Demand Reference',
      accessor: 'demandNo',
      render: (r) => (
        <span className="font-semibold text-brand font-mono">{r.demandNo || r._id}</span>
      ),
    },
    {
      header: 'Model Requested',
      accessor: 'productSnapshot',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800">
            {r.productSnapshot?.name || r.productId?.name || '—'}
          </div>
          <div className="muted small font-mono">
            SKU: {r.productSnapshot?.sku || r.productId?.sku || '—'}
          </div>
        </div>
      ),
    },
    {
      header: 'Allotted Showroom',
      accessor: 'dealerId',
      render: (r) => (
        <div>
          <span className="font-medium text-slate-700">{r.dealerId?.name || '—'}</span>
          {r.dealerId?.city && <span className="muted small block">{r.dealerId.city}</span>}
        </div>
      ),
    },
    {
      header: 'Regional Depot',
      accessor: 'depotId',
      render: (r) => r.depotId?.name || '—',
    },
    {
      header: 'Sanction Value',
      accessor: 'totalAmount',
      render: (r) => (
        <span className="font-mono font-medium text-slate-900">
          {formatCurrency(r.totalAmount || 0)}
        </span>
      ),
    },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => setSelectedDemandId(r._id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="oem-demands-page space-y-6">
      <PageHeader
        title="OEM Institutional Demand Pipeline"
        subtitle="Defence personnel sanctioned demands under OEM rate contract prior to supply order issue"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Demands' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Sync Pipeline
          </Button>
        }
      />

      {/* Demand Details Inline Dossier */}
      {Boolean(selectedDemandId) && (
        <Card
          className="mb-4 border-primary"
          title={`Demand Ref: ${demandDetail?.demandNo || '...'}`}
          subtitle="Sanctioned Defence Purchase Demand Profile"
          headerAction={
            <Button variant="outline" size="sm" onClick={() => setSelectedDemandId(null)}>
              Close Dossier
            </Button>
          }
        >
          {loadingDetail ? (
            <div className="py-8 text-center text-muted">Loading demand specifications...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-sm border">
                <div>
                  <span className="text-muted block text-xs">Demand Number:</span>
                  <span className="font-mono font-semibold text-brand">{demandDetail?.demandNo}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Status:</span>
                  <StatusBadge status={demandDetail?.status} />
                </div>
                <div>
                  <span className="text-muted block text-xs">Vehicle Model:</span>
                  <span className="font-medium">
                    {demandDetail?.productSnapshot?.name || demandDetail?.productId?.name || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-xs">CSD Index / SKU:</span>
                  <span className="font-mono">
                    {demandDetail?.productSnapshot?.sku || demandDetail?.productId?.sku || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Assigned Dealership:</span>
                  <span className="font-medium">{demandDetail?.dealerId?.name || '—'}</span>
                  {demandDetail?.dealerId?.city && (
                    <span className="muted small block">{demandDetail.dealerId.city}, {demandDetail.dealerId.state}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted block text-xs">Regional CSD Depot:</span>
                  <span>{demandDetail?.depotId?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Sanctioned Total:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(demandDetail?.totalAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Payment Status:</span>
                  <span className="badge badge-success">{demandDetail?.paymentStatus || 'PAID'}</span>
                </div>
              </div>

              {/* Sanitized Beneficiary Profile */}
              <div className="p-3 border rounded-lg text-sm bg-white">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Beneficiary Quota Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted block">Entitlement Category:</span>
                    <span className="font-medium">
                      {demandDetail?.beneficiarySnapshot?.category || 'Armed Forces Personnel'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Service Details:</span>
                    <span className="font-mono">
                      {demandDetail?.beneficiarySnapshot?.serviceNumber || 'Verified Defence Record'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
          <div className="flex gap-2 items-center flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-muted pointer-events-none" />
              <input
                type="text"
                className="form-control pl-9"
                placeholder="Search by demand no..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="form-control w-44"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUPPLY_ORDER_ISSUED">Supply Order Issued</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={demands}
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
          emptyTitle="No demands found"
          emptyText="No defence demands matching your query were found."
        />
      </Card>
    </div>
  );
}
