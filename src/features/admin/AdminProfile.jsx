import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="admin-profile-page">
      <PageHeader
        title="System Administrator Credentials"
        subtitle="Cryptographic key fingerprint, security clearance, and root authorization profile"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Profile' }
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
        <Card title="Root Security Principal">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#991b1b', color: '#fff', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              SA
            </div>
            <h3 style={{ margin: '0 0 0.25rem 0' }}>{user?.name || 'System Administrator'}</h3>
            <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
              Superuser / Full Authority
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>OFFICIAL PRINCIPAL</span>
              <strong>admin@csdindia.gov.in</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>GPG KEY ID</span>
              <span style={{ fontFamily: 'monospace' }}>4A89 7DF1 92B0 CA14</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>SECURITY CLEARANCE</span>
              <span>Level 1 Secret (MoD IT Infrastructure)</span>
            </div>
          </div>
        </Card>

        <Card title="Root Privileges & Delegation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Privileged Operations</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <li>Global tenant user provisioning, account termination, and lockout overrides</li>
                <li>Emergency maintenance mode triggering and cyber treasury pause</li>
                <li>Cryptographic log verification and immutable export</li>
                <li>System-wide broadcast dispatch across mobile and web</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem' }}>
              <Button variant="outline">Rotate SSH Keypair</Button>
              <Button variant="secondary">Regenerate 2FA Backup Codes</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
