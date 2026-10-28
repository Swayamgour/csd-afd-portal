import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Warehouse,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetDepotsQuery,
  useGetDepotByIdQuery,
  useGetPriceZonesQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
} from '../org/orgApi.js';

export default function DepotFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawDepot, isLoading: isLoadingDepot } = useGetDepotByIdQuery(id, { skip: !isEdit });
  const { data: depotsList } = useGetDepotsQuery({}, { skip: !isEdit || Boolean(rawDepot) });
  const { data: priceZones = [] } = useGetPriceZonesQuery({ active: true });

  const [createDepot, { isLoading: isCreating }] = useCreateDepotMutation();
  const [updateDepot, { isLoading: isUpdating }] = useUpdateDepotMutation();

  const depot = React.useMemo(() => {
    if (!isEdit) return null;
    if (rawDepot?.data) return rawDepot.data;
    if (rawDepot?._id || rawDepot?.id) return rawDepot;
    const list = Array.isArray(depotsList) ? depotsList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawDepot, depotsList, id]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    priceZoneId: '',
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
    if (depot) {
      setFormData({
        name: depot.name || '',
        code: depot.code || '',
        priceZoneId: depot.priceZoneId?._id || depot.priceZoneId?.id || depot.priceZoneId || '',
        person: depot.person || depot.contact?.person || '',
        email: depot.email || depot.contact?.email || '',
        phone: depot.phone || depot.contact?.phone || '',
        address: depot.address || depot.contact?.address || '',
        city: depot.city || '',
        state: depot.state || '',
        active: depot.active ?? true,
      });
    }
  }, [depot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Depot Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('Depot Code is required.');
      return;
    }

    try {
      if (isEdit) {
        await updateDepot({
          id,
          ...formData,
          code: formData.code.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/depots', {
          state: { toast: `✓ CSD Depot "${formData.name}" updated successfully.` },
        });
      } else {
        await createDepot({
          ...formData,
          code: formData.code.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/depots', {
          state: { toast: `✓ CSD Depot "${formData.name}" registered successfully.` },
        });
      }
    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          err?.message ||
          'Failed to save Depot record. Please verify depot code uniqueness.'
      );
    }
  };

  if (isEdit && isLoadingDepot) {
    return <LoadingState text="Loading CSD Depot profile details..." />;
  }

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit Depot: ${formData.name || depot?.name || 'Loading...'}` : 'Register New CSD Base Depot'}
        subtitle="Regional nodal depot coordinating stock distribution, demand verification, and dealer supplies"
        breadcrumbs={[
          { label: 'Catalog Master', href: '/csd/products' },
          { label: 'Base Depots', href: '/csd/depots' },
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
              <Warehouse size={18} className="text-brand" /> Depot Identification & Price Zone
            </h3>
            <p className="micro muted">Military station base depot nomenclature and assigned pricing cluster</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label required">Depot Name</label>
              <input
                type="text"
                required
                placeholder="e.g. CSD Depot Delhi Cantt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label required">Depot Code</label>
              <input
                type="text"
                required
                placeholder="e.g. DEP-DEL-01"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="form-control font-mono font-bold"
              />
            </div>

            <div>
              <label className="form-label">Price Zone Mapping</label>
              <select
                value={formData.priceZoneId}
                onChange={(e) => setFormData({ ...formData, priceZoneId: e.target.value })}
                className="form-control"
              >
                <option value="">-- National Default Zone --</option>
                {priceZones.map((z) => (
                  <option key={z._id || z.id} value={z._id || z.id}>
                    {z.name} ({z.code || 'ZONE'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Mail size={18} className="text-brand" /> Depot Command Officer
            </h3>
            <p className="micro muted">Depot Manager / Commanding Officer details</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Commanding Officer / In-charge</label>
              <input
                type="text"
                placeholder="e.g. Col. A. K. Sharma"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Official Army Email</label>
              <input
                type="email"
                placeholder="depot.delhi@csd.gov.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Official Phone / Mil Exchange</label>
              <input
                type="tel"
                placeholder="011-25691234"
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
              <MapPin size={18} className="text-brand" /> Depot Premises & Military Station
            </h3>
            <p className="micro muted">Physical garrison location and jurisdictional state</p>
          </div>

          <div className="mb-3">
            <label className="form-label">Garrison Address</label>
            <input
              type="text"
              placeholder="Full military base address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="grid-2-col gap-3">
            <div>
              <label className="form-label">Military Station / City</label>
              <input
                type="text"
                placeholder="e.g. New Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">State / Command Territory</label>
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
              id="depotActiveStatus"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="depotActiveStatus" className="form-label mb-0 cursor-pointer font-medium">
              Active Regional Depot (Authorizes URCs affiliation and demand approvals)
            </label>
          </div>
        </Card>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/depots')}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isCreating || isUpdating}
            className="d-flex align-items-center gap-2 px-4"
          >
            <Save size={16} />
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Depot Record' : 'Empanel Depot'}
          </Button>
        </div>
      </form>
    </div>
  );
}
