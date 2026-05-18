import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://stay-ease-backend-n6e0.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("stayease_user");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const tiffinAPI = {
  create: (data) => api.post("/tiffin", data),
  getMy: () => api.get("/tiffin/my"),
  getActive: () => api.get("/tiffin/active"),
  getAll: () => api.get("/tiffin/all"),
  updateStatus: (id, data) => api.put(`/tiffin/${id}/status`, data),
  activate: (id) => api.put(`/tiffin/${id}/activate`),
};

export const foodAPI = {
  getToday: () => api.get("/food/today"),
  getAll: () => api.get("/food"),
  create: (data) => api.post("/food", data),
  update: (id, data) => api.put(`/food/${id}`, data),
  delete: (id) => api.delete(`/food/${id}`),
};

export const menuAPI = {
  getAll: () => api.get("/menu"),
  create: (data) => api.post("/menu", data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

export const groceryAPI = {
  getProducts: () => api.get("/grocery/products"),
  getAllProducts: () => api.get("/grocery/products/all"),
  createProduct: (data) => api.post("/grocery/products", data),
  updateProduct: (id, data) => api.put(`/grocery/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/grocery/products/${id}`),
  placeOrder: (data) => api.post("/grocery/orders", data),
  getMyOrders: () => api.get("/grocery/orders/my"),
  getAllOrders: () => api.get("/grocery/orders"),
  updateOrderStatus: (id, data) =>
    api.put(`/grocery/orders/${id}/status`, data),
  markOrderPaid: (id) => api.put(`/grocery/orders/${id}/mark-paid`),
};

export const complaintAPI = {
  create: (data) => api.post("/complaints", data),
  getMy: () => api.get("/complaints/my"),
  getAll: () => api.get("/complaints"),
  update: (id, data) => api.put(`/complaints/${id}`, data),
};

export const cancellationAPI = {
  create: (data) => api.post("/cancellations", data),
  getMy: () => api.get("/cancellations/my"),
  getAll: () => api.get("/cancellations"),
  update: (id, data) => api.put(`/cancellations/${id}`, data),
};

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getCustomers: () => api.get("/admin/customers"),
  toggleBlock: (id) => api.put(`/admin/customers/${id}/block`),
  getCustomerHistory: (id) => api.get(`/admin/customers/${id}/history`),
  deactivateCustomerPlan: (id) =>
    api.put(`/admin/customers/${id}/deactivate-plan`),
  activateCustomerPlan: (id) => api.put(`/admin/customers/${id}/activate-plan`),
};

export const mealAPI = {
  getSchedule: () => api.get("/meals/schedule"),
  updateSchedule: (data) => api.put("/meals/schedule", data),
  getSummary: () => api.get("/meals/summary"),
  getUserSummary: (userId) => api.get(`/meals/summary/${userId}`),
  cancelMeal: (data) => api.post("/meals/cancel", data),
  cancelBulk: (data) => api.post("/meals/cancel-bulk", data),
  getMyCancellations: () => api.get("/meals/cancellations/my"),
  getAllCancellations: () => api.get("/meals/cancellations"),
  getTodayStatus: () => api.get("/meals/today-status"),
  getTodayDeliveries: () => api.get("/meals/today-deliveries"),
  updateDeliveryStatus: (data) => api.put("/meals/delivery-status", data),
};

export const paymentAPI = {
  submit: (data) => api.post("/payments/submit", data),
  getMy: () => api.get("/payments/my"),
  getAll: () => api.get("/payments"),
  updateStatus: (id, data) => api.put(`/payments/${id}/status`, data),
  getStats: () => api.get("/payments/stats"),
};

export default api;
