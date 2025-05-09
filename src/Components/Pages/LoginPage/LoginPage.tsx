import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import SignupForm from "../../Forms/LoginForms/SignupForm/SignupForm";
import LoginForm from "../../Forms/LoginForms/LoginForm/LoginForm";
import { useEffect, useState } from "react";
import { TThemeColor } from "../../../types";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";

const LoginPage = () => {
  const { theme, toggleTheme } = useMainContext();
  const {
    signupIsSelected,
    toggleSignupLogin,
    resetLoginOrSignupFormFieldsAndErrors,
    fetchAllUsersQuery,
  } = useUserContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

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
      </div>
      <QueryLoadingOrError query={fetchAllUsersQuery} errorMessage="Error loading data" />
      {!fetchAllUsersQuery.isLoading && !fetchAllUsersQuery.isError && (
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
      )}
    </div>
  );
};
export default LoginPage;
