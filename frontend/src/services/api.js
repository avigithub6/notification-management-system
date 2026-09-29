import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// ==============================
// TRIGGERS
// ==============================

export const getTriggers = async () => {
  const response = await api.get("/triggers/");
  return response.data;
};


export const createTrigger = async (
  triggerData
) => {
  const response = await api.post(
    "/triggers/",
    triggerData
  );

  return response.data;
};


export const updateTrigger = async (
  triggerId,
  triggerData
) => {
  const response = await api.patch(
    `/triggers/${triggerId}/`,
    triggerData
  );

  return response.data;
};


export const deleteTrigger = async (
  triggerId
) => {
  const response = await api.delete(
    `/triggers/${triggerId}/`
  );

  return response.data;
};


export const fireTrigger = async (
  triggerId,
  recipients
) => {
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

export const createTemplate = async (
  templateData
) => {
  const response = await api.post(
    "/templates/",
    templateData
  );

  return response.data;
};

export const updateTemplate = async (
  templateId,
  templateData
) => {
  const response = await api.patch(
    `/templates/${templateId}/`,
    templateData
  );

  return response.data;
};

export const deleteTemplate = async (
  templateId
) => {
  const response = await api.delete(
    `/templates/${templateId}/`
  );

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

export const updateChannel = async (
  channelId,
  enabled
) => {
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