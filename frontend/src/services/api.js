
import axios from "axios";

const TOKEN_KEY = "notification_admin_token";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// AUTHENTICATION
// ==============================

// Attach admin token automatically to API requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export const getAdminToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const adminLogin = async (username, password) => {
  const response = await api.post("/auth/login/", {
    username,
    password,
  });

  if (response.data.success && response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }

  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};

export const adminLogout = async () => {
  try {
    const response = await api.post("/auth/logout/");
    return response.data;
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearAdminToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ==============================
// TRIGGERS
// ==============================

export const getTriggers = async () => {
  const response = await api.get("/triggers/");
  return response.data;
};

export const createTrigger = async (triggerData) => {
  const response = await api.post("/triggers/", triggerData);
  return response.data;
};

export const updateTrigger = async (triggerId, triggerData) => {
  const response = await api.patch(
    `/triggers/${triggerId}/`,
    triggerData
  );
  return response.data;
};

export const deleteTrigger = async (triggerId) => {
  const response = await api.delete(`/triggers/${triggerId}/`);
  return response.data;
};

export const fireTrigger = async (triggerId, recipients) => {
  const response = await api.post(
    `/triggers/${triggerId}/fire/`,
    { recipients }
  );
  return response.data;
};

// ==============================
// TEMPLATES
// ==============================

export const getTemplates = async () => {
  const response = await api.get("/templates/");
  return response.data;
};

export const createTemplate = async (templateData) => {
  const response = await api.post("/templates/", templateData);
  return response.data;
};

export const updateTemplate = async (templateId, templateData) => {
  const response = await api.patch(
    `/templates/${templateId}/`,
    templateData
  );
  return response.data;
};

export const deleteTemplate = async (templateId) => {
  const response = await api.delete(`/templates/${templateId}/`);
  return response.data;
};

// ==============================
// NOTIFICATION LOGS
// ==============================

export const getNotificationLogs = async () => {
  const response = await api.get("/logs/");
  return response.data;
};

// ==============================
// CHANNELS
// ==============================

export const getChannels = async () => {
  const response = await api.get("/channels/");
  return response.data;
};

export const updateChannel = async (channelId, enabled) => {
  const response = await api.patch(
    `/channels/${channelId}/`,
    { enabled }
  );
  return response.data;
};

export const testTemplate = async (templateId, recipient) => {
  const response = await api.post(
    `/templates/${templateId}/test-send/`,
    { recipient }
  );
  return response.data;
};

// ==============================
// WEBSITE EVENTS
// ==============================

export const sendWebsiteEvent = async (eventKey, recipients) => {
  const response = await api.post(
    "/triggers/website-event/",
    {
      event_key: eventKey,
      recipients,
    }
  );

  return response.data;
};

// ==============================
// DEMO WEBSITE
// ==============================

export const createDemoOrder = async (orderData) => {
  const response = await api.post(
    "/triggers/create-demo-order/",
    orderData
  );

  return response.data;
};

export const completeDemoPayment = async (orderId) => {
  const response = await api.post(
    "/triggers/complete-demo-payment/",
    {
      order_id: orderId,
    }
  );

  return response.data;
};

export default api;
