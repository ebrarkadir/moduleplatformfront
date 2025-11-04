import axios from "axios";

// 🔹 Backend base adresini kendi sistemine göre ayarla
export const API_BASE = "http://localhost:5067";

// 🔹 Tüm modülleri çek
export const fetchModules = async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const headers = auth?.accessToken
    ? { Authorization: `Bearer ${auth.accessToken}` }
    : {};

  const { data } = await axios.get(`${API_BASE}/api/modules`, { headers });
  return data;
};

// 🔹 Modülün tam URL'sini oluştur
export const moduleUrl = (m) => {
  if (!m) return "";

  // örn: path = "/Modules/sla_test_sim/", entryFile = "Sla_Test_Simulator.html"
  let path = m.path || m.Path || "";
  let entry = m.entryFile || m.EntryFile || "index.html";

  // URL'i düzgün birleştir
  if (!path.startsWith("/")) path = "/" + path;
  if (!path.endsWith("/")) path += "/";

  const full = `${API_BASE}${path}${entry}`;
  console.log("🧩 Modül URL:", full);
  return full;
};
