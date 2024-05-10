import React from "react";
import OpenEye from "../Eyecons/OpenEye/OpenEye";
import ClosedEye from "../Eyecons/ClosedEye/ClosedEye";
import { useUserContext } from "../../Hooks/useUserContext";
import { useMainContext } from "../../Hooks/useMainContext";
import { useEffect, useState } from "react";
import Requests from "../../requests";
import { countriesAndTheirPhoneCodes, phoneNumberLengthRanges } from "../../constants";
import toast from "react-hot-toast";

const EditUserInfoForm = () => {
  const { currentUser, setCurrentUser, fetchAllUsers, allUsers } = useMainContext();
  const {
    phoneCountry,
    setPhoneCountry,
    phoneCountryCode,
    setPhoneCountryCode,
    phoneNumberWithoutCountryCode,
    setPhoneNumberWithoutCountryCode,
    phoneNumberError,
    setPhoneNumberError,
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
    areNoSignupOrEditFormErrors,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    confirmationPasswordError,
    handleConfirmationPasswordInput,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
  } = useUserContext();

  const [phoneFieldMinLength, setPhoneFieldMinLength] = useState<number>(1);
  const [phoneFieldMaxLength, setPhoneFieldMaxLength] = useState<number>(13);

  const [showCountryPhoneCodes, setShowCountryPhoneCodes] = useState<boolean>(false);

  /* Make sure all login/signup-form errors are cleared, since they shouldn't have error "Please fill out this field" by default on EditUserInfoForm: */
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
    currentUser?.phoneCountry,
    currentUser?.phoneCountryCode,
    currentUser?.phoneNumberWithoutCountryCode,
  ]);

  // Reset field values to corresponding point in currentUser
  useEffect(() => {
    if (currentUser && currentUser.phoneCountryCode !== "") {
      handlePhoneFieldMinMaxSettingAndPhoneErrorAfterOnChangeOfCountryCode(
        currentUser.phoneCountryCode
      );
    }
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
    e.preventDefault(); // prevent page from auto-reloading after submitting edit form

    /* Get most-current allUsers (in case other users have updated their un or email after current user logged in & before they submitted changes to their info).*/
    fetchAllUsers();

    /* If un or email address already exists & doesn't belong to current user, set error for that field saying as much. If not, make patch request w/ updated infos (done below) */
    const usernameExists =
      allUsers.map((user) => user.username).includes(username) &&
      currentUser?.username !== username;

    const emailAddressExists =
      allUsers.map((user) => user.emailAddress).includes(emailAddress) &&
      currentUser?.emailAddress !== emailAddress;

    const fullPhoneNumber =
      phoneCountryCode && phoneNumberWithoutCountryCode
        ? phoneCountryCode + phoneNumberWithoutCountryCode
        : undefined;
    const phoneNumberExists = fullPhoneNumber
      ? allUsers
          .map((user) => {
            return user.phoneCountryCode + user.phoneNumberWithoutCountryCode;
          })
          .includes(fullPhoneNumber) &&
        currentUser?.phoneCountryCode &&
        currentUser.phoneNumberWithoutCountryCode &&
        currentUser?.phoneCountryCode + currentUser?.phoneNumberWithoutCountryCode !==
          fullPhoneNumber
      : undefined;

    if (usernameExists) {
      setUsernameError("Username already exists");
    }
    if (emailAddressExists) {
      setEmailError("E-mail address already exists");
    }
    if (phoneNumberExists) {
      setPhoneNumberError("Phone number is already in use");
    }

    // Only if there are no errors & infos that must be unique aren't already in use, patch changes to user data object:
    if (areNoSignupOrEditFormErrors && !phoneNumberExists) {
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
    setPhoneCountry(currentUser?.phoneCountry);
    setPhoneCountryCode(currentUser?.phoneCountryCode);
    setPhoneNumberWithoutCountryCode(currentUser?.phoneNumberWithoutCountryCode);
    setPhoneNumberError("");
  };

  // Call this in every if, else...if statement in handlePhoneFieldMinMaxSettingAndPhoneErrorAfterOnChangeOfCountryCode
  const handlePhoneFieldError = (
    min: number,
    max: number,
    value: string | undefined
  ): void => {
    if (!(typeof value === "string" && value?.length >= min && value?.length <= max)) {
      if (min === max) {
        setPhoneNumberError(`Phone number must be ${min} digits long`);
      } else {
        setPhoneNumberError(`Phone number must be ${min}-${max} digits long`);
      }
    } else {
      setPhoneNumberError("");
    }
  };

  // Set phoneFieldMinLength & phoneFieldMaxLength at same time
  const setPhoneNumberMinAndMaxLength = (min: number, max: number): void => {
    setPhoneFieldMinLength(min);
    setPhoneFieldMaxLength(max);
  };

  // Function sets min/max of phone field & any error, depending on countryCode
  // Call in handlePhoneNumberInput
  const handlePhoneFieldMinMaxSettingAndPhoneErrorAfterOnChangeOfCountryCode = (
    countryCode: string,
    /* numberWithoutCode used to ensure most-current value is used (this functionality was running 1 step behind phoneNumberWithoutCountryCode state value) */
    numberWithoutCode?: string
  ): void => {
    // If user resets phoneCountryCode to "" (happens when deleting phone number)
    if (phoneCountryCode === "") {
      setPhoneNumberMinAndMaxLength(1, 13);
      handlePhoneFieldError(1, 13, numberWithoutCode);
    }
    if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers3To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(3, 8);
      handlePhoneFieldError(3, 8, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers3To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(3, 9);
      handlePhoneFieldError(3, 9, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers3To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(3, 10);
      handlePhoneFieldError(3, 10, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 4);
      handlePhoneFieldError(4, 4, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To7DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 7);
      // Nauru numbers w/o country code can only be 4 or 7 digits long
      if (countryCode === "674") {
        if (numberWithoutCode?.length !== 4 && numberWithoutCode?.length !== 7) {
          setPhoneNumberError("Phone number must be 4 or 7 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(4, 7, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 9);
      // Hong Kong numbers w/o country code must be 4, 8, or 9 digits long
      if (countryCode === "852") {
        if (
          numberWithoutCode?.length !== 4 &&
          numberWithoutCode?.length !== 8 &&
          numberWithoutCode?.length !== 9
        ) {
          setPhoneNumberError("Phone number must be 4, 8, or 9 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(4, 9, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To11DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 11);
      handlePhoneFieldError(4, 11, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To12DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 12);
      handlePhoneFieldError(4, 12, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 13);
      handlePhoneFieldError(4, 13, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 5);
      handlePhoneFieldError(5, 5, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To6DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 6);
      handlePhoneFieldError(5, 6, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To7DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 7);
      // Vanuatu & Tonga phone numbers w/o country code must be 5 or 7 digits long
      if (countryCode === "676" || countryCode === "678") {
        if (numberWithoutCode?.length !== 5 && numberWithoutCode?.length !== 7) {
          setPhoneNumberError("Phone number must be 5 or 7 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(5, 7, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 8);
      if (countryCode === "47") {
        if (numberWithoutCode?.length !== 5 && numberWithoutCode?.length !== 8) {
          setPhoneNumberError("Phone number must be 5 or 8 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(5, 8, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 9);
      handlePhoneFieldError(5, 9, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 10);
      handlePhoneFieldError(5, 10, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To12DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 12);
      handlePhoneFieldError(5, 12, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 13);
      handlePhoneFieldError(5, 13, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To15DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 15);
      handlePhoneFieldError(5, 15, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 6);
      handlePhoneFieldError(6, 6, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To7DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 7);
      handlePhoneFieldError(6, 7, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 8);
      handlePhoneFieldError(6, 8, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 9);
      // Andorran phone numbers must be 6, 8, or 9 digits long
      if (countryCode === "376") {
        if (
          numberWithoutCode?.length !== 6 &&
          numberWithoutCode?.length !== 8 &&
          numberWithoutCode?.length !== 9
        ) {
          setPhoneNumberError("Phone number must be 6, 8, or 9 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(6, 9, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 10);
      handlePhoneFieldError(6, 10, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 13);
      handlePhoneFieldError(6, 13, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To17DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 17);
      handlePhoneFieldError(6, 17, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 7);
      handlePhoneFieldError(7, 7, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 8);
      handlePhoneFieldError(7, 8, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 9);
      // Iceland phone numbers must be 7 or 9 digits long
      if (countryCode === "354") {
        if (numberWithoutCode?.length !== 7 && numberWithoutCode?.length !== 9) {
          setPhoneNumberError("Phone number must be 7 or 9 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(7, 9, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 10);
      handlePhoneFieldError(7, 10, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To11DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 11);
      // El Salvadorean numbers w/o country code can only be 7, 8, or 11 digits long
      if (countryCode === "503") {
        if (
          numberWithoutCode?.length !== 7 &&
          numberWithoutCode?.length !== 8 &&
          numberWithoutCode?.length !== 11
        ) {
          setPhoneNumberError("Number must be 7, 8, or 11 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(7, 11, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 13);
      handlePhoneFieldError(7, 13, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 8);
      handlePhoneFieldError(8, 8, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 9);
      handlePhoneFieldError(8, 9, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 10);
      // Colombian numbers w/o country code can only be 8 or 10 digits long
      if (countryCode === "57") {
        if (numberWithoutCode?.length !== 8 && numberWithoutCode?.length !== 10) {
          setPhoneNumberError("Phone number must be 8 or 10 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(8, 10, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8To11DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 11);
      // Cyprus numbers w/o country code can only be 8 or 11 digits long
      if (countryCode === "357") {
        if (numberWithoutCode?.length !== 8 && numberWithoutCode?.length !== 11) {
          setPhoneNumberError("Number must be 8 or 11 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(8, 11, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8To12DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 12);
      handlePhoneFieldError(8, 12, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(9, 9);
      handlePhoneFieldError(9, 9, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers9To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(9, 10);
      handlePhoneFieldError(9, 10, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers9To11DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(9, 11);
      // Portuguese numbers w/o country code can only be 9 or 11 digits long
      if (countryCode === "351") {
        if (numberWithoutCode?.length !== 9 && numberWithoutCode?.length !== 11) {
          setPhoneNumberError("Number must be 9 or 11 digits long");
        } else {
          setPhoneNumberError("");
        }
      } else {
        handlePhoneFieldError(9, 11, numberWithoutCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(10, 10);
      handlePhoneFieldError(10, 10, numberWithoutCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesUpTo11DigitsLong.includes(countryCode)
    ) {
      setPhoneNumberMinAndMaxLength(1, 11);
      handlePhoneFieldError(1, 11, numberWithoutCode);
    }
  };

  // Keep this here, as it's only used in this component
  const handlePhoneNumberInput = (
    phoneNumberField: "country-code" | "number-without-country-code",
    e?: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
    dataCountry?: string
  ): void => {
    if (phoneNumberField === "number-without-country-code" && e) {
      // Set phoneNumberWithoutCountryCode only if input contains only numbers (disallow all other chars)
      if (/^[0-9]*$/.test(e.target.value)) {
        setPhoneNumberWithoutCountryCode(e.target.value);
      }

      handlePhoneFieldError(phoneFieldMinLength, phoneFieldMaxLength, e.target.value);

      if (phoneCountryCode) {
        handlePhoneFieldMinMaxSettingAndPhoneErrorAfterOnChangeOfCountryCode(
          phoneCountryCode,
          e.target.value
        );
      }
      // Run onChange of country-code field:
    } else {
      // Clear phone-without-code field:
      setPhoneNumberWithoutCountryCode("");

      // Set phoneCountry & phoneCountryCode:
      // Remember, e.target.value will be something like: Mexico +52
      const country = dataCountry?.substring(0, dataCountry?.indexOf("+") - 1);
      const countryCode = dataCountry?.substring(dataCountry?.indexOf("+") + 1);
      setPhoneCountry(country);
      setPhoneCountryCode(countryCode);
      if (countryCode) {
        handlePhoneFieldMinMaxSettingAndPhoneErrorAfterOnChangeOfCountryCode(
          countryCode,
          ""
        );
      }
    }
  };

  const userInfoEdited: boolean =
    firstName?.trim() !== currentUser?.firstName ||
    lastName?.trim() !== currentUser?.lastName ||
    emailAddress !== currentUser?.emailAddress ||
    username !== currentUser?.username ||
    password !== currentUser?.password ||
    phoneCountry !== currentUser?.phoneCountry ||
    phoneCountryCode !== currentUser?.phoneCountryCode ||
    phoneNumberWithoutCountryCode !== currentUser?.phoneNumberWithoutCountryCode;

  const valuesToUpdate = {
    ...(firstName?.trim() !== "" &&
      firstName !== currentUser?.firstName && { "firstName": firstName?.trim() }),
    ...(lastName?.trim() !== "" &&
      lastName !== currentUser?.lastName && { lastName: lastName?.trim() }),
    ...(username !== "" && username !== currentUser?.username && { username: username }),
    ...(emailAddress !== "" &&
      emailAddress !== currentUser?.emailAddress && {
        emailAddress: emailAddress?.trim(),
      }),
    ...(password !== "" &&
      password !== currentUser?.password && { password: password?.replace(/\s+/g, "") }),
    ...(phoneCountry !== "" &&
      phoneCountry !== currentUser?.phoneCountry && { phoneCountry: phoneCountry }),
    ...(phoneCountryCode !== "" &&
      phoneCountryCode !== currentUser?.phoneCountryCode && {
        phoneCountryCode: phoneCountryCode,
      }),
    ...(phoneNumberWithoutCountryCode !== "" &&
      phoneNumberWithoutCountryCode !== currentUser?.phoneNumberWithoutCountryCode && {
        phoneNumberWithoutCountryCode: phoneNumberWithoutCountryCode,
      }),
  };

  return (
    <>
      <h2>
        Feel free to change any of your profile info in the form below. Make sure to save
        changes, else they won't apply
      </h2>
      <form className="login-signup-form">
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
          <p>Phone Number:</p>
          <div className="phone-input-elements">
            <div className="country-code-element">
              <button
                className="country-code-dropdown-button"
                type="button"
                onClick={() => setShowCountryPhoneCodes(!showCountryPhoneCodes)}
              >
                {phoneCountryCode === "" ? (
                  "Select country:"
                ) : (
                  <div className="flag-and-code-container">
                    <img
                      src={`/flags/1x1/${
                        countriesAndTheirPhoneCodes.filter(
                          (country) => country.country === phoneCountry
                        )[0].abbreviation
                      }.svg`}
                    />
                    <span>{`+${
                      countriesAndTheirPhoneCodes.filter(
                        (country) => country.country === phoneCountry
                      )[0].phoneCode
                    }`}</span>
                  </div>
                )}
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
            <div className="phone-without-country-code-element">
              <input
                autoComplete="off"
                onChange={(e) => handlePhoneNumberInput("number-without-country-code", e)}
                value={phoneNumberWithoutCountryCode}
                type="text"
                placeholder="Edit your phone number"
                inputMode="tel"
                className={phoneNumberError !== "" ? "erroneous-field" : undefined}
                minLength={phoneFieldMinLength}
                maxLength={phoneFieldMaxLength}
              />
              {phoneNumberError !== "" && (
                <p className="input-error-message">{phoneNumberError}</p>
              )}
            </div>
          </div>
          {showCountryPhoneCodes && (
            <ul className="country-code-dropdown">
              {countriesAndTheirPhoneCodes.map((country) => (
                <li
                  key={country.country}
                  onClick={() =>
                    handlePhoneNumberInput(
                      "country-code",
                      undefined,
                      `${country.country} +${country.phoneCode}`
                    )
                  }
                  data-country={`${country.country} +${country.phoneCode}`}
                >
                  <img src={`/flags/1x1/${country.abbreviation}.svg`} />
                  <span>{`${country.country} +${country.phoneCode}`}</span>
                </li>
              ))}
            </ul>
          )}
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
          <button
            type="reset"
            disabled={!userInfoEdited}
            onClick={() => handleEditUserInfoRevert()}
          >
            Revert Changes
          </button>
          <button
            type="submit"
            disabled={!(userInfoEdited && areNoSignupOrEditFormErrors)}
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
