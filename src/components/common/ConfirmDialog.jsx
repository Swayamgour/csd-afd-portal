import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action? This operation cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'primary'
  loading = false
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <div className="modal-footer-btns">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="confirm-body row align-center gap-1">
        <div className="confirm-icon text-danger">
          <AlertCircle size={32} aria-hidden="true" />
        </div>
        <p className="confirm-text small">{message}</p>
      </div>
    </Modal>
  );
}
