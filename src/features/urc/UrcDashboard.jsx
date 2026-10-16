import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, FileText, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import { demandService } from '../../services/demand.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UrcDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

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

  const handleEndorse = async (id) => {
    await demandService.updateDemandStatus(id, 'URC_Verified', 'Service credentials & Availment Certificate verified by URC Officer');
    setToast(`Demand ${id} verified and forwarded to Regional Depot for Sanction.`);
    loadDemands();
  };

  const columns = [
    { header: 'Demand ID', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Beneficiary', accessor: 'beneficiaryName', render: (r) => <div><span className="font-semibold block">{r.beneficiaryName}</span><span className="micro muted">{r.serviceNumber}</span></div> },
    { header: 'Item / Vehicle', accessor: 'productName' },
    { header: 'CSD Price', accessor: 'csdPrice', render: (r) => `₹ ${r.csdPrice?.toLocaleString('en-IN')}` },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'URC Endorsement',
      accessor: 'id',
      render: (r) =>
        r.status === 'Submitted' ? (
          <Button
            size="sm"
            variant="primary"
            icon={ShieldCheck}
            onClick={() => handleEndorse(r.id)}
          >
            Verify & Forward
          </Button>
        ) : (
          <span className="small text-green font-semibold">● Verified</span>
        )
    }
  ];

  return (
    <div className="urc-dashboard-page">
      <PageHeader
        title={`Unit Run Canteen (URC) Operations · ${user?.urc || 'Delhi Cantt Central URC'}`}
        subtitle={`Officer-in-Charge: ${user?.name} · Local Unit Scrutiny & Endorsement Desk`}
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <div className="kpi-grid mb-3">
        <StatCard
          title="Local Unit Demands"
          value={demands.length}
          subtext="Personnel attached to this URC"
          icon={FileText}
          variant="primary"
          onClick={() => navigate('/urc/demands')}
        />
        <StatCard
          title="Awaiting URC Verification"
          value={demands.filter((d) => d.status === 'Submitted').length}
          subtext="Requires Service Check"
          icon={ShieldCheck}
          variant="warning"
          onClick={() => navigate('/urc/demands')}
        />
        <StatCard
          title="Forwarded to Depot"
          value={demands.filter((d) => d.status !== 'Submitted').length}
          subtext="Sanction In Progress"
          icon={Truck}
          variant="success"
          onClick={() => navigate('/urc/demands')}
        />
      </div>

      <Card
        title="Unit Verification Queue"
        subtitle="Verify service cards and Availment Certificate before forwarding to Depot"
      >
        <DataTable
          columns={columns}
          data={demands}
          loading={loading}
        />
      </Card>
    </div>
  );
}
