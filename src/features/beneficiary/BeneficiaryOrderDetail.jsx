import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Truck, Store, Calendar, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { LoadingState, EmptyState } from '../../components/common/States.jsx';
import { useGetOrderByIdQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryOrderDetail() {
  const { id } = useParams();
  const decodedId = decodeURIComponent(id);

  const { data: orderData, isLoading: loading, isError, error, refetch } = useGetOrderByIdQuery(decodedId);

  const order = orderData?.data || orderData;

  if (loading) return <LoadingState message="Retrieving supply order from CSD logs..." />;

  if (isError || !order) {
    return (
      <EmptyState
        title="Order Not Found"
        message={getErrorMessage(error, 'The supply order could not be located in depot logs.')}
        action={
          <Link to="/beneficiary/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        }
      />
    );
  }

  const timelineItems = [
    {
      step: 'Supply Order Issued',
      date: new Date(order.createdAt).toLocaleDateString('en-IN'),
      status: 'completed',
      note: `Certified Supply Order No: ${order.orderNo || order._id}`,
    },
    {
      step: 'OEM Factory Allocation',
      date: order.chassisNumber ? 'Allocated' : 'In Allocation',
      status: order.chassisNumber ? 'completed' : 'current',
      note: order.chassisNumber ? `Chassis: ${order.chassisNumber}` : 'Factory allocation in progress',
    },
    {
      step: 'Dealership Dispatch & Inspection',
      date: order.status === 'DELIVERED' ? 'Delivered' : 'In Transit',
      status: order.status === 'DELIVERED' ? 'completed' : order.chassisNumber ? 'current' : 'pending',
      note: 'Pre-delivery inspection & PDI handover',
    },
  ];

  return (
    <div className="order-detail-page">
      <div className="mb-2">
        <Link to="/beneficiary/orders" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to All Orders
        </Link>
      </div>

      <PageHeader
        title={`Supply Order · ${order.orderNo || order._id?.slice(-8).toUpperCase()}`}
        subtitle={`Issued on ${new Date(order.createdAt).toLocaleDateString('en-IN')}`}
        badge={<StatusBadge status={order.status} />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh">
              <RefreshCw size={14} />
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => alert(`Downloading Certified Supply Order PDF: ${order.orderNo || order._id}`)}
            >
              Download Certified Copy
            </Button>
          </div>
        }
      />

      <div className="grid-2-col gap-2 mb-3">
        {/* Left Column: Order Meta */}
        <div className="flex-col gap-2">
          <Card title="Vehicle Allocation Specification">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Demand Reference:</span>
                <span className="font-semibold text-brand">
                  {order.demandId?.demandNo || order.demandId || 'Direct'}
                </span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Allocated Chassis / VIN:</span>
                <span className="font-mono font-bold text-brand">{order.chassisNumber || 'In Allocation'}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Engine Number:</span>
                <span className="font-mono">{order.engineNumber || 'In Allocation'}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Total Order Amount:</span>
                <span className="font-bold text-green">₹ {(order.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Order Status:</span>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="flex-col gap-2">
          <Card title="Milestone Fulfillment Tracker" subtitle="Live tracking across Depot & Dealer">
            <Timeline items={timelineItems} />
          </Card>
        </div>
      </div>
    </div>
  );
}
