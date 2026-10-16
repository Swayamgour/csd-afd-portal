import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Truck,
  CreditCard,
  Building2,
  Store,
  Warehouse,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import ChartCard from '../../components/common/ChartCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { demandService } from '../../services/demand.service.js';
import { ticketService } from '../../services/ticket.service.js';

export default function CsdDashboard() {
  const navigate = useNavigate();
  const [demands, setDemands] = useState([]);
  const [escalatedTickets, setEscalatedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dList, tList] = await Promise.all([
          demandService.getDemands(),
          ticketService.getTickets({ escalated: true })
        ]);
        setDemands(dList);
        setEscalatedTickets(tList);
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
    { header: 'Item / Vehicle', accessor: 'productName' },
    { header: 'Regional Depot', accessor: 'depot' },
    { header: 'Sanction Value', accessor: 'csdPrice', render: (row) => `₹ ${row.csdPrice?.toLocaleString('en-IN')}` },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Review',
      accessor: 'id',
      render: (row) => (
        <Link to={`/csd/demands`} className="btn sm out">
          Scrutiny
        </Link>
      )
    }
  ];

  return (
    <div className="csd-dashboard-page">
      <PageHeader
        title="CSD Head Office Operations Directorate"
        subtitle="National procurement oversight, policy enforcement, depot sanctions, and institutional dealer governance."
        actions={
          <div className="row gap-1">
            <Link to="/csd/reports" className="btn btn-primary">
              Generate National MIS Report
            </Link>
          </div>
        }
      />

      {/* Top Oversight KPIs */}
      <div className="kpi-grid mb-3">
        <StatCard
          title="Total Registered Beneficiaries"
          value="4,21,800"
          subtext="Armed Forces & Veterans"
          icon={Users}
          trend={{ value: '+4.2% MoM', isUp: true }}
          variant="primary"
          onClick={() => navigate('/csd/beneficiaries')}
        />
        <StatCard
          title="AFD Demands In Pipeline"
          value={demands.length}
          subtext="Across 34 Regional Depots"
          icon={FileText}
          variant="default"
          onClick={() => navigate('/csd/demands')}
        />
        <StatCard
          title="Treasury Collections (Q3)"
          value="₹ 162.80 Cr"
          subtext="SBI Cyber Treasury Reconciled"
          icon={CreditCard}
          trend={{ value: '100% matched', isUp: true }}
          variant="success"
          onClick={() => navigate('/csd/payments')}
        />
        <StatCard
          title="Escalated Grievances"
          value={`${escalatedTickets.length} Cases`}
          subtext="Requiring HQ Intervention"
          icon={ShieldAlert}
          variant={escalatedTickets.length > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/csd/support')}
        />
      </div>

      {/* 2-Column: National Demand Sanctions & Regional Depot Breakdown */}
      <div className="grid-2-col gap-2 mb-3">
        <Card
          title="Regional Depot Procurement Volume"
          subtitle="Real-time distribution of AFD allocation by zonal command"
        >
          <ChartCard
            title=""
            data={[
              { label: 'Delhi Regional CSD Depot (DOD)', value: 680, displayValue: '680 Demands (₹ 72.4 Cr)', color: 'var(--brand)' },
              { label: 'Pune Regional CSD Depot (POD)', value: 490, displayValue: '490 Demands (₹ 51.2 Cr)', color: '#3b82f6' },
              { label: 'Lucknow Central CSD Depot (LOD)', value: 360, displayValue: '360 Demands (₹ 36.8 Cr)', color: 'var(--green)' },
              { label: 'Bengaluru Regional CSD Depot (BOD)', value: 312, displayValue: '312 Demands (₹ 23.8 Cr)', color: 'var(--saffron)' }
            ]}
          />
        </Card>

        {/* Escalated Helpdesk Cases */}
        <Card
          title="HQ Escalation Oversight (Level 4 Cases)"
          subtitle="Grievances escalated directly to Joint Director / CSD Head Office"
          actions={
            <Link to="/csd/support" className="link small font-semibold">
              View All Support Cases
            </Link>
          }
        >
          <div className="escalated-tickets-list flex-col gap-2">
            {escalatedTickets.map((t) => (
              <div key={t.id} className="panel p-3 border-left-danger bg-red-soft">
                <div className="between align-start mb-1">
                  <span className="font-semibold text-danger small block">{t.id} · {t.category}</span>
                  <span className="badge-pill badge-danger badge-sm">Level {t.escalationLevel} HQ</span>
                </div>
                <h4 className="font-semibold small mb-1">{t.subject}</h4>
                <p className="small muted mb-2">Complainant: <b>{t.userName}</b> ({t.userRole})</p>
                <div className="between align-center">
                  <span className="micro text-danger font-semibold">SLA Status: {t.slaStatus}</span>
                  <Link to={`/helpdesk/tickets/${t.id}`} className="btn sm out">
                    Investigate Case
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Demands Scrutiny Table */}
      <Card
        title="National Demand Inflow"
        subtitle="Live queue of applications submitted across regional commands"
        actions={
          <Link to="/csd/demands" className="link small font-semibold">
            All Demands & Approvals
          </Link>
        }
      >
        <DataTable
          columns={demandColumns}
          data={demands.slice(0, 5)}
          loading={loading}
        />
      </Card>
    </div>
  );
}
