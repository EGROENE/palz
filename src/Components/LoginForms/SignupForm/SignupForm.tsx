import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEffect } from "react";

// should have isOnSignup param
const SignupForm = () => {
  const { currentUser, welcomeMessageDisplayTime } = useMainContext();
  const {
    areNoSignupFormErrors,
    passwordIsHidden,
    toggleHidePassword,
    firstName,
    firstNameError,
    setFirstNameError,
    handleNameInput,
    lastName,
    lastNameError,
    setLastNameError,
    username,
    usernameError,
    setUsernameError,
    emailAddress,
    emailError,
    setEmailError,
    password,
    passwordError,
    setPasswordError,
    confirmationPassword,
    setConfirmationPasswordError,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    confirmationPasswordError,
    handleConfirmationPasswordInput,
    allSignupFormFieldsFilled,
    showErrors,
    handleSignupOrLoginFormSubmission,
    handleFormRejection,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
  } = useUserContext();

  // Ensure all errors are set by default to "Please fill out this field"
  useEffect(() => {
    setFirstNameError("Please fill out this field");
    setLastNameError("Please fill out this field");
    setEmailError("Please fill out this field");
    setUsernameError("Please fill out this field");
    setPasswordError("Please fill out this field");
    setConfirmationPasswordError("Please fill out this field");
  }, []);

  // After a couple seconds after signup, change url to /users/*username*:
  const navigation = useNavigate();
  const handleSignupFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    handleSignupOrLoginFormSubmission(true, e);
    setTimeout(
      () => navigation(`users/${currentUser?.username}`),
      welcomeMessageDisplayTime
    );
  };

  return (
    <form onSubmit={(e) => handleSignupFormSubmission(e)} className="login-signup-form">
      <div>
        <label>
          <p>First Name:</p>
          <input
            autoComplete="given-name"
            onChange={(e) => handleNameInput(e.target.value, true, "signup")}
            value={firstName}
            type="text"
            placeholder="Enter your first name"
            inputMode="text"
            className={
              firstNameError !== "" && showErrors ? "erroneous-field" : undefined
            }
          />
          {firstNameError !== "" && showErrors && (
            <p className="input-error-message">{firstNameError}</p>
          )}
        </label>
        <label>
          <p>Last Name:</p>
          <input
            autoComplete="family-name"
            onChange={(e) => handleNameInput(e.target.value, false, "signup")}
            type="text"
            value={lastName}
            placeholder="Enter your last name"
            inputMode="text"
            className={lastNameError !== "" && showErrors ? "erroneous-field" : undefined}
          />
          {lastNameError !== "" && showErrors && (
            <p className="input-error-message">{lastNameError}</p>
          )}
        </label>
      </div>
      <label>
        <p>
          Username:{" "}
          <span>
            <i
              onClick={() => setShowUsernameCriteria(!showUsernameCriteria)}
              className="fas fa-info-circle"
              title="Must be 4-20 characters long & contain only alphanumeric characters"
            ></i>
          </span>
        </p>
        {showUsernameCriteria && (
          <p className="input-criteria">
            Must be 4-20 characters long & contain only alphanumeric characters
          </p>
        )}
        <input
          autoComplete="username"
          title="Must be 4-20 characters long & contain only alphanumeric characters"
          onChange={(e) => handleUsernameInput(e.target.value, "signup")}
          value={username}
          type="text"
          placeholder="Enter a username"
          inputMode="text"
          className={usernameError !== "" && showErrors ? "erroneous-field" : undefined}
        />
        {usernameError !== "" && showErrors && (
          <p className="input-error-message">{usernameError}</p>
        )}
      </label>
      <label>
        <p>E-Mail Address:</p>
        <input
          autoComplete="email"
          onChange={(e) => handleEmailAddressInput(e.target.value, "signup")}
          value={emailAddress}
          type="email"
          placeholder="Enter your e-mail address"
          inputMode="email"
          className={emailError !== "" && showErrors ? "erroneous-field" : undefined}
        />
        {emailError !== "" && showErrors && (
          <p className="input-error-message">{emailError}</p>
        )}
      </label>
      <label>
        <p>
          Choose a Password:
          <span>
            <i
              onClick={() => setShowPasswordCriteria(!showPasswordCriteria)}
              className="fas fa-info-circle"
              title="Must contain at least one uppercase & one lowercase English letter, at least one digit, at least one special character, & be 8-50 characters long. No spaces allowed."
            ></i>
          </span>
        </p>
        {showPasswordCriteria && (
          <p className="input-criteria">
            Must contain at least one uppercase & one lowercase English letter, at least
            one digit, at least one special character, & be 8-20 characters long. No
            spaces allowed.
          </p>
        )}

        <div className="password-input">
          <input
            autoComplete="off"
            onChange={(e) => handlePasswordInput(e.target.value, "signup")}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter a password"
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
      {/* Render 'confirm pw' field only if form is on signup or if it's form to edit user info, & pw has been changed */}
      <label>
        <p>Confirm Password: </p>
        <div className="password-input">
          <input
            autoComplete="off"
            onChange={(e) => handleConfirmationPasswordInput(e.target.value, "signup")}
            value={confirmationPassword}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Confirm password"
            inputMode="text"
            className={
              confirmationPasswordError !== "" && showErrors
                ? "erroneous-field"
                : undefined
            }
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
        </div>
        {confirmationPasswordError !== "" && password !== "" && (
          <p className="input-error-message">{confirmationPasswordError}</p>
        )}
      </label>
      <button
        className="login-button"
        type={areNoSignupFormErrors ? "submit" : "button"}
        onClick={(e) =>
          areNoSignupFormErrors && allSignupFormFieldsFilled
            ? undefined
            : handleFormRejection(e)
        }
      >
        Sign Up
      </button>
    </form>
  );
};
export default SignupForm;
