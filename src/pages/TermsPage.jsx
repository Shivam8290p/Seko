import React from "react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <main className="page container legal-page">
      <Link to="/" className="back-link">← Back</Link>
      <h1 className="page-title">Terms of Service</h1>
      <p className="page-subtitle">Last updated: September 2026</p>

      <div className="legal-body">
        <section>
          <h2>1. Acceptance</h2>
          <p>
            By accessing or using Seko you agree to be bound by these Terms. If you do not agree,
            do not use the service.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            Seko is intended for use by enrolled students and authorised staff of participating
            campuses. You must have a valid demo account (or an account provided by your campus)
            to access the marketplace.
          </p>
        </section>

        <section>
          <h2>3. Listings and transactions</h2>
          <ul>
            <li>Sellers are solely responsible for the accuracy and legality of their listings.</li>
            <li>Seko does not inspect, certify, or guarantee any listed item.</li>
            <li>All transactions are arranged directly between buyer and seller. Seko is not a party to any sale.</li>
            <li>Sellers must not list counterfeit, stolen, prohibited, or illegal goods.</li>
          </ul>
        </section>

        <section>
          <h2>4. Prohibited conduct</h2>
          <p>You must not:</p>
          <ul>
            <li>Use the service for any unlawful purpose.</li>
            <li>Post false, misleading, or fraudulent listings.</li>
            <li>Attempt to gain unauthorised access to other accounts or the underlying systems.</li>
            <li>Scrape, copy, or redistribute content without permission.</li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual property</h2>
          <p>
            Seko's code, design, and branding are owned by the project contributors. Product images
            and descriptions remain the property of the respective sellers.
          </p>
        </section>

        <section>
          <h2>6. Disclaimer of warranties</h2>
          <p>
            The service is provided <strong>"as is"</strong> without warranty of any kind. We make
            no warranties, express or implied, regarding fitness for a particular purpose,
            merchantability, or uninterrupted availability.
          </p>
        </section>

        <section>
          <h2>7. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Seko and its contributors shall not be liable
            for any indirect, incidental, or consequential damages arising from your use of the
            service or from transactions conducted through it.
          </p>
        </section>

        <section>
          <h2>8. Changes to these terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued use after changes are
            posted constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2>9. Governing law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which the campus operates,
            without regard to conflict-of-law provisions.
          </p>
        </section>
      </div>
    </main>
  );
}
