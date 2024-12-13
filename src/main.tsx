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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
            </ErrorBoundary>
          </EventContextProvider>
        </UserContextProvider>
      </MainContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
