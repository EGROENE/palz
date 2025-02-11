import { UseQueryResult } from "@tanstack/react-query";

const QueryLoadingOrError = ({
  query,
  errorMessage,
}: {
  query: UseQueryResult<any[], Error>;
  errorMessage: string;
}) => {
  if (query.isLoading && !query.isError) {
    return (
      <header style={{ marginTop: "3rem" }} className="query-status-text">
        Loading...
      </header>
    );
  }

  if (query.isError && !query.isLoading) {
    return (
      <div className="query-error-container">
        <header className="query-status-text">{errorMessage}</header>
        <div className="theme-element-container">
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
};
export default QueryLoadingOrError;
