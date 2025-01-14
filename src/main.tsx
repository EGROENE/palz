import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./responsive.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MainContextProvider } from "./Contexts/mainContext.tsx";
import { UserContextProvider } from "./Contexts/userContext.tsx";
import { EventContextProvider } from "./Contexts/eventContext.tsx";
import ErrorBoundary from "./Components/Pages/ErrorBoundary/ErrorBoundary.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "react-query-devtools";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <MainContextProvider>
          <Toaster
            toastOptions={{
              style: {
                fontFamily: "var(--text-font)",
              },
            }}
          />
          <UserContextProvider>
            <EventContextProvider>
              <ErrorBoundary>
                <App />
                <ReactQueryDevtools />
              </ErrorBoundary>
            </EventContextProvider>
          </UserContextProvider>
        </MainContextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
