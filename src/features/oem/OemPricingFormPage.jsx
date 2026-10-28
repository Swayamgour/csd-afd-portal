import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  useGetOemPricingByIdQuery,
  useCreateOemPricingMutation,
  useUpdateOemPricingMutation,
  useGetOemProductsQuery,
} from './oemApi.js';

const INDIAN_STATES = [
  'ANDAMAN AND NICOBAR ISLANDS', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM',
  'BIHAR', 'CHANDIGARH', 'CHHATTISGARH', 'DADRA AND NAGAR HAVELI', 'DAMAN AND DIU',
  'DELHI', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JAMMU AND KASHMIR',
  'JHARKHAND', 'KARNATAKA', 'KERALA', 'LADAKH', 'LAKSHADWEEP', 'MADHYA PRADESH',
  'MAHARASHTRA', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'ODISHA',
  'PUDUCHERRY', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TELANGANA',
  'TRIPURA', 'UTTAR PRADESH', 'UTTARAKHAND', 'WEST BENGAL'
];

export default function OemPricingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawPricing, isLoading: isLoadingPrice } = useGetOemPricingByIdQuery(id, { skip: !isEdit });
  const { data: productsData, isLoading: isLoadingProducts } = useGetOemProductsQuery({ limit: 100, status: 'ACTIVE' });

  const [createPricing, { isLoading: isCreating }] = useCreateOemPricingMutation();
  const [updatePricing, { isLoading: isUpdating }] = useUpdateOemPricingMutation();

  const products = productsData?.items || [];

  const [formData, setFormData] = useState({
    productId: '',
    state: 'DELHI',
    basePrice: '',
    salePrice: '',
    taxPercent: '',
    status: 'PUBLISHED',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
  });

  const [formError, setFormError] = useState('');

  // Populate data in edit mode
  useEffect(() => {
    if (rawPricing) {
      const p = rawPricing.data || rawPricing;
      setFormData({
        productId: p.productId?._id || p.productId || '',
        state: p.state || 'DELHI',
        basePrice: p.basePrice !== undefined && p.basePrice !== null ? String(p.basePrice) : '',
        salePrice: p.salePrice !== undefined && p.salePrice !== null ? String(p.salePrice) : '',
        taxPercent: p.taxPercent !== undefined && p.taxPercent !== null ? String(p.taxPercent) : '',
        status: p.status || 'PUBLISHED',
        effectiveFrom: p.effectiveFrom ? new Date(p.effectiveFrom).toISOString().slice(0, 10) : '',
        effectiveTo: p.effectiveTo ? new Date(p.effectiveTo).toISOString().slice(0, 10) : '',
      });
    } else if (!isEdit && products.length > 0 && !formData.productId) {
      const defaultProd = products[0];
      setFormData((prev) => ({
        ...prev,
        productId: defaultProd._id || '',
        basePrice: defaultProd.price ? String(defaultProd.price) : '',
        taxPercent: defaultProd.taxPercent !== undefined && defaultProd.taxPercent !== null ? String(defaultProd.taxPercent) : '',
      }));
    }
  }, [rawPricing, products, isEdit]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p._id === formData.productId) || null;
  }, [products, formData.productId]);

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    const prod = products.find((p) => p._id === selectedId);
    setFormData((prev) => ({
      ...prev,
      productId: selectedId,
      basePrice: prod?.price ? String(prod.price) : prev.basePrice,
      taxPercent: prod?.taxPercent !== undefined && prod?.taxPercent !== null ? String(prod.taxPercent) : prev.taxPercent,
    }));
  };

  const calculateSuggestedSalePrice = () => {
    const base = Number(formData.basePrice) || 0;
    const tax = Number(formData.taxPercent) || 0;
    const computed = Math.round(base * (1 + tax / 100));
    setFormData((prev) => ({
      ...prev,
      salePrice: String(computed),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.productId || !formData.state || !formData.basePrice || !formData.salePrice) {
      setFormError('Please enter all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (formData.effectiveFrom && formData.effectiveTo) {
      if (new Date(formData.effectiveFrom) >= new Date(formData.effectiveTo)) {
        setFormError('Effective From date must be strictly earlier than Effective To date.');
        return;
      }
    }

    const payload = {
      productId: formData.productId,
      state: formData.state.toUpperCase().trim(),
      basePrice: Number(formData.basePrice),
      salePrice: Number(formData.salePrice),
      taxPercent: Number(formData.taxPercent || 0),
      status: formData.status,
      effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom) : undefined,
      effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo) : undefined,
    };

    try {
      if (isEdit) {
        await updatePricing({ id, ...payload }).unwrap();
        navigate('/oem/pricing', {
          state: { toast: `State rate contract for ${payload.state} updated successfully.` },
        });
      } else {
        await createPricing(payload).unwrap();
        navigate('/oem/pricing', {
          state: { toast: `Published state rate contract for ${payload.state} published successfully.` },
        });
      }
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to save state pricing contract.');
    }
  };

  if (isEdit && isLoadingPrice) {
    return (
      <div className="py-12">
        <LoadingState text="Loading rate contract details..." />
      </div>
    );
  }

  return (
    <div className="oem-pricing-form-page space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={isEdit ? 'Update State Rate Contract' : 'Publish State Rate Contract'}
        subtitle="Manage state ceiling rates, local road tax offsets, and published rate contracts for beneficiary procurement"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'State Pricing', href: '/oem/pricing' },
          { label: isEdit ? 'Update Contract' : 'Publish Rate' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/oem/pricing')}
          >
            Back to Rate Schedules
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

        {/* 1. Vehicle Model & Region */}
        <Card
          title="Vehicle Model & Regional Jurisdiction"
          subtitle="Select the empaneled AFD-listed model and the destination State or Union Territory"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Empaneled Vehicle Model <span className="text-red-500">*</span>
              </label>
              <select
                className="form-control"
                value={formData.productId}
                onChange={handleProductChange}
                disabled={isEdit}
                required
              >
                <option value="">-- Choose Empaneled Vehicle --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} · SKU: {p.sku} {p.price ? `(₹${p.price.toLocaleString('en-IN')})` : ''}
                  </option>
                ))}
              </select>
              {isEdit && (
                <p className="text-xs text-slate-500 mt-1">
                  Model is immutable once rate contract is established. To change model, create a new contract.
                </p>
              )}
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                State / Union Territory <span className="text-red-500">*</span>
              </label>
              <select
                className="form-control"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Regional ceiling price applies to all depots and dealerships operating in this territory.
              </p>
            </div>
          </div>

          {selectedProduct && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500">Nomenclature:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedProduct.nomenclature || selectedProduct.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Category:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedProduct.afdType || 'AFD-I'}</span>
              </div>
              <div>
                <span className="text-slate-500">Standard Ex-Factory:</span>{' '}
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(selectedProduct.price || 0)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* 2. Rate Structure & Taxes */}
        <Card
          title="Price Schedule & Tax Computation"
          subtitle="Specify the base rate ex-factory, applicable GST tax percentage, and authoritative final CSD price"
          headerAction={
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Calculator}
              onClick={calculateSuggestedSalePrice}
              title="Compute final price from Base + GST"
            >
              Auto-Compute CSD Price
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Base Rate Ex-Factory (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  className="form-control pl-7 font-mono font-medium"
                  placeholder="e.g. 1000000"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Basic price excluding state GST and local levies.</p>
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                GST Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="form-control font-mono font-medium"
                  placeholder="e.g. 18 or 28"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData({ ...formData, taxPercent: e.target.value })}
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-medium">%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Concessional CSD GST slab rate.</p>
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Final CSD Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-brand font-medium">₹</span>
                <input
                  type="number"
                  className="form-control pl-7 font-mono font-bold text-slate-900 border-brand"
                  placeholder="e.g. 1180000"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Authoritative ceiling price for defense beneficiary demand sanction.</p>
            </div>
          </div>
        </Card>

        {/* 3. Validity & Regulatory Status */}
        <Card
          title="Contract Period & Enforcement Status"
          subtitle="Define the effective date window and regulatory publication status"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Effective From Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="form-control"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Date when this rate becomes valid for booking.</p>
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Effective To Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="form-control"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Leave blank for open-ended contract validity.</p>
            </div>

            <div className="form-field">
              <label className="form-label font-medium text-slate-700">
                Contract Publication Status <span className="text-red-500">*</span>
              </label>
              <select
                className="form-control font-medium"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="PUBLISHED">PUBLISHED (Active Ceiling Rate)</option>
                <option value="DRAFT">DRAFT (Internal Review)</option>
                <option value="INACTIVE">INACTIVE (Superseded)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Published rates immediately govern beneficiary checkout.</p>
            </div>
          </div>
        </Card>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/oem/pricing')}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={isCreating || isUpdating}
            >
              {isEdit ? 'Save Rate Changes' : 'Publish State Rate Contract'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
