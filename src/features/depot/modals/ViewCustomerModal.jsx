import React from 'react';
import { X, User, Phone, Mail, MapPin, Award, CreditCard } from 'lucide-react';

export default function ViewCustomerModal({ isOpen, onClose, demand }) {
  if (!isOpen || !demand) return null;

  return (
    <div className="csd-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="csd-modal-container depot-customer-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="csd-modal-header between">
          <div className="row align-center gap-1">
            <User size={18} className="text-brand" />
            <h3 className="csd-modal-title">Customer Details · {demand.username || demand.beneficiaryName}</h3>
          </div>
          <button type="button" className="csd-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="csd-modal-body">
          <div className="depot-customer-profile-card">
            <div className="depot-customer-avatar">
              <User size={32} />
            </div>
            <div>
              <h4 className="depot-customer-name">
                {demand.beneficiaryId?.fullName || demand.beneficiaryName || demand.userId?.name || 'Verified Defence Beneficiary'}
              </h4>
              <span className="badge-pill badge-primary badge-sm">Verified Defence Beneficiary</span>
              <p className="micro muted mt-05">
                Username: <strong>{demand.userId?.username || demand.username || demand.beneficiaryName}</strong>
              </p>
            </div>
          </div>

          <table className="depot-summary-meta-table mt-15">
            <tbody>
              <tr>
                <td className="w-40"><span className="row align-center gap-05"><Award size={14} className="text-muted" /> Service Number:</span></td>
                <td><strong>{demand.beneficiaryId?.serviceNumber || demand.serviceNumber || 'N/A'}</strong></td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Award size={14} className="text-muted" /> Rank / Category:</span></td>
                <td><strong>{demand.beneficiaryId?.rank || demand.rank || 'Entitled Personnel'}</strong> ({demand.beneficiaryId?.category || 'SERVING'})</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><CreditCard size={14} className="text-muted" /> Grocery / Smart Card ID:</span></td>
                <td>{demand.beneficiaryId?.cardId || demand.canteenCardNo || 'N/A'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><CreditCard size={14} className="text-muted" /> PAN Number:</span></td>
                <td>{demand.beneficiaryId?.panNumber || demand.panNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Phone size={14} className="text-muted" /> Registered Mobile:</span></td>
                <td>{demand.beneficiaryId?.mobile || demand.userId?.mobile || demand.mobile || 'N/A'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Mail size={14} className="text-muted" /> Email Address:</span></td>
                <td>{demand.userId?.email || demand.beneficiaryId?.email || (demand.username ? `${demand.username}@defence.gov.in` : 'N/A')}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><MapPin size={14} className="text-muted" /> Allotted URC:</span></td>
                <td><strong>{demand.urcId?.name || demand.urc || 'Base Hospital Canteen'}</strong></td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><MapPin size={14} className="text-muted" /> Jurisdictional Depot:</span></td>
                <td><strong>{demand.depotId?.name || demand.depot || 'Delhi Regional Depot'}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="csd-modal-footer justify-end">
          <button type="button" className="btn-depot-manual-close" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
