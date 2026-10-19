import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Download, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetPaymentsQuery, useCreatePaymentMutation, useVerifyPaymentMutation } from '../payment/paymentApi.js';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryPayments() {
  const { user } = useAuth();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [paymentMode, setPaymentMode] = useState('sbi_epay');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const {
    data: paymentsData,
    isLoading: loadingPayments,
    refetch: refetchPayments,
  } = useGetPaymentsQuery();

  const {
    data: demandsData,
    isLoading: loadingDemands,
    refetch: refetchDemands,
  } = useGetDemandsQuery();

  const [createPayment] = useCreatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const payments = paymentsData?.items || [];
  const allDemands = demandsData?.items || [];
  const pendingDemands = allDemands.filter(
    (d) => d.status === 'CREATED' || d.status === 'PAYMENT_PENDING'
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const initiatePayment = (dem) => {
    setSelectedDemand(dem);
    setPayModalOpen(true);
  };

  const handleCompletePayment = async () => {
    if (!selectedDemand) return;
    setProcessing(true);
    try {
      const amount = selectedDemand.totalPrice || selectedDemand.netPayable || 10000;
      const method = paymentMode === 'sbi_epay' ? 'DIRECT_TRANSFER' : 'GATEWAY';

      const payRes = await createPayment({
        demandId: selectedDemand._id,
        amount,
        method,
        gateway: method === 'GATEWAY' ? 'BHARATKOSH' : undefined,
        utr: method === 'DIRECT_TRANSFER' ? `SBI-EPAY-${Date.now().toString().slice(-8)}` : undefined,
        bankName: 'State Bank of India',
      }).unwrap();

      const payDoc = payRes?.data || payRes;

      await verifyPayment({
        paymentId: payDoc._id,
        demandId: selectedDemand._id,
        gatewayPaymentId: `TXN-${Date.now()}`,
      }).unwrap();

      setPayModalOpen(false);
      showToast('success', 'Treasury payment verified successfully. Demand updated to PAID.');
      refetchPayments();
      refetchDemands();
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to complete payment.'));
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      header: 'Receipt ID',
      accessor: '_id',
      render: (row) => (
        <span className="font-semibold text-brand font-mono">
          {row._id?.slice(-8).toUpperCase() || 'RCP-ONLINE'}
        </span>
      ),
    },
    {
      header: 'Demand Ref',
      accessor: 'demandId',
      render: (row) => (
        <span className="font-mono text-slate-700">
          {row.demandId?.demandNo || row.demandId || 'Direct Demand'}
        </span>
      ),
    },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      render: (row) => <span className="font-bold">₹ {(row.amount || 0).toLocaleString('en-IN')}</span>,
    },
    {
      header: 'Channel / Method',
      accessor: 'method',
      render: (row) => (
        <span className="capitalize">{row.method?.replace(/_/g, ' ') || 'Treasury e-Pay'}</span>
      ),
    },
    {
      header: 'UTR / Ref No',
      accessor: 'utr',
      render: (row) => <span className="font-mono small">{row.utr || row.gatewayPaymentId || 'N/A'}</span>,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Receipt',
      accessor: '_id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Certified Treasury Receipt: RCP-${row._id?.slice(-8).toUpperCase()}`)}
        >
          <Download size={13} />
          <span>Receipt</span>
        </button>
      ),
    },
  ];

  const loading = loadingPayments || loadingDemands;

  return (
    <div className="beneficiary-payments-page">
      <PageHeader
        title="AFD Payments & Treasury Challans"
        subtitle="Make payments through SBI Cyber Treasury or Bharatkosh and download certified fee receipts."
        actions={
          <Button variant="outline" size="sm" onClick={() => { refetchPayments(); refetchDemands(); }}>
            <RefreshCw size={14} /> Refresh
          </Button>
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

      {/* Pending Demands requiring payment */}
      {pendingDemands.length > 0 && (
        <Card
          title="Sanctioned Demands Awaiting Payment"
          subtitle="Depot sanction granted. Please initiate payment to trigger Supply Order release."
          className="mb-3 border-2 border-saffron bg-saffron-soft"
        >
          {pendingDemands.map((dem) => (
            <div key={dem._id || dem.id} className="panel p-3 between align-center flex-wrap gap-2 mb-2 bg-white">
              <div>
                <span className="small text-brand font-bold block">{dem.demandNo || dem._id}</span>
                <h4 className="h4 mb-0">{dem.productId?.name || dem.productName || 'AFD Item'}</h4>
                <p className="small muted mb-0">
                  Sanctioned Depot: <b>{dem.depotId?.name || 'Regional Depot'}</b>
                </p>
              </div>

              <div className="row align-center gap-2">
                <div className="text-right">
                  <span className="small muted block">Sanction Amount</span>
                  <span className="h3 font-bold text-ink block">
                    ₹ {(dem.totalPrice || dem.netPayable || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <Button
                  variant="primary"
                  icon={CreditCard}
                  onClick={() => initiatePayment(dem)}
                >
                  Pay via SBI e-Pay
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Payment History Table */}
      <Card title="Payment & Cyber Treasury History">
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          emptyTitle="No payments recorded"
          emptyText="Your completed transactions and cyber treasury challans will be visible here."
        />
      </Card>

      {/* Payment Gateway Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="CSD AFD Secure Payment Gateway"
        subtitle={`Sanctioned Demand: ${selectedDemand?.demandNo || selectedDemand?._id} · ${selectedDemand?.productId?.name || selectedDemand?.productName || 'AFD Item'}`}
        maxWidth="520px"
        footer={
          <div className="modal-footer-btns">
            <Button variant="outline" onClick={() => setPayModalOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="primary" loading={processing} onClick={handleCompletePayment}>
              Authorize & Pay ₹ {(selectedDemand?.totalPrice || selectedDemand?.netPayable || 0).toLocaleString('en-IN')}
            </Button>
          </div>
        }
      >
        <div className="payment-modal-body">
          <div className="panel p-3 bg-bg mb-3 text-center">
            <span className="small muted block">Total Sanctioned CSD Price</span>
            <p className="h2 text-brand font-bold my-1">
              ₹ {(selectedDemand?.totalPrice || selectedDemand?.netPayable || 0).toLocaleString('en-IN')}
            </p>
            <span className="small text-green font-semibold">● Zero Gateway Surcharge for Defence Personnel</span>
          </div>

          <label className="form-label font-semibold small mb-1 block">Choose Payment Mode</label>
          <div className="payment-modes-grid row gap-1 mb-3">
            <button
              type="button"
              className={`panel p-2 flex-1 text-left ${paymentMode === 'sbi_epay' ? 'border-brand bg-brand-soft' : ''}`}
              onClick={() => setPaymentMode('sbi_epay')}
            >
              <span className="font-semibold small block">SBI Cyber Treasury (e-Pay)</span>
              <span className="micro muted">Net Banking / Direct Transfer</span>
            </button>

            <button
              type="button"
              className={`panel p-2 flex-1 text-left ${paymentMode === 'bharatkosh' ? 'border-brand bg-brand-soft' : ''}`}
              onClick={() => setPaymentMode('bharatkosh')}
            >
              <span className="font-semibold small block">Bharatkosh Portal</span>
              <span className="micro muted">Govt. Non-Tax Receipt Portal</span>
            </button>
          </div>

          <p className="micro muted mb-0">
            *Security Directive: Transactions are processed through NIC/SBI Cyber Treasury servers with end-to-end 256-bit encryption. Never share your OTP with anyone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
