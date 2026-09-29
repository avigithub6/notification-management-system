import { useEffect, useMemo, useState } from "react";

import {
  getNotificationLogs,
  getTriggers,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}


function getChannelLabel(channel) {
  const labels = {
    email: "Email",
    whatsapp: "WhatsApp",
    web_push: "Web Push",
  };

  return labels[channel] || channel;
}


function Dashboard() {

  const [logs, setLogs] = useState([]);
  const [triggers, setTriggers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const loadDashboardData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        logsData,
        triggersData,
      ] = await Promise.all([
        getNotificationLogs(),
        getTriggers(),
      ]);

      setLogs(logsData);
      setTriggers(triggersData);

    } catch (err) {

      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadDashboardData();
  }, []);


  const statistics = useMemo(() => {

    const total = logs.length;

    const sent = logs.filter(
      (log) => log.status === "sent"
    ).length;

    const failed = logs.filter(
      (log) => log.status === "failed"
    ).length;

    const activeTriggers = triggers.filter(
      (trigger) => trigger.active
    ).length;

    return {
      total,
      sent,
      failed,
      activeTriggers,
    };

  }, [logs, triggers]);


  const recentLogs = logs.slice(0, 10);


  if (loading) {

    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">
          Loading dashboard...
        </div>

      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* Page Header */}

      <div className="dashboard-header">

        <div>

          <h1>
            Notification Dashboard
          </h1>

          <p>
            Monitor notification delivery,
            triggers, and system activity.
          </p>

        </div>


        <button
          type="button"
          className="refresh-button"
          onClick={loadDashboardData}
        >
          ↻ Refresh
        </button>

      </div>


      {/* Error */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* Statistics */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-card-label">
            Total Notifications
          </div>

          <div className="stat-card-value">
            {statistics.total}
          </div>

          <div className="stat-card-description">
            All notification attempts
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-label">
            Sent
          </div>

          <div className="stat-card-value success-value">
            {statistics.sent}
          </div>

          <div className="stat-card-description">
            Successfully delivered
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-label">
            Failed
          </div>

          <div className="stat-card-value failed-value">
            {statistics.failed}
          </div>

          <div className="stat-card-description">
            Delivery failures
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-label">
            Active Triggers
          </div>

          <div className="stat-card-value">
            {statistics.activeTriggers}
          </div>

          <div className="stat-card-description">
            Currently active
          </div>

        </div>

      </div>


      {/* Recent Notifications */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Recent Notifications
            </h2>

            <p>
              Latest notification delivery
              activity.
            </p>

          </div>

          <span className="record-count">
            {recentLogs.length} records
          </span>

        </div>


        {recentLogs.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state-icon">
              ◷
            </div>

            <h3>
              No notifications yet
            </h3>

            <p>
              Notification activity will
              appear here after a trigger
              is fired.
            </p>

          </div>

        ) : (

          <div className="notification-table-wrapper">

            <table className="notification-table">

              <thead>

                <tr>

                  <th>
                    Trigger
                  </th>

                  <th>
                    Channel
                  </th>

                  <th>
                    Recipient
                  </th>

                  <th>
                    Message
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentLogs.map((log) => (

                  <tr key={log.id}>

                    <td>

                      <div className="table-primary">
                        {log.trigger_name ||
                          "Unknown Trigger"}
                      </div>

                      <div className="table-secondary">
                        #{log.id}
                      </div>

                    </td>


                    <td>

                      <span
                        className={
                          `channel-badge channel-${log.channel}`
                        }
                      >
                        {getChannelLabel(
                          log.channel
                        )}
                      </span>

                    </td>


                    <td>

                      <span className="recipient-text">
                        {log.recipient}
                      </span>

                    </td>


                    <td>

                      <div
                        className="message-cell"
                        title={log.message}
                      >
                        {log.message}
                      </div>

                      {log.error_message && (
                        <div className="error-message">
                          {log.error_message}
                        </div>
                      )}

                    </td>


                    <td>

                      <StatusBadge
                        status={log.status}
                      />

                    </td>


                    <td>

                      <span className="date-text">
                        {formatDateTime(
                          log.created_at
                        )}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}


export default Dashboard;