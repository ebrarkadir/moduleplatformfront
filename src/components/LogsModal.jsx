import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/panel.css";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5067";

const LogsModal = ({ open, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // 🔹 Açıldığında logları yükle
  useEffect(() => {
    if (open) loadLogs();
  }, [open]);

  if (!open) return null;

  return (
    <div className="overlay-panel" style={{ display: "flex" }}>
      <div className="overlay-card" style={{ width: "min(900px, 95%)" }}>
        <header>
          <h2 style={{ margin: 0 }}>Sistem Logları</h2>
          <button onClick={onClose} className="outline">
            ✕
          </button>
        </header>

        <div className="overlay-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {loading ? (
            <p className="muted">Yükleniyor...</p>
          ) : (
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kullanıcı</th>
                  <th>İşlem</th>
                  <th>Mesaj</th>
                  <th>Modül</th>
                  <th>IP</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.userId || "-"}</td>
                    <td>{log.action}</td>
                    <td>{log.message}</td>
                    <td>{log.module}</td>
                    <td>{log.ipAddress || "-"}</td>
                    <td>{new Date(log.createdAt).toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "#6b7280" }}>
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
