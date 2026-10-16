import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Info, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { productService } from '../../services/product.service.js';

export function BeneficiaryEligibility() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get('product');

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || '');
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    async function load() {
      const list = await productService.getProducts();
      setProducts(list);
      if (preselectedProductId) {
        const item = list.find((p) => p.id === preselectedProductId);
        if (item) evaluateEligibility(item);
      }
    }
    load();
  }, [preselectedProductId]);

  const evaluateEligibility = (product) => {
    const userCap = user?.eligibility?.fourWheelerCap || 1000000;
    const isCar = product.category === 'car';

    if (isCar) {
      const price = product.lo || 800000;
      const isWithinCap = price <= userCap;
      setCheckResult({
        product,
        eligible: isWithinCap,
        category: user?.eligibility?.category || 'JCO / Equivalent',
        price,
        userCap,
        reason: isWithinCap
          ? `Vehicle starting base price (₹ ${price.toLocaleString('en-IN')}) is within your rank ceiling of ₹ ${userCap.toLocaleString('en-IN')}.`
          : `Vehicle starting base price (₹ ${price.toLocaleString('en-IN')}) exceeds your rank ceiling of ₹ ${userCap.toLocaleString('en-IN')}.`,
        nextWindow: user?.eligibility?.nextFourWheelerEligibleDate,
        lastCheckDate: new Date().toLocaleDateString('en-IN')
      });
    } else {
      setCheckResult({
        product,
        eligible: true,
        category: user?.eligibility?.category || 'JCO / Equivalent',
        price: product.lo || 100000,
        userCap: 'Uncapped',
        reason: `Eligible under CSD AFD Category-II regulations. No financial ceiling applies to Two-Wheelers or White Goods for verified cardholders.`,
        nextWindow: 'Immediate',
        lastCheckDate: new Date().toLocaleDateString('en-IN')
      });
    }
  };

  const handleProductSelect = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    const item = products.find((p) => p.id === id);
    if (item) evaluateEligibility(item);
    else setCheckResult(null);
  };

  return (
    <div className="beneficiary-eligibility-page">
      <PageHeader
        title="AFD Entitlement & Eligibility Checker"
        subtitle="Verify your entitlement limits, rank ceiling, and purchase periodicity under Army Order & CSD AFD 2024 directives."
      />

      {/* Main Entitlement Overview Card */}
      <Card title="Entitlement Master Profile" className="mb-3">
        <div className="between align-center flex-wrap gap-2 mb-3">
          <div>
            <span className="small muted block">Beneficiary Category</span>
            <p className="h3 text-brand my-1">{user?.eligibility?.category || 'JCO / Equivalent'}</p>
            <p className="small muted mb-0">Pay Level: <b>{user?.payLevel}</b></p>
          </div>
          <div className="status-pill-big bg-green-soft border-green p-2 row align-center gap-1">
            <CheckCircle2 size={20} className="text-green" />
            <div>
              <span className="font-bold text-green small block">Status: Verified & Eligible</span>
              <span className="micro muted block">Last verified via Service Directorate</span>
            </div>
          </div>
        </div>

        <div className="grid-3-col gap-2">
          <div className="panel p-3 bg-bg">
            <h4 className="small font-semibold mb-1">Four-Wheeler (Car)</h4>
            <p className="h3 text-brand my-1">
              ₹ {((user?.eligibility?.fourWheelerCap || 1000000) / 100000).toFixed(1)} Lakhs
            </p>
            <p className="small muted mb-1">Periodicity: Once every 8 years</p>
            <span className="small text-green font-semibold">● Eligible now</span>
          </div>

          <div className="panel p-3 bg-bg">
            <h4 className="small font-semibold mb-1">Two-Wheeler (Bike / Scooter)</h4>
            <p className="h3 text-green my-1">Uncapped CC</p>
            <p className="small muted mb-1">Periodicity: Once every 3 years</p>
            <span className="small text-green font-semibold">● Eligible now</span>
          </div>

          <div className="panel p-3 bg-bg">
            <h4 className="small font-semibold mb-1">White Goods (Appliances)</h4>
            <p className="h3 text-saffron my-1">Annual Quota</p>
            <p className="small muted mb-1">Multiple appliances per financial year</p>
            <span className="small text-green font-semibold">● Eligible now</span>
          </div>
        </div>
      </Card>

      {/* Product-Specific Checker */}
      <Card
        title="Check Specific Product Eligibility"
        subtitle="Select any car, bike, or appliance from the official CSD catalogue to compute immediate sanction eligibility."
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
            >
              <option value="">-- Choose a vehicle or product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand}) — Starting ₹ {p.lo?.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {checkResult && (
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
                  to={`/beneficiary/demands/new?productId=${checkResult.product?.id}`}
                  className="btn btn-primary"
                >
                  Generate Demand for this Vehicle <ArrowRight size={16} />
                </Link>
              )}
            </div>

            <p className="small mb-2 font-medium">{checkResult.reason}</p>

            <div className="info-kv-list bg-white p-2 panel">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Starting Base Price (Ex-Showroom):</span>
                <span className="font-bold">₹ {checkResult.price?.toLocaleString('en-IN')}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Your Category Cap Limit:</span>
                <span className="font-bold text-brand">
                  {typeof checkResult.userCap === 'number'
                    ? `₹ ${checkResult.userCap.toLocaleString('en-IN')}`
                    : checkResult.userCap}
                </span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Verification Timestamp:</span>
                <span className="muted">{checkResult.lastCheckDate} (Real-time evaluation)</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
export default BeneficiaryEligibility;
