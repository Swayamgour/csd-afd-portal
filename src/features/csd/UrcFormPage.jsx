import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Save, AlertCircle, Mail, MapPin, Lock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetUrcsQuery,
  useGetUrcByIdQuery,
  useCreateOrgAccountMutation,
  useUpdateUrcMutation,
} from '../org/orgApi.js';
import OrgLinkFields, {
  normState,
  emptyOrgLink,
  emptyLogin,
  validateOrgLink,
  validateLogin,
  orgLinkPayload,
  orgErrorMessage,
  LoginFields,
} from '../org/OrgLinkFields.jsx';

const ROLE = 'URC';

export default function UrcFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawUrc, isLoading: isLoadingUrc } = useGetUrcByIdQuery(id, { skip: !isEdit });
  const { data: urcsList } = useGetUrcsQuery({}, { skip: !isEdit || Boolean(rawUrc) });

  const [createOrgAccount, { isLoading: isCreating }] = useCreateOrgAccountMutation();
  const [updateUrc, { isLoading: isUpdating }] = useUpdateUrcMutation();

  const urc = useMemo(() => {
    if (!isEdit) return null;
    if (rawUrc?.data) return rawUrc.data;
    if (rawUrc?._id || rawUrc?.id) return rawUrc;
    const list = Array.isArray(urcsList) ? urcsList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawUrc, urcsList, id]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    active: true,
  });
  const [link, setLink] = useState(emptyOrgLink());
  const [login, setLogin] = useState(emptyLogin());
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!urc) return;
    setFormData({
      name: urc.name || '',
      code: urc.code || '',
      person: urc.person || urc.contact?.person || '',
      email: urc.email || urc.contact?.email || '',
      phone: urc.phone || urc.contact?.phone || '',
      address: urc.address || urc.contact?.address || '',
      city: urc.city || '',
      active: urc.active ?? true,
    });
    setLink((prev) => ({
      ...prev,
      state: normState(urc.state),
      depotId: urc.depotId?._id || urc.depotId?.id || urc.depotId || '',
    }));
  }, [urc]);

  const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) return setErrorMsg('URC Canteen Name is required.');
    if (!formData.code.trim()) return setErrorMsg('URC Code is required.');
    const linkErr = validateOrgLink(ROLE, link);
    if (linkErr) return setErrorMsg(linkErr);

    const base = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      person: formData.person.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      active: formData.active,
    };

    try {
      if (isEdit) {
        await updateUrc({ id, ...base, depotId: link.depotId }).unwrap();
        navigate('/csd/urcs', { state: { toast: `✓ URC Canteen "${base.name}" updated successfully.` } });
        return;
      }

      const loginErr = validateLogin(login);
      if (loginErr) return setErrorMsg(loginErr);

      await createOrgAccount({
        role: ROLE,
        ...base,
        username: login.username.trim(),
        password: login.password,
        ...orgLinkPayload(ROLE, link),
      }).unwrap();
      navigate('/csd/urcs', { state: { toast: `✓ URC "${base.name}" registered with login "${login.username.trim()}".` } });
    } catch (err) {
      setErrorMsg(orgErrorMessage(err, 'Failed to save URC record.'));
    }
  };

  if (isEdit && isLoadingUrc) return <LoadingState text="Loading URC Canteen profile details..." />;

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit URC: ${formData.name || urc?.name || 'Loading...'}` : 'Register Unit Run Canteen (URC)'}
        subtitle="URC, uska parent depot aur URC login ek saath"
        breadcrumbs={[
          { label: 'Catalog Master', href: '/csd/products' },
          { label: 'URCs Registry', href: '/csd/urcs' },
          { label: isEdit ? 'Edit URC' : 'Add New URC' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/csd/urcs')}>
            <ArrowLeft size={14} className="mr-xs" /> Back to URCs
          </Button>
        }
      />

      {errorMsg && (
        <div className="alert alert-danger mb-3 d-flex align-items-center gap-2">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Shield size={18} className="text-brand" /> Canteen Identification & Parent Depot
            </h3>
            <p className="micro muted">State select karke us state ke depot me se parent depot chuno</p>
          </div>
          <div className="grid-2-col gap-3 mb-3">
            <div>
              <label className="form-label required">URC Canteen Name</label>
              <input className="form-control" required value={formData.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Kanpur URC 01" />
            </div>
            <div>
              <label className="form-label required">URC Code</label>
              <input
                className="form-control font-mono font-bold"
                required
                value={formData.code}
                onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                placeholder="e.g. URC-KNP-001"
              />
            </div>
          </div>
          <OrgLinkFields role={ROLE} value={link} onChange={setLink} />
        </Card>

        {!isEdit && (
          <Card className="mb-3">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title d-flex align-items-center gap-2">
                <Lock size={18} className="text-brand" /> URC Login Credentials
              </h3>
              <p className="micro muted">Is username/password se URC login karega (role: URC)</p>
            </div>
            <LoginFields value={login} onChange={setLogin} />
          </Card>
        )}

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Mail size={18} className="text-brand" /> Canteen Officer / Nodal Contact
            </h3>
          </div>
          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Canteen Officer / OIC</label>
              <input className="form-control" value={formData.person} onChange={(e) => set({ person: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Official Email</label>
              <input type="email" className="form-control" value={formData.email} onChange={(e) => set({ email: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Phone (10 digit)</label>
              <input type="tel" maxLength={10} className="form-control" value={formData.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <MapPin size={18} className="text-brand" /> Location
            </h3>
          </div>
          <div className="grid-2-col gap-3">
            <div>
              <label className="form-label">Station / City</label>
              <input className="form-control" value={formData.city} onChange={(e) => set({ city: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Address</label>
              <input className="form-control" value={formData.address} onChange={(e) => set({ address: e.target.value })} />
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 mt-4 p-3 bg-light rounded border">
            <input
              type="checkbox"
              id="urcActiveStatus"
              checked={formData.active}
              onChange={(e) => set({ active: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="urcActiveStatus" className="form-label mb-0 font-medium" style={{ cursor: 'pointer' }}>
              Active Unit Run Canteen
            </label>
          </div>
        </Card>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/urcs')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isCreating || isUpdating} className="d-flex align-items-center gap-2 px-4">
            <Save size={16} />
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update URC Record' : 'Register URC'}
          </Button>
        </div>
      </form>
    </div>
  );
}
