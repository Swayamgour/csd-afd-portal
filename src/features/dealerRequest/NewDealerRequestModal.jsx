import React, { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Upload, FileText, Camera, ShieldCheck, X } from 'lucide-react';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Badge from '../../components/common/Badge.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { useCreateDealerRequestMutation, useUploadDealerRequestPhotosMutation } from '../../redux/api/dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { fileSrc } from './dealerRequestUtils.js';

const GST_STATE_CODES = [
  { code: '01', name: 'JAMMU AND KASHMIR' },
  { code: '02', name: 'HIMACHAL PRADESH' },
  { code: '03', name: 'PUNJAB' },
  { code: '04', name: 'CHANDIGARH' },
  { code: '05', name: 'UTTARAKHAND' },
  { code: '06', name: 'HARYANA' },
  { code: '07', name: 'DELHI' },
  { code: '08', name: 'RAJASTHAN' },
  { code: '09', name: 'UTTAR PRADESH' },
  { code: '10', name: 'BIHAR' },
  { code: '11', name: 'SIKKIM' },
  { code: '12', name: 'ARUNACHAL PRADESH' },
  { code: '13', name: 'NAGALAND' },
  { code: '14', name: 'MANIPUR' },
  { code: '15', name: 'MIZORAM' },
  { code: '16', name: 'TRIPURA' },
  { code: '17', name: 'MEGHALAYA' },
  { code: '18', name: 'ASSAM' },
  { code: '19', name: 'WEST BENGAL' },
  { code: '20', name: 'JHARKHAND' },
  { code: '21', name: 'ODISHA' },
  { code: '22', name: 'CHATTISGARH' },
  { code: '23', name: 'MADHYA PRADESH' },
  { code: '24', name: 'GUJARAT' },
  { code: '26', name: 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU' },
  { code: '27', name: 'MAHARASHTRA' },
  { code: '28', name: 'ANDHRA PRADESH' },
  { code: '29', name: 'KARNATAKA' },
  { code: '30', name: 'GOA' },
  { code: '31', name: 'LAKSHADWEEP' },
  { code: '32', name: 'KERALA' },
  { code: '33', name: 'TAMIL NADU' },
  { code: '34', name: 'PUDUCHERRY' },
  { code: '35', name: 'ANDAMAN AND NICOBAR ISLANDS' },
  { code: '36', name: 'TELANGANA' },
  { code: '37', name: 'ANDHRA PRADESH (NEW)' },
  { code: '38', name: 'LADAKH' },
];

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

const EMPTY = {
  name: '',
  proposedCode: '',
  dealershipType: '4W',
  person: '',
  phone: '',
  landline: '',
  email: '',
  gstin: '',
  panNumber: '',
  stateCode: '',
  state: '',
  district: '',
  city: '',
  pincode: '',
  address: '',
  remarks: '',
  indemnityBondSubmitted: false,
};

export default function NewDealerRequestModal({ onClose, onCreated }) {
  const [f, setF] = useState(EMPTY);
  const [docs, setDocs] = useState({});
  const [showroomPhotos, setShowroomPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');

  const [create, { isLoading: submitting }] = useCreateDealerRequestMutation();
  const [uploadFile] = useUploadDealerRequestPhotosMutation();

  const set = (k) => (e) => {
    let val = e?.target?.type === 'checkbox' ? e.target.checked : e?.target?.value ?? e;

    // Strict input sanitization based on field type
    if (typeof val === 'string') {
      if (k === 'phone') {
        // Only allow numeric digits, max 10
        val = val.replace(/\D/g, '').slice(0, 10);
      } else if (k === 'pincode') {
        // Only allow numeric digits, max 6
        val = val.replace(/\D/g, '').slice(0, 6);
      } else if (k === 'landline') {
        // Digits, spaces, hyphens, max 15
        val = val.replace(/[^\d\s-]/g, '').slice(0, 15);
      } else if (k === 'person') {
        // Letters, spaces, dots, hyphens, apostrophes only (cannot type numbers)
        val = val.replace(/[^a-zA-Z\s.'-]/g, '').slice(0, 80);
      } else if (k === 'gstin') {
        // Alphanumeric uppercase only, max 15
        val = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
      } else if (k === 'panNumber') {
        // Alphanumeric uppercase only, max 10
        val = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
      } else if (k === 'proposedCode') {
        // Letters, numbers, hyphens, underscores, max 30
        val = val.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase().slice(0, 30);
      } else if (k === 'city' || k === 'district') {
        // Letters, spaces, hyphens, dots
        val = val.replace(/[^a-zA-Z\s.-]/g, '').slice(0, 80);
      }
    }

    // Clear error for field k as user updates it
    if (errors[k]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }

    setF((prev) => {
      const next = { ...prev, [k]: val };

      // Auto-populate PAN and State Code from GSTIN (if 15 or partial GSTIN)
      if (k === 'gstin' && typeof val === 'string') {
        const cleanGst = val.trim().toUpperCase();
        if (cleanGst.length >= 2) {
          const prefix = cleanGst.substring(0, 2);
          const matchState = GST_STATE_CODES.find((s) => s.code === prefix);
          if (matchState) {
            next.stateCode = prefix;
            next.state = matchState.name;
          }
        }
        if (cleanGst.length >= 12) {
          next.panNumber = cleanGst.substring(2, 12);
        }
      }

      // Auto-populate State name when State Code is selected
      if (k === 'stateCode' && typeof val === 'string') {
        const matchState = GST_STATE_CODES.find((s) => s.code === val);
        if (matchState) next.state = matchState.name;
      }

      return next;
    });
  };

  // Scrutiny Real-time Checks (Section B6)
  const scrutiny = useMemo(() => {
    const gstin = (f.gstin || '').trim().toUpperCase();
    const pan = (f.panNumber || '').trim().toUpperCase();
    const stateCode = (f.stateCode || '').trim().padStart(2, '0');

    const gstStateMatch = Boolean(gstin.length >= 2 && stateCode && gstin.startsWith(stateCode));
    const gstPanMatch = Boolean(gstin.length >= 12 && pan && gstin.substring(2, 12) === pan);
    const mobileValid = /^[6-9]\d{9}$/.test((f.phone || '').trim());
    const emailValid = !f.email || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(f.email.trim());

    let docCount = Object.keys(docs).filter((k) => docs[k] && k !== 'indemnityBond').length;
    if (showroomPhotos.length >= 5) docCount += 1;

    return {
      gstStateMatch,
      gstPanMatch,
      mobileValid,
      emailValid,
      docCount,
      allDocs: docCount === 12,
      photosCount: showroomPhotos.length,
      photosAdequate: showroomPhotos.length >= 5,
    };
  }, [f.gstin, f.panNumber, f.stateCode, f.phone, f.email, docs, showroomPhotos]);

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    setUploadingDocKey(key);
    setApiErr('');
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await uploadFile(fd).unwrap();
      const uploadedUrl = Array.isArray(res) ? res[0]?.url : res?.files?.[0]?.url;
      if (uploadedUrl) {
        setDocs((prev) => ({ ...prev, [key]: uploadedUrl }));
      }
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
    }
  };

  const removePhoto = (idx) => {
    setShowroomPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e = {};

    // 1. Proposed Dealer Name
    const trimmedName = (f.name || '').trim();
    if (!trimmedName) {
      e.name = 'Proposed Dealer Name is required';
    } else if (trimmedName.length < 3) {
      e.name = 'Dealer Name must be at least 3 characters';
    }

    // 2. Proposed Dealer Code (Optional, but if given must match format)
    if (f.proposedCode) {
      const trimmedCode = f.proposedCode.trim();
      if (!/^[A-Za-z0-9_-]{2,30}$/.test(trimmedCode)) {
        e.proposedCode = 'Only letters, digits, - and _ allowed (2-30 chars)';
      }
    }

    // 3. Contact Person / Proprietor
    const trimmedPerson = (f.person || '').trim();
    if (!trimmedPerson) {
      e.person = 'Contact Person / Proprietor name is required';
    } else if (trimmedPerson.length < 2) {
      e.person = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedPerson)) {
      e.person = 'Contact person name must contain letters only';
    }

    // 4. Mobile Number (Strict 10 numeric digits starting with 6-9)
    const trimmedPhone = (f.phone || '').trim();
    if (!trimmedPhone) {
      e.phone = '10-digit Mobile Number is required';
    } else if (trimmedPhone.length !== 10) {
      e.phone = 'Mobile Number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      e.phone = 'Invalid mobile number. Must start with 6, 7, 8, or 9';
    }

    // 5. Landline / Alt Phone (Optional)
    if (f.landline && f.landline.trim()) {
      const digitsOnly = f.landline.replace(/\D/g, '');
      if (digitsOnly.length < 6 || digitsOnly.length > 12) {
        e.landline = 'Landline / Alt Phone must contain 6 to 12 digits';
      }
    }

    // 6. Email Address
    const trimmedEmail = (f.email || '').trim();
    if (!trimmedEmail) {
      e.email = 'Email Address is required for official CSD notifications';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)) {
      e.email = 'Enter a valid email address (e.g. dealer@company.com)';
    }

    // 7. GSTIN (15 Digits Alphanumeric)
    const cleanGst = (f.gstin || '').trim().toUpperCase();
    if (!cleanGst) {
      e.gstin = 'GSTIN is required for dealer registration';
    } else if (cleanGst.length !== 15) {
      e.gstin = 'GSTIN must be exactly 15 characters';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst)) {
      e.gstin = 'Invalid GSTIN format (e.g. 09AAACH2234P1Z2)';
    } else {
      // Scrutiny checks against state code & PAN
      if (f.stateCode && !cleanGst.startsWith(f.stateCode)) {
        e.gstin = `GSTIN state code prefix (${cleanGst.substring(0, 2)}) does not match State Code (${f.stateCode})`;
      } else if (f.panNumber && cleanGst.substring(2, 12) !== f.panNumber.trim().toUpperCase()) {
        e.gstin = 'GSTIN PAN segment does not match entered PAN Number';
      }
    }

    // 8. PAN Number (10 Digits Alphanumeric)
    const cleanPan = (f.panNumber || '').trim().toUpperCase();
    if (!cleanPan) {
      e.panNumber = 'PAN Number is required';
    } else if (cleanPan.length !== 10) {
      e.panNumber = 'PAN Number must be exactly 10 characters';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      e.panNumber = 'Invalid PAN format (e.g. AAACH2234P)';
    }

    // 9. State Code
    if (!f.stateCode) {
      e.stateCode = 'State Code is required';
    }

    // 10. State
    if (!f.state || !f.state.trim()) {
      e.state = 'State is required';
    }

    // 11. City
    if (!f.city || !f.city.trim()) {
      e.city = 'City is required';
    } else if (f.city.trim().length < 2) {
      e.city = 'City must be at least 2 characters';
    }

    // 12. Pincode (6 Numeric Digits, not starting with 0)
    const trimmedPin = (f.pincode || '').trim();
    if (!trimmedPin) {
      e.pincode = 'Pincode is required';
    } else if (trimmedPin.length !== 6) {
      e.pincode = 'Pincode must be exactly 6 digits';
    } else if (!/^[1-9][0-9]{5}$/.test(trimmedPin)) {
      e.pincode = 'Invalid 6-digit Pincode (cannot start with 0)';
    }

    // 13. Full Address
    const trimmedAddr = (f.address || '').trim();
    if (!trimmedAddr) {
      e.address = 'Full showroom / dealership address is required';
    } else if (trimmedAddr.length < 5) {
      e.address = 'Address must be at least 5 characters';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiErr('');
    if (!validate()) {
      setActiveTab('details');
      setTimeout(() => {
        const errorFieldKeys = [
          'name',
          'proposedCode',
          'dealershipType',
          'person',
          'phone',
          'landline',
          'email',
          'gstin',
          'panNumber',
          'stateCode',
          'state',
          'district',
          'city',
          'pincode',
          'address',
        ];
        for (const k of errorFieldKeys) {
          const el = document.getElementById(`dr-${k}`);
          if (el && (el.getAttribute('aria-invalid') === 'true' || el.classList.contains('has-error'))) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
            break;
          }
        }
      }, 50);
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
      documents: {
        ...docs,
        showroomPhotos,
      },
    };

    try {
      const res = await create(payload).unwrap();
      onCreated?.(res);
      onClose();
    } catch (err) {
      setApiErr(getErrorMessage(err, 'Failed to raise dealer request.'));
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New Dealer Appointment Request"
      // subtitle="CSD Letter 902 (12 Documents & Scrutiny) + Letter 201 (Depot Verification)"
      maxWidth="860px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="row align-center gap-2">
            <span className="micro muted">
              Docs: <b>{scrutiny.docCount}/12</b>
            </span>
            <span className="micro muted">
              Photos: <b>{scrutiny.photosCount}/5</b>
            </span>
            {scrutiny.gstStateMatch && scrutiny.gstPanMatch ? (
              <Badge variant="success">GST Scrutiny OK</Badge>
            ) : f.gstin ? (
              <Badge variant="warning">Check GST/PAN</Badge>
            ) : null}
          </div>
          <div className="row align-center gap-1">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="new-dealer-request-form" loading={submitting}>
              Submit to CSD HO
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Tabs
          tabs={[
            { id: 'details', label: '1. Dealership Details (17 Columns)' },
            { id: 'documents', label: `2. Mandatory Documents (${scrutiny.docCount}/12 Uploaded)` },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <form id="new-dealer-request-form" onSubmit={submit} noValidate>
        {apiErr && (
          <div className="alert-banner error small mb-2 row align-center gap-1" role="alert">
            <AlertCircle size={16} />
            <span>{apiErr}</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="alert-banner error small mb-2 row align-center gap-1" role="alert">
            <AlertCircle size={16} />
            <span>Please correct the {Object.keys(errors).length} highlighted field error(s) below before submitting.</span>
          </div>
        )}

        {/* TAB 1: DEALERSHIP DETAILS */}
        {activeTab === 'details' && (
          <div>
            {/* Live Scrutiny Banner */}
           

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <Input
                id="dr-name"
                label="Proposed Dealer Name"
                required
                value={f.name}
                onChange={set('name')}
                error={errors.name}
                placeholder="e.g. Supreme Automobiles Pvt Ltd"
                maxLength={120}
              />

              <Input
                id="dr-proposedCode"
                label="Proposed Dealer Code"
                value={f.proposedCode}
                onChange={set('proposedCode')}
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
                options={[
                  { value: '4W', label: 'Four Wheeler (4W)' },
                  { value: '2W', label: 'Two Wheeler (2W)' },
                  { value: 'WHITE_GOODS', label: 'Appliances / White Goods' },
                  { value: 'COMMERCIAL', label: 'Commercial Vehicle' },
                ]}
              />

              <Input
                id="dr-person"
                label="Contact Person / Proprietor"
                required
                value={f.person}
                onChange={set('person')}
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
                error={errors.phone}
                placeholder="e.g. 9876543210 (10 digits)"
                helperText="Strict 10-digit numeric mobile (6-9)"
              />

              <Input
                id="dr-landline"
                label="Landline / Alt Phone"
                value={f.landline}
                onChange={set('landline')}
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
                error={errors.gstin}
                placeholder="e.g. 06AAACH2234P1Z2"
                helperText={
                  scrutiny.gstStateMatch && scrutiny.gstPanMatch
                    ? '✓ State code and PAN match GSTIN'
                    : 'Auto-populates State Code and PAN'
                }
              />

              <Input
                id="dr-panNumber"
                label="PAN Number (10 Digits)"
                required
                maxLength={10}
                value={f.panNumber}
                onChange={set('panNumber')}
                error={errors.panNumber}
                placeholder="e.g. AAACH2234P"
                helperText="Chars 3-12 of GSTIN"
              />

              <Select
                id="dr-stateCode"
                label="State Code (2 Digits)"
                required
                value={f.stateCode}
                onChange={set('stateCode')}
                error={errors.stateCode}
                options={GST_STATE_CODES.map((s) => ({ value: s.code, label: `${s.code} - ${s.name}` }))}
                placeholder="Select State Code"
              />

              <Input
                id="dr-state"
                label="State"
                required
                value={f.state}
                onChange={set('state')}
                error={errors.state}
                placeholder="e.g. HARYANA"
              />

              <Input
                id="dr-district"
                label="District"
                value={f.district}
                onChange={set('district')}
                error={errors.district}
                placeholder="e.g. Hisar"
              />

              <Input
                id="dr-city"
                label="City"
                required
                value={f.city}
                onChange={set('city')}
                error={errors.city}
                placeholder="e.g. Hisar"
              />

              <Input
                id="dr-pincode"
                label="Pincode"
                required
                inputMode="numeric"
                maxLength={6}
                value={f.pincode}
                onChange={set('pincode')}
                error={errors.pincode}
                placeholder="e.g. 125001"
                helperText="6-digit numeric PIN code"
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <Input
                id="dr-address"
                label="Full Dealership / Showroom Address"
                required
                value={f.address}
                onChange={set('address')}
                error={errors.address}
                placeholder="e.g. Plot No. 4-5, Auto Market, Delhi Road"
                maxLength={250}
              />
            </div>

           

            <div className="form-field" style={{ marginTop: 12 }}>
              <label htmlFor="dr-remarks" className="form-label">
                Remarks for CSD HO
              </label>
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
          </div>
        )}

        {/* TAB 2: 12 MANDATORY DOCUMENTS CHECKLIST */}
        {activeTab === 'documents' && (
          <div>
           

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12 }}>
              {MANDATORY_DOC_DEFS.map((docDef) => {
                const uploadedUrl = docs[docDef.key];
                const isUploading = uploadingDocKey === docDef.key;
                return (
                  <div
                    key={docDef.key}
                    style={{
                      border: uploadedUrl ? '1px solid #86efac' : '1px dashed #cbd5e1',
                      background: uploadedUrl ? '#f0fdf4' : '#fff',
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
                        onChange={(e) => handleFileUpload(docDef.key, e.target.files?.[0])}
                      />
                      <Button
                        type="button"
                        size="xs"
                        variant={uploadedUrl ? 'outline' : 'default'}
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
            <div style={{ marginTop: 18, border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div className="small font-semibold">9. Showroom Photographs (Minimum 5 Photos Required)</div>
                  <div className="micro muted">Upload front view, interior showroom, customer lounge, workshop, and board photographs.</div>
                </div>
                <Badge variant={showroomPhotos.length >= 5 ? 'success' : 'warning'}>
                  {showroomPhotos.length}/5 Photos
                </Badge>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {showroomPhotos.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 90, height: 70, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={fileSrc(url)} alt={`Showroom ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
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
          </div>
        )}
      </form>
    </Modal>
  );
}
