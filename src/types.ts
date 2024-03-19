export type TLoginContext = {
  signupIsSelected: boolean;
  setSignupIsSelected: React.Dispatch<React.SetStateAction<boolean>>;
  passwordIsHidden: boolean;
  setPasswordIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSignupLogin: () => void;
  toggleHidePassword: () => void;
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  firstNameError: string;
  setFirstNameError: React.Dispatch<React.SetStateAction<string>>;
  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  lastNameError: string;
  setLastNameError: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  usernameError: string;
  setUsernameError: React.Dispatch<React.SetStateAction<string>>;
  emailAddress: string;
  setEmailAddress: React.Dispatch<React.SetStateAction<string>>;
  emailError: string;
  setEmailError: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  passwordError: string;
  setPasswordError: React.Dispatch<React.SetStateAction<string>>;
  confirmationPassword: string;
  setConfirmationPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmationPasswordError: string;
  setConfirmationPasswordError: React.Dispatch<React.SetStateAction<string>>;
};
