'use client'
import { handleRefreshAccessToken } from "../api-services/authentication";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async(error) => {

    if (error.response?.status === 401) {
      if(localStorage.getItem('access_token')){
        handleRefreshAccessToken()
        console.log("Unauthorized - token expired");
      return
      }
      if(window.location.pathname!=="/signin"){
        window.location.href="/signin"
      }
    }
    return Promise.reject(error);
  }
);

export default api;