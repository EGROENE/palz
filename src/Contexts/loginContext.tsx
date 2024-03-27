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
  const [loginWithUsernameOrEmail, setLoginWithUsernameOrEmail] = useState<
    "username" | "email"
  >("username");
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmationPasswordError, setConfirmationPasswordError] = useState<string>("");

  const toggleSignupLogin = (): void => {
    setSignupIsSelected(!signupIsSelected);
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmailAddress("");
    setPassword("");
    setConfirmationPassword("");
  };

  const toggleHidePassword = (): void => setPasswordIsHidden(!passwordIsHidden);

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

  const handleUsernameInput = (username: string): void => {
    setUsername(username);

    const usernameIsTaken: boolean =
      allUsers.filter((user) => user.username === username).length > 0;

    if (!usernameIsValid(username)) {
      setUsernameError(
        'Username must be at least 4 characters long, contain at least one letter, & contain no spaces or "@"'
      );
    } else if (usernameIsTaken) {
      setUsernameError("Username is already taken");
    } else {
      setUsernameError("");
    }
  };

  const handleEmailAddressInput = (email: string): void => {
    setEmailAddress(email);

    const emailIsTaken: boolean =
      allUsers.filter((user) => user.emailAddress === email.trim()).length > 0;

    if (!emailIsValid(email)) {
      setEmailError("Invalid e-mail address");
    } else if (emailIsTaken) {
      setEmailError("E-mail address is taken");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordInput = (inputPassword: string, isOnSignup: boolean): void => {
    setPassword(inputPassword);

    if (!isOnSignup) {
      const currentUser: TUser =
        loginWithUsernameOrEmail === "username"
          ? allUsers.filter((user) => user.username === username)[0]
          : allUsers.filter((user) => user.emailAddress === emailAddress)[0];

      if (currentUser) {
        const passwordMatchesCurrentUser: boolean =
          currentUser.password === inputPassword.trim();
        !passwordMatchesCurrentUser && inputPassword !== ""
          ? setPasswordError("Password doesn't match user")
          : setPasswordError("");
      } else {
        setPasswordError("Invalid password");
      }
    } else {
      !passwordIsValid(inputPassword)
        ? setPasswordError("Invalid password")
        : setPasswordError("");
    }
  };

  const handleConfirmationPasswordInput = (inputConfirmationPassword: string): void => {
    setConfirmationPassword(inputConfirmationPassword);
    inputConfirmationPassword !== password
      ? setConfirmationPasswordError("Passwords don't match")
      : setConfirmationPasswordError("");
  };

  // This is used on login form, where user can input either their username or email to log in
  const handleUsernameOrEmailInput = (input: string): void => {
    const usernameExists: boolean = allUsers
      .map((user) => user.username)
      .includes(input.trim());
    const emailExists: boolean = allUsers
      .map((user) => user.emailAddress)
      .includes(input.trim());

    // If input matches pattern for an email, set emailAddress to input:
    if (emailIsValid(input)) {
      setUsername("");
      setUsernameError("");
      setLoginWithUsernameOrEmail("email");
      setEmailAddress(input);
      !emailExists ? setEmailError("E-mail address not recognized") : setEmailError("");
      // Else, ir input doesn't meet e-mail-address criteria, set username to input:
    } else {
      setEmailAddress("");
      setEmailError("");
      setLoginWithUsernameOrEmail("username");
      setUsername(input);
      // If username doesn't exist and there is at least one char of input:
      !usernameExists && input !== ""
        ? setUsernameError("Input doesn't match any account")
        : setUsernameError("");
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
    handleUsernameOrEmailInput,
    loginWithUsernameOrEmail,
  };

  return (
    <LoginContext.Provider value={loginContextValues}>{children}</LoginContext.Provider>
  );
};
