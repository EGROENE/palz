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
      allUsers.filter((user) => user.emailAddress === email.replace(/\s/g, "")).length >
      0;

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
      // Get current user (if username/email has been entered) so that its password can be compared to input pw:
      const currentUser: TUser =
        loginWithUsernameOrEmail === "username"
          ? allUsers.filter((user) => user.username === username)[0]
          : allUsers.filter((user) => user.emailAddress === emailAddress)[0];
      console.log(currentUser);
      console.log(passwordIsValid(inputPassword));

      // If currentUser exists & there is non-whitespace input in password field:
      if (currentUser && inputPassword.replace(/\s/g, "").length) {
        if (currentUser.password !== inputPassword) {
          setPasswordError("Password doesn't match user");
        } else if (!passwordIsValid(inputPassword)) {
          setPasswordError("Invalid password1");
        } else {
          setPasswordError("");
        }
      }

      // If user enters password w/o first having input username or email (can only check for validity):
      if (!currentUser && inputPassword.length) {
        if (!passwordIsValid(inputPassword)) {
          setPasswordError("Invalid password2");
        } else {
          setPasswordError("");
        }
      }
    } else {
      !passwordIsValid(inputPassword)
        ? setPasswordError("Invalid password3")
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
  // Will need to handle case of user entering pw first before un/email. So, if pw field is not blank, check matching and validity of pw given the now-input un or email
  const handleUsernameOrEmailInput = (input: string): void => {
    const usernameExists: boolean = allUsers
      .map((user) => user.username)
      .includes(input.replace(/\s/g, ""));
    const emailExists: boolean = allUsers
      .map((user) => user.emailAddress)
      .includes(input.replace(/\s/g, ""));

    // If input matches pattern for an email:
    if (emailIsValid(input)) {
      const currentUser = allUsers.filter((user) => user.emailAddress === input)[0];
      setUsername("");
      setUsernameError("");
      setLoginWithUsernameOrEmail("email");
      setEmailAddress(input);
      if (!emailExists && input.length) {
        setEmailError("E-mail address not recognized");
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      } else {
        setEmailError("");
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else if (currentUser && currentUser.password !== password && password.length) {
          setPasswordError("Password doesn't match user");
        } else {
          setPasswordError("");
        }
      }
      // When user input is not an email address (aka a username):
      // Check that already-input pw, if one, matches user
    } else {
      const currentUser = allUsers.filter((user) => user.username === input)[0];
      setEmailAddress("");
      setEmailError("");
      setLoginWithUsernameOrEmail("username");
      setUsername(input);
      // If username doesn't exist & its field contains at least 1 character:
      if (!usernameExists && input.length) {
        setUsernameError("Username not recognized");
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      } else {
        setUsernameError("");
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else if (currentUser && currentUser.password !== password && password.length) {
          setPasswordError("Password doesn't match user");
        } else {
          setPasswordError("");
        }
      }
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
