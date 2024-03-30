export type TNewUser = {
  firstName: string;
  lastName: string;
  username: string;
  emailAddress: string;
  password: string;
};

export type TUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  city: string;
  stateProvince: string;
  country: string;
  phoneNumber: string;
  emailAddress: string;
  instagram: string;
  facebook: string;
  x: string;
  telegram: string;
  whatsapp: string;
  profileImage: string;
  about: string;
  subscriptionType: string;
  hostingCredits: number;
};

export type TEvent = {
  id: string;
  title: string;
  eventID: string;
  organizerOneID: string;
  organizerTwoID?: string;
  organizerThreeID?: string;
  description: string;
  nextEventTime: number;
  isPublic: boolean;
  maxParticipants: number;
  imageOne?: string;
  imageTwo?: string;
  imageThree?: string;
  imageFour?: string;
  imageFive?: string;
  city: string;
  stateProvince: string;
  country: string;
  address: string;
  postalCode: string;
  additionalInfo: string;
};

export type TMainContext = {
  allUsers: TUser[];
  allEvents: TEvent[];
  rsvpdEvents: {
    id: string;
    eventID: string;
    eventName: string;
    username: string;
  }[];
  favoritedEvents: {
    id: string;
    eventID: string;
    eventName: string;
    username: string;
  }[];
  attendedEvents: {
    id: string;
    eventID: string;
    eventName: string;
    username: string;
  }[];
  userInterests: {
    id: string;
    username: string;
    interest: string;
  }[];
  eventsByTag: {
    id: string;
    eventID: string;
    eventName: string;
    tag: string;
  }[];
  allInterests: {
    id: string;
    interest: string;
  }[];
  userCreatedAccount: null | boolean;
  setUserCreatedAccount: React.Dispatch<React.SetStateAction<boolean | null>>;
};

export type TLoginContext = {
  loginMethod: "username" | "email";
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
  areNoErrors: boolean;
  showErrors: boolean;
  handleNameInput: (name: string, isFirstName: boolean) => void;
  handleUsernameInput: (username: string) => void;
  handleEmailAddressInput: (email: string) => void;
  handlePasswordInput: (inputPassword: string, isOnSignup: boolean) => void;
  handleConfirmationPasswordInput: (inputConfirmationPassword: string) => void;
  handleUsernameOrEmailInput: (input: string) => void;
  handleFormSubmission: (
    isOnSignup: boolean,
    e: React.FormEvent<HTMLFormElement>
  ) => void;
};
