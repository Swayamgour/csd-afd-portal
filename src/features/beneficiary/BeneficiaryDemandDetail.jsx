import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Truck,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Building,
  Store,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { LoadingState, EmptyState } from '../../components/common/States.jsx';
import { useGetDemandByIdQuery, useCancelDemandMutation } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryDemandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Beneficiary request');
  const [toast, setToast] = useState({ type: '', message: '' });

  const {
    data: demandData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDemandByIdQuery(id);

  const [cancelDemandMutation, { isLoading: isCancelling }] = useCancelDemandMutation();

  const demand = demandData?.data || demandData;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const handleCancel = async () => {
    try {
      await cancelDemandMutation({ id, reason: cancelReason }).unwrap();
      setCancelModalOpen(false);
      showToast('success', 'Demand has been cancelled successfully.');
      refetch();
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to cancel demand.'));
    }
  };

  if (isLoading) return <LoadingState message="Retrieving demand details from CSD database..." />;

  if (isError || !demand) {
    return (
      <EmptyState
        title="Demand Not Found"
        message={getErrorMessage(error, `The demand ${id} could not be located in records.`)}
        action={
          <Link to="/beneficiary/demands" className="btn btn-primary">
            Back to Demands
          </Link>
        }
      />
    );
  }

  const isPaymentPending =
    demand.status === 'CREATED' ||
    demand.status === 'PAYMENT_PENDING' ||
    demand.paymentStatus === 'PENDING' ||
    demand.paymentStatus === 'Pending';

  const product = demand.productId || {};
  const depot = demand.depotId || {};
  const dealer = demand.dealerId || {};
  const urc = demand.urcId || {};

  // Status mapping for milestone timeline
  const timelineItems = (demand.statusHistory && demand.statusHistory.length > 0)
    ? demand.statusHistory.map((h, i) => ({
        step: h.status?.replace(/_/g, ' '),
        date: new Date(h.changedAt || h.at || demand.createdAt).toLocaleDateString('en-IN'),
        status: i === demand.statusHistory.length - 1 ? 'current' : 'completed',
        note: h.comment || h.remarks || 'Status update logged',
      }))
    : [
        {
          step: 'Demand Created',
          date: new Date(demand.createdAt).toLocaleDateString('en-IN'),
          status: 'completed',
          note: `Demand No: ${demand.demandNo || demand._id}`,
        },
        {
          step: 'Treasury Payment',
          date: demand.status === 'PAID' ? 'Verified' : 'Pending',
          status: demand.status === 'PAID' ? 'completed' : isPaymentPending ? 'current' : 'pending',
          note: demand.status === 'PAID' ? 'Payment verified & recorded' : 'Awaiting payment confirmation',
        },
        {
          step: 'Depot Allocation & Supply Order',
          date: demand.supplyOrderNo ? 'Issued' : 'Pending',
          status: demand.supplyOrderNo ? 'completed' : 'pending',
          note: demand.supplyOrderNo || 'Pending on regional depot',
        },
        {
          step: 'Dealer Handover & Delivery',
          date: demand.status === 'DELIVERED' ? 'Completed' : 'Pending',
          status: demand.status === 'DELIVERED' ? 'completed' : 'pending',
          note: 'Final physical delivery',
        },
      ];

  return (
    <div className="demand-detail-page">
      <div className="mb-2">
        <Link to="/beneficiary/demands" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to All Demands
        </Link>
      </div>

      <PageHeader
        title={`Demand Details · ${demand.demandNo || demand._id?.slice(-8).toUpperCase()}`}
        subtitle={`Submitted on ${new Date(demand.createdAt).toLocaleDateString('en-IN')}`}
        badge={<StatusBadge status={demand.status} />}
        actions={
          <div className="row gap-1">
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh">
              <RefreshCw size={14} />
            </Button>
            {isPaymentPending && (
              <Button
                variant="primary"
                icon={CreditCard}
                onClick={() => navigate('/beneficiary/payments')}
              >
                Proceed to Payment
              </Button>
            )}
            {demand.status !== 'CANCELLED' && demand.status !== 'DELIVERED' && demand.status !== 'REJECTED' && (
              <Button
                variant="ghost"
                className="text-danger"
                icon={XCircle}
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Demand
              </Button>
            )}
          </div>
        }
      />

      {toast.message && (
        <div
          className={`alert-banner ${toast.type === 'error' ? 'error bg-red-50 text-red-800' : 'success'} mb-2 small`}
          role="alert"
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Grid: Left details & Right timeline */}
      <div className="grid-2-col gap-2 mb-3">
        {/* Left Column: Vehicle & Financial Breakdown */}
        <div className="left-col-stack flex-col gap-2">
          <Card title="Vehicle & Entitlement Summary">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Product Item:</span>
                <span className="font-semibold">{product.name || demand.productName || 'AFD Item'}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">AFD Category:</span>
                <span className="text-uppercase font-medium">{product.afdType || 'AFD-I'}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Quantity:</span>
                <span>{demand.quantity || 1} Unit</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Selected Colour:</span>
                <span>{demand.selectedColor || 'Standard'}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">SKU / Index:</span>
                <span className="font-mono">{product.sku || 'N/A'}</span>
              </div>
            </div>
          </Card>

          <Card title="Price & Financial Breakdown">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Base Concession Price:</span>
                <span>₹ {(demand.basePrice || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Applicable Tax & Levies:</span>
                <span>₹ {(demand.taxAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Total Sanction Amount:</span>
                <span className="h4 text-brand mb-0">
                  ₹ {(demand.totalPrice || demand.netPayable || 0).toLocaleString('en-IN')}
                </span>
              </div>
              {demand.loan?.isLoan && (
                <>
                  <div className="kv-row between small py-1 border-bottom">
                    <span className="muted">Bank Loan Component:</span>
                    <span className="font-semibold text-blue-800">
                      ₹ {(demand.loan.loanAmount || 0).toLocaleString('en-IN')} ({demand.loan.bankName || 'Bank'})
                    </span>
                  </div>
                  <div className="kv-row between small py-1 border-bottom">
                    <span className="muted">Net Self-Transfer:</span>
                    <span className="font-semibold text-slate-800">
                      ₹ {((demand.totalPrice || 0) - (demand.loan.loanAmount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}
              <div className="kv-row between small py-1">
                <span className="muted">Payment Status:</span>
                <span className={`font-semibold ${demand.status === 'PAID' ? 'text-green' : 'text-saffron'}`}>
                  ● {demand.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Regional Allocation">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted row align-center gap-1">
                  <Building size={14} /> Regional Depot:
                </span>
                <span className="font-medium">{depot.name || 'Assigned Depot'} ({depot.city || depot.code || ''})</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted row align-center gap-1">
                  <Store size={14} /> Authorized Dealer:
                </span>
                <span className="font-medium">{dealer.name || 'Assigned Dealer'}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted row align-center gap-1">
                  <Store size={14} /> Serving URC:
                </span>
                <span className="font-medium">{urc.name || 'Serving Canteen'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Status Timeline & Actions */}
        <div className="right-col-stack flex-col gap-2">
          <Card title="Application Tracking Timeline" subtitle="CSD Depot Milestone Status">
            <Timeline items={timelineItems} />
          </Card>

          {demand.remarks && (
            <Card title="Official Remarks / Notes">
              <p className="text-sm text-slate-700 m-0">{demand.remarks}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Demand Cancellation */}
      <ConfirmDialog
        open={cancelModalOpen}
        title="Cancel AFD Demand"
        message={`Are you sure you want to cancel Demand ${demand.demandNo || demand._id}? This will withdraw the allocation from the regional depot.`}
        confirmText={isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        confirmVariant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
