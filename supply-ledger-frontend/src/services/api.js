// API Service for SupplyLedger Backend

const API_BASE_URL = "http://localhost:8000";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
};

// AUTH APIS
export const auth = {
  login: (email, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall("/auth/logout", {
      method: "POST",
    }),
};

// USER APIS
export const users = {
  register: (userData) =>
    apiCall("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: (userId) =>
    apiCall(`/users/profile/${userId}`),

  updateProfile: (userId, userData) =>
    apiCall(`/users/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  searchByEmail: (email) =>
    apiCall(`/users/search?email=${email}`),
};

// ORDER APIS
export const orders = {
  create: (userId, orderData) =>
    apiCall(`/orders/create?user_id=${userId}`, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  list: (userId) =>
    apiCall(`/orders/list/${userId}`),

  getDetail: (orderId) =>
    apiCall(`/orders/detail/${orderId}`),

  update: (orderId, updateData) =>
    apiCall(`/orders/update/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  getStats: (userId) =>
    apiCall(`/orders/stats/${userId}`),

  delete: (orderId) =>
    apiCall(`/orders/delete/${orderId}`, {
      method: "DELETE",
    }),

  cancel: (orderId) =>
    apiCall(`/orders/cancel/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({}),
    }),
};

// SHIPMENT APIS
export const shipments = {
  create: (shipmentData) =>
    apiCall("/shipments/create", {
      method: "POST",
      body: JSON.stringify(shipmentData),
    }),

  getDetail: (shipmentId) =>
    apiCall(`/shipments/${shipmentId}`),

  getByOrder: (orderId) =>
    apiCall(`/shipments/order/${orderId}`),

  update: (shipmentId, updateData) =>
    apiCall(`/shipments/${shipmentId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  predictDelay: (shipmentId) =>
    apiCall(`/shipments/${shipmentId}/predict-delay`, {
      method: "POST",
    }),
};

// ANALYTICS APIS
export const analytics = {
  getDashboard: (userId) =>
    apiCall(`/analytics/dashboard/${userId}`),

  getUserAnalytics: (userId) =>
    apiCall(`/analytics/user-analytics/${userId}`),

  getStatusBreakdown: (userId) =>
    apiCall(`/analytics/order-status-breakdown/${userId}`),

  getPriorityBreakdown: (userId) =>
    apiCall(`/analytics/priority-breakdown/${userId}`),

  getDestinationBreakdown: (userId) =>
    apiCall(`/analytics/destination-breakdown/${userId}`),

  getValueMetrics: (userId) =>
    apiCall(`/analytics/value-metrics/${userId}`),
};

export default {
  auth,
  users,
  orders,
  shipments,
  analytics,
};
