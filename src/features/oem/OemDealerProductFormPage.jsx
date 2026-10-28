import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Car,
  Clock,
  Save,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetOemDealersQuery,
  useGetOemProductsQuery,
  useCreateOemDealerProductMutation,
} from './oemApi.js';

export default function OemDealerProductFormPage() {
  const navigate = useNavigate();

  const { data: dealersData, isLoading: isLoadingDealers } = useGetOemDealersQuery({ limit: 100, active: true });
  const { data: productsData, isLoading: isLoadingProducts } = useGetOemProductsQuery({ limit: 100, status: 'ACTIVE' });
  const [createMapping, { isLoading: isCreating }] = useCreateOemDealerProductMutation();

  const dealers = dealersData?.items || [];
  const products = productsData?.items || [];

  const [formDealerId, setFormDealerId] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formAvailability, setFormAvailability] = useState('AVAILABLE');
  const [formDeliveryDays, setFormDeliveryDays] = useState('');
  const [formError, setFormError] = useState('');

  const selectedDealer = dealers.find((d) => d._id === formDealerId);
  const selectedProduct = products.find((p) => p._id === formProductId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formDealerId || !formProductId) {
      setFormError('Please select both an authorized dealership showroom and an empaneled vehicle model.');
      return;
    }

    try {
      await createMapping({
        dealerId: formDealerId,
        productId: formProductId,
        availabilityStatus: formAvailability || undefined,
        estimatedDeliveryDays: formDeliveryDays ? Number(formDeliveryDays) : undefined,
      }).unwrap();

      navigate('/oem/dealer-products', {
        state: { toast: `Dealership showroom authorized for ${selectedProduct?.name || 'vehicle model'} successfully.` },
      });
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to authorize dealership for model.');
    }
  };

  if (isLoadingDealers || isLoadingProducts) {
    return (
      <div className="py-12">
        <LoadingState text="Loading authorized dealerships and vehicle models..." />
      </div>
    );
  }

  return (
    <div className="oem-dealer-product-form-page space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Authorize Dealership for Vehicle Model"
        subtitle="Grant an empaneled regional dealership showroom permission to stock, book, and handover defense rate vehicles"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Dealer Products', href: '/oem/dealer-products' },
          { label: 'Authorize Showroom' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/oem/dealer-products')}
          >
            Back to Allotments
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Validation Error</div>
              <div>{formError}</div>
            </div>
          </div>
        )}

        <Card
          title="Dealership Showroom & Vehicle Selection"
          subtitle="Pair an empaneled dealership location with an authorized vehicle SKU"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Select Dealership Showroom <span className="text-red-500">*</span>
              </label>
              <select
                className="form-control"
                value={formDealerId}
                onChange={(e) => setFormDealerId(e.target.value)}
                required
              >
                <option value="">-- Choose Dealership Showroom --</option>
                {dealers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} · {d.city}, {d.state} ({d.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Must be an active showroom certified in the CSD network.</p>
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Select Empaneled Vehicle Model <span className="text-red-500">*</span>
              </label>
              <select
                className="form-control"
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                required
              >
                <option value="">-- Choose Vehicle Model --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (SKU: {p.sku}) · ₹ {(p.price || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Active model listed in OEM catalog for AFD release.</p>
            </div>
          </div>

          {(selectedDealer || selectedProduct) && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="font-semibold text-slate-800">Allotment Summary:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="font-medium text-slate-500">Showroom:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedDealer?.name || 'Not selected'}</span>
                  {selectedDealer?.code && ` (${selectedDealer.code})`}
                </div>
                <div>
                  <span className="font-medium text-slate-500">Location:</span>{' '}
                  <span>{selectedDealer?.city ? `${selectedDealer.city}, ${selectedDealer.state}` : '—'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Vehicle:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedProduct?.name || 'Not selected'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Index / SKU:</span>{' '}
                  <span className="font-mono">{selectedProduct?.sku || '—'}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Availability & Handover Commitments"
          subtitle="Configure default showroom inventory posture and estimated customer delivery timeline"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Initial Stock Availability
              </label>
              <select
                className="form-control font-medium"
                value={formAvailability}
                onChange={(e) => setFormAvailability(e.target.value)}
              >
                <option value="AVAILABLE">AVAILABLE (In Stock for Immediate Allotment)</option>
                <option value="WAITING_PERIOD">WAITING_PERIOD (Transit / Booking Queue)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Temporary Hold)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Status shown to beneficiaries in showroom inventory view.</p>
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Estimated Handover Days
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="form-control font-mono font-medium"
                  placeholder="e.g. 15"
                  value={formDeliveryDays}
                  onChange={(e) => setFormDeliveryDays(e.target.value)}
                  min="1"
                  max="180"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Expected business days from demand approval to vehicle handover.</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/oem/dealer-products')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            icon={Save}
            loading={isCreating}
          >
            Authorize Showroom Allotment
          </Button>
        </div>
      </form>
    </div>
  );
}
