import React, { useState } from 'react';
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
  Upload
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function BeneficiaryProfile() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    line1: user?.address?.line1 || '',
    line2: user?.address?.line2 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || ''
  });
  const [toast, setToast] = useState('');

  const tabs = [
    { id: 'personal', label: 'Personal & Service Records', icon: User },
    { id: 'contact', label: 'Contact & Residential Address', icon: MapPin },
    { id: 'eligibility', label: 'AFD Entitlement Quotas', icon: ShieldCheck },
    { id: 'documents', label: 'Verified Proofs & Documents', icon: FileCheck },
    { id: 'security', label: 'Account Security & Password', icon: Lock }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: {
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      }
    });
    setEditing(false);
    setToast('Profile updated successfully.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="beneficiary-profile-page">
      <PageHeader
        title="Beneficiary Profile & Service Records"
        subtitle="Manage verified defence credentials, registered contact address, and CSD entitlement proofs."
        actions={
          activeTab === 'personal' || activeTab === 'contact' ? (
            editing ? (
              <Button variant="primary" icon={Save} onClick={handleSave}>
                Save Changes
              </Button>
            ) : (
              <Button variant="outline" icon={Edit2} onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )
          ) : null
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Profile Overview Card with Completion Gauge */}
      <div className="panel profile-hero-card mb-3">
        <div className="between align-center flex-wrap gap-2">
          <div className="row align-center gap-2">
            <div className="profile-hero-avatar-wrap">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="profile-hero-avatar"
              />
              <span className="profile-verified-badge" title="UIDAI / SPARSH Verified">
                <ShieldCheck size={14} />
              </span>
            </div>
            <div>
              <div className="row align-center gap-1 mb-1">
                <h2 className="h3 mb-0">{user?.name}</h2>
                <span className="badge-pill badge-primary badge-sm">
                  {user?.eligibility?.category || 'JCO / Equivalent'}
                </span>
              </div>
              <p className="small muted mb-1">
                Service No: <b>{user?.serviceNumber}</b> · PAN: <b>{user?.panNumber}</b>
              </p>
              <p className="small text-green font-medium mb-0">
                ● Account Status: <b>{user?.status || 'Active'} (Aadhaar e-KYC Compliant)</b>
              </p>
            </div>
          </div>

          <div className="profile-completion-box panel">
            <div className="between small mb-1">
              <span className="font-semibold">Profile Completion</span>
              <span className="font-bold text-brand">100%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '100%', background: 'var(--green)' }} />
            </div>
            <span className="micro muted mt-1 block">All mandatory service proofs validated</span>
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
                  <span className="font-semibold">{user?.name}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Service Number:</span>
                <span className="font-mono font-semibold">{user?.serviceNumber}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Permanent Account Number (PAN):</span>
                <span className="font-mono font-semibold">{user?.panNumber}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Aadhaar Verification:</span>
                <span className="text-green font-semibold">● Linked & Verified</span>
              </div>
            </div>
          </Card>

          <Card title="Military Service Information">
            <div className="info-kv-list">
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Service Branch:</span>
                <span className="font-semibold">{user?.service}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Regiment / Corps:</span>
                <span className="font-semibold">{user?.regiment}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Rank / Grade:</span>
                <span className="font-semibold">{user?.rank}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Pay Level (7th CPC):</span>
                <span className="font-bold text-brand">{user?.payLevel}</span>
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Date of Enrollment:</span>
                <span>{user?.dateOfEnrollment}</span>
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Date of Superannuation:</span>
                <span>{user?.dateOfRetirement}</span>
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{user?.phone}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">Official Email:</span>
                {editing ? (
                  <input
                    className="fld-input-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <span className="font-semibold">{user?.email}</span>
                )}
              </div>
              <div className="kv-row between small py-1">
                <span className="muted">Mapped Parent Depot:</span>
                <span className="font-medium">{user?.depot}</span>
              </div>
            </div>
          </Card>

          <Card title="Residential Delivery Address">
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
                  <span>{user?.address?.line1}</span>
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
                  <span>{user?.address?.line2}</span>
                )}
              </div>
              <div className="kv-row between small py-1 border-bottom">
                <span className="muted">City & State:</span>
                {editing ? (
                  <div className="row gap-1">
                    <input
                      className="fld-input-sm"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    <input
                      className="fld-input-sm"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                ) : (
                  <span className="font-medium">
                    {user?.address?.city}, {user?.address?.state} - {user?.address?.pincode}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Eligibility */}
      {activeTab === 'eligibility' && (
        <Card title="CSD AFD Entitlement Matrix (As per MoD Rules 2024)">
          <div className="eligibility-cards-grid row gap-2 mb-3">
            <div className="panel p-3 border-left-brand flex-1">
              <span className="small muted block">Four-Wheeler (Car) Ceiling</span>
              <p className="h3 text-brand my-1">
                ₹ {(user?.eligibility?.fourWheelerCap / 100000).toFixed(1)} Lakhs
              </p>
              <p className="small muted mb-1">Periodicity: Once every 8 years</p>
              <span className="badge-pill badge-success badge-sm">Eligible for Booking</span>
            </div>

            <div className="panel p-3 border-left-green flex-1">
              <span className="small muted block">Two-Wheeler Quota</span>
              <p className="h3 text-green my-1">Uncapped CC</p>
              <p className="small muted mb-1">Periodicity: Once every 3 years</p>
              <span className="badge-pill badge-success badge-sm">Eligible for Booking</span>
            </div>

            <div className="panel p-3 border-left-saffron flex-1">
              <span className="small muted block">White Goods & Appliances</span>
              <p className="h3 text-saffron my-1">Annual Quota</p>
              <p className="small muted mb-1">Refrigerators, ACs, Washing Machines, TVs</p>
              <span className="badge-pill badge-success badge-sm">Eligible</span>
            </div>
          </div>

          <p className="small muted mb-0">
            *Note: Ex-showroom price is evaluated excluding GST and Compensation Cess in accordance with Army Order 11/2020 and revised CSD notifications.
          </p>
        </Card>
      )}

      {/* Tab 4: Documents */}
      {activeTab === 'documents' && (
        <Card
          title="Verified Documents on File"
          subtitle="All documents uploaded for AFD procurement are digitally archived."
        >
          <div className="doc-list-grid mb-3">
            <DocumentViewer
              name="Availment Certificate (Counter-signed by CO).pdf"
              size="1.4 MB"
              status="Verified by URC"
            />
            <DocumentViewer
              name="Salary Slip / Pension Certificate (Pay Level 8).pdf"
              size="840 KB"
              status="Verified by Depot"
            />
            <DocumentViewer
              name="PAN Card Copy (ABCDE1234F).pdf"
              size="520 KB"
              status="Verified (CBDT API)"
            />
          </div>

          <div className="upload-new-box p-3 panel bg-bg">
            <h4 className="small font-semibold mb-2">Upload Additional / Renewal Document</h4>
            <FileUpload
              label="Select Document File"
              helperText="PDF or scanned JPG up to 5MB"
              onFileSelect={(f) => {
                if (f) alert(`Document "${f.name}" uploaded successfully.`);
              }}
            />
          </div>
        </Card>
      )}

      {/* Tab 5: Account Security */}
      {activeTab === 'security' && (
        <Card title="Account Security & Password Management">
          <div className="max-w-md">
            <div className="form-field mb-2">
              <label className="form-label font-semibold small">Current Password</label>
              <input type="password" placeholder="Enter existing password" className="fld" />
            </div>
            <div className="form-field mb-2">
              <label className="form-label font-semibold small">New Password</label>
              <input type="password" placeholder="Enter new strong password" className="fld" />
            </div>
            <div className="form-field mb-3">
              <label className="form-label font-semibold small">Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" className="fld" />
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setToast('Password updated securely.');
                setTimeout(() => setToast(''), 3000);
              }}
            >
              Update Password
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
export default BeneficiaryProfile;
