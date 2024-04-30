import OpenEye from "../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../Eyecons/ClosedEye/ClosedEye";
import { useLoginContext } from "../../Hooks/useLoginContext";
import { useMainContext } from "../../Hooks/useMainContext";
import { useEffect, useState } from "react";
import Requests from "../../requests";
import toast from "react-hot-toast";

const EditUserInfoForm = () => {
  const { currentUser, setCurrentUser, fetchAllUsers, allUsers } = useMainContext();
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
    areNoSignupOrEditFormErrors,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
  } = useLoginContext();

  /* Make sure all form errors are cleared, since they shouldn't have error "Please fill out this field" by default on EditUserInfoForm: */
  useEffect(() => {
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setConfirmationPasswordError("");
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

  // If form used not on signup (iow, used to edit user info), reset field values to corresponding point in currentUser
  // Only happens on edit-user-info form. On signup, fields are cleared when switching b/t login & signup forms
  useEffect(() => {
    handleEditUserInfoRevert();
  }, []);

  const [randomColor, setRandomColor] = useState<string>("");

  useEffect(() => {
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  const handleUpdateProfileInfo = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    /* Get most-current allUsers (in case other users have updated their un or email after current user logged in & before they submitted changes to their info).*/
    fetchAllUsers();
    /* If un or email address already exists & doesn't belong to current user, set error for that field saying as much. If not, make patch request w/ updated infos (done below) */
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
    if (areNoSignupOrEditFormErrors) {
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

  const userInfoEdited: boolean =
    (firstName?.trim() !== "" && firstName?.trim() !== currentUser?.firstName) ||
    (lastName?.trim() !== "" && lastName?.trim() !== currentUser?.lastName) ||
    (emailAddress !== "" && emailAddress !== currentUser?.emailAddress) ||
    (username !== "" && username !== currentUser?.username) ||
    (password !== "" && password !== currentUser?.password);

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

  return (
    <>
      <h2>
        Feel free to change any of your profile info in the form below. Make sure to save
        changes, else they won't apply
      </h2>
      <form onSubmit={(e) => handleUpdateProfileInfo(e)} className="login-signup-form">
        <div>
          <label>
            <p>First Name:</p>
            <input
              autoComplete="given-name"
              onChange={(e) => handleNameInput(e.target.value, true, "edit-user-info")}
              value={firstName}
              type="text"
              placeholder="Change first name"
              inputMode="text"
              className={firstNameError !== "" ? "erroneous-field" : undefined}
            />
            {firstNameError !== "" && (
              <p className="input-error-message">{firstNameError}</p>
            )}
          </label>
          <label>
            <p>Last Name:</p>
            <input
              autoComplete="family-name"
              onChange={(e) => handleNameInput(e.target.value, false, "edit-user-info")}
              type="text"
              value={lastName}
              placeholder="Change last name"
              inputMode="text"
              className={lastNameError !== "" ? "erroneous-field" : undefined}
            />
            {lastNameError !== "" && (
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
            onChange={(e) => handleUsernameInput(e.target.value, "edit-user-info")}
            value={username}
            type="text"
            placeholder="Change username"
            inputMode="text"
            className={usernameError !== "" ? "erroneous-field" : undefined}
          />
          {usernameError !== "" && <p className="input-error-message">{usernameError}</p>}
        </label>
        <label>
          <p>E-Mail Address:</p>
          <input
            autoComplete="email"
            onChange={(e) => handleEmailAddressInput(e.target.value, "edit-user-info")}
            value={emailAddress}
            type="email"
            placeholder="Change your e-mail address"
            inputMode="email"
            className={emailError !== "" ? "erroneous-field" : undefined}
          />
          {emailError !== "" && <p className="input-error-message">{emailError}</p>}
        </label>
        <label>
          <p>
            Password:
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
              onChange={(e) => handlePasswordInput(e.target.value, "edit-user-info")}
              value={password}
              type={passwordIsHidden ? "password" : "text"}
              placeholder="Enter new password"
              inputMode="text"
              className={passwordError !== "" ? "erroneous-field" : undefined}
            />
            {!passwordIsHidden ? (
              <OpenEye toggleHidePassword={toggleHidePassword} />
            ) : (
              <ClosedEye toggleHidePassword={toggleHidePassword} />
            )}
          </div>
          {passwordError !== "" && <p className="input-error-message">{passwordError}</p>}
        </label>
        {/* Render 'confirm pw' field only if form is on signup or if it's form to edit user info, & pw has been changed */}
        {password !== currentUser?.password && password !== "" && (
          <label>
            <p>Confirm New Password:</p>
            <div className="password-input">
              <input
                autoComplete="off"
                onChange={(e) =>
                  handleConfirmationPasswordInput(e.target.value, "edit-user-info")
                }
                value={confirmationPassword}
                type={passwordIsHidden ? "password" : "text"}
                placeholder="Confirm password"
                inputMode="text"
                className={
                  confirmationPasswordError !== "" ? "erroneous-field" : undefined
                }
              />
              {!passwordIsHidden ? (
                <OpenEye toggleHidePassword={toggleHidePassword} />
              ) : (
                <ClosedEye toggleHidePassword={toggleHidePassword} />
              )}
            </div>
            {confirmationPasswordError !== "" && (
              <p className="input-error-message">{confirmationPasswordError}</p>
            )}
          </label>
        )}
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
      </form>
    </>
  );
};
export default EditUserInfoForm;
