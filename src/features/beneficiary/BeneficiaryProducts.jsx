import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { useGetProductsQuery, useGetCategoriesQuery } from '../catalog/productApi.js';
import { Clock, ShieldCheck, AlertCircle, Search, Filter, RefreshCw, ShoppingCart, Tag } from 'lucide-react';
import { getErrorMessage } from '../../utils/apiError.js';

export const BeneficiaryProducts = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const isPendingApproval =
    user?.role === 'BENEFICIARY' &&
    (user.status === 'Pending' ||
      user.status === 'PENDING' ||
      user.verificationStatus === 'PENDING' ||
      user.adminApproval === 'PENDING');

  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductsQuery({
    search: search || undefined,
    category: category || undefined,
    limit: 50,
  });

  const { data: categories = [] } = useGetCategoriesQuery();

  const products = productsData?.items || [];

  return (
    <div className="beneficiary-products-page">
      <PageHeader
        title="Authorized AFD Product Catalogue"
        subtitle="Entitled four-wheelers, two-wheelers, and white goods with concessional CSD ex-showroom pricing"
        breadcrumbs={[
          { label: 'Beneficiary', href: '/beneficiary/dashboard' },
          { label: 'Products' },
        ]}
        actions={
          <Link to="/beneficiary/eligibility">
            <Button variant="outline" size="sm">Check Rank Entitlement</Button>
          </Link>
        }
      />

      {/* Mandatory Pending Approval Notice */}
      {isPendingApproval && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              flexShrink: 0,
            }}
          >
            <Clock size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.35rem',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                }}
              >
                Catalogue Browsing Mode · Account Pending Administrator Verification
              </h4>
              {user?.isEmailVerified && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    background: '#dcfce7',
                    color: '#166534',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  <ShieldCheck size={11} /> Email Verified ✓
                </span>
              )}
            </div>
            <p
              style={{
                margin: 0,
                color: '#78350f',
                fontSize: '0.88rem',
                lineHeight: 1.45,
              }}
            >
              You can explore products and specifications. Checkout and demand creation will be enabled upon administrator verification.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[280px] items-center gap-2 border border-slate-300 rounded px-3 py-2 bg-slate-50">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-sm w-full text-slate-800"
            placeholder="Search by vehicle name, model, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-500" />
          <select
            className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-700 outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.code} value={c.code || c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh Products">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Product Grid State Handling */}
      {isLoading ? (
        <LoadingState message="Loading approved CSD products from catalogue..." />
      ) : isError ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="font-bold text-base mb-1">Failed to Load Products</h3>
          <p className="text-sm mb-3">{getErrorMessage(error)}</p>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
          <Tag className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-lg mb-1">No Products Found</h3>
          <p className="text-slate-500 text-sm mb-4">
            Try adjusting your search query or category filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setCategory('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const prodId = p._id || p.id;
            const imgSrc =
              p.images?.[0] ||
              p.image ||
              (p.afdType === 'AFD_I' ? '/assets/maruti1.png' : '/assets/white_goods1.png');
            const csdPrice = p.price || p.lo || 0;
            const mrpPrice = p.mrp || p.hi || csdPrice * 1.15;
            const savings = mrpPrice > csdPrice ? mrpPrice - csdPrice : 0;

            return (
              <div
                key={prodId}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="h-48 bg-slate-100 relative flex items-center justify-center p-4">
                  <img
                    src={imgSrc}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = '/assets/maruti1.png';
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-blue-900 text-white text-xs px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                    {p.afdType || 'AFD-I'}
                  </span>
                  {p.sku && (
                    <span className="absolute top-3 right-3 bg-slate-800 text-white text-xs px-2 py-0.5 rounded font-mono">
                      SKU: {p.sku}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                      {p.brandId?.name || p.brand || 'Authorized OEM'}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {p.description || 'Concessional CSD index item for authorized defence personnel.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xs text-slate-500 block">CSD Concession Price</span>
                        <span className="text-lg font-bold text-blue-900">
                          ₹ {csdPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {savings > 0 && (
                        <div className="text-right">
                          <span className="text-xs text-slate-400 line-through block">
                            ₹ {mrpPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-green-700">
                            Save ₹ {savings.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/products/${prodId}`}
                        className="btn btn-sm out flex-1 text-center font-medium"
                      >
                        Details
                      </Link>
                      {!isPendingApproval ? (
                        <Link
                          to={`/checkout?productId=${prodId}`}
                          className="btn btn-sm btn-primary flex-1 text-center font-medium inline-flex items-center justify-center gap-1"
                        >
                          <ShoppingCart size={14} /> Buy AFD
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="btn btn-sm bg-slate-200 text-slate-500 cursor-not-allowed flex-1 text-center font-medium"
                          title="Account verification pending"
                        >
                          Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BeneficiaryProducts;
