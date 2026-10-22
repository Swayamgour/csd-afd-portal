import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Package,
  History,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetDemandsQuery, useGetOrdersQuery } from '../demand/demandApi.js';

export default function DepotDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // RTK Query: Scoped server data with cache tags
  const {
    data: demandsData,
    isLoading: loadingDemands,
    isFetching: fetchingDemands,
    refetch: refetchDemands,
  } = useGetDemandsQuery();

  const {
    data: ordersData,
    isLoading: loadingOrders,
    refetch: refetchOrders,
  } = useGetOrdersQuery();

  const demands = Array.isArray(demandsData?.items)
    ? demandsData.items
    : Array.isArray(demandsData)
    ? demandsData
    : [];

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const loading = loadingDemands || loadingOrders;

  // 10 Section 16 Scoped Metrics
  const newDemandsCount = demands.filter((d) => d.status === 'CREATED').length;
  const processingCount = demands.filter((d) => d.status === 'PROCESSING').length;
  const paymentPendingCount = demands.filter((d) => d.status === 'PAYMENT_PENDING' || d.paymentStatus === 'UNPAID').length;
  const paymentVerificationCount = demands.filter((d) => d.status === 'PAID' || d.paymentStatus === 'PAID').length;
  const purchaseHistoryCount = demands.filter((d) => d.previousPurchase?.hasPurchased).length;
  const documentsPendingCount = demands.filter((d) => !d.documents || d.documents.length === 0).length;
  const approvalPendingCount = demands.filter((d) => ['PROCESSING', 'PAID'].includes(d.status)).length;
  const approvedCount = demands.filter((d) => ['APPROVED', 'SUPPLY_ORDER_ISSUED'].includes(d.status)).length;
  const rejectedCount = demands.filter((d) => ['REJECTED', 'CANCELLED'].includes(d.status)).length;
  const completedCount = orders.filter((o) => o.status === 'DELIVERED').length;

  const totalDemandsCount = demands.length;
  const totalValueNum = demands.reduce(
    (acc, d) => acc + Number(d.totalAmount || d.unitPrice || 0),
    0
  );

  const totalValueFormatted =
    totalValueNum >= 10000000
      ? `₹ ${(totalValueNum / 10000000).toFixed(2)} Cr`
      : totalValueNum >= 100000
      ? `₹ ${(totalValueNum / 100000).toFixed(2)} L`
      : `₹ ${totalValueNum.toLocaleString('en-IN')}`;

  const depotTitle =
    user?.depot ||
    user?.depotName ||
    demands[0]?.depotId?.name ||
    'Delhi Regional Depot';

  const demandColumns = [
    {
      header: 'Demand No',
      accessor: 'demandNo',
      render: (row) => (
        <span className="depot-cell-bold-blue">
          {row.demandNo || row._id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Beneficiary',
      accessor: 'beneficiary',
      render: (row) => (
        <div>
          <span className="depot-cell-bold-dark">
            {row.beneficiaryId?.name || row.productSnapshot?.dealerRefName || 'Beneficiary'}
          </span>
          <span className="depot-cell-subtext">
            {row.beneficiaryId?.serviceNumber || row.beneficiaryId?.rank || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => (
        <div className="depot-cell-product-truncate">
          {row.productSnapshot?.name || row.productId?.name || 'AFD Vehicle/Item'}
        </div>
      ),
    },
    {
      header: 'Dealer',
      accessor: 'dealer',
      render: (row) => row.dealerId?.name || row.productSnapshot?.dealerRefName || 'Authorized Dealership',
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (row) => `₹ ${Number(row.totalAmount || 0).toLocaleString('en-IN')}`,
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      render: (row) => (
        <span
          className={`depot-pill-payment ${row.paymentStatus === 'PAID' ? 'depot-pill-paid' : 'depot-pill-unpaid'}`}
        >
          {row.paymentStatus || 'UNPAID'}
        </span>
      ),
    },
    {
      header: 'Demand Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : 'Today'),
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (row) => (
        <Link to="/depot/demands" className="depot-link-action">
          <Button variant="outline" size="sm">
            Process
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="depot-dashboard-page depot-page-pad">
      <PageHeader
        title={`Regional Depot Directorate · ${depotTitle}`}
        subtitle={`Commanding Officer: ${user?.name || 'Depot Official'} · Area Jurisdictional Operations & Demand Processing Desk`}
        actions={
          <div className="portal-flex-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchDemands();
                refetchOrders();
              }}
              disabled={fetchingDemands}
            >
              <RefreshCw
                size={14}
                className={fetchingDemands ? 'depot-refresh-spin' : 'depot-refresh-icon'}
              />
              {fetchingDemands ? 'Syncing...' : 'Sync Demands'}
            </Button>
            <Link to="/depot/demands">
              <Button variant="primary" size="sm">
                Open Demand Queue ({totalDemandsCount})
              </Button>
            </Link>
          </div>
        }
      />

      {/* 10 SCOPED DEPOT SUMMARY CARDS */}
      <div className="depot-section-mb">
        <h3 className="depot-section-heading">
          Depot Demand Sanction & Verification Stages
        </h3>
        <div className="depot-kpi-grid">
          <StatCard
            title="New Demands"
            value={String(newDemandsCount)}
            subtext="Freshly raised"
            icon={FileText}
            variant="default"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Processing"
            value={String(processingCount)}
            subtext="Under Depot Review"
            icon={Clock}
            variant="primary"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Payment Pending"
            value={String(paymentPendingCount)}
            subtext="Awaiting UTR / Online Pay"
            icon={CreditCard}
            variant="warning"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Payment Verification"
            value={String(paymentVerificationCount)}
            subtext="Treasury reconciliation"
            icon={FileCheck}
            variant="primary"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="History Verification"
            value={String(purchaseHistoryCount)}
            subtext="Prior purchase scrutiny"
            icon={History}
            variant="default"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Documents Pending"
            value={String(documentsPendingCount)}
            subtext="Awaiting attachments"
            icon={AlertCircle}
            variant="warning"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Approval Pending"
            value={String(approvalPendingCount)}
            subtext="Ready for sign-off"
            icon={CheckCircle2}
            variant="warning"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Approved Demands"
            value={String(approvedCount)}
            subtext="Sanctioned orders"
            icon={CheckCircle2}
            variant="success"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Rejected Demands"
            value={String(rejectedCount)}
            subtext="Non-compliant requests"
            icon={XCircle}
            variant="danger"
            onClick={() => navigate('/depot/demands')}
          />
          <StatCard
            title="Completed Orders"
            value={String(completedCount)}
            subtext="Vehicle handed over"
            icon={Package}
            variant="success"
            onClick={() => navigate('/depot/orders')}
          />
        </div>
      </div>

      {/* REAL-TIME SCOPED DEMAND TABLE */}
      <Card
        title="Active Depot Processing Queue"
        subtitle="Jurisdictional demand records assigned to your depot station"
        actions={
          <Link to="/depot/demands" className="depot-link-action">
            Open Complete Queue →
          </Link>
        }
      >
        <DataTable
          columns={demandColumns}
          data={demands.slice(0, 8)}
          loading={loading}
          emptyText="No demands pending at your depot station."
        />
      </Card>
    </div>
  );
}
