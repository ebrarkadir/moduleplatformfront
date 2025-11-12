import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/panel.css";
import { toast } from "react-toastify";

const API_BASE = "http://172.25.0.10:5081";

const LogsModal = ({ open, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Kullanıcıları çek
  const loadUsers = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const { data } = await axios.get(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
      });
      setUsers(data);
    } catch (err) {
      console.error("Kullanıcı listesi alınamadı:", err);
    }
  };

  // 🔹 Logları çek
  const loadLogs = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const { data } = await axios.get(`${API_BASE}/api/logs`, {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
      });
      setLogs(data);
    } catch (err) {
      console.error("Loglar alınamadı:", err);
      toast.error("Loglar alınırken hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      Promise.all([loadUsers(), loadLogs()]);
    }
  }, [open]);

  if (!open) return null;

  // 🔹 Kullanıcı ID → ad
  const getUserById = (id) => {
    return users.find((u) => u.id === id || u.userId === id);
  };

  // 🔹 Rol formatlama (User nesnesinden al)
  const formatRole = (roleValue) => {
    if (!roleValue) return "-";
    const val = String(roleValue).toLowerCase();
    if (val === "1" || val === "admin") return "Admin";
    if (val === "2" || val === "constructor" || val === "constracter") return "Constructor";
    if (val === "3" || val === "view") return "View";
    return "-";
  };

  // 🔹 Renkli badge
  const RoleBadge = ({ role }) => {
    const name = formatRole(role);
    const colors = {
      Admin: "#2563eb",
      Constructor: "#f59e0b",
      View: "#6b7280",
    };
    return (
      <span
        style={{
          background: colors[name] || "#9ca3af",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {name}
      </span>
    );
  };

  return (
    <div className="overlay-panel" style={{ display: "flex" }}>
      <div className="overlay-card" style={{ width: "min(900px, 95%)" }}>
        <header>
          <h2 style={{ margin: 0 }}>Sistem Logları</h2>
          <button onClick={onClose} className="outline">
            ✕
          </button>
        </header>

        <div
          className="overlay-body"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {loading ? (
            <p className="muted">Yükleniyor...</p>
          ) : (
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kullanıcı</th>
                  <th>Rol</th>
                  <th>İşlem</th>
                  <th>Mesaj</th>
                  <th>Modül</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const user = getUserById(log.userId);
                  return (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{user?.username || "-"}</td>
                      <td>
                        <RoleBadge role={user?.role} />
                      </td>
                      <td>{log.action || "-"}</td>
                      <td>{log.message || "-"}</td>
                      <td>{log.module || "-"}</td>
                      <td>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("tr-TR")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}

                {!logs.length && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", color: "#6b7280" }}
                    >
                      Henüz log kaydı bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsModal;
