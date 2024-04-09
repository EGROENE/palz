import "./App.css";
import LoginPage from "./Components/LoginPage/LoginPage";
import Welcome from "./Components/Welcome/Welcome";
import UserHomepage from "./Components/UserHomepage/UserHomepage";
import { useMainContext } from "./Hooks/useMainContext";
import { Route, Routes } from "react-router-dom";
import Error404 from "./Components/Error404/Error404";

function App() {
  const { userCreatedAccount, theme, showWelcomeMessage } = useMainContext();

  theme === "dark"
    ? (document.body.style.backgroundColor = "#242424")
    : (document.body.style.backgroundColor = "rgb(233, 231, 228)");

  return (
    <div className="app" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            userCreatedAccount !== null && showWelcomeMessage ? (
              <Welcome />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/users/:username" element={<UserHomepage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
