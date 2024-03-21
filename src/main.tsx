import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MainContextProvider } from "./Contexts/mainContext.tsx";
import { LoginContextProvider } from "./Contexts/loginContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MainContextProvider>
      <LoginContextProvider>
        <App />
      </LoginContextProvider>
    </MainContextProvider>
  </React.StrictMode>
);
