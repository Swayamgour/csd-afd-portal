import React from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DocumentViewer from '../../components/common/DocumentViewer.jsx';
import FileUpload from '../../components/common/FileUpload.jsx';

export default function DealerDocuments() {
  const docs = [
    { name: 'Dealer Institutional Agreement & Zero Fee Undertaking.pdf', size: '2.4 MB', status: 'Approved' },
    { name: 'Vehicle Handover Form (Template Annexure-G).pdf', size: '420 KB', status: 'Official Form' },
    { name: 'GST Exemption & Tax Invoicing Directive.pdf', size: '890 KB', status: 'Circular' }
  ];

  return (
    <div className="dealer-docs-page">
      <PageHeader
        title="Dealership Delivery Documents & Proofs"
        subtitle="Customer delivery receipts, GST invoicing circulars, and zero fee undertakings"
      />
      <div className="grid-2-col gap-2">
        <Card title="Official Delivery Documents">
          {docs.map((d, i) => (
            <DocumentViewer key={i} name={d.name} size={d.size} status={d.status} />
          ))}
        </Card>
        <Card title="Upload Signed Gatepass / Delivery Proof">
          <FileUpload
            label="Upload Customer Handover Receipt"
            helperText="Signed handover proof (PDF / JPG up to 5MB)"
            onFileSelect={(f) => {
              if (f) alert(`Document "${f.name}" uploaded to CSD records.`);
            }}
          />
        </Card>
      </div>
    </div>
  );
}
