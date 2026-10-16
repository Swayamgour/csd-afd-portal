import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Truck, Users, CheckCircle2, FileCheck, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { orderService } from '../../services/order.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DealerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const orderColumns = [
    { header: 'Supply Order No.', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Beneficiary Customer', accessor: 'beneficiaryName', render: (r) => <div><span className="font-semibold block">{r.beneficiaryName}</span><span className="micro muted">{r.serviceNumber}</span></div> },
    { header: 'Vehicle / Model', accessor: 'productName' },
    { header: 'Chassis VIN', accessor: 'chassisNumber', render: (r) => <span className="font-mono small">{r.chassisNumber || 'In Allocation'}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Showroom Action',
      accessor: 'id',
      render: (r) => (
        <Link to="/dealer/orders" className="btn sm out">
          Handover Status
        </Link>
      )
    }
  ];

  return (
    <div className="dealer-dashboard-page">
      <PageHeader
        title={`Dealership Showroom Operations · ${user?.dealershipName || 'Pratham Motors Pvt. Ltd.'}`}
        subtitle={`Dealer Code: ${user?.dealerCode || 'DLR-ND-082'} · Nodal Officer: ${user?.name} · Delivery & Handover Desk`}
      />

      <div className="kpi-grid mb-3">
        <StatCard
          title="Active Deliveries In Queue"
          value="14 Vehicles"
          subtext="Arrived at Showroom Stockyard"
          icon={Truck}
          variant="primary"
          onClick={() => navigate('/dealer/orders')}
        />
        <StatCard
          title="Delivered to Beneficiaries"
          value="184 Vehicles"
          subtext="Gatepass Stamped"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/dealer/customers')}
        />
        <StatCard
          title="Handling Fee Audit Rating"
          value="100% Compliant"
          subtext="Zero Handling Charges Levied"
          icon={ShieldCheck}
          variant="success"
          onClick={() => navigate('/dealer/profile')}
        />
        <StatCard
          title="Assigned Beneficiaries"
          value="198 Total"
          subtext="Defence personnel assigned"
          icon={Users}
          variant="default"
          onClick={() => navigate('/dealer/customers')}
        />
      </div>

      <Card
        title="Vehicle Delivery & Handover Queue"
        subtitle="Verify beneficiary identity and gatepass certificate before vehicle release"
        actions={
          <Link to="/dealer/orders" className="link small font-semibold">
            All Dealer Orders
          </Link>
        }
      >
        <DataTable
          columns={orderColumns}
          data={orders}
          loading={loading}
        />
      </Card>
    </div>
  );
}
