import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Download } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { paymentService } from '../../services/payment.service.js';

export default function DepotTransactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await paymentService.getPayments();
        setPayments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns = [
    { header: 'Challan ID', accessor: 'id', render: (r) => <span className="font-semibold text-brand">{r.id}</span> },
    { header: 'Demand ID', accessor: 'demandId' },
    { header: 'Beneficiary', accessor: 'beneficiaryName' },
    { header: 'Amount', accessor: 'amount', render: (r) => <span className="font-bold">₹ {r.amount?.toLocaleString('en-IN')}</span> },
    { header: 'Channel', accessor: 'mode' },
    { header: 'Bank Ref', accessor: 'transactionRef', render: (r) => <span className="font-mono small">{r.transactionRef}</span> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="depot-transactions-page">
      <PageHeader
        title="Regional Depot Treasury Transactions"
        subtitle="Receipts reconciled through SBI Cyber Treasury for regional demands"
      />

      <Card>
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
        />
      </Card>
    </div>
  );
}
