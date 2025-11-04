import axios from "axios";

const API_BASE = "http://localhost:5067";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// 401 olursa refresh dene
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (!refreshing) {
        refreshing = (async () => {
          try {
            const auth = JSON.parse(localStorage.getItem("auth") || "null");
            if (!auth?.refreshToken) throw new Error("no refresh token");
            const r = await axios.post(`${API_BASE}/api/auth/refresh`, {
              refreshToken: auth.refreshToken,
            });
            localStorage.setItem("auth", JSON.stringify(r.data));
            return r.data.accessToken;
          } finally {
            // not: chain bitince sıfırlansın
            setTimeout(() => (refreshing = null), 0);
          }
        })();
      }
      const newToken = await refreshing;
      original._retry = true;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }
    return Promise.reject(err);
  }
);

export { api, API_BASE };
