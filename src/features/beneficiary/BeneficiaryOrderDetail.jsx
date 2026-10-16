import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Truck, Store, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { LoadingState, EmptyState } from '../../components/common/States.jsx';
import { orderService } from '../../services/order.service.js';

export default function BeneficiaryOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const decodedId = decodeURIComponent(id);
        const data = await orderService.getOrderById(decodedId);
        setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingState message="Retrieving supply order..." />;
  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        message="The supply order could not be located in depot logs."
        action={
          <Link to="/beneficiary/orders" className="btn">
            Back to Orders
          </Link>
        }
      />
    );
  }

  return (
    <div className="order-detail-page">
      <div className="mb-2">
        <Link to="/beneficiary/orders" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to All Orders
        </Link>
      </div>

      <PageHeader
        title={`Supply Order · ${order.id}`}
        subtitle={`Issued on ${order.orderDate} for ${order.beneficiaryName}`}
        badge={<StatusBadge status={order.status} />}
        actions={
          <Button
            variant="outline"
            icon={Download}
            onClick={() => alert(`Downloading Certified Supply Order PDF: ${order.id}`)}
          >
            Download Certified Order Copy
          </Button>
        }
      />

      <div className="grid-2-col gap-2 mb-3">
        {/* Left Column: Order Meta */}
        <div className="flex-col gap-2">
          <Card title="Vehicle Allocation Specification">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Item Name:</span>
                <span className="font-semibold">{order.productName}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">OEM Manufacturer:</span>
                <span className="font-medium">{order.oem}</span>
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
                <span className="muted">OEM Invoice Ref:</span>
                <span className="font-mono">{order.invoiceNumber || 'Pending Invoice'}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Sanction Amount Realized:</span>
                <span className="font-bold text-green">₹ {order.amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>

          <Card title="Dealership Showroom Details">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted row align-center gap-1">
                  <Store size={14} /> Dealership Name:
                </span>
                <span className="font-semibold">{order.dealer}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Dealer Point of Contact:</span>
                <span className="font-medium">{order.dealerContact}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted row align-center gap-1">
                  <Calendar size={14} /> Expected Delivery Date:
                </span>
                <span className="font-bold text-brand">{order.expectedDeliveryDate || 'Within 10 days'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Dispatch Timeline */}
        <Card title="Factory Dispatch & Handover Milestones">
          <Timeline
            items={[
              { step: 'Supply Order Generated by Depot', date: order.orderDate, status: 'completed', note: 'Digitally signed and transmitted to OEM Desk' },
              { step: 'Chassis VIN Allocated by OEM', date: order.allocatedDate || 'Completed', status: 'completed', note: `VIN: ${order.chassisNumber}` },
              { step: 'Vehicle in Factory Transit', date: 'In Transit', status: order.status === 'In_Transit' ? 'current' : 'completed', note: 'Carrier vehicle en route to local dealer stockyard' },
              { step: 'Showroom Delivery & Key Handover', date: order.deliveredDate || `Target: ${order.expectedDeliveryDate}`, status: order.status === 'Delivered' ? 'completed' : 'pending', note: 'Customer physical inspection and gatepass signoff' }
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
