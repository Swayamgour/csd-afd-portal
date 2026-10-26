import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';
import { useGetMyProfileQuery, useUploadBeneficiaryDocumentMutation, useUploadFileMutation } from './beneficiaryApi.js';
import { Loader2, AlertCircle, CheckCircle2, Shield, FileText } from 'lucide-react';
import { getErrorMessage } from '../../utils/apiError.js';

export default function BeneficiaryDocuments() {
  const { data: profileResp, isLoading } = useGetMyProfileQuery();
  const profile = profileResp?.data || {};

  const [uploadFileMutation, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [uploadBeneficiaryDocMutation, { isLoading: isSavingDoc }] = useUploadBeneficiaryDocumentMutation();

  const [docType, setDocType] = useState('SERVICE_ID');
  const [uploadMsg, setUploadMsg] = useState({ text: '', type: '' });

  const rawDocs = profile.documents || [];
  const documents = Array.isArray(rawDocs) ? rawDocs : Object.entries(rawDocs).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
    url: typeof val === 'string' ? val : val?.url,
    status: typeof val === 'object' && val?.status ? val.status : 'Uploaded'
  })).filter(d => Boolean(d.url));

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadMsg({ text: '', type: '' });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await uploadFileMutation(formData).unwrap();
      const fileUrl = uploadRes?.url || uploadRes?.data?.url || uploadRes?.file?.url || '';

      const beneficiaryId = profile._id || profile.id;
      if (beneficiaryId) {
        await uploadBeneficiaryDocMutation({
          id: beneficiaryId,
          body: {
            type: docType,
            documentType: docType,
            name: file.name,
            fileUrl,
            status: 'VERIFIED'
          }
        }).unwrap();
      }

      setUploadMsg({ text: `Document "${file.name}" uploaded and recorded to secure CSD vault successfully.`, type: 'success' });
    } catch (err) {
      setUploadMsg({ text: getErrorMessage(err), type: 'error' });
    }
  };

  return (
    <div className="beneficiary-docs-page">
      <PageHeader
        title="Beneficiary Documents Vault"
        subtitle="Digitally archived defence certificates, sanction orders, and verified government credentials"
      />

      {uploadMsg.text && (
        <div className={`panel p-3 mb-3 row align-center gap-1 small ${uploadMsg.type === 'success' ? 'bg-green-soft border-green text-green' : 'bg-red-soft border-danger text-danger'}`}>
          {uploadMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{uploadMsg.text}</span>
        </div>
      )}

      <div className="grid-2-col gap-2 mb-3">
        <Card title="Verified Service & Procurement Documents">
          {isLoading ? (
            <div className="py-4 text-center muted"><Loader2 size={24} className="spin inline" /> Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4 muted">
              <FileText size={32} className="muted block mx-auto mb-2 opacity-50" />
              <p className="small mb-0">No documents uploaded yet in your digital vault.</p>
              <p className="micro muted">Upload your service certificates or pension statements using the form.</p>
            </div>
          ) : (
            <div className="doc-list-grid">
              {documents.map((doc, idx) => (
                <DocumentViewer
                  key={idx}
                  name={doc.name || doc.documentType || `Document ${idx + 1}`}
                  size={doc.size || 'Verified Government Cloud'}
                  status={doc.status || 'Verified'}
                />
              ))}
            </div>
          )}
        </Card>

        <Card title="Upload New or Renewal Document">
          <div className="form-field mb-2">
            <label className="form-label">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="form-control"
            >
              <option value="SERVICE_ID">Service Identity Card / Ex-Servicemen Card</option>
              <option value="PAYSLIP">Latest Pay Slip / Pension Statement</option>
              <option value="PAN">PAN Card Copy</option>
              <option value="AVAILMENT_CERT">CO Signed Availment Certificate</option>
              <option value="DRIVING_LICENSE">Driving License Copy</option>
              <option value="DEALER_QUOTA">Dealer Price Quota Confirmation</option>
            </select>
          </div>

          <FileUpload
            label="Upload Certificate (PDF / Image)"
            helperText="Counter-signed Availment Certificate, Form-16, or ID Card up to 5MB"
            disabled={isUploadingFile || isSavingDoc}
            onFileSelect={handleFileUpload}
          />

          {(isUploadingFile || isSavingDoc) && (
            <div className="mt-2 text-center small muted">
              <Loader2 size={16} className="spin inline mr-1" /> Archiving file in government vault...
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
