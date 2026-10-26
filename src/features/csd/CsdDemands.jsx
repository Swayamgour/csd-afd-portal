import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Building2,
  Store,
  Warehouse,
  Package,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal.jsx';

export default function CsdDemands() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (searchTerm) p.q = searchTerm;
    return p;
  }, [statusFilter, searchTerm]);

  const { data: demandsData, isLoading, isFetching, refetch } = useGetDemandsQuery(queryParams);

  const demands = useMemo(() => {
    return demandsData?.items || (Array.isArray(demandsData) ? demandsData : []);
  }, [demandsData]);

  const kpiStats = useMemo(() => {
    const total = demands.length;
    const processing = demands.filter((d) => ['DEALER_VERIFICATION', 'DEPOT_PROCESSING', 'PROCESSING'].includes(d.status)).length;
    const approved = demands.filter((d) => ['APPROVED', 'SUPPLY_ORDER_ISSUED', 'COMPLETED'].includes(d.status)).length;
    const pendingPayment = demands.filter((d) => d.paymentStatus === 'UNPAID' || d.status === 'PAYMENT_PENDING').length;

    return [
      { title: 'Total AFD Demands', value: total, subtitle: 'National Indent Volume' },
      { title: 'Processing & Verification', value: processing, subtitle: 'Verification Queue' },
      { title: 'Approved & Supply Issued', value: approved, subtitle: `${total > 0 ? Math.round((approved / total) * 100) : 0}% Sanctioned` },
      { title: 'Pending Payment / Unpaid', value: pendingPayment, subtitle: 'Awaiting Settlement' },
    ];
  }, [demands]);

  const columns = [
    {
      header: 'Demand No',
      accessor: 'demandNo',
      render: (d) => <span className="font-mono font-bold text-brand">{d.demandNo}</span>,
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiaryId',
      render: (d) => (
        <div>
          <div className="font-semibold text-xs text-ink">{d.beneficiaryId?.fullName || d.userId?.name || 'Applicant'}</div>
          <div className="text-[10px] text-muted font-mono">{d.beneficiaryId?.serviceNumber} {d.beneficiaryId?.rank ? `(${d.beneficiaryId.rank})` : ''}</div>
        </div>
      ),
    },
    {
      header: 'Product Indented',
      accessor: 'productSnapshot',
      render: (d) => (
        <div>
          <div className="font-medium text-xs text-ink">{d.productSnapshot?.name || 'AFD Item'}</div>
          <div className="text-[10px] text-muted font-mono">SKU: {d.productSnapshot?.sku || d.productSnapshot?.indexNo || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Commercial (OEM & Dealer)',
      accessor: 'dealerId',
      render: (d) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">{d.dealerId?.name || 'Authorized Dealership'}</div>
          <div className="text-[10px] text-muted">{d.dealerId?.city ? `${d.dealerId.city}` : ''}</div>
        </div>
      ),
    },
    {
      header: 'Depot & URC Node',
      accessor: 'depotId',
      render: (d) => (
        <div className="text-xs">
          <div><strong className="text-slate-600">Depot:</strong> {d.depotId?.name || 'Base Depot'}</div>
          <div className="text-muted"><strong className="text-slate-600">URC:</strong> {d.urcId?.name || 'Assigned URC'}</div>
        </div>
      ),
    },
    {
      header: 'Sanction Amount',
      accessor: 'totalAmount',
      render: (d) => <span className="font-bold font-mono text-ink text-xs">{formatCurrency(d.totalAmount)}</span>,
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (d) => (
        <Badge variant={d.paymentStatus === 'PAID' ? 'success' : d.paymentStatus === 'UNPAID' ? 'warning' : 'neutral'}>
          {d.paymentStatus}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (d) => (
        <Badge
          variant={
            d.status === 'COMPLETED'
              ? 'success'
              : d.status === 'APPROVED' || d.status === 'SUPPLY_ORDER_ISSUED'
              ? 'brand'
              : d.status === 'REJECTED'
              ? 'danger'
              : 'warning'
          }
        >
          {d.status}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (d) => (
        <div className="csd-action-row">
          <button
            type="button"
            onClick={() => setSelectedDemand(d)}
            className="csd-btn-action-view"
            title="Inspect Demand"
          >
            <Eye size={13} /> View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="csd-demands-page space-y-6">
      <PageHeader
        title="National AFD Demand Monitoring Directorate"
        subtitle="Oversight of defense indents across all regional Depots, URC canteens, and OEM dealership networks."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Demand Monitoring' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Demands"
          >
            <RefreshCw size={14} className={`mr-xs ${isFetching ? 'spin-icon' : ''}`} />
            {isFetching ? 'Syncing...' : 'Sync Demands'}
          </Button>
        }
      />

      {/* KPI Cards */}
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

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Demand No, Service No, or Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="">All Demand Statuses</option>
              <option value="CREATED">Created</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="DEALER_VERIFICATION">Dealer Verification</option>
              <option value="DEPOT_PROCESSING">Depot Processing</option>
              <option value="APPROVED">Approved</option>
              <option value="SUPPLY_ORDER_ISSUED">Supply Order Issued</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
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

      {/* Demand Table */}
      <Card title="AFD Demand Indents" subtitle={`Displaying ${demands.length} registered demands`}>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Retrieving demands from server...</p>
          </div>
        ) : demands.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No demands match filter</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <DataTable columns={columns} data={demands} />
        )}
      </Card>

      {/* Scrutiny & Dossier Modal */}
      {selectedDemand && (
        <Modal
          isOpen={!!selectedDemand}
          onClose={() => setSelectedDemand(null)}
          title={`Scrutiny Dossier · Indent ${selectedDemand.demandNo}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Applicant:</span>
                <span className="font-semibold text-ink">{selectedDemand.beneficiaryId?.fullName || selectedDemand.userId?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Service Number:</span>
                <span className="font-mono font-bold">{selectedDemand.beneficiaryId?.serviceNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Rank / Level:</span>
                <span>{selectedDemand.beneficiaryId?.rank || 'Armed Forces'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status:</span>
                <Badge variant={selectedDemand.status === 'APPROVED' ? 'brand' : selectedDemand.status === 'COMPLETED' ? 'success' : 'warning'}>
                  {selectedDemand.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-brand" /> Product & Pricing Structure
                </h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product:</span>
                    <span className="font-medium text-ink">{selectedDemand.productSnapshot?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Color:</span>
                    <span>{selectedDemand.selectedColor || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price Zone:</span>
                    <span className="font-medium">{selectedDemand.priceZone || 'DELHI NCR'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Final Payable:</span>
                    <span className="text-brand font-mono text-sm">{formatCurrency(selectedDemand.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-brand" /> Operational & Commercial Allocation
                </h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Commercial Dealer:</span>
                    <span className="font-medium text-ink">{selectedDemand.dealerId?.name || 'Authorized Showroom'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Regional Depot:</span>
                    <span className="font-medium">{selectedDemand.depotId?.name || 'Base Depot'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Station URC:</span>
                    <span className="font-medium">{selectedDemand.urcId?.name || 'Base Canteen'}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1">
                    <span className="text-slate-500">Payment Status:</span>
                    <Badge variant={selectedDemand.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {selectedDemand.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Attachments */}
            {selectedDemand.documents?.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h5 className="font-bold text-slate-800">Uploaded Verification Documents</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDemand.documents.map((doc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded hover:bg-slate-100 transition text-brand font-medium text-left cursor-pointer"
                    >
                      <span className="truncate">{doc.name || doc.type}</span>
                      <Eye className="w-3.5 h-3.5 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* In-Portal Document Previewer Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          doc={previewDoc}
        />
      )}
    </div>
  );
}
