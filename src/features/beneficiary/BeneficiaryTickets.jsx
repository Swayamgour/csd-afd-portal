import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, HelpCircle, MessageSquare, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import { ticketService } from '../../services/ticket.service.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BeneficiaryTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Supply Order');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getTickets({ userId: user?.id });
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill in subject and issue description.');
      return;
    }

    setSubmitting(true);
    try {
      await ticketService.createTicket({
        subject,
        category,
        subCategory: 'General Query',
        severity: 'Medium',
        priority: 'P2',
        source: 'Beneficiary Portal',
        userId: user?.id,
        userName: user?.name,
        userRole: 'Beneficiary',
        serviceNumber: user?.serviceNumber,
        description
      });
      setCreateModalOpen(false);
      setSubject('');
      setDescription('');
      setToast('Support ticket registered successfully.');
      loadTickets();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      render: (row) => <span className="font-semibold text-brand">{row.id}</span>
    },
    { header: 'Subject / Issue', accessor: 'subject' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Escalation Level',
      accessor: 'escalationLevel',
      render: (row) => (
        <span className="badge-pill badge-primary badge-sm">
          Level {row.escalationLevel || 1}
        </span>
      )
    },
    { header: 'Logged On', accessor: 'createdDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <Link to={`/helpdesk/tickets/${row.id}`} className="btn sm out">
          Conversation
        </Link>
      )
    }
  ];

  return (
    <div className="beneficiary-tickets-page">
      <PageHeader
        title="Support & Grievance Tickets"
        subtitle="Submit queries or grievance requests regarding AFD demands, payments, or dealer compliance."
        actions={
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Support Ticket
          </Button>
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          emptyTitle="No support tickets logged"
          emptyText="Need assistance with an AFD demand? Click Create Support Ticket to reach our helpdesk."
        />
      </Card>

      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Support Ticket"
        subtitle="Your request will be routed directly to the CSD AFD Helpdesk"
        maxWidth="540px"
        footer={
          <div className="modal-footer-btns">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleCreate}>
              Submit Ticket
            </Button>
          </div>
        }
      >
        <div className="ticket-form-body">
          <Select
            label="Issue Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              'Supply Order Generation',
              'Dealer Overcharging / Handling Fees',
              'Payment Reconciliation',
              'Entitlement & Quota Verification',
              'Delivery Delay',
              'Technical / Portal Login Trouble'
            ]}
            required
            className="mb-2"
          />

          <Input
            id="ticketSubject"
            label="Ticket Subject"
            placeholder="Brief summary of the issue..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="mb-2"
          />

          <div className="form-field mb-2">
            <label className="form-label font-semibold small">Detailed Description *</label>
            <textarea
              rows={4}
              className="fld w-full"
              placeholder="Provide complete details including Demand ID, dealership name, or error code..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
