import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";

const SignupForm = ({
  passwordIsHidden,
  toggleSignupLogin,
  toggleHidePassword,
}: {
  passwordIsHidden: boolean;
  toggleSignupLogin: () => void;
  toggleHidePassword: () => void;
}) => {
  return (
    <>
      <form>
        <div>
          <label>
            <p>First Name:</p>
            <input type="text" placeholder="Enter your first name" />
          </label>
          <label>
            <p>Last Name:</p>
            <input type="text" placeholder="Enter your last name" />
          </label>
        </div>
        <label>
          <p>Choose a Username:</p>
          <input type="text" placeholder="Enter a username" />
        </label>
        <label>
          <p>Enter an E-Mail Address:</p>
          <input type="email" placeholder="Enter your e-mail address" />
        </label>
        <label>
          <p>Choose a Password:</p>
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
        <label>
          <p>Confirm Password:</p>
          <input
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Confirm password"
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
        </label>
      </form>
      <p>
        Already have an account? <span onClick={() => toggleSignupLogin()}>Log In</span>
      </p>
    </>
  );
};
export default SignupForm;
