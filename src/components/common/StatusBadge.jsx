import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, Truck, ShieldAlert } from 'lucide-react';

export function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/[\s_-]+/g, '_');

  let variant = 'default';
  let Icon = Clock;
  let label = status.replace(/_/g, ' ');

  switch (normalized) {
    case 'approved':
    case 'completed':
    case 'verified':
    case 'delivered':
    case 'active':
    case 'resolved':
    case 'within_sla':
      variant = 'success';
      Icon = CheckCircle2;
      break;

    case 'submitted':
    case 'in_progress':
    case 'assigned':
    case 'payment_completed':
    case 'in_transit':
    case 'ready_for_delivery':
    case 'urc_verified':
    case 'depot_approved':
      variant = 'info';
      Icon = Clock;
      break;

    case 'payment_pending':
    case 'pending':
    case 'draft':
    case 'review':
    case 'open':
    case 'under_notice':
    case 'near_breach':
      variant = 'warning';
      Icon = AlertCircle;
      break;

    case 'supply_order_issued':
      variant = 'primary';
      Icon = Truck;
      break;

    case 'rejected':
    case 'cancelled':
    case 'failed':
    case 'blocked':
    case 'breached':
    case 'account_locked':
      variant = 'danger';
      Icon = XCircle;
      break;

    case 'escalated':
      variant = 'danger';
      Icon = ShieldAlert;
      break;

    default:
      variant = 'neutral';
      Icon = Clock;
  }

  return (
    <span className={`status-badge status-${variant}`}>
      <Icon size={13} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
