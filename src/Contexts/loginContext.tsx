import { createContext, ReactNode, useState } from "react";
import { TLoginContext, TUser } from "../types";
import {
  emailIsValid,
  nameIsValid,
  passwordIsValid,
  usernameIsValid,
} from "../validations";
import Requests from "../requests";
import toast from "react-hot-toast";
import { useMainContext } from "../Hooks/useMainContext";

export const LoginContext = createContext<TLoginContext | null>(null);

export const LoginContextProvider = ({ children }: { children: ReactNode }) => {
  const { allUsers, setUserCreatedAccount, setCurrentUser, handleWelcomeMessage } =
    useMainContext();

  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(false);
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  // Put state values for all inputs here. set these in handler functions.
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmationPassword, setConfirmationPassword] = useState<string>("");
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
  const [passwordError, setPasswordError] = useState<string>(
    "Please fill out this field"
  );
  const [confirmationPasswordError, setConfirmationPasswordError] = useState<string>(
    "Please fill out this field"
  );
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const userData: TUser = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    username: username.trim(),
    emailAddress: emailAddress.trim(),
    password: password.trim(),
    hostingCredits: 0,
    city: "",
    stateProvince: "",
    country: "",
    phoneNumber: "",
    instagram: "",
    facebook: "",
    x: "",
    telegram: "",
    whatsapp: "",
    profileImage: "",
    about: "",
    subscriptionType: "",
  };

  const toggleSignupLogin = (): void => {
    setSignupIsSelected(!signupIsSelected);
    setFirstName("");
    setFirstNameError("Please fill out this field");
    setLastName("");
    setLastNameError("Please fill out this field");
    setUsername("");
    setUsernameError("Please fill out this field");
    setEmailAddress("");
    setEmailError("Please fill out this field");
    setPassword("");
    setPasswordError("Please fill out this field");
    setConfirmationPassword("");
    setConfirmationPasswordError("Please fill out this field");
  };

  const toggleHidePassword = (): void => setPasswordIsHidden(!passwordIsHidden);

  // Input-handling methods:
  // Put here, since used in two different components
  const handleNameInput = (name: string, isFirstName: boolean) => {
    isFirstName
      ? setFirstName(name.replace(/\s+/g, " "))
      : setLastName(name.replace(/\s+/g, " "));

    if (allSignupInputsFilled && areNoSignupErrors) {
      setCurrentUser(userData);
    } else {
      setCurrentUser(undefined);
    }

    if (name.replace(/\s/g, "") === "") {
      isFirstName
        ? setFirstNameError("Please fill out this field")
        : setLastNameError("Please fill out this field");
    } else if (!nameIsValid(name)) {
      isFirstName
        ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
        : setLastNameError("Only alphabetical characters & appropriate punctuation");
    } else if (nameIsValid(name)) {
      isFirstName ? setFirstNameError("") : setLastNameError("");
    }
  };

  const handleUsernameInput = (inputUsername: string): void => {
    if (inputUsername.length <= 20 && usernameIsValid(inputUsername)) {
      setUsername(inputUsername);
    }

    if (allSignupInputsFilled && areNoSignupErrors) {
      setCurrentUser(userData);
    } else {
      setCurrentUser(undefined);
    }

    const usernameIsTaken: boolean =
      allUsers.filter((user) => user.username === inputUsername).length > 0;

    if (usernameIsTaken) {
      setUsernameError("Username is already taken");
    } else if (inputUsername.length < 4) {
      setUsernameError(
        "Username must be 4-20 characters long & may only contain alphanumeric characters"
      );
    } else {
      setUsernameError("");
    }
  };

  const handleEmailAddressInput = (inputEmailAddress: string): void => {
    setEmailAddress(inputEmailAddress.replace(/\s/g, ""));

    if (allSignupInputsFilled && areNoSignupErrors) {
      setCurrentUser(userData);
    } else {
      setCurrentUser(undefined);
    }

    const emailIsTaken: boolean =
      allUsers.filter(
        (user) => user.emailAddress === inputEmailAddress.replace(/\s/g, "")
      ).length > 0;

    if (emailIsTaken) {
      setEmailError("E-mail address is taken");
    } else if (!emailIsValid(inputEmailAddress.trim()) && inputEmailAddress !== "") {
      setEmailError("Invalid e-mail address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordInput = (inputPassword: string, isOnSignup: boolean): void => {
    //setPassword(inputPassword.trim());
    if (!inputPassword.includes(" ")) {
      setPassword(inputPassword);
    }

    // Handle input pw on login form:
    if (!isOnSignup) {
      // Get current user (if username/email has been entered) so that its password can be compared to input pw:
      const currentUser: TUser =
        loginMethod === "username"
          ? allUsers.filter((user) => user.username === username)[0]
          : allUsers.filter((user) => user.emailAddress === emailAddress)[0];

      // If currentUser exists & there is non-whitespace input in password field:
      if (currentUser) {
        // If input pw is empty string...
        if (inputPassword === "") {
          setPasswordError("Please fill out this field");
          // If input pw isn't empty string & is unequal to current user's pw...
        } else if (currentUser.password !== inputPassword) {
          setPasswordError("Password doesn't match user");
          // If no other error conditions are true, remove error message...
        } else if (!passwordIsValid(inputPassword)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      }

      // If user enters password w/o first having input username or email (can only check for validity):
      if (!currentUser) {
        // If input pw isn't valid...
        if (!passwordIsValid(inputPassword)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      }
      // Handle input pw on signup form:
    } else {
      if (allSignupInputsFilled && areNoSignupErrors) {
        setCurrentUser(userData);
      } else {
        setCurrentUser(undefined);
      }
      if (!passwordIsValid(inputPassword) && inputPassword.length) {
        setPasswordError("Invalid password");
        if (
          confirmationPassword !== "" &&
          inputPassword.trim() !== confirmationPassword
        ) {
          setConfirmationPasswordError("Passwords don't match");
        } else {
          setConfirmationPasswordError("");
        }
      } else if (!inputPassword.length) {
        setPasswordError("Please fill out this field");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleConfirmationPasswordInput = (inputConfirmationPassword: string): void => {
    setConfirmationPassword(inputConfirmationPassword.trim());

    console.log(allSignupInputsFilled);
    console.log(areNoSignupErrors);
    if (allSignupInputsFilled && areNoSignupErrors) {
      setCurrentUser(userData);
    } else {
      setCurrentUser(undefined);
    }

    inputConfirmationPassword.trim() !== password &&
    inputConfirmationPassword !== "" &&
    password !== ""
      ? setConfirmationPasswordError("Passwords don't match")
      : setConfirmationPasswordError("");
  };

  // This method is used on login form, where user can input either their username or email to log in
  const handleUsernameOrEmailInput = (input: string): void => {
    const usernameExists: boolean = allUsers
      .map((user) => user.username)
      .includes(input.replace(/\s/g, ""));
    const emailExists: boolean = allUsers
      .map((user) => user.emailAddress)
      .includes(input.replace(/\s/g, ""));

    // If input matches pattern for an email:
    if (emailIsValid(input.trim())) {
      const currentUser = allUsers.filter((user) => user.emailAddress === input)[0];
      setCurrentUser(currentUser);
      setUsername("");
      setUsernameError("");
      setLoginMethod("email");
      if (input === "") {
        setEmailError("Please fill out this field");
      }
      setEmailAddress(input.replace(/\s/g, ""));
      // If email address isn't in database & field isn't empty string:
      if (!emailExists && input !== "") {
        setEmailError("E-mail address not recognized");
        // If pw isn't valid...
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
        // If password is not valid...
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and password field isn't empty string...
        } else if (currentUser && currentUser.password !== password && password !== "") {
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
      setUsername(input.replace(/\s/g, ""));
      if (input === "") {
        setEmailError("Please fill out this field");
      }
      // If username doesn't exist & its field contains at least 1 character:
      if (!usernameExists && input.length) {
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
          setCurrentUser(userData);
        }
      })
      .catch((error) => {
        toast.error("Could not create account. Please try again later.");
        console.log(error);
      });
  };

  // submission handler should change state value userCreatedAccount (initialized to null, changed to boolean, depending on which form was submitted). once this value is a boolean, all err msgs (besides conf pw) should display, if there are, indeed errors.
  const areNoSignupErrors: boolean =
    firstNameError === "" &&
    lastNameError === "" &&
    usernameError === "" &&
    emailError === "" &&
    passwordError === "" &&
    confirmationPasswordError === "";

  const allSignupInputsFilled: boolean =
    firstName !== "" &&
    lastName !== "" &&
    username !== "" &&
    emailAddress !== "" &&
    password !== "" &&
    confirmationPassword !== "";

  const areNoLoginErrors: boolean =
    (usernameError === "" || emailError === "") && passwordError === "";

  const allLoginInputsFilled: boolean =
    (username !== "" || emailAddress !== "") && password !== "";

  const handleFormSubmission = (
    isOnSignup: boolean,
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault();
    handleWelcomeMessage();
    if (isOnSignup) {
      handleNewAccountCreation(userData);
    } else {
      setUserCreatedAccount(false);
      if (emailAddress !== "") {
        setCurrentUser(allUsers.filter((user) => user.emailAddress === emailAddress)[0]);
      } else if (username !== "") {
        setCurrentUser(allUsers.filter((user) => user.username === username)[0]);
      }
    }
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

  const loginContextValues: TLoginContext = {
    signupIsSelected,
    setSignupIsSelected,
    passwordIsHidden,
    setPasswordIsHidden,
    toggleSignupLogin,
    toggleHidePassword,
    firstName,
    setFirstName,
    firstNameError,
    setFirstNameError,
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
    setConfirmationPassword,
    confirmationPasswordError,
    setConfirmationPasswordError,
    areNoSignupErrors,
    areNoLoginErrors,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
    allSignupInputsFilled,
    allLoginInputsFilled,
    showErrors,
    handleNameInput,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    handleConfirmationPasswordInput,
    handleUsernameOrEmailInput,
    loginMethod,
    handleFormSubmission,
    handleFormRejection,
  };

  return (
    <LoginContext.Provider value={loginContextValues}>{children}</LoginContext.Provider>
  );
};
