import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { LoadingState } from '../../components/common/States.jsx';
import { MASTER_ROLES } from '../../permissions/roles.js';
import { useGetUserByIdQuery, useGetUsersQuery, useUpdateUserMutation } from './adminApi.js';

export function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDirector = location.pathname.startsWith('/director');

  const { data: rawUser, isLoading } = useGetUserByIdQuery(id);
  const { data: rawList = [] } = useGetUsersQuery({}, { skip: Boolean(rawUser) });
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();

  const user = React.useMemo(() => {
    if (rawUser?.data) return rawUser.data;
    if (rawUser?._id || rawUser?.id) return rawUser;
    const list = Array.isArray(rawList) ? rawList : (rawList?.items || []);
    return list.find((u) => String(u._id || u.id) === String(id)) || null;
  }, [rawUser, rawList, id]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'BENEFICIARY',
    serviceNumber: '',
    rank: '',
    organization: 'Indian Army',
    unit: '',
    employmentStatus: 'SERVING',
    category: 'SERVING',
    entitlement: '',
    payLevel: '',
    pan: '',
    ppo: '',
    cardId: '',
    chipNumber: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (user) {
      const b = user.beneficiary || {};
      const addr = b.address || user.address || {};
      setFormData({
        name: user.name || b.name || '',
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
        role: user.role || 'BENEFICIARY',
        serviceNumber: b.serviceNumber || user.serviceNumber || '',
        rank: b.rank || user.rank || '',
        organization: b.organization || user.service || 'Indian Army',
        unit: b.unit || user.regiment || '',
        employmentStatus: b.employmentStatus || (user.status === 'Retired' ? 'RETIRED' : 'SERVING'),
        category: b.category || 'SERVING',
        entitlement: b.entitlement || (user.eligibility?.category) || 'JCO / Equivalent',
        payLevel: b.payLevel || user.payLevel || '',
        pan: b.pan || user.panNumber || user.pan || '',
        ppo: b.ppo || user.ppo || '',
        cardId: b.cardId || user.cardId || '',
        chipNumber: b.chipNumber || user.chipNumber || '',
        addressLine1: addr.line1 || addr.addressLine1 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const updatePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        role: formData.role,
        beneficiary: {
          name: formData.name.trim(),
          serviceNumber: formData.serviceNumber.trim(),
          rank: formData.rank.trim(),
          organization: formData.organization,
          unit: formData.unit.trim(),
          employmentStatus: formData.employmentStatus,
          category: formData.category,
          entitlement: formData.entitlement,
          payLevel: formData.payLevel.trim(),
          pan: formData.pan.trim(),
          ppo: formData.ppo.trim(),
          cardId: formData.cardId.trim(),
          chipNumber: formData.chipNumber.trim(),
          address: {
            line1: formData.addressLine1.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
          }
        }
      };

      await updateUser({ id: user.id || user._id, ...updatePayload }).unwrap();
      const backUrl = isDirector ? `/director/users/${id}` : `/admin/users/${id}`;
      navigate(backUrl);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to update user profile');
    }
  };

  const backUrl = isDirector ? `/director/users/${id}` : `/admin/users/${id}`;

  if (isLoading) {
    return <LoadingState text="Loading user profile..." />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Edit User: ${formData.name || user?.username || 'User Account'}`}
        subtitle="Update identity records, service credentials, canteen card mapping, and role permissions"
        breadcrumbs={[
          { label: isDirector ? 'Director Approvals' : 'System Admin', href: isDirector ? '/director/approvals' : '/admin/users' },
          { label: user?.name || user?.username || 'User Details', href: backUrl },
          { label: 'Edit' },
        ]}
        actions={
          <div className="flex-gap-sm">
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => navigate(backUrl)}
            >
              Cancel
            </Button>
            <Button
              icon={Save}
              loading={isSaving}
              onClick={handleSubmit}
            >
              Save Profile Changes
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title">1. Basic Identity & Contact Information</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">System Username (Read-Only)</label>
                <input
                  type="text"
                  disabled
                  className="form-control font-mono"
                  value={user?.username || ''}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control font-mono"
                  placeholder="+91 98765 00000"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Portal Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {MASTER_ROLES.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Military Service & Canteen Card Record */}
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title">2. Armed Forces & CSD Smart Card Records</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Service Number</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="e.g. JC-123456X"
                  value={formData.serviceNumber}
                  onChange={(e) => setFormData({ ...formData, serviceNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rank / Designation</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Subedar Major / Colonel"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organization / Branch</label>
                <select
                  className="form-select"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                >
                  <option value="Indian Army">Indian Army</option>
                  <option value="Indian Navy">Indian Navy</option>
                  <option value="Indian Air Force">Indian Air Force</option>
                  <option value="Indian Coast Guard">Indian Coast Guard</option>
                  <option value="Assam Rifles">Assam Rifles</option>
                  <option value="GREF / BRO">GREF / BRO</option>
                  <option value="Defence Civilians">Defence Civilians</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit / Regiment</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 5 Sikh Light Infantry"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employment Status</label>
                <select
                  className="form-select"
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                >
                  <option value="SERVING">SERVING</option>
                  <option value="RETIRED">RETIRED (ESM)</option>
                  <option value="FAMILY_PENSIONER">FAMILY PENSIONER / WIDOW</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pay Level / Matrix Grade</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="e.g. Level 7"
                  value={formData.payLevel}
                  onChange={(e) => setFormData({ ...formData, payLevel: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canteen Grocery Card ID</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="16-digit Smart Card ID"
                  value={formData.cardId}
                  onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Chip Number</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="Chip serial number"
                  value={formData.chipNumber}
                  onChange={(e) => setFormData({ ...formData, chipNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PPO Number (if retired)</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="Pension Payment Order No."
                  value={formData.ppo}
                  onChange={(e) => setFormData({ ...formData, ppo: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="card mb-2">
          <div className="card-header">
            <h3 className="card-title">3. Residential & Communication Address</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address Line</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="House No., Street, Sector/Village"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / District</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  placeholder="6-digit PIN"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="card-footer">
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(backUrl)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminUserEdit;
