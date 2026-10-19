import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Lock,
  FileCheck,
  CheckCircle2,
  Edit2,
  Save,
  Upload,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import Button from '../../components/common/Button.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadBeneficiaryDocumentMutation,
  useUploadFileMutation,
} from './beneficiaryApi.js';
import { getErrorMessage } from '../../utils/apiError.js';

export function BeneficiaryProfile() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useGetMyProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [attachDoc, { isLoading: isAttachingDoc }] = useUploadBeneficiaryDocumentMutation();

  const beneficiary = profileData || {};
  const userAccount = beneficiary.userId || authUser || {};

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    serviceNumber: '',
    pan: '',
    rank: '',
    organization: '',
    unit: '',
    employmentStatus: 'SERVING',
    payLevel: '',
    entitlement: '',
    cardId: '',
    chipNumber: '',
    ppo: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        name: beneficiary.name || userAccount.name || '',
        mobile: userAccount.mobile || '',
        email: userAccount.email || '',
        serviceNumber: beneficiary.serviceNumber || '',
        pan: beneficiary.pan || '',
        rank: beneficiary.rank || '',
        organization: beneficiary.organization || '',
        unit: beneficiary.unit || '',
        employmentStatus: beneficiary.employmentStatus || 'SERVING',
        payLevel: beneficiary.payLevel || '',
        entitlement: beneficiary.entitlement || '',
        cardId: beneficiary.cardId || '',
        chipNumber: beneficiary.chipNumber || '',
        ppo: beneficiary.ppo || '',
        line1: beneficiary.address?.line1 || '',
        line2: beneficiary.address?.line2 || '',
        city: beneficiary.address?.city || '',
        state: beneficiary.address?.state || '',
        pincode: beneficiary.address?.pincode || '',
      });
    }
  }, [profileData]);

  const tabs = [
    { id: 'personal', label: 'Personal & Service Records', icon: User },
    { id: 'contact', label: 'Contact & Residential Address', icon: MapPin },
    { id: 'eligibility', label: 'AFD Entitlement & Pay Matrix', icon: ShieldCheck },
    { id: 'documents', label: 'Uploaded Documents', icon: FileCheck },
  ];

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        serviceNumber: formData.serviceNumber,
        pan: formData.pan,
        rank: formData.rank,
        organization: formData.organization,
        unit: formData.unit,
        employmentStatus: formData.employmentStatus,
        payLevel: formData.payLevel,
        entitlement: formData.entitlement,
        cardId: formData.cardId,
        chipNumber: formData.chipNumber,
        ppo: formData.ppo,
        address: {
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      };

      await updateProfile(payload).unwrap();
      setEditing(false);
      showToast('success', 'Profile and service credentials updated successfully.');
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update profile.'));
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('files', file);

      const res = await uploadFile(fd).unwrap();
      const uploadedItem = Array.isArray(res) ? res[0] : res?.data?.[0];
      const fileUrl = uploadedItem?.url;

      if (!fileUrl) {
        throw new Error('Upload succeeded but no file URL returned');
      }

      await attachDoc({
        type: file.name.slice(0, 30),
        fileUrl,
      }).unwrap();

      showToast('success', `Document "${file.name}" uploaded and attached successfully.`);
      refetchProfile();
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to upload document.'));
    }
  };

  if (isProfileLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-2" />
          <p className="text-slate-600 text-sm">Loading verified beneficiary profile...</p>
        </div>
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-800 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Failed to Load Profile</h3>
            <p className="text-sm mb-3">{getErrorMessage(profileError)}</p>
            <button
              onClick={() => refetchProfile()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = beneficiary.verificationStatus === 'VERIFIED';
  const documents = beneficiary.documents || [];

  return (
    <div className="beneficiary-profile-page">
      <PageHeader
        title="Beneficiary Profile & Service Records"
        subtitle="Manage verified defence credentials, registered contact address, and CSD entitlement proofs."
        actions={
          activeTab === 'personal' || activeTab === 'contact' ? (
            editing ? (
              <div className="row gap-1">
                <Button variant="outline" onClick={() => setEditing(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button variant="primary" icon={Save} onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <Button variant="outline" icon={Edit2} onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )
          ) : null
        }
      />

      {toast.message && (
        <div
          className={`alert-banner ${toast.type === 'error' ? 'error bg-red-50 text-red-800 border-red-200' : 'success'} mb-2 small`}
          role="alert"
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="panel profile-hero-card mb-3">
        <div className="between align-center flex-wrap gap-2">
          <div className="row align-center gap-2">
            <div className="profile-hero-avatar-wrap">
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {(beneficiary.name || 'B').charAt(0).toUpperCase()}
              </div>
              <span className="profile-verified-badge" title={isVerified ? 'CSD Verified' : 'Verification Pending'}>
                <ShieldCheck size={14} />
              </span>
            </div>
            <div>
              <div className="row align-center gap-1 mb-1">
                <h2 className="h3 mb-0">{beneficiary.name || userAccount.name}</h2>
                <span className={`badge-pill ${isVerified ? 'badge-success' : 'badge-primary'} badge-sm`}>
                  {beneficiary.rank || 'Armed Forces'}
                </span>
              </div>
              <p className="small muted mb-1">
                Service No: <b>{beneficiary.serviceNumber || 'Not Set'}</b> · PAN: <b>{beneficiary.pan || 'Not Set'}</b> · Card ID: <b>{beneficiary.cardId || 'Not Set'}</b>
              </p>
              <p className={`small font-medium mb-0 ${isVerified ? 'text-green' : 'text-amber-600'}`}>
                ● Verification Status: <b>{beneficiary.verificationStatus || 'PENDING'}</b>
                {userAccount.isEmailVerified && ' (Email Verified ✓)'}
              </p>
            </div>
          </div>

          <div className="profile-completion-box panel">
            <div className="between small mb-1">
              <span className="font-semibold">Account Status</span>
              <span className="font-bold text-brand">{beneficiary.verificationStatus || 'PENDING'}</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: isVerified ? '100%' : '65%',
                  background: isVerified ? 'var(--green)' : '#f59e0b',
                }}
              />
            </div>
            <span className="micro muted mt-1 block">
              {isVerified
                ? 'All mandatory service proofs approved by CSD'
                : 'Under verification by administrator'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-3" />

      {/* Tab 1: Personal & Service Information */}
      {activeTab === 'personal' && (
        <div className="grid-2-col gap-2">
          <Card title="Personal Information">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Full Name:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{beneficiary.name}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Service Number:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.serviceNumber}
                    onChange={(e) => setFormData({ ...formData, serviceNumber: e.target.value })}
                  />
                ) : (
                  <span className="font-mono font-semibold">{beneficiary.serviceNumber || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Permanent Account Number (PAN):</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  />
                ) : (
                  <span className="font-mono font-semibold">{beneficiary.pan || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Smart Card ID:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.cardId}
                    onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                  />
                ) : (
                  <span className="font-mono font-semibold">{beneficiary.cardId || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">PPO Number (if retired):</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.ppo}
                    onChange={(e) => setFormData({ ...formData, ppo: e.target.value })}
                  />
                ) : (
                  <span className="font-mono font-semibold">{beneficiary.ppo || 'N/A (Serving)'}</span>
                )}
              </div>
            </div>
          </Card>

          <Card title="Military Service Information">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Service Branch / Org:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{beneficiary.organization || 'Defence Forces'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Serving Unit:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{beneficiary.unit || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Rank / Grade:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{beneficiary.rank || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Pay Level (7th CPC):</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    placeholder="e.g. Level 7"
                    value={formData.payLevel}
                    onChange={(e) => setFormData({ ...formData, payLevel: e.target.value })}
                  />
                ) : (
                  <span className="font-bold text-brand">{beneficiary.payLevel || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Employment Status:</span>
                {editing ? (
                  <select
                    className="fld-input-sm"
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                  >
                    <option value="SERVING">SERVING</option>
                    <option value="RETIRED">RETIRED</option>
                    <option value="DEFENCE_CIVILIAN">DEFENCE CIVILIAN</option>
                  </select>
                ) : (
                  <span className="font-semibold">{beneficiary.employmentStatus || 'SERVING'}</span>
                )}
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Entitlement Class:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    placeholder="e.g. AFD-I / AFD-II"
                    value={formData.entitlement}
                    onChange={(e) => setFormData({ ...formData, entitlement: e.target.value })}
                  />
                ) : (
                  <span>{beneficiary.entitlement || 'AFD-I & AFD-II Standard'}</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Contact Information & Address */}
      {activeTab === 'contact' && (
        <div className="grid-2-col gap-2">
          <Card title="Contact Communication">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Mobile Number:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{userAccount.mobile || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Registered Email:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{userAccount.email}</span>
                )}
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Email Verification:</span>
                <span className={userAccount.isEmailVerified ? 'text-green font-semibold' : 'text-amber-600 font-semibold'}>
                  {userAccount.isEmailVerified ? '● Verified ✓' : '● Verification Pending'}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Residential Address">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Address Line 1:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  />
                ) : (
                  <span>{beneficiary.address?.line1 || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Address Line 2:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.line2}
                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                  />
                ) : (
                  <span>{beneficiary.address?.line2 || '-'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">City:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                ) : (
                  <span className="font-medium">{beneficiary.address?.city || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">State:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                ) : (
                  <span className="font-medium">{beneficiary.address?.state || 'Not set'}</span>
                )}
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Pincode:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                ) : (
                  <span className="font-medium">{beneficiary.address?.pincode || 'Not set'}</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Entitlement & Pay Matrix */}
      {activeTab === 'eligibility' && (
        <Card title="CSD AFD Entitlement Matrix (As per Ministry of Defence Guidelines)">
          <div className="eligibility-cards-grid row gap-2 mb-3">
            <div className="panel p-3 border-left-brand flex-1">
              <span className="small muted block">Four-Wheeler (Car) Category</span>
              <p className="h3 text-brand my-1">
                {beneficiary.payLevel || 'Level 3 - Level 18'}
              </p>
              <p className="small muted mb-1">
                Periodicity: Subject to minimum 5 years service & rank quota rule
              </p>
              <span className={`badge-pill ${isVerified ? 'badge-success' : 'badge-primary'} badge-sm`}>
                {isVerified ? 'Eligible for Booking' : 'Pending Verification'}
              </span>
            </div>

            <div className="panel p-3 border-left-green flex-1">
              <span className="small muted block">Two-Wheeler Quota</span>
              <p className="h3 text-green my-1">All AFD-I Two-Wheelers</p>
              <p className="small muted mb-1">Periodicity: Once every 2-3 years</p>
              <span className={`badge-pill ${isVerified ? 'badge-success' : 'badge-primary'} badge-sm`}>
                {isVerified ? 'Eligible for Booking' : 'Pending Verification'}
              </span>
            </div>

            <div className="panel p-3 border-left-saffron flex-1">
              <span className="small muted block">White Goods & Appliances</span>
              <p className="h3 text-saffron my-1">AFD-II Quota</p>
              <p className="small muted mb-1">Annual quota up to 4 appliances per financial year</p>
              <span className="badge-pill badge-success badge-sm">Eligible</span>
            </div>
          </div>

          <p className="small muted mb-0">
            *Note: Concessional pricing is evaluated excluding commercial state VAT/local duties as per Army Order 11/2020 and revised MoD notifications.
          </p>
        </Card>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <Card
          title="Verified Documents on File"
          subtitle="All documents uploaded for AFD procurement are digitally archived in CSD secure storage."
        >
          {documents.length > 0 ? (
            <div className="doc-list-grid mb-3">
              {documents.map((doc, idx) => (
                <DocumentViewer
                  key={idx}
                  name={doc.type || `Document-${idx + 1}`}
                  size="Archived"
                  status={doc.fileUrl ? 'Stored on File' : 'Pending'}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center mb-3">
              <p className="text-slate-600 text-sm">No service documents uploaded yet.</p>
            </div>
          )}

          <div className="upload-new-box p-3 panel bg-bg">
            <h4 className="small font-semibold mb-2">Upload Additional / Renewal Document</h4>
            <FileUpload
              label="Select Document File (Salary Slip, Service Book, PPO, or Availment Cert)"
              helperText="PDF or scanned image up to 10MB"
              onFileSelect={handleDocumentUpload}
              disabled={isUploadingFile || isAttachingDoc}
            />
            {(isUploadingFile || isAttachingDoc) && (
              <p className="text-brand text-xs mt-2 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading and attaching to profile...
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default BeneficiaryProfile;
