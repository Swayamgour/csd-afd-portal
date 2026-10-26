import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { useUpdateUserMutation } from '../admin/adminApi.js';
import { User, Mail, Phone, CreditCard, Shield, Award, Building, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export function DirectorEditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const [updateUserMutation] = useUpdateUserMutation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    serviceNumber: '',
    rank: '',
    organization: '',
    unit: '',
    employmentStatus: 'SERVING',
    category: 'SERVING',
    entitlement: '',
    payLevel: '',
    pan: '',
    ppo: '',
    cardId: '',
    chipNumber: '',
    dob: '',
    dateOfEnrollment: '',
    dateOfRetirement: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      const b = user.beneficiary || {};
      const addr = b.address || user.address || {};

      setFormData({
        name: user.name || b.name || '',
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
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
        dob: b.dob ? String(b.dob).slice(0, 10) : (user.dob ? String(user.dob).slice(0, 10) : ''),
        dateOfEnrollment: b.dateOfEnrollment ? String(b.dateOfEnrollment).slice(0, 10) : (user.dateOfEnrollment ? String(user.dateOfEnrollment).slice(0, 10) : ''),
        dateOfRetirement: b.dateOfRetirement ? String(b.dateOfRetirement).slice(0, 10) : (user.dateOfRetirement ? String(user.dateOfRetirement).slice(0, 10) : ''),
        addressLine1: addr.line1 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || '',
        remarks: b.remarks || user.remarks || '',
      });
      setError('');
      setSuccess('');
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Full Name is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        serviceNumber: formData.serviceNumber.trim(),
        rank: formData.rank.trim(),
        organization: formData.organization.trim(),
        unit: formData.unit.trim(),
        employmentStatus: formData.employmentStatus,
        category: formData.category,
        entitlement: formData.entitlement.trim(),
        payLevel: formData.payLevel.trim(),
        pan: formData.pan.trim().toUpperCase(),
        ppo: formData.ppo.trim(),
        cardId: formData.cardId.trim(),
        chipNumber: formData.chipNumber.trim(),
        dob: formData.dob || undefined,
        dateOfEnrollment: formData.dateOfEnrollment || undefined,
        dateOfRetirement: formData.dateOfRetirement || undefined,
        remarks: formData.remarks.trim(),
        address: {
          line1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const targetId = user.id || user._id;
      await updateUserMutation({ id: targetId, ...payload }).unwrap();

      setSuccess('User details updated successfully by CS Director.');
      if (onUserUpdated) {
        onUserUpdated({ ...user, ...payload });
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('[DirectorEditUserModal] update failed:', err);
      setError(err.message || 'Error updating user profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Beneficiary Profile: ${user.name || user.username}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="director-modal-form">
        {error && (
          <div className="director-alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="director-alert-success">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        <div className="director-notice-box">
          <strong>CS Director Direct Override:</strong> Modifying details here directly updates the beneficiary's primary identity and military entitlement records.
        </div>

        {/* Section 1: Basic Identity */}
        <div>
          <h4 className="director-section-heading">
            Personal & Contact Information
          </h4>
          <div className="form-grid-2">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Defence Service Credentials */}
        <div>
          <h4 className="director-section-heading">
            Armed Forces Service Details
          </h4>
          <div className="form-grid-2">
            <div>
              <label className="form-label">Service Number</label>
              <input
                type="text"
                name="serviceNumber"
                value={formData.serviceNumber}
                onChange={handleChange}
                placeholder="e.g. JC-765432X"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Rank</label>
              <input
                type="text"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                placeholder="e.g. Subedar Major, Havildar, Major"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Service Branch / Arm</label>
              <select
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Indian Army">Indian Army</option>
                <option value="Indian Navy">Indian Navy</option>
                <option value="Indian Air Force">Indian Air Force</option>
                <option value="Indian Coast Guard">Indian Coast Guard</option>
                <option value="Defence Civilian">Defence Civilian</option>
                <option value="Assam Rifles">Assam Rifles</option>
              </select>
            </div>
            <div>
              <label className="form-label">Regiment / Unit</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. Rajputana Rifles, 7 Wing AF"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Employment Status</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="form-control"
              >
                <option value="SERVING">Serving Personnel</option>
                <option value="RETIRED">Ex-Serviceman / ESM</option>
                <option value="DEFENCE_CIVILIAN">Defence Civilian</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                <option value="SERVING">Serving</option>
                <option value="EX_SERVICEMAN">Ex-Serviceman</option>
                <option value="DEFENCE_CIVILIAN">Defence Civilian</option>
                <option value="WIDOW">Widow / Next of Kin</option>
                <option value="DEPENDENT">Dependent</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Pay Level</label>
              <input
                type="text"
                name="payLevel"
                value={formData.payLevel}
                onChange={handleChange}
                placeholder="e.g. Level 7, Level 10, Level 14"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Entitlement Category</label>
              <input
                type="text"
                name="entitlement"
                value={formData.entitlement}
                onChange={handleChange}
                placeholder="e.g. Officer, JCO, OR"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 3: CSD Cards & Tax Records */}
        <div>
          <h4 className="director-section-heading">
            CSD Canteen Card & Document Details
          </h4>
          <div className="form-grid-2">
            <div>
              <label className="form-label">CSD Grocery/Smart Card ID</label>
              <input
                type="text"
                name="cardId"
                value={formData.cardId}
                onChange={handleChange}
                placeholder="e.g. GC12345678"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Card Chip Number</label>
              <input
                type="text"
                name="chipNumber"
                value={formData.chipNumber}
                onChange={handleChange}
                placeholder="e.g. CHIP-987654"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">PAN Number</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="e.g. ABCDE1234F"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">PPO Number (For ESM)</label>
              <input
                type="text"
                name="ppo"
                value={formData.ppo}
                onChange={handleChange}
                placeholder="Pension Payment Order No."
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Address */}
        <div>
          <h4 className="director-section-heading">
            Address & Postal Code
          </h4>
          <div className="form-grid-2">
            <div className="director-grid-span-2">
              <label className="form-label">Street / House Address</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House No., Quarter, Street, Area"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">City / Station</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Pincode (6 digits)</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">CS Director Remarks / Note</label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Reason for change / verification comments"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="director-modal-actions">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save User Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
