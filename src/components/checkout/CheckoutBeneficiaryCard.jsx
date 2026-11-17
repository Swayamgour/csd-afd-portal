import React from 'react';
import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';

export function CheckoutBeneficiaryCard({ product, beneficiary }) {
  const selectedState = product?.selectedState || product?.state || beneficiary.priceZone;

  return (
    <div className="checkout-card">
      <div className="checkout-card-header">
        <div className="checkout-card-title">
          <User size={20} color="#1e4fd8" />
          <span>Beneficiary Details</span>
        </div>
        <span className="checkout-spec-pill">
          <Lock size={12} /> READ ONLY (REGISTRATION RECORD)
        </span>
      </div>

      <p className="csd-form-helper-text helper-text-mb-md">
        The data in this section is fetched from the registration form and it cannot be changed.
      </p>

      {/* 2-Column Grid matching Fig. 14 */}
      <div className="beneficiary-read-only-grid">
        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            State <span className="doc-upload-required-star">*</span>
          </div>
          <div className="beneficiary-field-value">
            {selectedState}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Depot <span className="doc-upload-required-star">*</span>
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.depot}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            URC <span className="doc-upload-required-star">*</span>
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.urc}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Email <span className="doc-upload-required-star">*</span>
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.email}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Username
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.username}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Beneficiary Name
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.name}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Grocery Card Number
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.groceryCardNumber}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Chip Number
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.chipNumber}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Mobile Number
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.phone}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Employment Status
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.employmentStatus}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Organization
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.organization}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Date of Birth
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.dateOfBirth}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Date of Enrollment / Commissioning
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.dateOfEnrollment}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Date of Retirement
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.dateOfRetirement}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            Entitlement Category
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.entitlementCategory}
          </div>
        </div>

        <div className="beneficiary-field-box">
          <div className="beneficiary-field-label">
            PPO No. / Discharge No. (ESM)
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.ppoNumber}
          </div>
        </div>

        <div className="beneficiary-field-box beneficiary-field-full">
          <div className="beneficiary-field-label">
            PAN Number
          </div>
          <div className="beneficiary-field-value">
            {beneficiary.panNumber}
          </div>
        </div>
      </div>

      <div className="profile-correction-link-box">
        <Link to="/beneficiary/profile" className="checkout-breadcrumb-link">
          Need corrections in service record? Update Profile →
        </Link>
      </div>
    </div>
  );
}

export default CheckoutBeneficiaryCard;
