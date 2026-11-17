import React, { useState } from 'react';
import { Upload, FileText, Camera, Building, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button.jsx';
import Select from '../../components/common/Select.jsx';
import Input from '../../components/common/Input.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import {
  useGetMyUrcsForDealerRequestsQuery,
  useForwardDealerRequestToUrcMutation,
  useSubmitDepotVerificationMutation,
  useUploadDealerRequestPhotosMutation,
} from './dealerRequestApi.js';
import { getErrorMessage } from '../../utils/apiError.js';
import { ErrorBanner, RemarksField, ActionBox } from './ActionBits.jsx';

export default function DepotActions({ request, close }) {
  const [activeTab, setActiveTab] = useState('letter201'); // 'letter201' or 'delegate'

  // Letter 201 Form State
  const [officerName, setOfficerName] = useState('');
  const [personnelNo, setPersonnelNo] = useState('');
  const [signatoryRole, setSignatoryRole] = useState('DEPOT_MANAGER');
  const [reportUrl, setReportUrl] = useState('');
  const [letterUrl, setLetterUrl] = useState('');
  const [photos, setPhotos] = useState([]);
  const [comments, setComments] = useState('');
  const [uploadingItem, setUploadingItem] = useState(null);

  // Delegate to URC Form State
  const { data: urcs = [], isLoading: loadingUrcs } = useGetMyUrcsForDealerRequestsQuery(undefined, { skip: request.status !== 'WITH_DEPOT' });
  const [urcId, setUrcId] = useState('');
  const [urcRemarks, setUrcRemarks] = useState('');

  const [err, setErr] = useState('');

  const [forwardToUrc, { isLoading: forwarding }] = useForwardDealerRequestToUrcMutation();
  const [submitVerification, { isLoading: submitting }] = useSubmitDepotVerificationMutation();
  const [uploadFile] = useUploadDealerRequestPhotosMutation();

  if (request.status !== 'WITH_DEPOT') return null;

  const handleDocUpload = async (field, file) => {
    if (!file) return;
    setUploadingItem(field);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await uploadFile(fd).unwrap();
      const url = Array.isArray(res) ? res[0]?.url : res?.files?.[0]?.url;
      if (url) {
        if (field === 'report') setReportUrl(url);
        if (field === 'letter') setLetterUrl(url);
      }
    } catch (e) {
      setErr(getErrorMessage(e, `Failed to upload ${field}`));
    } finally {
      setUploadingItem(null);
    }
  };

  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingItem('photos');
    setErr('');
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const res = await uploadFile(fd).unwrap();
      const list = Array.isArray(res) ? res : res?.files || [];
      const newUrls = list.map((item) => item.url).filter(Boolean);
      setPhotos((prev) => [...prev, ...newUrls]);
    } catch (e) {
      setErr(getErrorMessage(e, 'Failed to upload photos'));
    } finally {
      setUploadingItem(null);
    }
  };

  const submitLetter201 = async () => {
    setErr('');
    if (!officerName.trim()) return setErr('Verifying Officer Name is required.');
    if (!personnelNo.trim()) return setErr('Personnel Number is required.');
    if (!reportUrl) return setErr('Physical Verification Report document is required.');
    if (!letterUrl) return setErr('Signed Depot Confirmation Letter is required.');

    try {
      await submitVerification({
        id: request._id,
        verifyingOfficerName: officerName.trim(),
        verifyingOfficerPersonnelNo: personnelNo.trim(),
        signatoryRole,
        physicalVerificationReportUrl: reportUrl,
        depotConfirmationLetterUrl: letterUrl,
        showroomPhotos: photos,
        comments: comments.trim() || undefined,
      }).unwrap();
      close();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const submitDelegate = async () => {
    setErr('');
    if (!urcId) return setErr('Select a URC to verify the dealer.');
    try {
      await forwardToUrc({ id: request._id, urcId, remarks: urcRemarks.trim() || undefined }).unwrap();
      close();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <ActionBox title="Depot Actions (CSD Letter 201 / URC Verification)">
      <ErrorBanner message={err} />

      <div style={{ marginBottom: 12 }}>
        <Tabs
          tabs={[
            { id: 'letter201', label: '1. Depot Physical Verification (Letter 201)' },
            { id: 'delegate', label: '2. Delegate to Sub-URC' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'letter201' ? (
        <div>
          <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, marginBottom: 12, border: '1px solid #e2e8f0' }}>
            <div className="small font-semibold">CSD Letter 201 (04 Aug 2026) Direct Physical Verification</div>
            <div className="micro muted">
              Depot conducts physical verification of dealership premises and submits 3 items: Physical Verification Report, Showroom Photos, and Depot Confirmation Letter. (Depot does NOT demand documents from OEM).
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Input
              id="depot-officer-name"
              label="Verifying Officer Name"
              required
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              placeholder="e.g. Subedar Major Rajesh Kumar"
            />
            <Input
              id="depot-officer-no"
              label="Personnel Number"
              required
              value={personnelNo}
              onChange={(e) => setPersonnelNo(e.target.value)}
              placeholder="e.g. JC-123456"
            />
            <Select
              id="depot-signatory-role"
              label="Signatory Role"
              value={signatoryRole}
              onChange={(e) => setSignatoryRole(e.target.value)}
              options={[
                { value: 'DEPOT_MANAGER', label: 'Depot Manager' },
                { value: 'AREA_MANAGER', label: 'Area Manager' },
                { value: 'OIC', label: 'Officer-in-Charge (OIC)' },
                { value: 'OTHER', label: 'Other Authorized Official' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 12 }}>
            {/* 1. Physical Verification Report */}
            <div style={{ border: reportUrl ? '1px solid #86efac' : '1px dashed #cbd5e1', padding: 10, borderRadius: 6, background: reportUrl ? '#f0fdf4' : '#fff' }}>
              <div className="small font-semibold mb-0-5">1. Physical Verification Report *</div>
              {reportUrl ? (
                <div className="micro text-success mb-1 font-semibold">Report uploaded</div>
              ) : (
                <div className="micro muted mb-1">Upload verified premises report</div>
              )}
              <input type="file" id="depot-report-file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => handleDocUpload('report', e.target.files?.[0])} />
              <Button size="xs" variant="outline" icon={FileText} loading={uploadingItem === 'report'} onClick={() => document.getElementById('depot-report-file')?.click()}>
                {reportUrl ? 'Replace Report' : 'Upload Report'}
              </Button>
            </div>

            {/* 3. Depot Confirmation Letter */}
            <div style={{ border: letterUrl ? '1px solid #86efac' : '1px dashed #cbd5e1', padding: 10, borderRadius: 6, background: letterUrl ? '#f0fdf4' : '#fff' }}>
              <div className="small font-semibold mb-0-5">3. Depot Confirmation Letter *</div>
              {letterUrl ? (
                <div className="micro text-success mb-1 font-semibold">Letter uploaded</div>
              ) : (
                <div className="micro muted mb-1">Signed by Depot/Area Manager/OIC</div>
              )}
              <input type="file" id="depot-letter-file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => handleDocUpload('letter', e.target.files?.[0])} />
              <Button size="xs" variant="outline" icon={Building} loading={uploadingItem === 'letter'} onClick={() => document.getElementById('depot-letter-file')?.click()}>
                {letterUrl ? 'Replace Letter' : 'Upload Signed Letter'}
              </Button>
            </div>
          </div>

          {/* 2. Showroom Photographs */}
          <div style={{ border: '1px solid #e2e8f0', padding: 10, borderRadius: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="small font-semibold">2. Showroom Photographs ({photos.length} uploaded)</span>
              <input type="file" id="depot-photos-file" accept=".jpg,.jpeg,.png,.webp" multiple style={{ display: 'none' }} onChange={handlePhotosUpload} />
              <Button size="xs" variant="outline" icon={Camera} loading={uploadingItem === 'photos'} onClick={() => document.getElementById('depot-photos-file')?.click()}>
                Add Photos
              </Button>
            </div>
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ width: 50, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={p} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <RemarksField id="depot-verification-comments" label="Verification Remarks" value={comments} onChange={setComments} />

          <div style={{ marginTop: 12 }}>
            <Button size="sm" loading={submitting} onClick={submitLetter201}>
              Submit Depot Physical Verification (Letter 201)
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Select
            id="depot-urc"
            label="Select Subordinate URC"
            required
            value={urcId}
            onChange={(e) => setUrcId(e.target.value)}
            placeholder={loadingUrcs ? 'Loading URCs…' : urcs.length ? 'Select URC' : 'No active URC under this depot'}
            options={urcs.map((u) => ({ value: u._id, label: `${u.name} (${u.code})${u.city ? ` - ${u.city}` : ''}` }))}
          />
          <RemarksField id="depot-remarks" label="Instructions for URC" value={urcRemarks} onChange={setUrcRemarks} />
          <div style={{ marginTop: 10 }}>
            <Button size="sm" loading={forwarding} disabled={!urcs.length} onClick={submitDelegate}>
              Forward to URC for Site Visit
            </Button>
          </div>
        </div>
      )}
    </ActionBox>
  );
}
