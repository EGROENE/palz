import "./App.css";
import LoginPage from "./Components/LoginPage/LoginPage";
import Welcome from "./Components/Welcome/Welcome";
import Homepage from "./Components/Homepage/Homepage";
import { useMainContext } from "./Hooks/useMainContext";

function App() {
  const { userCreatedAccount, theme, showWelcomeMessage } = useMainContext();

  theme === "dark"
    ? (document.body.style.backgroundColor = "#242424")
    : (document.body.style.backgroundColor = "rgb(233, 231, 228)");

  return (
    <div className="app" data-theme={theme}>
      {userCreatedAccount === null && <LoginPage />}
      {userCreatedAccount !== null && showWelcomeMessage && <Welcome />}
      {userCreatedAccount !== null && !showWelcomeMessage && <Homepage />}
    </div>
  );
}

export default App;
