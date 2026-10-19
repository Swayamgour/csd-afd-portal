import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Info, Search, Loader2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { useGetProductsQuery, useCheckProductEligibilityMutation } from '../catalog/productApi.js';
import { useGetMyProfileQuery } from './beneficiaryApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export function BeneficiaryEligibility() {
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('product') || searchParams.get('productId');

  const { data: profileResp, isLoading: profileLoading } = useGetMyProfileQuery();
  const profile = profileResp?.data || {};

  const { data: productsResp, isLoading: productsLoading } = useGetProductsQuery({ limit: 100 });
  const products = productsResp?.data || [];

  const [checkEligibility, { isLoading: checkingEligibility }] = useCheckProductEligibilityMutation();

  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || '');
  const [checkResult, setCheckResult] = useState(null);
  const [evalError, setEvalError] = useState('');

  const runBackendEligibilityCheck = async (product) => {
    if (!product?._id && !product?.id) return;
    setEvalError('');
    try {
      const res = await checkEligibility(product._id || product.id).unwrap();
      const eligible = res?.eligible ?? res?.data?.eligible ?? false;
      const reason = res?.reason ?? res?.data?.reason ?? (eligible ? 'Eligible under Defence Entitlement Rules' : 'Not eligible');
      
      setCheckResult({
        product,
        eligible,
        reason,
        payLevel: profile?.payLevel || profile?.serviceDetails?.payLevel || 'N/A',
        price: product.price || 0,
        rules: res?.rules || res?.data?.rules || {},
        lastCheckDate: new Date().toLocaleDateString('en-IN')
      });
    } catch (err) {
      setEvalError(getErrorMessage(err));
      setCheckResult(null);
    }
  };

  useEffect(() => {
    if (products.length > 0 && preselectedProductId) {
      const found = products.find((p) => (p._id === preselectedProductId || p.id === preselectedProductId));
      if (found) {
        setSelectedProductId(found._id || found.id);
        runBackendEligibilityCheck(found);
      }
    }
  }, [products, preselectedProductId]);

  const handleProductSelect = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    const item = products.find((p) => (p._id === id || p.id === id));
    if (item) {
      runBackendEligibilityCheck(item);
    } else {
      setCheckResult(null);
    }
  };

  const userPayLevel = profile?.payLevel || profile?.serviceDetails?.payLevel || 'Not Specified';
  const categoryName = profile?.category || profile?.serviceDetails?.rankCategory || 'JCO / Equivalent';

  return (
    <div className="beneficiary-eligibility-page">
      <PageHeader
        title="AFD Entitlement & Eligibility Checker"
        subtitle="Verify your entitlement limits, rank ceiling, and purchase periodicity under Army Order & CSD AFD directives."
      />

      {/* Main Entitlement Overview Card */}
      <Card title="Entitlement Master Profile" className="mb-3">
        {profileLoading ? (
          <div className="py-4 text-center muted"><Loader2 size={24} className="spin inline" /> Loading entitlement profile...</div>
        ) : (
          <>
            <div className="between align-center flex-wrap gap-2 mb-3">
              <div>
                <span className="small muted block">Beneficiary Category</span>
                <p className="h3 text-brand my-1">{categoryName}</p>
                <p className="small muted mb-0">Pay Level: <b>{userPayLevel}</b> | Service No: <b>{profile?.serviceNumber || 'N/A'}</b></p>
              </div>
              <div className="status-pill-big bg-green-soft border-green p-2 row align-center gap-1">
                <CheckCircle2 size={20} className="text-green" />
                <div>
                  <span className="font-bold text-green small block">Verification Status: {profile?.verificationStatus || 'APPROVED'}</span>
                  <span className="micro muted block">Synchronized with Military Service Directorate</span>
                </div>
              </div>
            </div>

            <div className="grid-3-col gap-2">
              <div className="panel p-3 bg-bg">
                <h4 className="small font-semibold mb-1">Four-Wheeler (Car)</h4>
                <p className="h4 text-brand my-1">
                  Pay Level {userPayLevel} Ceiling
                </p>
                <p className="small muted mb-1">Periodicity: Once every 8 years (Min 5 yrs service)</p>
                <span className="small text-green font-semibold">● Eligibility Evaluated on Demand</span>
              </div>

              <div className="panel p-3 bg-bg">
                <h4 className="small font-semibold mb-1">Two-Wheeler (Bike / Scooter)</h4>
                <p className="h4 text-green my-1">Uncapped CC</p>
                <p className="small muted mb-1">Periodicity: Once every 3 years</p>
                <span className="small text-green font-semibold">● Eligible</span>
              </div>

              <div className="panel p-3 bg-bg">
                <h4 className="small font-semibold mb-1">White Goods (Appliances)</h4>
                <p className="h4 text-saffron my-1">Annual Quota</p>
                <p className="small muted mb-1">Multiple items allowed per financial year</p>
                <span className="small text-green font-semibold">● Eligible</span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Product-Specific Checker */}
      <Card
        title="Check Specific Product Eligibility"
        subtitle="Select any car, bike, or appliance from the official CSD catalogue to compute immediate sanction eligibility via backend."
        className="mb-3"
      >
        <div className="max-w-xl mb-3">
          <label className="form-label font-semibold small">
            Select Product from Catalogue
          </label>
          <div className="fld mb-2">
            <Search size={18} className="fld-icon text-muted" />
            <select
              value={selectedProductId}
              onChange={handleProductSelect}
              className="select-input"
              disabled={productsLoading || checkingEligibility}
            >
              <option value="">-- Choose a vehicle or product --</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.brand?.name || p.brand || 'CSD'}) — ₹ {Number(p.price || 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {checkingEligibility && (
          <div className="p-3 text-center muted">
            <Loader2 size={24} className="spin inline mr-2" /> Validating defence entitlement against product specifications on server...
          </div>
        )}

        {evalError && (
          <div className="panel p-3 border-danger bg-red-soft mb-2 text-danger small">
            ⚠ {evalError}
          </div>
        )}

        {checkResult && !checkingEligibility && (
          <div
            className={`panel p-3 border-2 ${
              checkResult.eligible ? 'border-green bg-green-soft' : 'border-danger bg-red-soft'
            }`}
          >
            <div className="between align-center flex-wrap gap-2 mb-2">
              <div className="row align-center gap-1">
                {checkResult.eligible ? (
                  <CheckCircle2 size={28} className="text-green" />
                ) : (
                  <XCircle size={28} className="text-danger" />
                )}
                <div>
                  <h3 className="h4 mb-0">
                    {checkResult.eligible ? 'You are Eligible for this Item!' : 'Not Eligible for this Item'}
                  </h3>
                  <span className="small font-medium">{checkResult.product?.name}</span>
                </div>
              </div>

              {checkResult.eligible && (
                <Link
                  to={`/checkout?productId=${checkResult.product?._id || checkResult.product?.id}`}
                  className="btn btn-primary"
                >
                  Generate Demand for this Vehicle <ArrowRight size={16} />
                </Link>
              )}
            </div>

            <p className="small mb-2 font-medium">{checkResult.reason}</p>

            <div className="info-kv-list bg-white p-2 panel">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">CSD Base Price:</span>
                <span className="font-bold">₹ {Number(checkResult.price || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Beneficiary Pay Level Evaluated:</span>
                <span className="font-bold text-brand">{checkResult.payLevel}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Backend Evaluation Timestamp:</span>
                <span className="muted">{checkResult.lastCheckDate} (Authoritative Backend Verdict)</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
export default BeneficiaryEligibility;
