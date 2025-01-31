const QueryError = () => {
  return (
    <div className="query-error-container">
      <header className="query-error-text">Error loading data</header>
      <div className="theme-element-container">
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );
};

export default QueryError;
