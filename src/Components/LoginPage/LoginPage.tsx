import { useMainContext } from "../../Hooks/useMainContext";
import { useLoginContext } from "../../Hooks/useLoginContext";
import { useNavigate } from "react-router-dom";
import SignupOrEditUserInfoForm from "../LoginForms/SignupOrEditUserInfoForm/SignupOrEditUserInfoForm";
import LoginForm from "../LoginForms/LoginForm/LoginForm";
import { useEffect } from "react";

const LoginPage = () => {
  const { theme, toggleTheme, currentUser } = useMainContext();
  const { signupIsSelected, toggleSignupLogin } = useLoginContext();
  const navigation = useNavigate();

  useEffect(() => {
    // Display login form by default
    if (signupIsSelected) {
      toggleSignupLogin();
    }
    // If user logs in, then pastes base URL in same tab, redirect to user homepage:
    if (currentUser) {
      navigation(`users/${currentUser?.username}`);
    }
  }, []);

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
      <div className="login-form">
        <div className="login-options-container">
          <div>
            <header onClick={!signupIsSelected ? () => toggleSignupLogin() : undefined}>
              Sign Up
            </header>
            {signupIsSelected && (
              <div className="form-type-underline animate__animated animate__slideInRight"></div>
            )}
          </div>
          <div>
            <header onClick={signupIsSelected ? () => toggleSignupLogin() : undefined}>
              Log In
            </header>
            {!signupIsSelected && (
              <div className="form-type-underline animate__animated animate__slideInLeft"></div>
            )}
          </div>
        </div>
        {signupIsSelected ? (
          <SignupOrEditUserInfoForm isOnSignup={true} />
        ) : (
          <LoginForm />
        )}
        <p>
          {!signupIsSelected ? "Don't have an account?" : "Already have an account?"}
          <span className="link-to-other-form" onClick={() => toggleSignupLogin()}>
            {!signupIsSelected ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
