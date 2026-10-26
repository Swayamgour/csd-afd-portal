import React, { useState, useMemo } from 'react';
import {
  Truck,
  RefreshCw,
  Search,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  FileCheck,
  Send,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemOrdersQuery,
  useGetOemOrderByIdQuery,
  useUpdateOemOrderStatusMutation,
} from './oemApi.js';

export default function OemOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrderId, setDetailOrderId] = useState(null);

  // Form states for status update
  const [statusChoice, setStatusChoice] = useState('PROCESSING');
  const [chassisInput, setChassisInput] = useState('');
  const [engineInput, setEngineInput] = useState('');
  const [invoiceInput, setInvoiceInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (searchTerm) p.q = searchTerm;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [searchTerm, statusFilter, page]);

  const {
    data: ordersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemOrdersQuery(queryParams);

  const { data: orderDetail, isLoading: loadingDetail } = useGetOemOrderByIdQuery(
    detailOrderId,
    { skip: !detailOrderId }
  );

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOemOrderStatusMutation();

  const orders = ordersData?.items || [];
  const meta = ordersData?.meta || {};

  const openStatusModal = (ord) => {
    setSelectedOrder(ord);
    setFormError('');

    // Default next transition according to ORDER_TRANSITIONS:
    // PLACED -> PROCESSING
    // PROCESSING -> DISPATCHED
    // DISPATCHED -> DELIVERED
    if (ord.status === 'PLACED') setStatusChoice('PROCESSING');
    else if (ord.status === 'PROCESSING') setStatusChoice('DISPATCHED');
    else if (ord.status === 'DISPATCHED') setStatusChoice('DELIVERED');
    else setStatusChoice(ord.status);

    setChassisInput(ord.delivery?.chassisNo || ord.chassisNumber || '');
    setEngineInput(ord.delivery?.engineNo || ord.engineNumber || '');
    setInvoiceInput(ord.delivery?.invoiceNo || ord.invoiceNumber || '');
    setTrackingInput(ord.delivery?.trackingNo || '');
    setNoteInput('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (statusChoice === 'PROCESSING' && (!chassisInput.trim() || !engineInput.trim())) {
      setFormError('Please provide Chassis VIN and Engine Number for processing allocation.');
      return;
    }

    try {
      await updateOrderStatus({
        id: selectedOrder._id,
        status: statusChoice,
        chassisNumber: chassisInput.trim() || undefined,
        engineNumber: engineInput.trim() || undefined,
        invoiceNumber: invoiceInput.trim() || undefined,
        trackingNo: trackingInput.trim() || chassisInput.trim() || undefined,
        note: noteInput.trim() || `Status updated to ${statusChoice} by OEM`,
      }).unwrap();

      setToastMessage(`Order ${selectedOrder.orderNo} updated to ${statusChoice}.`);
      setSelectedOrder(null);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to update order status.');
    }
  };

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (r) => (
        <span className="font-semibold text-brand font-mono">{r.orderNo || r._id}</span>
      ),
    },
    {
      header: 'Dealership Showroom',
      accessor: 'dealerId',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800">{r.dealerId?.name || '—'}</div>
          <div className="muted small">{r.dealerId?.city ? `${r.dealerId.city}, ${r.dealerId.state || ''}` : ''}</div>
        </div>
      ),
    },
    {
      header: 'Allocated VIN / Chassis',
      accessor: 'delivery',
      render: (r) => (
        <div>
          <div className="font-mono small font-semibold">
            {r.delivery?.chassisNo || r.delivery?.trackingNo || (
              <span className="text-warning">Allocation Pending</span>
            )}
          </div>
          {r.delivery?.engineNo && (
            <div className="muted small font-mono">Eng: {r.delivery.engineNo}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Order Value',
      accessor: 'amount',
      render: (r) => (
        <span className="font-mono font-medium text-slate-900">
          {formatCurrency(r.amount || 0)}
        </span>
      ),
    },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => setDetailOrderId(r._id)}
          >
            Details
          </Button>
          {r.status !== 'DELIVERED' && r.status !== 'CANCELLED' && (
            <Button
              size="sm"
              variant="primary"
              icon={Edit3}
              onClick={() => openStatusModal(r)}
            >
              Update Status
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="oem-orders-page space-y-6">
      <PageHeader
        title="OEM Supply Orders & Factory Dispatch Pipeline"
        subtitle="Manage factory chassis allocation, commercial invoices, and dealership dispatch logistics"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Supply Orders' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Sync Orders
          </Button>
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
          <div className="flex gap-2 items-center flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-muted pointer-events-none" />
              <input
                type="text"
                className="form-control pl-9"
                placeholder="Search by order no..."
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
              <option value="PLACED">Placed (Needs VIN)</option>
              <option value="PROCESSING">Processing (VIN Stamped)</option>
              <option value="DISPATCHED">Dispatched (In Transit)</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={orders}
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
          emptyTitle="No supply orders found"
          emptyText="No institutional orders matching your filter criteria were found."
        />
      </Card>

      {/* Update Order Status / Allocate VIN Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order Status · ${selectedOrder?.orderNo || '...'}`}
        subtitle="Advance order through factory fulfillment lifecycle with tracking telemetry"
        maxWidth="560px"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isUpdating}
              onClick={handleStatusSubmit}
            >
              Confirm Status Update
            </Button>
          </div>
        }
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Target Lifecycle State <span className="req-star">*</span></label>
            <select
              className="form-control"
              value={statusChoice}
              onChange={(e) => setStatusChoice(e.target.value)}
              required
            >
              {selectedOrder?.status === 'PLACED' && (
                 <option value="PROCESSING">PROCESSING (Allocate Chassis & Engine)</option>
              )}
              {selectedOrder?.status === 'PROCESSING' && (
                 <option value="DISPATCHED">DISPATCHED (Factory Gate-Out / Transit)</option>
              )}
              {selectedOrder?.status === 'DISPATCHED' && (
                 <option value="DELIVERED">DELIVERED (Handover Stamped by Dealer)</option>
              )}
              <option value={selectedOrder?.status}>{selectedOrder?.status} (Update Details Only)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">Chassis / VIN Number</label>
              <input
                type="text"
                className="form-control font-mono uppercase"
                placeholder="e.g. MA1TA2...9876"
                value={chassisInput}
                onChange={(e) => setChassisInput(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Engine Number</label>
              <input
                type="text"
                className="form-control font-mono uppercase"
                placeholder="e.g. E4N123456"
                value={engineInput}
                onChange={(e) => setEngineInput(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">Commercial Invoice Number</label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="e.g. INV-2026-9812"
                value={invoiceInput}
                onChange={(e) => setInvoiceInput(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Transit LR / Tracking No.</label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="e.g. TRK-MH-9988"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Fulfillment Note / Remarks</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Factory dispatch notes, carrier name, or handover remarks..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={Boolean(detailOrderId)}
        onClose={() => setDetailOrderId(null)}
        title={`Order Details: ${orderDetail?.orderNo || '...'}`}
        subtitle="Institutional CSD Supply Order Dossier"
        maxWidth="640px"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="outline" onClick={() => setDetailOrderId(null)}>
              Close
            </Button>
          </div>
        }
      >
        {loadingDetail ? (
          <div className="py-8 text-center text-muted">Loading order details...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg text-sm">
              <div>
                <span className="text-muted block text-xs">Order Number:</span>
                <span className="font-mono font-semibold text-brand">{orderDetail?.orderNo}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">Current Status:</span>
                <StatusBadge status={orderDetail?.status} />
              </div>
              <div>
                <span className="text-muted block text-xs">Dealership:</span>
                <span className="font-medium">{orderDetail?.dealerId?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">Regional Depot:</span>
                <span>{orderDetail?.depotId?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs">Order Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(orderDetail?.amount || 0)}
                </span>
              </div>
              <div>
                <span className="text-muted block text-xs">Created Date:</span>
                <span>{orderDetail?.createdAt ? new Date(orderDetail.createdAt).toLocaleString() : '—'}</span>
              </div>
            </div>

            {/* Vehicle Delivery & Allocation Info */}
            <div className="p-3 border rounded-lg bg-white text-sm">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Factory Dispatch & VIN Telemetry
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted block">Chassis / VIN:</span>
                  <span className="font-mono font-semibold">
                    {orderDetail?.delivery?.chassisNo || orderDetail?.delivery?.trackingNo || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Engine Number:</span>
                  <span className="font-mono font-semibold">{orderDetail?.delivery?.engineNo || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block">Invoice Number:</span>
                  <span className="font-mono">{orderDetail?.delivery?.invoiceNo || '—'}</span>
                </div>
                <div>
                  <span className="text-muted block">Dispatch Remarks:</span>
                  <span>{orderDetail?.delivery?.remarks || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
