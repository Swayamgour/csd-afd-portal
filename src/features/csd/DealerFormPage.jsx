import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Save, AlertCircle, Lock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetOrgDealerQuery,
  useCreateOrgAccountMutation,
  useUpdateDealerAccountMutation,
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

const ROLE = 'DEALER';
const idOf = (x) => String(x?._id || x?.id || x || '');

export default function DealerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: dealer, isLoading: isLoadingDealer } = useGetOrgDealerQuery(id, { skip: !isEdit });

  const [createOrgAccount, { isLoading: isCreating }] = useCreateOrgAccountMutation();
  const [updateDealerAccount, { isLoading: isUpdating }] = useUpdateDealerAccountMutation();

  const [formData, setFormData] = useState({ name: '', code: '' });
  const [link, setLink] = useState(emptyOrgLink());
  const [login, setLogin] = useState(emptyLogin());
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!dealer) return;
    const depot = (dealer.depots || [])[0];
    setFormData({ name: dealer.name || '', code: dealer.code || '' });
    setLink({
      ...emptyOrgLink(),
      oemId: idOf(dealer.oemId),
      depotId: idOf(depot),
      state: normState(depot?.state || dealer.state),
    });
  }, [dealer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) return setErrorMsg('Dealership Name is required.');
    if (!formData.code.trim()) return setErrorMsg('Dealer Code is required.');
    const linkErr = validateOrgLink(ROLE, link);
    if (linkErr) return setErrorMsg(linkErr);

    const base = { name: formData.name.trim(), code: formData.code.trim().toUpperCase() };

    try {
      if (isEdit) {
        await updateDealerAccount({ id, ...base, ...orgLinkPayload(ROLE, link) }).unwrap();
        navigate('/csd/dealers', { state: { toast: `✓ Dealership "${base.name}" updated successfully.` } });
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
      navigate('/csd/dealers', { state: { toast: `✓ Dealership "${base.name}" registered with login "${login.username.trim()}".` } });
    } catch (err) {
      setErrorMsg(orgErrorMessage(err, 'Failed to save Dealership record.'));
    }
  };

  if (isEdit && isLoadingDealer) return <LoadingState text="Loading Dealership profile details..." />;

  const saving = isCreating || isUpdating;

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit Dealership: ${formData.name || dealer?.name || 'Loading...'}` : 'Register Authorized Dealership'}
        subtitle="Dealer kis OEM ka hai aur kis depot ke andar aata hai"
        breadcrumbs={[
          { label: 'Catalog Master', href: '/csd/products' },
          { label: 'Dealer Network', href: '/csd/dealers' },
          { label: isEdit ? 'Edit Dealer' : 'Add New Dealer' },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/csd/dealers')}>
            <ArrowLeft size={14} className="mr-xs" /> Back to Dealers
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
              <Store size={18} className="text-brand" /> Dealer Details
            </h3>
          </div>
          <div className="grid-2-col gap-3 mb-3">
            <div>
              <label className="form-label required">Dealership Name</label>
              <input className="form-control" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="form-label required">Dealer Code</label>
              <input
                className="form-control font-mono font-bold"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DLR-KNP-001"
              />
            </div>
          </div>
          <OrgLinkFields role={ROLE} value={link} onChange={setLink} />
        </Card>

        {!isEdit && (
          <Card className="mb-3">
            <div className="card-header border-bottom pb-2 mb-3">
              <h3 className="card-title d-flex align-items-center gap-2">
                <Lock size={18} className="text-brand" /> Dealer Login Credentials
              </h3>
              <p className="micro muted">Is username/password se dealer login karega (role: Dealer)</p>
            </div>
            <LoginFields value={login} onChange={setLogin} />
          </Card>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/dealers')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="d-flex align-items-center gap-2 px-4">
            <Save size={16} />
            {saving ? 'Saving...' : isEdit ? 'Update Dealer' : 'Register Dealer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
