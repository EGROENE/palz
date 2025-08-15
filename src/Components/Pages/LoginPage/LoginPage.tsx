import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import SignupForm from "../../Forms/LoginForms/SignupForm/SignupForm";
import LoginForm from "../../Forms/LoginForms/LoginForm/LoginForm";
import { useEffect, useState } from "react";
import { TThemeColor } from "../../../types";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ type }: { type: "login" | "signup" }) => {
  const { theme, toggleTheme } = useMainContext();
  const {
    signupIsSelected,
    toggleSignupLogin,
    resetLoginOrSignupFormFieldsAndErrors,
    processingLoginIsLoading,
  } = useUserContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const navigation = useNavigate();

  useEffect(() => {
    resetLoginOrSignupFormFieldsAndErrors();

    // Display login form by default
    if (signupIsSelected) {
      toggleSignupLogin();
    }

    // Set random color:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
    type === "login" ? navigation("/login") : navigation("/signup");
  }, []);

  return (
    <div className="login-page-container">
      <div className="login-greeting-container">
        <img src="/palz.PNG" />
        <h1>Welcome to Palz!</h1>
        <h2>Do fun things, meet fun friends</h2>
        <div className="theme-element-container">
          <button className="theme-toggle-button" onClick={() => toggleTheme()}>
            {theme === "light" ? (
              <span>
                Switch to dark mode <i className="theme-toggle-icon fas fa-moon"></i>
              </span>
            ) : (
              <span>
                Switch to light mode <i className="theme-toggle-icon fas fa-sun"></i>
              </span>
            )}
          </button>
        </div>
        <p style={{ width: "77%" }}>
          Due to a policy regarding the free tier of the web service this project is
          deployed to, requests may be delayed by 50 seconds or more due to inactivity. So
          far, I have seen this only affect login functionality.
        </p>
      </div>
      <div className="login-form">
        {!processingLoginIsLoading && (
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
        )}
        {signupIsSelected && <SignupForm randomColor={randomColor} />}
        {!signupIsSelected && !processingLoginIsLoading && (
          <LoginForm randomColor={randomColor} />
        )}
        {processingLoginIsLoading && !signupIsSelected && (
          <header
            style={{ marginTop: "3rem" }}
            className="query-status-text animate__animated animate__headShake animate__infinite	infinite animate__slower-10"
          >
            Processing your info...
          </header>
        )}
        {!processingLoginIsLoading && (
          <p>
            {!signupIsSelected ? "Don't have an account?" : "Already have an account?"}
            <span className="link-to-other-form" onClick={() => toggleSignupLogin()}>
              {!signupIsSelected ? " Sign Up" : " Log In"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
export default LoginPage;
