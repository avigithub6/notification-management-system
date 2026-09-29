import { NavLink } from "react-router-dom";
import { NAVIGATION_ITEMS } from "../utils/constants";

function Sidebar() {
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
      </div>
    </aside>
  );
}

export default Sidebar;
