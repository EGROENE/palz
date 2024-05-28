import React from "react";
import { baseURL } from "../../constants";

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
        <div className="error-boundary-container">
          <h1>Something went wrong</h1>
          <p>
            Please reload this page or navigate back to the homepage if the issue
            persists.
          </p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
          <button style={{ backgroundColor: "var(--theme-orange)" }}>
            <a href={`${baseURL}`}>Back to Homepage</a>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
