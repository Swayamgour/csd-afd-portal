import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { paymentService } from '../../services/payment.service.js';
import { demandService } from '../../services/demand.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BeneficiaryPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [pendingDemands, setPendingDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [paymentMode, setPaymentMode] = useState('sbi_epay');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, dList] = await Promise.all([
        paymentService.getPayments(),
        demandService.getDemands({ role: 'beneficiary', userId: user?.id })
      ]);
      setPayments(pList);
      setPendingDemands(dList.filter((d) => d.paymentStatus === 'Pending'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const initiatePayment = (dem) => {
    setSelectedDemand(dem);
    setPayModalOpen(true);
  };

  const handleCompletePayment = async () => {
    setProcessing(true);
    try {
      await paymentService.recordPayment({
        demandId: selectedDemand.id,
        beneficiaryName: user?.name,
        amount: selectedDemand.csdPrice,
        mode: paymentMode === 'sbi_epay' ? 'SBI Cyber Treasury (e-Pay)' : 'Bharatkosh Gateway',
        transactionRef: `SBIEP-${Date.now().toString().slice(-8)}`,
        bankName: 'State Bank of India',
        status: 'Verified'
      });
      await demandService.updateDemandStatus(selectedDemand.id, 'Payment_Completed', 'Payment realized via SBI Gateway');
      setPayModalOpen(false);
      setToast('Payment completed successfully. Treasury challan generated.');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      header: 'Receipt ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Demand ID', accessor: 'demandId' },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      render: (row) => <span className="font-bold">₹ {row.amount?.toLocaleString('en-IN')}</span>
    },
    { header: 'Payment Channel', accessor: 'mode' },
    { header: 'Bank Ref / Challan', accessor: 'transactionRef', render: (row) => <span className="font-mono small">{row.transactionRef}</span> },
    { header: 'Transaction Date', accessor: 'date' },
    {
      header: 'Treasury Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Receipt',
      accessor: 'id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Downloading Certified Treasury Receipt for ${row.id}`)}
        >
          <Download size={13} />
          <span>Receipt</span>
        </button>
      )
    }
  ];

  return (
    <div className="beneficiary-payments-page">
      <PageHeader
        title="AFD Payments & Treasury Challans"
        subtitle="Make payments through SBI Cyber Treasury or Bharatkosh and download certified fee receipts."
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Pending Demands requiring payment */}
      {pendingDemands.length > 0 && (
        <Card
          title="Sanctioned Demands Awaiting Payment"
          subtitle="Depot Sanction has been granted. Please initiate payment to trigger Supply Order release."
          className="mb-3 border-2 border-saffron bg-saffron-soft"
        >
          {pendingDemands.map((dem) => (
            <div key={dem.id} className="panel p-3 between align-center flex-wrap gap-2 mb-2 bg-white">
              <div>
                <span className="small text-brand font-bold block">{dem.id}</span>
                <h4 className="h4 mb-0">{dem.productName}</h4>
                <p className="small muted mb-0">Sanctioned Depot: <b>{dem.depot}</b></p>
              </div>

              <div className="row align-center gap-2">
                <div className="text-right">
                  <span className="small muted block">Sanction Amount</span>
                  <span className="h3 font-bold text-ink block">
                    ₹ {dem.csdPrice?.toLocaleString('en-IN')}
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
        subtitle={`Sanctioned Demand: ${selectedDemand?.id} · ${selectedDemand?.productName}`}
        maxWidth="520px"
        footer={
          <div className="modal-footer-btns">
            <Button variant="outline" onClick={() => setPayModalOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="primary" loading={processing} onClick={handleCompletePayment}>
              Authorize & Pay ₹ {selectedDemand?.csdPrice?.toLocaleString('en-IN')}
            </Button>
          </div>
        }
      >
        <div className="payment-modal-body">
          <div className="panel p-3 bg-bg mb-3 text-center">
            <span className="small muted block">Total Sanctioned CSD Price</span>
            <p className="h2 text-brand font-bold my-1">
              ₹ {selectedDemand?.csdPrice?.toLocaleString('en-IN')}
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
              <span className="micro muted">Net Banking / Cards / Branch Challan</span>
            </button>

            <button
              type="button"
              className={`panel p-2 flex-1 text-left ${paymentMode === 'bharatkosh' ? 'border-brand bg-brand-soft' : ''}`}
              onClick={() => setPaymentMode('bharatkosh')}
            >
              <span className="font-semibold small block">Bharatkosh Portal</span>
              <span className="micro muted">Non-Tax Receipt Portal (Govt. of India)</span>
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
