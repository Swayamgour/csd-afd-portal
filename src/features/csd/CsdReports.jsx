import React, { useState } from 'react';
import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  useGetDemandsReportQuery,
  useGetOrdersReportQuery,
  useGetPaymentsReportQuery,
} from '../admin/adminApi.js';
import { useGetHelpdeskMisQuery } from '../helpdesk/ticketApi.js';

export default function CsdReports() {
  const [activeReport, setActiveReport] = useState('demands');

  const {
    data: demandsData,
    isLoading: loadingDemands,
    isFetching: fetchingDemands,
    refetch: refetchDemands,
  } = useGetDemandsReportQuery(undefined, { skip: activeReport !== 'demands' });

  const {
    data: ordersData,
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
    refetch: refetchOrders,
  } = useGetOrdersReportQuery(undefined, { skip: activeReport !== 'orders' });

  const {
    data: paymentsData,
    isLoading: loadingPayments,
    isFetching: fetchingPayments,
    refetch: refetchPayments,
  } = useGetPaymentsReportQuery(undefined, { skip: activeReport !== 'payments' });

  const {
    data: helpdeskData,
    isLoading: loadingHelpdesk,
    isFetching: fetchingHelpdesk,
    refetch: refetchHelpdesk,
  } = useGetHelpdeskMisQuery(undefined, { skip: activeReport !== 'helpdesk' });

  const tabs = [
    { id: 'demands', label: 'AFD Demand Volume', icon: FileSpreadsheet },
    { id: 'orders', label: 'OEM Supply Orders & Delivery', icon: FileSpreadsheet },
    { id: 'payments', label: 'Treasury Collections & Gateways', icon: FileSpreadsheet },
    { id: 'helpdesk', label: 'Helpdesk SLA Performance', icon: FileSpreadsheet },
  ];

  const handleRefresh = () => {
    if (activeReport === 'demands') refetchDemands();
    else if (activeReport === 'orders') refetchOrders();
    else if (activeReport === 'payments') refetchPayments();
    else if (activeReport === 'helpdesk') refetchHelpdesk();
  };

  const isFetching = fetchingDemands || fetchingOrders || fetchingPayments || fetchingHelpdesk;
  const loading = loadingDemands || loadingOrders || loadingPayments || loadingHelpdesk;

  let reportRows = [];
  let columns = [];

  if (activeReport === 'demands') {
    reportRows = Array.isArray(demandsData) ? demandsData : (Array.isArray(demandsData?.items) ? demandsData.items : []);
    columns = [
      { header: 'Demand No', accessor: 'demandNo', render: (r) => <span className="font-semibold text-brand">{r.demandNo || r._id}</span> },
      { header: 'Beneficiary', accessor: 'beneficiaryId', render: (r) => r.beneficiaryId?.fullName || r.beneficiaryId?.name || 'Applicant' },
      { header: 'Product', accessor: 'productSnapshot', render: (r) => r.productSnapshot?.name || 'AFD Product' },
      { header: 'Depot', accessor: 'depotId', render: (r) => r.depotId?.name || 'Depot' },
      { header: 'Total Amount', accessor: 'totalAmount', render: (r) => `₹ ${(r.totalAmount || 0).toLocaleString('en-IN')}` },
      { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    ];
  } else if (activeReport === 'orders') {
    reportRows = Array.isArray(ordersData) ? ordersData : (Array.isArray(ordersData?.items) ? ordersData.items : []);
    columns = [
      { header: 'Order No', accessor: 'orderNo', render: (r) => <span className="font-semibold text-brand">{r.orderNo || r._id}</span> },
      { header: 'Item Model', accessor: 'items', render: (r) => r.items?.[0]?.name || 'AFD Product' },
      { header: 'Dealership', accessor: 'dealerId', render: (r) => r.dealerId?.name || 'Dealer' },
      { header: 'Depot', accessor: 'depotId', render: (r) => r.depotId?.name || 'Depot' },
      { header: 'Amount', accessor: 'amount', render: (r) => `₹ ${(r.amount || 0).toLocaleString('en-IN')}` },
      { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    ];
  } else if (activeReport === 'payments') {
    reportRows = Array.isArray(paymentsData) ? paymentsData : (Array.isArray(paymentsData?.items) ? paymentsData.items : []);
    columns = [
      { header: 'Payment Ref', accessor: 'paymentNo', render: (r) => <span className="font-semibold">{r.paymentNo || r._id}</span> },
      { header: 'Amount', accessor: 'amount', render: (r) => <span className="font-bold text-ink">₹ {(r.amount || 0).toLocaleString('en-IN')}</span> },
      { header: 'Payment Method', accessor: 'method', render: (r) => r.method || 'Online Gateway' },
      { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
      { header: 'Timestamp', accessor: 'createdAt', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '-' },
    ];
  } else if (activeReport === 'helpdesk') {
    reportRows = Array.isArray(helpdeskData?.commonComplaints) ? helpdeskData.commonComplaints : [];
    columns = [
      { header: 'Grievance Category', accessor: 'category', render: (r) => <span className="font-semibold">{r.category}</span> },
      { header: 'Cases Registered', accessor: 'count', render: (r) => <span className="font-bold">{r.count}</span> },
    ];
  }

  return (
    <div className="csd-reports-page">
      <PageHeader
        title="CSD National Directorate MIS & Regulatory Audit"
        subtitle="Authoritative operational and financial reconciliations from live database registers"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeReport} onChange={setActiveReport} />

      <Card
        title={tabs.find((t) => t.id === activeReport)?.label}
        subtitle="Live dynamic report synchronized with backend MongoDB aggregates"
      >
        <DataTable columns={columns} data={reportRows} loading={loading} />
      </Card>
    </div>
  );
}
