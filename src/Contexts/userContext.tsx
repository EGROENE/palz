import { createContext, ReactNode, useState, useEffect } from "react";
import { TUserContext, TUser, TUserValuesToUpdate, TEvent } from "../types";
import { useMainContext } from "../Hooks/useMainContext";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import { usernameIsValid, passwordIsValid, emailIsValid } from "../validations";
import Requests from "../requests";
import toast from "react-hot-toast";
import Methods from "../methods";

export const UserContext = createContext<TUserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const { handleWelcomeMessage, setImageIsUploading, setImageIsDeleting } =
    useMainContext();

  const [allUsers, setAllUsers] = useLocalStorage<TUser[]>("allUsers", []);
  const [currentUser, setCurrentUser] = useLocalStorage<TUser | null>(
    "currentUser",
    null
  );
  const [userCreatedAccount, setUserCreatedAccount] = useLocalStorage<boolean | null>(
    "userCreatedAccount",
    null
  );

  const [showUpdateProfileImageInterface, setShowUpdateProfileImageInterface] =
    useState<boolean>(false);
  const [accountDeletionInProgress, setAccountDeletionInProgress] =
    useState<boolean>(false);
  const [showFriendRequestResponseOptions, setShowFriendRequestResponseOptions] =
    useState<boolean>(false);
  const [buttonsAreDisabled, setButtonsAreDisabled] = useState<boolean>(false);

  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(false);
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  /* Some values on currentUser are kept separately from currentUser. These will be compared to values on currentUser when user changes these in Settings to render certain form UI. User can reset these to original values. */
  const [firstName, setFirstName, removeFirstName] = useSessionStorage<
    string | undefined
  >("firstName", "");
  const [lastName, setLastName, removeLastName] = useSessionStorage<string | undefined>(
    "lastName",
    ""
  );
  const [username, setUsername, removeUsername] = useSessionStorage<string | undefined>(
    "username",
    ""
  );
  const [emailAddress, setEmailAddress, removeEmailAddress] = useSessionStorage<
    string | undefined
  >("emailAddress", "");
  const [phoneCountry, setPhoneCountry, removePhoneCountry] = useSessionStorage<
    string | undefined
  >("phoneCountry", "");
  const [phoneCountryCode, setPhoneCountryCode, removePhoneCountryCode] =
    useSessionStorage<string | undefined>("phoneCountryCode", "");
  const [
    phoneNumberWithoutCountryCode,
    setPhoneNumberWithoutCountryCode,
    removePhoneNumberWithoutCountryCode,
  ] = useSessionStorage<string | undefined>("phoneNumberWithoutCountryCode", "");
  const [password, setPassword, removePassword] = useSessionStorage<string | undefined>(
    "password",
    ""
  );
  const [confirmationPassword, setConfirmationPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useSessionStorage<string | unknown>(
    "profileImage",
    currentUser?.profileImage !== "" ? currentUser?.profileImage : ""
  );
  const [userCity, setUserCity, removeUserCity] = useSessionStorage<string | undefined>(
    "city",
    ""
  );
  const [userState, setUserState, removeUserState] = useSessionStorage<
    string | undefined
  >("state", "");
  const [userCountry, setUserCountry, removeUserCountry] = useSessionStorage<
    string | undefined
  >("country", "");
  const [facebook, setFacebook, removeFacebook] = useSessionStorage<string | undefined>(
    "facebook",
    ""
  );
  const [instagram, setInstagram, removeInstagram] = useSessionStorage<
    string | undefined
  >("instagram", "");
  const [x, setX, removeX] = useSessionStorage<string | undefined>("x", "");
  const [userAbout, setUserAbout, removeUserAbout] = useSessionStorage<
    string | undefined
  >("userAbout", "");
  const [whoCanAddUserAsOrganizer, setWhoCanAddUserAsOrganizer] = useSessionStorage<
    "anyone" | "friends" | "nobody" | undefined
  >("whoCanAddUserAsOrganizer", "anyone");
  const [whoCanInviteUser, setWhoCanInviteUser] = useSessionStorage<
    "anyone" | "friends" | "nobody" | undefined
  >("whoCanInviteUser", "anyone");
  const [profileVisibleTo, setProfileVisibleTo] = useSessionStorage<
    "anyone" | "friends" | "friends of friends" | undefined
  >("profileVisibleTo", "anyone");
  const [whoCanMessage, setWhoCanMessage] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanMessage", "anyone");
  /////////////////////////////////////////////////////////////////////////////////

  const [loginMethod, setLoginMethod] = useState<"username" | "email">("username");
  const [showPasswordCriteria, setShowPasswordCriteria] = useState<boolean>(false);
  const [showUsernameCriteria, setShowUsernameCriteria] = useState<boolean>(false);

  // Boolean values relating to input-field errors:
  const [firstNameError, setFirstNameError] = useState<string>(
    "Please fill out this field"
  );
  const [lastNameError, setLastNameError] = useState<string>(
    "Please fill out this field"
  );
  const [usernameError, setUsernameError] = useState<string>(
    "Please fill out this field"
  );
  const [emailError, setEmailError] = useState<string>("Please fill out this field");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>(
    "Please fill out this field"
  );
  const [locationError, setLocationError] = useState<string>("");
  const [confirmationPasswordError, setConfirmationPasswordError] = useState<string>(
    "Please fill out this field"
  );
  const [facebookError, setFacebookError] = useState<string>("");
  const [instagramError, setInstagramError] = useState<string>("");
  const [xError, setXError] = useState<string>("");
  const [userAboutError, setUserAboutError] = useState<string>("");

  const [showErrors, setShowErrors] = useState<boolean>(false);

  const [currentOtherUser, setCurrentOtherUser] = useLocalStorage<TUser | null>(
    "currentOtherUser",
    null
  );

  useEffect(() => {
    fetchAllUsers();
    //setCurrentUser(allUsers.filter((user) => user._id === currentUser?._id)[0]);
  }, [allUsers]);

  const fetchAllUsers = (): Promise<void> => Requests.getAllUsers().then(setAllUsers);

  const userData: TUser = {
    firstName: Methods.formatHyphensAndSpacesInString(
      Methods.formatCapitalizedName(firstName)
    ),
    lastName: Methods.formatHyphensAndSpacesInString(
      Methods.formatCapitalizedName(lastName)
    ),
    username: username?.trim(),
    emailAddress: emailAddress?.trim().toLowerCase(),
    password: password?.trim(),
    hostingCredits: 0,
    city: "",
    stateProvince: "",
    country: "",
    phoneCountry: "",
    phoneCountryCode: "",
    phoneNumberWithoutCountryCode: "",
    instagram: "",
    facebook: "",
    x: "",
    profileImage: "",
    friends: [],
    about: "",
    subscriptionType: "free",
    interests: [],
    whoCanAddUserAsOrganizer: "anyone",
    whoCanInviteUser: "anyone",
    profileVisibleTo: "anyone",
    whoCanMessage: "anyone",
    friendRequestsReceived: [],
    friendRequestsSent: [],
    blockedUsers: [],
  };

  // Called when user switches b/t login & signup forms & when user logs out
  // Only necessary to reset errors for fields on login and/or signup form
  const resetLoginOrSignupFormFieldsAndErrors = (): void => {
    removeFirstName();
    setFirstNameError("Please fill out this field");
    removeLastName();
    setLastNameError("Please fill out this field");
    removeUsername();
    setUsernameError("Please fill out this field");
    removeEmailAddress();
    setEmailError("Please fill out this field");
    removePhoneCountry();
    removePhoneCountryCode();
    removePhoneNumberWithoutCountryCode();
    setPhoneNumberError("");
    removePassword();
    setPasswordError("Please fill out this field");
    setConfirmationPassword("");
    setConfirmationPasswordError("Please fill out this field");
    removeUserCity();
    removeUserState();
    removeUserCountry();
    removeFacebook();
    removeInstagram();
    removeX();
    removeUserAbout();
    setShowErrors(false);
    setShowUsernameCriteria(false);
    setShowPasswordCriteria(false);
    setLoginMethod("username");
  };

  const toggleSignupLogin = (): void => {
    setSignupIsSelected(!signupIsSelected);
    resetLoginOrSignupFormFieldsAndErrors();
  };

  const toggleHidePassword = (): void => setPasswordIsHidden(!passwordIsHidden);

  // Defined here, not in SignupForm, as it's used in some handlers that are used in multiple components
  const areNoSignupFormErrors: boolean =
    firstNameError === "" &&
    lastNameError === "" &&
    usernameError === "" &&
    emailError === "" &&
    passwordError === "" &&
    confirmationPasswordError === "";

  // Input-handling methods:
  // Put here, since used in multiple components
  const handleNameInput = (
    name: string,
    isFirstName: boolean,
    formType: "signup" | "edit-user-info"
  ) => {
    isFirstName
      ? setFirstName(Methods.nameNoSpecialChars(name))
      : setLastName(Methods.nameNoSpecialChars(name));

    if (allSignupFormFieldsFilled && areNoSignupFormErrors && formType === "signup") {
      setCurrentUser(userData);
    } else if (
      !allSignupFormFieldsFilled &&
      !areNoSignupFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(null);
    }

    if (formType === "signup") {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } /* else if (!nameIsValid(name.trim())) {
        isFirstName
          ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
          : setLastNameError("Only alphabetical characters & appropriate punctuation");
      } else if (nameIsValid(name.trim())) {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      } */ else {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      }
    } else {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } /* else if (!nameIsValid(name.trim()) && name.trim() !== "") {
        isFirstName
          ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
          : setLastNameError("Only alphabetical characters & appropriate punctuation");
      } */ else {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      }
    }
  };

  const handleUsernameInput = (
    inputUsername: string,
    formType: "signup" | "edit-user-info"
  ): void => {
    if (inputUsername.length <= 20 && usernameIsValid(inputUsername)) {
      setUsername(inputUsername);
    }

    if (allSignupFormFieldsFilled && areNoSignupFormErrors && formType === "signup") {
      setCurrentUser(userData);
    } else if (
      !allSignupFormFieldsFilled &&
      !areNoSignupFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(null);
    }

    /* Get most-current version of allUsers (in case another user has changed their username, so username user inputs may become available or in available. Fetching allUsers onChange of username field ensures most-current data on users exists. This is also checked onSubmit of EditUserInfoForm.) */
    fetchAllUsers();

    const usernameIsTaken: boolean =
      allUsers.filter((user) => user.username === inputUsername).length > 0;

    if (formType === "signup") {
      if (usernameIsTaken) {
        setUsernameError("Username is already taken");
      } else if (!inputUsername.length) {
        setUsernameError("Please fill out this field");
      } else if (inputUsername.length < 4) {
        setUsernameError(
          "Username must be 4-20 characters long & may only contain alphanumeric characters"
        );
      } else {
        setUsernameError("");
      }
    } else {
      if (usernameIsTaken && inputUsername !== currentUser?.username) {
        setUsernameError("Username is already taken");
      } else if (inputUsername.length < 4) {
        setUsernameError(
          "Username must be 4-20 characters long & may only contain alphanumeric characters"
        );
      } else {
        setUsernameError("");
      }
    }

    if (inputUsername.toLowerCase() === "undefined") {
      console.log(1);
      setUsernameError("Invalid username");
    }
  };

  const handleEmailAddressInput = (
    inputEmailAddress: string,
    formType: "signup" | "edit-user-info"
  ): void => {
    const inputEmailAddressNoWhitespaces = inputEmailAddress.replace(/\s/g, "");

    setEmailAddress(inputEmailAddressNoWhitespaces.toLowerCase());

    if (allSignupFormFieldsFilled && areNoSignupFormErrors && formType === "signup") {
      setCurrentUser(userData);
    } else if (
      !allSignupFormFieldsFilled &&
      !areNoSignupFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(null);
    }

    /* Get most-current version of allUsers (in case another user has changed their email, so email user inputs may become available or in available. Fetching allUsers onChange of email field ensures most-current data on users exists. This is also checked onSubmit of EditUserInfoForm.) */
    fetchAllUsers();

    const emailIsTaken: boolean =
      allUsers.filter(
        (user) => user.emailAddress === inputEmailAddressNoWhitespaces.toLowerCase()
      ).length > 0;

    if (formType === "signup") {
      if (emailIsTaken) {
        setEmailError("E-mail address is taken");
      } else if (!inputEmailAddressNoWhitespaces.length) {
        setEmailError("Please fill out this field");
      } else if (
        !emailIsValid(inputEmailAddressNoWhitespaces.toLowerCase()) &&
        inputEmailAddressNoWhitespaces !== ""
      ) {
        setEmailError("Invalid e-mail address");
      } else {
        setEmailError("");
      }
    } else {
      if (inputEmailAddressNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      } else if (
        emailIsTaken &&
        inputEmailAddressNoWhitespaces.toLowerCase() !== currentUser?.emailAddress
      ) {
        setEmailError("E-mail address is taken");
      } else if (
        !emailIsValid(inputEmailAddressNoWhitespaces.toLowerCase()) &&
        inputEmailAddressNoWhitespaces !== ""
      ) {
        setEmailError("Invalid e-mail address");
      } else {
        setEmailError("");
      }
    }
  };

  const handlePasswordInput = (
    inputPassword: string,
    formType: "login" | "signup" | "edit-user-info"
  ): void => {
    setPassword(inputPassword.replace(/\s+/g, ""));

    /* Use inputPassword w/ no whitespaces in logic checks below, as it is more current that the state value 'password', which may lag behind, causing logic checks to be inaccurate */
    const inputPWNoWhitespaces = inputPassword.replace(/\s/g, "");

    // Handle input pw on login form:
    if (formType === "login") {
      // Get current user (if username/email has been entered) so that its password can be compared to input pw:
      const currentUser: TUser =
        loginMethod === "username"
          ? allUsers.filter((user) => user.username === username)[0]
          : allUsers.filter((user) => user.emailAddress === emailAddress)[0];

      // If currentUser exists & there is non-whitespace input in password field:
      if (currentUser) {
        // If input pw is empty string...
        if (inputPWNoWhitespaces === "") {
          setPasswordError("Please fill out this field");
          // If input pw isn't empty string & is unequal to current user's pw, and input pw isn't empty string...
        } else if (
          currentUser.password !== inputPWNoWhitespaces &&
          inputPWNoWhitespaces !== ""
        ) {
          setPasswordError("Password doesn't match user");
          // If input pw simply isn't valid...
        } else if (!passwordIsValid(inputPWNoWhitespaces)) {
          setPasswordError("Invalid password");
          // If no error conditions are true, remove error message...
        } else {
          setPasswordError("");
        }
      }

      // If user enters password w/o first having input username or email (can only check for validity)...
      if (!currentUser) {
        !passwordIsValid(inputPWNoWhitespaces)
          ? setPasswordError("Invalid password")
          : setPasswordError("");
      }
      // Handle input pw on edit-user-info form:
    } else if (formType === "edit-user-info") {
      if (inputPWNoWhitespaces !== "") {
        if (
          confirmationPassword === "" &&
          inputPWNoWhitespaces !== currentUser?.password
        ) {
          setConfirmationPasswordError("Please confirm new password");
        }

        // If pw isn't/is valid...
        if (!passwordIsValid(inputPWNoWhitespaces)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }

        // If confirmationPassword has at least 1 char & is not equal to pw input...
        if (
          confirmationPassword !== "" &&
          inputPWNoWhitespaces !== confirmationPassword
        ) {
          setConfirmationPasswordError("Passwords don't match");
        }

        // If input pw matches confirmation pw (which contains at least 1 char)...
        if (
          inputPWNoWhitespaces === confirmationPassword &&
          confirmationPassword !== ""
        ) {
          setConfirmationPasswordError("");
        }
      } else {
        setPasswordError("Please fill out this field");
      }
      // If used on signup form:
    } else if (formType === "signup") {
      allSignupFormFieldsFilled && areNoSignupFormErrors
        ? setCurrentUser(userData)
        : setCurrentUser(null);

      if (inputPWNoWhitespaces !== "") {
        // If pw isn't/is valid...
        if (!passwordIsValid(inputPWNoWhitespaces)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }

        // If confirmationPassword has at least 1 char & is not equal to pw input...
        if (
          confirmationPassword !== "" &&
          inputPWNoWhitespaces !== confirmationPassword
        ) {
          setConfirmationPasswordError("Passwords don't match");
        }

        // If input pw matches confirmation pw (which contains at least 1 char)...
        if (
          inputPWNoWhitespaces === confirmationPassword &&
          confirmationPassword !== ""
        ) {
          setConfirmationPasswordError("");
        }
      } else {
        setPasswordError("Please fill out this field");
      }
    }
  };

  const handleConfirmationPasswordInput = (
    inputConfirmationPassword: string,
    formType: "login" | "signup" | "edit-user-info"
  ): void => {
    const inputConfirmationPWNoWhitespaces = inputConfirmationPassword.replace(/\s/g, "");

    setConfirmationPassword(inputConfirmationPWNoWhitespaces);

    /* Condition to set currentUser should be all other errors === "" && allSignupFormFieldsFilled && (confirmationPasswordError === "Passwords don't match" | confirmationPasswordError === ""), b/c, in this handler, setting of this error state value lags. */
    if (formType === "signup") {
      if (
        allSignupFormFieldsFilled &&
        firstNameError === "" &&
        lastNameError === "" &&
        usernameError === "" &&
        emailError === "" &&
        passwordError === "" &&
        (confirmationPasswordError === "Passwords don't match" ||
          confirmationPasswordError === "")
      ) {
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    }

    inputConfirmationPWNoWhitespaces !== password &&
    inputConfirmationPWNoWhitespaces !== "" &&
    password !== ""
      ? setConfirmationPasswordError("Passwords don't match")
      : setConfirmationPasswordError("");
  };

  // This method is used on login form, where user can input either their username or email to log in
  const handleUsernameOrEmailInput = (input: string): void => {
    const inputNoWhitespaces = input.replace(/\s/g, "");
    fetchAllUsers();

    const usernameExists: boolean = allUsers
      .map((user) => user.username)
      .includes(inputNoWhitespaces);
    const emailExists: boolean = allUsers
      .map((user) => user.emailAddress)
      .includes(inputNoWhitespaces.toLowerCase());

    // If input matches pattern for an email:
    if (emailIsValid(inputNoWhitespaces.toLowerCase())) {
      const currentUser = allUsers.filter(
        (user) => user.emailAddress === inputNoWhitespaces
      )[0];
      setCurrentUser(currentUser);
      setUsername("");
      setUsernameError("");
      setLoginMethod("email");
      if (inputNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      }
      setEmailAddress(inputNoWhitespaces);
      // If email address isn't in database & field isn't empty string:
      if (!emailExists && inputNoWhitespaces !== "") {
        setEmailError("E-mail address not recognized");
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
        // If email is recognized...
      } else {
        setEmailError("");
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and password field isn't empty string...
        } else if (currentUser?.password !== password && password !== "") {
          setPasswordError("Password doesn't match user");
        } else {
          setPasswordError("");
        }
      }
      // When user input is not an email address (aka, it's a username):
    } else {
      const currentUser = allUsers.filter((user) => user.username === input)[0];
      setCurrentUser(currentUser);
      setEmailAddress("");
      setEmailError("");
      setLoginMethod("username");
      setUsername(inputNoWhitespaces);
      if (inputNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      }
      // If username doesn't exist & its field contains at least 1 character:
      if (!usernameExists && inputNoWhitespaces !== "") {
        setUsernameError("Data not recognized");
        // If pw isn't valid & isn't empty string...
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
        // If username is recognized & at least 1 character has been input...
      } else {
        setUsernameError("");
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and pw field isn't empty string...
        } else if (currentUser && currentUser.password !== password && password !== "") {
          setPasswordError("Password doesn't match user");
        } else {
          setPasswordError("");
        }
      }
    }
  };

  const handleCityStateCountryInput = (
    stateValues: {
      city: string | undefined;
      state: string | undefined;
      country: string | undefined;
    },
    setters: {
      citySetter?: (value: React.SetStateAction<string | undefined>) => void;
      stateSetter?: (value: React.SetStateAction<string | undefined>) => void;
      countrySetter?: (value: React.SetStateAction<string | undefined>) => void;
      errorSetter: (value: React.SetStateAction<string>) => void;
      showCountriesSetter?: (value: React.SetStateAction<boolean>) => void;
    },
    locationType: "city" | "state" | "country",
    country?: string,
    e?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    // Set appropriate state values based on field in question
    // Throw error when a location field is filled out and at least one other is not. Otherwise, no error thrown.
    if (e) {
      if (locationType === "city") {
        if (setters.citySetter) {
          setters.citySetter(Methods.nameNoSpecialChars(e.target.value));
        }
        if (
          (e.target.value !== "" &&
            (stateValues.state === "" || stateValues.country === "")) ||
          (e.target.value === "" &&
            (stateValues.state !== "" || stateValues.country !== ""))
        ) {
          setters.errorSetter("Please fill out all 3 location fields");
        } else {
          setters.errorSetter("");
        }
      } else if (locationType === "state") {
        if (setters.stateSetter) {
          setters.stateSetter(Methods.nameNoSpecialChars(e.target.value));
        }
        if (
          (e.target.value !== "" &&
            (stateValues.city === "" || stateValues.country === "")) ||
          (e.target.value === "" &&
            (stateValues.city !== "" || stateValues.country !== ""))
        ) {
          setters.errorSetter("Please fill out all 3 location fields");
        } else {
          setters.errorSetter("");
        }
      }
    } else {
      if (setters.showCountriesSetter) {
        setters.showCountriesSetter(true); // Hide countries dropdown once one is selected (not sure why true is necessary)
      }
      if (setters.countrySetter) {
        setters.countrySetter(country);
      }
      if (
        country &&
        country !== "" &&
        (stateValues.city === "" || stateValues.state === "")
      ) {
        setters.errorSetter("Please fill out all 3 location fields");
      } else {
        setters.errorSetter("");
      }
    }
  };

  // Handler for creating new user account. Should make request w/ object containing user data, then handle errors in case it fails. If it fails, notify user somehow.
  const handleNewAccountCreation = (userData: TUser) => {
    Requests.createUser(userData)
      .then((response) => {
        if (!response.ok) {
          setUserCreatedAccount(false);
        } else {
          setUserCreatedAccount(true);
        }
      })
      .catch((error) => {
        toast.error("Could not create account. Please try again later.");
        console.log(error);
      });
  };

  // maybe create separate request to update user profile img
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();
    setImageIsUploading(true);
    setShowUpdateProfileImageInterface(false);
    const file = e.target.files && e.target.files[0];
    const base64 = file && (await Methods.convertToBase64(file));
    Requests.updateUserProfileImage(currentUser, base64)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 413) {
            toast.error("Max file size is 50MB.");
          } else {
            toast.error("Could not update profile image. Please try again.");
          }
        } else {
          toast.success("Profile image updated");
          setProfileImage(base64);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setImageIsUploading(false));
  };

  const removeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setImageIsDeleting(true);
    setShowUpdateProfileImageInterface(false);
    Requests.updateUserProfileImage(currentUser, "")
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not remove profile image. Please try again.");
        } else {
          toast.error("Profile image removed");
          setProfileImage("");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setImageIsDeleting(false));
  };

  const handleSendFriendRequest = (
    sender: TUser | undefined,
    recipient: TUser,
    setCurrentUserSentFriendRequest?: React.Dispatch<React.SetStateAction<boolean>>
  ): void => {
    if (setCurrentUserSentFriendRequest) {
      setCurrentUserSentFriendRequest(true);
    }
    setButtonsAreDisabled(true);

    let isRequestError = false;

    const promisesToAwait =
      sender && sender._id && recipient._id
        ? [
            Requests.addToFriendRequestsReceived(sender?._id, recipient),
            Requests.addToFriendRequestsSent(sender, recipient._id),
          ]
        : undefined;

    if (promisesToAwait) {
      Promise.all(promisesToAwait)
        .then(() => {
          for (const promise of promisesToAwait) {
            promise.then((response) => {
              if (!response.ok) {
                isRequestError = true;
              }
            });
          }
        })
        .then(() => {
          if (isRequestError) {
            if (setCurrentUserSentFriendRequest) {
              setCurrentUserSentFriendRequest(false);
            }
            toast.error("Couldn't send request. Please try again.");
          } else {
            toast.success("Friend request sent!");
            if (setCurrentUserSentFriendRequest) {
              setCurrentUserSentFriendRequest(true);
            }
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setButtonsAreDisabled(false));
    }
  };

  const handleRetractFriendRequest = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    sender: TUser,
    recipient: TUser,
    setCurrentUserSentFriendRequest?: React.Dispatch<React.SetStateAction<boolean>>,
    usersToWhomCurrentUserSentRequest?: TUser[],
    setUsersToWhomCurrentUserSentRequest?: React.Dispatch<React.SetStateAction<TUser[]>>
  ): void => {
    e.preventDefault();

    setButtonsAreDisabled(true);

    if (setCurrentUserSentFriendRequest) {
      setCurrentUserSentFriendRequest(false);
    }

    if (setUsersToWhomCurrentUserSentRequest && usersToWhomCurrentUserSentRequest) {
      setUsersToWhomCurrentUserSentRequest(
        usersToWhomCurrentUserSentRequest.filter((user) => user._id !== recipient._id)
      );
    }

    if (sender && sender._id) {
      Requests.removeFromFriendRequestsReceived(sender?._id, recipient)
        .then((response) => {
          if (!response.ok) {
            if (setCurrentUserSentFriendRequest) {
              setCurrentUserSentFriendRequest(true);
              if (
                setUsersToWhomCurrentUserSentRequest &&
                usersToWhomCurrentUserSentRequest
              ) {
                setUsersToWhomCurrentUserSentRequest(usersToWhomCurrentUserSentRequest);
              }
            }
            toast.error("Could not retract request. Please try again.");
          } else {
            if (sender && recipient._id) {
              Requests.removeFromFriendRequestsSent(sender, recipient._id)
                .then((response) => {
                  if (!response.ok) {
                    if (setCurrentUserSentFriendRequest) {
                      setCurrentUserSentFriendRequest(true);
                    }
                    if (
                      setUsersToWhomCurrentUserSentRequest &&
                      usersToWhomCurrentUserSentRequest
                    ) {
                      setUsersToWhomCurrentUserSentRequest(
                        usersToWhomCurrentUserSentRequest
                      );
                    }
                    toast.error("Could not retract request. Please try again.");
                  } else {
                    toast.error("Friend request retracted");
                    if (setCurrentUserSentFriendRequest) {
                      setCurrentUserSentFriendRequest(false);
                    }
                  }
                })
                .catch((error) => console.log(error));
            }
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setButtonsAreDisabled(false));
    }
  };

  const handleAcceptFriendRequest = (
    e: React.ChangeEvent<HTMLInputElement>,
    sender: TUser,
    receiver: TUser,
    usersWhoSentCurrentUserARequest?: TUser[],
    setUsersWhoSentCurrentUserARequest?: React.Dispatch<React.SetStateAction<TUser[]>>,
    displayedUsers?: TUser[],
    setDisplayedUsers?: React.Dispatch<React.SetStateAction<TUser[]>>
  ): void => {
    e.preventDefault();
    setButtonsAreDisabled(true);

    if (showFriendRequestResponseOptions) {
      setShowFriendRequestResponseOptions(false);
    }

    if (setUsersWhoSentCurrentUserARequest && usersWhoSentCurrentUserARequest) {
      setUsersWhoSentCurrentUserARequest(
        usersWhoSentCurrentUserARequest.filter((user) => user._id !== sender._id)
      );
    }

    if (displayedUsers && setDisplayedUsers) {
      setDisplayedUsers(displayedUsers.filter((user) => user._id !== sender._id));
    }

    if (sender && sender._id) {
      Requests.addFriendToFriendsArray(receiver, sender._id).then((response) => {
        if (!response.ok) {
          toast.error("Could not accept friend request. Please try again.");
          if (setUsersWhoSentCurrentUserARequest && usersWhoSentCurrentUserARequest) {
            setUsersWhoSentCurrentUserARequest(usersWhoSentCurrentUserARequest);
          }
          if (displayedUsers && setDisplayedUsers) {
            setDisplayedUsers(displayedUsers);
          }
        } else {
          if (sender && sender._id) {
            Requests.removeFromFriendRequestsReceived(sender._id, receiver)
              .then((response) => {
                if (!response.ok) {
                  toast.error("Could not accept friend request. Please try again.");
                  if (
                    setUsersWhoSentCurrentUserARequest &&
                    usersWhoSentCurrentUserARequest
                  ) {
                    setUsersWhoSentCurrentUserARequest(usersWhoSentCurrentUserARequest);
                  }
                  if (displayedUsers && setDisplayedUsers) {
                    setDisplayedUsers(displayedUsers);
                  }
                } else {
                  if (receiver && receiver._id) {
                    Requests.addFriendToFriendsArray(sender, receiver._id).then(
                      (response) => {
                        if (!response.ok) {
                          toast.error(
                            "Could not accept friend request. Please try again."
                          );
                          if (
                            setUsersWhoSentCurrentUserARequest &&
                            usersWhoSentCurrentUserARequest
                          ) {
                            setUsersWhoSentCurrentUserARequest(
                              usersWhoSentCurrentUserARequest
                            );
                          }
                          if (displayedUsers && setDisplayedUsers) {
                            setDisplayedUsers(displayedUsers);
                          }
                        } else {
                          if (receiver && receiver._id) {
                            Requests.removeFromFriendRequestsSent(
                              sender,
                              receiver._id
                            ).then((response) => {
                              if (!response.ok) {
                                toast.error(
                                  "Could not accept friend request. Please try again."
                                );
                                if (
                                  setUsersWhoSentCurrentUserARequest &&
                                  usersWhoSentCurrentUserARequest
                                ) {
                                  setUsersWhoSentCurrentUserARequest(
                                    usersWhoSentCurrentUserARequest
                                  );
                                }
                                if (displayedUsers && setDisplayedUsers) {
                                  setDisplayedUsers(displayedUsers);
                                }
                              } else {
                                toast.success(
                                  `You are now friends with ${sender.firstName} ${sender.lastName}!`
                                );
                              }
                            });
                          }
                        }
                      }
                    );
                  }
                }
              })
              .catch((error) => console.log(error))
              .finally(() => setButtonsAreDisabled(false));
          }
        }
      });
    }
  };

  const handleRejectFriendRequest = (
    e: React.ChangeEvent<HTMLInputElement>,
    sender: TUser,
    receiver: TUser,
    usersWhoSentCurrentUserARequest?: TUser[],
    setUsersWhoSentCurrentUserARequest?: React.Dispatch<React.SetStateAction<TUser[]>>,
    setCurrentUserReceivedFriendRequest?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();

    setButtonsAreDisabled(true);

    if (showFriendRequestResponseOptions) {
      setShowFriendRequestResponseOptions(false);
    }

    if (setCurrentUserReceivedFriendRequest) {
      setCurrentUserReceivedFriendRequest(false);
    }

    if (setUsersWhoSentCurrentUserARequest && usersWhoSentCurrentUserARequest) {
      setUsersWhoSentCurrentUserARequest(
        usersWhoSentCurrentUserARequest.filter((user) => user._id !== sender._id)
      );
    }

    if (sender && sender._id) {
      Requests.removeFromFriendRequestsReceived(sender._id, receiver)
        .then((response) => {
          if (!response.ok) {
            toast.error("Could not reject friend request. Please try again.");
            if (setUsersWhoSentCurrentUserARequest && usersWhoSentCurrentUserARequest) {
              setUsersWhoSentCurrentUserARequest(usersWhoSentCurrentUserARequest);
            }
            if (setCurrentUserReceivedFriendRequest) {
              setCurrentUserReceivedFriendRequest(true);
            }
          } else {
            if (receiver && receiver._id) {
              Requests.removeFromFriendRequestsSent(sender, receiver._id).then(
                (response) => {
                  if (!response.ok) {
                    toast.error("Could not reject friend request. Please try again.");
                    if (
                      setUsersWhoSentCurrentUserARequest &&
                      usersWhoSentCurrentUserARequest
                    ) {
                      setUsersWhoSentCurrentUserARequest(usersWhoSentCurrentUserARequest);
                    }
                    if (setCurrentUserReceivedFriendRequest) {
                      setCurrentUserReceivedFriendRequest(true);
                    }
                  } else {
                    toast.error(
                      `Rejected friend request from ${sender.firstName} ${sender.lastName}.`
                    );
                  }
                }
              );
            }
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setButtonsAreDisabled(false));
    }
  };

  const handleUnfriending = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user: TUser,
    friend: TUser,
    displayedUsers?: (TUser | TEvent)[],
    setDisplayedUsers?: React.Dispatch<React.SetStateAction<(TUser | TEvent)[]>>
  ): void => {
    e.preventDefault();

    if (displayedUsers && setDisplayedUsers) {
      setDisplayedUsers(displayedUsers.filter((user) => user._id !== friend._id));
    }

    const removeUserFromFriendsFriendsArray = friend._id
      ? Requests.deleteFriendFromFriendsArray(user, friend._id)
      : undefined;

    const removeFriendFromUserFriendsArray = user._id
      ? Requests.deleteFriendFromFriendsArray(friend, user._id)
      : undefined;

    const promisesToAwait =
      removeUserFromFriendsFriendsArray && removeFriendFromUserFriendsArray
        ? [removeUserFromFriendsFriendsArray, removeFriendFromUserFriendsArray]
        : undefined;

    let allRequestsAreOK = true;

    if (promisesToAwait) {
      setButtonsAreDisabled(true);
      Promise.all(promisesToAwait)
        .then(() => {
          for (const promise of promisesToAwait) {
            promise.then((response) => {
              if (!response.ok) {
                allRequestsAreOK = false;
                if (displayedUsers && setDisplayedUsers) {
                  setDisplayedUsers(displayedUsers);
                }
              }
            });
          }
        })
        .then(() => {
          if (!allRequestsAreOK) {
            toast.error(
              `Couldn't unfriend ${friend.firstName} ${friend.lastName}. Please try again.`
            );
            if (displayedUsers && setDisplayedUsers) {
              setDisplayedUsers(displayedUsers);
            }
          } else {
            toast.error(`You have unfriended ${friend.firstName} ${friend.lastName}.`);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setButtonsAreDisabled(false));
    }
  };

  // Defined here, as it's used in methods that are used in multiple components
  const allSignupFormFieldsFilled: boolean =
    firstName !== "" &&
    lastName !== "" &&
    username !== "" &&
    emailAddress !== "" &&
    password !== "" &&
    confirmationPassword !== "";

  const areNoLoginErrors: boolean =
    usernameError === "" && emailError === "" && passwordError === "";

  const allLoginInputsFilled: boolean =
    (username !== "" || emailAddress !== "") && password !== "";

  // If a data point is updated, it is used in PATCH request to update its part of the user's data object in DB
  const valuesToUpdate: TUserValuesToUpdate = {
    ...(firstName?.trim() !== "" &&
      firstName !== currentUser?.firstName && {
        firstName: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(firstName?.trim())
        ),
      }),
    ...(lastName?.trim() !== "" &&
      lastName !== currentUser?.lastName && {
        lastName: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(lastName?.trim())
        ),
      }),
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
    ...(userCity !== "" &&
      userCity !== currentUser?.city && {
        city: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(userCity?.trim())
        ),
      }),
    ...(userState !== "" &&
      userState !== currentUser?.stateProvince && {
        stateProvince: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(userState?.trim())
        ),
      }),
    ...(userCountry !== "" &&
      userCountry !== currentUser?.country && { country: userCountry }),
    ...(facebook !== currentUser?.facebook && { facebook: facebook }),
    ...(instagram !== currentUser?.instagram && { instagram: instagram }),
    ...(x !== currentUser?.x && { x: x }),
    ...(userAbout !== currentUser?.about && { about: userAbout?.trim() }),
    ...(whoCanAddUserAsOrganizer !== currentUser?.whoCanAddUserAsOrganizer && {
      whoCanAddUserAsOrganizer: whoCanAddUserAsOrganizer,
    }),
    ...(whoCanInviteUser !== currentUser?.whoCanInviteUser && {
      whoCanInviteUser: whoCanInviteUser,
    }),
    ...(profileVisibleTo !== currentUser?.profileVisibleTo && {
      profileVisibleTo: profileVisibleTo,
    }),
    ...(whoCanMessage !== currentUser?.whoCanMessage && {
      whoCanMessage: whoCanMessage,
    }),
  };

  const handleSignupOrLoginFormSubmission = (
    isOnSignup: boolean,
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    handleWelcomeMessage();
    // If user had pw visible when logging in/signing up, hide it again, so it's hidden by default on edit-user-info form in Settings
    if (!passwordIsHidden) {
      toggleHidePassword();
    }
    if (isOnSignup) {
      handleNewAccountCreation(userData);
      setUserCreatedAccount(true);
      setCurrentUser(userData);
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setUsername(userData.username);
      setProfileImage(userData.profileImage);
      setEmailAddress(userData.emailAddress);
      setPassword(userData.password);
      setPhoneCountry(userData.phoneCountry);
      setPhoneCountryCode(userData.phoneCountryCode);
      setPhoneNumberWithoutCountryCode(userData.phoneNumberWithoutCountryCode);
      setUserCity(userData.city);
      setUserState(userData.stateProvince);
      setUserCountry(userData.country);
      setFacebook(userData.facebook);
      setInstagram(userData.instagram);
      setX(userData.x);
      setUserAbout(userData.about);
    } else {
      setUserCreatedAccount(false);
      if (emailAddress !== "") {
        setCurrentUser(allUsers.filter((user) => user.emailAddress === emailAddress)[0]);
      } else if (username !== "") {
        setCurrentUser(allUsers.filter((user) => user.username === username)[0]);
      }
      setFirstName(currentUser?.firstName);
      setLastName(currentUser?.lastName);
      setUsername(currentUser?.username);
      setProfileImage(currentUser?.profileImage);
      setEmailAddress(currentUser?.emailAddress);
      setPassword(currentUser?.password);
      setPhoneCountry(currentUser?.phoneCountry);
      setPhoneCountryCode(currentUser?.phoneCountryCode);
      setPhoneNumberWithoutCountryCode(currentUser?.phoneNumberWithoutCountryCode);
      setUserCity(currentUser?.city);
      setUserState(currentUser?.stateProvince);
      setUserCountry(currentUser?.country);
      setFacebook(currentUser?.facebook);
      setInstagram(currentUser?.instagram);
      setX(currentUser?.x);
      setUserAbout(currentUser?.about);
    }
    setFirstNameError("");
    setLastNameError("");
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmationPasswordError("");
  };

  const handleFormRejection = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    window.alert(
      "Please ensure all fields have been filled out & fix any form errors. If everything looks right to you, re-enter the info try again."
    );
    setShowErrors(true);
  };

  const logout = (): void => {
    setUserCreatedAccount(null);
    setCurrentUser(null);
    setCurrentOtherUser(null);
    resetLoginOrSignupFormFieldsAndErrors();
    setProfileImage("");
  };

  const userContextValues: TUserContext = {
    whoCanMessage,
    setWhoCanMessage,
    currentOtherUser,
    setCurrentOtherUser,
    buttonsAreDisabled,
    setButtonsAreDisabled,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleSendFriendRequest,
    handleRetractFriendRequest,
    handleUnfriending,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    accountDeletionInProgress,
    setAccountDeletionInProgress,
    removeProfileImage,
    valuesToUpdate,
    handleProfileImageUpload,
    profileImage,
    setProfileImage,
    handleCityStateCountryInput,
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
    phoneCountry,
    setPhoneCountry,
    phoneCountryCode,
    setPhoneCountryCode,
    phoneNumberWithoutCountryCode,
    setPhoneNumberWithoutCountryCode,
    phoneNumberError,
    setPhoneNumberError,
    resetLoginOrSignupFormFieldsAndErrors,
    logout,
    loginMethod,
    signupIsSelected,
    setSignupIsSelected,
    passwordIsHidden,
    setPasswordIsHidden,
    toggleSignupLogin,
    toggleHidePassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    firstNameError,
    setFirstNameError,
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
    setConfirmationPassword,
    confirmationPasswordError,
    setConfirmationPasswordError,
    userCity,
    setUserCity,
    userState,
    setUserState,
    userCountry,
    setUserCountry,
    areNoSignupFormErrors,
    areNoLoginErrors,
    allSignupFormFieldsFilled,
    allLoginInputsFilled,
    showErrors,
    handleNameInput,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    handleConfirmationPasswordInput,
    handleUsernameOrEmailInput,
    handleSignupOrLoginFormSubmission,
    handleFormRejection,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
    locationError,
    setLocationError,
    userAbout,
    setUserAbout,
    userAboutError,
    setUserAboutError,
    whoCanAddUserAsOrganizer,
    setWhoCanAddUserAsOrganizer,
    whoCanInviteUser,
    setWhoCanInviteUser,
    profileVisibleTo,
    setProfileVisibleTo,
    showUpdateProfileImageInterface,
    setShowUpdateProfileImageInterface,
    fetchAllUsers,
    allUsers,
    currentUser,
    setCurrentUser,
    userCreatedAccount,
    setUserCreatedAccount,
  };

  return (
    <UserContext.Provider value={userContextValues}>{children}</UserContext.Provider>
  );
};
