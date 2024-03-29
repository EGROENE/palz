import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";

const SignupForm = () => {
  const {
    passwordIsHidden,
    toggleHidePassword,
    toggleSignupLogin,
    firstName,
    firstNameError,
    handleNameInput,
    lastName,
    lastNameError,
    username,
    usernameError,
    emailAddress,
    emailError,
    password,
    passwordError,
    confirmationPassword,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    confirmationPasswordError,
    handleConfirmationPasswordInput,
  } = useLoginContext();

  // const areNoErrors = <are all errors from context equal to ""

  return (
    <>
      <form className="login-signup-form">
        <div>
          <label>
            <p>First Name:</p>
            <input
              onChange={(e) => handleNameInput(e.target.value, true)}
              value={firstName}
              type="text"
              placeholder="Enter your first name"
              inputMode="text"
            />
            {firstNameError !== "" && <p>{firstNameError}</p>}
          </label>
          <label>
            <p>Last Name:</p>
            <input
              onChange={(e) => handleNameInput(e.target.value, false)}
              value={lastName}
              type="text"
              placeholder="Enter your last name"
              inputMode="text"
            />
            {lastNameError !== "" && <p>{lastNameError}</p>}
          </label>
        </div>
        <label>
          <p>Username:</p>
          <input
            onChange={(e) => handleUsernameInput(e.target.value)}
            value={username}
            type="text"
            placeholder="Enter a username"
            inputMode="text"
          />
          {usernameError !== "" && <p>{usernameError}</p>}
        </label>
        <label>
          <p>E-Mail Address:</p>
          <input
            onChange={(e) => handleEmailAddressInput(e.target.value)}
            value={emailAddress}
            type="email"
            placeholder="Enter your e-mail address"
            inputMode="email"
          />
          {emailError !== "" && <p>{emailError}</p>}
        </label>
        <label>
          <p>Choose a Password:</p>
          <input
            onChange={(e) => handlePasswordInput(e.target.value, true)}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
            inputMode="text"
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
          {passwordError !== "" && <p>{passwordError}</p>}
        </label>
        <label>
          <p>Confirm Password:</p>
          <input
            onChange={(e) => handleConfirmationPasswordInput(e.target.value)}
            value={confirmationPassword}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Confirm password"
            inputMode="text"
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
          {confirmationPasswordError !== "" && <p>{confirmationPasswordError}</p>}
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
