import { useEffect, useRef } from 'react';
import './ConfirmModal.css';
import LoadingSpinner from './LoadingSpinner';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', cancelText = 'Cancel', isLoading = false }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isLoading]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Small delay to allow render before focusing
      setTimeout(() => {
        const confirmBtn = modalRef.current.querySelector('.modal-btn-cancel');
        if (confirmBtn) confirmBtn.focus();
      }, 10);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div 
        className="modal-content" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
        </div>
        <div id="modal-description" className="modal-body">
          {description}
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="modal-btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className="modal-btn-confirm" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
