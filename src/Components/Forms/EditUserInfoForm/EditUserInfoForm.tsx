import React from "react";
import { useRef } from "react";
import OpenEye from "../../Elements/Eyecons/OpenEye/OpenEye";
import ClosedEye from "../../Elements/Eyecons/ClosedEye/ClosedEye";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEffect, useState } from "react";
import Requests from "../../../requests";
import { countries, phoneNumberLengthRanges } from "../../../constants";
import toast from "react-hot-toast";
import Methods from "../../../methods";
import { TThemeColor } from "../../../types";
import { useMainContext } from "../../../Hooks/useMainContext";

const EditUserInfoForm = ({
  randomColor,
  isLoading,
  setIsLoading,
}: {
  randomColor: TThemeColor | undefined;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { theme } = useMainContext();
  const {
    currentUser,
    setCurrentUser,
    fetchAllUsers,
    allUsers,
    valuesToUpdate,
    whoCanAddUserAsOrganizer,
    setWhoCanAddUserAsOrganizer,
    whoCanInviteUser,
    setWhoCanInviteUser,
    profileVisibleTo,
    setProfileVisibleTo,
    handleCityStateCountryInput,
    userCity,
    setUserCity,
    userState,
    setUserState,
    userCountry,
    setUserCountry,
    locationError,
    setLocationError,
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
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    confirmationPasswordError,
    handleConfirmationPasswordInput,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
    facebook,
    setFacebook,
    facebookError,
    setFacebookError,
    instagram,
    setInstagram,
    instagramError,
    setInstagramError,
    x,
    setX,
    xError,
    setXError,
    userAbout,
    setUserAbout,
    userAboutError,
    setUserAboutError,
  } = useUserContext();

  // REFS
  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneNumberRef = useRef<HTMLInputElement | null>(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef<HTMLInputElement | null>(null);
  const facebookRef = useRef<HTMLInputElement | null>(null);
  const instagramRef = useRef<HTMLInputElement | null>(null);
  const xRef = useRef<HTMLInputElement | null>(null);
  const aboutRef = useRef(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  /////////

  const [phoneFieldMinLength, setPhoneFieldMinLength] = useState<number>(1);
  const [phoneFieldMaxLength, setPhoneFieldMaxLength] = useState<number>(13);

  const [showCountryPhoneCodes, setShowCountryPhoneCodes] = useState<boolean>(false);
  const [showUserLocationCountries, setShowUserLocationCountries] =
    useState<boolean>(false);
  const [focusedElement, setFocusedElement] = useState<
    | "firstName"
    | "lastName"
    | "username"
    | "email"
    | "phoneNumber"
    | "city"
    | "state"
    | "facebook"
    | "instagram"
    | "x"
    | "about"
    | "password"
    | "confirmPassword"
    | undefined
  >();

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
    currentUser?.city,
    currentUser?.stateProvince,
    currentUser?.country,
    currentUser?.facebook,
    currentUser?.instagram,
    currentUser?.x,
    currentUser?.about,
  ]);

  // Function that resets form values to what they are in currentUser
  // Called upon first render of this component or if user cancels changes they made to edit-user-info form
  const handleEditUserInfoRevert = (): void => {
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
    setConfirmationPasswordError("");
    setUserCity(currentUser?.city);
    setUserState(currentUser?.stateProvince);
    setUserCountry(currentUser?.country);
    setLocationError("");
    setPhoneCountry(currentUser?.phoneCountry);
    setPhoneCountryCode(currentUser?.phoneCountryCode);
    setPhoneNumberWithoutCountryCode(currentUser?.phoneNumberWithoutCountryCode);
    setPhoneNumberError("");
    setFacebook(currentUser?.facebook);
    setFacebookError("");
    setInstagram(currentUser?.instagram);
    setInstagramError("");
    setX(currentUser?.x);
    setXError("");
    setUserAbout(currentUser?.about);
    setUserAboutError("");
    setWhoCanAddUserAsOrganizer(currentUser?.whoCanAddUserAsOrganizer);
    setWhoCanInviteUser(currentUser?.whoCanInviteUser);
    setProfileVisibleTo(currentUser?.profileVisibleTo);
  };

  // If currentUser has given a phone code, set limits for length of rest of number based on that
  // Also, ensure all error messages are cleared & input values originally set to what they are in currentUser
  useEffect(() => {
    if (currentUser && currentUser.phoneCountryCode !== "") {
      handlePhoneFieldMinMaxSettingAndPhoneErrorAfterChangeOfCountryCode(
        currentUser.phoneCountryCode
      );
    }
    handleEditUserInfoRevert();
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
    if (areNoEditFormErrors && !phoneNumberExists) {
      setIsLoading(true);
      Requests.patchUpdatedUserInfo(currentUser, valuesToUpdate)
        .then((response) => {
          if (!response.ok) {
            toast.error("Could not update profile info. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
            fetchAllUsers();
          } else {
            toast.success("Profile info updated", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid green",
              },
            });

            /* Set values of fields to updated values (done this way so that it's not necessary to wait for these state values to update first, which won't happen) */
            if (valuesToUpdate.firstName) {
              setFirstName(valuesToUpdate.firstName);
            }
            if (valuesToUpdate.lastName) {
              setLastName(valuesToUpdate.lastName);
            }
            if (valuesToUpdate.emailAddress) {
              setEmailAddress(valuesToUpdate.emailAddress);
            }
            if (valuesToUpdate.password) {
              setPassword(valuesToUpdate.password);
            }
            if (valuesToUpdate.phoneCountry) {
              setPhoneCountry(valuesToUpdate.phoneCountry);
            }
            if (valuesToUpdate.phoneCountryCode) {
              setPhoneCountryCode(valuesToUpdate.phoneCountryCode);
            }
            if (valuesToUpdate.phoneNumberWithoutCountryCode) {
              setPhoneNumberWithoutCountryCode(
                valuesToUpdate.phoneNumberWithoutCountryCode
              );
            }
            if (valuesToUpdate.city) {
              setUserCity(valuesToUpdate.city);
            }
            if (valuesToUpdate.stateProvince) {
              setUserState(valuesToUpdate.stateProvince);
            }
            if (valuesToUpdate.country) {
              setUserCountry(valuesToUpdate.country);
            }
            if (valuesToUpdate.facebook) {
              setFacebook(valuesToUpdate.facebook);
            }
            if (valuesToUpdate.instagram) {
              setInstagram(valuesToUpdate.instagram);
            }
            if (valuesToUpdate.x) {
              setX(valuesToUpdate.x);
            }
            if (valuesToUpdate.about) {
              setUserAbout(valuesToUpdate.about);
            }

            // Hide PW again if unhidden on submit of edit-user-info form
            if (!passwordIsHidden) {
              toggleHidePassword();
            }
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
    } else {
      window.alert("Please fix any form errors, then try again");
    }
  };

  // INPUT HANDLERS (and methods used in them):
  // Call this in every if, else...if statement in handlePhoneFieldMinMaxSettingAndPhoneErrorAfterChangeOfCountryCode
  const handlePhoneFieldError = (
    min: number,
    max: number,
    value: string | undefined,
    countryCode: string // used instead of phoneCountryCode b/c it's more current
  ): void => {
    fetchAllUsers();
    const phoneNumberTaken: boolean = allUsers
      .filter((user) => user._id !== currentUser?._id)
      .map((user) => user.phoneCountryCode + user.phoneNumberWithoutCountryCode)
      .includes(countryCode + value);
    // If input doesn't meet length req or if it doesn't meet length req and countryCode is blank:
    if (
      !(typeof value === "string" && value?.length >= min && value?.length <= max) ||
      (countryCode === "" &&
        !(typeof value === "string" && value?.length >= min && value?.length <= max))
    ) {
      if (!value?.length && countryCode === "") {
        setPhoneNumberError("");
      } else if (min === max) {
        setPhoneNumberError(`Phone number must be ${min} digits long`);
      } else {
        setPhoneNumberError(`Phone number must be ${min}-${max} digits long`);
      }
      // If input meets length req & countryCode still not selected:
    } else if (countryCode === "") {
      setPhoneNumberError("Please select a country");
    } else if (phoneNumberTaken) {
      setPhoneNumberError("Phone number already in use");
    } else {
      setPhoneNumberError("");
    }
  };

  // Set phoneFieldMinLength & phoneFieldMaxLength at same time
  const setPhoneNumberMinAndMaxLength = (min: number, max: number): void => {
    setPhoneFieldMinLength(min);
    setPhoneFieldMaxLength(max);
  };

  // Keep this here, as it's only used in this component
  const handlePhoneNumberInput = (
    phoneNumberField: "country-code" | "number-without-country-code",
    e?: React.ChangeEvent<HTMLInputElement>,
    countryNameAndCode?: string
  ): void => {
    if (phoneNumberField === "number-without-country-code" && e) {
      // Set phoneNumberWithoutCountryCode only if input contains only numbers (disallow all other chars)
      if (/^[0-9]*$/.test(e.target.value)) {
        setPhoneNumberWithoutCountryCode(e.target.value);
      }

      handlePhoneFieldError(phoneFieldMinLength, phoneFieldMaxLength, e.target.value, "");

      if (phoneCountryCode) {
        handlePhoneFieldMinMaxSettingAndPhoneErrorAfterChangeOfCountryCode(
          phoneCountryCode,
          e.target.value
        );
      }
      // Run onChange of country-code field:
    } else {
      // Set phoneCountry & phoneCountryCode:
      // Remember, countryNameAndCode will be something like: Mexico +52
      const country = countryNameAndCode?.substring(
        0,
        countryNameAndCode?.indexOf("+") - 1
      );
      const countryCode = countryNameAndCode?.substring(
        countryNameAndCode?.indexOf("+") + 1
      );
      setPhoneCountry(country);
      setPhoneCountryCode(countryCode);

      // Handle setting of min/max length & error
      if (countryCode) {
        handlePhoneFieldMinMaxSettingAndPhoneErrorAfterChangeOfCountryCode(
          countryCode,
          phoneNumberWithoutCountryCode
        );
      }
    }
  };

  // Function sets min/max of phone field & any error, depending on countryCode
  // Call in handlePhoneNumberInput
  const handlePhoneFieldMinMaxSettingAndPhoneErrorAfterChangeOfCountryCode = (
    countryCode: string,
    /* numberWithoutCode used to ensure most-current value is used (this functionality was running 1 step behind phoneNumberWithoutCountryCode state value) */
    numberWithoutCode?: string
  ): void => {
    // If user resets phoneCountryCode to "" (happens when deleting phone number)
    if (phoneCountryCode === "") {
      setPhoneNumberMinAndMaxLength(1, 13);
      handlePhoneFieldError(1, 13, numberWithoutCode, "");
    }
    if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers3To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(3, 8);
      handlePhoneFieldError(3, 8, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers3To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(3, 9);
      handlePhoneFieldError(3, 9, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers3To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(3, 10);
      handlePhoneFieldError(3, 10, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 4);
      handlePhoneFieldError(4, 4, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(4, 7, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(4, 9, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To11DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 11);
      handlePhoneFieldError(4, 11, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To12DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 12);
      handlePhoneFieldError(4, 12, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers4To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(4, 13);
      handlePhoneFieldError(4, 13, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 5);
      handlePhoneFieldError(5, 5, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To6DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 6);
      handlePhoneFieldError(5, 6, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(5, 7, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(5, 8, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 9);
      handlePhoneFieldError(5, 9, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 10);
      handlePhoneFieldError(5, 10, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To12DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 12);
      handlePhoneFieldError(5, 12, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 13);
      handlePhoneFieldError(5, 13, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers5To15DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(5, 15);
      handlePhoneFieldError(5, 15, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 6);
      handlePhoneFieldError(6, 6, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To7DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 7);
      handlePhoneFieldError(6, 7, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 8);
      handlePhoneFieldError(6, 8, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(6, 9, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 10);
      handlePhoneFieldError(6, 10, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 13);
      handlePhoneFieldError(6, 13, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers6To17DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(6, 17);
      handlePhoneFieldError(6, 17, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 7);
      handlePhoneFieldError(7, 7, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 8);
      handlePhoneFieldError(7, 8, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(7, 9, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 10);
      handlePhoneFieldError(7, 10, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(7, 11, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers7To13DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(7, 13);
      handlePhoneFieldError(7, 13, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 8);
      handlePhoneFieldError(8, 8, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8To9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 9);
      handlePhoneFieldError(8, 9, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(8, 10, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(8, 11, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers8To12DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(8, 12);
      handlePhoneFieldError(8, 12, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers9DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(9, 9);
      handlePhoneFieldError(9, 9, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers9To10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(9, 10);
      handlePhoneFieldError(9, 10, numberWithoutCode, countryCode);
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
        handlePhoneFieldError(9, 11, numberWithoutCode, countryCode);
      }
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesWithNumbers10DigitsLong.includes(
        countryCode
      )
    ) {
      setPhoneNumberMinAndMaxLength(10, 10);
      handlePhoneFieldError(10, 10, numberWithoutCode, countryCode);
    } else if (
      phoneNumberLengthRanges.countryPhoneCodesUpTo11DigitsLong.includes(countryCode)
    ) {
      setPhoneNumberMinAndMaxLength(1, 11);
      handlePhoneFieldError(1, 11, numberWithoutCode, countryCode);
    }
  };

  const handleSocialsInput = (
    medium: "facebook" | "instagram" | "x",
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const inputNoWhitespaces = e.target.value.replace(/\s/g, "").toLowerCase();
    const isValidLink = Methods.isValidUrl(inputNoWhitespaces.toLowerCase());
    if (medium === "facebook") {
      setFacebook(inputNoWhitespaces.toLowerCase());
      isValidLink || inputNoWhitespaces === ""
        ? setFacebookError("")
        : setFacebookError("Invalid link");
    } else if (medium === "instagram") {
      setInstagram(inputNoWhitespaces.toLowerCase());
      isValidLink || inputNoWhitespaces === ""
        ? setInstagramError("")
        : setInstagramError("Invalid link");
    } else if (medium === "x") {
      setX(inputNoWhitespaces.toLowerCase());
      isValidLink || inputNoWhitespaces === ""
        ? setXError("")
        : setXError("Invalid link");
    }
  };

  const handleUserAboutInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const charLimit = 200;
    const input = e.target.value.replace(/\s+/g, " ");
    setUserAbout(input);
    if (input.trim().length <= charLimit) {
      setUserAboutError("");
    } else {
      setUserAboutError(
        `Maximum ${charLimit} characters allowed (${input.length} characters input)`
      );
    }
  };

  // METHODS TO DELETE THINGS:
  const handleDeletePhoneNumber = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.preventDefault();
    setIsLoading(true);
    Requests.deletePhoneNumber(currentUser)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete phone number. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          fetchAllUsers();
        } else {
          toast("Phone number deleted", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          setPhoneCountry("");
          setPhoneCountryCode("");
          setPhoneNumberWithoutCountryCode("");
          setShowCountryPhoneCodes(false);
          setPhoneNumberMinAndMaxLength(1, 13);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteLocation = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.preventDefault();
    setIsLoading(true);
    Requests.deleteLocation(currentUser)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not delete location. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          fetchAllUsers();
        } else {
          toast("Location deleted", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          setUserCity("");
          setUserState("");
          setUserCountry("");
          setLocationError("");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteSocialMedium = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    medium: "facebook" | "instagram" | "x"
  ) => {
    e.preventDefault();
    setIsLoading(true);
    Requests.deleteSocialMedium(currentUser, medium)
      .then((response) => {
        if (!response.ok) {
          toast.error(
            `Could not delete ${medium.toUpperCase()} link. Please try again.`,
            {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            }
          );
          fetchAllUsers();
        } else {
          toast(`${medium.toUpperCase()} link deleted`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          if (medium === "facebook") {
            setFacebook("");
          } else if (medium === "instagram") {
            setInstagram("");
          } else if (medium === "x") {
            setX("");
          }
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteUserAbout = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.preventDefault();
    setIsLoading(true);
    Requests.deleteUserAbout(currentUser)
      .then((response) => {
        if (!response.ok) {
          toast.error(`Could not delete 'About' section. Please try again.`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          fetchAllUsers();
        } else {
          toast(`'About' section deleted`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          setUserAbout("");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Create array in which certain countries from countries array will be placed on top
  const topCountryNames = ["United States", "Canada", "United Kingdom", "Australia"];
  const preferredCountries = countries.filter((country) =>
    topCountryNames.includes(country.country)
  );
  const restOfCountries = countries.filter(
    (country) => !topCountryNames.includes(country.country)
  );
  const getResortedCountries = (): {
    country: string;
    abbreviation: string;
    phoneCode: string;
  }[] => {
    return preferredCountries.concat(restOfCountries);
  };
  const resortedCountries = getResortedCountries();

  const isLocationError: boolean =
    (userCity === "" && (userState !== "" || userCountry !== "")) ||
    (userState === "" && (userCity !== "" || userCountry !== "")) ||
    (userCountry === "" && (userCity !== "" || userState !== ""));

  const areNoEditFormErrors: boolean =
    firstNameError === "" &&
    lastNameError === "" &&
    usernameError === "" &&
    emailError === "" &&
    passwordError === "" &&
    confirmationPasswordError === "" &&
    phoneNumberError === "" &&
    locationError === "" &&
    facebookError === "" &&
    instagramError === "" &&
    xError === "" &&
    userAboutError === "";

  const userInfoEdited: boolean =
    firstName?.trim() !== currentUser?.firstName ||
    lastName?.trim() !== currentUser?.lastName ||
    emailAddress !== currentUser?.emailAddress ||
    username !== currentUser?.username ||
    password !== currentUser?.password ||
    phoneCountry !== currentUser?.phoneCountry ||
    phoneCountryCode !== currentUser?.phoneCountryCode ||
    phoneNumberWithoutCountryCode !== currentUser?.phoneNumberWithoutCountryCode ||
    userCity !== currentUser?.city ||
    userState !== currentUser?.stateProvince ||
    userCountry !== currentUser?.country ||
    facebook !== currentUser?.facebook ||
    instagram !== currentUser?.instagram ||
    x !== currentUser?.x ||
    userAbout !== currentUser?.about ||
    whoCanAddUserAsOrganizer !== currentUser?.whoCanAddUserAsOrganizer ||
    whoCanInviteUser !== currentUser?.whoCanInviteUser ||
    profileVisibleTo !== currentUser?.profileVisibleTo;

  return (
    <>
      <h2>
        Feel free to change any of your profile info in the form below. Make sure to save
        changes, else they won't apply
      </h2>
      <form className="login-signup-edit-form">
        <div>
          <label>
            <p>First Name:</p>
            <input
              name="firstName"
              id="firstName"
              onFocus={() => setFocusedElement("firstName")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "firstName"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={firstNameRef}
              disabled={isLoading}
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
              name="lastName"
              id="lastName"
              onFocus={() => setFocusedElement("lastName")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "lastName"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={lastNameRef}
              disabled={isLoading}
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
            name="username"
            id="username"
            onFocus={() => setFocusedElement("username")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "username"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            ref={usernameRef}
            disabled={isLoading}
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
            name="email"
            id="email"
            onFocus={() => setFocusedElement("email")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "email"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            ref={emailRef}
            disabled={isLoading}
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
            Phone Number:{" "}
            {(currentUser?.phoneCountry !== "" ||
              currentUser?.phoneCountryCode !== "" ||
              currentUser?.phoneNumberWithoutCountryCode !== "") &&
              !isLoading && (
                <span onClick={(e) => handleDeletePhoneNumber(e)} className="remove-data">
                  Remove
                </span>
              )}
          </p>
          <div className="phone-input-elements">
            <button
              disabled={isLoading}
              className="country-dropdown-button"
              type="button"
              onClick={() => setShowCountryPhoneCodes(!showCountryPhoneCodes)}
            >
              {phoneCountryCode === "" && phoneCountry === "" ? (
                "Select country:"
              ) : (
                <div className="flag-and-code-container">
                  <img
                    src={`/flags/1x1/${
                      countries.filter((country) => country.country === phoneCountry)[0]
                        .abbreviation
                    }.svg`}
                  />
                  <span>{`+${
                    countries.filter((country) => country.country === phoneCountry)[0]
                      .phoneCode
                  }`}</span>
                </div>
              )}
              <i
                style={showCountryPhoneCodes ? { "rotate": "180deg" } : undefined}
                className="fas fa-chevron-down"
              ></i>
            </button>
            <div className="phone-without-country-code-element">
              <input
                name="phoneNumber"
                id="phoneNumber"
                onFocus={() => setFocusedElement("phoneNumber")}
                onBlur={() => setFocusedElement(undefined)}
                style={
                  focusedElement === "phoneNumber"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                ref={phoneNumberRef}
                disabled={isLoading}
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
            <ul className="dropdown-list">
              {resortedCountries.map((country) => (
                <li
                  style={
                    country.country === "United States"
                      ? {
                          "borderBottom": "1px dotted white",
                        }
                      : undefined
                  }
                  key={country.country}
                  onClick={() =>
                    handlePhoneNumberInput(
                      "country-code",
                      undefined,
                      `${country.country} +${country.phoneCode}`
                    )
                  }
                >
                  <img src={`/flags/1x1/${country.abbreviation}.svg`} />
                  <span>{`${country.country} +${country.phoneCode}`}</span>
                </li>
              ))}
            </ul>
          )}
        </label>
        <div className="location-inputs">
          <label className="location-input">
            <p>City:</p>
            <input
              name="city"
              id="city"
              onFocus={() => setFocusedElement("city")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "city"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={cityRef}
              inputMode="text"
              className={isLocationError ? "erroneous-field" : undefined}
              onChange={(e) =>
                handleCityStateCountryInput(
                  { city: userCity, state: userState, country: userCountry },
                  {
                    citySetter: setUserCity,
                    stateSetter: undefined,
                    countrySetter: undefined,
                    errorSetter: setLocationError,
                  },
                  "city",
                  undefined,
                  e
                )
              }
              disabled={isLoading}
              placeholder="Enter a city"
              value={userCity}
            ></input>
            {locationError !== "" && <p>{locationError}</p>}
          </label>
          <label className="location-input">
            <p>State/Province:</p>
            <input
              name="state"
              id="state"
              onFocus={() => setFocusedElement("state")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "state"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={stateRef}
              inputMode="text"
              className={isLocationError ? "erroneous-field" : undefined}
              onChange={(e) =>
                handleCityStateCountryInput(
                  { city: userCity, state: userState, country: userCountry },
                  {
                    citySetter: undefined,
                    stateSetter: setUserState,
                    countrySetter: undefined,
                    errorSetter: setLocationError,
                  },
                  "state",
                  undefined,
                  e
                )
              }
              disabled={isLoading}
              placeholder="Enter a state/province"
              value={userState}
            ></input>
          </label>
          <label className="location-countries-dropdown">
            <p>Country:</p>
            <button
              disabled={isLoading}
              className="country-dropdown-button"
              type="button"
              onClick={() => setShowUserLocationCountries(!showUserLocationCountries)}
            >
              {userCountry === "" ? (
                "Select country:"
              ) : (
                <div className="flag-and-code-container">
                  <img
                    src={`/flags/1x1/${
                      countries.filter((country) => country.country === userCountry)[0]
                        .abbreviation
                    }.svg`}
                  />
                  <span
                    style={
                      userCountry && userCountry.length >= 19
                        ? { fontSize: "0.75rem" }
                        : undefined
                    }
                  >{`${
                    countries.filter((country) => country.country === userCountry)[0]
                      .country
                  }`}</span>
                </div>
              )}
              <i
                style={showUserLocationCountries ? { "rotate": "180deg" } : undefined}
                className="fas fa-chevron-down"
              ></i>
            </button>
            {showUserLocationCountries && (
              <ul className="dropdown-list">
                {resortedCountries.map((country) => (
                  <li
                    style={
                      country.country === "United States"
                        ? {
                            "borderBottom": "1px dotted white",
                          }
                        : undefined
                    }
                    key={country.country}
                    onClick={() =>
                      handleCityStateCountryInput(
                        { city: userCity, state: userState, country: userCountry },
                        {
                          citySetter: undefined,
                          stateSetter: undefined,
                          countrySetter: setUserCountry,
                          errorSetter: setLocationError,
                          showCountriesSetter: setShowUserLocationCountries,
                        },
                        "country",
                        country.country,
                        undefined
                      )
                    }
                  >
                    <img src={`/flags/1x1/${country.abbreviation}.svg`} />
                    <span>{`${country.country}`}</span>
                  </li>
                ))}
              </ul>
            )}
          </label>
          {currentUser?.city !== "" &&
            currentUser?.stateProvince !== "" &&
            currentUser?.country !== "" &&
            !isLoading && (
              <span
                style={
                  !showUserLocationCountries
                    ? {
                        "maxHeight": "73.56px",
                        "display": "flex",
                        "alignItems": "flex-end",
                      }
                    : {
                        "maxHeight": "73.56px",
                        "display": "flex",
                        "alignItems": "flex-end",
                        "marginLeft": "-10rem",
                      }
                }
                onClick={(e) => handleDeleteLocation(e)}
                className="remove-data"
              >
                Remove
              </span>
            )}
        </div>
        <div className="socials-inputs-container">
          <label>
            <p>
              Facebook:{" "}
              {currentUser?.facebook !== "" && !isLoading && (
                <span
                  onClick={(e) => handleDeleteSocialMedium(e, "facebook")}
                  className="remove-data"
                >
                  Remove
                </span>
              )}
            </p>
            <input
              name="facebook"
              id="facebook"
              onFocus={() => setFocusedElement("facebook")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "facebook"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={facebookRef}
              disabled={isLoading}
              type="url"
              value={facebook}
              onChange={(e) => handleSocialsInput("facebook", e)}
              placeholder="Link to Facebook account"
              className={facebookError !== "" ? "erroneous-field" : undefined}
            ></input>
            {facebookError !== "" && <p>{facebookError}</p>}
          </label>
          <label>
            <p>
              Instagram:{" "}
              {currentUser?.instagram !== "" && !isLoading && (
                <span
                  onClick={(e) => handleDeleteSocialMedium(e, "instagram")}
                  className="remove-data"
                >
                  Remove
                </span>
              )}
            </p>
            <input
              name="instagram"
              id="instagram"
              onFocus={() => setFocusedElement("instagram")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "instagram"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={instagramRef}
              disabled={isLoading}
              type="url"
              value={instagram}
              onChange={(e) => handleSocialsInput("instagram", e)}
              placeholder="Link to Instagram account"
              className={instagramError !== "" ? "erroneous-field" : undefined}
            ></input>
            {instagramError !== "" && <p>{instagramError}</p>}
          </label>
          <label>
            <p>
              X:{" "}
              {currentUser?.x !== "" && !isLoading && (
                <span
                  onClick={(e) => handleDeleteSocialMedium(e, "x")}
                  className="remove-data"
                >
                  Remove
                </span>
              )}
            </p>
            <input
              name="x"
              id="x"
              onFocus={() => setFocusedElement("x")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "x"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={xRef}
              disabled={isLoading}
              type="url"
              value={x}
              onChange={(e) => handleSocialsInput("x", e)}
              placeholder="Link to X account"
              className={xError !== "" ? "erroneous-field" : undefined}
            ></input>
            {xError !== "" && <p>{xError}</p>}
          </label>
        </div>
        <label>
          <p>
            About:{" "}
            {currentUser?.about !== "" && !isLoading && (
              <span onClick={(e) => handleDeleteUserAbout(e)} className="remove-data">
                Remove
              </span>
            )}
          </p>
          <textarea
            onFocus={() => setFocusedElement("about")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "about"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            ref={aboutRef}
            disabled={isLoading}
            value={userAbout}
            className={userAboutError !== "" ? "erroneous-field" : undefined}
            onChange={(e) => handleUserAboutInput(e)}
            placeholder="Tell the world a bit about yourself (max 100 characters)"
          ></textarea>
          {userAboutError !== "" && <p>{userAboutError}</p>}
        </label>
        <label>
          <p>
            Password:{" "}
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
              name="password"
              id="password"
              onFocus={() => setFocusedElement("password")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "password"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              ref={passwordRef}
              disabled={isLoading}
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
                name="confirmPassword"
                id="confirmPassword"
                onFocus={() => setFocusedElement("confirmPassword")}
                onBlur={() => setFocusedElement(undefined)}
                style={
                  focusedElement === "confirmPassword" && confirmationPasswordError === ""
                    ? { boxShadow: "0px 0px 10px 2px randomColor", outline: "none" }
                    : undefined
                }
                ref={confirmPasswordRef}
                disabled={isLoading}
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
        <label>
          <p>People who can add you as co-organizer of events:</p>
          <div className="radio-inputs-container">
            <div className="radio-input-and-label">
              <input
                id="anyone-can-add-as-co-organizer"
                onChange={() => setWhoCanAddUserAsOrganizer("anyone")}
                checked={whoCanAddUserAsOrganizer === "anyone"}
                name="who-can-add-as-co-organizer"
                type="radio"
              />
              <span>Anyone</span>
            </div>
            <div className="radio-input-and-label">
              <input
                id="friends-can-add-as-organizer"
                onChange={() => setWhoCanAddUserAsOrganizer("friends")}
                checked={whoCanAddUserAsOrganizer === "friends"}
                name="who-can-add-as-co-organizer"
                type="radio"
              />
              <span>Friends</span>
            </div>
            <div className="radio-input-and-label">
              <input
                id="nobody-can-add-as-co-organizer"
                onChange={() => setWhoCanAddUserAsOrganizer("nobody")}
                checked={whoCanAddUserAsOrganizer === "nobody"}
                name="who-can-add-as-co-organizer"
                type="radio"
              />
              <span>Nobody</span>
            </div>
          </div>
        </label>
        <label>
          <p>People who can invite you to events:</p>
          <div className="radio-inputs-container">
            <div className="radio-input-and-label">
              <input
                id="anyone-can-invite"
                onChange={() => setWhoCanInviteUser("anyone")}
                checked={whoCanInviteUser === "anyone"}
                name="who-can-invite"
                type="radio"
              />
              <span>Anyone</span>
            </div>
            <div className="radio-input-and-label">
              <input
                id="friends-can-invite"
                onChange={() => setWhoCanInviteUser("friends")}
                checked={whoCanInviteUser === "friends"}
                name="who-can-invite"
                type="radio"
              />
              <span>Friends</span>
            </div>
            <div className="radio-input-and-label">
              <input
                id="nobody-can-invite"
                onChange={() => setWhoCanInviteUser("nobody")}
                checked={whoCanInviteUser === "nobody"}
                name="who-can-invite"
                type="radio"
              />
              <span>Nobody</span>
            </div>
          </div>
        </label>
        <label>
          <p>People who can see your profile (besides profiles you block):</p>
          <div className="radio-inputs-container">
            <div className="radio-input-and-label">
              <input
                id="anyone-can-see-profile"
                onChange={() => setProfileVisibleTo("anyone")}
                checked={profileVisibleTo === "anyone"}
                name="who-can-see-profile"
                type="radio"
              />
              <span>Anyone</span>
            </div>
            <div className="radio-input-and-label">
              <input
                onChange={() => setProfileVisibleTo("friends")}
                checked={profileVisibleTo === "friends"}
                name="who-can-see-profile"
                id="friends-can-see-profile"
                type="radio"
              />
              <span>Friends</span>
            </div>
            <div className="radio-input-and-label">
              <input
                onChange={() => setProfileVisibleTo("friends of friends")}
                checked={profileVisibleTo === "friends of friends"}
                name="who-can-see-profile"
                id="friends-of-friends-can-see-profile"
                type="radio"
              />
              <span>Friends of Friends</span>
            </div>
          </div>
        </label>
        <div className="buttons-container">
          <button
            style={
              theme === "dark"
                ? { backgroundColor: "white", color: "black" }
                : { backgroundColor: "black", color: "white" }
            }
            type="reset"
            disabled={!userInfoEdited || isLoading}
            onClick={() => handleEditUserInfoRevert()}
          >
            Revert Changes
          </button>
          <button
            type="submit"
            disabled={!userInfoEdited || isLoading}
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
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
