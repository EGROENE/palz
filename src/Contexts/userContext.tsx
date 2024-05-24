import { createContext, ReactNode, useState } from "react";
import { TUserContext, TUser } from "../types";
import { useMainContext } from "../Hooks/useMainContext";
import { useSessionStorage } from "usehooks-ts";
import {
  nameIsValid,
  usernameIsValid,
  passwordIsValid,
  emailIsValid,
} from "../validations";
import Requests from "../requests";
import toast from "react-hot-toast";

export const UserContext = createContext<TUserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const {
    removeCurrentUser,
    setUserCreatedAccount,
    allUsers,
    currentUser,
    setCurrentUser,
    handleWelcomeMessage,
    fetchAllUsers,
  } = useMainContext();

  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(false);
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  /* Some values kept in session storage so that they can be used to autofill fields on edit-user-info form. Due to input handler functions setting these & not currentUser._____, currentUser.______ isn't used to do so, but will rather be set when user saves changes to their data object in the DB by submitting the edit-user-info form & allUsers is refetched. */

  /* USAGE: Each of these will need to:
  1. be set to existing currentUser data in handleSignupOrLoginFormSubmission, whether logging in or signing up
  2. exported in values from this context; set in handleUpdateProfileInfo if value changed on edit form 
  3. in handleEditUserInfoRevert, set to corresponding currentUser data point, and its error message reset, if applicable 
  4. reckoned with inside userInfoEdited
  5. added to valuesToUpdate
  6. be used in any appropriate handler functions
  7. added to body inside patchUpdatedUserInfo */
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
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const getCapitalizedWord = (word: string | undefined): string => {
    const wordLetters = word?.split("");
    const firstLetterCapitalized = wordLetters ? wordLetters[0]?.toUpperCase() : "";
    const otherLettersJoined = wordLetters?.slice(1).join("").toLowerCase();

    return firstLetterCapitalized + otherLettersJoined;
  };

  const formatName = (string: string | undefined): string => {
    let formattedWordOrWords = "";

    if (string !== "") {
      if (string?.includes("-")) {
        const stringWords: string[] = string.split(/[\s-]+/);
        for (const word of stringWords) {
          const trimmedWord = word.trim();
          const capitalizedWord = getCapitalizedWord(trimmedWord);
          // If char before/after word in original string is hyphen, separator should be "-"; else, " ":
          const stringNoMultiSpacesSplitBySpaces = string.replace(/\s+/g, " ").split(" ");
          const indexOfWordInStringNoMultiSpacesSplitBySpaces =
            stringNoMultiSpacesSplitBySpaces.indexOf(word);
          const prevItemIndex = indexOfWordInStringNoMultiSpacesSplitBySpaces - 1;
          const nextItemIndex = indexOfWordInStringNoMultiSpacesSplitBySpaces + 1;
          const separator =
            stringNoMultiSpacesSplitBySpaces[prevItemIndex] === "-" ||
            stringNoMultiSpacesSplitBySpaces[nextItemIndex] === "-"
              ? "-"
              : " ";
          formattedWordOrWords =
            formattedWordOrWords !== ""
              ? formattedWordOrWords + separator + capitalizedWord
              : capitalizedWord;
        }
      } else if (string?.includes(" ")) {
        const stringWords: string[] = string.replace(/\s+/g, " ").split(" ");
        for (const word of stringWords) {
          const trimmedWord = word.trim();
          const capitalizedWord = getCapitalizedWord(trimmedWord);
          formattedWordOrWords =
            formattedWordOrWords !== ""
              ? formattedWordOrWords + " " + capitalizedWord
              : capitalizedWord;
        }
      } else {
        const capitalizedWord = getCapitalizedWord(string);
        formattedWordOrWords =
          formattedWordOrWords !== ""
            ? formattedWordOrWords + " " + capitalizedWord
            : capitalizedWord;
      }
    }
    return formattedWordOrWords
      .replace(/\undefined/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const userData: TUser = {
    firstName: formatName(firstName),
    lastName: formatName(lastName),
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
    profileImage:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.iC6w-uAguv7_8AQJvWl7kAHaHa%26pid%3DApi&f=1&ipt=e28f6633e3153114f06c264e9a038281b7f36831fc29639194ac586d588d75b2&ipo=images",
    friends: [],
    about: "",
    subscriptionType: "",
    interests: [],
  };

  const resetFormFieldsAndErrors = (): void => {
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
    setShowErrors(false);
    setShowUsernameCriteria(false);
    setShowPasswordCriteria(false);
    setLoginMethod("username");
  };

  const toggleSignupLogin = (): void => {
    setSignupIsSelected(!signupIsSelected);
    resetFormFieldsAndErrors();
  };

  const toggleHidePassword = (): void => setPasswordIsHidden(!passwordIsHidden);

  // Input-handling methods:
  // Put here, since used in two different components
  const handleNameInput = (
    name: string,
    isFirstName: boolean,
    formType: "signup" | "edit-user-info"
  ) => {
    isFirstName ? setFirstName(name) : setLastName(name);

    if (
      allSignupOrEditFormFieldsFilled &&
      areNoSignupOrEditFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(userData);
    } else if (
      !allSignupOrEditFormFieldsFilled &&
      !areNoSignupOrEditFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(undefined);
    }

    if (formType === "signup") {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } else if (!nameIsValid(name.trim())) {
        isFirstName
          ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
          : setLastNameError("Only alphabetical characters & appropriate punctuation");
      } else if (nameIsValid(name.trim())) {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      }
    } else {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } else if (!nameIsValid(name.trim()) && name.trim() !== "") {
        isFirstName
          ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
          : setLastNameError("Only alphabetical characters & appropriate punctuation");
      } else {
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

    if (
      allSignupOrEditFormFieldsFilled &&
      areNoSignupOrEditFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(userData);
    } else if (
      !allSignupOrEditFormFieldsFilled &&
      !areNoSignupOrEditFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(undefined);
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
  };

  const handleEmailAddressInput = (
    inputEmailAddress: string,
    formType: "signup" | "edit-user-info"
  ): void => {
    const inputEmailAddressNoWhitespaces = inputEmailAddress.replace(/\s/g, "");

    setEmailAddress(inputEmailAddressNoWhitespaces.toLowerCase());

    if (
      allSignupOrEditFormFieldsFilled &&
      areNoSignupOrEditFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(userData);
    } else if (
      !allSignupOrEditFormFieldsFilled &&
      !areNoSignupOrEditFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(undefined);
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
      allSignupOrEditFormFieldsFilled && areNoSignupOrEditFormErrors
        ? setCurrentUser(userData)
        : setCurrentUser(undefined);

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

    /* Condition to set currentUser should be all other errors === "" && allSignupOrEditFormFieldsFilled && (confirmationPasswordError === "Passwords don't match" | confirmationPasswordError === ""), b/c, in this handler, setting of this error state value lags. */
    if (formType === "signup") {
      if (
        allSignupOrEditFormFieldsFilled &&
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
        setCurrentUser(undefined);
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

    const usernameExists: boolean = allUsers
      .map((user) => user.username)
      .includes(input.replace(/\s/g, ""));
    const emailExists: boolean = allUsers
      .map((user) => user.emailAddress)
      .includes(input.replace(/\s/g, "").toLowerCase());

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

  // submission handler should change state value userCreatedAccount (initialized to null, changed to boolean, depending on which form was submitted). once this value is a boolean, all err msgs (besides conf pw) should display, if there are, indeed errors.
  const areNoSignupOrEditFormErrors: boolean =
    firstNameError === "" &&
    lastNameError === "" &&
    usernameError === "" &&
    emailError === "" &&
    passwordError === "" &&
    confirmationPasswordError === "" &&
    phoneNumberError === "" &&
    locationError === "";

  const allSignupOrEditFormFieldsFilled: boolean =
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
      setCurrentUser(userData);
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
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
    } else {
      setUserCreatedAccount(false);
      if (emailAddress !== "") {
        setCurrentUser(allUsers.filter((user) => user.emailAddress === emailAddress)[0]);
      } else if (username !== "") {
        setCurrentUser(allUsers.filter((user) => user.username === username)[0]);
      }
      setFirstName(currentUser?.firstName);
      setLastName(currentUser?.lastName);
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
      "Please ensure all fields have been filled out & fix any form errors, then try again"
    );
    setShowErrors(true);
  };

  const logout = (): void => {
    setUserCreatedAccount(null);
    removeCurrentUser();
    resetFormFieldsAndErrors();
  };

  const userContextValues: TUserContext = {
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
    formatName,
    phoneCountry,
    setPhoneCountry,
    phoneCountryCode,
    setPhoneCountryCode,
    phoneNumberWithoutCountryCode,
    setPhoneNumberWithoutCountryCode,
    phoneNumberError,
    setPhoneNumberError,
    resetFormFieldsAndErrors,
    showSidebar,
    setShowSidebar,
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
    areNoSignupOrEditFormErrors,
    areNoLoginErrors,
    allSignupOrEditFormFieldsFilled,
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
  };

  return (
    <UserContext.Provider value={userContextValues}>{children}</UserContext.Provider>
  );
};
