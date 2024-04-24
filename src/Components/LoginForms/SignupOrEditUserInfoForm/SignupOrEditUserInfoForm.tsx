import OpenEye from "../../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../../Hooks/useLoginContext";
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useEffect, useState } from "react";
import Requests from "../../../requests";
import toast from "react-hot-toast";

// should have isOnSignup param
const SignupOrEditUserInfoForm = ({ isOnSignup }: { isOnSignup: boolean }) => {
  const {
    currentUser,
    setCurrentUser,
    welcomeMessageDisplayTime,
    fetchAllUsers,
    allUsers,
  } = useMainContext();
  const {
    passwordIsHidden,
    toggleHidePassword,
    firstName,
    setFirstName,
    firstNameError,
    setFirstNameError,
    handleNameInput,
    lastName,
    setLastName,
    lastNameError,
    setLastNameError,
    username,
    setUsername,
    usernameError,
    setUsernameError,
    emailAddress,
    setEmailAddress,
    emailError,
    setEmailError,
    password,
    setPassword,
    passwordError,
    setPasswordError,
    confirmationPassword,
    setConfirmationPasswordError,
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

  // Clear all form errors if !onSignup. Else, set them all to "Please fill out this field"
  useEffect(() => {
    if (isOnSignup) {
      setFirstNameError("Please fill out this field");
      setLastNameError("Please fill out this field");
      setEmailError("Please fill out this field");
      setUsernameError("Please fill out this field");
      setPasswordError("Please fill out this field");
      setConfirmationPasswordError("Please fill out this field");
    } else {
      setFirstNameError("");
      setLastNameError("");
      setEmailError("");
      setUsernameError("");
      setPasswordError("");
      setConfirmationPasswordError("");
    }
  }, []);

  // If user data has changed, setCurrentUser:
  useEffect(() => {
    if (username === currentUser?.username) {
      setCurrentUser(allUsers.filter((user) => user.username === username)[0]);
    } else {
      setCurrentUser(allUsers.filter((user) => user.emailAddress === emailAddress)[0]);
    }
  }, [
    setCurrentUser,
    allUsers,
    username,
    emailAddress,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.emailAddress,
    currentUser?.username,
    currentUser?.password,
  ]);

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<string>("");

  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  const userInfoEdited: boolean =
    (firstName?.trim() !== "" && firstName?.trim() !== currentUser?.firstName) ||
    (lastName?.trim() !== "" && lastName?.trim() !== currentUser?.lastName) ||
    (emailAddress !== "" && emailAddress !== currentUser?.emailAddress) ||
    (username !== "" && username !== currentUser?.username) ||
    (password !== "" && password !== currentUser?.password);

  const handleSignupFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    handleSignupOrLoginFormSubmission(true, e);
    setTimeout(
      () => navigation(`users/${currentUser?.username}`),
      welcomeMessageDisplayTime
    );
  };

  // Function that resets form values to what they are in currentUser
  // Called upon first render of this component or if user cancels changes they made to edit-user-info form
  const handleEditUserInfoRevert = () => {
    setFirstName(currentUser?.firstName);
    setFirstNameError("");
    setLastName(currentUser?.lastName);
    setLastNameError("");
    setUsername(currentUser?.username);
    setUsernameError("");
    setEmailAddress(currentUser?.emailAddress);
    setEmailError("");
    setPassword(currentUser?.password);
    setPasswordError("");
  };
  // If form used not on signup (iow, used to edit user info), reset field values to corresponding point in currentUser
  // Only happens on edit-user-info form. On signup, fields are cleared when switching b/t login & signup forms
  useEffect(() => {
    if (!isOnSignup) {
      handleEditUserInfoRevert();
    }
  }, []);

  const valuesToUpdate = {
    ...(firstName?.trim() !== "" &&
      firstName !== currentUser?.firstName && { "firstName": firstName }),
    ...(lastName?.trim() !== "" &&
      lastName !== currentUser?.lastName && { lastName: lastName }),
    ...(username !== "" && username !== currentUser?.username && { username: username }),
    ...(emailAddress !== "" &&
      emailAddress !== currentUser?.emailAddress && { emailAddress: emailAddress }),
    ...(password !== "" && password !== currentUser?.password && { password: password }),
  };

  // handleUpdateProfileInfo should contain PATCH request to update user data obj with current / any changed infos on it (firstName to current value of firstName, etc.)
  // like handleSignup...FormSubmission above, clear firstName, etc. after patching these to user data object
  const handleUpdateProfileInfo = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    /* Get most-current allUsers (in case other users have updated their un or email after current user logged in & before they submitted changes to their info).*/
    fetchAllUsers();
    /* If un or email address already exists & doesn't belong to current user, set error for that field saying as much. if not make patch request w/ updated infos */
    const usernameExists =
      allUsers.map((user) => user.username).includes(username) &&
      currentUser?.username !== username;
    const emailAddressExists =
      allUsers.map((user) => user.emailAddress).includes(emailAddress) &&
      currentUser?.emailAddress !== emailAddress;
    if (usernameExists) {
      setUsernameError("Username already exists");
    }
    if (emailAddressExists) {
      setEmailError("E-mail address already exists");
    }

    // Only if there are no errors, patch changes to user data object:
    if (areNoSignupErrors) {
      Requests.patchUpdatedUserInfo(currentUser, valuesToUpdate)
        .then((response) => {
          if (!response.ok) {
            toast.error("Could not update profile info. Please try again.");
          } else {
            toast.success("Profile info updated");
            // Reset allUsers after patch successfully made:
            fetchAllUsers();
            if (!passwordIsHidden) {
              toggleHidePassword();
            }
          }
        })
        .catch((error) => console.log(error));
    } else {
      window.alert("Please fix any form errors, then try again");
    }
  };

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
        isOnSignup ? handleSignupFormSubmission(e) : handleUpdateProfileInfo(e);
      }}
      className="login-signup-form"
    >
      <div>
        <label>
          <p>First Name:</p>
          <input
            onChange={(e) =>
              isOnSignup
                ? handleNameInput(e.target.value, true, true)
                : handleNameInput(e.target.value, true, false)
            }
            value={firstName}
            type="text"
            placeholder={isOnSignup ? "Enter your first name" : "Change first name"}
            inputMode="text"
            className={firstNameFieldClass}
          />
          {showFirstNameError && <p className="input-error-message">{firstNameError}</p>}
        </label>
        <label>
          <p>Last Name:</p>
          <input
            onChange={(e) =>
              isOnSignup
                ? handleNameInput(e.target.value, false, true)
                : handleNameInput(e.target.value, false, false)
            }
            type="text"
            value={lastName}
            placeholder={isOnSignup ? "Enter your last name" : "Change last name"}
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
          onChange={(e) =>
            isOnSignup
              ? handleUsernameInput(e.target.value, true)
              : handleUsernameInput(e.target.value, false)
          }
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
          onChange={(e) =>
            isOnSignup
              ? handleEmailAddressInput(e.target.value, true)
              : handleEmailAddressInput(e.target.value, false)
          }
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
          {isOnSignup ? "Choose a Password: " : "Password: "}
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
            onChange={(e) =>
              isOnSignup
                ? handlePasswordInput(e.target.value, "signup")
                : handlePasswordInput(e.target.value, "edit-user-info")
            }
            value={password}
            type={passwordIsHidden ? "password" : "text"}
            placeholder={isOnSignup === false ? "Enter new password" : "Enter password"}
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
      {/* Render 'confirm pw' field only if form is on signup or if it's form to edit user info, & pw has been changed */}
      {((isOnSignup === false && password !== currentUser?.password && password !== "") ||
        isOnSignup === true) && (
        <label>
          <p>{isOnSignup ? "Confirm Password:" : "Confirm New Password:"}</p>
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
      )}
      {isOnSignup ? (
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
      ) : (
        <div className="edit-user-info-form-options">
          <button disabled={!userInfoEdited} onClick={() => handleEditUserInfoRevert()}>
            Revert Changes
          </button>
          <button
            type="submit"
            disabled={!userInfoEdited}
            style={{ backgroundColor: randomColor }}
            onClick={(e) => handleUpdateProfileInfo(e)}
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
};
export default SignupOrEditUserInfoForm;
