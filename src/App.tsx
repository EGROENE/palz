import "./App.css";
import { useEffect } from "react";
import LoginPage from "./Components/LoginPage/LoginPage";
import Welcome from "./Components/Welcome/Welcome";
import UserHomepage from "./Components/UserHomepage/UserHomepage";
import { useMainContext } from "./Hooks/useMainContext";
import { Route, Routes, useNavigate } from "react-router-dom";
import Error404 from "./Components/Error404/Error404";

function App() {
  const { userCreatedAccount, theme, showWelcomeMessage, currentUser } = useMainContext();

  const navigation = useNavigate();

  theme === "dark"
    ? (document.body.style.backgroundColor = "#242424")
    : (document.body.style.backgroundColor = "rgb(233, 231, 228)");

  // Redirect to user homepage if currentUser exists, welcome message not shown (user not able to nav back to login once logged in)
  useEffect(() => {
    if (userCreatedAccount !== null && !showWelcomeMessage) {
      navigation(`users/${currentUser?.username}`);
    }
  }, [navigation, showWelcomeMessage, userCreatedAccount, currentUser?.username]);

  const getBaseURLElement = (): JSX.Element => {
    if (userCreatedAccount !== null && showWelcomeMessage) {
      return <Welcome />;
    } else if (userCreatedAccount !== null && !showWelcomeMessage) {
      return <UserHomepage />;
    }
    return <LoginPage />;
  };
  const baseURLElement = getBaseURLElement();

  return (
    <div className="app" data-theme={theme}>
      <Routes>
        <Route path="/" element={baseURLElement} />
        <Route path="/users/:username" element={<UserHomepage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
