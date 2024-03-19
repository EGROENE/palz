import { useState } from "react";
import SignupForm from "../LoginForms/SignupForm/SignupForm";
import LoginForm from "../LoginForms/LoginForm/LoginForm";

const LoginPage = () => {
  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(true);
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  const toggleSignupLogin = () => setSignupIsSelected(!signupIsSelected);
  const toggleHidePassword = () => setPasswordIsHidden(!passwordIsHidden);

  // set colors of h1, h2, L/S options randomly
  const themeColors = [
    "var(--theme-blue)",
    "var(--theme-red)",
    "var(--theme-green)",
    "var(--theme-yellow)",
  ];
  const h1Color = themeColors[Math.floor(Math.random() * themeColors.length)];

  const themeColorsWithoutH1Color = themeColors.filter((color) => color !== h1Color);
  const h2Color =
    themeColorsWithoutH1Color[
      Math.floor(Math.random() * themeColorsWithoutH1Color.length)
    ];

  const themeColorsWithoutH1ColorAndH2Color = themeColorsWithoutH1Color.filter(
    (color) => color !== h2Color
  );
  const selectFormOptionsColor =
    themeColorsWithoutH1ColorAndH2Color[
      Math.floor(Math.random() * themeColorsWithoutH1ColorAndH2Color.length)
    ];

  const linkToOtherFormColor = themeColorsWithoutH1ColorAndH2Color.filter(
    (color) => color !== selectFormOptionsColor
  )[0];

  return (
    <>
      <h1 style={{ color: h1Color }}>Welcome to Palz!</h1>
      <h2 style={{ color: h2Color }}>Do fun things, meet real friends</h2>
      <div className="login-options-container">
        <header
          style={{
            borderBottom: signupIsSelected
              ? `1px solid ${selectFormOptionsColor}`
              : "none",
            color: selectFormOptionsColor,
          }}
          onClick={() => toggleSignupLogin()}
        >
          Sign Up
        </header>
        <header
          style={{
            borderBottom: !signupIsSelected
              ? `1px solid ${selectFormOptionsColor}`
              : "none",
            color: selectFormOptionsColor,
          }}
          onClick={() => toggleSignupLogin()}
        >
          Log In
        </header>
      </div>
      {signupIsSelected ? (
        <SignupForm
          passwordIsHidden={passwordIsHidden}
          toggleHidePassword={toggleHidePassword}
          toggleSignupLogin={toggleSignupLogin}
          linkToOtherFormColor={linkToOtherFormColor}
        />
      ) : (
        <LoginForm
          passwordIsHidden={passwordIsHidden}
          toggleHidePassword={toggleHidePassword}
          toggleSignupLogin={toggleSignupLogin}
          linkToOtherFormColor={linkToOtherFormColor}
        />
      )}
    </>
  );
};
export default LoginPage;
