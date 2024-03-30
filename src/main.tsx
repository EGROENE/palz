import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { MainContextProvider } from "./Contexts/mainContext.tsx";
import { LoginContextProvider } from "./Contexts/loginContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster />
    <MainContextProvider>
      <LoginContextProvider>
        <App />
      </LoginContextProvider>
    </MainContextProvider>
  </React.StrictMode>
);
