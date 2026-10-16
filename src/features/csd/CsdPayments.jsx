import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Download, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import { paymentService } from '../../services/payment.service.js';

export default function CsdPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState('');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPayments({
        status: statusFilter,
        search: searchTerm
      });
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [statusFilter, searchTerm]);

  const handleVerify = async (paymentId) => {
    try {
      await paymentService.verifyPayment(paymentId, 'Col. Arvind Sharma (Joint Director)');
      setToast(`Payment ${paymentId} verified and reconciled against Cyber Treasury.`);
      loadPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Receipt Ref',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Demand ID', accessor: 'demandId' },
    { header: 'Applicant', accessor: 'beneficiaryName' },
    {
      header: 'Amount Realized',
      accessor: 'amount',
      render: (row) => <span className="font-bold text-ink">₹ {row.amount?.toLocaleString('en-IN')}</span>
    },
    { header: 'Treasury Gateway', accessor: 'mode' },
    { header: 'Bank Transaction Ref', accessor: 'transactionRef', render: (row) => <span className="font-mono small">{row.transactionRef}</span> },
    { header: 'Transaction Date', accessor: 'date' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Reconciliation',
      accessor: 'id',
      render: (row) =>
        row.status !== 'Verified' ? (
          <button
            type="button"
            className="btn sm"
            onClick={() => handleVerify(row.id)}
          >
            Verify
          </button>
        ) : (
          <span className="small text-green font-semibold row align-center gap-1">
            <CheckCircle2 size={13} /> Reconciled
          </span>
        )
    }
  ];

  return (
    <div className="csd-payments-page">
      <PageHeader
        title="National Treasury & Cyber Payment Directorate"
        subtitle="Daily reconciliation of Bharatkosh, SBI Cyber Treasury, and institutional receipts"
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <FilterBar
        hasActiveFilters={statusFilter !== 'All' || !!searchTerm}
        onReset={() => {
          setStatusFilter('All');
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-xs">
          <label className="form-label small font-semibold">Search Transactions</label>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Challan, Demand ID, or Applicant..."
            size="sm"
          />
        </div>

        <div className="w-44">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Verified', label: 'Verified & Reconciled' },
              { value: 'Pending', label: 'Pending Settlement' }
            ]}
          />
        </div>
      </FilterBar>

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
