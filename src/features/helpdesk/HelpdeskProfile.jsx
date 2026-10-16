import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const HelpdeskProfile = () => {
  const { user } = useAuth();

  return (
    <div className="helpdesk-profile-page">
      <PageHeader
        title="Helpdesk Officer Credentials"
        subtitle="Operational shift parameters, agent extension, and queue assignments"
        breadcrumbs={[
          { label: 'Helpdesk', href: '/helpdesk/dashboard' },
          { label: 'Profile' }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
        <Card title="Officer Identity">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--navy)', color: '#fff', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              HD
            </div>
            <h3 style={{ margin: '0 0 0.25rem 0' }}>{user?.name || 'Helpdesk Agent'}</h3>
            <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
              Level 1 Support Specialist
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>AGENT ID</span>
              <strong>HD-DEL-0419</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>OFFICIAL EMAIL</span>
              <span>helpdesk.delhi@csdindia.gov.in</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>TELEPHONY EXTENSION</span>
              <strong>Ext: 4402 (Queue: AFD-L1-General)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>CURRENT SHIFT</span>
              <span>General Shift (09:00 - 17:30 IST)</span>
            </div>
          </div>
        </Card>

        <Card title="Queue Entitlements & Permissions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Assigned Queues</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>ePay Failure Reconciliations</span>
                <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Entitlement Verification (PBOR)</span>
                <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Dealer Delivery Delays</span>
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Escalation Protocol Authority</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                Certified to escalate directly to Level 2 Technical Team upon payment gateway timeout verification. Level 3 and Level 4 escalations require Supervisor endorsement.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="outline">Request Queue Shift Modification</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
