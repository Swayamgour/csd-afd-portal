import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Warehouse, FileText, Truck, CreditCard, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { demandService } from '../../services/demand.service.js';
import { orderService } from '../../services/order.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DepotDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demands, setDemands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dList, oList] = await Promise.all([
          demandService.getDemands(),
          orderService.getOrders()
        ]);
        setDemands(dList);
        setOrders(oList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const demandColumns = [
    {
      header: 'Demand ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Applicant', accessor: 'beneficiaryName', render: (row) => <div><span className="font-semibold block">{row.beneficiaryName}</span><span className="micro muted">{row.serviceNumber}</span></div> },
    { header: 'Product Item', accessor: 'productName' },
    { header: 'Sanction Price', accessor: 'csdPrice', render: (row) => `₹ ${row.csdPrice?.toLocaleString('en-IN')}` },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <Link to="/depot/demands" className="btn sm out">
          Sanction Queue
        </Link>
      )
    }
  ];

  return (
    <div className="depot-dashboard-page">
      <PageHeader
        title={`Regional Depot Directorate · ${user?.depot || 'Delhi Regional Depot'}`}
        subtitle={`Commanding Officer: ${user?.name} · Area Jurisdictional Operations & Demand Sanction Desk`}
        actions={
          <div className="row gap-1">
            <Link to="/depot/demands" className="btn btn-primary">
              Open Received Demands
            </Link>
          </div>
        }
      />

      <div className="kpi-grid mb-3">
        <StatCard
          title="Regional AFD Demands"
          value="184"
          subtext="Under Local Scrutiny"
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/depot/demands')}
        />
        <StatCard
          title="Supply Orders Issued"
          value="912"
          subtext="Dispatched to Dealers"
          icon={Truck}
          variant="success"
          onClick={() => navigate('/depot/orders')}
        />
        <StatCard
          title="Pending Sanction Queue"
          value="28 Demands"
          subtext="Awaiting CO Signature"
          icon={ShieldCheck}
          variant="warning"
          onClick={() => navigate('/depot/demands')}
        />
        <StatCard
          title="Daily Treasury Realization"
          value="₹ 1.84 Cr"
          subtext="Matched SBI e-Pay"
          icon={CreditCard}
          variant="default"
          onClick={() => navigate('/depot/transactions')}
        />
      </div>

      <div className="grid-2-col gap-2 mb-3">
        <Card
          title="Urgent Sanction Queue"
          subtitle="Demands verified by URCs awaiting Depot Sanction Certificate"
          actions={
            <Link to="/depot/demands" className="link small font-semibold">
              View All Demands
            </Link>
          }
        >
          <DataTable
            columns={demandColumns}
            data={demands.slice(0, 4)}
            loading={loading}
          />
        </Card>

        <Card
          title="Supply Orders Dispatched to Local Showrooms"
          subtitle="Recent allocations forwarded to authorized dealerships"
          actions={
            <Link to="/depot/orders" className="link small font-semibold">
              All Depot Orders
            </Link>
          }
        >
          <div className="depot-orders-summary flex-col gap-2">
            {orders.slice(0, 3).map((o) => (
              <div key={o.id} className="panel p-2 between align-center">
                <div>
                  <span className="font-semibold text-brand small block">{o.id}</span>
                  <p className="small mb-0 font-medium">{o.productName}</p>
                  <span className="micro muted">Dealer: {o.dealer}</span>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
