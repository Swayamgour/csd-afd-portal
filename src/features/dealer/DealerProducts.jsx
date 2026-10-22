import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Building2,
  Car,
  Clock,
  AlertCircle,
  CheckSquare,
  Square,
  Sliders,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  useGetOemsQuery,
  useGetDealersQuery,
  useGetDealerProductsQuery,
  useCreateDealerProductMutation,
  useUpdateDealerProductMutation,
  useDeleteDealerProductMutation,
} from '../org/orgApi.js';
import { useGetProductsQuery } from '../catalog/productApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../permissions/roles.js';

export default function DealerProducts() {
  const { user } = useAuth();
  const isDealerUser = user?.role === ROLES.DEALER || user?.role === ROLES.DEALER_USER;

  // Selected OEM & Dealer
  const [selectedOemId, setSelectedOemId] = useState('');
  const [selectedDealerId, setSelectedDealerId] = useState(user?.dealerId || '');
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: oems = [], isLoading: loadingOems } = useGetOemsQuery({ active: true });
  const { data: allDealers = [], isLoading: loadingDealers } = useGetDealersQuery({ active: true });
  
  // Filter dealers by selected OEM
  const filteredDealers = useMemo(() => {
    if (!selectedOemId) return allDealers;
    return allDealers.filter((d) => {
      const oem = d.oemId?._id || d.oemId;
      return String(oem) === String(selectedOemId);
    });
  }, [allDealers, selectedOemId]);

  // Load products of selected OEM
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery(
    selectedOemId ? { oemId: selectedOemId, status: 'ACTIVE', limit: 100 } : { status: 'ACTIVE', limit: 100 },
    { skip: !selectedOemId && !isDealerUser }
  );
  const products = useMemo(() => productsData?.items || [], [productsData]);

  // Load existing DealerProduct mappings for the selected dealer
  const {
    data: dealerProducts = [],
    isLoading: loadingMappings,
    isFetching: refreshingMappings,
    refetch: refetchMappings,
  } = useGetDealerProductsQuery(
    selectedDealerId ? { dealerId: selectedDealerId } : undefined,
    { skip: !selectedDealerId }
  );

  // Mutations
  const [createDealerProduct, { isLoading: isCreating }] = useCreateDealerProductMutation();
  const [updateDealerProduct, { isLoading: isUpdating }] = useUpdateDealerProductMutation();
  const [deleteDealerProduct, { isLoading: isDeleting }] = useDeleteDealerProductMutation();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Mapped product ID to DealerProduct object lookup
  const mappingMap = useMemo(() => {
    const map = new Map();
    for (const dp of dealerProducts) {
      const pId = dp.productId?._id || dp.productId;
      if (pId) map.set(String(pId), dp);
    }
    return map;
  }, [dealerProducts]);

  // Handle OEM selection change
  const handleOemChange = (newOemId) => {
    setSelectedOemId(newOemId);
    // If dealer does not belong to new OEM, reset dealer
    const matchingDealer = allDealers.find(
      (d) => String(d.oemId?._id || d.oemId) === String(newOemId)
    );
    setSelectedDealerId(matchingDealer?._id || matchingDealer?.id || '');
  };

  // Toggle authorization mapping for a product
  const handleToggleProduct = async (product) => {
    if (!selectedDealerId) {
      alert('Please select an authorized Dealership first.');
      return;
    }

    const productId = product._id || product.id;
    const existing = mappingMap.get(String(productId));

    try {
      if (existing) {
        // Toggle active status
        const nextActive = !existing.active;
        await updateDealerProduct({
          id: existing._id || existing.id,
          active: nextActive,
        }).unwrap();
        showToast(`Product "${product.name}" authorization is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}.`);
      } else {
        // Create new DealerProduct mapping
        await createDealerProduct({
          dealerId: selectedDealerId,
          productId: productId,
          active: true,
          availabilityStatus: 'AVAILABLE',
          estimatedDeliveryDays: 15,
        }).unwrap();
        showToast(`✓ Product "${product.name}" authorized for dealership.`);
      }
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to update dealer-product authorization');
    }
  };

  // Delete mapping
  const handleDeleteMapping = async (dp) => {
    if (!window.confirm('Revoke authorization mapping for this product?')) return;
    try {
      await deleteDealerProduct(dp._id || dp.id).unwrap();
      showToast('Authorization mapping removed.');
    } catch (err) {
      alert(err?.data?.message || 'Failed to delete mapping');
    }
  };

  const selectedDealer = allDealers.find((d) => String(d._id || d.id) === String(selectedDealerId));
  const selectedOem = oems.find((o) => String(o._id || o.id) === String(selectedOemId));

  // Filtered products list for search
  const displayedProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
  }, [products, searchQuery]);

  return (
    <div className="dealer-products-page space-y-6">
      {toastMessage && (
        <div className="portal-toast-fixed" style={{ zIndex: 9999 }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      <PageHeader
        title="Authorized Dealership Product Matrix (DealerProduct)"
        subtitle="Manage product sales authorization according to canonical OEM ➔ Dealer ➔ DealerProduct business hierarchy"
        breadcrumbs={[
          { label: 'Network Master', href: '/csd/dealers' },
          { label: 'DealerProduct Authorization' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetchMappings()} disabled={refreshingMappings}>
            <RefreshCw size={14} className={`mr-xs ${refreshingMappings ? 'spin-icon' : ''}`} />
            {refreshingMappings ? 'Syncing...' : 'Sync Authorizations'}
          </Button>
        }
      />

      {/* SELECTION BAR: OEM ➔ Dealer */}
      <Card
        title="Hierarchy Selection"
        subtitle="Select the Manufacturer (OEM) and Dealership to inspect or authorize vehicle models"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="director-field-label">1. Select Manufacturer (OEM) *</label>
            <select
              value={selectedOemId}
              onChange={(e) => handleOemChange(e.target.value)}
              className="director-field-input"
              disabled={loadingOems}
            >
              <option value="">-- Choose OEM / Manufacturer --</option>
              {oems.map((oem) => (
                <option key={oem._id || oem.id} value={oem._id || oem.id}>
                  {oem.name} ({oem.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="director-field-label">2. Select Dealership (Showroom) *</label>
            <select
              value={selectedDealerId}
              onChange={(e) => setSelectedDealerId(e.target.value)}
              className="director-field-input"
              disabled={loadingDealers || !selectedOemId}
            >
              <option value="">-- Choose Dealership --</option>
              {filteredDealers.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.name} ({d.code}) - {d.city || ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDealer && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800">Dealership: </span>
              <strong className="text-brand font-mono">{selectedDealer.name}</strong> ({selectedDealer.code}) •{' '}
              <span>{selectedDealer.city}, {selectedDealer.state}</span>
            </div>
            <div className="text-slate-600">
              Active Authorized Models: <strong className="text-emerald-700">{dealerProducts.filter((dp) => dp.active).length}</strong> / {products.length}
            </div>
          </div>
        )}
      </Card>

      {/* PRODUCT AUTHORIZATION MATRIX */}
      {selectedDealerId ? (
        <Card
          title="Vehicle Model Authorization Matrix"
          subtitle={`Check or uncheck products to grant or revoke delivery authorization for ${selectedDealer?.name || 'this dealer'}`}
          actions={
            <div className="csd-search-wrap">
              <Search size={14} className="csd-search-icon-pos" />
              <input
                type="text"
                placeholder="Search models, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="csd-search-field-input director-field-input"
              />
            </div>
          }
        >
          {loadingProducts || loadingMappings ? (
            <div className="p-8 text-center text-slate-500">
              <RefreshCw size={24} className="spin-icon mx-auto mb-2 text-brand" />
              Loading authorized catalog for selected dealer...
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No products found under this OEM. Please check product catalog.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                    <th className="p-3 w-12 text-center">Auth</th>
                    <th className="p-3">Vehicle Model</th>
                    <th className="p-3">SKU / Index</th>
                    <th className="p-3">CSD Price</th>
                    <th className="p-3">Availability Status</th>
                    <th className="p-3">Est. Delivery</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedProducts.map((prod) => {
                    const pId = prod._id || prod.id;
                    const mapping = mappingMap.get(String(pId));
                    const isAuthorized = mapping && mapping.active;

                    return (
                      <tr
                        key={pId}
                        className={`hover:bg-slate-50/80 transition ${
                          isAuthorized ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleProduct(prod)}
                            className="text-slate-600 hover:text-brand transition"
                            title={isAuthorized ? 'Revoke Authorization' : 'Authorize Model'}
                          >
                            {isAuthorized ? (
                              <CheckSquare size={18} className="text-emerald-600" />
                            ) : (
                              <Square size={18} className="text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{prod.name}</div>
                          <div className="text-[10px] text-slate-500">{prod.variant || ''}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {prod.sku || prod.indexNo || '—'}
                        </td>
                        <td className="p-3 font-mono font-bold text-brand">
                          ₹ {(prod.priceToCustomer || prod.price || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          {mapping ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                mapping.active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {mapping.active ? mapping.availabilityStatus || 'AVAILABLE' : 'INACTIVE'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Not Authorized</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {mapping ? `${mapping.estimatedDeliveryDays || 15} Days` : '—'}
                        </td>
                        <td className="p-3 text-right">
                          {mapping && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMapping(mapping)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                              title="Delete Authorization Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="p-8 text-center text-slate-500">
            <ShieldCheck size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-700">No Dealership Selected</p>
            <p className="text-xs text-slate-400 mt-1">
              Select an OEM and Dealership above to inspect or configure DealerProduct authorizations.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
