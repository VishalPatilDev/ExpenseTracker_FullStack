import api from "./axiosInstance";

export const login = (credentials) =>
  api.post("/pjsofttech_welcome/login", credentials);

export const register = (data) =>
  api.post("/pjsofttech_welcome/register", data);