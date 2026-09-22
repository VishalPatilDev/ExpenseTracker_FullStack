import api from "./api";

const BASE = "/liabilities";

export const getLiabilities = async () => {
  const { data } = await api.get(BASE);
  return data?.data ?? data;
};

export const getLiability = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data?.data ?? data;
};

export const addLiability = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data?.data ?? data;
};

export const updateLiability = async (id, payload) => {
  const { data } = await api.put(`${BASE}/${id}`, payload);
  return data?.data ?? data;
};

export const recordLiabilityPayment = async (id, payload) => {
  const { data } = await api.post(`${BASE}/${id}/payments`, payload);
  return data?.data ?? data;
};

export const cancelLiability = async (id) => {
  const { data } = await api.put(`${BASE}/${id}/cancel`);
  return data?.data ?? data;
};

export const deleteLiability = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data?.data ?? data;
};
