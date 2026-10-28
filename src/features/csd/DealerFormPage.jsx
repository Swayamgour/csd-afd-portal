import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Store,
  Building2,
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
  useGetDealersQuery,
  useGetDealerByIdQuery,
  useGetOemsQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
} from '../org/orgApi.js';

export default function DealerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawDealer, isLoading: isLoadingDealer } = useGetDealerByIdQuery(id, { skip: !isEdit });
  const { data: dealersList } = useGetDealersQuery({}, { skip: !isEdit || Boolean(rawDealer) });
  const { data: oems = [] } = useGetOemsQuery({ active: true });

  const [createDealer, { isLoading: isCreating }] = useCreateDealerMutation();
  const [updateDealer, { isLoading: isUpdating }] = useUpdateDealerMutation();

  const dealer = React.useMemo(() => {
    if (!isEdit) return null;
    if (rawDealer?.data) return rawDealer.data;
    if (rawDealer?._id || rawDealer?.id) return rawDealer;
    const list = Array.isArray(dealersList) ? dealersList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawDealer, dealersList, id]);

  const [formData, setFormData] = useState({
    oemId: '',
    name: '',
    code: '',
    person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    active: true,
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (dealer) {
      setFormData({
        oemId: dealer.oemId?._id || dealer.oemId?.id || dealer.oemId || '',
        name: dealer.name || '',
        code: dealer.code || '',
        person: dealer.person || dealer.contact?.person || '',
        email: dealer.email || dealer.contact?.email || '',
        phone: dealer.phone || dealer.contact?.phone || '',
        address: dealer.address || dealer.contact?.address || '',
        city: dealer.city || '',
        state: dealer.state || '',
        pincode: dealer.pincode || '',
        gstin: dealer.gstin || '',
        active: dealer.active ?? true,
      });
    }
  }, [dealer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Dealership Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('Dealer Code is required.');
      return;
    }
    if (!formData.oemId) {
      setErrorMsg('Please select an affiliated OEM manufacturer.');
      return;
    }

    try {
      if (isEdit) {
        await updateDealer({
          id,
          ...formData,
          code: formData.code.trim().toUpperCase(),
          gstin: formData.gstin.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/dealers', {
          state: { toast: `✓ Dealership "${formData.name}" updated successfully.` },
        });
      } else {
        await createDealer({
          ...formData,
          code: formData.code.trim().toUpperCase(),
          gstin: formData.gstin.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/dealers', {
          state: { toast: `✓ Dealership "${formData.name}" registered successfully.` },
        });
      }
    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          err?.message ||
          'Failed to save Dealership record. Please verify dealer code uniqueness.'
      );
    }
  };

  if (isEdit && isLoadingDealer) {
    return <LoadingState text="Loading Dealership profile details..." />;
  }

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit Dealership: ${formData.name || dealer?.name || 'Loading...'}` : 'Register Authorized Dealership'}
        subtitle="Empanel delivery showroom network mapped to authorized OEM manufacturers"
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
              <Store size={18} className="text-brand" /> Dealership Identification
            </h3>
            <p className="micro muted">Affiliated manufacturer, legal trade name, and unique dealer code</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label required">Affiliated OEM Manufacturer</label>
              <select
                required
                value={formData.oemId}
                onChange={(e) => setFormData({ ...formData, oemId: e.target.value })}
                className="form-control"
              >
                <option value="">-- Select OEM Manufacturer --</option>
                {oems.map((o) => (
                  <option key={o._id || o.id} value={o._id || o.id}>
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label required">Dealership Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pasco Motors Showroom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label required">Dealer Code</label>
              <input
                type="text"
                required
                placeholder="e.g. DLR-PASCO-01"
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
              <Mail size={18} className="text-brand" /> Showroom Contact Person
            </h3>
            <p className="micro muted">Nodal person for CSD delivery and beneficiary handover</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                placeholder="Manager / Institutional Head"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="dealer.csd@dealership.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Phone / Mobile</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
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
              <MapPin size={18} className="text-brand" /> Showroom Location & Tax Details
            </h3>
            <p className="micro muted">Physical premises for vehicle/appliance delivery and GSTIN</p>
          </div>

          <div className="mb-3">
            <label className="form-label">Showroom Address</label>
            <input
              type="text"
              placeholder="Full showroom street address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">PIN Code</label>
              <input
                type="text"
                placeholder="PIN Code"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid-2-col gap-3 mt-3">
            <div>
              <label className="form-label">GSTIN Number</label>
              <input
                type="text"
                placeholder="GSTIN"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="form-control font-mono"
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mt-4 p-3 bg-light rounded border">
            <input
              type="checkbox"
              id="dealerActiveStatus"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="dealerActiveStatus" className="form-label mb-0 cursor-pointer font-medium">
              Active Showroom (Beneficiaries can select this dealership during demand creation)
            </label>
          </div>
        </Card>

        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/dealers')}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isCreating || isUpdating}
            className="d-flex align-items-center gap-2 px-4"
          >
            <Save size={16} />
            {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Dealership' : 'Empanel Dealership'}
          </Button>
        </div>
      </form>
    </div>
  );
}
