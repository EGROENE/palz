import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";

const LoginForm = ({
  passwordIsHidden,
  toggleSignupLogin,
  toggleHidePassword,
  linkToOtherFormColor,
}: {
  passwordIsHidden: boolean;
  toggleSignupLogin: () => void;
  toggleHidePassword: () => void;
  linkToOtherFormColor: string;
}) => {
  return (
    <>
      <form className="login-signup-form">
        <label>
          <p>Username or E-Mail Address:</p>
          <input type="text" placeholder="Enter username or e-mail address" />
        </label>
        <label>
          <p>Password:</p>
          <input
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
        <span
          style={{ color: linkToOtherFormColor }}
          className="link-to-other-form"
          onClick={() => toggleSignupLogin()}
        >
          Sign Up
        </span>
      </p>
    </>
  );
};
export default LoginForm;
