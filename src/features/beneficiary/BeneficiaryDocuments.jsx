import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';

export default function BeneficiaryDocuments() {
  const documents = [
    { name: 'Availment Certificate (Counter-signed by CO).pdf', size: '1.4 MB', status: 'Verified' },
    { name: 'Latest Pay Slip / Pension Statement (Pay Level 8).pdf', size: '840 KB', status: 'Verified' },
    { name: 'PAN Card Copy (ABCDE1234F).pdf', size: '520 KB', status: 'Verified' },
    { name: 'Dealer Price Quota Confirmation (DLR-ND-082).pdf', size: '1.1 MB', status: 'Verified' },
    { name: 'Certified Supply Order (SO/CSD/DEL/2024/0912).pdf', size: '2.1 MB', status: 'Government Sealed' }
  ];

  return (
    <div className="beneficiary-docs-page">
      <PageHeader
        title="Beneficiary Documents Vault"
        subtitle="Digitally archived defence certificates, sanction orders, and verified government credentials"
      />

      <div className="grid-2-col gap-2 mb-3">
        <Card title="Verified Service & Procurement Documents">
          <div className="doc-list-grid">
            {documents.map((doc, idx) => (
              <DocumentViewer
                key={idx}
                name={doc.name}
                size={doc.size}
                status={doc.status}
              />
            ))}
          </div>
        </Card>

        <Card title="Upload New or Renewal Document">
          <FileUpload
            label="Upload Certificate (PDF / Scanned Copy)"
            helperText="Counter-signed Availment Certificate, Form-16, or Ex-Servicemen Identity Card up to 5MB"
            onFileSelect={(f) => {
              if (f) alert(`Document "${f.name}" uploaded to secure CSD vault.`);
            }}
          />
        </Card>
      </div>
    </div>
  );
}
