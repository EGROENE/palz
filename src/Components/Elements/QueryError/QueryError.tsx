const QueryError = () => {
  return (
    <div className="login-form-loading-error-container">
      <header className="login-form-loading-or-error-text">Error loading data</header>
      <div className="theme-element-container">
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );
};

export default QueryError;
