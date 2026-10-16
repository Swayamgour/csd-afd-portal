import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Edit3 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { orderService } from '../../services/order.service.js';

export default function OemOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chassisInput, setChassisInput] = useState('');
  const [engineInput, setEngineInput] = useState('');
  const [invoiceInput, setInvoiceInput] = useState('');
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

  const openAllocateModal = (ord) => {
    setSelectedOrder(ord);
    setChassisInput(ord.chassisNumber || '');
    setEngineInput(ord.engineNumber || '');
    setInvoiceInput(ord.invoiceNumber || '');
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!chassisInput.trim() || !engineInput.trim()) {
      alert('Please fill Chassis VIN and Engine Number.');
      return;
    }

    try {
      await orderService.allocateChassis(selectedOrder.id, {
        chassisNumber: chassisInput,
        engineNumber: engineInput,
        invoiceNumber: invoiceInput || `INV-OEM-${Date.now().toString().slice(-4)}`
      });
      setSelectedOrder(null);
      setToast(`Chassis ${chassisInput} allocated to order ${selectedOrder.id}.`);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Order Ref', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Item Model', accessor: 'productName' },
    { header: 'Dealership Showroom', accessor: 'dealer' },
    { header: 'Chassis VIN', accessor: 'chassisNumber', render: (r) => <span className="font-mono small">{r.chassisNumber || 'Needs Allocation'}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Factory Allocation',
      accessor: 'id',
      render: (r) => (
        <Button size="sm" variant="outline" icon={Edit3} onClick={() => openAllocateModal(r)}>
          Allocate VIN
        </Button>
      )
    }
  ];

  return (
    <div className="oem-orders-page">
      <PageHeader
        title="OEM Supply Orders & Factory VIN Allocation"
        subtitle="Stamping chassis and engine numbers against CSD Supply Orders and updating dispatch status"
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

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Allocate Vehicle VIN · ${selectedOrder.id}`}
          subtitle={`Model: ${selectedOrder.productName} · Dealership: ${selectedOrder.dealer}`}
          maxWidth="520px"
          footer={
            <div className="modal-footer-btns">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAllocate}>
                Save & Dispatch Vehicle
              </Button>
            </div>
          }
        >
          <div className="allocate-form">
            <Input
              id="vinInput"
              label="Chassis VIN Number (17 Digits)"
              placeholder="e.g. MAT621045RP98102"
              value={chassisInput}
              onChange={(e) => setChassisInput(e.target.value)}
              required
              className="mb-2"
            />
            <Input
              id="engInput"
              label="Engine Serial Number"
              placeholder="e.g. REV12T899201"
              value={engineInput}
              onChange={(e) => setEngineInput(e.target.value)}
              required
              className="mb-2"
            />
            <Input
              id="invInput"
              label="Factory Dispatch Invoice No."
              placeholder="e.g. INV-TATA-DEL-8921"
              value={invoiceInput}
              onChange={(e) => setInvoiceInput(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
