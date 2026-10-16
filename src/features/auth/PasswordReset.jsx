import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { authService } from '../../services/auth.service.js';

export default function PasswordReset() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your Service Number, PAN or registered Email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.requestPasswordReset({ identifier });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="mb-2">
        <Link to="/login" className="row align-center gap-1 link small font-semibold">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>

      <div className="reset-head mb-3">
        <h2 className="reset-title">Reset Your Portal Password</h2>
        <p className="reset-sub muted small">
          Enter your Defence Service Number or registered email to receive a password recovery link.
        </p>
      </div>

      {submitted ? (
        <div className="panel p-3 text-center bg-green-soft border-green mb-2">
          <CheckCircle2 size={36} className="text-green mx-auto mb-1" />
          <h3 className="small font-bold text-ink">Reset Instructions Sent</h3>
          <p className="small muted mb-2">
            If an account matches <b>{identifier}</b>, password reset instructions and security token have been transmitted.
          </p>
          <Link to="/login" className="btn btn-primary small">
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="resetIdentifier"
            label="Service Number / User ID / Email"
            placeholder="e.g. JC-765432X or officer@gov.in"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={KeyRound}
            error={error}
            required
            className="mb-2"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="wide mb-2"
          >
            Send Recovery Instructions
          </Button>
        </form>
      )}
    </div>
  );
}
