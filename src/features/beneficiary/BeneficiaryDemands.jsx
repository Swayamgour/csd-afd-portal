import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  CreditCard,
  RotateCcw,
  X,
  Car,
  Building2,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useGetDemandsQuery } from '../demand/demandApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export function BeneficiaryDemands() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: demandsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetDemandsQuery();

  const allDemands = useMemo(() => {
    return demandsData?.items || (Array.isArray(demandsData) ? demandsData : []);
  }, [demandsData]);

  // Summary Metrics
  const sanctionedCount = useMemo(() => {
    return allDemands.filter((d) =>
      ['APPROVED', 'PAYMENT_PENDING'].includes((d.status || '').toUpperCase())
    ).length;
  }, [allDemands]);

  const underReviewCount = useMemo(() => {
    return allDemands.filter((d) =>
      ['CREATED', 'SUBMITTED', 'DEPOT_PROCESSING', 'PROCESSING', 'DEALER_VERIFICATION'].includes(
        (d.status || '').toUpperCase()
      )
    ).length;
  }, [allDemands]);

  const completedCount = useMemo(() => {
    return allDemands.filter((d) =>
      ['SUPPLY_ORDER_ISSUED', 'COMPLETED', 'DELIVERED'].includes((d.status || '').toUpperCase())
    ).length;
  }, [allDemands]);

  // Client-side instant filter and search
  const filteredDemands = useMemo(() => {
    return allDemands.filter((d) => {
      // 1. Status Filter
      if (statusFilter !== 'All') {
        const norm = (d.status || '').toUpperCase();
        if (statusFilter === 'APPROVED') {
          if (!['APPROVED', 'PAYMENT_PENDING'].includes(norm)) return false;
        } else if (norm !== statusFilter) {
          return false;
        }
      }

      // 2. Search Query
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      const dNo = String(d.demandNo || d._id || '').toLowerCase();
      const pName = String(d.productId?.name || d.productName || '').toLowerCase();
      const depot = String(d.depotId?.name || '').toLowerCase();
      const color = String(d.selectedColor || '').toLowerCase();

      return dNo.includes(q) || pName.includes(q) || depot.includes(q) || color.includes(q);
    });
  }, [allDemands, statusFilter, searchTerm]);

  const columns = [
    {
      header: 'Demand No',
      accessor: 'demandNo',
      render: (row) => {
        const dNo = row.demandNo || row._id?.slice(-8).toUpperCase() || 'DEM-PENDING';
        const dateStr = row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : null;

        return (
          <div>
            <Link
              to={`/beneficiary/demands/${row._id || row.id}`}
              className="font-semibold text-brand font-mono block hover:underline"
              title="View Demand Details"
            >
              {dNo}
            </Link>
            {dateStr && (
              <span className="micro muted flex items-center gap-1 mt-0-25">
                <Calendar size={11} /> {dateStr}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Vehicle / Item',
      accessor: 'productId',
      render: (row) => {
        const p = row.productId || {};
        const pName = p.name || row.productName || 'Allocated AFD Vehicle';
        const sku = p.sku || row.sku;

        return (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand flex items-center justify-center flex-shrink-0 mt-0-5">
              <Car size={16} />
            </div>
            <div>
              <span className="font-semibold text-navy block text-line-height-tight">
                {pName}
              </span>
              <div className="row gap-0-5 align-center mt-0-25 flex-nowrap">
                {sku && <span className="micro muted font-mono whitespace-nowrap">SKU: {sku}</span>}
                {row.selectedColor && (
                  <span className="badge micro info whitespace-nowrap">
                    🎨 {row.selectedColor}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Total Price',
      accessor: 'totalAmount',
      render: (row) => {
        const price = row.totalAmount ?? row.totalPrice ?? 0;
        return (
          <div>
            <span className="font-bold text-navy block font-mono">
              ₹ {Number(price).toLocaleString('en-IN')}
            </span>
            <span className="micro text-success font-semibold">
              ✓ Matches CSD Quota
            </span>
          </div>
        );
      },
    },
    {
      header: 'Depot / Dealer',
      accessor: 'depotId',
      render: (row) => {
        const depotName = row.depotId?.name || 'Assigned CSD Depot';
        return (
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 font-medium block">
              {depotName}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => {
        const norm = (row.status || '').toUpperCase();
        const isApprovedAndPayable =
          ['APPROVED', 'PAYMENT_PENDING'].includes(norm) &&
          row.paymentStatus !== 'PAID';

        return (
          <div className="flex items-center gap-2">
            <Link
              to={`/beneficiary/demands/${row._id || row.id}`}
              className="btn sm out"
              title="View full demand workflow and sanction records"
            >
              <Eye size={13} />
              <span>Details</span>
            </Link>

            {isApprovedAndPayable && (
              <Link
                to={`/beneficiary/demands/${row._id || row.id}`}
                className="btn sm"
                style={{
                  background: '#16a34a',
                  borderColor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Depot sanction granted! Complete payment or upload UTR"
              >
                <CreditCard size={13} />
                <span>Pay / UTR</span>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="beneficiary-demands-page">
      {/* 1. Header Bar */}
      <PageHeader
        title="My AFD Demands"
        subtitle="Track submitted vehicle demands, depot sanctions, treasury payments, and supply order releases."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh demands data from backend"
            >
              <RefreshCw size={14} className={isFetching ? 'spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link to="/products" className="btn btn-primary font-bold">
              <PlusCircle size={15} />
              <span>New Demand</span>
            </Link>
          </div>
        }
      />

      {/* 2. Statistical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="panel p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Total AFD Demands</span>
            <FileText size={18} className="text-blue-500" />
          </div>
          <div className="h2 text-ink font-bold">{allDemands.length}</div>
          <span className="micro muted">All Lifetime Submitted Demands</span>
        </div>

        <div className="panel p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Sanctioned & Ready to Pay</span>
            <CreditCard size={18} className="text-emerald-600" />
          </div>
          <div className="h2 text-emerald-600 font-bold">{sanctionedCount}</div>
          <span className="micro text-emerald-700 font-medium">
            {sanctionedCount > 0 ? 'Action Required · Pay via Cyber Treasury' : 'All approved demands settled'}
          </span>
        </div>

        <div className="panel p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Under Depot Scrutiny</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="h2 text-ink font-bold">{underReviewCount}</div>
          <span className="micro muted">Depot Official Verification Stage</span>
        </div>

        <div className="panel p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="row between align-center mb-1">
            <span className="small muted font-medium">Supply Orders Released</span>
            <CheckCircle2 size={18} className="text-indigo-600" />
          </div>
          <div className="h2 text-ink font-bold">{completedCount}</div>
          <span className="micro muted">Authority Orders Ready for Handover</span>
        </div>
      </div>

      {/* 3. Sanction Action Alert (if any demands are payable) */}
      {sanctionedCount > 0 && (
        <div className="panel p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg row between align-center">
          <div className="row align-center gap-1">
            <ShieldCheck size={24} className="text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 block small">
                {sanctionedCount} Demand{sanctionedCount > 1 ? 's' : ''} Sanctioned by CSD Depot!
              </span>
              <span className="micro text-emerald-800">
                Depot scrutiny approved. Click "Pay / UTR" to complete direct bank transfer or online treasury payment.
              </span>
            </div>
          </div>
          <Link
            to={`/beneficiary/demands/${allDemands.find(d => ['APPROVED', 'PAYMENT_PENDING'].includes((d.status || '').toUpperCase()))?._id}`}
            className="btn sm"
            style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff' }}
          >
            <CreditCard size={14} />
            <span>Pay Now</span>
          </Link>
        </div>
      )}

      {/* 4. Enhanced Search & Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-1 min-w-[280px] items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-brand transition-all">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800"
            placeholder="Search by demand no, vehicle name, depot, or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500 flex-shrink-0" />
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 outline-none cursor-pointer hover:border-slate-400 focus:border-brand"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses ({allDemands.length})</option>
            <option value="CREATED">Created / Awaiting Depot</option>
            <option value="APPROVED">Approved (Payment Enabled)</option>
            <option value="PAYMENT_PENDING">Payment Pending Verification</option>
            <option value="PAID">Paid</option>
            <option value="SUPPLY_ORDER_ISSUED">Supply Order Issued</option>
            <option value="DELIVERED">Delivered / Handed Over</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {(statusFilter !== 'All' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setSearchTerm('');
              }}
              className="btn xs ghost text-slate-600 cursor-pointer row align-center gap-0-25"
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Error Notice */}
      {isError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <span>{getErrorMessage(error, 'Failed to fetch demands list.')}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* 6. DataTable Register Card */}
      <Card
        title="Demands Register"
        subtitle={`Showing ${filteredDemands.length} of ${allDemands.length} demands registered against Depot database`}
      >
        <DataTable
          columns={columns}
          data={filteredDemands}
          loading={isLoading}
          emptyTitle="No demands found"
          emptyText={
            searchTerm || statusFilter !== 'All'
              ? 'No demands match the current search or filter criteria. Try resetting filters.'
              : 'You have not submitted any AFD vehicle demands yet. Browse the catalogue to initiate your demand.'
          }
        />
      </Card>
    </div>
  );
}

export default BeneficiaryDemands;
