import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Save, AlertCircle, Mail, Lock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetOemsQuery,
  useGetOemByIdQuery,
  useUpdateOemMutation,
  useGetOrgMetaQuery,
  useCreateOrgAccountMutation,
} from '../org/orgApi.js';
import { LoginFields, emptyLogin, validateLogin, orgErrorMessage } from '../org/OrgLinkFields.jsx';

export default function OemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawOem, isLoading: isLoadingOem } = useGetOemByIdQuery(id, { skip: !isEdit });
  const { data: oemsList } = useGetOemsQuery({}, { skip: !isEdit || Boolean(rawOem) });
  const { data: meta } = useGetOrgMetaQuery();
  const categories = meta?.categories || [];

  const [createOrgAccount, { isLoading: isCreating }] = useCreateOrgAccountMutation();
  const [updateOem, { isLoading: isUpdating }] = useUpdateOemMutation();

  const oem = useMemo(() => {
    if (!isEdit) return null;
    if (rawOem?.data) return rawOem.data;
    if (rawOem?._id || rawOem?.id) return rawOem;
    const list = Array.isArray(oemsList) ? oemsList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawOem, oemsList, id]);

  const [formData, setFormData] = useState({ name: '', code: '', categoryId: '', person: '', email: '', phone: '' });
  const [login, setLogin] = useState(emptyLogin());
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!oem) return;
    setFormData({
      name: oem.name || '',
      code: oem.code || '',
      categoryId: String((oem.categoryIds || [])[0]?._id || (oem.categoryIds || [])[0] || ''),
      person: oem.person || oem.contactPerson?.name || (typeof oem.contactPerson === 'string' ? oem.contactPerson : '') || '',
      email: oem.email || oem.contactPerson?.email || '',
      phone: oem.phone || oem.contactPerson?.phone || '',
    });
  }, [oem]);

  const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) return setErrorMsg('OEM Enterprise Name is required.');
    if (!formData.code.trim()) return setErrorMsg('CSD OEM Code is required.');
    if (!formData.categoryId) return setErrorMsg('Please select the Category Type.');

    const base = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      person: formData.person.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateOem({ id, ...base, categoryIds: [formData.categoryId] }).unwrap();
        navigate('/csd/oems', { state: { toast: `✓ OEM "${base.name}" updated successfully.` } });
        return;
      }

      const loginErr = validateLogin(login);
      if (loginErr) return setErrorMsg(loginErr);

      await createOrgAccount({
        role: 'OEM',
        ...base,
        categoryId: formData.categoryId,
        username: login.username.trim(),
        password: login.password,
      }).unwrap();
      navigate('/csd/oems', { state: { toast: `✓ OEM "${base.name}" registered with login "${login.username.trim()}".` } });
    } catch (err) {
      setErrorMsg(orgErrorMessage(err, 'Failed to save OEM record. Please verify that the OEM code is unique and try again.'));
    }
  };

  if (isEdit && isLoadingOem) return <LoadingState text="Loading OEM profile details..." />;

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit OEM: ${formData.name || oem?.name || 'Loading...'}` : 'Register New Manufacturer (OEM)'}
        subtitle="OEM, uska category type aur OEM login ek saath"
        breadcrumbs={[
          { label: 'Catalog Master', href: '/csd/products' },
          { label: 'OEMs Registry', href: '/csd/oems' },
          { label: isEdit ? 'Edit OEM' : 'Add New OEM' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/csd/oems')}>
            <ArrowLeft size={14} className="mr-xs" /> Back to OEMs
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
              <Building2 size={18} className="text-brand" /> OEM Details
            </h3>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label required">OEM Enterprise Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maruti Suzuki India Ltd."
                value={formData.name}
                onChange={(e) => set({ name: e.target.value })}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label required">CSD OEM Code</label>
              <input
                type="text"
                required
                placeholder="e.g. MSIL"
                value={formData.code}
                onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                className="form-control font-mono font-bold"
              />
            </div>
            <div>
              <label className="form-label required">Category Type</label>
              <select className="form-control" required value={formData.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={String(c._id)} value={String(c._id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Mail size={18} className="text-brand" /> Contact
            </h3>
          </div>
          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Contact Person</label>
              <input type="text" value={formData.person} onChange={(e) => set({ person: e.target.value })} className="form-control" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={formData.email} onChange={(e) => set({ email: e.target.value })} className="form-control" />
            </div>
            <div>
              <label className="form-label">Mobile (10 digit)</label>
              <input type="tel" maxLength={10} value={formData.phone} onChange={(e) => set({ phone: e.target.value })} className="form-control" />
            </div>
          </div>
        </Card>

        {!isEdit && (
          <Card className="mb-3">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title d-flex align-items-center gap-2">
                <Lock size={18} className="text-brand" /> OEM Login Credentials
              </h3>
              <p className="micro muted">Is username/password se OEM login karega (role: OEM)</p>
            </div>
            <LoginFields value={login} onChange={setLogin} />
          </Card>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/oems')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isCreating || isUpdating} className="d-flex align-items-center gap-2 px-4">
            <Save size={16} />
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update OEM' : 'Register OEM'}
          </Button>
        </div>
      </form>
    </div>
  );
}
