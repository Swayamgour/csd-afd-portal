import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Truck,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  XCircle,
  Building,
  Store
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { LoadingState, EmptyState } from '../../components/common/States.jsx';
import { demandService } from '../../services/demand.service.js';

export default function BeneficiaryDemandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [demand, setDemand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState('');

  const loadDemand = async () => {
    setLoading(true);
    try {
      const data = await demandService.getDemandById(id);
      setDemand(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemand();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await demandService.cancelDemand(id, 'Applicant requested cancellation');
      setCancelModalOpen(false);
      setToast('Demand cancelled successfully.');
      loadDemand();
    } catch (e) {
      alert(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingState message="Retrieving demand details..." />;
  if (!demand) {
    return (
      <EmptyState
        title="Demand Not Found"
        message={`The demand ${id} could not be located in records.`}
        action={
          <Link to="/beneficiary/demands" className="btn">
            Back to Demands
          </Link>
        }
      />
    );
  }

  const isPaymentPending = demand.status === 'Payment_Pending' || demand.paymentStatus === 'Pending';
  const hasSupplyOrder = !!demand.supplyOrderNo;

  return (
    <div className="demand-detail-page">
      <div className="mb-2">
        <Link to="/beneficiary/demands" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to All Demands
        </Link>
      </div>

      <PageHeader
        title={`Demand Details · ${demand.id}`}
        subtitle={`Submitted on ${new Date(demand.createdAt).toLocaleDateString('en-IN')}`}
        badge={<StatusBadge status={demand.status} />}
        actions={
          <div className="row gap-1">
            {isPaymentPending && (
              <Button
                variant="primary"
                icon={CreditCard}
                onClick={() => navigate('/beneficiary/payments')}
              >
                Proceed to Payment
              </Button>
            )}
            {hasSupplyOrder && (
              <Button
                variant="outline"
                icon={Download}
                onClick={() => alert(`Downloading Certified Supply Order: ${demand.supplyOrderNo}`)}
              >
                Download Supply Order
              </Button>
            )}
            {demand.status !== 'Cancelled' && demand.status !== 'Delivered' && (
              <Button
                variant="ghost"
                className="text-danger"
                icon={XCircle}
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Demand
              </Button>
            )}
          </div>
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Grid: Left details & Right timeline */}
      <div className="grid-2-col gap-2 mb-3">
        {/* Left Column: Vehicle & Financial Breakdown */}
        <div className="left-col-stack flex-col gap-2">
          <Card title="Vehicle & Entitlement Summary">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Product Line:</span>
                <span className="font-semibold">{demand.productName}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Category:</span>
                <span className="text-uppercase font-medium">{demand.category}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Variant:</span>
                <span>{demand.variant}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Colour Choice:</span>
                <span>{demand.color}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Fuel Type:</span>
                <span>{demand.fuel}</span>
              </div>
            </div>
          </Card>

          <Card title="Price & Sanction Breakdown">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Civilian Ex-Showroom:</span>
                <span className="line-through muted">
                  ₹ {demand.exShowroomPrice?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Concessional CSD Price:</span>
                <span className="h4 text-brand mb-0">
                  ₹ {demand.csdPrice?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Total Beneficiary Savings:</span>
                <span className="font-bold text-green">
                  ₹ {demand.savings?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Payment Realization Status:</span>
                <span className={`font-semibold ${demand.paymentStatus === 'Verified' ? 'text-green' : 'text-saffron'}`}>
                  ● {demand.paymentStatus?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Regional Allocation">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted row align-center gap-1">
                  <Building size={14} /> Regional Depot:
                </span>
                <span className="font-semibold">{demand.depot}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Parent URC:</span>
                <span>{demand.urc}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted row align-center gap-1">
                  <Store size={14} /> Authorized Dealer:
                </span>
                <span className="font-semibold">{demand.dealer}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline & Documents */}
        <div className="right-col-stack flex-col gap-2">
          <Card
            title="Procurement Progression Timeline"
            subtitle="Step-by-step audit record from online submission to vehicle handover"
          >
            <Timeline items={demand.timeline || []} />
          </Card>

          <Card title="Attached Verification Documents">
            <div className="doc-list-grid">
              {(demand.documents || []).map((doc, idx) => (
                <DocumentViewer
                  key={idx}
                  name={doc.name}
                  size={doc.size}
                  status={doc.status}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Confirm Demand Cancellation"
        message={`Are you sure you want to cancel Demand ${demand.id}? Once cancelled, you will need to re-apply from the catalog.`}
        confirmLabel="Yes, Cancel Demand"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
