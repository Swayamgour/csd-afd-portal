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
        <button
          onClick={() => setSelectedOrder(row)}
          className="px-2.5 py-1 text-xs font-semibold bg-brand/10 text-brand rounded hover:bg-brand/20 transition flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Dossier</span>
        </button>
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
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Supply Order Dossier · ${selectedOrder.orderNo || selectedOrder.id}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Beneficiary:</span>
                <span className="font-semibold text-ink">
                  {selectedOrder.beneficiaryId?.fullName || selectedOrder.beneficiaryId?.name || selectedOrder.beneficiaryName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Number:</span>
                <span className="font-mono">{selectedOrder.beneficiaryId?.serviceNumber || 'Armed Forces'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Order Status:</span>
                <Badge variant={selectedOrder.status === 'DELIVERED' ? 'success' : 'brand'}>{selectedOrder.status}</Badge>
              </div>
              <div>
                <span className="text-slate-500 block">Date Issued:</span>
                <span className="font-mono">{formatDate(selectedOrder.createdAt)}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Commercial Dealer:</span>
                <span className="font-semibold">{selectedOrder.dealerId?.name || selectedOrder.dealer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Depot Allocation:</span>
                <span className="font-semibold">{selectedOrder.depotId?.name || selectedOrder.depot}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                <span>Total Value:</span>
                <span className="text-brand font-mono text-sm">{formatCurrency(selectedOrder.amount || selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
