import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pages/panel.css";
import { toast } from "react-toastify";
import ConfirmDialog from "./ConfirmDialog"; // ✅ eklendi

const API_BASE = "http://localhost:5067";

const ModuleUploadModal = ({ open, onClose, onUploaded }) => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modules, setModules] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ confirm state
  const [confirmData, setConfirmData] = useState({
    open: false,
    id: null,
    name: "",
  });

  const loadModules = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const { data } = await axios.get(`${API_BASE}/api/modules`, {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
      });
      setModules(data);
    } catch (err) {
      console.error("Modüller alınamadı:", err);
      toast.error("Modül listesi alınırken hata oluştu!");
    }
  };

  useEffect(() => {
    if (open) loadModules();
  }, [open]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Lütfen bir dosya seçin (.zip veya .html)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const auth = JSON.parse(localStorage.getItem("auth"));
      const formData = new FormData();
      formData.append("Name", name);
      formData.append("Key", key);
      formData.append("Description", description);
      formData.append("File", file);

      const response = await axios.post(`${API_BASE}/api/modules/upload`, formData, {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`${name} başarıyla eklendi.`);
      onUploaded(response.data);
      await loadModules();
      setName("");
      setKey("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Yükleme hatası:", err);
      setError("Yükleme başarısız. Aynı key'e sahip modül olabilir.");
      toast.error("Yükleme başarısız!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Silme işlemi (popup ile)
  const confirmDelete = (id, name) => {
    setConfirmData({ open: true, id, name });
  };

  const handleConfirmDelete = async () => {
    const { id, name } = confirmData;
    setConfirmData({ open: false, id: null, name: "" });
    try {
      setDeletingId(id);
      const auth = JSON.parse(localStorage.getItem("auth"));
      await axios.delete(`${API_BASE}/api/modules/${id}`, {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
      });
      toast.info(`${name} başarıyla silindi.`);
      await loadModules();
      onUploaded && onUploaded();
    } catch (err) {
      console.error("Silme hatası:", err);
      toast.error("Silme başarısız!");
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="overlay-panel" style={{ display: "flex" }}>
      <div className="overlay-card" style={{ width: "min(700px, 95%)" }}>
        <header>
          <h2 style={{ margin: 0 }}>Modül Yönetimi</h2>
          <button onClick={onClose} className="outline">
            ✕
          </button>
        </header>

        <div className="overlay-body">
          {/* 🔹 Modül ekleme formu */}
          <form onSubmit={handleUpload} className="col" style={{ gap: "10px" }}>
            {/* form alanları */}
            <div className="field">
              <label>Modül Adı</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Modül Anahtar (Key)</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Açıklama</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Dosya (ZIP veya HTML)</label>
              <input
                type="file"
                accept=".zip,.html"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            {error && <small style={{ color: "red" }}>{error}</small>}

            <div className="inline-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Yükleniyor..." : "Yükle"}
              </button>
              <button type="button" onClick={onClose} className="outline">
                İptal
              </button>
            </div>
          </form>

          {/* 🔹 Modül tablosu */}
          <hr style={{ margin: "20px 0", borderColor: "#e5e7eb" }} />
          <h3>Yüklü Modüller</h3>

          <div className="module-table-wrapper">
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad</th>
                  <th>Key</th>
                  <th>Oluşturan</th>
                  <th>Tarih</th>
                  <th>Sil</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.name}</td>
                    <td>{m.key}</td>
                    <td>{m.createdBy}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td>
                      <button
                        className="btn outline"
                        onClick={() => confirmDelete(m.id, m.name)}
                        disabled={deletingId === m.id}
                      >
                        {deletingId === m.id ? "Siliniyor..." : "Sil"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!modules.length && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "#6b7280" }}>
                      Henüz yüklenmiş modül bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ ConfirmDialog popup */}
      <ConfirmDialog
        open={confirmData.open}
        message={`${confirmData.name} modülünü silmek istediğine emin misin?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmData({ open: false, id: null, name: "" })}
      />
    </div>
  );
};

export default ModuleUploadModal;
