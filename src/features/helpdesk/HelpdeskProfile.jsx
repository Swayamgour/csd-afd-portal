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

      <div className="portal-grid-sidebar-content">
        <Card title="Officer Identity">
          <div className="portal-avatar-wrapper mb-md">
            <div className="portal-avatar-circle">
              HD
            </div>
            <h3 className="portal-profile-name">{user?.name || 'Helpdesk Agent'}</h3>
            <span className="badge badge-warning-subtle">
              Level 1 Support Specialist
            </span>
          </div>

          <div className="portal-flex-col-gap-sm-text">
            <div>
              <span className="helpdesk-label-muted">AGENT ID</span>
              <strong>HD-DEL-0419</strong>
            </div>
            <div>
              <span className="helpdesk-label-muted">OFFICIAL EMAIL</span>
              <span>helpdesk.delhi@csdindia.gov.in</span>
            </div>
            <div>
              <span className="helpdesk-label-muted">TELEPHONY EXTENSION</span>
              <strong>Ext: 4402 (Queue: AFD-L1-General)</strong>
            </div>
            <div>
              <span className="helpdesk-label-muted">CURRENT SHIFT</span>
              <span>General Shift (09:00 - 17:30 IST)</span>
            </div>
          </div>
        </Card>

        <Card title="Queue Entitlements & Permissions">
          <div className="portal-flex-col-gap-md">
            <div className="portal-info-box">
              <h4 className="portal-box-title">Assigned Queues</h4>
              <div className="portal-tags-wrap">
                <span className="badge badge-info-subtle">ePay Failure Reconciliations</span>
                <span className="badge badge-info-subtle">Entitlement Verification (PBOR)</span>
                <span className="badge badge-info-subtle">Dealer Delivery Delays</span>
              </div>
            </div>

            <div className="portal-info-box">
              <h4 className="portal-box-title">Escalation Protocol Authority</h4>
              <p className="portal-box-desc">
                Certified to escalate directly to Level 2 Technical Team upon payment gateway timeout verification. Level 3 and Level 4 escalations require Supervisor endorsement.
              </p>
            </div>

            <div className="portal-flex-end mt-md">
              <Button variant="outline">Request Queue Shift Modification</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
