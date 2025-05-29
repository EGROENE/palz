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
    fetchAllVisibleOtherUsersQuery,
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
        <img src="../src/assets/palz.png" />
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
      </div>
      {fetchAllVisibleOtherUsersQuery.isLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {fetchAllVisibleOtherUsersQuery.isError && (
        <div className="query-error-container">
          <header className="query-status-text">Error fetching data.</header>
          <div className="theme-element-container">
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
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
          <SignupForm randomColor={randomColor} />
        ) : (
          <LoginForm randomColor={randomColor} />
        )}
        <p>
          {!signupIsSelected ? "Don't have an account?" : "Already have an account?"}
          <span className="link-to-other-form" onClick={() => toggleSignupLogin()}>
            {!signupIsSelected ? " Sign Up" : " Log In"}
          </span>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
