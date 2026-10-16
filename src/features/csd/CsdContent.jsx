import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, CheckCircle2, Download, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import { contentService } from '../../services/content.service.js';

export default function CsdContent() {
  const [activeTab, setActiveTab] = useState('circulars');
  const [circulars, setCirculars] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [newCircular, setNewCircular] = useState({
    title: '',
    number: '',
    category: 'Circular',
    summary: '',
    fileSize: '1.2 MB'
  });

  const loadContent = async () => {
    setLoading(true);
    try {
      const [cirList, banList] = await Promise.all([
        contentService.getCirculars(),
        contentService.getBanners()
      ]);
      setCirculars(cirList);
      setBanners(banList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleCreateCircular = async (e) => {
    e.preventDefault();
    try {
      await contentService.createCircular(newCircular);
      setModalOpen(false);
      setToast('New policy circular published to portal.');
      loadContent();
    } catch (err) {
      alert(err.message);
    }
  };

  const tabs = [
    { id: 'circulars', label: 'Policy Circulars & Office Orders', icon: FileText },
    { id: 'banners', label: 'Portal Banners & Notices', icon: ImageIcon }
  ];

  const circularColumns = [
    {
      header: 'Order / Circular No.',
      accessor: 'number',
      render: (row) => <span className="font-mono font-semibold text-brand">{row.number}</span>
    },
    { header: 'Title & Subject', accessor: 'title', render: (row) => <div><span className="font-semibold block">{row.title}</span><span className="micro muted">{row.summary}</span></div> },
    { header: 'Classification', accessor: 'category' },
    { header: 'Issued By', accessor: 'author' },
    { header: 'Date', accessor: 'publishedDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'PDF',
      accessor: 'id',
      render: (row) => (
        <button
          type="button"
          className="btn sm out"
          onClick={() => alert(`Downloading Certified Government Gazette: ${row.number}`)}
        >
          <Download size={13} />
          <span>PDF</span>
        </button>
      )
    }
  ];

  const bannerColumns = [
    { header: 'Banner ID', accessor: 'id', render: (row) => <span className="font-mono font-semibold">{row.id}</span> },
    { header: 'Banner Title', accessor: 'title', render: (row) => <span className="font-semibold">{row.title}</span> },
    { header: 'Target Position', accessor: 'position' },
    { header: 'Active Window', accessor: 'startDate', render: (row) => <span className="small">{row.startDate} to {row.endDate}</span> },
    { header: 'Total Views / Clicks', accessor: 'clicks', render: (row) => <span className="font-bold text-brand">{row.clicks.toLocaleString()}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="csd-content-page">
      <PageHeader
        title="Official Content & Circulars Directorate"
        subtitle="Publish MoD directives, quarterly policy circulars, advisory notifications, and promotional banners"
        actions={
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => setModalOpen(true)}
          >
            Publish Circular / Order
          </Button>
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-3" />

      {activeTab === 'circulars' ? (
        <Card title="Published Policy Directives">
          <DataTable
            columns={circularColumns}
            data={circulars}
            loading={loading}
          />
        </Card>
      ) : (
        <Card title="Homepage Banners & Tickers">
          <DataTable
            columns={bannerColumns}
            data={banners}
            loading={loading}
          />
        </Card>
      )}

      {/* Publish Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Official Policy Circular"
        subtitle="This circular will be digitally published across all URCs and depots"
        maxWidth="540px"
        footer={
          <div className="modal-footer-btns">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCircular}>
              Publish Circular
            </Button>
          </div>
        }
      >
        <div className="publish-form">
          <Input
            id="cirTitle"
            label="Circular Title"
            placeholder="e.g. Revised Guidelines on EV Two-Wheelers 2024"
            value={newCircular.title}
            onChange={(e) => setNewCircular({ ...newCircular, title: e.target.value })}
            required
            className="mb-2"
          />

          <div className="row gap-1 mb-2">
            <div className="flex-1">
              <Input
                id="cirNum"
                label="Dispatch File Number"
                placeholder="CSD/AFD/POL/2024/..."
                value={newCircular.number}
                onChange={(e) => setNewCircular({ ...newCircular, number: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <Select
                label="Document Classification"
                value={newCircular.category}
                onChange={(e) => setNewCircular({ ...newCircular, category: e.target.value })}
                options={['Circular', 'Office Order', 'Advisory Notice', 'Gazette Extract']}
                required
              />
            </div>
          </div>

          <div className="form-field mb-2">
            <label className="form-label font-semibold small">Executive Summary *</label>
            <textarea
              rows={3}
              className="fld w-full"
              placeholder="Brief summary of revised rules..."
              value={newCircular.summary}
              onChange={(e) => setNewCircular({ ...newCircular, summary: e.target.value })}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
