import axios from "axios";

const API_URL = "http://172.25.0.10:5081/api/auth";

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  if (response.data.accessToken) {
    localStorage.setItem("auth", JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  if (auth?.accessToken) {
    await axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
  }
  localStorage.removeItem("auth");
};


export const getAuth = () => JSON.parse(localStorage.getItem("auth"));
