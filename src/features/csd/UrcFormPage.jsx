import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Warehouse,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Building,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetUrcsQuery,
  useGetUrcByIdQuery,
  useGetDepotsQuery,
  useCreateUrcMutation,
  useUpdateUrcMutation,
} from '../org/orgApi.js';

export default function UrcFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawUrc, isLoading: isLoadingUrc } = useGetUrcByIdQuery(id, { skip: !isEdit });
  const { data: urcsList } = useGetUrcsQuery({}, { skip: !isEdit || Boolean(rawUrc) });
  const { data: depots = [] } = useGetDepotsQuery({ active: true });

  const [createUrc, { isLoading: isCreating }] = useCreateUrcMutation();
  const [updateUrc, { isLoading: isUpdating }] = useUpdateUrcMutation();

  const urc = React.useMemo(() => {
    if (!isEdit) return null;
    if (rawUrc?.data) return rawUrc.data;
    if (rawUrc?._id || rawUrc?.id) return rawUrc;
    const list = Array.isArray(urcsList) ? urcsList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawUrc, urcsList, id]);

  const [formData, setFormData] = useState({
    depotId: '',
    name: '',
    code: '',
    person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    active: true,
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (urc) {
      setFormData({
        depotId: urc.depotId?._id || urc.depotId?.id || urc.depotId || '',
        name: urc.name || '',
        code: urc.code || '',
        person: urc.person || urc.contact?.person || '',
        email: urc.email || urc.contact?.email || '',
        phone: urc.phone || urc.contact?.phone || '',
        address: urc.address || urc.contact?.address || '',
        city: urc.city || '',
        state: urc.state || '',
        active: urc.active ?? true,
      });
    }
  }, [urc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('URC Canteen Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('URC Code is required.');
      return;
    }

    try {
      if (isEdit) {
        await updateUrc({
          id,
          ...formData,
          code: formData.code.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/urcs', {
          state: { toast: `✓ URC Canteen "${formData.name}" updated successfully.` },
        });
      } else {
        await createUrc({
          ...formData,
          code: formData.code.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/urcs', {
          state: { toast: `✓ URC Canteen "${formData.name}" registered successfully.` },
        });
      }
    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          err?.message ||
          'Failed to save URC record. Please verify URC code uniqueness.'
      );
    }
  };

  if (isEdit && isLoadingUrc) {
    return <LoadingState text="Loading URC Canteen profile details..." />;
  }

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit URC: ${formData.name || urc?.name || 'Loading...'}` : 'Register Unit Run Canteen (URC)'}
        subtitle="Regimental military canteens serving Armed Forces units and ESM defense beneficiaries"
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
            <p className="micro muted">Regimental canteen code and affiliated base depot attachment</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Affiliated Base Depot</label>
              <select
                value={formData.depotId}
                onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                className="form-control"
              >
                <option value="">-- Select Parent Base Depot --</option>
                {depots.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label required">URC Canteen Name</label>
              <input
                type="text"
                required
                placeholder="e.g. 505 ABW Canteen"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label required">URC Code</label>
              <input
                type="text"
                required
                placeholder="e.g. URC-505-01"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="form-control font-mono font-bold"
              />
            </div>
          </div>
        </Card>

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Mail size={18} className="text-brand" /> Canteen Officer / Nodal Contact
            </h3>
            <p className="micro muted">Canteen Officer / Subedar Major In-charge credentials</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Canteen Officer / OIC</label>
              <input
                type="text"
                placeholder="e.g. Major S. K. Singh"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Official Email</label>
              <input
                type="email"
                placeholder="urc.505@csd.gov.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Official Phone / Mil Ext</label>
              <input
                type="tel"
                placeholder="011-25698765"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-control"
              />
            </div>
          </div>
        </Card>

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <MapPin size={18} className="text-brand" /> Regimental Location & Station
            </h3>
            <p className="micro muted">Physical canteen premises in military garrison</p>
          </div>

          <div className="mb-3">
            <label className="form-label">Unit / Station Address</label>
            <input
              type="text"
              placeholder="Full unit garrison address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="grid-2-col gap-3">
            <div>
              <label className="form-label">Station / City</label>
              <input
                type="text"
                placeholder="e.g. Delhi Cantt"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">State / UT</label>
              <input
                type="text"
                placeholder="e.g. Delhi"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mt-4 p-3 bg-light rounded border">
            <input
              type="checkbox"
              id="urcActiveStatus"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="urcActiveStatus" className="form-label mb-0 cursor-pointer font-medium">
              Active Unit Run Canteen (Eligible for AFD indents and beneficiary verification)
            </label>
          </div>
        </Card>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/urcs')}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isCreating || isUpdating}
            className="d-flex align-items-center gap-2 px-4"
          >
            <Save size={16} />
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update URC Record' : 'Empanel URC'}
          </Button>
        </div>
      </form>
    </div>
  );
}
