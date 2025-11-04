import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ModuleFrame from "../components/ModuleFrame";
import UserManagementModal from "../components/UserManagementModal";
import { moduleUrl } from "../api/moduleService";
import "./panel.css";

const Panel = () => {

  const [collapsed, setCollapsed] = useState(false); 
  const [activeModule, setActiveModule] = useState(null); 
  const [showUpload, setShowUpload] = useState(false); 
  const [showUsers, setShowUsers] = useState(false); 

  const src = useMemo(() => moduleUrl(activeModule), [activeModule]);

  return (
    <div className="app-layout">
      <Navbar
        onOpenUsers={() => setShowUsers(true)} 
        onOpenModules={() => setShowUpload(true)} 
      />


      <div className="app-body">
        <Sidebar
          collapsed={collapsed}
          onToggle={(force) =>
            setCollapsed((prev) => (typeof force === "boolean" ? force : !prev))
          }
          onSelect={(m) => setActiveModule(m)} 
          activeKey={activeModule?.key}
          onOpenUsers={() => setShowUsers(true)}
          onOpenLogs={() => alert("Loglar popup buradan açılabilir.")}
          externalShowUpload={showUpload} 
          onCloseUpload={() => setShowUpload(false)} 
        />

        <main className={`main ${collapsed ? "expanded" : ""}`}>
          <ModuleFrame src={src} />
        </main>
      </div>

      <UserManagementModal
        open={showUsers}
        onClose={() => setShowUsers(false)}
      />
    </div>
  );
};

export default Panel;
