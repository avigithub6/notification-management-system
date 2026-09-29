
import {
  Workflow,
  Mail,
  MessageCircle,
  Bell,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  getTriggers,
  getTemplates,
  getChannels,
  createTemplate,
  updateTemplate,
  testTemplate,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";
import "./NotificationSettings.css";

const CHANNELS = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "email", label: "Email", icon: Mail },
  { key: "web_push", label: "Web Push", icon: Bell },
];

const EMPTY_FORM = {
  subject: "",
  body: "",
  enabled: true,
};

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (!data) return error?.message || "Something went wrong.";
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;

  return Object.entries(data)
    .map(([key, value]) => {
      const message = Array.isArray(value)
        ? value.join(", ")
        : String(value);

      return `${key}: ${message}`;
    })
    .join(" | ");
}

function NotificationSettings() {
  const [triggers, setTriggers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [channels, setChannels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTemplateId, setBusyTemplateId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [testing, setTesting] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [testResult, setTestResult] = useState(null);

  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [triggerData, templateData, channelData] =
        await Promise.all([
          getTriggers(),
          getTemplates(),
          getChannels(),
        ]);

      setTriggers(triggerData);
      setTemplates(templateData);
      setChannels(channelData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const templateMap = useMemo(() => {
    const map = new Map();

    templates.forEach((template) => {
      map.set(
        `${template.trigger}:${template.channel}`,
        template
      );
    });

    return map;
  }, [templates]);

  const channelMap = useMemo(() => {
    return new Map(
      channels.map((channel) => [
        channel.channel_key,
        channel,
      ])
    );
  }, [channels]);

  const triggerStats = useMemo(() => {
    const stats = new Map();

    triggers.forEach((trigger) => {
      const triggerTemplates = templates.filter(
        (template) =>
          String(template.trigger) === String(trigger.id)
      );

      const availableChannels = new Set(
        triggerTemplates
          .filter(
            (template) =>
              template.enabled &&
              channelMap.get(template.channel)?.enabled
          )
          .map((template) => template.channel)
      );

      stats.set(trigger.id, {
        templates: triggerTemplates.length,
        channels: availableChannels.size,
      });
    });

    return stats;
  }, [triggers, templates, channelMap]);

  const activeTriggers = triggers.filter(
    (trigger) => trigger.active
  ).length;

  const enabledTemplates = templates.filter(
    (template) => template.enabled
  ).length;

  const openEditor = (trigger, channel, template) => {
    setError("");
    setNotice("");

    setEditing({ trigger, channel, template });

    setForm(
      template
        ? {
            subject: template.subject || "",
            body: template.body || "",
            enabled: template.enabled,
          }
        : { ...EMPTY_FORM }
    );
  };

  const saveTemplate = async (event) => {
    event.preventDefault();

    if (!editing || saving) return;

    setSaving(true);
    setError("");

    const payload = {
      trigger: editing.trigger.id,
      channel: editing.channel.key,
      subject: form.subject.trim(),
      body: form.body.trim(),
      enabled: form.enabled,
    };

    try {
      if (editing.template) {
        await updateTemplate(
          editing.template.id,
          payload
        );
      } else {
        await createTemplate(payload);
      }

      setEditing(null);
      setNotice("Template saved successfully.");

      await loadData(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleTemplate = async (template) => {
    if (busyTemplateId !== null) return;

    setBusyTemplateId(template.id);
    setError("");
    setNotice("");

    try {
      await updateTemplate(template.id, {
        enabled: !template.enabled,
      });

      setNotice(
        `Template ${
          template.enabled ? "disabled" : "enabled"
        } successfully.`
      );

      await loadData(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyTemplateId(null);
    }
  };

  const openTest = (trigger, channel, template) => {
    setError("");
    setNotice("");
    setTestResult(null);
    setRecipient("");

    setTesting({ trigger, channel, template });
  };

  const sendTest = async (event) => {
    event.preventDefault();

    if (!testing || saving) return;

    setSaving(true);
    setError("");
    setTestResult(null);

    try {
      const result = await testTemplate(
        testing.template.id,
        recipient.trim()
      );

      setTestResult(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (saving) return;

    setEditing(null);
    setTesting(null);
    setTestResult(null);
    setError("");
  };

  return (
    <div className="dashboard-page ns-page">
      <div className="dashboard-header ns-page-header">
        <div>
          <h1>Notification Settings</h1>
          <p>
            Manage all notification templates from one workspace.
          </p>
        </div>

        <button
          type="button"
          className="ns-refresh-button"
          disabled={loading}
          onClick={() => {
            setError("");
            setNotice("");
            loadData();
          }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="dashboard-success">
          {notice}
        </div>
      )}

      {error && !editing && !testing && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          Loading notification settings...
        </div>
      ) : (
        <>
          <div className="ns-overview">
            <div className="ns-overview-item">
              <span>Total Triggers</span>
              <strong>{triggers.length}</strong>
            </div>

            <div className="ns-overview-item">
              <span>Active Triggers</span>
              <strong>{activeTriggers}</strong>
            </div>

            <div className="ns-overview-item">
              <span>Templates Configured</span>
              <strong>{templates.length}</strong>
            </div>

            <div className="ns-overview-item">
              <span>Enabled Templates</span>
              <strong>{enabledTemplates}</strong>
            </div>
          </div>

          <div className="ns-section-heading">
            <div>
              <h2>Trigger Configuration</h2>
              <p>
                One table for all triggers and notification channels.
              </p>
            </div>

            <span className="ns-section-count">
              {triggers.length} triggers
            </span>
          </div>

          <div className="ns-table-container">
            <table className="ns-settings-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="ns-heading-label">
                      Trigger
                    </span>
                  </th>

                  {CHANNELS.map((channel) => {
                    const Icon = channel.icon;

                    const globalEnabled =
                      channelMap.get(channel.key)?.enabled ??
                      false;

                    return (
                      <th
                        scope="col"
                        key={channel.key}
                      >
                        <div className="ns-column-heading">
                          <div className="ns-column-title">
                            <Icon
                              size={17}
                              strokeWidth={1.8}
                            />
                            <strong>
                              {channel.label}
                            </strong>
                          </div>

                          <span
                            className={`ns-channel-state ${
                              globalEnabled
                                ? "ns-state-on"
                                : "ns-state-off"
                            }`}
                          >
                            <span className="ns-state-dot" />
                            {globalEnabled
                              ? "Available"
                              : "Disabled"}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {triggers.map((trigger) => {
                  const stats = triggerStats.get(
                    trigger.id
                  ) || {
                    templates: 0,
                    channels: 0,
                  };

                  return (
                    <tr key={trigger.id}>
                      <th
                        scope="row"
                        className="ns-trigger-cell"
                      >
                        <div className="ns-trigger-identity">
                          <div className="ns-trigger-top">
                            <span className="ns-trigger-icon">
                              <Workflow
                                size={19}
                                strokeWidth={1.8}
                              />
                            </span>

                            <div className="ns-trigger-info">
                              <h3>
                                {trigger.name}
                              </h3>

                              <StatusBadge
                                status={
                                  trigger.active
                                    ? "active"
                                    : "inactive"
                                }
                              />
                            </div>
                          </div>

                          <div className="ns-trigger-description">
                            <span className="ns-trigger-label">
                              DESCRIPTION
                            </span>

                            <p>
                              {trigger.description ||
                                "No description available."}
                            </p>
                          </div>

                          <div className="ns-trigger-stats">
                            <div className="ns-trigger-stat">
                              <span className="ns-stat-icon">
                                <Bell size={17} />
                              </span>

                              <div>
                                <span>
                                  TEMPLATES
                                </span>
                                <strong>
                                  {stats.templates}
                                </strong>
                              </div>
                            </div>

                            <div className="ns-trigger-stat">
                              <span className="ns-stat-icon">
                                <Mail size={17} />
                              </span>

                              <div>
                                <span>
                                  CHANNELS
                                </span>
                                <strong>
                                  {stats.channels}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </th>

                      {CHANNELS.map((channel) => {
                        const template =
                          templateMap.get(
                            `${trigger.id}:${channel.key}`
                          );

                        const globalEnabled =
                          channelMap.get(channel.key)
                            ?.enabled ?? false;

                        const canTest =
                          Boolean(template) &&
                          template.enabled &&
                          trigger.active &&
                          globalEnabled;

                        return (
                          <td
                            key={channel.key}
                            className="ns-template-cell"
                          >
                            <div
                              className={`ns-cell-card ${
                                !globalEnabled
                                  ? "ns-cell-muted"
                                  : ""
                              }`}
                            >
                              {!template ? (
                                <>
                                  <div className="ns-cell-content ns-cell-empty">
                                    <span className="ns-empty-icon">
                                      <Plus size={19} />
                                    </span>

                                    <strong>
                                      No template configured
                                    </strong>

                                    <p>
                                      Create a message
                                      template for this
                                      channel.
                                    </p>
                                  </div>

                                  <div className="ns-cell-actions">
                                    <button
                                      type="button"
                                      className="ns-create-button"
                                      onClick={() =>
                                        openEditor(
                                          trigger,
                                          channel,
                                          null
                                        )
                                      }
                                    >
                                      <Plus size={13} />
                                      Create Template
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="ns-cell-content">
                                    <div className="ns-template-meta">
                                      <StatusBadge
                                        status={
                                          template.enabled
                                            ? "active"
                                            : "inactive"
                                        }
                                      />

                                      <span>
                                        Template #
                                        {template.id}
                                      </span>
                                    </div>

                                    <div className="ns-message-preview">
                                      <span className="ns-preview-label">
                                        MESSAGE PREVIEW
                                      </span>

                                      {template.subject && (
                                        <strong className="ns-message-title">
                                          {
                                            template.subject
                                          }
                                        </strong>
                                      )}

                                      <p className="ns-message-body">
                                        {template.body}
                                      </p>
                                    </div>

                                    {!globalEnabled && (
                                      <div className="ns-inline-warning">
                                        Channel disabled in
                                        global Settings.
                                      </div>
                                    )}
                                  </div>

                                  <div className="ns-cell-actions">
                                    <button
                                      type="button"
                                      className="ns-action-button"
                                      onClick={() =>
                                        openEditor(
                                          trigger,
                                          channel,
                                          template
                                        )
                                      }
                                    >
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      className="ns-action-button"
                                      disabled={
                                        busyTemplateId !==
                                        null
                                      }
                                      onClick={() =>
                                        toggleTemplate(
                                          template
                                        )
                                      }
                                    >
                                      {busyTemplateId ===
                                      template.id
                                        ? "Saving..."
                                        : template.enabled
                                        ? "Turn off"
                                        : "Turn on"}
                                    </button>

                                    <button
                                      type="button"
                                      className="ns-action-button ns-action-test"
                                      disabled={!canTest}
                                      title={
                                        canTest
                                          ? "Send test notification"
                                          : "Enable the trigger, template and channel to test"
                                      }
                                      onClick={() =>
                                        openTest(
                                          trigger,
                                          channel,
                                          template
                                        )
                                      }
                                    >
                                      Test
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {triggers.length === 0 && (
                  <tr>
                    <td
                      className="ns-empty-row"
                      colSpan={
                        CHANNELS.length + 1
                      }
                    >
                      <h3>
                        No triggers configured
                      </h3>

                      <p>
                        Create your first trigger
                        from the Triggers page.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <div className="ns-modal-overlay">
          <div
            className="ns-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ns-editor-title"
          >
            <div className="ns-modal-heading">
              <div>
                <h2 id="ns-editor-title">
                  {editing.template
                    ? "Edit Template"
                    : "Create Template"}
                </h2>

                <p>
                  {editing.trigger.name} ·{" "}
                  {editing.channel.label}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="ns-form"
              onSubmit={saveTemplate}
            >
              {error && (
                <div className="dashboard-error">
                  {error}
                </div>
              )}

              {editing.channel.key !==
                "whatsapp" && (
                <label className="ns-field">
                  <span>
                    {editing.channel.key ===
                    "web_push"
                      ? "Notification title"
                      : "Email subject"}
                  </span>

                  <input
                    value={form.subject}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        subject:
                          event.target.value,
                      })
                    }
                    required={
                      editing.channel.key ===
                      "email"
                    }
                    placeholder="Enter title or subject"
                  />
                </label>
              )}

              <label className="ns-field">
                <span>Message body</span>

                <textarea
                  rows={6}
                  value={form.body}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      body: event.target.value,
                    })
                  }
                  required
                  placeholder="Enter notification message"
                />
              </label>

              <label className="ns-check">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      enabled:
                        event.target.checked,
                    })
                  }
                />

                Enable this template
              </label>

              <div className="ns-modal-actions">
                <button
                  type="button"
                  className="ns-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ns-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {testing && (
        <div className="ns-modal-overlay">
          <div
            className="ns-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ns-test-title"
          >
            <div className="ns-modal-heading">
              <div>
                <h2 id="ns-test-title">
                  Test Notification
                </h2>

                <p>
                  {testing.trigger.name} ·{" "}
                  {testing.channel.label}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="ns-form"
              onSubmit={sendTest}
            >
              {error && (
                <div className="dashboard-error">
                  {error}
                </div>
              )}

              <label className="ns-field">
                <span>
                  {testing.channel.key ===
                  "whatsapp"
                    ? "Test phone number"
                    : testing.channel.key ===
                      "email"
                    ? "Test email address"
                    : "Web Push recipient ID"}
                </span>

                <input
                  type={
                    testing.channel.key ===
                    "email"
                      ? "email"
                      : "text"
                  }
                  value={recipient}
                  onChange={(event) =>
                    setRecipient(
                      event.target.value
                    )
                  }
                  placeholder={
                    testing.channel.key ===
                    "whatsapp"
                      ? "+919876543210"
                      : testing.channel.key ===
                        "email"
                      ? "you@example.com"
                      : "Browser subscription ID"
                  }
                  required
                />
              </label>

              {testResult && (
                <div
                  className={
                    testResult.success
                      ? "ns-result-success"
                      : "ns-result-failed"
                  }
                >
                  <strong>
                    {testResult.success
                      ? "Test completed"
                      : "Test failed"}
                  </strong>

                  {testResult.message && (
                    <p>
                      {testResult.message}
                    </p>
                  )}

                  {testResult.notification
                    ?.id && (
                    <small>
                      Log #
                      {
                        testResult
                          .notification.id
                      }
                    </small>
                  )}
                </div>
              )}

              <div className="ns-modal-actions">
                <button
                  type="button"
                  className="ns-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="ns-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Sending..."
                    : "Send Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;
