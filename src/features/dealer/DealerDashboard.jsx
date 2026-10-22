import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Truck,
  Users,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  Sparkles,
  RefreshCw,
  Building2,
  ShieldAlert
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetDemandsQuery,
  useGetOrdersQuery,
  useDealerVerifyDemandMutation,
  useUpdateOrderStatusMutation
} from '../demand/demandApi.js';

export default function DealerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active view tab: 'verification' (Demands) or 'handover' (Orders)
  const [activeTab, setActiveTab] = useState('verification');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected demand for verification modal
  const [verifyingDemand, setVerifyingDemand] = useState(null);
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(15);
  const [remarks, setRemarks] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Selected order for vehicle handover modal
  const [handoverOrder, setHandoverOrder] = useState(null);
  const [handoverNotes, setHandoverNotes] = useState('');

  // RTK Query calls
  const {
    data: demandsData,
    isLoading: loadingDemands,
    isFetching: fetchingDemands,
    refetch: refetchDemands
  } = useGetDemandsQuery();

  const {
    data: ordersData,
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
    refetch: refetchOrders
  } = useGetOrdersQuery();

  const [dealerVerifyDemand, { isLoading: isSubmittingVerification }] =
    useDealerVerifyDemandMutation();

  const [updateOrderStatus, { isLoading: isSubmittingHandover }] =
    useUpdateOrderStatusMutation();

  const demands = demandsData?.items || [];
  const orders = ordersData?.items || [];

  // Dealership info
  const dealerInfo = user?.dealer || {
    name: user?.dealershipName || 'SUPREME MOBILES PVT. LTD.- HISAR',
    code: user?.dealerCode || 'DLR-SUPREME-HSR',
    city: 'Hisar',
    state: 'HARYANA',
    address: 'Delhi Road, Near Model Town, Hisar, Haryana - 125001',
    phone: user?.mobile || '+91 98120 12345',
    email: user?.email || 'csd@suprememobileshisar.com'
  };

  // KPIs
  const pendingCount = demands.filter(
    (d) =>
      !d.dealerVerification?.status ||
      d.dealerVerification?.status === 'PENDING' ||
      d.status === 'CREATED'
  ).length;

  const verifiedCount = demands.filter(
    (d) => d.dealerVerification?.status === 'VERIFIED'
  ).length;

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;

  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  // Filtered demands for Verification Desk
  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      const matchSearch =
        !searchQuery ||
        d.demandNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.productSnapshot?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.beneficiaryId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.beneficiaryId?.serviceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'PENDING') {
        return (
          !d.dealerVerification?.status ||
          d.dealerVerification?.status === 'PENDING' ||
          d.status === 'CREATED'
        );
      }
      if (statusFilter === 'VERIFIED') {
        return d.dealerVerification?.status === 'VERIFIED';
      }
      if (statusFilter === 'REJECTED') {
        return (
          d.dealerVerification?.status === 'REJECTED' || d.status === 'REJECTED'
        );
      }
      return true;
    });
  }, [demands, statusFilter, searchQuery]);

  // Open verification modal
  const handleOpenVerify = (demand) => {
    setVerifyingDemand(demand);
    setChassisNo(demand.dealerVerification?.chassisNo || '');
    setEngineNo(demand.dealerVerification?.engineNo || '');
    setDeliveryDays(demand.dealerVerification?.estimatedDeliveryDays || 15);
    setRemarks(
      demand.dealerVerification?.remarks ||
        'Availability certificate and dealer price verified against showroom quota.'
    );
  };

  // Execute verification
  const handlePerformVerification = async (decision) => {
    if (!verifyingDemand) return;

    if (decision === 'VERIFIED' && !chassisNo.trim()) {
      alert('Please provide a Chassis / VIN allocation number before confirming availability.');
      return;
    }

    try {
      await dealerVerifyDemand({
        id: verifyingDemand._id || verifyingDemand.id,
        status: decision,
        remarks: remarks.trim(),
        chassisNo: chassisNo.trim(),
        engineNo: engineNo.trim(),
        estimatedDeliveryDays: Number(deliveryDays) || 15
      }).unwrap();

      setFeedbackMsg({
        type: decision === 'VERIFIED' ? 'success' : 'warning',
        text:
          decision === 'VERIFIED'
            ? `Demand ${verifyingDemand.demandNo} verified! Availability confirmed & Chassis allocated. Beneficiary may now complete payment.`
            : `Demand ${verifyingDemand.demandNo} marked as Rejected/Discrepancy reported.`
      });

      setVerifyingDemand(null);
      refetchDemands();
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to verify demand');
    }
  };

  // Handover order
  const handlePerformHandover = async () => {
    if (!handoverOrder) return;

    try {
      await updateOrderStatus({
        id: handoverOrder._id || handoverOrder.id,
        status: 'DELIVERED',
        note: handoverNotes || 'Vehicle physically handed over to beneficiary at showroom after original CSD Smart Card verification.'
      }).unwrap();

      setFeedbackMsg({
        type: 'success',
        text: `Vehicle handover completed for order ${handoverOrder.orderNo || handoverOrder.id}. Gatepass confirmed.`
      });

      setHandoverOrder(null);
      refetchOrders();
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to update order status');
    }
  };

  // Format currency
  const inr = (n) => (n ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0');

  // Find availability certificate document
  const getAvailabilityCertDoc = (d) => {
    if (!d?.documents || !Array.isArray(d.documents)) return null;
    return d.documents.find((doc) => doc.type === 'availability_cert');
  };

  // Columns for Demand Verification Table
  const demandColumns = [
    {
      header: 'Demand No. & Date',
      accessor: 'demandNo',
      render: (r) => (
        <div>
          <span className="font-semibold text-brand block">{r.demandNo}</span>
          <span className="micro muted">
            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      )
    },
    {
      header: 'Beneficiary Customer',
      accessor: 'beneficiaryId',
      render: (r) => {
        const b = r.beneficiaryId || {};
        const u = r.userId || {};
        return (
          <div>
            <span className="font-semibold block text-navy">
              {b.fullName || u.name || 'CSD Beneficiary'}
            </span>
            <div className="row gap-0-5 align-center mt-0-25">
              {b.serviceNumber && (
                <span className="badge micro neutral font-mono">{b.serviceNumber}</span>
              )}
              {b.rank && <span className="micro muted">{b.rank}</span>}
            </div>
            {(b.mobile || u.mobile) && (
              <span className="micro text-brand block mt-0-25">
                📞 {b.mobile || u.mobile}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Allotted Vehicle / Model',
      accessor: 'productSnapshot',
      render: (r) => {
        const p = r.productSnapshot || r.productId || {};
        return (
          <div className="dealer-product-cell">
            <span className="font-medium small block text-line-height-tight">
              {p.name || 'Vehicle'}
            </span>
            <div className="row gap-0-5 align-center mt-0-25">
              <span className="micro muted font-mono">SKU: {p.sku || 'CSD-SKU'}</span>
              {r.selectedColor && (
                <span className="badge micro info">🎨 {r.selectedColor}</span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Dealer Quoted Price',
      accessor: 'dealerPrice',
      render: (r) => {
        const price = r.dealerPrice || r.totalAmount || 0;
        return (
          <div>
            <span className="font-bold text-navy block font-mono">
              {inr(price)}
            </span>
            <span className="micro text-success font-semibold">
              ✓ Matches CSD Quota
            </span>
          </div>
        );
      }
    },
    {
      header: 'Availability Cert.',
      accessor: 'documents',
      render: (r) => {
        const cert = getAvailabilityCertDoc(r);
        if (!cert) {
          return <span className="micro muted italic">Not attached</span>;
        }

        const isAbsolute = cert.url?.startsWith('http');
        const viewUrl = isAbsolute
          ? cert.url
          : `http://localhost:5000${cert.url?.startsWith('/') ? '' : '/'}${cert.url}`;

        return (
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn xs out row align-center gap-0-25 text-brand"
            title="Inspect uploaded Availability Certificate"
          >
            <FileText size={13} />
            <span>View Cert</span>
            <ExternalLink size={11} />
          </a>
        );
      }
    },
    {
      header: 'Verification Status',
      accessor: 'dealerVerification',
      render: (r) => {
        const v = r.dealerVerification?.status || (r.status === 'CREATED' ? 'PENDING' : r.status);
        if (v === 'VERIFIED') {
          return (
            <div>
              <span className="badge sm success font-semibold row align-center gap-0-25">
                <CheckCircle2 size={13} /> Verified
              </span>
              {r.dealerVerification?.chassisNo && (
                <span className="micro muted font-mono block mt-0-25">
                  VIN: {r.dealerVerification.chassisNo}
                </span>
              )}
            </div>
          );
        }
        if (v === 'REJECTED') {
          return (
            <span className="badge sm danger font-semibold row align-center gap-0-25">
              <X size={13} /> Rejected
            </span>
          );
        }
        return (
          <span className="badge sm warning font-semibold row align-center gap-0-25">
            <Clock size={13} /> Pending Verification
          </span>
        );
      }
    },
    {
      header: 'Showroom Action',
      accessor: '_id',
      render: (r) => {
        const isPending =
          !r.dealerVerification?.status ||
          r.dealerVerification?.status === 'PENDING' ||
          r.status === 'CREATED';

        return isPending ? (
          <Button
            size="sm"
            variant="primary"
            icon={FileCheck}
            onClick={() => handleOpenVerify(r)}
          >
            Verify & Allocate
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => handleOpenVerify(r)}
          >
            View Details
          </Button>
        );
      }
    }
  ];

  // Columns for Orders (Handover) Table
  const orderColumns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (r) => <span className="font-semibold text-brand font-mono">{r.orderNo || r.id}</span>
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiaryId',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.beneficiaryName || r.userId?.name || 'Beneficiary'}</span>
          <span className="micro muted">{r.serviceNumber}</span>
        </div>
      )
    },
    {
      header: 'Vehicle Model',
      accessor: 'items',
      render: (r) => {
        const item = r.items?.[0] || {};
        return <span>{item.name || r.productName || 'Allocated Vehicle'}</span>;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Showroom Handover',
      accessor: '_id',
      render: (r) =>
        r.status === 'DELIVERED' ? (
          <span className="small text-green font-semibold">✓ Handed Over</span>
        ) : (
          <Button
            size="sm"
            variant="primary"
            icon={Check}
            onClick={() => setHandoverOrder(r)}
          >
            Mark Handed Over
          </Button>
        )
    }
  ];

  return (
    <div className="dealer-dashboard-page">
      {/* Dealership Operations Header */}
      <div className="dealer-header-card panel mb-3 p-3">
        <div className="between align-start flex-wrap gap-2">
          <div>
            <div className="row align-center gap-1 mb-1">
              <span className="badge primary font-bold">OFFICIAL CSD DEALERSHIP DESK</span>
              <span className="badge neutral font-mono">{dealerInfo.code}</span>
            </div>
            <h1 className="h2 font-bold text-navy mb-0-5">{dealerInfo.name}</h1>
            <div className="row gap-2 flex-wrap text-muted small mt-1">
              <span className="row align-center gap-0-5">
                <MapPin size={15} className="text-saffron" />
                {dealerInfo.address}
              </span>
              <span className="row align-center gap-0-5">
                <Phone size={15} className="text-brand" />
                {dealerInfo.phone}
              </span>
              <span className="row align-center gap-0-5">
                <Mail size={15} className="text-brand" />
                {dealerInfo.email}
              </span>
            </div>
          </div>

          <div className="dealer-header-actions row gap-1 align-center">
            <button
              type="button"
              className="btn sm out row align-center gap-0-5"
              onClick={() => {
                refetchDemands();
                refetchOrders();
              }}
              disabled={fetchingDemands || fetchingOrders}
            >
              <RefreshCw size={14} className={fetchingDemands || fetchingOrders ? 'spin' : ''} />
              <span>Sync Portal</span>
            </button>
            <div className="badge success px-3 py-1 font-semibold text-center">
              ✓ Nodal Officer Active
            </div>
          </div>
        </div>
      </div>

      {/* Alert toast if action taken */}
      {feedbackMsg && (
        <div
          className={`alert-banner ${feedbackMsg.type} mb-3 row align-center gap-1 small`}
          role="alert"
        >
          <CheckCircle2 size={18} />
          <span className="flex-1">{feedbackMsg.text}</span>
          <button
            type="button"
            className="circle text-muted"
            onClick={() => setFeedbackMsg(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Pending Demand Verification"
          value={`${pendingCount} Demands`}
          subtext="Requires Availability & Price Sign-off"
          icon={Clock}
          variant="warning"
          onClick={() => {
            setActiveTab('verification');
            setStatusFilter('PENDING');
          }}
        />
        <StatCard
          title="Verified & Allocated"
          value={`${verifiedCount} Demands`}
          subtext="Awaiting Beneficiary Payment"
          icon={CheckCircle2}
          variant="success"
          onClick={() => {
            setActiveTab('verification');
            setStatusFilter('VERIFIED');
          }}
        />
        <StatCard
          title="Active Showroom Deliveries"
          value={`${activeOrdersCount} Vehicles`}
          subtext="Arrived / In Stockyard"
          icon={Truck}
          variant="primary"
          onClick={() => setActiveTab('handover')}
        />
        <StatCard
          title="Completed Handover"
          value={`${deliveredCount} Vehicles`}
          subtext="Gatepass Stamped & Dispatched"
          icon={ShieldCheck}
          variant="default"
          onClick={() => setActiveTab('handover')}
        />
      </div>

      {/* Main Operations Tabs */}
      <div className="tabs-header row gap-1 mb-2 border-b">
        <button
          type="button"
          className={`tab-btn px-3 py-2 font-semibold text-sm border-b-2 ${
            activeTab === 'verification'
              ? 'border-brand text-brand font-bold'
              : 'border-transparent text-muted'
          }`}
          onClick={() => setActiveTab('verification')}
        >
          📋 Demand Verification Desk ({pendingCount} Action Required)
        </button>
        <button
          type="button"
          className={`tab-btn px-3 py-2 font-semibold text-sm border-b-2 ${
            activeTab === 'handover'
              ? 'border-brand text-brand font-bold'
              : 'border-transparent text-muted'
          }`}
          onClick={() => setActiveTab('handover')}
        >
          🚚 Showroom Vehicle Handover & Gatepass ({orders.length} Orders)
        </button>
      </div>

      {/* VIEW 1: DEMAND VERIFICATION DESK */}
      {activeTab === 'verification' && (
        <Card
          title="Demand Verification & Availability Certificate Desk"
          subtitle="Review beneficiary purchase requests, verify showroom quoted prices, check Availability Certificates, and allocate chassis VIN numbers."
          actions={
            <div className="row gap-1 align-center flex-wrap">
              {/* Filter chips */}
              <div className="chips row gap-0-5 m-0">
                <button
                  type="button"
                  className={`fchip ${statusFilter === 'ALL' ? 'active font-bold' : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  All ({demands.length})
                </button>
                <button
                  type="button"
                  className={`fchip ${statusFilter === 'PENDING' ? 'active font-bold' : ''}`}
                  onClick={() => setStatusFilter('PENDING')}
                >
                  Pending Action ({pendingCount})
                </button>
                <button
                  type="button"
                  className={`fchip ${statusFilter === 'VERIFIED' ? 'active font-bold' : ''}`}
                  onClick={() => setStatusFilter('VERIFIED')}
                >
                  Verified ({verifiedCount})
                </button>
                <button
                  type="button"
                  className={`fchip ${statusFilter === 'REJECTED' ? 'active font-bold' : ''}`}
                  onClick={() => setStatusFilter('REJECTED')}
                >
                  Rejected
                </button>
              </div>

              {/* Search */}
              <div className="search-wrap search-wrap-min">
                <input
                  type="text"
                  placeholder="Search Demand or Officer..."
                  className="inp sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          }
        >
          <DataTable
            columns={demandColumns}
            data={filteredDemands}
            loading={loadingDemands}
            emptyMessage={
              <div className="p-4 text-center">
                <CheckCircle2 size={40} className="text-success mb-1 text-center-auto-m" />
                <h3 className="h4 font-bold">No Demands in This Category</h3>
                <p className="text-muted small">
                  When a defence beneficiary selects your dealership at checkout, their demand and availability certificate will appear here for verification.
                </p>
              </div>
            }
          />
        </Card>
      )}

      {/* VIEW 2: VEHICLE HANDOVER DESK */}
      {activeTab === 'handover' && (
        <Card
          title="Vehicle Handover & Gatepass Queue"
          subtitle="Verify beneficiary identity and CSD supply order before physical release of the vehicle"
        >
          <DataTable
            columns={orderColumns}
            data={orders}
            loading={loadingOrders}
            emptyMessage={
              <div className="p-4 text-center">
                <Truck size={40} className="text-muted mb-1 text-center-auto-m" />
                <h3 className="h4 font-bold">No Active Handover Orders</h3>
                <p className="text-muted small">
                  Once beneficiary completes payment for a verified demand, official CSD supply orders will populate here for physical vehicle release.
                </p>
              </div>
            }
          />
        </Card>
      )}

      {/* MODAL 1: DEMAND VERIFICATION MODAL */}
      {verifyingDemand && (
        <Modal
          isOpen={!!verifyingDemand}
          onClose={() => setVerifyingDemand(null)}
          title={`Review & Verify Demand · ${verifyingDemand.demandNo}`}
          subtitle={`Dealership Verification Desk · Authorized Sign-off`}
          maxWidth="680px"
          footer={
            <div className="modal-footer-btns row between align-center w-full">
              <Button
                variant="outline"
                onClick={() => setVerifyingDemand(null)}
                disabled={isSubmittingVerification}
              >
                Cancel
              </Button>

              <div className="row gap-1">
                <Button
                  variant="outline"
                  className="btn-danger-outline"
                  icon={X}
                  onClick={() => handlePerformVerification('REJECTED')}
                  disabled={isSubmittingVerification}
                >
                  Reject Demand
                </Button>
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() => handlePerformVerification('VERIFIED')}
                  disabled={isSubmittingVerification}
                >
                  {isSubmittingVerification ? 'Saving Verification...' : 'Confirm Availability & Approve'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="demand-verification-modal-content">
            {/* Beneficiary & Vehicle Info side-by-side */}
            <div className="grid col-2 gap-2 mb-3">
              <div className="panel p-2 bg-subtle rounded border">
                <span className="micro muted uppercase font-bold block mb-1">
                  1. Beneficiary Officer Details
                </span>
                <p className="font-bold text-navy mb-0-25">
                  {verifyingDemand.beneficiaryId?.fullName ||
                    verifyingDemand.userId?.name ||
                    'CSD Beneficiary'}
                </p>
                <p className="small muted mb-0-5">
                  Service No: <span className="font-mono font-semibold">{verifyingDemand.beneficiaryId?.serviceNumber || '—'}</span>
                </p>
                <p className="small muted mb-0-25">
                  Rank: <span className="font-medium text-navy">{verifyingDemand.beneficiaryId?.rank || '—'}</span>
                </p>
                <p className="small muted mb-0-25">
                  Mobile: <span className="font-medium text-brand">{verifyingDemand.beneficiaryId?.mobile || verifyingDemand.userId?.mobile || '—'}</span>
                </p>
                <p className="small muted">
                  Card ID: <span className="font-mono">{verifyingDemand.beneficiaryId?.cardId || '—'}</span>
                </p>
              </div>

              <div className="panel p-2 bg-subtle rounded border">
                <span className="micro muted uppercase font-bold block mb-1">
                  2. Vehicle & Price Quoted
                </span>
                <p className="font-bold text-navy mb-0-25">
                  {verifyingDemand.productSnapshot?.name || 'Allocated Vehicle'}
                </p>
                <p className="small muted mb-0-5">
                  SKU Index: <span className="font-mono">{verifyingDemand.productSnapshot?.sku || '—'}</span>
                </p>
                <p className="small muted mb-0-25">
                  Selected Color: <span className="badge micro info">{verifyingDemand.selectedColor || 'Factory Default'}</span>
                </p>
                <div className="mt-1 p-1 bg-white rounded border">
                  <span className="micro muted block">Quoted Dealer Price:</span>
                  <span className="font-bold font-mono text-brand text-lg">
                    {inr(verifyingDemand.dealerPrice || verifyingDemand.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Availability Certificate Inspection Box */}
            <div className="panel p-2 mb-3 border rounded panel-muted-bg">
              <span className="micro muted uppercase font-bold block mb-1">
                3. Uploaded Availability Certificate
              </span>

              {(() => {
                const cert = getAvailabilityCertDoc(verifyingDemand);
                if (!cert) {
                  return (
                    <div className="p-2 text-center text-muted small">
                      <AlertTriangle size={18} className="text-warning mb-0-5 panel-warning-icon" />
                      No Availability Certificate attached with this demand. You may request customer to provide hardcopy or proceed if in stock.
                    </div>
                  );
                }

                const isAbsolute = cert.url?.startsWith('http');
                const fileUrl = isAbsolute
                  ? cert.url
                  : `http://localhost:5000${cert.url?.startsWith('/') ? '' : '/'}${cert.url}`;

                return (
                  <div className="between align-center p-2 bg-white rounded border">
                    <div className="row align-center gap-1">
                      <FileText size={28} className="text-brand" />
                      <div>
                        <span className="font-semibold block small">{cert.name || 'Availability_Certificate.pdf'}</span>
                        <span className="micro text-success">✓ Scanned Signed Document</span>
                      </div>
                    </div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn sm primary row align-center gap-0-5"
                    >
                      <Eye size={14} />
                      <span>Open Certificate</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Dealership Sign-off Form */}
            <div className="panel p-2 border rounded">
              <span className="micro muted uppercase font-bold block mb-2">
                4. Showroom Stockyard Allocation & Sign-off
              </span>

              <div className="grid col-2 gap-2 mb-2">
                <div className="fgrp">
                  <label htmlFor="chassisNo" className="small font-semibold">
                    Allotted Chassis / VIN No. <span className="text-danger">*</span>
                  </label>
                  <input
                    id="chassisNo"
                    type="text"
                    className="inp font-mono font-bold"
                    placeholder="e.g. MAH-VIN-2026-9812"
                    value={chassisNo}
                    onChange={(e) => setChassisNo(e.target.value.toUpperCase())}
                  />
                  <p className="micro muted mt-0-25">Physical vehicle number assigned in showroom stockyard</p>
                </div>

                <div className="fgrp">
                  <label htmlFor="engineNo" className="small font-semibold">
                    Engine Number (Optional)
                  </label>
                  <input
                    id="engineNo"
                    type="text"
                    className="inp font-mono"
                    placeholder="e.g. ENG-2198-4421"
                    value={engineNo}
                    onChange={(e) => setEngineNo(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="grid col-2 gap-2 mb-2">
                <div className="fgrp">
                  <label htmlFor="deliveryDays" className="small font-semibold">
                    Estimated Delivery Lead Time (Days)
                  </label>
                  <input
                    id="deliveryDays"
                    type="number"
                    min="1"
                    max="90"
                    className="inp"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                  />
                </div>

                <div className="fgrp">
                  <label htmlFor="priceConfirm" className="small font-semibold">
                    Price Verification Status
                  </label>
                  <input
                    id="priceConfirm"
                    type="text"
                    disabled
                    className="inp text-success font-semibold"
                    value="✓ Verified with Showroom Rate List"
                  />
                </div>
              </div>

              <div className="fgrp">
                <label htmlFor="remarks" className="small font-semibold">
                  Dealership Verification Remarks
                </label>
                <textarea
                  id="remarks"
                  rows="2"
                  className="inp"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: VEHICLE HANDOVER MODAL */}
      {handoverOrder && (
        <Modal
          isOpen={!!handoverOrder}
          onClose={() => setHandoverOrder(null)}
          title={`Confirm Customer Vehicle Handover · ${handoverOrder.orderNo || handoverOrder.id}`}
          subtitle="Issue Physical Gatepass & Release Vehicle"
          maxWidth="520px"
          footer={
            <div className="modal-footer-btns row between align-center w-full">
              <Button variant="outline" onClick={() => setHandoverOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={handlePerformHandover}
                disabled={isSubmittingHandover}
              >
                {isSubmittingHandover ? 'Processing...' : 'Confirm Delivery & Release'}
              </Button>
            </div>
          }
        >
          <div className="p-2">
            <p className="small muted mb-2">
              Before issuing physical handover gatepass, verify:
              <br />1. Original CSD Smart Card of the serving/retired defence officer.
              <br />2. Zero handling or documentation charges levied as per CSD circular.
            </p>

            <div className="fgrp mb-2">
              <label htmlFor="handoverNotes" className="small font-semibold">
                Delivery Notes / Gatepass Stamp Record
              </label>
              <textarea
                id="handoverNotes"
                rows="3"
                className="inp"
                placeholder="Vehicle inspected and released to beneficiary in satisfactory condition."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
