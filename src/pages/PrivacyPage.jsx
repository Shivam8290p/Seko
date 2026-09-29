import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <main className="page container legal-page">
      <Link to="/" className="back-link">← Back</Link>
      <h1 className="page-title">Privacy Policy</h1>
      <p className="page-subtitle">Last updated: September 2026</p>

      <div className="legal-body">
        <section>
          <h2>1. Who we are</h2>
          <p>
            Seko is a campus marketplace that lets students buy and sell second-hand goods.
            References to "we", "us", or "Seko" in this policy refer to the Seko service.
          </p>
        </section>

        <section>
          <h2>2. What data we collect</h2>
          <ul>
            <li><strong>Session data</strong> — your role (student or seller) and display name, stored only in your browser's localStorage. It is not transmitted to any third-party.</li>
            <li><strong>Cart data</strong> — product IDs and quantities, stored in your browser's localStorage and cleared when you place an order.</li>
            <li><strong>Product data</strong> — name, description, price, stock quantity, image URL, and seller information entered by sellers and stored in Google Firestore.</li>
          </ul>
        </section>

        <section>
          <h2>3. How we use your data</h2>
          <p>
            Product data is displayed publicly to logged-in students. Session and cart data are used
            solely to deliver the service to you and are never sold or shared with third parties.
          </p>
        </section>

        <section>
          <h2>4. Third-party services</h2>
          <p>
            Seko uses <strong>Google Firestore</strong> to store product listings. Your browser communicates
            directly with Google's servers when loading or saving products. Google's{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{" "}
            applies to that data.
          </p>
        </section>

        <section>
          <h2>5. Cookies &amp; storage</h2>
          <p>
            Seko uses <strong>localStorage</strong> only for strictly necessary session and cart state.
            No advertising cookies or tracking pixels are set. If analytics are added in future, this policy will be updated and a consent banner displayed.
          </p>
        </section>

        <section>
          <h2>6. Data retention</h2>
          <p>
            Session and cart data are cleared when you log out or clear your browser storage.
            Product data in Firestore is retained until the seller deletes it.
          </p>
        </section>

        <section>
          <h2>7. Your rights</h2>
          <p>
            You may request deletion of any product data you have created by deleting it from the
            Seller Dashboard, or by contacting us. If you have questions about this policy, reach out
            via the contact information listed on campus.
          </p>
        </section>

        <section>
          <h2>8. Changes to this policy</h2>
          <p>
            We may update this policy. Continued use of Seko after changes are posted constitutes
            acceptance of the revised policy.
          </p>
        </section>
      </div>
    </main>
  );
}
