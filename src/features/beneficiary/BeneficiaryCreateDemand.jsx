import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Upload, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import { productService } from '../../services/product.service.js';
import { demandService } from '../../services/demand.service.js';
import { contentService } from '../../services/content.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BeneficiaryCreateDemand() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || 'tata-nexon';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [depots, setDepots] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('Delhi Regional CSD Depot');
  const [selectedDealer, setSelectedDealer] = useState('');
  const [undertakingAgreed, setUndertakingAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [p, depList, dlrList] = await Promise.all([
        productService.getProductById(productId),
        contentService.getDepots(),
        contentService.getDealers()
      ]);
      setProduct(p);
      setDepots(depList);
      setDealers(dlrList);
      if (p) {
        setSelectedColor(p.colors?.[0] || 'Standard');
        setSelectedVariant(p.type || 'Standard Variant');
      }
      if (dlrList.length > 0) {
        setSelectedDealer(dlrList[0].name);
      }
    }
    load();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!undertakingAgreed) {
      setError('Please acknowledge the statutory defence entitlement undertaking.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const created = await demandService.createDemand({
        beneficiaryId: user?.id,
        beneficiaryName: user?.name,
        serviceNumber: user?.serviceNumber,
        productId: product?.id,
        productName: product?.name,
        category: product?.category || 'car',
        brand: product?.brand,
        variant: selectedVariant,
        color: selectedColor,
        fuel: product?.fuel?.[0] || 'Petrol',
        exShowroomPrice: product?.lo ? Math.round(product.lo * 1.18) : 1000000,
        csdPrice: product?.lo || 850000,
        savings: product?.lo ? Math.round(product.lo * 0.18) : 150000,
        depot: selectedDepot,
        urc: user?.urc || 'Delhi Cantt Central URC',
        dealer: selectedDealer
      });
      navigate(`/beneficiary/demands/${created.id}`);
    } catch (err) {
      setError(err.message || 'Unable to generate demand.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-demand-page">
      <div className="mb-2">
        <Link to="/products" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to Catalogue
        </Link>
      </div>

      <PageHeader
        title="Generate CSD AFD Demand"
        subtitle="Initiate procurement demand for authorized concessional supply order"
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid-2-col gap-2 mb-3">
          {/* Left Column: Product & Configuration */}
          <div className="left-stack flex-col gap-2">
            <Card title="Selected Product / Vehicle">
              {product ? (
                <div>
                  <div className="row align-center gap-2 mb-2">
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="panel p-1 w-24 h-24 object-cover"
                    />
                    <div>
                      <span className="eyebrow">{product.brand} · {product.category?.toUpperCase()}</span>
                      <h3 className="h4 mb-1">{product.name}</h3>
                      <p className="font-bold text-brand h4 mb-0">
                        ₹ {product.lo?.toLocaleString('en-IN')}{' '}
                        <small className="small muted font-normal">(CSD Concessional)</small>
                      </p>
                    </div>
                  </div>

                  <div className="form-field mb-2">
                    <label className="form-label font-semibold small">Select Colour</label>
                    <div className="row gap-1">
                      {(product.colors || ['Daytona Grey', 'Pristine White', 'Flame Red']).map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`chip ${selectedColor === c ? 'active' : ''}`}
                          onClick={() => setSelectedColor(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label font-semibold small">Variant</label>
                    <input
                      type="text"
                      className="fld"
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <p className="muted small">Loading product information...</p>
              )}
            </Card>

            <Card title="Regional Allocation & Dealership">
              <Select
                label="Sanctioning Regional Depot"
                value={selectedDepot}
                onChange={(e) => setSelectedDepot(e.target.value)}
                options={depots.map((d) => ({ value: d.name, label: `${d.name} (${d.code})` }))}
                required
                className="mb-2"
              />

              <Select
                label="Authorized Delivery Dealership"
                value={selectedDealer}
                onChange={(e) => setSelectedDealer(e.target.value)}
                options={dealers.map((dl) => ({ value: dl.name, label: `${dl.name} — ${dl.city}` }))}
                required
              />
            </Card>
          </div>

          {/* Right Column: Required Documents & Undertaking */}
          <div className="right-stack flex-col gap-2">
            <Card title="Upload Mandatory Documents">
              <div className="mb-2">
                <FileUpload
                  label="1. Availment Certificate (Counter-signed by CO)"
                  helperText="Signed Annexure-A form (PDF up to 5MB)"
                  required
                />
              </div>

              <div className="mb-2">
                <FileUpload
                  label="2. Latest Pay Slip / Pension Statement"
                  helperText="Showing Pay Level and Basic Pay"
                  required
                />
              </div>

              <div>
                <FileUpload
                  label="3. Dealer Proforma / Availability Letter"
                  helperText="Issued by selected authorized showroom"
                />
              </div>
            </Card>

            <Card title="Statutory Entitlement Undertaking">
              <div className="undertaking-box panel p-3 bg-bg mb-2 small muted">
                <p className="mb-1">
                  1. I certify that I have not purchased any four-wheeler vehicle from CSD during the last 8 years (or within my entitled rank interval).
                </p>
                <p className="mb-1">
                  2. I understand that the vehicle purchased through CSD cannot be sold or transferred for a minimum period of 5 years as per Army Orders.
                </p>
                <p className="mb-0">
                  3. If any information furnished is found false, disciplinary action will be initiated under the Army / Navy / Air Force Act.
                </p>
              </div>

              <label className="checkbox-label row align-start gap-1 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={undertakingAgreed}
                  onChange={(e) => setUndertakingAgreed(e.target.checked)}
                  required
                />
                <span className="small font-semibold">
                  I solemnly declare that the statements made above are true and complete.
                </span>
              </label>

              {error && <p className="err small mb-2">⚠ {error}</p>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="wide"
              >
                Submit Demand Application
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
