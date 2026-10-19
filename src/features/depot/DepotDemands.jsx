import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, CheckCircle2, AlertCircle, FileText, Upload, Check, X, Eye, FileDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { demandService } from '../../services/demand.service.js';

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
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Manual Filters (Fig. 3)
  const [sortBy, setSortBy] = useState('newest');
  const [searchBy, setSearchBy] = useState('demandNumber');
  const [searchInput, setSearchInput] = useState('');

  // Active Modals State
  const [activeDemand, setActiveDemand] = useState(null);
  const [modalType, setModalType] = useState(null); // 'payment' | 'upload' | 'approve' | 'reject' | 'summary' | 'notes' | 'customer' | 'receipt'

  const loadDemands = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemands();
      setDemands(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemands();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 6000);
  };

  // Modal Action Handlers
  const openModal = (demand, type) => {
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
      await demandService.recordCsdPayment(activeDemand.id, formData);
      showToast(`Payment details (OR No: ${formData.orNumber}) successfully recorded for ${activeDemand.id}`);
      closeModal();
      loadDemands();
    } catch (e) {
      alert(e.message || 'Error recording payment');
    }
  };

  const handleUploadSupplyOrder = async (docsData) => {
    if (!activeDemand) return;
    try {
      await demandService.uploadSupplyOrderDocs(activeDemand.id, docsData);
      showToast(`Local Supply Order & Authority Letter uploaded for ${activeDemand.id}`);
      closeModal();
      loadDemands();
    } catch (e) {
      alert(e.message || 'Error uploading documents');
    }
  };

  const handleApproveDemand = async ({ status, note }) => {
    if (!activeDemand) return;
    try {
      await demandService.approveDepotOrder(activeDemand.id, note);
      showToast(`Demand ${activeDemand.id} Approved! Status changed to “Supply Order Issued.” Handed over to URC.`);
      closeModal();
      loadDemands();
    } catch (e) {
      alert(e.message || 'Error approving demand');
    }
  };

  const handleRejectDemand = async ({ reason }) => {
    if (!activeDemand) return;
    try {
      await demandService.rejectDepotOrder(activeDemand.id, reason);
      showToast(`Demand ${activeDemand.id} Rejected. Payment refund process initiated.`);
      closeModal();
      loadDemands();
    } catch (e) {
      alert(e.message || 'Error rejecting demand');
    }
  };

  const handleAddNote = async (noteText) => {
    if (!activeDemand) return;
    try {
      await demandService.addDepotNote(activeDemand.id, noteText, user?.name || 'Depot Officer');
      showToast(`Internal note logged on ${activeDemand.id}`);
      // Refresh activeDemand in place
      const updated = await demandService.getDemandById(activeDemand.id);
      setActiveDemand(updated);
      loadDemands();
    } catch (e) {
      alert(e.message || 'Error adding note');
    }
  };

  // Filter & Sort Logic
  const filteredDemands = demands
    .filter((d) => {
      if (!searchInput.trim()) return true;
      const q = searchInput.toLowerCase().trim();
      switch (searchBy) {
        case 'demandNumber':
          return d.id.toLowerCase().includes(q);
        case 'username':
          return (d.username && d.username.toLowerCase().includes(q)) || (d.beneficiaryName && d.beneficiaryName.toLowerCase().includes(q));
        case 'sku':
          return d.sku && d.sku.toLowerCase().includes(q);
        case 'item':
          return d.productName && d.productName.toLowerCase().includes(q);
        case 'utr':
          return d.beneficiaryPayment?.utr && d.beneficiaryPayment.utr.toLowerCase().includes(q);
        default:
          return d.id.toLowerCase().includes(q);
      }
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'amountHigh') return (b.totalAmount || b.csdPrice || 0) - (a.totalAmount || a.csdPrice || 0);
      if (sortBy === 'id') return a.id.localeCompare(b.id);
      return 0;
    });

  const depotDisplayName = user?.depot || 'Mydepot';

  return (
    <div className="depot-manual-page">
      {/* Toast feedback */}
      {toast && (
        <div className="depot-manual-toast alert-banner success" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header Row matching Fig. 3 */}
      <div className="depot-manual-header-row between">
        <div>
          <h2 className="depot-manual-page-title">
            Depot - {depotDisplayName}
          </h2>
          <span className="depot-manual-count-badge">
            Number of demands: <strong>{filteredDemands.length}</strong>
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
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="button" className="depot-search-btn" title="Search Demands">
              <Search size={14} />
            </button>
          </div>
        </div>
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
                const benPay = demand.beneficiaryPayment || {
                  bank: 'Direct bank transfer',
                  firstAccountHolder: demand.beneficiaryName || demand.username,
                  accountNumber: 'N/A',
                  ifsc: 'N/A',
                  utr: demand.utrNumber || demand.razorpayId || 'N/A',
                  amountPaid: demand.totalAmount || demand.csdPrice || 0,
                  dateOfPayment: demand.indentDate || demand.displayDate || '14/12/20'
                };

                const isProcessed = demand.status === 'Supply Order Issued.' || demand.status === 'Supply_Order_Issued';
                const isRejected = demand.status === 'Rejected';

                return (
                  <tr key={demand.id}>
                    {/* 1. Demand Number */}
                    <td className="td-demand-no">
                      <strong className="depot-demand-id-link">
                        {demand.id}
                      </strong>
                      <span className="depot-indent-date">
                        Indent {demand.indentDate || demand.displayDate || '14/12/20'}
                      </span>
                    </td>

                    {/* 2. PO details */}
                    <td className="td-po-details">
                      <div className="depot-po-customer-header">
                        <span className="depot-customer-link">
                          {demand.username || demand.beneficiaryName} &gt;
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
                          <span className="meta-val">{demand.username || demand.beneficiaryName}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Price Zone:</span>
                          <span className="meta-val">{demand.priceZone || 'Jammu and Kashmir'}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Dealer:</span>
                          <span className="meta-val">{demand.dealer || 'mydealer'}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Depot:</span>
                          <span className="meta-val">{demand.depot || 'Mydepot'}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">URC:</span>
                          <span className="meta-val">{demand.urc || 'myurc'}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Item:</span>
                          <span className="meta-val font-semibold">{demand.productName}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">SKU:</span>
                          <span className="meta-val">{demand.sku || '63265'}</span>
                        </div>
                        <div className="depot-po-meta-item">
                          <span className="meta-key">Color:</span>
                          <span className="meta-val">{demand.color || 'Black'}</span>
                        </div>
                        <div className="depot-po-meta-item highlight-price">
                          <span className="meta-key">Total Amount:</span>
                          <span className="meta-val font-bold">
                            ₹{Number(demand.totalAmount || demand.csdPrice || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Payment from Beneficiary */}
                    <td className="td-pay-beneficiary">
                      <div className="depot-beneficiary-payment-box">
                        <p className="depot-pay-method-header">
                          Payment method: <span className="font-semibold">{demand.paymentMethod || 'Direct bank transfer'}</span>
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
                          <span className="depot-status-pill status-supply-issued">
                            Supply Order Issued.
                          </span>
                        ) : isRejected ? (
                          <span className="depot-status-pill status-rejected">
                            Rejected
                          </span>
                        ) : (
                          <span className="depot-status-pill status-processing">
                            Processing
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
