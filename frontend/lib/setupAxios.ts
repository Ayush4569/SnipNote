import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

let isSetup = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api";
  return url.replace(/\/+$/, "");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNewAccessToken(response: any): string | undefined {
  if (!response) return undefined;
  if (response.data?.accessToken) return response.data.accessToken;
  const headers = response.headers;
  if (!headers) return undefined;
  if (typeof headers.get === "function") {
    return headers.get("x-access-token") || undefined;
  }
  return headers["x-access-token"] || headers["X-Access-Token"] || undefined;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("refreshToken");
  } catch {
    return null;
  }
}

export function setStoredTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  } catch {
    // ignore
  }
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch {
    // ignore
  }
}

export function setupAxios() {
  if (isSetup || typeof window === "undefined") return;
  isSetup = true;

  axios.defaults.withCredentials = true;

  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    try {
      const token = getStoredAccessToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const refreshToken = getStoredRefreshToken();
      if (refreshToken && !config.headers["x-refresh-token"]) {
        config.headers["x-refresh-token"] = refreshToken;
      }
    } catch {
      // ignore storage access issues
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      try {
        const newAccessToken = extractNewAccessToken(response);
        if (newAccessToken) {
          setStoredTokens(newAccessToken);
        }
      } catch {
        // ignore
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const url = originalRequest.url || "";
      const isAuthRefreshCall = url.includes("/auth/refresh");
      const isLogoutCall = url.includes("/auth/logout");

      // Only attempt refresh on 401 when not already retried and not an auth management request
      if (status === 401 && !originalRequest._retry && !isAuthRefreshCall && !isLogoutCall) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest._retry = true;
              if (token && typeof token === "string") {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = getStoredRefreshToken();
          const backendUrl = getApiBaseUrl();
          const response = await axios.post(
            `${backendUrl}/auth/refresh`,
            null,
            {
              withCredentials: true,
              headers: refreshToken ? { "x-refresh-token": refreshToken } : {},
            }
          );

          const newAccessToken = extractNewAccessToken(response);
          if (newAccessToken) {
            setStoredTokens(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return axios(originalRequest);
          } else {
            throw new Error("No access token returned from refresh");
          }
        } catch (refreshErr) {
          processQueue(refreshErr as Error, null);
          clearStoredTokens();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
