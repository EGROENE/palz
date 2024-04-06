import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";

const SignupForm = () => {
  const { currentUser } = useMainContext();
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
    areNoSignupErrors,
    allSignupInputsFilled,
    showErrors,
    handleFormSubmission,
    handleFormRejection,
    signupIsSelected,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
  } = useLoginContext();

  const navigation = useNavigate();

  return (
    <div className="form">
      <div className="login-options-container">
        <div>
          <header onClick={!signupIsSelected ? () => toggleSignupLogin() : undefined}>
            Sign Up
          </header>
          {signupIsSelected && (
            <div className="form-type-underline animate__animated animate__slideInRight"></div>
          )}
        </div>
        <div>
          <header onClick={signupIsSelected ? () => toggleSignupLogin() : undefined}>
            Log In
          </header>
          {!signupIsSelected && (
            <div className="form-type-underline animate__animated animate__slideInLeft"></div>
          )}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          handleFormSubmission(true, e);
          setTimeout(() => navigation(`users/${currentUser?.username}`), 3000);
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
              onChange={(e) => handleNameInput(e.target.value, false)}
              value={lastName}
              type="text"
              placeholder="Enter your last name"
              inputMode="text"
              className={
                lastNameError !== "" && showErrors ? "erroneous-field" : undefined
              }
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
            title="Must be 4-20 characters long & contain only alphanumeric characters"
            onChange={(e) => handleUsernameInput(e.target.value)}
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
            onChange={(e) => handleEmailAddressInput(e.target.value)}
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
            Choose a Password:{" "}
            <span>
              <i
                onClick={() => setShowPasswordCriteria(!showPasswordCriteria)}
                className="fas fa-info-circle"
                title="Must contain at least one uppercase & one lowercase English letter, at least one digit, at least one special character, & be 8-20 characters long. No spaces allowed."
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
              className={
                passwordError !== "" && showErrors ? "erroneous-field" : undefined
              }
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
        <label>
          <p>Confirm Password:</p>
          <div className="password-input">
            <input
              onChange={(e) => handleConfirmationPasswordInput(e.target.value)}
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
            areNoSignupErrors && allSignupInputsFilled
              ? undefined
              : handleFormRejection(e)
          }
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
    </div>
  );
};
export default SignupForm;
