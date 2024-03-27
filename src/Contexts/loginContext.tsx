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
  const [loginMethod, setLoginMethod] = useState<"username" | "email">("username");
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

    // Handle input pw on login form:
    if (!isOnSignup) {
      // Get current user (if username/email has been entered) so that its password can be compared to input pw:
      const currentUser: TUser =
        loginMethod === "username"
          ? allUsers.filter((user) => user.username === username)[0]
          : allUsers.filter((user) => user.emailAddress === emailAddress)[0];

      // If currentUser exists & there is non-whitespace input in password field:
      if (currentUser && inputPassword.replace(/\s/g, "").length) {
        // If currentUser pw is not equal to inputPassword...
        if (currentUser.password !== inputPassword) {
          setPasswordError("Password doesn't match user");
          // If input password is not valid...
        } else if (!passwordIsValid(inputPassword)) {
          setPasswordError("Invalid password1");
        } else {
          setPasswordError("");
        }
      }

      // If user enters password w/o first having input username or email (can only check for validity):
      if (!currentUser && inputPassword.length) {
        // If input pw isn't valid...
        if (!passwordIsValid(inputPassword)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      }
      // Handle input pw on signup form:
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

  // This method is used on login form, where user can input either their username or email to log in
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
      setLoginMethod("email");
      setEmailAddress(input);
      // If email address isn't in database & field contains at least one character:
      if (!emailExists && input.length) {
        setEmailError("E-mail address not recognized");
        // If pw isn't valid...
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
        // If email is recognized...
      } else {
        setEmailError("");
        // If password is not valid...
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and password field has at least one character...
        } else if (currentUser && currentUser.password !== password && password.length) {
          setPasswordError("Password doesn't match user");
        } else {
          setPasswordError("");
        }
      }
      // When user input is not an email address (aka, it's a username):
    } else {
      const currentUser = allUsers.filter((user) => user.username === input)[0];
      setEmailAddress("");
      setEmailError("");
      setLoginMethod("username");
      setUsername(input);
      // If username doesn't exist & its field contains at least 1 character:
      if (!usernameExists && input.length) {
        setUsernameError("Username not recognized");
        // If pw isn't valid...
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
        // If username is recognized & at least 1 character has been input...
      } else {
        setUsernameError("");
        if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and pw field contains at least one character...
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
    loginMethod,
  };

  return (
    <LoginContext.Provider value={loginContextValues}>{children}</LoginContext.Provider>
  );
};
