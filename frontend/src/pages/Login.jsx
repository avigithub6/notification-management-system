import "./Login.css";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  adminLogin,
  getAdminToken,
} from "../services/api";

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
    background: "#f8fafc",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    overflowX: "hidden",
  },
  branding: {
    background: "linear-gradient(145deg, #0b1f47 0%, #164ca2 65%, #2563eb 100%)",
    color: "#fff",
    padding: "clamp(24px, 4vw, 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "21px",
    fontWeight: 800,
    letterSpacing: "-0.6px",
  },
  logoIcon: {
    width: "43px",
    height: "43px",
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.25)",
    fontSize: "24px",
  },
  formSide: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "clamp(24px, 5vw, 48px)",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 650,
    color: "#334155",
    marginBottom: "9px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 16px",
    border: "1px solid #dbe3ee",
    borderRadius: "11px",
    fontSize: "15px",
    outlineColor: "#2563eb",
    background: "#fff",
    color: "#0f172a",
  },
  primaryButton: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "11px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
  },
  secondaryButton: {
    display: "block",
    textAlign: "center",
    textDecoration: "none",
    padding: "14px",
    border: "1px solid #dbe3ee",
    borderRadius: "11px",
    color: "#1d4ed8",
    fontSize: "14px",
    fontWeight: 700,
    background: "#fff",
  },
};

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (getAdminToken()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminLogin(username.trim(), password);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.message || "Unable to sign in.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please verify your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left branding section */}
      <section style={styles.branding}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          <span>NotifyHub</span>
        </div>

        <div style={{ maxWidth: "530px", padding: "45px 0" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 13px",
              borderRadius: "30px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: "12px",
              fontWeight: 650,
              marginBottom: "25px",
            }}
          >
            CENTRALIZED NOTIFICATION PLATFORM
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 4vw, 53px)",
              lineHeight: 1.15,
              letterSpacing: "-1.7px",
              margin: "0 0 20px",
            }}
          >
            Every notification.
            <br />
            One powerful platform.
          </h1>

          <p
            style={{
              color: "#dbeafe",
              fontSize: "16px",
              lineHeight: 1.8,
              maxWidth: "450px",
            }}
          >
            Manage notification triggers, templates and delivery channels
            from a single intelligent dashboard.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "30px",
            }}
          >
            {["WhatsApp", "Email", "Push Notifications"].map((item) => (
              <span
                key={item}
                style={{
                  padding: "9px 13px",
                  borderRadius: "9px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </div>

        <div style={{ color: "#bfdbfe", fontSize: "12px" }}>
          © {new Date().getFullYear()} NotifyHub · Notification Management System
        </div>
      </section>

      {/* Right login section */}
      <main style={styles.formSide}>
        <div style={styles.card}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "#2563eb",
              background: "#eff6ff",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "22px",
            }}
          >
            ● SECURE ADMIN PORTAL
          </div>

          <h2
            style={{
              fontSize: "32px",
              letterSpacing: "-1px",
              color: "#0f172a",
              margin: "0 0 9px",
            }}
          >
            Welcome back
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              lineHeight: 1.7,
              margin: "0 0 33px",
            }}
          >
            Sign in to manage your notification workflows.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "21px" }}>
              <label htmlFor="username" style={styles.label}>
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    ...styles.input,
                    paddingRight: "75px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  padding: "12px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "9px",
                  color: "#b91c1c",
                  fontSize: "13px",
                  margin: "18px 0",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.primaryButton,
                marginTop: "19px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              margin: "27px 0",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            NEW TO NOTIFYHUB?
            <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          </div>

          <Link to="/register" style={styles.secondaryButton}>
            Create New Account →
          </Link>

          <p
            style={{
              textAlign: "center",
              marginTop: "28px",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            Protected access · Authorized users only
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
