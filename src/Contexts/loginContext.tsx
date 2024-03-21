import { createContext, ReactNode, useState } from "react";
import { TLoginContext } from "../types";
import { nameIsValid, usernameIsValid } from "../validations";
import { useMainContext } from "../Hooks/useMainContext";

export const LoginContext = createContext<TLoginContext | null>(null);

export const LoginContextProvider = ({ children }: { children: ReactNode }) => {
  const { allUsers } = useMainContext();

  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(true);
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  // Put state values for all inputs here. set these in handler functions.
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmationPassword, setConfirmationPassword] = useState<string>("");

  // Boolean values relating to input-field errors:
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmationPasswordError, setConfirmationPasswordError] = useState<string>("");

  const toggleSignupLogin = () => {
    setSignupIsSelected(!signupIsSelected);
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmailAddress("");
    setPassword("");
    setConfirmationPassword("");
  };

  const toggleHidePassword = () => setPasswordIsHidden(!passwordIsHidden);

  // Input-handling methods:
  // Put here, since used in two different components
  const handleNameInput = (name: string, isFirstName: boolean) => {
    if (isFirstName) {
      setFirstName(name.trim());
    } else {
      setLastName(name.trim());
    }
    if (!nameIsValid(name) && name.length > 0) {
      if (isFirstName) {
        setFirstNameError("Only alphabetical characters & any hyphens allowed b/t names");
      } else {
        setLastNameError("Only alphabetical characters & any hyphens allowed b/t names");
      }
    } else if (nameIsValid(name) || name.length === 0) {
      if (isFirstName) {
        setFirstNameError("");
      } else {
        setLastNameError("");
      }
    }
  };

  const handleUsernameInput = (username: string, isOnSignup: boolean): void => {
    setUsername(username);

    const usernameIsTaken: boolean =
      allUsers.map((user) => user.username === username).length > 0;

    // On signup form:
    if (isOnSignup) {
      if (!usernameIsValid(username)) {
        setUsernameError(
          'Username must be at least 4 characters long, contain at least one letter, & contain no spaces or "@"'
        );
      } else if (usernameIsTaken) {
        setUsernameError("Username is already taken");
      } else {
        setUsernameError("");
      }
      // On login form:
    } else {
      if (!usernameIsValid(username)) {
        setUsernameError(
          'Username must be at least 4 characters long, contain at least one letter, & contain no spaces or "@"'
        );
      } else if (!usernameIsTaken) {
        setUsernameError("Username doesn't match any accounts");
      } else {
        setUsernameError("");
      }
    }
  };

  /*  const handleEmailAddressInput = ({
    email,
    isOnSignup,
  }: {
    email: string;
    isOnSignup: boolean;
  }) => {
    // on signup, set error to "email is already associated w/ an account. log in instead" if it exists
    // not on signup, set error to "email not found" if it doesn't exist or "email must contain ...." if invalid
  }; */

  /* const handlePasswordInput = ({
    password,
    isOnSignup,
  }: {
    password: string;
    isOnSignup: boolean;
  }) => {}; */

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
    handleNameInput,
    handleUsernameInput,
  };

  return (
    <LoginContext.Provider value={loginContextValues}>{children}</LoginContext.Provider>
  );
};
