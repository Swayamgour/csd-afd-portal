import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Upload, FileText, Camera, X, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Badge from '../../components/common/Badge.jsx';
import { useCreateDealerRequestMutation, useUploadDealerRequestPhotosMutation } from '../../redux/api/dealerRequestApi.js';
import { useGetCategoriesQuery } from '../../redux/api/productApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { fileSrc } from './dealerRequestUtils.js';
import {
  STATE_OPTIONS,
  OTHER_CITY,
  citiesForState,
  findStateByCode,
  findStateByName,
} from './stateCities.js';

const LIST_ROUTE = '/oem/dealer-requests';

const MANDATORY_DOC_DEFS = [
  { key: 'dealerRegistrationRequest', label: '1. Dealer Registration Request (OEM Letter)', required: true },
  { key: 'dealerAcceptanceLetter', label: '2. Dealer Acceptance Letter', required: true },
  { key: 'gstCertificate', label: '3. GST Registration Certificate', required: true },
  { key: 'caCertificateGst', label: '4. CA Certificate for GST Turnover/Status', required: true },
  { key: 'panCard', label: '5. PAN Card Copy of Dealer/Firm', required: true },
  { key: 'electricityBillAddressProof', label: '6. Showroom Electricity Bill / Address Proof', required: true },
  { key: 'idProof', label: '7. ID Proof of Authorized Signatory', required: true },
  { key: 'bankCancelledCheque', label: '8. Bank Cancelled Cheque / Mandate Form', required: true },
  { key: 'authorizedDealershipCert', label: '10. Dealership Agreement / Authorization Certificate', required: true },
  { key: 'ownersContactDetails', label: '11. Owners / Directors / Partners Contact Details', required: true },
  { key: 'gstCompositionCert', label: '12. GST Composition / Non-Composition Declaration', required: true },
  { key: 'indemnityBond', label: 'Indemnity Bond Document', required: false },
];

// Fields appear on the form in exactly this order (serial wise).
const FIELD_ORDER = [
  'name', 'proposedCode', 'dealershipType',
  'person', 'phone', 'landline', 'email',
  'gstin', 'panNumber', 'state', 'stateCode',
  'district', 'city', 'pincode',
  'address',
];

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const EMPTY = {
  name: '',
  proposedCode: '',
  dealershipType: '',
  person: '',
  phone: '',
  landline: '',
  email: '',
  gstin: '',
  panNumber: '',
  state: '',
  stateCode: '',
  district: '',
  city: '',
  cityOther: false, // true when "Other" is chosen in the city dropdown and the city is typed manually
  pincode: '',
  address: '',
  remarks: '',
  indemnityBondSubmitted: false,
};

// Returns an error message for one field ('' when OK). Used on blur and on "Next".
function validateField(k, f) {
  switch (k) {
    case 'name': {
      const v = (f.name || '').trim();
      if (!v) return 'Proposed Dealer Name is required';
      if (v.length < 3) return 'Dealer Name must be at least 3 characters';
      return '';
    }
    case 'proposedCode': {
      if (!f.proposedCode) return '';
      return /^[A-Za-z0-9_-]{2,30}$/.test(f.proposedCode.trim()) ? '' : 'Only letters, digits, - and _ allowed (2-30 chars)';
    }
    case 'dealershipType':
      return f.dealershipType ? '' : 'Dealership Type is required';
    case 'person': {
      const v = (f.person || '').trim();
      if (!v) return 'Contact Person / Proprietor name is required';
      if (v.length < 2) return 'Name must be at least 2 characters';
      if (!/^[a-zA-Z\s.'-]+$/.test(v)) return 'Contact person name must contain letters only';
      return '';
    }
    case 'phone': {
      const v = (f.phone || '').trim();
      if (!v) return '10-digit Mobile Number is required';
      if (v.length !== 10) return 'Mobile Number must be exactly 10 digits';
      if (!/^[6-9]\d{9}$/.test(v)) return 'Invalid mobile number. Must start with 6, 7, 8, or 9';
      return '';
    }
    case 'landline': {
      if (!f.landline || !f.landline.trim()) return '';
      const digits = f.landline.replace(/\D/g, '');
      return digits.length < 6 || digits.length > 12 ? 'Landline / Alt Phone must contain 6 to 12 digits' : '';
    }
    case 'email': {
      const v = (f.email || '').trim();
      if (!v) return 'Email Address is required for official CSD notifications';
      return EMAIL_RE.test(v) ? '' : 'Enter a valid email address (e.g. dealer@company.com)';
    }
    case 'gstin': {
      const v = (f.gstin || '').trim().toUpperCase();
      if (!v) return 'GSTIN is required for dealer registration';
      if (v.length !== 15) return 'GSTIN must be exactly 15 characters';
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v)) return 'Invalid GSTIN format (e.g. 09AAACH2234P1Z2)';
      if (!findStateByCode(v.substring(0, 2))) return `GSTIN state code (${v.substring(0, 2)}) is not a valid GST state code`;
      if (f.stateCode && !v.startsWith(f.stateCode)) return `GSTIN state code prefix (${v.substring(0, 2)}) does not match State Code (${f.stateCode})`;
      if (f.panNumber && v.substring(2, 12) !== f.panNumber.trim().toUpperCase()) return 'GSTIN PAN segment does not match entered PAN Number';
      return '';
    }
    case 'panNumber': {
      const v = (f.panNumber || '').trim().toUpperCase();
      if (!v) return 'PAN Number is required';
      if (v.length !== 10) return 'PAN Number must be exactly 10 characters';
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v)) return 'Invalid PAN format (e.g. AAACH2234P)';
      return '';
    }
    case 'state':
      return f.state && f.state.trim() ? '' : 'State is required';
    case 'stateCode':
      return f.stateCode ? '' : 'State Code is required (select a State)';
    case 'city': {
      const v = (f.city || '').trim();
      if (!v) return f.cityOther ? 'Enter the city name' : 'City is required';
      if (v.length < 2) return 'City must be at least 2 characters';
      return '';
    }
    case 'pincode': {
      const v = (f.pincode || '').trim();
      if (!v) return 'Pincode is required';
      if (v.length !== 6) return 'Pincode must be exactly 6 digits';
      if (!/^[1-9][0-9]{5}$/.test(v)) return 'Invalid 6-digit Pincode (cannot start with 0)';
      return '';
    }
    case 'address': {
      const v = (f.address || '').trim();
      if (!v) return 'Full showroom / dealership address is required';
      if (v.length < 5) return 'Address must be at least 5 characters';
      return '';
    }
    default:
      return '';
  }
}

function sanitize(k, val) {
  if (typeof val !== 'string') return val;
  switch (k) {
    case 'phone': return val.replace(/\D/g, '').slice(0, 10);
    case 'pincode': return val.replace(/\D/g, '').slice(0, 6);
    case 'landline': return val.replace(/[^\d\s-]/g, '').slice(0, 15);
    case 'person': return val.replace(/[^a-zA-Z\s.'-]/g, '').slice(0, 80);
    case 'gstin': return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
    case 'panNumber': return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
    case 'proposedCode': return val.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase().slice(0, 30);
    case 'city':
    case 'district': return val.replace(/[^a-zA-Z\s.-]/g, '').slice(0, 80);
    default: return val;
  }
}

function Stepper({ step }) {
  const items = [
    { n: 1, label: 'Dealership Details' },
    { n: 2, label: 'Documents & Photos' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
      {items.map((it, i) => {
        const done = step > it.n;
        const active = step === it.n;
        return (
          <React.Fragment key={it.n}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: done || active ? '#fff' : '#64748b',
                  background: done ? '#16a34a' : active ? '#1a3f8f' : '#e2e8f0',
                }}
              >
                {done ? <CheckCircle2 size={16} /> : it.n}
              </span>
              <span style={{ fontWeight: active ? 700 : 500, color: active ? '#0c1a3a' : '#64748b' }}>{it.label}</span>
            </div>
            {i < items.length - 1 && <span style={{ flex: '0 0 40px', height: 2, background: done ? '#16a34a' : '#e2e8f0' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function NewDealerRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [f, setF] = useState(EMPTY);
  const [docs, setDocs] = useState({});
  const [showroomPhotos, setShowroomPhotos] = useState([]);
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');
  const [docErrors, setDocErrors] = useState(null); // null = not tried to submit yet; else { missingDocs: [...], photosShort: n }

  const [create, { isLoading: submitting }] = useCreateDealerRequestMutation();
  const [uploadFile] = useUploadDealerRequestPhotosMutation();

  // Dealership Type options come from GET /categories (active only)
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useGetCategoriesQuery();
  const categoryOptions = useMemo(
    () => categories.filter((c) => c.active !== false).map((c) => ({ value: c.name, label: c.name })),
    [categories]
  );

  const goBackToList = () => navigate(LIST_ROUTE);

  const setError = (k, msg) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[k] = msg;
      else delete next[k];
      return next;
    });

  const set = (k) => (e) => {
    const raw = e?.target?.type === 'checkbox' ? e.target.checked : e?.target?.value ?? e;
    const val = sanitize(k, raw);

    setF((prev) => {
      const next = { ...prev, [k]: val };

      // GSTIN -> auto pick State Code, State and PAN
      if (k === 'gstin' && typeof val === 'string') {
        const prefix = val.substring(0, 2);
        const matchState = val.length >= 2 ? findStateByCode(prefix) : null;
        if (matchState) {
          if (prev.state !== matchState.name) {
            next.city = '';
            next.cityOther = false;
          }
          next.stateCode = matchState.code;
          next.state = matchState.name;
        }
        if (val.length >= 12) next.panNumber = val.substring(2, 12);
      }

      // State chosen -> State Code follows, city list changes so the old city is cleared
      if (k === 'state') {
        const matchState = findStateByName(val);
        next.stateCode = matchState ? matchState.code : '';
        next.city = '';
        next.cityOther = false;
      }

      return next;
    });

    // live re-check of a field that already shows an error
    if (errors[k]) {
      const merged = { ...f, [k]: val };
      setError(k, validateField(k, merged));
    }
    // GST related errors clear once state / pan change
    if (k === 'state' && errors.gstin) setError('gstin', '');
  };

  const onBlur = (k) => () => setError(k, validateField(k, f));

  const stateCities = useMemo(() => citiesForState(f.state), [f.state]);
  const gstLocksState = f.gstin.length >= 2 && Boolean(findStateByCode(f.gstin.substring(0, 2)));
  const gstLocksPan = f.gstin.length >= 12;

  const cityValue = f.cityOther ? OTHER_CITY : f.city;
  const onCitySelect = (e) => {
    const v = e.target.value;
    if (v === OTHER_CITY) {
      setF((p) => ({ ...p, city: '', cityOther: true }));
    } else {
      setF((p) => ({ ...p, city: v, cityOther: false }));
      setError('city', '');
    }
  };

  const scrutiny = useMemo(() => {
    const gstin = (f.gstin || '').trim().toUpperCase();
    const pan = (f.panNumber || '').trim().toUpperCase();
    const stateCode = (f.stateCode || '').trim();
    const gstStateMatch = Boolean(gstin.length >= 2 && stateCode && gstin.startsWith(stateCode));
    const gstPanMatch = Boolean(gstin.length >= 12 && pan && gstin.substring(2, 12) === pan);
    let docCount = Object.keys(docs).filter((k) => docs[k] && k !== 'indemnityBond').length;
    if (showroomPhotos.length >= 5) docCount += 1;
    return { gstStateMatch, gstPanMatch, docCount, photosCount: showroomPhotos.length };
  }, [f.gstin, f.panNumber, f.stateCode, docs, showroomPhotos]);

  const validateStep1 = () => {
    const e = {};
    FIELD_ORDER.forEach((k) => {
      const msg = validateField(k, f);
      if (msg) e[k] = msg;
    });
    setErrors(e);
    const firstBad = FIELD_ORDER.find((k) => e[k]);
    if (firstBad) {
      setTimeout(() => {
        const el = document.getElementById(`dr-${firstBad}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus?.();
        }
      }, 30);
    }
    return !firstBad;
  };

  const handleNext = () => {
    setApiErr('');
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setApiErr('');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    setUploadingDocKey(key);
    setApiErr('');
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await uploadFile(fd).unwrap();
      const uploadedUrl = Array.isArray(res) ? res[0]?.url : res?.files?.[0]?.url;
      if (uploadedUrl) setDocs((prev) => ({ ...prev, [key]: uploadedUrl }));
    } catch (err) {
      setApiErr(getErrorMessage(err, `Failed to upload ${key}`));
    } finally {
      setUploadingDocKey(null);
    }
  };

  const handleShowroomPhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingDocKey('showroomPhotos');
    setApiErr('');
    try {
      const fd = new FormData();
      files.forEach((file) => fd.append('files', file));
      const res = await uploadFile(fd).unwrap();
      const list = Array.isArray(res) ? res : res?.files || [];
      const newUrls = list.map((item) => item.url).filter(Boolean);
      setShowroomPhotos((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setApiErr(getErrorMessage(err, 'Failed to upload showroom photos'));
    } finally {
      setUploadingDocKey(null);
      e.target.value = '';
    }
  };

  const removePhoto = (idx) => setShowroomPhotos((prev) => prev.filter((_, i) => i !== idx));

  const computeMissing = () => ({
    missingDocs: MANDATORY_DOC_DEFS.filter((d) => d.required && !docs[d.key]),
    photosShort: Math.max(0, 5 - showroomPhotos.length),
  });

  const submit = async () => {
    setApiErr('');
    // safety net: re-check step 1 before sending
    const bad = FIELD_ORDER.find((k) => validateField(k, f));
    if (bad) {
      setStep(1);
      validateStep1();
      return;
    }

    // documents + at least 5 showroom photos are compulsory before submitting
    const missing = computeMissing();
    setDocErrors(missing);
    if (missing.missingDocs.length > 0 || missing.photosShort > 0) {
      setTimeout(() => document.getElementById('dr-docs-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30);
      return;
    }

    const payload = {
      name: f.name.trim(),
      proposedCode: f.proposedCode.trim() || undefined,
      dealershipType: f.dealershipType.trim() || undefined,
      person: f.person.trim() || undefined,
      phone: f.phone.trim(),
      landline: f.landline.trim() || undefined,
      email: f.email.trim() || undefined,
      gstin: f.gstin.trim().toUpperCase() || undefined,
      panNumber: f.panNumber.trim().toUpperCase() || undefined,
      stateCode: f.stateCode.trim() || undefined,
      district: f.district.trim() || undefined,
      city: f.city.trim(),
      state: f.state.trim().toUpperCase(),
      pincode: f.pincode.trim() || undefined,
      address: f.address.trim() || undefined,
      remarks: f.remarks.trim() || undefined,
      indemnityBondSubmitted: Boolean(f.indemnityBondSubmitted || docs.indemnityBond),
      documents: { ...docs, showroomPhotos },
    };

    try {
      await create(payload).unwrap();
      navigate(LIST_ROUTE);
    } catch (err) {
      setApiErr(getErrorMessage(err, 'Failed to raise dealer request.'));
    }
  };

  const errCount = Object.keys(errors).length;
  const liveMissing = docErrors ? computeMissing() : null;

  return (
    <>
      <PageHeader
        title="New Dealer Appointment Request"
        subtitle="CSD Letter 902 (12 Documents & Scrutiny) + Letter 201 (Depot Verification)"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Dealer Requests', href: LIST_ROUTE },
          { label: 'New Request' },
        ]}
        actions={
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={goBackToList} disabled={submitting}>
            Back to requests
          </Button>
        }
      />

      <Card>
        <Stepper step={step} />

        {apiErr && (
          <div className="alert-banner error small mb-2 row align-center gap-1" role="alert">
            <AlertCircle size={16} />
            <span>{apiErr}</span>
          </div>
        )}

        {/* ───────── STEP 1 : DEALERSHIP DETAILS (all fields in one serial series) ───────── */}
        {step === 1 && (
          <form
            noValidate
            onSubmit={(ev) => {
              ev.preventDefault();
              handleNext();
            }}
          >
            {errCount > 0 && (
              <div className="alert-banner error small mb-2 row align-center gap-1" role="alert">
                <AlertCircle size={16} />
                <span>Please correct the {errCount} highlighted field error(s) before continuing.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <Input
                id="dr-name"
                label="Proposed Dealer Name"
                required
                value={f.name}
                onChange={set('name')}
                onBlur={onBlur('name')}
                error={errors.name}
                placeholder="e.g. Supreme Automobiles Pvt Ltd"
                maxLength={120}
              />

              <Input
                id="dr-proposedCode"
                label="Proposed Dealer Code"
                value={f.proposedCode}
                onChange={set('proposedCode')}
                onBlur={onBlur('proposedCode')}
                error={errors.proposedCode}
                helperText="Unique code (e.g. DL-ND-001)"
                placeholder="e.g. DL-ND-001"
                maxLength={30}
              />

              <Select
                id="dr-dealershipType"
                label="Dealership Type"
                required
                value={f.dealershipType}
                onChange={set('dealershipType')}
                error={errors.dealershipType}
                placeholder={categoriesLoading ? 'Loading categories...' : 'Select Dealership Type'}
                disabled={categoriesLoading}
                options={categoryOptions}
              />
              {categoriesError && !errors.dealershipType && (
                <p className="err" role="alert" style={{ gridColumn: '1 / -1', margin: 0 }}>
                  Could not load categories. Please refresh the page.
                </p>
              )}

              <Input
                id="dr-person"
                label="Contact Person / Proprietor"
                required
                value={f.person}
                onChange={set('person')}
                onBlur={onBlur('person')}
                error={errors.person}
                placeholder="e.g. Rakesh Kumar"
                maxLength={80}
                helperText="Letters and spaces only"
              />

              <Input
                id="dr-phone"
                label="Mobile Number"
                required
                inputMode="numeric"
                maxLength={10}
                value={f.phone}
                onChange={set('phone')}
                onBlur={onBlur('phone')}
                error={errors.phone}
                placeholder="e.g. 9876543210 (10 digits)"
                helperText="Strict 10-digit numeric mobile (6-9)"
              />

              <Input
                id="dr-landline"
                label="Landline / Alt Phone"
                value={f.landline}
                onChange={set('landline')}
                onBlur={onBlur('landline')}
                error={errors.landline}
                placeholder="e.g. 01662-234567"
                maxLength={15}
              />

              <Input
                id="dr-email"
                label="Email Address"
                type="email"
                required
                value={f.email}
                onChange={set('email')}
                onBlur={onBlur('email')}
                error={errors.email}
                placeholder="e.g. dealer.hisar@gmail.com"
              />

              <Input
                id="dr-gstin"
                label="GSTIN (15 Digits)"
                required
                maxLength={15}
                value={f.gstin}
                onChange={set('gstin')}
                onBlur={onBlur('gstin')}
                error={errors.gstin}
                placeholder="e.g. 06AAACH2234P1Z2"
                helperText={
                  scrutiny.gstStateMatch && scrutiny.gstPanMatch
                    ? '✓ PAN, State and State Code picked from GSTIN'
                    : 'PAN, State and State Code are filled automatically'
                }
              />

              <Input
                id="dr-panNumber"
                label="PAN Number (10 Digits)"
                required
                maxLength={10}
                value={f.panNumber}
                onChange={set('panNumber')}
                onBlur={onBlur('panNumber')}
                error={errors.panNumber}
                readOnly={gstLocksPan}
                placeholder="e.g. AAACH2234P"
                helperText={gstLocksPan ? 'Auto-picked from GSTIN (chars 3-12)' : 'Chars 3-12 of GSTIN'}
              />

              <Select
                id="dr-state"
                label="State"
                required
                value={f.state}
                onChange={set('state')}
                error={errors.state}
                disabled={gstLocksState}
                placeholder="Select State"
                options={STATE_OPTIONS}
              />

              <Input
                id="dr-stateCode"
                label="State Code (2 Digits)"
                required
                value={f.stateCode}
                readOnly
                error={errors.stateCode}
                placeholder="Auto from State"
                helperText="Auto-filled from GSTIN / State"
              />

              <Input
                id="dr-district"
                label="District"
                value={f.district}
                onChange={set('district')}
                error={errors.district}
                placeholder="e.g. Hisar"
              />

              <div>
                <Select
                  id="dr-city"
                  label="City"
                  required
                  value={cityValue}
                  onChange={onCitySelect}
                  onBlur={() => !f.cityOther && setError('city', validateField('city', f))}
                  error={!f.cityOther ? errors.city : undefined}
                  disabled={!f.state}
                  placeholder={f.state ? 'Select City' : 'Select State first'}
                  options={[...stateCities.map((c) => ({ value: c, label: c })), { value: OTHER_CITY, label: 'Other (type city name)' }]}
                />
                {f.cityOther && (
                  <Input
                    id="dr-city-other"
                    className="mt-1"
                    value={f.city}
                    onChange={set('city')}
                    onBlur={onBlur('city')}
                    error={errors.city}
                    placeholder="Type city name"
                    maxLength={80}
                  />
                )}
              </div>

              <Input
                id="dr-pincode"
                label="Pincode"
                required
                inputMode="numeric"
                maxLength={6}
                value={f.pincode}
                onChange={set('pincode')}
                onBlur={onBlur('pincode')}
                error={errors.pincode}
                placeholder="e.g. 125001"
                helperText="6-digit numeric PIN code"
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <Input
                id="dr-address"
                label="Full Dealership / Showroom Address"
                required
                value={f.address}
                onChange={set('address')}
                onBlur={onBlur('address')}
                error={errors.address}
                placeholder="e.g. Plot No. 4-5, Auto Market, Delhi Road"
                maxLength={250}
              />
            </div>

            <div className="form-field" style={{ marginTop: 14 }}>
              <label htmlFor="dr-remarks" className="form-label">Remarks for CSD HO</label>
              <textarea
                id="dr-remarks"
                className="form-control"
                rows={2}
                maxLength={1000}
                value={f.remarks}
                onChange={set('remarks')}
                placeholder="Additional information..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 8, flexWrap: 'wrap' }}>
              <div>
                {scrutiny.gstStateMatch && scrutiny.gstPanMatch ? (
                  <Badge variant="success">GST Scrutiny OK</Badge>
                ) : f.gstin ? (
                  <Badge variant="warning">Check GST/PAN</Badge>
                ) : null}
              </div>
              <div className="row align-center gap-1">
                <Button variant="outline" onClick={goBackToList}>Cancel</Button>
                <Button type="submit" iconRight={ArrowRight}>Next</Button>
              </div>
            </div>
          </form>
        )}

        {/* ───────── STEP 2 : DOCUMENTS + PHOTOS, then Submit ───────── */}
        {step === 2 && (
          <div>
            {liveMissing && (liveMissing.missingDocs.length > 0 || liveMissing.photosShort > 0) && (
              <div id="dr-docs-error" className="alert-banner error small mb-2" role="alert">
                <div className="row align-center gap-1">
                  <AlertCircle size={16} />
                  <b>Upload all required documents and at least 5 showroom photos before submitting.</b>
                </div>
                <ul style={{ margin: '6px 0 0 22px', padding: 0 }}>
                  {liveMissing.missingDocs.map((d) => (
                    <li key={d.key}>{d.label} is missing</li>
                  ))}
                  {liveMissing.photosShort > 0 && <li>Showroom Photographs: {liveMissing.photosShort} more photo(s) required (minimum 5)</li>}
                </ul>
              </div>
            )}

            <p className="muted small" style={{ marginTop: 0 }}>
              Upload the documents (PDF / JPG / PNG) and showroom photographs for <b>{f.name}</b>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
              {MANDATORY_DOC_DEFS.map((docDef) => {
                const uploadedUrl = docs[docDef.key];
                const isUploading = uploadingDocKey === docDef.key;
                const isMissing = Boolean(liveMissing && docDef.required && !uploadedUrl);
                return (
                  <div
                    key={docDef.key}
                    style={{
                      border: uploadedUrl ? '1px solid #86efac' : isMissing ? '1px solid #dc2626' : '1px dashed #cbd5e1',
                      background: uploadedUrl ? '#f0fdf4' : isMissing ? '#fef2f2' : '#fff',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="small font-semibold" style={{ fontSize: 13 }}>
                          {docDef.label} {docDef.required && <span className="text-danger">*</span>}
                        </div>
                        {uploadedUrl && (
                          <a href={fileSrc(uploadedUrl)} target="_blank" rel="noreferrer" className="micro text-brand row align-center gap-0-5" style={{ marginTop: 4 }}>
                            <FileText size={12} /> View uploaded document
                          </a>
                        )}
                      </div>
                      {uploadedUrl && <CheckCircle2 size={16} className="text-success" />}
                    </div>

                    <div>
                      <input
                        type="file"
                        id={`file-${docDef.key}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          handleFileUpload(docDef.key, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant={uploadedUrl ? 'outline' : 'primary'}
                        icon={Upload}
                        loading={isUploading}
                        onClick={() => document.getElementById(`file-${docDef.key}`)?.click()}
                      >
                        {uploadedUrl ? 'Replace' : 'Upload Document'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Showroom Photos (Doc #9: Minimum 5 Photos) */}
            <div style={{ marginTop: 18, border: liveMissing && liveMissing.photosShort > 0 ? '1px solid #dc2626' : '1px solid #e2e8f0', borderRadius: 8, padding: 14, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <div className="small font-semibold">9. Showroom Photographs (Minimum 5 Photos Required)</div>
                  <div className="micro muted">Upload front view, interior showroom, customer lounge, workshop, and board photographs.</div>
                </div>
                <Badge variant={showroomPhotos.length >= 5 ? 'success' : 'warning'}>{showroomPhotos.length}/5 Photos</Badge>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {showroomPhotos.map((url, idx) => (
                  <div key={url + idx} style={{ position: 'relative', width: 90, height: 70, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={fileSrc(url)} alt={`Showroom ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      style={{
                        position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                        borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                id="file-showroom-photos"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleShowroomPhotosUpload}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={Camera}
                loading={uploadingDocKey === 'showroomPhotos'}
                onClick={() => document.getElementById('file-showroom-photos')?.click()}
              >
                Add Showroom Photos
              </Button>
            </div>

            {/* footer: Back + Submit (Submit appears only on this step) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 8, flexWrap: 'wrap' }}>
              <div className="row align-center gap-2">
                <span className="micro muted">Docs: <b>{scrutiny.docCount}/12</b></span>
                <span className="micro muted">Photos: <b>{scrutiny.photosCount}/5</b></span>
              </div>
              <div className="row align-center gap-1">
                <Button variant="outline" icon={ArrowLeft} onClick={handleBack} disabled={submitting}>Back</Button>
                <Button onClick={submit} loading={submitting}>Submit to CSD HO</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
