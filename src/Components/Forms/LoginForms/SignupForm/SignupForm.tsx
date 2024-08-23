import OpenEye from "../../../Elements/Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../../Elements/Eyecons/ClosedEye/ClosedEye";
import { useUserContext } from "../../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../../Hooks/useMainContext";
import { useEffect, useRef, useState } from "react";
import { TThemeColor } from "../../../../types";

// should have isOnSignup param
const SignupForm = ({ randomColor }: { randomColor: TThemeColor | undefined }) => {
  const { currentUser, welcomeMessageDisplayTime, fetchAllUsers } = useMainContext();
  const {
    resetLoginOrSignupFormFieldsAndErrors,
    areNoSignupFormErrors,
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
    allSignupFormFieldsFilled,
    showErrors,
    handleSignupOrLoginFormSubmission,
    handleFormRejection,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
  } = useUserContext();

  // After a couple seconds after signup, change url to /users/*username*:
  const navigation = useNavigate();
  const handleSignupFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    handleSignupOrLoginFormSubmission(true, e);
    setTimeout(
      () => navigation(`users/${currentUser?.username}`),
      welcomeMessageDisplayTime
    );
  };

  const [focusedElement, setFocusedElement] = useState<
    | "firstName"
    | "lastName"
    | "username"
    | "email"
    | "password"
    | "confirmPassword"
    | undefined
  >();

  // REFS:
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  ////////

  useEffect(() => {
    fetchAllUsers();
    resetLoginOrSignupFormFieldsAndErrors();
  }, []);

  return (
    <form
      onSubmit={(e) => handleSignupFormSubmission(e)}
      className="login-signup-edit-form"
    >
      <div>
        <label>
          <p>First Name:</p>
          <input
            ref={firstNameRef}
            onFocus={() => setFocusedElement("firstName")}
            style={
              focusedElement === "firstName"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
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
            ref={lastNameRef}
            onFocus={() => setFocusedElement("lastName")}
            style={
              focusedElement === "lastName"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
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
          ref={usernameRef}
          onFocus={() => setFocusedElement("username")}
          style={
            focusedElement === "username"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
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
          ref={emailRef}
          onFocus={() => setFocusedElement("email")}
          style={
            focusedElement === "email"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
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
            ref={passwordRef}
            onFocus={() => setFocusedElement("password")}
            style={
              focusedElement === "password"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
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
            ref={confirmPasswordRef}
            onFocus={() => setFocusedElement("confirmPassword")}
            style={
              focusedElement === "confirmPassword"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
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
