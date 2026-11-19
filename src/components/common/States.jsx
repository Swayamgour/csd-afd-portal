import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, SearchX, RefreshCw, CloudOff } from 'lucide-react';
import Button from './Button.jsx';

export const UnavailableState = ({ title = 'Not available', text = 'This information is not available right now. Please try again later.', onRetry }) => (
  <div className="state" role="alert">
    <CloudOff aria-hidden size={36} />
    <h2>{title}</h2>
    <p>{text}</p>
    {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
  </div>
);

export const InlineNote = ({ children }) => <p className="muted" role="status">{children}</p>;

export const HomeLink = () => <Link className="btn" to="/">Go to home</Link>;

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
