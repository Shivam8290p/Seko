import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Still logs to the console so the full stack is available there.
    console.error("Seko crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{ color: "#b91c1c" }}>Something broke</h1>
          <p>The app hit an error instead of showing a blank page. Copy the message below to fix it:</p>
          <pre style={{
            background: "#1f2937", color: "#f87171", padding: "1rem",
            borderRadius: 8, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word"
          }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Go back to homepage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
