import React, { useEffect, useState } from "react";
import "../pages/panel.css";
import { fetchModules } from "../api/moduleService";
import ModuleUploadModal from "./ModuleUploadModal";
import axios from "axios";
import { getAuth } from "../api/AuthService";
import { hasPermission } from "../core/utils/permissionHelper";

const API_BASE = "http://172.25.0.10:5081";

const Sidebar = ({
  collapsed,
  onToggle,
  onSelect,
  activeKey,
  externalShowUpload = false,
  onCloseUpload,
}) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const auth = getAuth();

  const loadModules = async () => {
    try {
      const list = await fetchModules();

      const visible = list.filter(
        (m) => m.isActive !== false && hasPermission(auth, m.key) 
      );
      setModules(visible);
    } catch (e) {
      console.error("Modül listesi alınamadı:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (externalShowUpload) setShowUpload(true);
  }, [externalShowUpload]);

  const handleModuleClick = async (m) => {
    try {

      onSelect(m);

   
      setTimeout(() => {
        onToggle(true);
      }, 300);


      const auth = JSON.parse(localStorage.getItem("auth"));
      await axios.post(
        `${API_BASE}/api/logs/module-opened`,
        { moduleName: m.name },
        {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.warn("Modül logu gönderilemedi:", err);
    }
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-head">
          <button className="toggle" onClick={onToggle}>
            {collapsed ? ">" : "<"}
          </button>

          {!collapsed && <h3>Modüller</h3>}
        </div>

        <div className="sidebar-body">
          {loading && !collapsed && <div className="muted">Yükleniyor…</div>}
          {!loading &&
            modules.map((m) => (
              <button
                key={m.id}
                className={`side-item ${activeKey === m.key ? "active" : ""}`}
                title={m.description || m.name}
                onClick={() => handleModuleClick(m)}
              >
                {!collapsed ? m.name : m.name?.[0]?.toUpperCase()}
              </button>
            ))}
        </div>
      </aside>

      <ModuleUploadModal
        open={showUpload}
        onClose={() => {
          setShowUpload(false);
          if (onCloseUpload) onCloseUpload();
        }}
        onUploaded={loadModules}
      />
    </>
  );
};

export default Sidebar;
