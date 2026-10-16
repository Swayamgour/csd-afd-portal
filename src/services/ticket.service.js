import { apiClient } from './apiClient.js';
import { MOCK_TICKETS, MOCK_HELPDESK_METRICS, MOCK_CALL_RECORDS, MOCK_FEEDBACK } from '../data/mock/tickets.mock.js';

let ticketsStore = [...MOCK_TICKETS];
let metricsStore = { ...MOCK_HELPDESK_METRICS };

export const ticketService = {
  async getTickets(filter = {}) {
    let list = [...ticketsStore];
    if (filter.status && filter.status !== 'All') {
      list = list.filter((t) => t.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.priority && filter.priority !== 'All') {
      list = list.filter((t) => t.priority.toLowerCase() === filter.priority.toLowerCase());
    }
    if (filter.severity && filter.severity !== 'All') {
      list = list.filter((t) => t.severity.toLowerCase() === filter.severity.toLowerCase());
    }
    if (filter.assignedAgentId) {
      list = list.filter((t) => t.assignedAgentId === filter.assignedAgentId);
    }
    if (filter.unassigned) {
      list = list.filter((t) => !t.assignedAgentId);
    }
    if (filter.escalated) {
      list = list.filter((t) => t.escalationLevel > 1 || t.status === 'Escalated');
    }
    if (filter.userId) {
      list = list.filter((t) => t.userId === filter.userId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    const res = await apiClient.get('/tickets', list);
    return res.data;
  },

  async getTicketById(id) {
    const item = ticketsStore.find((t) => t.id === id);
    const res = await apiClient.get(`/tickets/${id}`, item || null);
    return res.data;
  },

  async getMetrics() {
    const res = await apiClient.get('/tickets/metrics', metricsStore);
    return res.data;
  },

  async getCallRecords() {
    const res = await apiClient.get('/tickets/calls', MOCK_CALL_RECORDS);
    return res.data;
  },

  async getFeedback() {
    const res = await apiClient.get('/tickets/feedback', MOCK_FEEDBACK);
    return res.data;
  },

  async createTicket(ticketData) {
    const newTicket = {
      id: `HD-2024-${Math.floor(40000 + Math.random() * 9000)}`,
      status: 'Open',
      escalationLevel: 1,
      escalationPath: [
        { level: 1, title: 'Helpdesk Agent (L1)', owner: 'Unassigned', status: 'Current', timestamp: new Date().toLocaleString() },
        { level: 2, title: 'Technical Team (L2)', owner: '-', status: 'Pending', timestamp: null },
        { level: 3, title: 'Specialist / Dev (L3)', owner: '-', status: 'Pending', timestamp: null },
        { level: 4, title: 'CSD-HO Escalation (L4)', owner: '-', status: 'Pending', timestamp: null },
      ],
      createdDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      slaTargetDate: new Date(Date.now() + 48 * 3600000).toISOString().replace('T', ' ').slice(0, 16),
      slaStatus: 'Within_SLA',
      slaHoursRemaining: 48,
      conversation: [
        {
          id: `msg-${Date.now()}`,
          sender: ticketData.userName,
          senderRole: ticketData.userRole || 'Beneficiary',
          timestamp: new Date().toLocaleString(),
          message: ticketData.description,
          attachments: ticketData.attachments || []
        }
      ],
      timeline: [
        { step: 'Created', by: ticketData.userName, date: new Date().toLocaleString(), note: ticketData.subject }
      ],
      ...ticketData
    };
    ticketsStore = [newTicket, ...ticketsStore];
    metricsStore.openTickets += 1;
    const res = await apiClient.post('/tickets', newTicket);
    return res.data;
  },

  async replyTicket(ticketId, { sender, senderRole, message, attachments = [] }) {
    const idx = ticketsStore.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      const ticket = { ...ticketsStore[idx] };
      ticket.conversation = [
        ...ticket.conversation,
        {
          id: `msg-${Date.now()}`,
          sender,
          senderRole,
          timestamp: new Date().toLocaleString(),
          message,
          attachments
        }
      ];
      ticket.timeline = [
        ...ticket.timeline,
        { step: 'Reply Added', by: sender, date: new Date().toLocaleString(), note: message.slice(0, 60) + '...' }
      ];
      ticketsStore[idx] = ticket;
      const res = await apiClient.post(`/tickets/${ticketId}/reply`, ticket);
      return res.data;
    }
    throw new Error('Ticket not found');
  },

  async escalateTicket(ticketId, { targetLevel, reason, escalatedBy }) {
    const idx = ticketsStore.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      const ticket = { ...ticketsStore[idx] };
      const level = Math.min(4, targetLevel || ticket.escalationLevel + 1);
      ticket.escalationLevel = level;
      ticket.status = 'Escalated';

      ticket.escalationPath = ticket.escalationPath.map((p) => {
        if (p.level < level) return { ...p, status: 'Completed' };
        if (p.level === level) return { ...p, status: 'Current', timestamp: new Date().toLocaleString() };
        return { ...p, status: 'Pending' };
      });

      ticket.timeline = [
        ...ticket.timeline,
        {
          step: `Escalated to Level ${level}`,
          by: escalatedBy,
          date: new Date().toLocaleString(),
          note: `Escalation reason: ${reason}`
        }
      ];

      ticketsStore[idx] = ticket;
      metricsStore.escalatedTickets += 1;
      const res = await apiClient.put(`/tickets/${ticketId}/escalate`, ticket);
      return res.data;
    }
    throw new Error('Ticket not found');
  },

  async resolveTicket(ticketId, { resolutionNote, resolvedBy }) {
    const idx = ticketsStore.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      const ticket = { ...ticketsStore[idx], status: 'Resolved' };
      ticket.timeline = [
        ...ticket.timeline,
        { step: 'Resolved', by: resolvedBy, date: new Date().toLocaleString(), note: resolutionNote }
      ];
      ticketsStore[idx] = ticket;
      metricsStore.resolvedToday += 1;
      metricsStore.openTickets = Math.max(0, metricsStore.openTickets - 1);
      const res = await apiClient.put(`/tickets/${ticketId}/resolve`, ticket);
      return res.data;
    }
    throw new Error('Ticket not found');
  },

  async closeTicket(ticketId, { closedBy }) {
    const idx = ticketsStore.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      const ticket = { ...ticketsStore[idx], status: 'Closed' };
      ticket.timeline = [
        ...ticket.timeline,
        { step: 'Closed', by: closedBy, date: new Date().toLocaleString(), note: 'Ticket archived after confirmation' }
      ];
      ticketsStore[idx] = ticket;
      const res = await apiClient.put(`/tickets/${ticketId}/close`, ticket);
      return res.data;
    }
    throw new Error('Ticket not found');
  },

  async assignTicket(ticketId, { agentId, agentName, assignedBy }) {
    const idx = ticketsStore.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      const ticket = {
        ...ticketsStore[idx],
        assignedAgentId: agentId,
        assignedAgentName: agentName,
        status: ticketsStore[idx]?.status === 'Open' ? 'Assigned' : ticketsStore[idx]?.status
      };
      ticket.timeline = [
        ...ticket.timeline,
        { step: `Assigned to ${agentName}`, by: assignedBy, date: new Date().toLocaleString(), note: 'Owner reassigned' }
      ];
      ticketsStore[idx] = ticket;
      const res = await apiClient.put(`/tickets/${ticketId}/assign`, ticket);
      return res.data;
    }
    throw new Error('Ticket not found');
  }
};
