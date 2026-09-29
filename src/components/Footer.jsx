import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <span className="footer-brand">Seko</span>
        <nav className="footer-links" aria-label="Legal links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Seko. Campus marketplace for students.
        </p>
      </div>
    </footer>
  );
}
