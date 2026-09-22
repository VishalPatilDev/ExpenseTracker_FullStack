import api from "./axiosInstance";

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => api.get("/pjsofttech/category");
export const createCategory = (data) => api.post("/pjsofttech/category", data);
export const deleteCategory = (id) => api.delete(`/pjsofttech/category/${id}`);

// ── Contacts / Users ──────────────────────────────────────────────────────────
export const getContacts = () => api.get("/pjsofttech/user/users");
export const createContact = (data) => api.post("/pjsofttech/user", data);
export const updateContact = (id, data) => api.put(`/pjsofttech/user/${id}`, data);
export const deleteContact = (id) => api.delete(`/pjsofttech/user/${id}`);

// ── Banks ─────────────────────────────────────────────────────────────────────
export const getBanks = () => api.get("/pjsofttech/bank");
export const createBank = (data) => api.post("/pjsofttech/bank", data);
export const deleteBank = (id) => api.delete(`/pjsofttech/bank/${id}`);

export const createAssetCategory = (data) =>
    api.post("/api/assets/assets-category", data);

export const deleteAssetCategory = (id) =>
    api.delete(`/api/assets/assets-category/${id}`);

export const getAssetCategories = () =>
    api.get("/api/assets/assets-category");