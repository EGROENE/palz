import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";

const LoginForm = () => {
  const {
    passwordIsHidden,
    toggleHidePassword,
    toggleSignupLogin,
    username,
    usernameError,
    emailAddress,
    emailError,
    password,
    passwordError,
    handlePasswordInput,
    handleUsernameOrEmailInput,
    loginMethod,
    areNoErrors,
    showErrors,
    handleFormSubmission,
    handleFormRejection,
  } = useLoginContext();

  return (
    <>
      <form
        onSubmit={(e) => handleFormSubmission(false, e)}
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
            required
          />
          {usernameError && showErrors && (
            <p className="input-error-message">{usernameError}</p>
          )}
          {emailError && usernameError === "" && showErrors && (
            <p className="input-error-message">{emailError}</p>
          )}
        </label>
        <label>
          <p>Password:</p>
          <input
            onChange={(e) => handlePasswordInput(e.target.value, false)}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
            inputMode="text"
            required
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
          {passwordError !== "" && showErrors && (
            <p className="input-error-message">{passwordError}</p>
          )}
        </label>
        <button
          type={areNoErrors ? "submit" : "button"}
          onClick={(e) => (areNoErrors ? undefined : handleFormRejection(e))}
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
    </>
  );
};
export default LoginForm;
