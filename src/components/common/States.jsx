import React from 'react';
import { Loader2, AlertTriangle, SearchX, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';

export function LoadingState({ message, text, className = '' }) {
  const displayMsg = text || message || 'Loading records...';
  return (
    <div className={`panel state-box ${className}`} role="status">
      <Loader2 className="spin text-brand" size={36} aria-hidden="true" />
      <p className="state-message font-medium">{displayMsg}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  message = 'There are no items available to display right now.',
  icon: Icon = SearchX,
  action,
  className = ''
}) {
  return (
    <div className={`panel state-box ${className}`}>
      <Icon size={44} className="text-muted" aria-hidden="true" />
      <h3 className="state-title">{title}</h3>
      <p className="state-message muted small">{message}</p>
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'An unexpected server error occurred while retrieving this information.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`panel state-box state-error ${className}`} role="alert">
      <AlertTriangle size={44} className="text-danger" aria-hidden="true" />
      <h3 className="state-title">{title}</h3>
      <p className="state-message muted small">{message}</p>
      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
