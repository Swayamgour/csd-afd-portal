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
              <h4 className="depot-customer-name">{demand.beneficiaryName || 'Subedar Major M. Test'}</h4>
              <span className="badge-pill badge-primary badge-sm">Verified Defence Beneficiary</span>
              <p className="micro muted mt-05">Username: <strong>{demand.username || demand.beneficiaryName}</strong></p>
            </div>
          </div>

          <table className="depot-summary-meta-table mt-15">
            <tbody>
              <tr>
                <td className="w-40"><span className="row align-center gap-05"><Award size={14} className="text-muted" /> Service Number:</span></td>
                <td><strong>{demand.serviceNumber || 'JC-765432X'}</strong></td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><CreditCard size={14} className="text-muted" /> Grocery / Smart Card ID:</span></td>
                <td>{demand.canteenCardNo || 'AF-SMART-984210'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><CreditCard size={14} className="text-muted" /> PAN Number:</span></td>
                <td>{demand.panNumber || 'ABCDE1234F'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Phone size={14} className="text-muted" /> Registered Mobile:</span></td>
                <td>+91 98765 43210</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><Mail size={14} className="text-muted" /> Email Address:</span></td>
                <td>{demand.username ? `${demand.username}@defence.gov.in` : 'applicant@defence.gov.in'}</td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><MapPin size={14} className="text-muted" /> Allotted URC:</span></td>
                <td><strong>{demand.urc || 'myurc'}</strong></td>
              </tr>
              <tr>
                <td><span className="row align-center gap-05"><MapPin size={14} className="text-muted" /> Jurisdictional Depot:</span></td>
                <td><strong>{demand.depot || 'Mydepot'}</strong></td>
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
