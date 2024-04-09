import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useLoginContext } from "../../../Hooks/useLoginContext";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const { currentUser, welcomeMessageDisplayTime } = useMainContext();

  const {
    passwordIsHidden,
    toggleHidePassword,
    toggleSignupLogin,
    signupIsSelected,
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
    handleFormSubmission,
    handleFormRejection,
  } = useLoginContext();

  const navigation = useNavigate();

  return (
    <div className="form">
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
      <form
        onSubmit={(e) => {
          handleFormSubmission(false, e);
          setTimeout(
            () => navigation(`users/${currentUser?.username}`),
            welcomeMessageDisplayTime
          );
        }}
        className="login-signup-form"
      >
        <label>
          <p>Username or E-Mail Address:</p>
          <input
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
          <p>Password:</p>
          <div className="password-input">
            <input
              onChange={(e) => handlePasswordInput(e.target.value, false)}
              value={password}
              type={passwordIsHidden ? "password" : "text"}
              placeholder="Enter password"
              inputMode="text"
              className={
                passwordError !== "" && showErrors ? "erroneous-field" : undefined
              }
            />
            {!passwordIsHidden ? (
              <OpenEye toggleHidePassword={toggleHidePassword} />
            ) : (
              <ClosedEye toggleHidePassword={toggleHidePassword} />
            )}
          </div>
          {passwordError !== "" && showErrors && (
            <p className="input-error-message">{passwordError}</p>
          )}
        </label>
        <button
          className="login-button"
          type={areNoLoginErrors ? "submit" : "button"}
          onClick={(e) =>
            areNoLoginErrors && allLoginInputsFilled ? undefined : handleFormRejection(e)
          }
        >
          Log In
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <span className="link-to-other-form" onClick={() => toggleSignupLogin()}>
          Sign Up
        </span>
      </p>
    </div>
  );
};
export default LoginForm;
