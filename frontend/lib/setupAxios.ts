import axios from "axios";

let isSetup = false;

export function setupAxios() {
  if (isSetup || typeof window === "undefined") return;
  isSetup = true;

  axios.defaults.withCredentials = true;

  axios.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !config.headers["x-refresh-token"]) {
        config.headers["x-refresh-token"] = refreshToken;
      }
    } catch {
      // localStorage access may fail in restricted contexts
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      try {
        const newAccessToken = response.headers["x-access-token"];
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
        }
      } catch {
        // ignore
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch {
          // ignore
        }
      }
      return Promise.reject(error);
    }
  );
}
