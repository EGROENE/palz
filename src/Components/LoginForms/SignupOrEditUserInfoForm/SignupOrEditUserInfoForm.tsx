import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";

// should have isOnSignup param
const SignupOrEditUserInfoForm = ({ isOnSignup }: { isOnSignup: boolean }) => {
  const { currentUser, welcomeMessageDisplayTime } = useMainContext();
  const {
    passwordIsHidden,
    toggleHidePassword,
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
    areNoSignupErrors,
    allSignupInputsFilled,
    showErrors,
    handleSignupOrLoginFormSubmission,
    handleFormRejection,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
  } = useLoginContext();

  const navigation = useNavigate();

  const handleSignupFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    handleSignupOrLoginFormSubmission(true, e);
    setTimeout(
      () => navigation(`users/${currentUser?.username}`),
      welcomeMessageDisplayTime
    );
  };

  // this should contain PATCH request to update user data obj with current / any changed infos on it
  const handleUpdateProfileInfo = () => {};

  const getFirstNameFieldClass = (): "erroneous-field" | undefined => {
    if (isOnSignup) {
      return firstNameError !== "" && showErrors ? "erroneous-field" : undefined;
    }
    return firstNameError !== "" ? "erroneous-field" : undefined;
  };
  const firstNameFieldClass = getFirstNameFieldClass();

  const getShowFirstNameError = (): boolean => {
    if (isOnSignup) {
      return firstNameError !== "" && showErrors;
    }
    return firstNameError !== "";
  };
  const showFirstNameError = getShowFirstNameError();

  const getLastNameFieldClass = (): "erroneous-field" | undefined => {
    if (isOnSignup) {
      return lastNameError !== "" && showErrors ? "erroneous-field" : undefined;
    }
    return lastNameError !== "" ? "erroneous-field" : undefined;
  };
  const lastNameFieldClass = getLastNameFieldClass();

  const getShowLastNameError = (): boolean => {
    if (isOnSignup) {
      return lastNameError !== "" && showErrors;
    }
    return lastNameError !== "";
  };
  const showLastNameError = getShowLastNameError();

  const getUsernameFieldClass = (): "erroneous-field" | undefined => {
    if (isOnSignup) {
      return usernameError !== "" && showErrors ? "erroneous-field" : undefined;
    }
    return usernameError !== "" ? "erroneous-field" : undefined;
  };
  const usernameFieldClass = getUsernameFieldClass();

  const getShowUsernameError = (): boolean => {
    if (isOnSignup) {
      return usernameError !== "" && showErrors;
    }
    return usernameError !== "";
  };
  const showUsernameError = getShowUsernameError();

  const getEmailFieldClass = (): "erroneous-field" | undefined => {
    if (isOnSignup) {
      return emailError !== "" && showErrors ? "erroneous-field" : undefined;
    }
    return emailError !== "" ? "erroneous-field" : undefined;
  };
  const emailFieldClass = getEmailFieldClass();

  const getShowEmailError = (): boolean => {
    if (isOnSignup) {
      return emailError !== "" && showErrors;
    }
    return emailError !== "";
  };
  const showEmailError = getShowEmailError();

  const getPasswordFieldClass = (): "erroneous-field" | undefined => {
    if (isOnSignup) {
      return passwordError !== "" && showErrors ? "erroneous-field" : undefined;
    }
    return passwordError !== "" ? "erroneous-field" : undefined;
  };
  const passwordFieldClass = getPasswordFieldClass();

  const getShowPasswordError = (): boolean => {
    if (isOnSignup) {
      return passwordError !== "" && showErrors;
    }
    return passwordError !== "";
  };
  const showPasswordError = getShowPasswordError();

  const getConfirmPasswordFieldClass = (): "erroneous-field" | undefined => {
    if (isOnSignup) {
      return confirmationPasswordError !== "" && showErrors
        ? "erroneous-field"
        : undefined;
    }
    return confirmationPasswordError !== "" ? "erroneous-field" : undefined;
  };
  const confirmPasswordFieldClass = getConfirmPasswordFieldClass();

  return (
    <form
      onSubmit={(e) => {
        isOnSignup ? handleSignupFormSubmission(e) : handleUpdateProfileInfo();
      }}
      className="login-signup-form"
    >
      <div>
        <label>
          <p>First Name:</p>
          <input
            onChange={(e) => handleNameInput(e.target.value, true)}
            value={firstName}
            type="text"
            placeholder="Enter your first name"
            inputMode="text"
            className={firstNameFieldClass}
          />
          {showFirstNameError && <p className="input-error-message">{firstNameError}</p>}
        </label>
        <label>
          <p>Last Name:</p>
          <input
            onChange={(e) => handleNameInput(e.target.value, false)}
            value={lastName}
            type="text"
            placeholder="Enter your last name"
            inputMode="text"
            className={lastNameFieldClass}
          />
          {showLastNameError && <p className="input-error-message">{lastNameError}</p>}
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
          title="Must be 4-20 characters long & contain only alphanumeric characters"
          onChange={(e) => handleUsernameInput(e.target.value)}
          value={username}
          type="text"
          placeholder="Enter a username"
          inputMode="text"
          className={usernameFieldClass}
        />
        {showUsernameError && <p className="input-error-message">{usernameError}</p>}
      </label>
      <label>
        <p>E-Mail Address:</p>
        <input
          onChange={(e) => handleEmailAddressInput(e.target.value)}
          value={emailAddress}
          type="email"
          placeholder="Enter your e-mail address"
          inputMode="email"
          className={emailFieldClass}
        />
        {showEmailError && <p className="input-error-message">{emailError}</p>}
      </label>
      <label>
        <p>
          Choose a Password:{" "}
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
            onChange={(e) => handlePasswordInput(e.target.value, true)}
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Enter password"
            inputMode="text"
            className={passwordFieldClass}
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
        </div>
        {showPasswordError && <p className="input-error-message">{passwordError}</p>}
      </label>
      <label>
        <p>Confirm Password:</p>
        <div className="password-input">
          <input
            onChange={(e) => handleConfirmationPasswordInput(e.target.value)}
            value={confirmationPassword}
            type={passwordIsHidden ? "password" : "text"}
            placeholder="Confirm password"
            inputMode="text"
            className={confirmPasswordFieldClass}
          />
          {!passwordIsHidden ? (
            <OpenEye toggleHidePassword={toggleHidePassword} />
          ) : (
            <ClosedEye toggleHidePassword={toggleHidePassword} />
          )}
        </div>
        {confirmationPasswordError !== "" &&
          confirmationPasswordError !== "Please fill out this field" && (
            <p className="input-error-message">{confirmationPasswordError}</p>
          )}
        {confirmationPasswordError === "Please fill out this field" && showErrors && (
          <p className="input-error-message">{confirmationPasswordError}</p>
        )}
      </label>
      <button
        className="login-button"
        type={areNoSignupErrors ? "submit" : "button"}
        onClick={(e) =>
          areNoSignupErrors && allSignupInputsFilled ? undefined : handleFormRejection(e)
        }
      >
        Sign Up
      </button>
    </form>
  );
};
export default SignupOrEditUserInfoForm;
