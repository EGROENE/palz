import { useMainContext } from "../../Hooks/useMainContext";
import { useLoginContext } from "../../Hooks/useLoginContext";
import SignupForm from "../LoginForms/SignupForm/SignupForm";
import LoginForm from "../LoginForms/LoginForm/LoginForm";

const LoginPage = () => {
  const { theme, toggleTheme } = useMainContext();
  const { signupIsSelected } = useLoginContext();

  return (
    <div className="login-page-container">
      <div className="login-greeting-container">
        <h1>Welcome to Palz!</h1>
        <h2>Do fun things, meet fun friends</h2>
        <button
          style={
            theme !== "dark"
              ? { backgroundColor: "black", color: "white" }
              : { backgroundColor: "white", color: "black" }
          }
          onClick={() => toggleTheme()}
        >
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </button>
      </div>
      {signupIsSelected ? <SignupForm /> : <LoginForm />}
    </div>
  );
};
export default LoginPage;
