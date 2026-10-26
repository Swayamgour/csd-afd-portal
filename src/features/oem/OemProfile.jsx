import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Badge from '../../components/common/Badge.jsx';
import { LoadingState, ErrorState } from '../../components/common/States.jsx';
import { useGetOemProfileQuery, useUpdateOemProfileMutation } from './oemApi.js';

export default function OemProfile() {
  const { data: profileData, isLoading, isFetching, error, refetch } = useGetOemProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateOemProfileMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [formError, setFormError] = useState('');

  const [formState, setFormState] = useState({
    legalName: '',
    shortName: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
  });

  const org = profileData?.organization || {};
  const user = profileData?.user || {};

  useEffect(() => {
    if (org) {
      setFormState({
        legalName: org.legalName || '',
        shortName: org.shortName || '',
        alternatePhone: org.alternatePhone || '',
        address: org.address || '',
        city: org.city || '',
        state: org.state || '',
        pincode: org.pincode || '',
        contactPersonName: org.contactPerson?.name || '',
        contactPersonEmail: org.contactPerson?.email || '',
        contactPersonPhone: org.contactPerson?.phone || '',
      });
    }
  }, [org]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      legalName: formState.legalName.trim() || undefined,
      shortName: formState.shortName.trim() || undefined,
      alternatePhone: formState.alternatePhone.trim() || undefined,
      address: formState.address.trim() || undefined,
      city: formState.city.trim() || undefined,
      state: formState.state.trim() || undefined,
      pincode: formState.pincode.trim() || undefined,
      contactPerson: {
        name: formState.contactPersonName.trim() || undefined,
        email: formState.contactPersonEmail.trim() || undefined,
        phone: formState.contactPersonPhone.trim() || undefined,
      },
    };

    try {
      await updateProfile(payload).unwrap();
      setToastMessage('Corporate institutional profile updated successfully.');
      setModalOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setFormError(err?.data?.message || err?.message || 'Failed to update profile.');
    }
  };

  if (isLoading) {
    return (
      <div className="oem-profile-page">
        <PageHeader title="OEM Corporate Profile" subtitle="Loading institutional records..." />
        <LoadingState message="Fetching official manufacturer profile from registry..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="oem-profile-page">
        <PageHeader title="OEM Corporate Profile" subtitle="Profile unavailable" />
        <ErrorState
          title="Unable to load OEM Profile"
          message={error?.data?.message || 'Failed to retrieve corporate profile.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="oem-profile-page space-y-6">
      <PageHeader
        title="OEM Corporate Profile & Empanelment Record"
        subtitle="Automobile manufacturer institutional credentials, vendor codes, and CSD nodal contacts"
        breadcrumbs={[
          { label: 'OEM Portal', href: '/oem/dashboard' },
          { label: 'Corporate Profile' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={refetch}
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Edit3}
              onClick={() => setModalOpen(true)}
            >
              Edit Details
            </Button>
          </div>
        }
      />

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid-2-col gap-3">
        {/* Organization Card */}
        <Card
          title="Institutional Organization Credentials"
          subtitle="Registered automobile manufacturer corporate details"
        >
          <div className="info-kv-list">
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Registered Entity:</span>
              <span className="font-semibold text-slate-900">{org.name || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Legal Name:</span>
              <span className="font-medium">{org.legalName || org.name}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">CSD Vendor Code:</span>
              <span className="font-mono font-semibold text-brand">{org.vendorCode || org.firmCode || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">CSD Empanelment Status:</span>
              {org.approvalStatus ? (
                <Badge variant={org.approvalStatus === 'APPROVED' ? 'success' : 'warning'}>
                  {org.approvalStatus}
                </Badge>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Corporate Address:</span>
              <span>{org.address || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">City / State:</span>
              <span>{org.city || '—'}, {org.state || '—'} {org.pincode ? `(${org.pincode})` : ''}</span>
            </div>
            <div className="kv-row between small py-1.5">
              <span className="muted">Institutional Helpline:</span>
              <span>{org.phone || org.alternatePhone || '—'}</span>
            </div>
          </div>
        </Card>

        {/* Nodal Officer & Contact Person Card */}
        <Card
          title="Authorized Nodal Officer & Focal Point"
          subtitle="Designated representative authorized for CSD AFD institutional transactions"
        >
          <div className="info-kv-list">
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Authenticated User:</span>
              <span className="font-semibold text-slate-900">{user.name || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">User Role:</span>
              <Badge variant="primary">{user.role || 'OEM'}</Badge>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Official Email:</span>
              <span className="font-mono">{user.email || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Registered Mobile:</span>
              <span className="font-mono">{user.mobile || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Contact Person:</span>
              <span className="font-medium">{org.contactPerson?.name || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5 border-bottom">
              <span className="muted">Contact Email:</span>
              <span>{org.contactPerson?.email || user.email || '—'}</span>
            </div>
            <div className="kv-row between small py-1.5">
              <span className="muted">Contact Phone:</span>
              <span>{org.contactPerson?.phone || user.mobile || '—'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Corporate Institutional Profile"
        subtitle="Update manufacturer communication addresses and designated contact person"
        maxWidth="600px"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isUpdating}
              onClick={handleSubmit}
            >
              Save Profile
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="form-field">
              <label className="form-label">Legal Entity Name</label>
              <input
                type="text"
                className="form-control"
                value={formState.legalName}
                onChange={(e) => setFormState({ ...formState, legalName: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Short Name / Brand</label>
              <input
                type="text"
                className="form-control"
                value={formState.shortName}
                onChange={(e) => setFormState({ ...formState, shortName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Registered Corporate Address</label>
            <input
              type="text"
              className="form-control"
              value={formState.address}
              onChange={(e) => setFormState({ ...formState, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="form-field">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={formState.city}
                onChange={(e) => setFormState({ ...formState, city: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                value={formState.state}
                onChange={(e) => setFormState({ ...formState, state: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-control font-mono"
                value={formState.pincode}
                onChange={(e) => setFormState({ ...formState, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase">Designated Contact Person</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="form-field">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formState.contactPersonName}
                  onChange={(e) => setFormState({ ...formState, contactPersonName: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formState.contactPersonEmail}
                  onChange={(e) => setFormState({ ...formState, contactPersonEmail: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={formState.contactPersonPhone}
                  onChange={(e) => setFormState({ ...formState, contactPersonPhone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
