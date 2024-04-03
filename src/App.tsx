import "./App.css";
import LoginPage from "./Components/LoginPage/LoginPage";
import Homepage from "./Components/Homepage/Homepage";
import { useMainContext } from "./Hooks/useMainContext";

function App() {
  const { userCreatedAccount, theme } = useMainContext();

  theme === "dark"
    ? (document.body.style.backgroundColor = "#242424")
    : (document.body.style.backgroundColor = "rgb(233, 231, 228)");

  return (
    <div className="app" data-theme={theme}>
      {userCreatedAccount === null && <LoginPage />}
      {(userCreatedAccount !== null || userCreatedAccount === true) && <Homepage />}
    </div>
  );
}

export default App;
