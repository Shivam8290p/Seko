import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DEMO_USERS } from "../data/seed";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("user"); // "user" | "seller"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const demo = mode === "user" ? DEMO_USERS.student : DEMO_USERS.seller;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const e_lc = email.trim().toLowerCase();
    const p = password;

    if (!e_lc) { setError("Email is required."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e_lc)) { setError("Enter a valid email address."); return; }
    if (!p) { setError("Password is required."); return; }

    let matched = null;
    if (mode === "user" && e_lc === DEMO_USERS.student.email && p === DEMO_USERS.student.password) {
      matched = DEMO_USERS.student;
    } else if (mode === "seller" && e_lc === DEMO_USERS.seller.email && p === DEMO_USERS.seller.password) {
      matched = DEMO_USERS.seller;
    }

    if (matched) {
      login({ role: matched.role, name: matched.name, sellerId: matched.sellerId || null });
      navigate(matched.role === "seller" ? "/seller/dashboard" : "/");
    } else {
      setError("Invalid credentials. Check the demo hint below.");
    }
  };

  const fillDemo = () => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1 className="login-logo">Seko</h1>
          <p className="login-tagline">Campus marketplace for students</p>
        </div>

        <div className="login-toggle" role="tablist">
          <button
            role="tab"
            aria-selected={mode === "user"}
            className={`toggle-tab${mode === "user" ? " active" : ""}`}
            onClick={() => { setMode("user"); setError(""); setEmail(""); setPassword(""); }}
            id="tab-user"
          >
            Student
          </button>
          <button
            role="tab"
            aria-selected={mode === "seller"}
            className={`toggle-tab${mode === "seller" ? " active" : ""}`}
            onClick={() => { setMode("seller"); setError(""); setEmail(""); setPassword(""); }}
            id="tab-seller"
          >
            Seller
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder={demo.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={!!error}
            />
          </div>

          {error && <p id="login-error" className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full">
            Log in as {mode === "user" ? "Student" : "Seller"}
          </button>
        </form>

        <div className="login-demo-hint">
          <p>
            <strong>Demo credentials:</strong>{" "}
            <code>{demo.email}</code> / <code>{demo.password}</code>
          </p>
          <button className="btn btn-ghost btn-sm" onClick={fillDemo}>
            Fill automatically
          </button>
        </div>

        <p className="login-legal">
          By logging in you agree to our{" "}
          <a href="/terms">Terms of Service</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
