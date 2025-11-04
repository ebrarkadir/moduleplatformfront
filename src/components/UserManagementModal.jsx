import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../pages/panel.css";
import "./UserManagementModal.css";
import ConfirmDialog from "./ConfirmDialog"; // ✅ yeni eklendi

const API_BASE = "http://localhost:5067";

const UserManagementModal = ({ open, onClose }) => {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "View",
    permissions: [],
  });

  // ✅ confirm state
  const [confirmData, setConfirmData] = useState({
    open: false,
    id: null,
    name: "",
  });

  const auth = JSON.parse(localStorage.getItem("auth"));
  const headers = { Authorization: `Bearer ${auth?.accessToken}` };

  // 🔹 Modal açıldığında verileri yükle
  useEffect(() => {
    if (open) {
      loadData();
      resetForm();
    }
  }, [open]);

  // 🔹 Dropdown dışında tıklanınca kapanır
  useEffect(() => {
    const handleOutside = (e) => {
      const el = dropdownRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // 🔹 Kullanıcı + modül verilerini yükle
  const loadData = async () => {
    try {
      const [userRes, moduleRes] = await Promise.all([
        axios.get(`${API_BASE}/api/users`, { headers }),
        axios.get(`${API_BASE}/api/modules`, { headers }),
      ]);

      const normalized = moduleRes.data
        .filter((m) => m.isActive !== false)
        .map((m) => ({
          id: m.id,
          key: (m.key || m.Key)?.toLowerCase(),
          name: m.name || m.Name,
        }));

      setUsers(userRes.data);
      setModules(normalized);
    } catch (err) {
      console.error("Veri yüklenemedi:", err);
      toast.error("❌ Kullanıcı veya modül verileri alınamadı.");
    }
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const togglePermission = (key) => {
    const normalizedKey = key.toLowerCase();
    setForm((f) => {
      const has = f.permissions.includes(normalizedKey);
      return {
        ...f,
        permissions: has
          ? f.permissions.filter((p) => p !== normalizedKey)
          : [...f.permissions, normalizedKey],
      };
    });
  };

  // 🔹 Admin seçilirse tüm izinleri aç ve dokunulamaz hale getir
  useEffect(() => {
    if (form.role === "Admin" || form.role === 1) {
      const allPerms = [...modules.map((m) => m.key), "logs", "users"];
      setForm((f) => ({ ...f, permissions: allPerms }));
    }
  }, [form.role, modules]);

  const handleEdit = (u) => {
    setEditingUser(u);

    let roleName = "View";
    if (u.role === 1 || u.role === "1" || u.role === "Admin")
      roleName = "Admin";
    else if (u.role === 2 || u.role === "2" || u.role === "Constructor")
      roleName = "Constructor";

    let perms = [];
    try {
      if (Array.isArray(u.permissions)) perms = u.permissions;
      else if (typeof u.permissions === "string")
        perms = JSON.parse(u.permissions);
    } catch {
      perms = [];
    }

    perms = perms.map((p) => p?.toLowerCase());

    setForm({
      username: u.username,
      password: "",
      role: roleName,
      permissions: perms,
    });

    setDropdownOpen(false);
    toast.info(`✏️ ${u.username} düzenleniyor`);
  };

  const resetForm = () => {
    setEditingUser(null);
    setForm({
      username: "",
      password: "",
      role: "View",
      permissions: [],
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) return toast.warn("⚠️ Kullanıcı adı zorunlu!");

    setLoading(true);
    try {
      const roleValue =
        form.role === "Admin" ? 1 : form.role === "Constructor" ? 2 : 3;

      const payload = {
        username: form.username,
        password: form.password,
        role: roleValue,
        permissions: form.permissions,
      };

      if (editingUser) {
        await axios.put(`${API_BASE}/api/users/${editingUser.id}`, payload, {
          headers,
        });
        toast.success("✅ Kullanıcı güncellendi!");
      } else {
        await axios.post(`${API_BASE}/api/users`, payload, { headers });
        toast.success("✅ Yeni kullanıcı eklendi!");
      }

      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ Kaydetme hatası oluştu.");
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
      await axios.delete(`${API_BASE}/api/users/${id}`, { headers });
      await loadData();
      toast.success(`🗑️ ${name} başarıyla silindi.`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Silme başarısız!");
    }
  };

  if (!open) return null;

  const isAdminForm =
    String(form.role).toLowerCase() === "admin" || form.role === 1;

  const formatRole = (role) => {
    const r = String(role).toLowerCase();
    if (r === "admin" || r === "1") return "Admin";
    if (r === "constructor" || r === "2") return "Constructor";
    return "View";
  };

  
  return (
    <div className="um-overlay">
      <div className="um-card">
        <header className="um-header">
          <h2>Kullanıcı Yönetimi</h2>
          <button onClick={onClose} className="um-close">
            ✕
          </button>
        </header>

        <div className="um-body">
          <form onSubmit={handleSave} className="um-form">
            <div className="um-row">
              <div className="um-field">
                <label>Kullanıcı Adı</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                />
              </div>

              <div className="um-field">
                <label>Şifre</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={editingUser ? "Yeni şifre (opsiyonel)" : ""}
                />
              </div>

              <div className="um-field">
                <label>Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option value="View">View</option>
                  <option value="Constructor">Constructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Yetkiler */}
            <div className="um-perms">
              <label>Yetkiler</label>
              <div className="um-perm-row">
                <div className="um-dropdown" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`um-toggle ${isAdminForm ? "is-disabled" : ""}`}
                    disabled={isAdminForm}
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    Modül Seç (
                    {
                      form.permissions.filter(
                        (p) => p !== "logs" && p !== "users"
                      ).length
                    }
                    ) ▼
                  </button>

                  {dropdownOpen && !isAdminForm && (
                    <div
                      className="um-list"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {modules.map((m) => (
                        <label key={m.key} className="um-item">
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(m.key)}
                            onChange={() => togglePermission(m.key)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span>{m.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="um-extra">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.permissions.includes("logs")}
                      disabled={isAdminForm}
                      onChange={() => togglePermission("logs")}
                    />
                    Loglar
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.permissions.includes("users")}
                      disabled={isAdminForm}
                      onChange={() => togglePermission("users")}
                    />
                    Kullanıcı Yönetimi
                  </label>
                </div>
              </div>
            </div>

            <div className="um-actions">
              <button type="submit" disabled={loading}>
                {editingUser ? "Güncelle" : "Kaydet"}
              </button>
              <button type="button" onClick={resetForm} className="um-outline">
                Temizle
              </button>
            </div>
          </form>

          <h3>Kullanıcı Listesi</h3>
          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Rol</th>
                  <th>Yetkiler</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{formatRole(u.role)}</td>

                    <td>{u.permissions?.join(", ") || "-"}</td>
                    <td className="um-actions-cell">
                      <button className="um-edit" onClick={() => handleEdit(u)}>
                        Düzenle
                      </button>
                      <button
                        className="um-del"
                        onClick={() => confirmDelete(u.id, u.username)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Modern onay popup */}
      <ConfirmDialog
        open={confirmData.open}
        message={`${confirmData.name} kullanıcısını silmek istiyor musun?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmData({ open: false, id: null, name: "" })}
      />
    </div>
  );
};

export default UserManagementModal;
