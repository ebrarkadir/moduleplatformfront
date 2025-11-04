import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/AuthService";

import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/panel");
    } catch {
      setError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  return (
    <section id="loginShell">
      <div className="card login-card">
        <div className="login-badge">ULAK HABERLEŞME A.Ş.</div>
        <div className="login-logo">
          <img src="/images/logo.png" alt="Logo" />
        </div>
        <h1>Kullanıcı Girişi</h1>

        <form onSubmit={handleSubmit} autoComplete="off" id="loginForm">
          <div className="field">
            <label>KULLANICI ADI</label>
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>ŞİFRE</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="outline pw-toggle"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "Gizle" : "Göster"}
              </button>
            </div>
          </div>

          {error && <div className="inline-hint">{error}</div>}

          <button type="submit" id="loginBtn">
            Giriş Yap
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
