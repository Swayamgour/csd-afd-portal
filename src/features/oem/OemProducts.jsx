import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Filter,
  PlusCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Eye,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import CatalogToolbar from '../../components/common/CatalogToolbar.jsx';
import { ProductCell, PriceCell } from '../../components/common/ProductGrid.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetCategoriesQuery } from '../catalog/productApi.js';
import {
  useGetOemProductsQuery,
  useUpdateOemProductStatusMutation,
} from './oemApi.js';

export default function OemProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [toastMessage, setToastMessage] = useState(null);

  const queryParams = useMemo(() => {
    const p = { page, limit: pageSize };
    if (searchTerm) p.q = searchTerm;
    if (categoryFilter) p.categoryId = categoryFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [searchTerm, categoryFilter, statusFilter, page]);

  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOemProductsQuery(queryParams);

  const { data: categories = [] } = useGetCategoriesQuery();

  const [updateProductStatus, { isLoading: isSubmittingStatus }] = useUpdateOemProductStatusMutation();

  const products = productsData?.items || [];
  const meta = productsData?.meta || {};

  const handleOpenCreate = () => {
    navigate('/oem/products/new');
  };

  const handleOpenEdit = (prod) => {
    navigate(`/oem/products/${prod._id || prod.id}/edit`);
  };


  const handleSubmitForApproval = async (product) => {
    try {
      await updateProductStatus({
        id: product._id,
        status: 'PENDING_APPROVAL',
      }).unwrap();
      setToastMessage(`Product "${product.name}" submitted for CSD HO approval.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to submit product for approval.');
    }
  };

  const columns = [
    {
      header: 'Vehicle Model',
      accessor: 'name',
      render: (r) => <ProductCell product={r} />,
    },
    {
      header: 'CSD Index / SKU',
      accessor: 'sku',
      render: (r) => (
        <div>
          <div className="font-mono small font-semibold text-brand">{r.indexNo || r.sku}</div>
          {r.nomenclature && <div className="muted small truncate max-w-xs">{r.nomenclature}</div>}
        </div>
      ),
    },
    {
      header: 'Variant / Fuel',
      accessor: 'variant',
      render: (r) => (
        <span className="small text-slate-700">
          {r.variant || 'Standard'} {r.fuelType ? `· ${r.fuelType}` : ''}
        </span>
      ),
    },
    {
      header: 'CSD Rate',
      accessor: 'price',
      render: (r) => <PriceCell product={r} />,
    },
    {
      header: 'Civilian MRP',
      accessor: 'mrp',
      render: (r) => (
        <span className="small font-mono text-slate-400 line-through">
          {r.mrp ? formatCurrency(r.mrp) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            icon={Edit3}
            onClick={() => handleOpenEdit(r)}
            title="Edit Specifications"
          >
            Edit
          </Button>
          {r.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              loading={isSubmittingStatus}
              onClick={() => handleSubmitForApproval(r)}
              title="Submit to CSD HO for Rate Contract Approval"
            >
              Submit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="oem-products-page space-y-6">
      <PageHeader
        title="OEM Catalog Lineup & Empaneled Products"
        subtitle="Manage automobile variants, CSD index rates, and rate contract empanelment status"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Product Catalog' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={handleOpenCreate}
            >
              Add New Product
            </Button>
          </div>
        }
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
            <X size={15} />
          </button>
        </div>
      )}

      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span className="font-medium">{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError('')}
            className="text-red-600 hover:text-red-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <Card>
        <CatalogToolbar
          search={searchTerm}
          onSearchChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          searchPlaceholder="Search catalog by model name, SKU, or index..."
          category={categoryFilter}
          onCategoryChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
          categories={categories}
          allLabel="All Categories"
          onRefresh={() => refetch()}
          refreshing={isFetching}
          filterIcon={Filter}
        />

        <div className="flex gap-1 mb-2 px-2">
          {['', 'ACTIVE', 'PUBLISHED', 'PENDING_APPROVAL', 'DRAFT', 'INACTIVE'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn sm ${statusFilter === st ? 'primary' : 'out'}`}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          pagination={
            meta.totalPages > 1
              ? {
                page: meta.page || page,
                totalPages: meta.totalPages,
                totalItems: meta.total,
                onPageChange: setPage,
                pageSize,
              }
              : null
          }
          emptyTitle="No products in catalog"
          emptyText="No products matched your search or filter criteria."
        />
      </Card>
    </div>
  );
}
