
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Triggers from "./pages/Triggers";
import Templates from "./pages/Templates";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotificationSettings from "./pages/NotificationSettings";
import DemoWebsite from "./pages/DemoWebsite";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/triggers" element={<Triggers />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />

          <Route
            path="/notification-settings"
            element={<NotificationSettings />}
          />

          <Route
            path="/demo-website"
            element={<DemoWebsite />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
