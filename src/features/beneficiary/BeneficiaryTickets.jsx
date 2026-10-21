import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import { useGetTicketsQuery, useCreateTicketMutation } from '../helpdesk/ticketApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function BeneficiaryTickets() {
  const { user } = useAuth();
  const { data: ticketsData, isLoading: loading, isFetching, refetch } = useGetTicketsQuery();
  const [createTicket, { isLoading: submitting }] = useCreateTicketMutation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Supply Order');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState('');

  const tickets = Array.isArray(ticketsData)
    ? ticketsData
    : Array.isArray(ticketsData?.items)
    ? ticketsData.items
    : [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill in subject and issue description.');
      return;
    }

    try {
      await createTicket({
        subject,
        category,
        description,
        severity: 'MEDIUM',
      }).unwrap();

      setCreateModalOpen(false);
      setSubject('');
      setDescription('');
      setToast('Support ticket registered successfully.');
      setTimeout(() => setToast(''), 5000);
    } catch (err) {
      alert(err?.data?.message || err.message || 'Failed to create ticket');
    }
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'ticketNo',
      render: (row) => <span className="font-semibold text-brand">{row.ticketNo || row._id}</span>,
    },
    { header: 'Subject / Issue', accessor: 'subject' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => (
        <span className="badge-pill badge-primary badge-sm">
          {row.severity || 'NORMAL'}
        </span>
      ),
    },
    {
      header: 'Logged On',
      accessor: 'createdAt',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '-'),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      accessor: '_id',
      render: (row) => (
        <Link to={`/helpdesk/tickets`} className="btn sm out">
          Conversation
        </Link>
      ),
    },
  ];

  return (
    <div className="beneficiary-tickets-page">
      <PageHeader
        title="Support & Grievance Tickets"
        subtitle="Submit queries or grievance requests regarding AFD demands, payments, or dealer compliance."
        actions={
          <div className="row gap-1">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={PlusCircle}
              onClick={() => setCreateModalOpen(true)}
            >
              Raise New Grievance
            </Button>
          </div>
        }
      />

      {toast && (
        <div className="alert-banner success mb-2 small" role="alert">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      <Card>
        <DataTable columns={columns} data={tickets} loading={loading} />
      </Card>

      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Register Formal Grievance / Inquiry Ticket"
          subtitle="Direct escalation to CSD AFD Helpdesk nodal team"
          maxWidth="560px"
          footer={
            <div className="modal-footer-btns">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={submitting} onClick={handleCreate}>
                Submit Ticket
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreate} className="ticket-form">
            <Select
              id="ticketCat"
              label="Issue Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Supply Order', label: 'Supply Order Delivery Delay' },
                { value: 'Payment Reconciliation', label: 'Payment / Challan Verification' },
                { value: 'Dealer Compliance', label: 'Showroom / Dealership Overcharging' },
                { value: 'Eligibility', label: 'Rank / Service Entitlement Discrepancy' },
                { value: 'Technical Issue', label: 'Portal / Document Upload Glitch' },
              ]}
              className="mb-2"
            />
            <Input
              id="ticketSubject"
              label="Subject Brief"
              placeholder="e.g. Delay in vehicle handover from Hisar dealership"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="mb-2"
            />
            <div className="form-group mb-2">
              <label className="form-label" htmlFor="ticketDesc">Detailed Description</label>
              <textarea
                id="ticketDesc"
                rows={4}
                className="form-control"
                placeholder="Provide complete facts, demand number, depot name, or showroom details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
