import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';

export default function OemDocuments() {
  const docs = [
    { name: 'CSD Rate Contract Agreement 2024-2026.pdf', size: '4.8 MB', status: 'Active Legal' },
    { name: 'ARAI Homologation & Safety Compliance Certificates.pdf', size: '12.4 MB', status: 'Approved' },
    { name: 'Quarterly Price Revision Submission (Q4-2024).pdf', size: '2.1 MB', status: 'Pending HQ Scrutiny' }
  ];

  return (
    <div className="oem-docs-page">
      <PageHeader
        title="OEM Compliance & Legal Documentation"
        subtitle="Master Rate Contracts, ARAI emission & crash certificates, and quarterly pricing filings"
      />
      <div className="grid-2-col gap-2">
        <Card title="Empanelment Documents">
          {docs.map((d, i) => (
            <DocumentViewer key={i} name={d.name} size={d.size} status={d.status} />
          ))}
        </Card>

        <Card title="Upload Revised Pricing / Homologation Certificate">
          <FileUpload
            label="Upload Document"
            helperText="PDF up to 15MB"
            onFileSelect={(f) => {
              if (f) alert(`Document "${f.name}" uploaded to CSD Head Office scrutiny cell.`);
            }}
          />
        </Card>
      </div>
    </div>
  );
}
