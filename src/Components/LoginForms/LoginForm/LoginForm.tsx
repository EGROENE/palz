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
  } = useLoginContext();

  const navigation = useNavigate();

  return (
    <form
      onSubmit={() => {
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
        <p>Password:</p>
        <div className="password-input">
          <input
            autoComplete="current-password"
            onChange={(e) => handlePasswordInput(e.target.value, "login")}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
            inputMode="text"
            className={passwordError !== "" && showErrors ? "erroneous-field" : undefined}
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
          areNoLoginErrors && allLoginInputsFilled
            ? handleSignupOrLoginFormSubmission(false, e)
            : handleFormRejection(e)
        }
      >
        Log In
      </button>
    </form>
  );
};
export default LoginForm;
