import { useEffect, useState } from "react";

import {
  getTemplates,
  getTriggers,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";


function getChannelLabel(channel) {
  const labels = {
    email: "Email",
    whatsapp: "WhatsApp",
    web_push: "Web Push",
  };

  return labels[channel] || channel;
}


const emptyForm = {
  trigger: "",
  channel: "email",
  subject: "",
  body: "",
  enabled: true,
};


function Templates() {

  const [templates, setTemplates] = useState([]);
  const [triggers, setTriggers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState(null);

  const [form, setForm] = useState(emptyForm);


  // ==============================
  // LOAD DATA
  // ==============================

  const loadTemplates = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        templatesData,
        triggersData,
      ] = await Promise.all([
        getTemplates(),
        getTriggers(),
      ]);

      setTemplates(templatesData);
      setTriggers(triggersData);

    } catch (err) {

      console.error(
        "Failed to load templates:",
        err
      );

      setError(
        "Unable to load notification templates."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadTemplates();
  }, []);


  // ==============================
  // FORM HANDLERS
  // ==============================

  const handleInputChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  const openCreateModal = () => {

    setEditingTemplate(null);

    setForm({
      ...emptyForm,
      trigger:
        triggers.length > 0
          ? String(triggers[0].id)
          : "",
    });

    setError("");
    setMessage("");

    setShowModal(true);
  };


  const openEditModal = (template) => {

    setEditingTemplate(template);

    setForm({
      trigger: String(template.trigger),
      channel: template.channel,
      subject: template.subject || "",
      body: template.body || "",
      enabled: template.enabled,
    });

    setError("");
    setMessage("");

    setShowModal(true);
  };


  const closeModal = () => {

    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingTemplate(null);
    setForm(emptyForm);
  };


  // ==============================
  // SAVE TEMPLATE
  // ==============================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.trigger) {
      setError("Please select a trigger.");
      return;
    }

    if (!form.body.trim()) {
      setError("Notification message cannot be empty.");
      return;
    }

    if (
      form.channel === "email" &&
      !form.subject.trim()
    ) {
      setError(
        "Email templates must have a subject."
      );
      return;
    }

    try {

      setSaving(true);

      const payload = {
        trigger: Number(form.trigger),
        channel: form.channel,
        subject:
          form.channel === "email"
            ? form.subject.trim()
            : "",
        body: form.body.trim(),
        enabled: form.enabled,
      };


      if (editingTemplate) {

        await updateTemplate(
          editingTemplate.id,
          payload
        );

        setMessage(
          "Template updated successfully."
        );

      } else {

        await createTemplate(payload);

        setMessage(
          "Template created successfully."
        );
      }


      setShowModal(false);
      setEditingTemplate(null);
      setForm(emptyForm);

      await loadTemplates();

} catch (err) {

  console.error(
    "Failed to save template:",
    err
  );

  const backendError =
    err?.response?.data;

  if (
    backendError &&
    typeof backendError === "object"
  ) {

    if (
      backendError.non_field_errors &&
      Array.isArray(
        backendError.non_field_errors
      )
    ) {

      setError(
        backendError.non_field_errors.join(" ")
      );

    } else if (
      backendError.detail
    ) {

      setError(
        backendError.detail
      );

    } else {

      const messages = [];

      Object.entries(
        backendError
      ).forEach(
        ([field, value]) => {

          if (Array.isArray(value)) {

            messages.push(
              `${field}: ${value.join(" ")}`
            );

          } else {

            messages.push(
              `${field}: ${String(value)}`
            );
          }
        }
      );

      setError(
        messages.length > 0
          ? messages.join(" ")
          : "Failed to save template."
      );
    }

  } else {

    setError(
      "Failed to save template."
    );
  }

} finally {

      setSaving(false);

    }
  };


  // ==============================
  // ENABLE / DISABLE
  // ==============================

  const handleToggle = async (template) => {

    try {

      setError("");
      setMessage("");

      await updateTemplate(
        template.id,
        {
          enabled: !template.enabled,
        }
      );

      setTemplates((previous) =>
        previous.map((item) =>
          item.id === template.id
            ? {
                ...item,
                enabled:
                  !template.enabled,
              }
            : item
        )
      );

      setMessage(
        `Template ${
          !template.enabled
            ? "enabled"
            : "disabled"
        } successfully.`
      );

    } catch (err) {

      console.error(
        "Failed to update template status:",
        err
      );

      setError(
        "Unable to update template status."
      );
    }
  };


  // ==============================
  // DELETE
  // ==============================

  const handleDelete = async (template) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete the "${getTriggerName(
        template
      )}" ${getChannelLabel(
        template.channel
      )} template?`
    );

    if (!confirmed) {
      return;
    }

    try {

      setError("");
      setMessage("");

      await deleteTemplate(
        template.id
      );

      setTemplates((previous) =>
        previous.filter(
          (item) =>
            item.id !== template.id
        )
      );

      setMessage(
        "Template deleted successfully."
      );

    } catch (err) {

      console.error(
        "Failed to delete template:",
        err
      );

      setError(
        "Unable to delete template."
      );
    }
  };


  // ==============================
  // HELPERS
  // ==============================

  const getTriggerName = (template) => {

    if (template.trigger_name) {
      return template.trigger_name;
    }

    const trigger = triggers.find(
      (item) =>
        item.id === template.trigger
    );

    return (
      trigger?.name ||
      "Unknown Trigger"
    );
  };


  // ==============================
  // LOADING
  // ==============================

  if (loading) {

    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">
          Loading templates...
        </div>

      </div>
    );
  }


  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>

          <h1>
            Notification Templates
          </h1>

          <p>
            Manage notification content for
            each trigger and delivery channel.
          </p>

        </div>


        <div className="template-header-actions">

          <button
            type="button"
            className="refresh-button"
            onClick={loadTemplates}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="primary-action-button"
            onClick={openCreateModal}
            disabled={triggers.length === 0}
          >
            + Create Template
          </button>

        </div>

      </div>


      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {message && (
        <div className="dashboard-success">
          {message}
        </div>
      )}


      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Templates
            </h2>

            <p>
              Notification messages configured
              for your triggers.
            </p>

          </div>

          <span className="record-count">
            {templates.length} templates
          </span>

        </div>


        {templates.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state-icon">
              ▣
            </div>

            <h3>
              No templates found
            </h3>

            <p>
              Create your first notification
              template.
            </p>

            <button
              type="button"
              className="primary-action-button"
              onClick={openCreateModal}
              disabled={triggers.length === 0}
            >
              + Create Template
            </button>

          </div>

        ) : (

          <div className="template-grid">

            {templates.map((template) => (

              <div
                className="template-card"
                key={template.id}
              >

                <div className="template-card-header">

                  <div>

                    <div className="template-trigger">
                      {getTriggerName(template)}
                    </div>

                    <div className="template-id">
                      Template #{template.id}
                    </div>

                  </div>


                  <StatusBadge
                    status={
                      template.enabled
                        ? "active"
                        : "inactive"
                    }
                  />

                </div>


                <div className="template-meta">

                  <span
                    className={
                      `channel-badge channel-${template.channel}`
                    }
                  >
                    {getChannelLabel(
                      template.channel
                    )}
                  </span>

                </div>


                {template.subject && (
                  <div className="template-subject">

                    <span>
                      Subject
                    </span>

                    <strong>
                      {template.subject}
                    </strong>

                  </div>
                )}


                <div className="template-body">

                  <span>
                    Message
                  </span>

                  <p>
                    {template.body}
                  </p>

                </div>


                <div className="template-footer">

                  <span>
                    Updated{" "}
                    {new Date(
                      template.updated_at
                    ).toLocaleString(
                      "en-IN",
                      {
                        dateStyle: "medium",
                      }
                    )}
                  </span>

                </div>


                <div className="template-actions">

                  <button
                    type="button"
                    className="template-edit-button"
                    onClick={() =>
                      openEditModal(template)
                    }
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className="template-toggle-button"
                    onClick={() =>
                      handleToggle(template)
                    }
                  >
                    {template.enabled
                      ? "Disable"
                      : "Enable"}
                  </button>


                  <button
                    type="button"
                    className="template-delete-button"
                    onClick={() =>
                      handleDelete(template)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


      {/* ==========================
          CREATE / EDIT MODAL
      =========================== */}

      {showModal && (

        <div
          className="template-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="template-modal">

            <div className="template-modal-header">

              <div>

                <h2>
                  {editingTemplate
                    ? "Edit Template"
                    : "Create Template"}
                </h2>

                <p>
                  Configure notification content
                  and delivery channel.
                </p>

              </div>


              <button
                type="button"
                className="modal-close-button"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>


            <form
              className="template-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">

                <label htmlFor="trigger">
                  Trigger
                </label>

                <select
                  id="trigger"
                  name="trigger"
                  value={form.trigger}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                >

                  <option value="">
                    Select trigger
                  </option>

                  {triggers.map((trigger) => (

                    <option
                      key={trigger.id}
                      value={trigger.id}
                    >
                      {trigger.name}
                    </option>

                  ))}

                </select>

              </div>


              <div className="form-group">

                <label htmlFor="channel">
                  Channel
                </label>

                <select
                  id="channel"
                  name="channel"
                  value={form.channel}
                  onChange={handleInputChange}
                  disabled={saving}
                  required
                >

                  <option value="email">
                    Email
                  </option>

                  <option value="whatsapp">
                    WhatsApp
                  </option>

                  <option value="web_push">
                    Web Push
                  </option>

                </select>

              </div>


              {form.channel === "email" && (

                <div className="form-group">

                  <label htmlFor="subject">
                    Email Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleInputChange}
                    placeholder="Enter email subject"
                    disabled={saving}
                  />

                </div>

              )}


              <div className="form-group">

                <label htmlFor="body">
                  Notification Message
                </label>

                <textarea
                  id="body"
                  name="body"
                  value={form.body}
                  onChange={handleInputChange}
                  placeholder="Enter notification message..."
                  rows="7"
                  disabled={saving}
                  required
                />

              </div>


              <label className="template-checkbox">

                <input
                  type="checkbox"
                  name="enabled"
                  checked={form.enabled}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <span>
                  Enable this template
                </span>

              </label>


              <div className="template-form-actions">

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="modal-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTemplate
                    ? "Update Template"
                    : "Create Template"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Templates;