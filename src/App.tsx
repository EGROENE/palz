import "./App.css";
import { useEffect } from "react";
import LoginPage from "./Components/LoginPage/LoginPage";
import Welcome from "./Components/Welcome/Welcome";
import Sidebar from "./Components/Sidebar/Sidebar";
import UserHomepage from "./Components/UserHomepage/UserHomepage";
import { useMainContext } from "./Hooks/useMainContext";
import { useUserContext } from "./Hooks/useUserContext";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Error404 from "./Components/Error404/Error404";
import UserSettings from "./Components/UserSettings/UserSettings";

function App() {
  const { userCreatedAccount, theme, showWelcomeMessage, currentUser } = useMainContext();
  const { showSidebar } = useUserContext();

  const navigation = useNavigate();
  const currentURL = useLocation().pathname;

  theme === "dark"
    ? (document.body.style.backgroundColor = "#242424")
    : (document.body.style.backgroundColor = "rgb(233, 231, 228)");

  /* Redirect to user homepage if user has logged in or created account, welcome message not shown (user not able to nav back to login once logged in) */
  /* userCreatedAccount is checked for non-null values, since currentUser may be set before submission of login form, causing user's homepage to display before they actually log in */
  useEffect(() => {
    if (
      userCreatedAccount !== null &&
      !showWelcomeMessage &&
      currentURL === `/users/${currentUser?.username}`
    ) {
      navigation(`users/${currentUser?.username}`);
    }
  }, [
    navigation,
    showWelcomeMessage,
    userCreatedAccount,
    currentUser?.username,
    currentURL,
  ]);

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
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={baseURLElement} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/users/:username" element={<UserHomepage />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
