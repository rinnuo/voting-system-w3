import axios from "axios";
import type { AxiosInstance } from "axios";

const BASE_URLS = {
  padron: "http://localhost:8001z/system1/api",
  eleccion: "http://localhost:8002/system2/api",
  votacion: "http://localhost:8003/system3/api",
  user: "http://localhost:8004/system4/api",
};

const REFRESH_URL = `${BASE_URLS.user}/users/refresh/`;

const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const redirectToLogin = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const attachAuthToken = (config: any) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const createUserApi = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URLS.user,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use(attachAuthToken);

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;

      if (
        err.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/users/login") &&
        !originalRequest.url.includes("/users/refresh")
      ) {
        originalRequest._retry = true;
        const refresh = getRefreshToken();

        if (!refresh) {
          redirectToLogin();
          return Promise.reject(err);
        }

        try {
          const res = await axios.post(REFRESH_URL, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem("access_token", newAccess);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return client(originalRequest);
        } catch (refreshError) {
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(err);
    }
  );

  return client;
};

const createGenericApi = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use(attachAuthToken);

  return client;
};

export const userApi = createUserApi();
export const padronApi = createGenericApi(BASE_URLS.padron);
export const eleccionApi = createGenericApi(BASE_URLS.eleccion);
export const votacionApi = createGenericApi(BASE_URLS.votacion);
