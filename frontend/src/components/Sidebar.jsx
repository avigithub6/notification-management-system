
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { NAVIGATION_ITEMS } from "../utils/constants";
import { adminLogout } from "../services/api";

function Sidebar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await adminLogout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // adminLogout() removes the local token even if the request fails.
      navigate("/login", { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">N</div>

        <div>
          <h2>NotifyFlow</h2>
          <span>Notification System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <span className="online-dot" />

          <div>
            <strong>System Online</strong>
            <small>API connected</small>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <span className="logout-icon" aria-hidden="true">
            ↪
          </span>
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
