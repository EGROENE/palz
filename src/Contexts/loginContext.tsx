import { createContext, ReactNode, useState } from "react";
import { TLoginContext, TUser } from "../types";
import {
  emailIsValid,
  nameIsValid,
  passwordIsValid,
  usernameIsValid,
} from "../validations";
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

  const handleEmailAddressInput = (email: string, isOnSignup: boolean) => {
    setEmailAddress(email);
    const emailIsTaken: boolean =
      allUsers.map((user) => user.emailAddress === email).length > 0;
    if (isOnSignup) {
      if (!emailIsValid(email)) {
        setEmailError("Invalid e-mail address");
      } else if (emailIsTaken) {
        setEmailError("E-mail address is taken");
      } else {
        setEmailError("");
      }
    } else {
      if (!emailIsTaken) {
        setEmailError("E-mail address not recognized");
      } else {
        setEmailError("");
      }
    }
  };

  const handlePasswordInput = (inputPassword: string, isOnSignup: boolean) => {
    setPassword(inputPassword);

    if (!isOnSignup) {
      const currentUser: TUser = allUsers.filter((user) => user.username === username)[0];
      const passwordMatchesCurrentUser: boolean = currentUser.password === password;
      if (!passwordMatchesCurrentUser) {
        setPasswordError("Password doesn't match user");
      } else {
        setPasswordError("");
      }
    } else {
      if (!passwordIsValid(inputPassword)) {
        setPasswordError("Invalid password");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleConfirmationPasswordInput = (inputConfirmationPassword: string) => {
    setConfirmationPassword(inputConfirmationPassword);
    if (confirmationPassword !== password) {
      setConfirmationPasswordError("Passwords don't match");
    } else {
      setConfirmationPasswordError("");
    }
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
    handleNameInput,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    handleConfirmationPasswordInput,
  };

  return (
    <LoginContext.Provider value={loginContextValues}>{children}</LoginContext.Provider>
  );
};
