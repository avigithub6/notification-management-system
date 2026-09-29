
import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Triggers from "./pages/Triggers";
import Templates from "./pages/Templates";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotificationSettings from "./pages/NotificationSettings";
import DemoWebsite from "./pages/DemoWebsite";
import Login from "./pages/Login";

import {
  clearAdminToken,
  getAdminProfile,
  getAdminToken,
} from "./services/api";

function ProtectedRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      if (!getAdminToken()) {
        if (active) setStatus("unauthorized");
        return;
      }

      try {
        const profile = await getAdminProfile();

        if (active) {
          setStatus(
            profile.success && profile.is_staff
              ? "authorized"
              : "unauthorized"
          );
        }
      } catch (error) {
        if (error.response?.status === 401 ||
            error.response?.status === 403) {
          clearAdminToken();
        }

        if (active) setStatus("unauthorized");
      }
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Verifying admin access...
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login */}
        <Route path="/login" element={<Login />} />

        {/* Public customer demo */}
        <Route path="/demo-website" element={<DemoWebsite />} />

        {/* Admin-only pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/triggers" element={<Triggers />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              path="/notification-management"
              element={<NotificationSettings />}
            />

            <Route
              path="/notification-settings"
              element={
                <Navigate
                  to="/notification-management"
                  replace
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
