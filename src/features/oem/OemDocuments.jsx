import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';

export default function OemDocuments() {
  const [toastMessage, setToastMessage] = useState(null);

  const docs = [
    { name: 'CSD Rate Contract Agreement 2024-2026.pdf', size: '4.8 MB', status: 'Active Legal' },
    { name: 'ARAI Homologation & Safety Compliance Certificates.pdf', size: '12.4 MB', status: 'Approved' },
    { name: 'Quarterly Price Revision Submission (Q4-2024).pdf', size: '2.1 MB', status: 'Pending HQ Scrutiny' }
  ];

  return (
    <div className="oem-docs-page space-y-4">
      <PageHeader
        title="OEM Compliance & Legal Documentation"
        subtitle="Master Rate Contracts, ARAI emission & crash certificates, and quarterly pricing filings"
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
              if (f) {
                setToastMessage(`Document "${f.name}" uploaded to CSD Head Office scrutiny cell.`);
                setTimeout(() => setToastMessage(null), 5000);
              }
            }}
          />
        </Card>
      </div>
    </div>
  );
}
