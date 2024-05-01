import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./responsive.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MainContextProvider } from "./Contexts/mainContext.tsx";
import { UserContextProvider } from "./Contexts/userContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster />
    <MainContextProvider>
      <UserContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserContextProvider>
    </MainContextProvider>
  </React.StrictMode>
);
