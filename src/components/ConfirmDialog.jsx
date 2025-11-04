import React from "react";
import "./ConfirmDialog.css";

const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="confirm-yes" onClick={onConfirm}>
            Tamam
          </button>
          <button className="confirm-no" onClick={onCancel}>
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
