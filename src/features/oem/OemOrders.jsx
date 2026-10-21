import React, { useState } from 'react';
import { CheckCircle2, Edit3, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '../demand/demandApi.js';

export default function OemOrders() {
  const { data: ordersData, isLoading: loading, isFetching, refetch } = useGetOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chassisInput, setChassisInput] = useState('');
  const [engineInput, setEngineInput] = useState('');
  const [invoiceInput, setInvoiceInput] = useState('');
  const [toast, setToast] = useState('');

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData)
    ? ordersData
    : [];

  const openAllocateModal = (ord) => {
    setSelectedOrder(ord);
    setChassisInput(ord.delivery?.trackingNo || ord.chassisNumber || '');
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
      const orderId = selectedOrder._id || selectedOrder.id;
      await updateOrderStatus({
        id: orderId,
        status: 'PROCESSING',
        note: `VIN Allocated by OEM: Chassis ${chassisInput}, Engine ${engineInput}`,
        delivery: {
          trackingNo: chassisInput,
          remarks: `Invoice: ${invoiceInput || 'INV-' + Date.now().toString().slice(-4)} | Engine: ${engineInput}`,
        },
      }).unwrap();

      const ordNum = selectedOrder.orderNo || selectedOrder.id;
      setSelectedOrder(null);
      setToast(`Chassis ${chassisInput} allocated to order ${ordNum}.`);
      setTimeout(() => setToast(''), 5000);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to allocate VIN');
    }
  };

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'orderNo',
      render: (r) => <span className="font-semibold text-brand">{r.orderNo || r._id}</span>,
    },
    {
      header: 'Item Model',
      accessor: 'items',
      render: (r) => r.items?.[0]?.name || r.productName || 'AFD Lineup Product',
    },
    {
      header: 'Dealership Showroom',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || r.dealer || 'Authorized Dealership',
    },
    {
      header: 'Chassis VIN',
      accessor: 'delivery',
      render: (r) => (
        <span className="font-mono small">
          {r.delivery?.trackingNo || r.chassisNumber || 'Needs Allocation'}
        </span>
      ),
    },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Factory Allocation',
      accessor: '_id',
      render: (r) => (
        <Button size="sm" variant="outline" icon={Edit3} onClick={() => openAllocateModal(r)}>
          Allocate VIN
        </Button>
      ),
    },
  ];

  return (
    <div className="oem-orders-page">
      <PageHeader
        title="OEM Supply Orders & Factory VIN Allocation"
        subtitle="Stamping chassis and engine numbers against CSD Supply Orders and updating dispatch status"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
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
          title={`Allocate Vehicle VIN · ${selectedOrder.orderNo || selectedOrder.id}`}
          subtitle={`Model: ${selectedOrder.items?.[0]?.name || selectedOrder.productName || 'Item'} · Dealership: ${selectedOrder.dealerId?.name || selectedOrder.dealer || 'Dealer'}`}
          maxWidth="520px"
          footer={
            <div className="modal-footer-btns">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button variant="primary" loading={isUpdating} onClick={handleAllocate}>
                Save & Allocate Vehicle
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
