import { useEffect, useMemo, useState } from "react";

import {
  getNotificationLogs,
  getTriggers,
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


function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}


function Notifications() {

  const [logs, setLogs] = useState([]);
  const [triggers, setTriggers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [channelFilter, setChannelFilter] =
    useState("all");

  const [triggerFilter, setTriggerFilter] =
    useState("all");

  const [search, setSearch] = useState("");


  // =====================================
  // LOAD NOTIFICATIONS
  // =====================================

  const loadNotifications = async () => {

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
        "Failed to load notifications:",
        err
      );

      setError(
        "Unable to load notification history."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadNotifications();
  }, []);


  // =====================================
  // FILTER NOTIFICATIONS
  // =====================================

  const filteredLogs = useMemo(() => {

    return logs.filter((log) => {

      const matchesStatus =
        statusFilter === "all" ||
        log.status === statusFilter;


      const matchesChannel =
        channelFilter === "all" ||
        log.channel === channelFilter;


      const matchesTrigger =
        triggerFilter === "all" ||
        String(log.trigger) ===
          String(triggerFilter);


      const searchValue =
        search.trim().toLowerCase();


      const matchesSearch =
        !searchValue ||
        log.recipient
          ?.toLowerCase()
          .includes(searchValue) ||
        log.message
          ?.toLowerCase()
          .includes(searchValue) ||
        log.subject
          ?.toLowerCase()
          .includes(searchValue) ||
        log.trigger_name
          ?.toLowerCase()
          .includes(searchValue);


      return (
        matchesStatus &&
        matchesChannel &&
        matchesTrigger &&
        matchesSearch
      );

    });

  }, [
    logs,
    statusFilter,
    channelFilter,
    triggerFilter,
    search,
  ]);


  // =====================================
  // COUNTS
  // =====================================

  const sentCount = logs.filter(
    (log) =>
      log.status === "sent"
  ).length;

  const failedCount = logs.filter(
    (log) =>
      log.status === "failed"
  ).length;

  const pendingCount = logs.filter(
    (log) =>
      log.status === "pending"
  ).length;


  // =====================================
  // CLEAR FILTERS
  // =====================================

  const clearFilters = () => {

    setStatusFilter("all");
    setChannelFilter("all");
    setTriggerFilter("all");
    setSearch("");

  };


  const hasFilters =
    statusFilter !== "all" ||
    channelFilter !== "all" ||
    triggerFilter !== "all" ||
    search.trim() !== "";


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">
          Loading notifications...
        </div>

      </div>
    );

  }


  // =====================================
  // PAGE
  // =====================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <h1>
            Notifications
          </h1>

          <p>
            Monitor notification delivery
            history and results.
          </p>

        </div>


        <button
          type="button"
          className="refresh-button"
          onClick={loadNotifications}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}


      {/* SUMMARY */}

      <div className="notification-summary">

        <div className="notification-summary-card">

          <span>
            Total
          </span>

          <strong>
            {logs.length}
          </strong>

        </div>


        <div className="notification-summary-card">

          <span>
            Sent
          </span>

          <strong className="summary-sent">
            {sentCount}
          </strong>

        </div>


        <div className="notification-summary-card">

          <span>
            Failed
          </span>

          <strong className="summary-failed">
            {failedCount}
          </strong>

        </div>


        <div className="notification-summary-card">

          <span>
            Pending
          </span>

          <strong className="summary-pending">
            {pendingCount}
          </strong>

        </div>

      </div>


      {/* MAIN SECTION */}

      <div className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              Notification History
            </h2>

            <p>
              Review every notification delivery
              attempt recorded by the system.
            </p>

          </div>


          <span className="record-count">
            {filteredLogs.length} results
          </span>

        </div>


        {/* FILTERS */}

        <div className="notification-filters">

          <div className="notification-search">

            <input
              type="text"
              placeholder="Search recipient, message..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="all">
              All Status
            </option>

            <option value="sent">
              Sent
            </option>

            <option value="failed">
              Failed
            </option>

            <option value="pending">
              Pending
            </option>

          </select>


          <select
            value={channelFilter}
            onChange={(event) =>
              setChannelFilter(
                event.target.value
              )
            }
          >

            <option value="all">
              All Channels
            </option>

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


          <select
            value={triggerFilter}
            onChange={(event) =>
              setTriggerFilter(
                event.target.value
              )
            }
          >

            <option value="all">
              All Triggers
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


          {hasFilters && (

            <button
              type="button"
              className="clear-filter-button"
              onClick={clearFilters}
            >
              Clear
            </button>

          )}

        </div>


        {/* TABLE */}

        {filteredLogs.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state-icon">
              ▤
            </div>

            <h3>
              No notifications found
            </h3>

            <p>
              Try changing your filters or
              fire a notification trigger.
            </p>

            {hasFilters && (

              <button
                type="button"
                className="primary-action-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            )}

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

                {filteredLogs.map((log) => (

                  <tr key={log.id}>

                    {/* TRIGGER */}

                    <td>

                      <div className="table-primary">

                        {log.trigger_name ||
                          "Unknown Trigger"}

                      </div>

                      <div className="table-secondary">

                        Log #{log.id}

                      </div>

                    </td>


                    {/* CHANNEL */}

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


                    {/* RECIPIENT */}

                    <td>

                      <div className="notification-recipient">

                        {log.recipient}

                      </div>

                    </td>


                    {/* MESSAGE */}

                    <td>

                      <div className="notification-message-cell">

                        {log.subject && (

                          <strong>
                            {log.subject}
                          </strong>

                        )}

                        <span>
                          {log.message}
                        </span>


                        {log.error_message && (

                          <div className="notification-error-text">

                            Error:{" "}
                            {log.error_message}

                          </div>

                        )}

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <StatusBadge
                        status={log.status}
                      />

                    </td>


                    {/* DATE */}

                    <td>

                      <span className="date-text">

                        {formatDate(
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


export default Notifications;