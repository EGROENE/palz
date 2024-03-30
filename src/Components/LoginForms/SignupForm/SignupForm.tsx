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
    areNoErrors,
    showErrors,
    handleFormSubmission,
    handleFormRejection,
  } = useLoginContext();

  return (
    <>
      <form onSubmit={(e) => handleFormSubmission(true, e)} className="login-signup-form">
        <div>
          <label>
            <p>First Name:</p>
            <input
              onChange={(e) => handleNameInput(e.target.value, true)}
              value={firstName}
              type="text"
              placeholder="Enter your first name"
              inputMode="text"
              required
            />
            {firstNameError !== "" && showErrors && (
              <p className="input-error-message">{firstNameError}</p>
            )}
            {!firstName.replace(/\s/g, "").length && showErrors && (
              <p className="input-error-message">Please fill out this field</p>
            )}
          </label>
          <label>
            <p>Last Name:</p>
            <input
              onChange={(e) => handleNameInput(e.target.value, false)}
              value={lastName}
              type="text"
              placeholder="Enter your last name"
              inputMode="text"
              required
            />
            {lastNameError !== "" && showErrors && (
              <p className="input-error-message">{lastNameError}</p>
            )}
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
            required
          />
          {usernameError !== "" && showErrors && (
            <p className="input-error-message">{usernameError}</p>
          )}
        </label>
        <label>
          <p>E-Mail Address:</p>
          <input
            onChange={(e) => handleEmailAddressInput(e.target.value)}
            value={emailAddress}
            type="email"
            placeholder="Enter your e-mail address"
            inputMode="email"
            required
          />
          {emailError !== "" && showErrors && (
            <p className="input-error-message">{emailError}</p>
          )}
        </label>
        <label>
          <p>Choose a Password:</p>
          <input
            onChange={(e) => handlePasswordInput(e.target.value, true)}
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
        <label>
          <p>Confirm Password:</p>
          <input
            onChange={(e) => handleConfirmationPasswordInput(e.target.value)}
            value={confirmationPassword}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Confirm password"
            inputMode="text"
            required
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
          {confirmationPasswordError !== "" && (
            <p className="input-error-message">{confirmationPasswordError}</p>
          )}
        </label>
        <button
          type={areNoErrors ? "submit" : "button"}
          onClick={(e) => (areNoErrors ? undefined : handleFormRejection(e))}
        >
          Sign Up
        </button>
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
