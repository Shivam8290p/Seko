import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="page container">
      <div className="not-found-state">
        <div className="not-found-code" aria-hidden="true">404</div>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-desc">
          The URL you typed doesn't exist. Check for a typo, or head back to the marketplace.
        </p>
        <div className="not-found-actions">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Go back
          </button>
          <Link to="/" className="btn btn-ghost">
            Browse marketplace
          </Link>
        </div>
        <p className="not-found-legal">
          Looking for our <Link to="/privacy">Privacy Policy</Link> or{" "}
          <Link to="/terms">Terms of Service</Link>?
        </p>
      </div>
    </main>
  );
}
