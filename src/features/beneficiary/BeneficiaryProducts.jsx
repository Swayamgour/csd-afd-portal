import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, ShoppingCart } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import CatalogToolbar from '../../components/common/CatalogToolbar.jsx';
import ProductGrid, {
  ProductCell,
  CategoryBadge,
  PriceCell,
  getProductBrand,
  getProductPrice,
  getProductMrp
} from '../../components/common/ProductGrid.jsx';
import { ErrorState } from '../../components/common/States.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { useAuth } from '../../context/AuthContext';
import { useGetProductsQuery, useGetCategoriesQuery } from '../catalog/productApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

const LOCAL_FALLBACK = '/assets/maruti1.png';

export const BeneficiaryProducts = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [view, setView] = useState('table');

  const isPendingApproval =
    user?.role === 'BENEFICIARY' &&
    (user.status === 'Pending' ||
      user.status === 'PENDING' ||
      user.verificationStatus === 'PENDING' ||
      user.adminApproval === 'PENDING');

  const { data: productsData, isLoading, isFetching, isError, error, refetch } = useGetProductsQuery({
    search: search || undefined,
    category: category || undefined,
    limit: 50
  });
  const { data: categories = [] } = useGetCategoriesQuery();
  const products = productsData?.items || [];

  const renderActions = (p) => {
    const id = p._id || p.id;
    return (
      <>
        <Link to={`/products/${id}`} className="btn sm out">
          Details
        </Link>
        {!isPendingApproval ? (
          <Link to={`/checkout?productId=${id}`} className="btn sm">
            <ShoppingCart size={14} aria-hidden="true" />
            <span>Buy AFD</span>
          </Link>
        ) : (
          <button type="button" className="btn sm out" disabled title="Account verification pending">
            Pending
          </button>
        )}
      </>
    );
  };

  const columns = [
    {
      header: 'Product Item',
      accessor: 'name',
      render: (r) => <ProductCell product={r} fallback={LOCAL_FALLBACK} />
    },
    { header: 'Brand / OEM', accessor: 'brand', render: (r) => <span className="catalog-brand">{getProductBrand(r)}</span> },
    { header: 'Category', accessor: 'category', render: (r) => <CategoryBadge product={r} /> },
    {
      header: 'CSD Concessional Rate',
      accessor: 'price',
      render: (r) => {
        const csd = getProductPrice(r);
        const mrp = getProductMrp(r);
        return (
          <div className="catalog-price-stack">
            <PriceCell product={r} />
            {mrp > csd && <span className="catalog-save">Save {formatCurrency(mrp - csd)}</span>}
          </div>
        );
      }
    },
    {
      header: 'Action',
      accessor: 'actions',
      className: 'text-right',
      render: (r) => <div className="catalog-row-actions">{renderActions(r)}</div>
    }
  ];

  return (
    <div className="beneficiary-products-page">
      <PageHeader
        title="Authorized AFD Product Catalogue"
        subtitle="Entitled four-wheelers, two-wheelers, and white goods with concessional CSD ex-showroom pricing"
        breadcrumbs={[
          { label: 'Beneficiary', href: '/beneficiary/dashboard' },
          { label: 'Products' }
        ]}
        actions={
          <Link to="/beneficiary/eligibility" className="btn sm out">
            Check Rank Entitlement
          </Link>
        }
      />

      {/* Mandatory Pending Approval Notice */}
      {isPendingApproval && (
        <div className="beneficiary-pending-card">
          <div className="beneficiary-pending-icon-circle">
            <Clock size={20} />
          </div>
          <div className="portal-flex-1">
            <div className="portal-flex-center mb-0-5">
              <h4 className="beneficiary-pending-heading">
                Catalogue Browsing Mode · Account Pending Administrator Verification
              </h4>
              {user?.isEmailVerified && (
                <span className="beneficiary-verified-tag">
                  <ShieldCheck size={11} /> Email Verified ✓
                </span>
              )}
            </div>
            <p className="beneficiary-pending-desc">
              You can explore products and specifications. Checkout and demand creation will be enabled upon administrator verification.
            </p>
          </div>
        </div>
      )}

      <Card className="catalog-card-shell">
        <CatalogToolbar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Search by vehicle name, model, SKU, or brand..."
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          getCategoryValue={(c) => c.code || c._id}
          onRefresh={() => refetch()}
          refreshing={isFetching}
          view={view}
          onViewChange={setView}
        />

        {isError ? (
          <ErrorState title="Failed to Load Products" message={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : view === 'grid' ? (
          <ProductGrid
            products={products}
            loading={isLoading}
            fallback={LOCAL_FALLBACK}
            renderActions={renderActions}
          />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            loading={isLoading}
            emptyText="No products found. Try adjusting your search query or category filter."
          />
        )}
      </Card>
    </div>
  );
};

export default BeneficiaryProducts;
