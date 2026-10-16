import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Truck,
  CreditCard,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { demandService } from '../../services/demand.service.js';
import { orderService } from '../../services/order.service.js';

export function BeneficiaryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demands, setDemands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dList, oList] = await Promise.all([
          demandService.getDemands({ role: 'beneficiary', userId: user?.id }),
          orderService.getOrders({ beneficiaryId: user?.id })
        ]);
        setDemands(dList);
        setOrders(oList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const activeDemand = demands[0];
  const activeOrder = orders[0];

  const demandColumns = [
    { header: 'Demand ID', accessor: 'id', render: (row) => <span className="font-semibold text-brand">{row.id}</span> },
    { header: 'Item / Vehicle', accessor: 'productName' },
    { header: 'Quota Category', accessor: 'category', render: (row) => <span className="text-uppercase small font-medium">{row.category}</span> },
    { header: 'Sanction Price', accessor: 'csdPrice', render: (row) => `₹ ${row.csdPrice?.toLocaleString('en-IN')}` },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <Link to={`/beneficiary/demands/${row.id}`} className="btn sm out">
          View Detail
        </Link>
      )
    }
  ];

  return (
    <div className="beneficiary-dashboard-page">
      {/* Welcome & Eligibility Banner */}
      <div className="panel welcome-banner mb-3">
        <div className="between align-center flex-wrap gap-2">
          <div className="welcome-meta">
            <span className="eyebrow light">Verified Defence Beneficiary</span>
            <h1 className="h2 text-white mb-1">
              Welcome, {user?.name}
            </h1>
            <p className="text-white-80 small mb-0">
              Service No: <b>{user?.serviceNumber}</b> · Rank: <b>{user?.rank}</b> · {user?.service} ({user?.regiment})
            </p>
          </div>

          <div className="welcome-actions row gap-1">
            <Link to="/products" className="btn btn-saffron font-bold">
              <PlusCircle size={16} />
              <span>Browse Products & Apply</span>
            </Link>
            <Link to="/beneficiary/eligibility" className="btn out text-white">
              <ShieldCheck size={16} />
              <span>View Entitlement</span>
            </Link>
          </div>
        </div>

        {/* Eligibility Quick Strip */}
        <div className="eligibility-quick-strip mt-3 pt-2 border-top-white-10 row gap-2 flex-wrap">
          <div className="strip-item small text-white">
            <span className="muted-light">Category:</span> <b>{user?.eligibility?.category}</b>
          </div>
          <div className="strip-item small text-white">
            <span className="muted-light">Car Quota Cap:</span> <b>₹ {(user?.eligibility?.fourWheelerCap / 100000).toFixed(1)} Lakhs</b>
          </div>
          <div className="strip-item small text-white">
            <span className="muted-light">Car Periodicity:</span> Every <b>{user?.eligibility?.fourWheelerIntervalYears} Years</b>
          </div>
          <div className="strip-item small text-white">
            <span className="muted-light">Next Car Window:</span> <b>{user?.eligibility?.nextFourWheelerEligibleDate}</b>
          </div>
          <div className="strip-item small text-green-light row align-center gap-1 font-bold">
            <ShieldCheck size={14} />
            <span>Eligible for Four-Wheeler & Two-Wheeler</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Active AFD Demands"
          value={demands.length}
          subtext="Under Sanction & Dispatch"
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/beneficiary/demands')}
        />
        <StatCard
          title="Supply Orders Issued"
          value={orders.length}
          subtext="Allocated to Dealership"
          icon={Truck}
          variant="success"
          onClick={() => navigate('/beneficiary/orders')}
        />
        <StatCard
          title="Pending Payments"
          value={demands.filter((d) => d.paymentStatus === 'Pending').length}
          subtext="Requires Treasury e-Pay"
          icon={CreditCard}
          variant="warning"
          onClick={() => navigate('/beneficiary/payments')}
        />
        <StatCard
          title="Support Tickets"
          value="1 Active"
          subtext="SLA Tracked"
          icon={HelpCircle}
          variant="default"
          onClick={() => navigate('/beneficiary/tickets')}
        />
      </div>

      {/* Active Order Spotlight */}
      {activeOrder && (
        <Card
          title={`Active Supply Order Dispatch · ${activeOrder.id}`}
          subtitle={`Vehicle: ${activeOrder.productName} · Allocated Dealership: ${activeOrder.dealer}`}
          actions={
            <Link to={`/beneficiary/orders/${activeOrder.id}`} className="link small font-semibold row align-center gap-1">
              <span>Full Order Tracker</span>
              <ArrowRight size={14} />
            </Link>
          }
          className="mb-3"
        >
          <div className="active-order-grid">
            <div className="order-details-col">
              <div className="info-kv-list">
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Demand Reference:</span>
                  <span className="font-semibold">{activeOrder.demandId}</span>
                </div>
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Chassis / VIN:</span>
                  <span className="font-mono font-semibold">{activeOrder.chassisNumber || 'In Allocation'}</span>
                </div>
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Engine Number:</span>
                  <span className="font-mono font-semibold">{activeOrder.engineNumber || 'In Allocation'}</span>
                </div>
                <div className="kv-row between small py-1 border-bottom">
                  <span className="muted">Sanction Amount:</span>
                  <span className="font-bold text-brand">₹ {activeOrder.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="kv-row between small py-1">
                  <span className="muted">Dealer Point of Contact:</span>
                  <span className="font-medium">{activeOrder.dealerContact}</span>
                </div>
              </div>
            </div>

            <div className="order-timeline-col">
              <h4 className="small font-semibold mb-2">Delivery Milestone Timeline</h4>
              <Timeline
                items={[
                  { step: 'Supply Order Sanctioned', date: activeOrder.orderDate, status: 'completed', note: 'Order stamped by Depot' },
                  { step: 'Factory Dispatch / In Transit', date: 'In Progress', status: 'current', note: 'Transit from OEM manufacturing plant' },
                  { step: 'Physical Dealer Delivery', date: `Expected: ${activeOrder.expectedDeliveryDate}`, status: 'pending', note: 'Vehicle inspection & key handover' },
                ]}
              />
            </div>
          </div>
        </Card>
      )}

      {/* My Demands Table */}
      <Card
        title="Recent AFD Demands"
        subtitle="Live tracking of applications submitted to CSD Regional Depots"
        actions={
          <Link to="/beneficiary/demands" className="link small font-semibold">
            View All Demands
          </Link>
        }
        className="mb-3"
      >
        <DataTable
          columns={demandColumns}
          data={demands}
          loading={loading}
          emptyTitle="No demands created yet"
          emptyText="Browse our catalogue to select a vehicle or appliance and initiate your demand."
        />
      </Card>
    </div>
  );
}
export default BeneficiaryDashboard;
