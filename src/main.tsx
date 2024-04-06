import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./responsive.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { MainContextProvider } from "./Contexts/mainContext.tsx";
import { LoginContextProvider } from "./Contexts/loginContext.tsx";
import Homepage from "./Components/Homepage/Homepage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "users/:username",
    element: <Homepage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster />
    <MainContextProvider>
      <LoginContextProvider>
        <RouterProvider router={router} />
      </LoginContextProvider>
    </MainContextProvider>
  </React.StrictMode>
);
