import api from "./axiosInstance";

// ── Assets ────────────────────────────────────────────────────────────────────
export const getAssets = () => api.get("/api/assets");
export const getAssetById = (id) => api.get(`/api/assets/${id}`);
export const createAsset = (data) => api.post("/api/assets", data);
export const updateAsset = (id, data) => api.put(`/api/assets/${id}`, data);
export const updateAcquisition = (id, data) => api.put(`/api/assets/${id}/acquisition`, data);
export const updateCurrentValue = (id, value) =>
    api.put(`/api/assets/${id}/valuation`, null, { params: { currentValue: value } });
export const deleteAsset = (id) => api.delete(`/api/assets/${id}`);
export const createAssetCategory = (data) => api.post("/api/assets/assets-category", data);
export const getAssetCategories = () =>
    api.get("/api/assets/assets-category");
export const deleteAssetCategory = (id) =>api.delete(`/api/assets/assets-category/${id}`);
export const getContacts = () => api.get("/pjsofttech/user/users");
export const getBanks = () => api.get("/pjsofttech/bank");


// ── Liabilities ───────────────────────────────────────────────────────────────
export const getLiabilities = () => api.get("/api/liabilities");
export const getLiabilityById = (id) => api.get(`/api/liabilities/${id}`);
export const createLiability = (data) => api.post("/api/liabilities", data);
export const updateLiability = (id, data) => api.put(`/api/liabilities/${id}`, data);
export const recordLiabilityPayment = (id, data) => api.post(`/api/liabilities/${id}/payments`, data);
export const cancelLiability = (id) => api.put(`/api/liabilities/${id}/cancel`);
export const deleteLiability = (id) => api.delete(`/api/liabilities/${id}`);


// ── Net Worth ─────────────────────────────────────────────────────────────────
export const getNetWorth = () => api.get("/api/net-worth");
export const getNetWorthTarget = () => api.get("/api/net-worth/target");
export const upsertNetWorthTarget = (data) => api.put("/api/net-worth/target", data);
export const deleteNetWorthTarget = () => api.delete("/api/net-worth/target");
export const getNetWorthProjection = () => api.get("/api/net-worth/projection");
export const takeNetWorthSnapshot = () => api.post("/api/net-worth/snapshot");
export const getNetWorthSnapshots = () => api.get("/api/net-worth/snapshots");