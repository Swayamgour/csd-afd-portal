import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Package,
  Store,
  FileText,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Badge from '../../components/common/Badge.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { apiClient } from '../../services/apiClient.js';
import {
  useGetOemProductsReportQuery,
  useGetOemDealersReportQuery,
  useGetOemDemandsReportQuery,
  useGetOemOrdersReportQuery,
} from './oemApi.js';

export default function OemReports() {
  const [activeTab, setActiveTab] = useState('orders');
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [exportError, setExportError] = useState('');

  const {
    data: ordersReportData,
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
    refetch: refetchOrders,
  } = useGetOemOrdersReportQuery({}, { skip: activeTab !== 'orders' });

  const {
    data: demandsReportData,
    isLoading: loadingDemands,
    isFetching: fetchingDemands,
    refetch: refetchDemands,
  } = useGetOemDemandsReportQuery({}, { skip: activeTab !== 'demands' });

  const {
    data: productsReportData,
    isLoading: loadingProducts,
    isFetching: fetchingProducts,
    refetch: refetchProducts,
  } = useGetOemProductsReportQuery(undefined, { skip: activeTab !== 'products' });

  const {
    data: dealersReportData,
    isLoading: loadingDealers,
    isFetching: fetchingDealers,
    refetch: refetchDealers,
  } = useGetOemDealersReportQuery(undefined, { skip: activeTab !== 'dealers' });

  const handleExportCsv = async (endpoint) => {
    setExportError('');
    setIsExporting(true);
    try {
      await apiClient.download(
        `/oem/reports/${endpoint}/excel`,
        `oem-${endpoint}-${new Date().toISOString().slice(0, 10)}.csv`
      );
      setToastMessage(`Official ${endpoint} report exported successfully.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setExportError(err.message || 'Failed to download report export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Orders Columns
  const orderColumns = [
    {
      header: 'Supply Order No.',
      accessor: 'orderNo',
      render: (r) => <span className="font-semibold text-brand font-mono">{r.orderNo || r._id}</span>,
    },
    {
      header: 'Assigned Showroom',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || r.dealer || '—',
    },
    {
      header: 'Depot',
      accessor: 'depotId',
      render: (r) => r.depotId?.name || '—',
    },
    {
      header: 'Chassis / VIN',
      accessor: 'delivery',
      render: (r) => (
        <span className="font-mono small">
          {r.delivery?.chassisNo || r.delivery?.trackingNo || '—'}
        </span>
      ),
    },
    {
      header: 'Order Value',
      accessor: 'amount',
      render: (r) => formatCurrency(r.amount || 0),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  // Demands Columns
  const demandColumns = [
    {
      header: 'Demand Ref',
      accessor: 'demandNo',
      render: (r) => <span className="font-semibold text-brand font-mono">{r.demandNo || r._id}</span>,
    },
    {
      header: 'Product Model',
      accessor: 'productSnapshot',
      render: (r) => r.productSnapshot?.name || '—',
    },
    {
      header: 'Dealer',
      accessor: 'dealerId',
      render: (r) => r.dealerId?.name || '—',
    },
    {
      header: 'Amount',
      accessor: 'totalAmount',
      render: (r) => formatCurrency(r.totalAmount || 0),
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      render: (r) => r.paymentStatus ? (
        <Badge variant={r.paymentStatus === 'PAID' ? 'success' : 'warning'}>{r.paymentStatus}</Badge>
      ) : '—',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  // Products Columns
  const productColumns = [
    {
      header: 'Vehicle Model',
      accessor: 'name',
      render: (r) => <span className="font-medium text-slate-800">{r.name}</span>,
    },
    {
      header: 'SKU / Index',
      accessor: 'sku',
      render: (r) => <span className="font-mono small">{r.indexNo || r.sku || '—'}</span>,
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      render: (r) => r.categoryId?.name || '—',
    },
    {
      header: 'Basic Price',
      accessor: 'price',
      render: (r) => formatCurrency(r.price || 0),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  // Dealers Columns
  const dealerColumns = [
    {
      header: 'Dealership Name',
      accessor: 'name',
      render: (r) => <span className="font-medium text-slate-800">{r.name}</span>,
    },
    {
      header: 'Dealer Code',
      accessor: 'code',
      render: (r) => <span className="font-mono small">{r.code}</span>,
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (r) => `${r.city || ''}, ${r.state || ''}`,
    },
    {
      header: 'Authorized Models',
      accessor: 'authorizedProductsCount',
      render: (r) => <Badge variant="primary">{r.authorizedProductsCount || 0} Models</Badge>,
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (r) => <Badge variant={r.active ? 'success' : 'neutral'}>{r.active ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  return (
    <div className="oem-reports-page space-y-6">
      <PageHeader
        title="OEM Fulfilment & Production Reports"
        subtitle="Performance analytics, dealership dispatch turnaround, and official audit exports"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Reports & MIS' },
        ]}
      />

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {exportError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center justify-between shadow-sm">
          <span className="font-medium">{exportError}</span>
          <button
            type="button"
            onClick={() => setExportError('')}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          className={`btn sm ${activeTab === 'orders' ? 'primary' : 'out'}`}
          onClick={() => setActiveTab('orders')}
        >
          <Truck size={15} className="mr-1 inline" /> Supply Orders Report
        </button>
        <button
          type="button"
          className={`btn sm ${activeTab === 'demands' ? 'primary' : 'out'}`}
          onClick={() => setActiveTab('demands')}
        >
          <FileText size={15} className="mr-1 inline" /> Demands Pipeline Report
        </button>
        <button
          type="button"
          className={`btn sm ${activeTab === 'products' ? 'primary' : 'out'}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={15} className="mr-1 inline" /> Lineup Audit Report
        </button>
        <button
          type="button"
          className={`btn sm ${activeTab === 'dealers' ? 'primary' : 'out'}`}
          onClick={() => setActiveTab('dealers')}
        >
          <Store size={15} className="mr-1 inline" /> Dealership Network Report
        </button>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'orders' && (
        <Card
          title="Supply Orders Fulfillment Log"
          subtitle="All institutional defence orders assigned to OEM with delivery progress"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={fetchingOrders}
                onClick={refetchOrders}
              >
                Sync
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                loading={isExporting}
                onClick={() => handleExportCsv('orders')}
              >
                Export CSV
              </Button>
            </div>
          }
        >
          <DataTable
            columns={orderColumns}
            data={ordersReportData?.items || []}
            loading={loadingOrders}
            emptyTitle="No orders in report"
            emptyText="No supply orders recorded for this reporting period."
          />
        </Card>
      )}

      {activeTab === 'demands' && (
        <Card
          title="Defence Demands Pipeline Summary"
          subtitle="Sanctioned demand notices across regional CSD depots"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={fetchingDemands}
                onClick={refetchDemands}
              >
                Sync
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                loading={isExporting}
                onClick={() => handleExportCsv('demands')}
              >
                Export CSV
              </Button>
            </div>
          }
        >
          <DataTable
            columns={demandColumns}
            data={demandsReportData?.items || []}
            loading={loadingDemands}
            emptyTitle="No demands in report"
            emptyText="No defence demands recorded for this reporting period."
          />
        </Card>
      )}

      {activeTab === 'products' && (
        <Card
          title="Empaneled Model Catalog Summary"
          subtitle="Overview of registered automobile models under CSD rate contracts"
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={fetchingProducts}
              onClick={refetchProducts}
            >
              Sync
            </Button>
          }
        >
          <div className="kpi-grid mb-3">
            <StatCard
              title="Total Models"
              value={productsReportData?.summary?.total ?? 0}
              subtext="Catalog Size"
              variant="default"
            />
            <StatCard
              title="Active Contracts"
              value={productsReportData?.summary?.active ?? 0}
              subtext="Published Rate Contracts"
              variant="success"
            />
            <StatCard
              title="Pending Review"
              value={productsReportData?.summary?.draft ?? 0}
              subtext="Under CSD Review"
              variant="warning"
            />
          </div>
          <DataTable
            columns={productColumns}
            data={productsReportData?.products || []}
            loading={loadingProducts}
            emptyTitle="No models in catalog report"
          />
        </Card>
      )}

      {activeTab === 'dealers' && (
        <Card
          title="Authorized Dealership Representation"
          subtitle="Regional showrooms appointed under OEM network"
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={fetchingDealers}
              onClick={refetchDealers}
            >
              Sync
            </Button>
          }
        >
          <DataTable
            columns={dealerColumns}
            data={dealersReportData?.dealers || []}
            loading={loadingDealers}
            emptyTitle="No dealerships in report"
          />
        </Card>
      )}
    </div>
  );
}
