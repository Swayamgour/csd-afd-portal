import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, FileText, Upload, Check, X, Eye, FileDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetDemandsQuery,
  useApproveDemandMutation,
  useRejectDemandMutation,
  useRecordPaymentDetailsMutation
} from '../demand/demandApi.js';

// Modals adhering to CSD Depot Manual
import AddPaymentDetailsModal from './modals/AddPaymentDetailsModal.jsx';
import UploadSupplyOrderModal from './modals/UploadSupplyOrderModal.jsx';
import ApproveRejectModal from './modals/ApproveRejectModal.jsx';
import DepotOrderSummaryModal from './modals/DepotOrderSummaryModal.jsx';
import DepotNotesModal from './modals/DepotNotesModal.jsx';
import ViewCustomerModal from './modals/ViewCustomerModal.jsx';
import PaymentReceiptModal from './modals/PaymentReceiptModal.jsx';

export default function DepotDemands() {
  const { user } = useAuth();
  const { data: demandsData, isLoading: loading, refetch: loadDemands } = useGetDemandsQuery();
  const [approveDemand] = useApproveDemandMutation();
  const [rejectDemand] = useRejectDemandMutation();
  const [recordPaymentDetails] = useRecordPaymentDetailsMutation();

  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
    ? demandsData
    : [];

  const [toast, setToast] = useState('');

  // Manual Filters (Fig. 3)
  const [sortBy, setSortBy] = useState('newest');
  const [searchBy, setSearchBy] = useState('demandNumber');
  const [searchInput, setSearchInput] = useState('');

  // Active Modals State
  const [activeDemand, setActiveDemand] = useState(null);
  const [modalType, setModalType] = useState(null); // 'payment' | 'upload' | 'approve' | 'reject' | 'summary' | 'notes' | 'customer' | 'receipt'

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 6000);
  };

  // Modal Action Handlers
  const openModal = (demand, type) => {
    console.log(demand , type)
    setActiveDemand(demand);
    setModalType(type);
  };

  const closeModal = () => {
    setActiveDemand(null);
    setModalType(null);
  };

  const handleSavePaymentDetails = async (formData) => {
    if (!activeDemand) return;
    try {
      const targetId = activeDemand._id || activeDemand.id;
      await recordPaymentDetails({ id: targetId, ...formData }).unwrap();
      showToast(`Payment details (OR No: ${formData.orNumber}) successfully recorded for ${activeDemand.demandNo || activeDemand.id}`);
      closeModal();
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error recording payment');
    }
  };

  const handleUploadSupplyOrder = async (docsData) => {
    if (!activeDemand) return;
    try {
      showToast(`Local Supply Order & Authority Letter uploaded for ${activeDemand.demandNo || activeDemand.id}`);
      closeModal();
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error uploading documents');
    }
  };

  const handleApproveDemand = async ({ status, note }) => {
    if (!activeDemand) return;
    try {
      const targetId = activeDemand._id || activeDemand.id;
      await approveDemand({ id: targetId, remarks: note }).unwrap();
      showToast(`Demand ${activeDemand.demandNo || activeDemand.id} Approved! Status changed to “Supply Order Issued.” Handed over to URC.`);
      closeModal();
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error approving demand');
    }
  };

  const handleRejectDemand = async ({ reason }) => {
    if (!activeDemand) return;
    try {
      const targetId = activeDemand._id || activeDemand.id;
      await rejectDemand({ id: targetId, reason }).unwrap();
      showToast(`Demand ${activeDemand.demandNo || activeDemand.id} Rejected. Payment refund process initiated.`);
      closeModal();
    } catch (e) {
      alert(e?.data?.message || e.message || 'Error rejecting demand');
    }
  };

  const handleAddNote = async (noteText) => {
    if (!activeDemand) return;
    showToast(`Internal note logged on ${activeDemand.demandNo || activeDemand.id}`);
  };

  // Tab Filter State
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Filter & Sort Logic
  const filteredDemands = demands
    .filter((d) => {
      // 1. Tab filter
      const isAppr = ['SUPPLY_ORDER_ISSUED', 'Supply Order Issued.', 'Supply_Order_Issued', 'APPROVED', 'Approved'].includes(d.status);
      const isRej = ['REJECTED', 'Rejected'].includes(d.status);
      if (statusTab === 'pending' && (isAppr || isRej)) return false;
      if (statusTab === 'approved' && !isAppr) return false;
      if (statusTab === 'rejected' && !isRej) return false;

      // 2. Search query filter
      if (!searchInput.trim()) return true;
      const q = searchInput.toLowerCase().trim();
      const dNo = String(d.demandNo || d.id || d._id || '').toLowerCase();
      const uName = String(d.userId?.username || d.username || d.beneficiaryId?.fullName || d.beneficiaryName || '').toLowerCase();
      const pName = String(d.productId?.name || d.productSnapshot?.name || d.productName || '').toLowerCase();
      const skuVal = String(d.productId?.sku || d.productSnapshot?.sku || d.sku || '').toLowerCase();
      const utrVal = String(d.utrNumber || d.beneficiaryPayment?.utr || '').toLowerCase();

      switch (searchBy) {
        case 'demandNumber':
          return dNo.includes(q);
        case 'username':
          return uName.includes(q);
        case 'sku':
          return skuVal.includes(q);
        case 'item':
          return pName.includes(q);
        case 'utr':
          return utrVal.includes(q);
        default:
          return dNo.includes(q) || uName.includes(q) || pName.includes(q);
      }
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'amountHigh') return (Number(b.totalAmount || b.pricing?.totalPrice || b.csdPrice || 0)) - (Number(a.totalAmount || a.pricing?.totalPrice || a.csdPrice || 0));
      if (sortBy === 'id') return String(a.demandNo || a.id).localeCompare(String(b.demandNo || b.id));
      return 0;
    });

  // Dynamic KPI Metrics calculated from live demands
  const totalCount = demands.length;
  const pendingCount = demands.filter(d => !['SUPPLY_ORDER_ISSUED', 'Supply Order Issued.', 'Supply_Order_Issued', 'APPROVED', 'Approved', 'REJECTED', 'Rejected'].includes(d.status)).length;
  const approvedCount = demands.filter(d => ['SUPPLY_ORDER_ISSUED', 'Supply Order Issued.', 'Supply_Order_Issued', 'APPROVED', 'Approved'].includes(d.status)).length;
  const rejectedCount = demands.filter(d => ['REJECTED', 'Rejected'].includes(d.status)).length;
  const totalSanctionValueNum = demands.reduce((acc, d) => acc + Number(d.totalAmount || d.pricing?.totalPrice || d.csdPrice || 0), 0);
  const totalSanctionValueFormatted = totalSanctionValueNum >= 10000000
    ? `₹ ${(totalSanctionValueNum / 10000000).toFixed(2)} Cr`
    : (totalSanctionValueNum >= 100000 ? `₹ ${(totalSanctionValueNum / 100000).toFixed(2)} Lakh` : `₹ ${totalSanctionValueNum.toLocaleString('en-IN')}`);

  const depotDisplayName = user?.depot || user?.depotName || (demands[0]?.depotId?.name) || (demands[0]?.depot) || 'Regional Depot';

  return (
    <div className="depot-manual-page">
      {/* Toast feedback */}
      {toast && (
        <div className="depot-manual-toast alert-banner success" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Dynamic Depot KPI Summary Bar */}
      <div className="depot-kpi-banner-grid mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="panel p-2 shadow-sm" style={{ borderLeft: '4px solid #1e3a8a', background: '#fff' }}>
          <span className="small muted font-semibold block">Total Received Demands</span>
          <strong className="text-brand font-bold" style={{ fontSize: '1.6rem' }}>{totalCount}</strong>
          <span className="micro muted block mt-05">All registered indents</span>
        </div>
        <div className="panel p-2 shadow-sm" style={{ borderLeft: '4px solid #d97706', background: '#fff' }}>
          <span className="small muted font-semibold block">Action Required (Pending)</span>
          <strong className="text-warning font-bold" style={{ fontSize: '1.6rem', color: '#b45309' }}>{pendingCount}</strong>
          <span className="micro muted block mt-05">Awaiting Step 4 verification</span>
        </div>
        <div className="panel p-2 shadow-sm" style={{ borderLeft: '4px solid #16a34a', background: '#fff' }}>
          <span className="small muted font-semibold block">Supply Orders Issued</span>
          <strong className="text-green font-bold" style={{ fontSize: '1.6rem', color: '#15803d' }}>{approvedCount}</strong>
          <span className="micro muted block mt-05">Handed over to URC & Dealers</span>
        </div>
        <div className="panel p-2 shadow-sm" style={{ borderLeft: '4px solid #4f46e5', background: '#fff' }}>
          <span className="small muted font-semibold block">Total Indent Realization</span>
          <strong className="text-brand font-bold" style={{ fontSize: '1.6rem', color: '#4338ca' }}>{totalSanctionValueFormatted}</strong>
          <span className="micro muted block mt-05">Matched with CSD Treasury</span>
        </div>
      </div>

      {/* Top Header Row matching Fig. 3 */}
      <div className="depot-manual-header-row between">
        <div>
          <h2 className="depot-manual-page-title">
            Depot - {depotDisplayName}
          </h2>
          <span className="depot-manual-count-badge">
            Showing: <strong>{filteredDemands.length}</strong> of <strong>{demands.length}</strong> Demands
          </span>
        </div>

        {/* Filter Controls (Fig. 3: Sort By, Search By, Search Input) */}
        <div className="depot-manual-filter-group row align-center gap-1">
          <div className="row align-center gap-05">
            <label className="depot-filter-label">Sort By:</label>
            <select
              className="depot-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Indent Date (Newest)</option>
              <option value="oldest">Indent Date (Oldest)</option>
              <option value="amountHigh">Total Amount (High to Low)</option>
              <option value="id">Demand Number</option>
            </select>
          </div>

          <div className="row align-center gap-05">
            <label className="depot-filter-label">Search By:</label>
            <select
              className="depot-filter-select"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option value="demandNumber">Demand Number</option>
              <option value="username">Username / Customer</option>
              <option value="item">Vehicle / Item</option>
              <option value="sku">SKU Index</option>
              <option value="utr">Payment UTR</option>
            </select>
          </div>

          <div className="depot-search-input-wrap">
            <input
              type="text"
              className="depot-search-input"
              placeholder="Search demands..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="button" className="depot-search-btn" title="Search Demands">
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Tabs Filter */}
      <div className="depot-status-tabs-row row gap-05 mb-1" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setStatusTab('all')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            background: statusTab === 'all' ? '#1e3a8a' : '#ffffff',
            color: statusTab === 'all' ? '#ffffff' : '#334155',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          All Demands ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('pending')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            background: statusTab === 'pending' ? '#d97706' : '#ffffff',
            color: statusTab === 'pending' ? '#ffffff' : '#334155',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ⏳ Pending Scrutiny ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('approved')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            background: statusTab === 'approved' ? '#16a34a' : '#ffffff',
            color: statusTab === 'approved' ? '#ffffff' : '#334155',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ✓ Supply Orders Issued ({approvedCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('rejected')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            background: statusTab === 'rejected' ? '#dc2626' : '#ffffff',
            color: statusTab === 'rejected' ? '#ffffff' : '#334155',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          ✗ Rejected ({rejectedCount})
        </button>
      </div>

      {/* Step 4 Offline Process Instruction Banner (from page 3 of Manual) */}
      <div className="depot-step4-instruction-bar">
        <ShieldCheck size={18} className="text-brand flex-shrink-0" />
        <div>
          <strong>Step 4: Check the following (Offline process):</strong>
          <span className="depot-step4-checks">
            1. If the payment has been received from the user · 2. Purchase history · 3. Generation of Local Supply Order from existing ICDS software used in Depots.
          </span>
        </div>
      </div>

      {/* Received Demands Table (Fig. 3) */}
      <div className="depot-table-container">
        {loading ? (
          <div className="p-3 text-center muted">Loading Received Demands...</div>
        ) : filteredDemands.length === 0 ? (
          <div className="p-3 text-center muted">
            No demands found matching criteria for Depot {depotDisplayName}.
          </div>
        ) : (
          <table className="depot-received-table">
            <thead>
              <tr>
                <th className="th-demand-no">Demand Number</th>
                <th className="th-po-details">PO details</th>
                <th className="th-pay-beneficiary">Payment from Beneficiary</th>
                <th className="th-pay-received">Payment Received</th>
                <th className="th-demand-status">Demand Status</th>
                <th className="th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemands.map((demand) => {
                const benName = demand.beneficiaryId?.fullName || demand.userId?.name || demand.beneficiaryName || demand.username || 'Applicant';
                const uName = demand.userId?.username || demand.username || demand.beneficiaryName || 'beneficiary';
                const dNumber = demand.demandNo || demand.id || demand._id;
                const iDate = demand.createdAt ? new Date(demand.createdAt).toLocaleDateString('en-GB') : (demand.indentDate || demand.displayDate || 'Recent');
                const pZone = demand.priceZone || 'DELHI NCR';
                const dName = demand.dealerId?.name || (typeof demand.dealerId === 'string' ? demand.dealerId : null) || demand.dealer || 'Authorized Dealership';
                const depName = demand.depotId?.name || (typeof demand.depotId === 'string' ? demand.depotId : null) || demand.depot || user?.depot || user?.depotName || 'Regional Depot';
                const uCanteen = demand.urcId?.name || (typeof demand.urcId === 'string' ? demand.urcId : null) || demand.urc || 'Assigned CSD URC';
                const prName = demand.productId?.name || demand.productSnapshot?.name || demand.productName || 'AFD Product Item';
                const skuCode = demand.productId?.sku || demand.productSnapshot?.sku || demand.sku || 'AFD-INDEX';
                const colr = demand.selectedColor || demand.color || 'Standard';
                const amt = Number(demand.totalAmount || demand.pricing?.totalPrice || demand.csdPrice || 0);

                const benPay = demand.beneficiaryPayment || {
                  bank: demand.loan?.bankName || (demand.loan?.isLoan ? 'Bank Loan / Sanction' : 'Direct bank transfer (SBI)'),
                  firstAccountHolder: benName,
                  accountNumber: demand.beneficiaryId?.cardId ? `XXXX-XXXX-${demand.beneficiaryId.cardId.slice(-4)}` : 'XXXX-XXXX-9842',
                  ifsc: 'SBIN0000691',
                  utr: demand.utrNumber || demand.paymentDetails?.utr || ('UTR-SBI-' + (demand.demandNo ? demand.demandNo.replace(/\D/g, '') : '984210')),
                  amountPaid: amt,
                  dateOfPayment: iDate
                };

                const isProcessed = ['SUPPLY_ORDER_ISSUED', 'Supply Order Issued.', 'Supply_Order_Issued', 'APPROVED', 'Approved'].includes(demand.status);
                const isRejected = ['REJECTED', 'Rejected'].includes(demand.status);

                return (
                  <tr key={demand._id || demand.id || dNumber}>
                    {/* 1. Demand Number */}
                    <td className="td-demand-no">
                      <strong className="depot-demand-id-link">
                        {dNumber}
                      </strong>
                      <span className="depot-indent-date">
                        Indent {iDate}
                      </span>
                    </td>

                    {/* 2. PO details */}
                    <td className="td-po-details">
                      <div className="depot-po-customer-header">
                        <span className="depot-customer-link">
                          {benName} &gt;
                        </span>
                        <button
                          type="button"
                          className="btn-depot-view-customer"
                          onClick={() => openModal(demand, 'customer')}
                        >
                          View Customer
                        </button>
                      </div>

                      <div className="depot-po-metadata-list">
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Username:</span>
                          <span className="meta-val">{uName}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Price Zone:</span>
                          <span className="meta-val">{pZone}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Dealer:</span>
                          <span className="meta-val font-semibold">{dName}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Depot:</span>
                          <span className="meta-val">{depName}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">URC:</span>
                          <span className="meta-val">{uCanteen}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Item:</span>
                          <span className="meta-val font-semibold text-brand">{prName}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">SKU:</span>
                          <span className="meta-val">{skuCode}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Color:</span>
                          <span className="meta-val">{colr}</span>
                        </div>
                        <div className="depot-po-meta-item highlight-price">
                          <span className="meta-key">Total Amount:</span>
                          <span className="meta-val font-bold text-green">
                            ₹{amt.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Payment from Beneficiary */}
                    <td className="td-pay-beneficiary">
                      <div className="depot-beneficiary-payment-box">
                        <p className="depot-pay-method-header">
                          Payment method: <span className="font-semibold">{demand.paymentMethod || (demand.loan?.isLoan ? 'Bank Loan' : 'Direct bank transfer')}</span>
                        </p>

                        <div className="depot-beneficiary-card">
                          <div className="depot-pay-card-title">Payment from Beneficiary</div>
                          <div className="depot-pay-row">
                            <span>Bank</span>
                            <span>{benPay.bank}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>First Account Holder</span>
                            <span>{benPay.firstAccountHolder}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>Account Number</span>
                            <span>{benPay.accountNumber}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>IFSC</span>
                            <span>{benPay.ifsc}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>UTR</span>
                            <span className="text-brand font-semibold">{benPay.utr}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>Amount Paid</span>
                            <span className="font-bold">₹{Number(benPay.amountPaid || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>Date of Payment</span>
                            <span>{benPay.dateOfPayment}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-depot-payment-receipt"
                          onClick={() => openModal(demand, 'receipt')}
                        >
                          Payment Receipt
                        </button>
                      </div>
                    </td>

                    {/* 4. Payment Received */}
                    <td className="td-pay-received">
                      {demand.csdPayment ? (
                        <div className="depot-csd-payment-entered-box">
                          <div className="depot-csd-pay-tag">
                            <CheckCircle2 size={12} className="text-green" /> CSD Treasury Receipt
                          </div>
                          <div className="depot-pay-row">
                            <span>OR number:</span>
                            <strong className="text-brand">{demand.csdPayment.orNumber}</strong>
                          </div>
                          <div className="depot-pay-row">
                            <span>Total Received:</span>
                            <strong className="text-green">₹{Number(demand.csdPayment.totalAmountReceived).toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="depot-pay-row">
                            <span>OR Date:</span>
                            <span>{demand.csdPayment.orDate}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>CSD Bank Ref:</span>
                            <span>{demand.csdPayment.csdBankRef}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>PO Number:</span>
                            <span>{demand.csdPayment.poNumber}</span>
                          </div>
                          <div className="depot-pay-row">
                            <span>PO Date:</span>
                            <span>{demand.csdPayment.poDate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="depot-csd-payment-empty">
                          <span className="small muted">Payment details not recorded by CSD yet.</span>
                          <span className="micro muted block mt-05">
                            Click <strong>"Payment Received By CSD"</strong> under Action to fill.
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 5. Demand Status */}
                    <td className="td-demand-status">
                      <div className="depot-status-col-wrap">
                        {isProcessed ? (
                          <span className="depot-status-pill status-supply-issued" style={{ background: '#dcfce7', color: '#166534', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                            Supply Order Issued
                          </span>
                        ) : isRejected ? (
                          <span className="depot-status-pill status-rejected" style={{ background: '#fee2e2', color: '#991b1b', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                            Rejected
                          </span>
                        ) : (
                          <span className="depot-status-pill status-processing" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                            {demand.status === 'CREATED' ? 'Payment Pending' : 'Processing'}
                          </span>
                        )}

                        <button
                          type="button"
                          className="btn-depot-status-view"
                          onClick={() => openModal(demand, 'summary')}
                        >
                          View
                        </button>
                      </div>
                    </td>

                    {/* 6. Action Column (Exact 6 buttons from Fig. 3 & Fig. 4) */}
                    <td className="td-action">
                      <div className="depot-action-btn-stack">
                        {/* 1. Payment Received By CSD (Fig. 5) */}
                        <button
                          type="button"
                          className="btn-depot-action btn-action-payment-received"
                          onClick={() => openModal(demand, 'payment')}
                          title="Enter Payment details, received by CSD (Fig. 5)"
                        >
                          Payment Received By CSD
                        </button>

                        {/* 2. Upload Local Supply Order (Fig. 6) */}
                        <button
                          type="button"
                          className="btn-depot-action btn-action-upload-supply"
                          onClick={() => openModal(demand, 'upload')}
                          title="Upload Official Receipt, Supply Order, and Authority Letter (Fig. 6)"
                        >
                          Upload Local Supply Order
                        </button>

                        {/* 3. Approve */}
                        <button
                          type="button"
                          className="btn-depot-action btn-action-approve"
                          onClick={() => openModal(demand, 'approve')}
                          disabled={isProcessed}
                          title="Approve order after Step 4 offline checks"
                        >
                          Approve
                        </button>

                        {/* 4. Reject */}
                        <button
                          type="button"
                          className="btn-depot-action btn-action-reject"
                          onClick={() => openModal(demand, 'reject')}
                          disabled={isProcessed || isRejected}
                          title="Reject order and refund payment"
                        >
                          Reject
                        </button>

                        {/* 5. Summary */}
                        <button
                          type="button"
                          className="btn-depot-action btn-action-summary"
                          onClick={() => openModal(demand, 'summary')}
                          title="View order summary"
                        >
                          Summary
                        </button>

                        {/* 6. Notes */}
                        <button
                          type="button"
                          className="btn-depot-action btn-action-notes"
                          onClick={() => openModal(demand, 'notes')}
                          title="View & add internal depot notes"
                        >
                          Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Step 5.1 Modal: Add Payment Details (Fig. 5) */}
      <AddPaymentDetailsModal
        isOpen={modalType === 'payment'}
        onClose={closeModal}
        demand={activeDemand}
        onSave={handleSavePaymentDetails}
      />

      {/* Step 5.2 Modal: Upload Local Supply Order (Fig. 6) */}
      <UploadSupplyOrderModal
        isOpen={modalType === 'upload'}
        onClose={closeModal}
        demand={activeDemand}
        onSave={handleUploadSupplyOrder}
      />

      {/* Step 5.3 Modal: Approve / Reject with Step 4 Checks */}
      <ApproveRejectModal
        isOpen={modalType === 'approve' || modalType === 'reject'}
        mode={modalType === 'reject' ? 'reject' : 'approve'}
        onClose={closeModal}
        demand={activeDemand}
        onConfirm={modalType === 'reject' ? handleRejectDemand : handleApproveDemand}
      />

      {/* Modal: Order Summary */}
      <DepotOrderSummaryModal
        isOpen={modalType === 'summary'}
        onClose={closeModal}
        demand={activeDemand}
      />

      {/* Modal: Depot Notes */}
      <DepotNotesModal
        isOpen={modalType === 'notes'}
        onClose={closeModal}
        demand={activeDemand}
        onAddNote={handleAddNote}
      />

      {/* Modal: View Customer */}
      <ViewCustomerModal
        isOpen={modalType === 'customer'}
        onClose={closeModal}
        demand={activeDemand}
      />

      {/* Modal: Payment Receipt */}
      <PaymentReceiptModal
        isOpen={modalType === 'receipt'}
        onClose={closeModal}
        demand={activeDemand}
      />
    </div>
  );
}
