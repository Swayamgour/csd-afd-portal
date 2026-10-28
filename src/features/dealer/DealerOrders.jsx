import React, { useState } from 'react';
import { Truck, CheckCircle2, Download, Check, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation
} from '../demand/demandApi.js';

export default function DealerOrders() {
  const { data: ordersData, isLoading, refetch } = useGetOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const [handoverModalOrder, setHandoverModalOrder] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState('Delivered to customer after physical inspection and CSD Smart Card verification.');
  const [toast, setToast] = useState('');

  const orders = ordersData?.items || [];

  const handleMarkDelivered = async () => {
    if (!handoverModalOrder) return;
    try {
      await updateOrderStatus({
        id: handoverModalOrder._id || handoverModalOrder.id,
        status: 'DELIVERED',
        note: deliveryNote
      }).unwrap();

      setToast(`Delivery gatepass recorded for ${handoverModalOrder.orderNo || handoverModalOrder.id}. Beneficiary notified.`);
      setHandoverModalOrder(null);
      refetch();
    } catch (err) {
      alert(err?.data?.message || err?.message || 'Failed to update delivery status');
    }
  };

  const columns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (r) => <span className="font-semibold text-brand font-mono">{r.orderNo || r.id}</span>
    },
    {
      header: 'Beneficiary Customer',
      accessor: 'beneficiaryId',
      render: (r) => (
        <div>
          <span className="font-semibold block">{r.beneficiaryName || r.userId?.name || 'CSD Beneficiary'}</span>
          <span className="micro muted">{r.serviceNumber || 'Defence Personnel'}</span>
        </div>
      )
    },
    {
      header: 'Vehicle / Item',
      accessor: 'items',
      render: (r) => {
        const item = r.items?.[0] || {};
        return <span className="font-medium small">{item.name || r.productName || 'Allocated Vehicle'}</span>;
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      header: 'Showroom Handover',
      accessor: '_id',
      render: (r) =>
        r.status === 'DELIVERED' ? (
          <span className="small text-green font-semibold">✓ Delivered & Gatepass Issued</span>
        ) : (
          <Button
            size="sm"
            variant="primary"
            icon={Check}
            onClick={() => {
              setHandoverModalOrder(r);
              setDeliveryNote('Delivered to customer after physical inspection and CSD Smart Card verification.');
            }}
          >
            Mark Handed Over
          </Button>
        )
    }
  ];

  return (
    <div className="dealer-orders-page">
      <PageHeader
        title="Showroom Vehicle Handover & Gatepass Desk"
        subtitle="Execute physical deliveries upon inspecting original defence identity and CSD Supply Order"
      />

      {toast && (
        <div className="alert-banner success mb-2 small row align-center gap-1" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {handoverModalOrder && (
        <Card
          className="mb-4 border-primary"
          title={`Confirm Customer Vehicle Handover · Order #${handoverModalOrder.orderNo || handoverModalOrder.id}`}
          subtitle={`Beneficiary: ${handoverModalOrder.beneficiaryName || 'Defence Personnel'}`}
          headerAction={
            <Button variant="outline" size="sm" onClick={() => setHandoverModalOrder(null)}>
              Dismiss
            </Button>
          }
        >
          <div className="handover-form p-2">
            <div className="alert-banner info mb-3">
              <strong>Mandatory Handover Verification:</strong>
              <ul className="mt-1 pl-4 list-disc text-sm">
                <li>Verify original CSD Smart Card of the serving/retired personnel.</li>
                <li>Ensure zero handling/documentation fee is levied as per official CSD circular.</li>
                <li>Verify chassis and engine numbers against the CSD Supply Order Sanction.</li>
              </ul>
            </div>

            <div className="form-group mb-3">
              <label htmlFor="gatepassNotes" className="form-label font-medium">
                Delivery Gatepass Notes / Remarks
              </label>
              <textarea
                id="gatepassNotes"
                rows="3"
                className="form-control"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Enter gatepass notes, battery/tool checklist or remarks..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setHandoverModalOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleMarkDelivered}
                loading={isUpdating}
              >
                Confirm Handover & Issue Gatepass
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card
        title="Allocated Vehicle Orders"
        subtitle="Live showroom orders awaiting delivery release"
      >
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          emptyMessage={
            <div className="p-4 text-center">
              <Truck size={40} className="text-muted mb-1 text-center-auto-m" />
              <h3 className="h4 font-bold">No Active Supply Orders</h3>
              <p className="text-muted small">
                Once customer completes payment for a verified demand, official CSD supply orders will populate here for vehicle release.
              </p>
            </div>
          }
        />
      </Card>
    </div>
  );
}
