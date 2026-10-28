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
import { useGetDemandsQuery, useCancelDemandMutation } from '../features/demand/demandApi.js';
import { useSubmitDirectTransferMutation } from '../features/payment/paymentApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Demands() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchBy, setSearchBy] = useState('all');

  const {
    data: demandsData,
    isLoading: loading,
    refetch,
  } = useGetDemandsQuery({ q: searchTerm || undefined });

  const [cancelDemand] = useCancelDemandMutation();
  const [submitDirectTransfer] = useSubmitDirectTransferMutation();

  const demands = demandsData?.items || [];

  // Status explanation toggle
  const [showStatusLegend, setShowStatusLegend] = useState(true);

  // Helper for Status Badge styling matching CSD Portal
  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase().replace(/\s+/g, '_');
    switch (s) {
      case 'COMPLETED':
        return { className: 'status-badge-delivered', label: 'Completed' };
      case 'APPROVED':
        return { className: 'status-badge-issued', label: 'Approved (Payment Enabled)' };
      case 'SUPPLY_ORDER_ISSUED':
        return { className: 'status-badge-issued', label: 'Supply Order Issued' };
      case 'DEPOT_PROCESSING':
        return { className: 'status-badge-processing', label: 'Depot Processing' };
      case 'DEALER_VERIFICATION':
        return { className: 'status-badge-processing', label: 'Dealer Verification' };
      case 'PROCESSING':
        return { className: 'status-badge-processing', label: 'Processing' };
      case 'PAID':
        return { className: 'status-badge-issued', label: 'Paid' };
      case 'PAYMENT_PENDING':
        return { className: 'status-badge-pending', label: 'Payment Verification' };
      case 'CREATED':
        return { className: 'status-badge-onhold', label: 'Pending Depot Approval' };
      case 'REJECTED':
      case 'CANCELLED':
      case 'EXPIRED':
        return { className: 'status-badge-onhold', label: status };
      default:
        return { className: 'status-badge-default', label: status || 'Submitted' };
    }
  };

  return (
    <div className="demands-page-container">
      {/* Top Warning Banner from CSD Portal (Fig. 20) */}
      <div className="demands-top-notice">
        <span>
          Please contact CSD Helpdesk Contact Number - <strong>022-79669455</strong> Helpdesk Email Id -{' '}
          <a href="mailto:supdtafd@csdindia.gov.in" className="demands-helpdesk-link">
            supdtafd@csdindia.gov.in
          </a>{' '}
          if you are not able to find dealer/depot/URC in the dropdown or price is not showing correctly on the portal.
        </span>
        <button
          onClick={() => refetch()}
          className="btn-action-notes demands-refresh-btn"
          title="Refresh list"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Header bar */}
      <div className="checkout-card-header demands-header-clean">
        <div>
          <h1 className="checkout-page-heading demands-title-clean">
            Demand Management
          </h1>
          <div className="checkout-page-subheading">
            User: <strong>{user?.username || 'DEMO'}</strong> • Total demands:{' '}
            <strong className="demands-count-highlight">{demands.length}</strong>
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
        <div className="demands-count-summary">
          Number of demands: <span className="demands-count-highlight">{demands.length}</span>
        </div>

        <div className="demands-filter-row">
          <div className="demands-filter-group">
            <span className="demands-filter-label">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="csd-form-select demands-filter-select"
            >
              <option value="date-desc">Latest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>
          </div>

          <div className="demands-filter-group">
            <span className="demands-filter-label">Search By:</span>
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              className="csd-form-select demands-filter-select"
            >
              <option value="all">All Fields</option>
              <option value="demand">Demand No.</option>
              <option value="product">Product</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="demands-search-box">
            <input
              type="text"
              placeholder="Search for..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="csd-form-input demands-search-input"
            />
            <Search size={14} color="#94a3b8" className="demands-search-icon" />
          </div>
        </div>
      </div>

      {/* Demands Table (Desktop View, Fig. 20 & 25) */}
      <div className="demands-table-wrapper">
        <div className="demands-table-scroll">
          <table className="demands-table">
            <thead>
              <tr>
                <th>Demand</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment Details</th>
                <th>Total</th>
                <th className="demands-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="demands-empty-cell">
                    <RefreshCw size={24} className="demands-loading-spinner" />
                    Loading beneficiary demands...
                  </td>
                </tr>
              ) : demands.length === 0 ? (
                <tr>
                  <td colSpan="6" className="demands-empty-cell">
                    <FileText size={32} color="#cbd5e1" className="demands-empty-icon" />
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
                          className="demand-id-link"
                        >
                          {d.id}
                        </Link>
                        <div className="csd-form-helper-text">
                          Username: <strong>{d.username || d.beneficiaryName || 'DEMO'}</strong>
                        </div>
                        <div className="demand-product-subtext">
                          {d.productName}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="demand-date-cell">
                        {d.displayDate || (d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'December 7, 2020')}
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span
                          className={`demand-status-badge ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        {d.statusMeaning && (
                          <div className="csd-form-helper-text demand-status-meaning-text">
                            {d.statusMeaning}
                          </div>
                        )}
                      </td>

                      {/* Payment Details */}
                      <td className="demand-payment-cell">
                        <div>{d.paymentDetailsText || `Payment method ${d.paymentMethod || 'Direct bank transfer'}`}</div>
                        {d.razorpayId && (
                          <div className="demand-razorpay-id">
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
                      <td className="demand-total-cell">
                        {displayTotal}
                      </td>

                      {/* Actions buttons matching Fig. 20 & 25 */}
                      <td className="demand-actions-cell">
                        <div className="demands-action-stack">
                          {/* View Button */}
                          <Link
                            to={`/demands/${encodeURIComponent(d._id || d.id)}`}
                            className="btn-action-view"
                          >
                            View
                          </Link>

                          {/* Summary Sheet Button */}
                          <button
                            onClick={() => alert(`Summary Sheet for demand ${d.demandNo || d._id || d.id} is being generated.`)}
                            className="btn-action-summary"
                          >
                            Summary Sheet
                          </button>

                          {/* Payment / UTR upload (enabled once Depot approves) */}
                          {(['APPROVED', 'PAYMENT_PENDING', 'ON HOLD'].includes((d.status || '').toUpperCase()) && d.paymentStatus !== 'PAID') && (
                            <button
                              onClick={() => navigate(`/demands/${encodeURIComponent(d._id || d.id)}`)}
                              className="btn-action-upload-details"
                              style={{ fontWeight: 700, background: '#16a34a', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #15803d' }}
                            >
                              <CreditCard size={13} /> Pay Now / Upload UTR
                            </button>
                          )}

                          {/* Pre-payment waiting indicator */}
                          {(d.status || '').toUpperCase() === 'CREATED' && (
                            <span
                              className="checkout-spec-pill"
                              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                              title="Payment link opens once Depot approves this demand"
                            >
                              <Clock size={12} /> Awaiting Depot Sanction
                            </span>
                          )}

                          {/* Cancel Demand */}
                          <button
                            onClick={() => handleCancelDemand(d._id || d.id)}
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
          className="demand-status-toggle"
          onClick={() => setShowStatusLegend(!showStatusLegend)}
        >
          <h2 className="checkout-card-title">
            <Info size={18} color="#1e4fd8" />
            <span>Meaning of the status are as follows (from CSD Beneficiary Manual):</span>
          </h2>
          <span className="demand-status-toggle-link">
            {showStatusLegend ? 'Hide' : 'Show'}
          </span>
        </div>

        {showStatusLegend && (
          <div className="demand-status-legend-table-scroll">
            <table className="demand-detail-meta-table">
              <thead>
                <tr className="demand-legend-header-row">
                  <th className="demand-legend-th-status">Status</th>
                  <th className="demand-legend-th-meaning">Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="demand-legend-status-hold">On hold</td>
                  <td>Payment Receipts needs to be uploaded</td>
                </tr>
                <tr>
                  <td className="demand-legend-status-pending">Payment Pending</td>
                  <td>Payment pending</td>
                </tr>
                <tr>
                  <td className="demand-legend-status-processing">Processing</td>
                  <td>Pending on Depot</td>
                </tr>
                <tr>
                  <td className="demand-legend-status-issued">Supply Order Issued</td>
                  <td>Pending with URC</td>
                </tr>
                <tr>
                  <td className="demand-legend-status-delivered">Delivery completed</td>
                  <td>Product has been delivered by the dealer</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
