import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  XCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge from '../../components/common/Badge.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import { formatDate } from '../../utils/formatters.js';
import {
  useGetTicketsQuery,
  useUpdateTicketStatusMutation,
  useAddTicketMessageMutation
} from '../helpdesk/ticketApi.js';

export default function CsdSupport() {
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  const queryParams = useMemo(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (severityFilter) p.severity = severityFilter;
    if (searchTerm) p.q = searchTerm;
    return p;
  }, [statusFilter, severityFilter, searchTerm]);

  const { data: tickets = [], isLoading, isFetching, refetch } = useGetTicketsQuery(queryParams);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();
  const [addMessage, { isLoading: isMessaging }] = useAddTicketMessageMutation();

  // Dynamic KPI Stats based on real database records
  const kpiStats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = tickets.filter((t) => t.status === 'CLOSED').length;
    const breached = tickets.filter((t) => t.sla?.resolutionBreached).length;

    return [
      { title: 'Open Tickets', value: open, subtitle: 'Unassigned / New' },
      { title: 'In Progress / Assigned', value: inProgress, subtitle: 'Being Investigated' },
      { title: 'Resolved & Closed', value: resolved + closed, subtitle: `${total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0}% Resolution Rate` },
      { title: 'SLA Breached', value: breached, subtitle: breached > 0 ? 'Critical Attention' : 'Compliant' },
    ];
  }, [tickets]);

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !actionStatus) return;
    try {
      await updateStatus({
        id: selectedTicket._id,
        status: actionStatus,
        resolutionSummary: actionStatus === 'RESOLVED' ? resolutionSummary : undefined,
        note: `Status updated to ${actionStatus} by Directorate Official`,
      }).unwrap();
      setSelectedTicket(null);
      setResolutionSummary('');
      setActionStatus('');
    } catch (err) {
      alert(err?.data?.message || 'Failed to update status');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await addMessage({
        id: selectedTicket._id,
        text: replyText.trim(),
        internal: false,
      }).unwrap();
      setReplyText('');
      alert('Official reply posted successfully');
    } catch (err) {
      alert(err?.data?.message || 'Failed to post reply');
    }
  };

  const columns = [
    {
      header: 'Ticket No',
      accessor: 'ticketNo',
      render: (row) => <span className="font-mono font-bold text-brand">{row.ticketNo}</span>,
    },
    {
      header: 'Complainant / Requester',
      accessor: 'requester',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-ink">{row.requester?.name || 'Authorized Beneficiary'}</div>
          <div className="text-[10px] text-muted font-mono">{row.requester?.mobile || row.requester?.email || row.requester?.userType}</div>
        </div>
      ),
    },
    {
      header: 'Subject & Category',
      accessor: 'subject',
      render: (row) => (
        <div>
          <div className="font-medium text-xs text-slate-800 line-clamp-1">{row.subject}</div>
          <span className="badge-pill badge-outline badge-sm text-[10px] uppercase font-mono">{row.category}</span>
        </div>
      ),
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => {
        const v = row.severity || 'MEDIUM';
        return <Badge variant={v === 'CRITICAL' ? 'danger' : v === 'HIGH' ? 'warning' : 'neutral'}>{v}</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const s = row.status;
        return (
          <Badge variant={s === 'RESOLVED' || s === 'CLOSED' ? 'success' : s === 'IN_PROGRESS' || s === 'ASSIGNED' ? 'brand' : 'warning'}>
            {s}
          </Badge>
        );
      },
    },
    {
      header: 'Assigned To',
      accessor: 'assignedTo',
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {row.assignedTo?.name || row.assignedGroup || 'Unassigned Queue'}
        </span>
      ),
    },
    {
      header: 'Logged Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-xs text-muted font-mono">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedTicket(row);
            setActionStatus(row.status);
          }}
          className="px-2.5 py-1 text-xs font-semibold bg-brand/10 text-brand rounded hover:bg-brand/20 transition flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review</span>
        </button>
      ),
    },
  ];

  return (
    <div className="csd-support-page space-y-6">
      <PageHeader
        title="Helpdesk & Grievance Directorate Oversight"
        subtitle="Live multi-tier service desk monitoring, SLA adherence metrics, and grievance investigations."
        breadcrumbs={[
          { label: 'Portal Administration', href: '/admin/dashboard' },
          { label: 'Support & Helpdesk' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Tickets"
          >
            <RefreshCw size={14} className={`mr-xs ${isFetching ? 'spin-icon' : ''}`} />
            {isFetching ? 'Syncing...' : 'Sync Tickets'}
          </Button>
        }
      />

      {/* Dynamic Live KPI Strip */}
      <div className="kpi-grid">
        {kpiStats.map((kpi, idx) => (
          <StatCard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Ticket No, Complainant, or Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {(statusFilter || severityFilter || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSeverityFilter('');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card title="Grievance & Support Tickets" subtitle={`Showing ${tickets.length} database records`}>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand mb-3" />
            <p className="font-semibold text-sm">Loading tickets from server...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-600">No support tickets found</p>
            <p className="text-xs text-slate-400 mt-1">Grievance registry is clear</p>
          </div>
        ) : (
          <DataTable columns={columns} data={tickets} />
        )}
      </Card>

      {/* Ticket Review & Action Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Review Ticket ${selectedTicket.ticketNo}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Complainant:</span>
                <span className="font-semibold text-ink">{selectedTicket.requester?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact:</span>
                <span className="font-mono">{selectedTicket.requester?.mobile || selectedTicket.requester?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="font-semibold">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status:</span>
                <Badge variant={selectedTicket.status === 'RESOLVED' ? 'success' : 'warning'}>{selectedTicket.status}</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{selectedTicket.subject}</h4>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </p>
            </div>

            {/* Quick Status Update Form */}
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <h5 className="font-semibold text-slate-800">Operational Resolution & Stage Update</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Target Status</label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="REOPENED">REOPENED</option>
                  </select>
                </div>
                {actionStatus === 'RESOLVED' && (
                  <div className="md:col-span-2">
                    <label className="block text-slate-600 mb-1">Resolution Summary (Mandatory for Resolution)</label>
                    <textarea
                      rows={2}
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      placeholder="Enter precise resolution notes and action taken..."
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  loading={isUpdating}
                  onClick={handleUpdateStatus}
                >
                  Apply Status Update
                </Button>
              </div>
            </div>

            {/* Post Message / Response */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <h5 className="font-semibold text-slate-800">Post Official Communication</h5>
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type reply to complainant..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  icon={MessageSquare}
                  loading={isMessaging}
                  disabled={!replyText.trim()}
                  onClick={handleSendReply}
                >
                  Post Official Reply
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
