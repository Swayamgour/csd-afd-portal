import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Package, Truck, FileText, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { orderService } from '../../services/order.service.js';
import { demandService } from '../../services/demand.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function OemDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [oList, dList] = await Promise.all([
          orderService.getOrders(),
          demandService.getDemands()
        ]);
        setOrders(oList);
        setDemands(dList);
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
    { header: 'Vehicle Model', accessor: 'productName' },
    { header: 'Assigned Dealership', accessor: 'dealer' },
    { header: 'Allocated Chassis VIN', accessor: 'chassisNumber', render: (r) => <span className="font-mono small">{r.chassisNumber || 'Needs Allocation'}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Action',
      accessor: 'id',
      render: (r) => (
        <Link to="/oem/orders" className="btn sm out">
          Manage VIN
        </Link>
      )
    }
  ];

  return (
    <div className="oem-dashboard-page">
      <PageHeader
        title={`OEM Institutional Directorate · ${user?.company || 'Tata Motors Passenger Vehicles Ltd.'}`}
        subtitle={`Nodal Officer: ${user?.name} · Institutional Defence Quota & Factory Dispatch Management`}
      />

      <div className="kpi-grid mb-3">
        <StatCard
          title="Empaneled Models"
          value="18 Lineup"
          subtext="Rate Contract Active"
          icon={Package}
          variant="primary"
          onClick={() => navigate('/oem/products')}
        />
        <StatCard
          title="Open Supply Orders"
          value={orders.length}
          subtext="Factory Allocation Queue"
          icon={Truck}
          variant="warning"
          onClick={() => navigate('/oem/orders')}
        />
        <StatCard
          title="Vehicles in Transit"
          value={orders.filter((o) => o.status === 'In_Transit').length}
          subtext="En Route to Dealerships"
          icon={Building2}
          variant="default"
          onClick={() => navigate('/oem/orders')}
        />
        <StatCard
          title="Delivered This Quarter"
          value="460 Units"
          subtext="Handed over by dealers"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/oem/reports')}
        />
      </div>

      <Card
        title="Active Supply Orders Awaiting Factory VIN Allocation"
        subtitle="Stampted CSD Supply Orders requiring chassis assignment and dealer dispatch"
        actions={
          <Link to="/oem/orders" className="link small font-semibold">
            All OEM Orders
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
