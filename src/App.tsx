import "./App.css";
import LoginPage from "./Components/LoginPage/LoginPage";
import Homepage from "./Components/Homepage/Homepage";
import { useMainContext } from "./Hooks/useMainContext";

function App() {
  const { userCreatedAccount } = useMainContext();
  return (
    <>
      {userCreatedAccount === null && <LoginPage />}
      {(userCreatedAccount !== null || userCreatedAccount === true) && <Homepage />}
    </>
  );
}

export default App;
