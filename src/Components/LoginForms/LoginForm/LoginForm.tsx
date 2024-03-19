import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";

const LoginForm = () => {
  const {
    passwordIsHidden,
    toggleHidePassword,
    toggleSignupLogin,
    username,
    setUsername,
    setEmailAddress,
    password,
    setPassword,
  } = useLoginContext();

  // const areNoErrors = <are all errors from context equal to ""

  return (
    <>
      <form className="login-signup-form">
        <label>
          <p>Username or E-Mail Address:</p>
          <input
            onChange={(e) => {
              setEmailAddress(e.target.value);
              setUsername(e.target.value);
            }}
            value={username}
            type="text"
            placeholder="Enter username or e-mail address"
          />
        </label>
        <label>
          <p>Password:</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
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
