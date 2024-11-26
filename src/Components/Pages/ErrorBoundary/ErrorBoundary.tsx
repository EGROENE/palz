import React from "react";
import { baseURL } from "../../../constants";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ "width": " 100vw", "margin": "0" }} className="page-hero">
          <div className="standalone-element">
            <div
              className="error-boundary-container"
              style={{ background: "rgba(0, 0, 0, 0.6)", padding: "1.5rem" }}
            >
              <h1>Something went wrong</h1>
              <p>
                Please reload this page or navigate back to the homepage if the issue
                persists.
              </p>
              <div className="button-container">
                <button onClick={() => window.location.reload()}>Reload Page</button>
              </div>
              <div className="button-container">
                <button style={{ backgroundColor: "var(--theme-orange)" }}>
                  <a href={`${baseURL}`}>Back to Homepage</a>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
