import React, { useState, useEffect, useRef } from "react";
import { logout, getAuth } from "../api/AuthService";
import { useNavigate } from "react-router-dom";
import LogsModal from "./LogsModal";
import { hasPermission } from "../core/utils/permissionHelper";
import "../pages/panel.css";

const Navbar = ({
  onOpenUsers = () => alert("Kullanıcı Yönetimi yakında"),
  onOpenModules = () => alert("Modül Yönetimi açılacak"),
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    setUser(getAuth());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        userRef.current &&
        !userRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Logout hatası:", err);
    } finally {
      localStorage.removeItem("auth");
      navigate("/login");
    }
  };

  const auth = getAuth();

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span>🛰️ ULAK HABERLEŞME</span>
          <span className="brand-dot">•</span>
          <span>Modül Platformu</span>
        </div>

        <div className="topbar-right" style={{ gap: 10 }}>
          {(hasPermission(auth, "users") ||
            hasPermission(auth, "modules") ||
            hasPermission(auth, "logs")) && (
            <div className="dropdown" ref={menuRef}>
              <button
                className="btn outline"
                onClick={() => {
                  setMenuOpen((v) => !v);
                  setUserMenuOpen(false);
                }}
              >
                İşlemler ▾
              </button>

              {menuOpen && (
                <div className="dropdown-menu">
                  {hasPermission(auth, "users") && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenUsers();
                      }}
                    >
                      👥 Kullanıcı Yönetimi
                    </button>
                  )}

                  {hasPermission(auth, "modules") && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenModules();
                      }}
                    >
                      🧩 Modül Yönetimi
                    </button>
                  )}

                  {hasPermission(auth, "logs") && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowLogs(true);
                      }}
                    >
                      🧾 Loglar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}


          <div className="dropdown" ref={userRef}>
            <div
              className="user-tag clickable"
              onClick={() => {
                setUserMenuOpen((v) => !v);
                setMenuOpen(false);
              }}
              title="Kullanıcı Menüsü"
            >
              <span className="user-name">{user?.username || "Kullanıcı"}</span>
              <span className="user-role">
                {String(user?.role).charAt(0).toUpperCase() +
                  String(user?.role).slice(1)}
              </span>
            </div>

            {userMenuOpen && (
              <div className="dropdown-menu" style={{ right: 0 }}>
                <button onClick={handleLogout}>🚪 Çıkış Yap</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogsModal open={showLogs} onClose={() => setShowLogs(false)} />
    </>
  );
};

export default Navbar;
