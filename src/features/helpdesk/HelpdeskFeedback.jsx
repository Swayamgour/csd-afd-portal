import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';

export const HelpdeskFeedback = () => {
  const feedbacks = [
    { id: 'FB-881', citizen: 'Col (Retd) D. S. Brar', ticketId: 'HD-2024-8801', rating: '⭐⭐⭐⭐⭐ (5/5)', comment: 'Resolved my payment challan issue within 2 hours. Extremely prompt service.', date: '14 Oct 2024' },
    { id: 'FB-880', citizen: 'Subedar Major K. Raman', ticketId: 'HD-2024-8802', rating: '⭐⭐⭐⭐ (4/5)', comment: 'Good guidance regarding dealer allocation for Hyundai Creta.', date: '13 Oct 2024' },
    { id: 'FB-879', citizen: 'Smt. Kamla Bai (Spouse)', ticketId: 'HD-2024-8799', rating: '⭐⭐⭐⭐⭐ (5/5)', comment: 'The agent was very polite and helped with digital PPO upload.', date: '12 Oct 2024' },
    { id: 'FB-878', citizen: 'Havildar P. C. Joshi', ticketId: 'HD-2024-8780', rating: '⭐⭐⭐ (3/5)', comment: 'Took 24 hours to clear the payment status, but issue got resolved.', date: '11 Oct 2024' }
  ];

  const columns = [
    { header: 'Feedback ID', accessor: 'id', render: (f) => <strong>{f.id}</strong> },
    { header: 'Beneficiary', accessor: 'citizen' },
    { header: 'Linked Ticket', accessor: 'ticketId' },
    { header: 'Citizen Rating', accessor: 'rating', render: (f) => <span className="font-semibold">{f.rating}</span> },
    { header: 'Beneficiary Remarks', accessor: 'comment', render: (f) => <span className="portal-italic-comment">"{f.comment}"</span> },
    { header: 'Received On', accessor: 'date' }
  ];

  return (
    <div className="helpdesk-feedback-page">
      <PageHeader
        title="Citizen Feedback & CSAT Survey Scores"
        subtitle="Post-resolution satisfaction survey responses and citizen feedback audits"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Feedback' }
        ]}
      />

      <div className="csd-stats-grid mb-md">
        <StatCard title="Overall CSAT Score" value="4.7 / 5.0" change="+0.2" isPositive={true} subtitle="94% Satisfied" />
        <StatCard title="Total Surveys Completed" value="842" subtitle="This Month" />
        <StatCard title="5-Star Ratings" value="712" subtitle="84.5% of total" />
        <StatCard title="Net Promoter Score (NPS)" value="+68" isPositive={true} subtitle="Benchmark >= 50" />
      </div>

      <Card title="Recent Beneficiary Survey Responses">
        <DataTable columns={columns} data={feedbacks} />
      </Card>
    </div>
  );
};
