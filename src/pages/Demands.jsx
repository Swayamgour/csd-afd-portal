import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Upload,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronRight,
  Download,
  Info,
  Calendar,
  Building,
  RefreshCw,
  Plus
} from 'lucide-react';
import { demandService } from '../services/demand.service.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PaymentDetailsModal } from '../components/modals/PaymentDetailsModal.jsx';

export default function Demands() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchBy, setSearchBy] = useState('all');

  // Modal state for "Upload Payment Details" (Fig. 21 & 22)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedDemandForPayment, setSelectedDemandForPayment] = useState(null);

  // Status explanation toggle
  const [showStatusLegend, setShowStatusLegend] = useState(true);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemands({
        role: 'beneficiary',
        userId: user?.id,
        search: searchTerm
      });
      setDemands(data);
    } catch (err) {
      console.error('Error fetching demands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, [searchTerm]);

  const handleOpenPaymentModal = (demand) => {
    setSelectedDemandForPayment(demand);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmitSuccess = async (paymentData) => {
    if (selectedDemandForPayment) {
      await demandService.updateDemandPayment(selectedDemandForPayment.id, paymentData);
      setPaymentModalOpen(false);
      setSelectedDemandForPayment(null);
      await fetchDemands();
    }
  };

  const handleCancelDemand = async (demandId) => {
    if (window.confirm(`Are you sure you want to cancel demand ${demandId}?`)) {
      await demandService.cancelDemand(demandId);
      await fetchDemands();
    }
  };

  // Helper for Status Badge styling matching CSD Portal (Fig. 20 & 25)
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'on hold') {
      return {
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
        label: 'On hold'
      };
    }
    if (s === 'processing') {
      return {
        bg: '#dcfce7',
        color: '#15803d',
        border: '#bbf7d0',
        label: 'Processing'
      };
    }
    if (s === 'payment pending') {
      return {
        bg: '#fee2e2',
        color: '#b91c1c',
        border: '#fecaca',
        label: 'Payment Pending'
      };
    }
    if (s === 'supply order issued') {
      return {
        bg: '#e0e7ff',
        color: '#4338ca',
        border: '#c7d2fe',
        label: 'Supply Order Issued'
      };
    }
    if (s === 'delivery completed' || s === 'delivered') {
      return {
        bg: '#d1fae5',
        color: '#065f46',
        border: '#a7f3d0',
        label: 'Delivery Completed'
      };
    }
    return {
      bg: '#f1f5f9',
      color: '#475569',
      border: '#e2e8f0',
      label: status || 'Submitted'
    };
  };

  return (
    <div className="demands-page-container">
      {/* Top Warning Banner from CSD Portal (Fig. 20) */}
      <div className="demands-top-notice">
        <span>
          Please contact CSD Helpdesk Contact Number - <strong>022-79669455</strong> Helpdesk Email Id -{' '}
          <a href="mailto:supdtafd@csdindia.gov.in" style={{ color: '#93c5fd', textDecoration: 'underline' }}>
            supdtafd@csdindia.gov.in
          </a>{' '}
          if you are not able to find dealer/depot/URC in the dropdown or price is not showing correctly on the portal.
        </span>
        <button
          onClick={fetchDemands}
          className="btn-action-notes"
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
          title="Refresh list"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Header bar */}
      <div className="checkout-card-header" style={{ borderBottom: 'none', marginBottom: '1rem', paddingBottom: 0 }}>
        <div>
          <h1 className="checkout-page-heading" style={{ fontSize: '1.65rem' }}>
            Demand Management
          </h1>
          <div className="checkout-page-subheading">
            User: <strong>{user?.username || 'DEMO'}</strong> • Total demands:{' '}
            <strong style={{ color: '#1e4fd8' }}>{demands.length}</strong>
          </div>
        </div>

        <Link
          to="/products"
          className="btn-primary-action"
        >
          <Plus size={16} />
          <span>New AFD Demand</span>
        </Link>
      </div>

      {/* Filter and Search Bar matching CSD Portal (Fig. 20 & 25) */}
      <div className="demands-filter-bar">
        <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
          Number of demands: <span style={{ color: '#1e4fd8' }}>{demands.length}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="csd-form-select"
              style={{ padding: '4px 8px', width: 'auto' }}
            >
              <option value="date-desc">Latest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Search By:</span>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="csd-form-select"
              style={{ padding: '4px 8px', width: 'auto' }}
            >
              <option value="all">All Fields</option>
              <option value="demand">Demand No.</option>
              <option value="product">Product</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="csd-form-input"
              style={{ padding: '5px 8px 5px 28px', width: '180px' }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '8px' }} />
          </div>
        </div>
      </div>

      {/* Demands Table (Desktop View, Fig. 20 & 25) */}
      <div className="demands-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="demands-table">
            <thead>
              <tr>
                <th>Demand</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment Details</th>
                <th>Total</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={24} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
                    Loading beneficiary demands...
                  </td>
                </tr>
              ) : demands.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto 8px', display: 'block' }} />
                    No demands found. Click "New AFD Demand" to purchase a vehicle.
                  </td>
                </tr>
              ) : (
                demands.map((d) => {
                  const badge = getStatusBadge(d.status);
                  const displayTotal = d.totalText || `₹${(d.csdPrice || d.totalAmount || 0).toLocaleString('en-IN')} for 1 item`;

                  return (
                    <tr key={d.id}>
                      {/* Demand Number & Username */}
                      <td>
                        <Link
                          to={`/demands/${encodeURIComponent(d.id)}`}
                          style={{
                            color: '#b91c1c',
                            fontWeight: 700,
                            textDecoration: 'none',
                            fontSize: '0.94rem',
                            display: 'block'
                          }}
                        >
                          {d.id}
                        </Link>
                        <div className="csd-form-helper-text">
                          Username: <strong>{d.username || d.beneficiaryName || 'DEMO'}</strong>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#1e293b', marginTop: '4px', fontWeight: 600 }}>
                          {d.productName}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '0.86rem', color: '#334155', whiteSpace: 'nowrap' }}>
                        {d.displayDate || (d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'December 7, 2020')}
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}
                        >
                          {badge.label}
                        </span>
                        {d.statusMeaning && (
                          <div className="csd-form-helper-text" style={{ maxWidth: '170px' }}>
                            {d.statusMeaning}
                          </div>
                        )}
                      </td>

                      {/* Payment Details */}
                      <td style={{ fontSize: '0.84rem', color: '#475569' }}>
                        <div>{d.paymentDetailsText || `Payment method ${d.paymentMethod || 'Direct bank transfer'}`}</div>
                        {d.razorpayId && (
                          <div style={{ fontSize: '0.78rem', color: '#1e4fd8', marginTop: '2px', fontFamily: 'monospace' }}>
                            Razorpay ID: {d.razorpayId}
                          </div>
                        )}
                        {d.depot && (
                          <div className="csd-form-helper-text">
                            Depot: <strong>{d.depot}</strong>
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {displayTotal}
                      </td>

                      {/* Actions buttons matching Fig. 20 & 25 */}
                      <td style={{ minWidth: '180px' }}>
                        <div className="demands-action-stack">
                          {/* View Button */}
                          <Link
                            to={`/demands/${encodeURIComponent(d.id)}`}
                            className="btn-action-view"
                          >
                            View
                          </Link>

                          {/* Summary Sheet Button */}
                          <button
                            onClick={() => alert(`Summary Sheet for demand ${d.id} is being generated.`)}
                            className="btn-action-summary"
                          >
                            Summary Sheet
                          </button>

                          {/* Upload Payment Receipt Button (Only for On hold / Direct Transfer) */}
                          {d.status?.toLowerCase() === 'on hold' && (
                            <>
                              <button
                                onClick={() => handleOpenPaymentModal(d)}
                                className="btn-action-view"
                                style={{ background: '#2563eb' }}
                              >
                                Upload Payment Receipt
                              </button>

                              {/* Upload Payment Details (Yellow-Green button as in Fig. 20) */}
                              <button
                                onClick={() => handleOpenPaymentModal(d)}
                                className="btn-action-upload-details"
                              >
                                Upload Payment Details
                              </button>

                              {/* Submit Demand To CSD */}
                              <button
                                onClick={() => {
                                  alert(`Please upload payment details before submitting to CSD Depot.`);
                                }}
                                className="btn-action-view"
                                style={{ background: '#881337' }}
                              >
                                Submit Demand To CSD
                              </button>
                            </>
                          )}

                          {/* Cancel Demand */}
                          <button
                            onClick={() => handleCancelDemand(d.id)}
                            className="btn-action-cancel"
                          >
                            Cancel Demand
                          </button>

                          {/* Notes */}
                          <button
                            onClick={() => alert(`Notes for Demand ${d.id}:\n- Beneficiary: ${d.beneficiaryName || 'DEMO'}\n- Product: ${d.productName}\n- Dealer: ${d.dealer || d.dealerName || 'Assigned Dealer'}`)}
                            className="btn-action-notes"
                          >
                            Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Definitions Table (Fig. 25 of CSD Manual) */}
      <div className="checkout-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => setShowStatusLegend(!showStatusLegend)}
        >
          <h2 className="checkout-card-title">
            <Info size={18} color="#1e4fd8" />
            <span>Meaning of the status are as follows (from CSD Beneficiary Manual):</span>
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#1e4fd8', fontWeight: 600 }}>
            {showStatusLegend ? 'Hide' : 'Show'}
          </span>
        </div>

        {showStatusLegend && (
          <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
            <table className="demand-detail-meta-table">
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 700, color: '#334155', width: '220px' }}>Status</th>
                  <th style={{ padding: '8px 12px', fontWeight: 700, color: '#334155' }}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: '#b45309' }}>On hold</td>
                  <td>Payment Receipts needs to be uploaded</td>
                </tr>
                <tr>
                  <td style={{ color: '#b91c1c' }}>Payment Pending</td>
                  <td>Payment pending</td>
                </tr>
                <tr>
                  <td style={{ color: '#15803d' }}>Processing</td>
                  <td>Pending on Depot</td>
                </tr>
                <tr>
                  <td style={{ color: '#4338ca' }}>Supply Order Issued</td>
                  <td>Pending with URC</td>
                </tr>
                <tr>
                  <td style={{ color: '#065f46' }}>Delivery completed</td>
                  <td>Product has been delivered by the dealer</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal (Fig. 21 & 22) */}
      {paymentModalOpen && selectedDemandForPayment && (
        <PaymentDetailsModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedDemandForPayment(null);
          }}
          demand={selectedDemandForPayment}
          onSubmitSuccess={handlePaymentSubmitSuccess}
        />
      )}
    </div>
  );
}
