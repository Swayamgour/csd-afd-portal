import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Warehouse, Save, AlertCircle, Mail, MapPin, Lock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetDepotsQuery,
  useGetDepotByIdQuery,
  useGetOrgMetaQuery,
  useCreateOrgAccountMutation,
  useUpdateDepotMutation,
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

const ROLE = 'DEPOT_OFFICIAL';

export default function DepotFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawDepot, isLoading: isLoadingDepot } = useGetDepotByIdQuery(id, { skip: !isEdit });
  const { data: depotsList } = useGetDepotsQuery({}, { skip: !isEdit || Boolean(rawDepot) });
  const { data: meta } = useGetOrgMetaQuery();

  const [createOrgAccount, { isLoading: isCreating }] = useCreateOrgAccountMutation();
  const [updateDepot, { isLoading: isUpdating }] = useUpdateDepotMutation();

  const depot = useMemo(() => {
    if (!isEdit) return null;
    if (rawDepot?.data) return rawDepot.data;
    if (rawDepot?._id || rawDepot?.id) return rawDepot;
    const list = Array.isArray(depotsList) ? depotsList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawDepot, depotsList, id]);

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
    if (!depot) return;
    setFormData({
      name: depot.name || '',
      code: depot.code || '',
      person: depot.person || depot.contact?.person || '',
      email: depot.email || depot.contact?.email || '',
      phone: depot.phone || depot.contact?.phone || '',
      address: depot.address || depot.contact?.address || '',
      city: depot.city || '',
      active: depot.active ?? true,
    });
    setLink((prev) => ({
      ...prev,
      state: normState(depot.state),
      priceZoneId: depot.priceZoneId?._id || depot.priceZoneId?.id || depot.priceZoneId || '',
      urcIds: (depot.urcIds || []).map((u) => String(u?._id || u?.id || u)),
    }));
  }, [depot]);

  const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) return setErrorMsg('Depot Name is required.');
    if (!formData.code.trim()) return setErrorMsg('Depot Code is required.');
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
        // single price zone in the state -> pick it automatically
        const zones = meta?.states?.find((s) => s.state === normState(link.state))?.priceZones || [];
        const priceZoneId = link.priceZoneId || (zones.length === 1 ? zones[0]._id : undefined);
        await updateDepot({ id, ...base, state: link.state, urcIds: link.urcIds || [], ...(priceZoneId ? { priceZoneId } : {}) }).unwrap();
        navigate('/csd/depots', { state: { toast: `✓ Depot "${base.name}" updated successfully.` } });
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
      navigate('/csd/depots', { state: { toast: `✓ Depot "${base.name}" registered with login "${login.username.trim()}".` } });
    } catch (err) {
      setErrorMsg(orgErrorMessage(err, 'Failed to save depot record.'));
    }
  };

  if (isEdit && isLoadingDepot) return <LoadingState text="Loading Depot details..." />;

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit Depot: ${formData.name || depot?.name || 'Loading...'}` : 'Register Depot'}
        subtitle="Depot, uska state aur depot official ka login ek saath"
        breadcrumbs={[
          { label: 'Catalog Master', href: '/csd/products' },
          { label: 'Depots Registry', href: '/csd/depots' },
          { label: isEdit ? 'Edit Depot' : 'Add New Depot' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/csd/depots')}>
            <ArrowLeft size={14} className="mr-xs" /> Back to Depots
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
              <Warehouse size={18} className="text-brand" /> Depot Identification & State
            </h3>
            <p className="micro muted">Depot name, code aur kis state ka depot hai</p>
          </div>
          <div className="grid-2-col gap-3 mb-3">
            <div>
              <label className="form-label required">Depot Name</label>
              <input className="form-control" required value={formData.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Kanpur Depot" />
            </div>
            <div>
              <label className="form-label required">Depot Code</label>
              <input
                className="form-control font-mono font-bold"
                required
                value={formData.code}
                onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                placeholder="e.g. DEP-KNP-001"
              />
            </div>
          </div>
          <OrgLinkFields role={ROLE} value={link} onChange={setLink} />
        </Card>

        {!isEdit && (
          <Card className="mb-3">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title d-flex align-items-center gap-2">
                <Lock size={18} className="text-brand" /> Depot Login Credentials
              </h3>
              <p className="micro muted">Is username/password se depot official login karega (role: Depot Official)</p>
            </div>
            <LoginFields value={login} onChange={setLogin} />
          </Card>
        )}

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Mail size={18} className="text-brand" /> Contact
            </h3>
          </div>
          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Contact Person</label>
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
              <MapPin size={18} className="text-brand" /> Address
            </h3>
          </div>
          <div className="grid-2-col gap-3">
            <div>
              <label className="form-label">City</label>
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
              id="depotActive"
              checked={formData.active}
              onChange={(e) => set({ active: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="depotActive" className="form-label mb-0 font-medium" style={{ cursor: 'pointer' }}>
              Active Depot
            </label>
          </div>
        </Card>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/depots')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isCreating || isUpdating} className="d-flex align-items-center gap-2 px-4">
            <Save size={16} />
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Depot' : 'Register Depot'}
          </Button>
        </div>
      </form>
    </div>
  );
}
