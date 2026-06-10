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

     const token= localStorage.getItem('access_token')
      if(token){
        handleRefreshAccessToken()
        localStorage.removeItem("access_token")
        console.log("Unauthorized - token expired");
      return
      }
    }
    return Promise.reject(error);
  }
);

export default api;