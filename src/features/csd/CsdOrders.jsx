import React, { useState, useMemo } from 'react';
import {
  Truck,
  Download,
  Eye,
  Search,
  RefreshCw,
  Building2,
  Store,
  Warehouse,
  CheckCircle2,
  Package
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useGetOrdersQuery } from '../demand/demandApi.js';

export default function CsdOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (searchTerm) p.q = searchTerm;
    return p;
  }, [statusFilter, searchTerm]);

  const { data: ordersData, isLoading, isFetching, refetch } = useGetOrdersQuery(queryParams);

  const orders = useMemo(() => {
    return ordersData?.items || (Array.isArray(ordersData) ? ordersData : []);
  }, [ordersData]);

  const kpiStats = useMemo(() => {
    const total = orders.length;
    const placed = orders.filter((o) => o.status === 'PLACED').length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
    const transit = orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'READY_FOR_DELIVERY').length;

    return [
      { title: 'Total Supply Orders', value: total, subtitle: 'National Issued Volume' },
      { title: 'Handed Over / Delivered', value: delivered, subtitle: `${total > 0 ? Math.round((delivered / total) * 100) : 0}% Fulfillment Rate` },
      { title: 'Active In-Transit', value: transit, subtitle: 'Logistics Pipeline' },
      { title: 'Awaiting Dealer Action', value: placed, subtitle: 'Stockyard Allocation' },
    ];
  }, [orders]);

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (row) => <span className="font-mono font-bold text-brand">{row.orderNo || row.id}</span>,
    },
    {
      header: 'Demand Reference',
      accessor: 'demandId',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          {row.demandId?.demandNo || row.demandNo || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiaryId',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs block text-ink">
            {row.beneficiaryId?.fullName || row.beneficiaryId?.name || row.beneficiaryName || 'Applicant'}
          </span>
          <span className="text-[10px] text-muted font-mono">
            {row.beneficiaryId?.serviceNumber || row.serviceNumber || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'AFD Item & Index',
      accessor: 'items',
      render: (row) => (
        <div>
          <span className="font-medium text-xs block text-ink">
            {row.items?.[0]?.name || row.productName || 'AFD Item'}
          </span>
          <span className="text-[10px] text-muted font-mono">
            SKU: {row.items?.[0]?.sku || row.sku || 'AFD-SKU'}
          </span>
        </div>
      ),
    },
    {
      header: 'Commercial Dealership',
      accessor: 'dealerId',
      render: (row) => (
        <span className="text-xs font-medium text-slate-800">
          {row.dealerId?.name || row.dealer || 'Authorized Dealership'}
        </span>
      ),
    },
    {
      header: 'Sanction Value',
      accessor: 'amount',
      render: (row) => (
        <span className="font-bold font-mono text-xs text-ink">
          {formatCurrency(row.amount || row.totalAmount || row.csdPrice)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'DELIVERED' || row.status === 'COMPLETED'
              ? 'success'
              : row.status === 'IN_TRANSIT'
              ? 'brand'
              : 'warning'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <div className="csd-action-row">
          <button
            type="button"
            onClick={() => setSelectedOrder(row)}
            className="csd-btn-action-view"
            title="Inspect Order Dossier"
          >
            <Eye size={13} /> View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="csd-orders-page space-y-6">
      <PageHeader
        title="National Supply Orders Directory"
        subtitle="Oversight of digital supply orders issued to OEMs, regional depots, and commercial dealerships."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Supply Orders' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={`mr-xs ${isFetching ? 'spin-icon' : ''}`} />
            {isFetching ? 'Syncing...' : 'Sync Orders'}
          </Button>
        }
      />

      {/* Live KPI Cards */}
      <div className="kpi-grid">
        {kpiStats.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SO number, Chassis, or Dealer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Order Statuses</option>
              <option value="PLACED">Placed / Issued</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="READY_FOR_DELIVERY">Ready For Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {(statusFilter || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card title="Official Supply Orders" subtitle={`Showing ${orders.length} orders registered in database`}>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Loading supply orders from server...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No supply orders match criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <DataTable columns={columns} data={orders} />
        )}
      </Card>

      {/* Order Dossier Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Supply Order Dossier: ${selectedOrder.orderNo || selectedOrder.id}`}
          maxWidth="640px"
        >
          <div className="director-modal-form">
            <div className="csd-card-preview-box">
              <div className="csd-card-preview-header">
                <h3 className="csd-card-preview-title">
                  {selectedOrder.items?.[0]?.name || selectedOrder.productName || 'AFD Item'}
                </h3>
                <Badge
                  variant={
                    selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'COMPLETED'
                      ? 'success'
                      : selectedOrder.status === 'IN_TRANSIT'
                      ? 'brand'
                      : 'warning'
                  }
                >
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="csd-subtext-muted">
                Order No: <strong>{selectedOrder.orderNo || selectedOrder.id}</strong> | Demand: <strong>{selectedOrder.demandId?.demandNo || selectedOrder.demandNo || 'N/A'}</strong> | SKU: <strong>{selectedOrder.items?.[0]?.sku || selectedOrder.sku || 'N/A'}</strong>
              </div>
            </div>

            <div className="csd-preview-grid-2">
              <div>
                <span className="csd-preview-field-label">Beneficiary</span>
                <div className="csd-preview-field-value">
                  {selectedOrder.beneficiaryId?.fullName || selectedOrder.beneficiaryId?.name || selectedOrder.beneficiaryName || 'Applicant'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Service Number</span>
                <div className="csd-preview-field-value font-mono">
                  {selectedOrder.beneficiaryId?.serviceNumber || selectedOrder.serviceNumber || 'Armed Forces'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Commercial Dealer</span>
                <div className="csd-preview-field-value">
                  {selectedOrder.dealerId?.name || selectedOrder.dealer || '—'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Allocated Depot</span>
                <div className="csd-preview-field-value">
                  {selectedOrder.depotId?.name || selectedOrder.depot || '—'}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Date Issued</span>
                <div className="csd-preview-field-value">
                  {formatDate(selectedOrder.createdAt)}
                </div>
              </div>
              <div>
                <span className="csd-preview-field-label">Total Sanction Value</span>
                <div className="csd-preview-field-value font-bold text-brand">
                  {formatCurrency(selectedOrder.amount || selectedOrder.totalAmount || selectedOrder.csdPrice)}
                </div>
              </div>
            </div>

            <div className="director-modal-actions">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
