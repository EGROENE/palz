import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";

const SignupForm = () => {
  const {
    passwordIsHidden,
    toggleHidePassword,
    toggleSignupLogin,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    username,
    setUsername,
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    confirmationPassword,
    setConfirmationPassword,
  } = useLoginContext();

  // const areNoErrors = <are all errors from context equal to ""

  return (
    <>
      <form className="login-signup-form">
        <div>
          <label>
            <p>First Name:</p>
            <input
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              type="text"
              placeholder="Enter your first name"
            />
          </label>
          <label>
            <p>Last Name:</p>
            <input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              type="text"
              placeholder="Enter your last name"
            />
          </label>
        </div>
        <label>
          <p>Username:</p>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            type="text"
            placeholder="Enter a username"
          />
        </label>
        <label>
          <p>E-Mail Address:</p>
          <input
            onChange={(e) => setEmailAddress(e.target.value)}
            value={emailAddress}
            type="email"
            placeholder="Enter your e-mail address"
          />
        </label>
        <label>
          <p>Choose a Password:</p>
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
        <label>
          <p>Confirm Password:</p>
          <input
            onChange={(e) => setConfirmationPassword(e.target.value)}
            value={confirmationPassword}
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
        Already have an account?{" "}
        <span className="link-to-other-form" onClick={() => toggleSignupLogin()}>
          Log In
        </span>
      </p>
    </>
  );
};
export default SignupForm;
