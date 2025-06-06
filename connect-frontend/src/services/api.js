import axios from "axios";

const api = axios.create({
  baseURL: "https://fatecconnect-backend.onrender.com/api",
});
//https://fatecconnect-backend.onrender.com/api
//http://localhost:5000/api
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
