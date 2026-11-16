import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useCreateDealerRequestMutation } from './dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

const EMPTY = { name: '', proposedCode: '', person: '', phone: '', email: '', gstin: '', address: '', city: '', state: '', pincode: '', remarks: '' };

export default function NewDealerRequestModal({ onClose, onCreated }) {
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiErr, setApiErr] = useState('');
  const [create, { isLoading }] = useCreateDealerRequestMutation();

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Dealer name is required';
    if (f.proposedCode && !/^[A-Za-z0-9_-]{2,40}$/.test(f.proposedCode.trim())) e.proposedCode = 'Only letters, digits, - and _';
    if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a valid 10 digit mobile number';
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email';
    if (!f.city.trim()) e.city = 'City is required';
    if (f.state.trim().length < 2) e.state = 'State is required';
    if (f.pincode && !/^\d{6}$/.test(f.pincode.trim())) e.pincode = 'Pincode must be 6 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiErr('');
    if (!validate()) return;
    // send only filled fields (backend rejects empty strings for typed fields)
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v !== ''));
    try {
      const res = await create(body).unwrap();
      onCreated?.(res);
      onClose();
    } catch (err) {
      setApiErr(getErrorMessage(err, 'Could not raise the request.'));
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New dealer request"
      subtitle="Admin → Depot → URC site verification → Admin creates the dealer"
      maxWidth="760px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="new-dealer-request-form" loading={isLoading}>Submit request</Button>
        </>
      }
    >
      <form id="new-dealer-request-form" onSubmit={submit} noValidate>
        {apiErr && (
          <div className="alert-banner error small mb-2 row align-center gap-1" role="alert"><AlertCircle size={16} /><span>{apiErr}</span></div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
          <Input id="dr-name" label="Dealership name" required value={f.name} onChange={set('name')} error={errors.name} />
          <Input id="dr-code" label="Proposed dealer code" value={f.proposedCode} onChange={set('proposedCode')} error={errors.proposedCode} helperText="Optional - admin can change it" />
          <Input id="dr-person" label="Contact person" value={f.person} onChange={set('person')} />
          <Input id="dr-phone" label="Mobile" required inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} error={errors.phone} />
          <Input id="dr-email" label="Email" type="email" value={f.email} onChange={set('email')} error={errors.email} />
          <Input id="dr-gstin" label="GSTIN" value={f.gstin} onChange={set('gstin')} />
          <Input id="dr-city" label="City" required value={f.city} onChange={set('city')} error={errors.city} />
          <Input id="dr-state" label="State" required value={f.state} onChange={set('state')} error={errors.state} placeholder="e.g. UTTAR PRADESH" />
          <Input id="dr-pin" label="Pincode" inputMode="numeric" maxLength={6} value={f.pincode} onChange={set('pincode')} error={errors.pincode} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Input id="dr-address" label="Full address of the showroom" value={f.address} onChange={set('address')} />
        </div>
        <div className="form-field" style={{ marginTop: 12 }}>
          <label htmlFor="dr-remarks" className="form-label">Remarks for admin</label>
          <textarea id="dr-remarks" className="form-control" rows={3} maxLength={1000} value={f.remarks} onChange={set('remarks')} />
        </div>
      </form>
    </Modal>
  );
}
