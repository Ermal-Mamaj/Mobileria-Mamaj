import { useEffect, useRef } from 'react';

// A single, reusable confirmation modal — replaces every window.confirm()
// in the CMS so deletes (and anything else risky) get a consistent,
// styled, on-brand prompt instead of the browser's plain dialog.
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Konfirmo',
  cancelLabel = 'Anulo',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-modal__backdrop" onClick={onCancel}>
      <div
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title" className="confirm-modal__title">{title}</h3>
        {message && <p className="confirm-modal__message">{message}</p>}
        <div className="confirm-modal__actions">
          <button type="button" className="admin-btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            type="button"
            className={danger ? 'admin-btn-danger' : 'confirm-modal__confirm'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
