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
  } = useLoginContext();

  // const areNoErrors = <are all errors from context equal to ""

  return (
    <>
      <form className="login-signup-form">
        <label>
          <p>Username or E-Mail Address:</p>
          <input
            onChange={(e) => handleUsernameOrEmailInput(e.target.value)}
            value={loginMethod === "username" ? username : emailAddress}
            type="text"
            placeholder="Enter username or e-mail address"
          />
          {usernameError && <p>{usernameError}</p>}
          {emailError && usernameError === "" && <p>{emailError}</p>}
        </label>
        <label>
          <p>Password:</p>
          <input
            onChange={(e) => handlePasswordInput(e.target.value, false)}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
          {passwordError !== "" && <p>{passwordError}</p>}
        </label>
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
