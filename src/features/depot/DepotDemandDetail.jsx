import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Check,
  X,
  CreditCard,
  Building,
  User,
  Truck,
  Printer,
  Calendar,
  Lock,
  Unlock,
  FileDown
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingState, ErrorState } from '../../components/common/States.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  useGetDemandByIdQuery,
  useGetDemandsQuery,
  useApproveDemandMutation,
  useRejectDemandMutation,
  useRecordPaymentDetailsMutation,
} from '../demand/demandApi.js';

export function DepotDemandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: rawDemand, isLoading, refetch } = useGetDemandByIdQuery(id);
  const { data: demandsData } = useGetDemandsQuery({}, { skip: Boolean(rawDemand) });

  const [approveDemand, { isLoading: isApproving }] = useApproveDemandMutation();
  const [rejectDemand, { isLoading: isRejecting }] = useRejectDemandMutation();
  const [recordPaymentDetails, { isLoading: isSavingPayment }] = useRecordPaymentDetailsMutation();

  const demand = React.useMemo(() => {
    if (rawDemand?.data) return rawDemand.data;
    if (rawDemand?._id || rawDemand?.id) return rawDemand;
    const list = Array.isArray(demandsData?.items)
      ? demandsData.items
      : Array.isArray(demandsData)
      ? demandsData
      : [];
    return list.find((d) => String(d._id || d.id) === String(id)) || null;
  }, [rawDemand, demandsData, id]);

  const [toastMessage, setToastMessage] = useState('');

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'NEFT/RTGS',
    bankName: '',
    branchName: '',
    transactionRef: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    receiptNo: '',
  });

  // Approval / Supply Order Form State
  const [approvalNote, setApprovalNote] = useState('');
  const [supplyOrderNo, setSupplyOrderNo] = useState('');
  const [showApprovalCard, setShowApprovalCard] = useState(false);

  // Reject Form State
  const [showRejectCard, setShowRejectCard] = useState(false);
  const [rejectReason, setRejectReason] = useState('Payment verification failed or invalid UTR');

  useEffect(() => {
    if (demand) {
      const p = demand.paymentDetails || {};
      setPaymentForm({
        paymentMethod: p.paymentMethod || demand.paymentMethod || 'NEFT/RTGS',
        bankName: p.bankName || '',
        branchName: p.branchName || '',
        transactionRef: p.transactionRef || p.utrNumber || '',
        amountPaid: p.amountPaid || demand.netPrice || demand.totalAmount || '',
        paymentDate: p.paymentDate ? p.paymentDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        receiptNo: p.receiptNo || '',
      });
      if (demand.supplyOrderNo) {
        setSupplyOrderNo(demand.supplyOrderNo);
      }
    }
  }, [demand]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!demand) return;
    try {
      await recordPaymentDetails({
        id: demand._id || demand.id,
        ...paymentForm,
        amountPaid: Number(paymentForm.amountPaid),
      }).unwrap();
      showToast('✓ Payment details recorded and verified successfully in depot register.');
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to record payment details');
    }
  };

  const handleApproveDemand = async (e) => {
    e.preventDefault();
    if (!demand) return;
    try {
      await approveDemand({
        id: demand._id || demand.id,
        note: approvalNote || 'Approved by Depot Manager. Supply order issued.',
        remarks: approvalNote || 'Approved by Depot Manager. Supply order issued.',
        supplyOrderNo: supplyOrderNo || `SO-DEPOT-${Date.now().toString().slice(-6)}`,
      }).unwrap();
      showToast('✓ Demand APPROVED successfully! Supply Order created and transmitted to OEM/Dealer.');
      setShowApprovalCard(false);
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to approve demand');
    }
  };

  const handleRejectDemand = async (e) => {
    e.preventDefault();
    if (!demand) return;
    try {
      await rejectDemand({
        id: demand._id || demand.id,
        reason: rejectReason,
      }).unwrap();
      showToast('Demand has been REJECTED. Notification sent to beneficiary.');
      setShowRejectCard(false);
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to reject demand');
    }
  };

  if (isLoading) {
    return <LoadingState text="Loading depot demand file..." />;
  }

  if (!demand && !isLoading) {
    return (
      <div className="page-container">
        <ErrorState
          title="Demand Not Found"
          message={`Unable to locate demand record with ID: ${id}`}
          action={
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/depot/demands')}
            >
              Back to Demands Register
            </Button>
          }
        />
      </div>
    );
  }

  const userObj = demand.beneficiary || demand.user || {};
  const productObj = demand.product || {};
  const status = demand.status || 'SUBMITTED';
  const isApproved = status === 'APPROVED' || status === 'COMPLETED';
  const isRejected = status === 'REJECTED';
  const canAct = !isApproved && !isRejected;

  return (
    <div className="page-container">
      <PageHeader
        title={`Demand File: ${demand.demandNumber || id}`}
        subtitle={`Registered on ${formatDate(demand.createdAt)} · CSD Depot Processing`}
        breadcrumbs={[
          { label: 'Depot Portal', href: '/depot/dashboard' },
          { label: 'Demands Register', href: '/depot/demands' },
          { label: demand.demandNumber || id },
        ]}
        actions={
          <div className="flex-gap-sm flex-wrap">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate('/depot/demands')}
            >
              Back to Register
            </Button>
            {demand.paymentDetails?.receiptNo && (
              <Button
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
            )}
            {canAct && (
              <>
                <Button
                  variant="success"
                  icon={CheckCircle2}
                  onClick={() => {
                    setShowApprovalCard(true);
                    setShowRejectCard(false);
                  }}
                >
                  Approve & Issue Supply Order
                </Button>
                <Button
                  variant="danger"
                  icon={AlertCircle}
                  onClick={() => {
                    setShowRejectCard(true);
                    setShowApprovalCard(false);
                  }}
                >
                  Reject Demand
                </Button>
              </>
            )}
          </div>
        }
      />

      {toastMessage && (
        <div className="alert alert-success row align-center gap-1 mb-2">
          <CheckCircle2 size={18} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* APPROVAL WORKFLOW CARD */}
      {showApprovalCard && (
        <div className="card mb-2" style={{ borderColor: '#86efac', background: '#f0fdf4' }}>
          <div className="card-header" style={{ background: '#dcfce7', borderBottomColor: '#bbf7d0' }}>
            <h3 className="card-title text-success row align-center gap-1">
              <CheckCircle2 size={18} />
              Finalize Demand Approval & Generate Supply Order
            </h3>
          </div>
          <form onSubmit={handleApproveDemand} className="card-body">
            <p className="muted small mb-1">
              Approving this demand verifies that the beneficiary entitlement is valid, payment is confirmed, and authorizes the OEM to deliver the vehicle through the designated dealer.
            </p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Official Depot Supply Order No. *</label>
                <input
                  type="text"
                  required
                  className="form-control font-mono"
                  placeholder="e.g. SO/DEPOT/2026/089"
                  value={supplyOrderNo}
                  onChange={(e) => setSupplyOrderNo(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Approval Remarks / Sanction Authority</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Scrutinized and sanctioned as per AFD guidelines"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => setShowApprovalCard(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" loading={isApproving}>
                Confirm Sanction & Approve
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* REJECTION WORKFLOW CARD */}
      {showRejectCard && (
        <div className="card mb-2" style={{ borderColor: '#fca5a5', background: '#fff5f5' }}>
          <div className="card-header" style={{ background: '#fef2f2', borderBottomColor: '#fecaca' }}>
            <h3 className="card-title text-danger row align-center gap-1">
              <AlertCircle size={18} />
              Reject Demand Application
            </h3>
          </div>
          <form onSubmit={handleRejectDemand} className="card-body">
            <p className="muted small mb-1">
              Please specify the statutory justification for rejecting this demand. The applicant will be notified immediately.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <select
                className="form-select"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              >
                <option value="Payment verification failed or invalid UTR">Payment verification failed or invalid UTR</option>
                <option value="Availability certificate expired or invalid dealer mapping">Availability certificate expired or invalid dealer mapping</option>
                <option value="Military canteen card details do not match entitlement record">Military canteen card details do not match entitlement record</option>
                <option value="Vehicle price discrepancy between dealer and CSD master rate">Vehicle price discrepancy between dealer and CSD master rate</option>
                <option value="Quota ceiling exceeded for rank category">Quota ceiling exceeded for rank category</option>
                <option value="Cancelled at customer request">Cancelled at customer request</option>
              </select>
            </div>
            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => setShowRejectCard(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" loading={isRejecting}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Overview Status Bar */}
      <div className="card mb-2">
        <div className="card-body p-2 row between align-center flex-wrap gap-1">
          <div className="row align-center gap-1">
            <div className="user-avatar-circle-sm" style={{ width: 44, height: 44, fontSize: '1.2rem', background: '#eff6ff', color: '#1e4fd8' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="fw-bold fs-md color-ink font-mono">{demand.demandNumber || demand._id}</div>
              <div className="muted fs-xs">
                Beneficiary: <strong>{userObj.name || userObj.username || 'Applicant'}</strong> ({userObj.rank || 'N/A'}, {userObj.serviceNumber || 'No Service No.'})
              </div>
            </div>
          </div>
          <div className="row align-center gap-1 flex-wrap">
            <span className="muted fs-xs">Demand Status:</span>
            <StatusBadge status={status} />
            {demand.supplyOrderNo && (
              <span className="badge badge-success ml-1 font-mono">
                SO: {demand.supplyOrderNo}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2-col gap-1">
        {/* CUSTOMER & ENTITLEMENT PROFILE */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <User size={18} />
              1. Customer Identity & Service Records
            </h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div>
                <label className="form-label text-muted">Beneficiary Full Name</label>
                <div className="fw-semibold">{userObj.name || userObj.username || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Service / Force Number</label>
                <div className="font-mono fw-bold">{userObj.serviceNumber || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Rank / Designation</label>
                <div>{userObj.rank || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Service Branch</label>
                <div>{userObj.service || userObj.organization || 'Indian Army'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Canteen Grocery Card ID</label>
                <div className="font-mono">{userObj.cardId || userObj.chipNumber || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Registered Phone</label>
                <div className="font-mono">{userObj.mobile || userObj.phone || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">PAN Card Number</label>
                <div className="font-mono">{userObj.pan || userObj.panNumber || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Parent Depot / URC</label>
                <div>{demand.depotName || demand.depot || 'National Depot'} / {demand.urcName || demand.urc || 'HQ URC'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER & VEHICLE ALLOCATION */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title row align-center gap-1">
              <Truck size={18} />
              2. Vehicle & Financial Allocation
            </h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label text-muted">Product / Vehicle Model</label>
                <div className="fw-bold fs-md color-ink">{productObj.name || demand.productName || 'AFD Item'}</div>
              </div>
              <div>
                <label className="form-label text-muted">CSD Index / SKU Code</label>
                <div className="font-mono">{productObj.sku || productObj.indexNo || demand.sku || 'N/A'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Selected Color</label>
                <div>{demand.selectedColor || demand.color || 'Standard'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Chassis Number</label>
                <div className="font-mono">{demand.chassisNo || 'Allocated upon supply order'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Engine Number</label>
                <div className="font-mono">{demand.engineNo || 'Allocated upon supply order'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Designated Dealer</label>
                <div>{demand.dealerName || demand.dealer?.name || 'Authorized CSD Dealer'}</div>
              </div>
              <div>
                <label className="form-label text-muted">Final Net Concessional Price</label>
                <div className="fw-bold color-ink fs-md font-mono">
                  {formatCurrency(demand.netPrice || demand.totalAmount || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT RECORDING & DETAILS SECTION */}
      <div className="card mt-1">
        <div className="card-header between">
          <h3 className="card-title row align-center gap-1">
            <CreditCard size={18} />
            3. Depot Payment Accounting & Challan Register
          </h3>
          {demand.paymentDetails?.transactionRef && (
            <span className="badge badge-success">✓ Payment Details Verified</span>
          )}
        </div>
        <form onSubmit={handleSavePayment} className="card-body">
          <p className="muted small mb-1">
            Record direct bank transfer (NEFT/RTGS), cyber treasury challan, or online gateway transaction reference to clear the demand for supply order generation.
          </p>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select
                className="form-select"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              >
                <option value="NEFT/RTGS">NEFT / RTGS Bank Transfer</option>
                <option value="Treasury Challan">SBI Treasury Challan</option>
                <option value="Online Payment Gateway">Online Payment Gateway</option>
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Remitting Bank Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. State Bank of India"
                value={paymentForm.bankName}
                onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Branch / IFSC</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. New Delhi Main Branch"
                value={paymentForm.branchName}
                onChange={(e) => setPaymentForm({ ...paymentForm, branchName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank UTR / Transaction Reference *</label>
              <input
                type="text"
                required
                className="form-control font-mono"
                placeholder="e.g. SBIN123456789012"
                value={paymentForm.transactionRef}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount Deposited (₹) *</label>
              <input
                type="number"
                required
                className="form-control font-mono"
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Date *</label>
              <input
                type="date"
                required
                className="form-control font-mono"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Depot Cash Receipt / Ack No.</label>
              <input
                type="text"
                className="form-control font-mono"
                placeholder="e.g. CR-2026-9081"
                value={paymentForm.receiptNo}
                onChange={(e) => setPaymentForm({ ...paymentForm, receiptNo: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions mt-1">
            <Button
              type="submit"
              loading={isSavingPayment}
            >
              Update Payment Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepotDemandDetail;
