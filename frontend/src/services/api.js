import axios from "axios";

const API_URL = "http://localhost:5004/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (credentials) => {
  return api.post("/auth/login", credentials);
};

// Category services
export const getCategories = () => {
  return api.get("/categories");
};

export const createCategory = (categoryData) => {
  return api.post("/categories", categoryData);
};

export const updateCategory = (id, categoryData) => {
  return api.put(`/categories/${id}`, categoryData);
};

export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

// Add these functions to your existing api.js file

// Transaction services
export const getTransactions = (params) => {
  return api.get("/transactions", { params });
};

export const getTransactionById = (id) => {
  return api.get(`/transactions/${id}`);
};

export const createTransaction = (transactionData) => {
  return api.post("/transactions", transactionData);
};

export const updateTransaction = (id, transactionData) => {
  return api.put(`/transactions/${id}`, transactionData);
};

export const deleteTransaction = (id) => {
  return api.delete(`/transactions/${id}`);
};

export const getTransactionSummary = (params) => {
  return api.get("/transactions/summary", { params });
};
export default api;
