import api from "./axiosInstance";

export const getExpenses = () =>
  api.get("/pjsofttech/expense/expenses");

export const getExpenseById = (id) =>
  api.get(`/pjsofttech/expense/${id}`);

export const createExpense = (data) =>
  api.post("/pjsofttech/expense", data);

export const updateExpense = (id, data) =>
  api.put(`/pjsofttech/expense/${id}`, data);

export const deleteExpense = (id) =>
  api.delete(`/pjsofttech/expense/${id}`);

export const addInstallmentPayment = (installmentId, data) =>
  api.post(`/pjsofttech/expense/installment/${installmentId}/payment`, data);