import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Download, Check } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import { orderService } from '../../services/order.service.js';

export default function DealerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handoverModalOrder, setHandoverModalOrder] = useState(null);
  const [toast, setToast] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleMarkDelivered = async () => {
    try {
      await orderService.updateOrderStatus(handoverModalOrder.id, 'Delivered', {
        deliveredDate: new Date().toISOString().split('T')[0]
      });
      setHandoverModalOrder(null);
      setToast(`Delivery gatepass recorded for ${handoverModalOrder.id}. Beneficiary notified.`);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Order Ref', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Customer', accessor: 'beneficiaryName', render: (r) => <div><span className="font-semibold block">{r.beneficiaryName}</span><span className="micro muted">{r.serviceNumber}</span></div> },
    { header: 'Vehicle / Item', accessor: 'productName' },
    { header: 'Chassis VIN', accessor: 'chassisNumber', render: (r) => <span className="font-mono small">{r.chassisNumber || 'Needs Allocation'}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Showroom Handover',
      accessor: 'id',
      render: (r) =>
        r.status !== 'Delivered' ? (
          <Button
            size="sm"
            variant="primary"
            icon={Check}
            onClick={() => setHandoverModalOrder(r)}
          >
            Mark Handed Over
          </Button>
        ) : (
          <span className="small text-green font-semibold">● Delivered</span>
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
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <Card>
        <DataTable columns={columns} data={orders} loading={loading} />
      </Card>

      {handoverModalOrder && (
        <Modal
          isOpen={!!handoverModalOrder}
          onClose={() => setHandoverModalOrder(null)}
          title={`Confirm Customer Vehicle Handover · ${handoverModalOrder.id}`}
          subtitle={`Beneficiary: ${handoverModalOrder.beneficiaryName} · VIN: ${handoverModalOrder.chassisNumber}`}
          maxWidth="520px"
          footer={
            <div className="modal-footer-btns">
              <Button variant="outline" onClick={() => setHandoverModalOrder(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleMarkDelivered}>
                Confirm Handover & Issue Gatepass
              </Button>
            </div>
          }
        >
          <div className="handover-form">
            <p className="small muted mb-2">
              Before marking delivery, verify:
              <br />1. Original CSD Smart Card of the serving/retired personnel.
              <br />2. Zero handling/documentation fee levied as per CSD circular 108/2024.
            </p>

            <FileUpload
              label="Upload Signed Handover Certificate (Gatepass)"
              helperText="Scanned receipt signed by customer (PDF/JPG)"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
