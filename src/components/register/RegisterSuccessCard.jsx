import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Clock } from "lucide-react";

export function RegisterSuccessCard({ registeredUser, f }) {
  return (
    <div className="panel logincard authcard reg-success-card">
      <div className="reg-success-icon-wrap">
        <CheckCircle2 size={40} />
      </div>

      <h1 className="reg-success-title">Registration Successful!</h1>

      <div className="reg-success-badge">
        <ShieldCheck size={16} /> Email Verified via OTP
      </div>

      {/* Pending Status Alert Banner */}
      <div className="reg-pending-alert">
        <div className="row align-center gap-1 mb-1">
          <Clock size={20} color="var(--color-warning)" />
          <strong className="reg-pending-title">
            Account Status: PENDING CS DIRECTOR APPROVAL
          </strong>
        </div>
        <p className="reg-pending-desc">
          Your account has been registered and your official email has been
          verified. You can log in to view products and search the catalog.
          However, <strong>Demand Generation</strong> will be available after
          your account is approved by the CS Director.
        </p>
      </div>

      {/* Beneficiary Details Summary Card */}
      <div className="reg-summary-card">
        <div className="reg-summary-row">
          <span className="reg-summary-label">Beneficiary Name:</span>
          <strong className="reg-summary-val">
            {registeredUser?.name || f.name}
          </strong>
        </div>
        <div className="reg-summary-row">
          <span className="reg-summary-label">Username:</span>
          <strong className="reg-summary-val">
            {registeredUser?.username || f.username}
          </strong>
        </div>
        <div className="reg-summary-row">
          <span className="reg-summary-label">Verified Email:</span>
          <span className="text-green fw-bold">{f.email} ✓</span>
        </div>
        <div className="reg-summary-row">
          <span className="reg-summary-label">Grocery Card ID:</span>
          <strong className="reg-summary-val">{f.cardId}</strong>
        </div>
      </div>

      <Link
        to="/login"
        className="btn big wide row align-center justify-center text-center"
      >
        Proceed to Beneficiary Login
      </Link>
    </div>
  );
}

export default RegisterSuccessCard;
