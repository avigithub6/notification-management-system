function StatusBadge({ status }) {

  const statusConfig = {

    sent: {
      label: "Sent",
      className: "status-sent",
    },

    failed: {
      label: "Failed",
      className: "status-failed",
    },

    pending: {
      label: "Pending",
      className: "status-pending",
    },

    active: {
      label: "Active",
      className: "status-sent",
    },

    inactive: {
      label: "Inactive",
      className: "status-failed",
    },

  };


  const config =
    statusConfig[status] || {
      label: status || "Unknown",
      className: "status-unknown",
    };


  return (
    <span
      className={
        `status-badge ${config.className}`
      }
    >
      <span className="status-dot" />

      {config.label}
    </span>
  );
}


export default StatusBadge;