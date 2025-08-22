import OpenEye from "../../../Elements/Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../../Elements/Eyecons/ClosedEye/ClosedEye";
import { useMainContext } from "../../../../Hooks/useMainContext";
import { useUserContext } from "../../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { TThemeColor } from "../../../../types";

const LoginForm = ({ randomColor }: { randomColor: TThemeColor | undefined }) => {
  const { welcomeMessageDisplayTime } = useMainContext();
  //const { fetchAllUsers } = useUserContext();

  const {
    passwordIsHidden,
    toggleHidePassword,
    username,
    usernameError,
    emailAddress,
    emailError,
    password,
    passwordError,
    handlePasswordInput,
    handleUsernameOrEmailInput,
    loginMethod,
    areNoLoginErrors,
    allLoginInputsFilled,
    showErrors,
    handleSignupOrLoginFormSubmission,
    handleFormRejection,
  } = useUserContext();

  const navigation = useNavigate();

  const [focusedElement, setFocusedElement] = useState<
    "emailUsername" | "password" | undefined
  >();

  const emailUsernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    //fetchAllUsers(); // get most up-to-date allUsers

    // Handle inputs that are autocompleted on initial render:
    if (emailAddress && emailAddress !== "") {
      handleUsernameOrEmailInput(emailAddress);
    }
    if (username && username !== "") {
      handleUsernameOrEmailInput(username);
    }
    if (password && password !== "") {
      handlePasswordInput(password, "login");
    }
  }, []);

  return (
    <form
      onSubmit={() => {
        setTimeout(() => navigation(`${username}`), welcomeMessageDisplayTime);
      }}
      className="login-signup-form"
    >
      <label>
        <header className="input-label">Username or E-Mail Address:</header>
        <input
          name="username-or-email-login"
          id="username-or-email-login"
          onFocus={() => setFocusedElement("emailUsername")}
          onBlur={() => setFocusedElement(undefined)}
          ref={emailUsernameRef}
          style={
            focusedElement === "emailUsername"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
          autoComplete="on"
          onChange={(e) => handleUsernameOrEmailInput(e.target.value)}
          value={loginMethod === "username" ? username : emailAddress}
          type="text"
          placeholder="Enter username or e-mail address"
          inputMode="text"
          className={
            (usernameError !== "" || emailError !== "") && showErrors
              ? "erroneous-field"
              : undefined
          }
        />
        {usernameError !== "" && showErrors && (
          <p className="input-error-message">{usernameError}</p>
        )}
        {emailError !== "" && usernameError === "" && showErrors && (
          <p className="input-error-message">{emailError}</p>
        )}
      </label>
      <label>
        <header className="input-label">Password:</header>
        <div className="password-input">
          <input
            name="password-login"
            id="password-login"
            aria-label="password-login"
            ref={passwordRef}
            onFocus={() => setFocusedElement("password")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "password"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            autoComplete="current-password"
            onChange={(e) => handlePasswordInput(e.target.value, "login")}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
            inputMode="text"
            className={passwordError !== "" && showErrors ? "erroneous-field" : undefined}
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={() => toggleHidePassword("password")} />
          ) : (
            <ClosedEye toggleHidePassword={() => toggleHidePassword("password")} />
          )}
        </div>
        {passwordError !== "" && showErrors && (
          <p className="input-error-message">{passwordError}</p>
        )}
      </label>
      <div tabIndex={-1} className="theme-element-container">
        <button
          className="login-button"
          type={areNoLoginErrors ? "submit" : "button"}
          onClick={(e) =>
            areNoLoginErrors && allLoginInputsFilled
              ? handleSignupOrLoginFormSubmission(false, e)
              : handleFormRejection(e)
          }
        >
          Log In
        </button>
      </div>
    </form>
  );
};
export default LoginForm;
