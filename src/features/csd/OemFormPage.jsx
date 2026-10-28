import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import {
  useGetOemsQuery,
  useGetOemByIdQuery,
  useCreateOemMutation,
  useUpdateOemMutation,
} from '../org/orgApi.js';

export default function OemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: rawOem, isLoading: isLoadingOem } = useGetOemByIdQuery(id, { skip: !isEdit });
  const { data: oemsList } = useGetOemsQuery({}, { skip: !isEdit || Boolean(rawOem) });

  const [createOem, { isLoading: isCreating }] = useCreateOemMutation();
  const [updateOem, { isLoading: isUpdating }] = useUpdateOemMutation();

  const oem = React.useMemo(() => {
    if (!isEdit) return null;
    if (rawOem?.data) return rawOem.data;
    if (rawOem?._id || rawOem?.id) return rawOem;
    const list = Array.isArray(oemsList) ? oemsList : [];
    return list.find((item) => String(item._id || item.id) === String(id)) || null;
  }, [isEdit, rawOem, oemsList, id]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    vendorCode: '',
    firmCode: '',
    person: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    panNumber: '',
    active: true,
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (oem) {
      setFormData({
        name: oem.name || '',
        code: oem.code || '',
        vendorCode: oem.vendorCode || '',
        firmCode: oem.firmCode || '',
        person:
          oem.person ||
          oem.contactPerson?.name ||
          (typeof oem.contactPerson === 'string' ? oem.contactPerson : '') ||
          '',
        email: oem.email || oem.contactPerson?.email || '',
        phone: oem.phone || oem.contactPerson?.phone || '',
        alternatePhone: oem.alternatePhone || '',
        address: oem.address || '',
        city: oem.city || '',
        state: oem.state || '',
        pincode: oem.pincode || '',
        gstin: oem.gstin || oem.gstNumber || '',
        panNumber: oem.panNumber || '',
        active: oem.active ?? true,
      });
    }
  }, [oem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('OEM Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('OEM Code is required.');
      return;
    }

    try {
      if (isEdit) {
        await updateOem({
          id,
          ...formData,
          code: formData.code.trim().toUpperCase(),
          gstin: formData.gstin.trim().toUpperCase(),
          panNumber: formData.panNumber.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/oems', {
          state: { toast: `✓ OEM "${formData.name}" updated successfully.` },
        });
      } else {
        await createOem({
          ...formData,
          code: formData.code.trim().toUpperCase(),
          gstin: formData.gstin.trim().toUpperCase(),
          panNumber: formData.panNumber.trim().toUpperCase(),
        }).unwrap();
        navigate('/csd/oems', {
          state: { toast: `✓ OEM "${formData.name}" registered successfully.` },
        });
      }
    } catch (err) {
      setErrorMsg(
        err?.data?.message ||
          err?.message ||
          'Failed to save OEM record. Please verify that the OEM code is unique and try again.'
      );
    }
  };

  if (isEdit && isLoadingOem) {
    return <LoadingState text="Loading OEM profile details..." />;
  }

  return (
    <div className="csd-module-page">
      <PageHeader
        title={isEdit ? `Edit OEM: ${formData.name || oem?.name || 'Loading...'}` : 'Register New Manufacturer (OEM)'}
        subtitle="Empanel automotive or white-goods manufacturers with valid CSD Rate Contracts"
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
        {/* SECTION 1: CORPORATE IDENTIFICATION */}
        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Building2 size={18} className="text-brand" /> Corporate Identification
            </h3>
            <p className="micro muted">Basic enterprise details and official institutional codes</p>
          </div>

          <div className="grid-2-col gap-3">
            <div>
              <label className="form-label required">OEM Enterprise Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maruti Suzuki India Ltd."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
              <span className="micro text-muted">Registered corporate legal name</span>
            </div>

            <div>
              <label className="form-label required">CSD OEM Code</label>
              <input
                type="text"
                required
                placeholder="e.g. MSIL"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="form-control font-mono font-bold"
              />
              <span className="micro text-muted">Unique uppercase identifier used in SKU mapping</span>
            </div>
          </div>

          <div className="grid-2-col gap-3 mt-3">
            <div>
              <label className="form-label">Vendor Code (CSD-HO)</label>
              <input
                type="text"
                placeholder="e.g. VND-MSIL-01"
                value={formData.vendorCode}
                onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Firm Code</label>
              <input
                type="text"
                placeholder="e.g. FRM-9801"
                value={formData.firmCode}
                onChange={(e) => setFormData({ ...formData, firmCode: e.target.value })}
                className="form-control"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 2: NODAL CONTACT DETAILS */}
        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <Mail size={18} className="text-brand" /> Institutional Nodal Contact
            </h3>
            <p className="micro muted">Official contact person handling defense institutional quota</p>
          </div>

          <div className="grid-3-col gap-3">
            <div>
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Col. Rajesh Verma (Retd.)"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Official Email</label>
              <input
                type="email"
                placeholder="csd.sales@oem.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Official Phone / Mobile</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid-3-col gap-3 mt-3">
            <div>
              <label className="form-label">Alternate Phone</label>
              <input
                type="tel"
                placeholder="011-23456789"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                className="form-control"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 3: LOCATION & FACTORY ADDRESS */}
        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <MapPin size={18} className="text-brand" /> Plant / Head Office Address
            </h3>
            <p className="micro muted">Dispatch base location and state registration</p>
          </div>

          <div className="mb-3">
            <label className="form-label">Corporate / Plant Address</label>
            <input
              type="text"
              placeholder="e.g. Plot 1, Nelson Mandela Road, Vasant Kunj"
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
                placeholder="e.g. New Delhi"
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

            <div>
              <label className="form-label">PIN Code</label>
              <input
                type="text"
                placeholder="e.g. 110070"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="form-control"
              />
            </div>
          </div>
        </Card>

        {/* SECTION 4: TAX & STATUS */}
        <Card className="mb-3">
          <div className="card-header border-bottom pb-2 mb-3">
            <h3 className="card-title d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-brand" /> Regulatory & Operational Status
            </h3>
            <p className="micro muted">Tax compliance numbers and catalog empanelment flag</p>
          </div>

          <div className="grid-2-col gap-3">
            <div>
              <label className="form-label">GSTIN Number</label>
              <input
                type="text"
                placeholder="e.g. 07AAACM1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="form-control font-mono"
              />
            </div>

            <div>
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                placeholder="e.g. AAACM1234F"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                className="form-control font-mono"
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mt-4 p-3 bg-light rounded border">
            <input
              type="checkbox"
              id="oemStatusActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="oemStatusActive" className="form-label mb-0 cursor-pointer font-medium">
              Empaneled & Active in CSD AFD Catalog (Authorizes Dealers & Products assignment)
            </label>
          </div>
        </Card>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button type="button" variant="outline" onClick={() => navigate('/csd/oems')}>
            Cancel
          </Button>

          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating || isUpdating}
              className="d-flex align-items-center gap-2 px-4"
            >
              <Save size={16} />
              {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update OEM Record' : 'Empanel OEM'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
