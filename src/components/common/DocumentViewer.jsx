import React from 'react';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import Button from './Button.jsx';

export default function DocumentViewer({
  name,
  size,
  status = 'Verified',
  url = '#',
  onDownload
}) {
  return (
    <div className="panel doc-viewer-item between">
      <div className="doc-meta-left row align-center gap-1">
        <div className="doc-icon-wrap">
          <FileText size={22} className="text-brand" />
        </div>
        <div>
          <h4 className="doc-name font-medium small mb-0">{name}</h4>
          <div className="doc-sub small muted row align-center gap-1">
            <span>{size}</span>
            <span>·</span>
            <span className="doc-status text-green font-medium">
              <ShieldCheck size={12} className="inline mr-1" />
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="doc-actions-right row gap-1">
        <Button
          size="sm"
          variant="outline"
          icon={Download}
          onClick={() => {
            if (onDownload) onDownload();
            else alert(`Downloading authentic government certified document: ${name}`);
          }}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
