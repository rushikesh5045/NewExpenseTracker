import axios from "axios";

const API_URL =
  "https://expense-tracker-backend-480412-534168519598.asia-south1.run.app/api";

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

// Request password reset
export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

// Reset password with token
export const resetPassword = (token, password) => {
  return api.post("/auth/reset-password", { token, password });
};

// Validate reset token
export const validateResetToken = (token) => {
  return api.get(`/auth/validate-reset-token/${token}`);
};

// Update user profile
export const updateUserProfile = (profileData) => {
  return api.put("/users/profile", profileData);
};

// Change password
export const changePassword = (passwordData) => {
  return api.put("/users/change-password", passwordData);
};

// Delete account
export const deleteAccount = () => {
  return api.delete("/users/account");
};

// Export data
export const exportData = (format) => {
  return api.get(`/data/export?format=${format}`, {
    responseType: "blob", // Important for file downloads
  });
};

// Clear all user data
export const clearAllData = () => {
  return api.delete("/data/clear-all");
};

// Backup data
export const backupData = () => {
  return api.get("/data/backup", {
    responseType: "blob",
  });
};

// Restore data
export const restoreData = (backupFile) => {
  const formData = new FormData();
  formData.append("backup", backupFile);

  return api.post("/data/restore", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export default api;
