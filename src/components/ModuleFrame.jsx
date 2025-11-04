import React from "react";
import "../pages/panel.css";

const ModuleFrame = ({ src }) => {
  return (
    <div className="module-shell">
      {src ? (
        <iframe title="module" src={src} className="module-iframe" />
      ) : (
        <div className="empty-hint">Soldan bir modül seçin.</div>
      )}
    </div>
  );
};

export default ModuleFrame;
