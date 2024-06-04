import React from "react";

export type TUser = {
  id?: number | string;
  firstName: string | undefined;
  lastName: string | undefined;
  username: string | undefined;
  password: string | undefined;
  city: string;
  stateProvince: string;
  country: string;
  phoneCountry: string;
  phoneCountryCode: string;
  phoneNumberWithoutCountryCode: string;
  emailAddress: string | undefined;
  instagram: string;
  facebook: string;
  x: string;
  profileImage: string;
  about: string;
  friends: string[];
  subscriptionType: string;
  hostingCredits: number;
  interests: string[];
};

export type TEvent = {
  id: string;
  title: string;
  organizers: string[];
  description: string;
  nextEventTime: number;
  isPublic: boolean;
  maxParticipants: number | undefined;
  imageOne?: { src: string; altText: string };
  imageTwo?: { src: string; altText: string };
  imageThree?: { src: string; altText: string };
  city: string;
  stateProvince: string;
  country: string;
  address: string;
  postalCode: string;
  additionalInfo: string;
  interestedUsers: string[];
};

export type TMainContext = {
  getMostCurrentEvents: () => void;
  fetchAllEvents: () => Promise<void>;
  theme: "dark" | "light";
  toggleTheme: () => void;
  allUsers: TUser[];
  currentUser: TUser | undefined;
  setCurrentUser: React.Dispatch<React.SetStateAction<TUser | undefined>>;
  removeCurrentUser: () => void;
  allEvents: TEvent[];
  setAllEvents: React.Dispatch<React.SetStateAction<TEvent[]>>;
  attendedEvents: {
    id: string;
    eventID: string;
    eventName: string;
    username: string;
  }[];
  userCreatedAccount: null | boolean;
  setUserCreatedAccount: React.Dispatch<React.SetStateAction<boolean | null>>;
  showWelcomeMessage: boolean;
  setShowWelcomeMessage: React.Dispatch<React.SetStateAction<boolean>>;
  welcomeMessageDisplayTime: number;
  setWelcomeMessageDisplayTime: React.Dispatch<React.SetStateAction<number>>;
  handleWelcomeMessage: () => void;
  fetchAllUsers: () => Promise<void>;
};

export type TUserContext = {
  handleAddUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => void;
  handleDeleteUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => void;
  phoneCountry: string | undefined;
  setPhoneCountry: React.Dispatch<React.SetStateAction<string | undefined>>;
  phoneCountryCode: string | undefined;
  setPhoneCountryCode: React.Dispatch<React.SetStateAction<string | undefined>>;
  phoneNumberWithoutCountryCode: string | undefined;
  setPhoneNumberWithoutCountryCode: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  phoneNumberError: string;
  setPhoneNumberError: React.Dispatch<React.SetStateAction<string>>;
  loginMethod: "username" | "email";
  signupIsSelected: boolean;
  setSignupIsSelected: React.Dispatch<React.SetStateAction<boolean>>;
  passwordIsHidden: boolean;
  setPasswordIsHidden: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSignupLogin: () => void;
  toggleHidePassword: () => void;
  firstName: string | undefined;
  setFirstName: React.Dispatch<React.SetStateAction<string | undefined>>;
  firstNameError: string;
  setFirstNameError: React.Dispatch<React.SetStateAction<string>>;
  lastName: string | undefined;
  setLastName: React.Dispatch<React.SetStateAction<string | undefined>>;
  lastNameError: string;
  setLastNameError: React.Dispatch<React.SetStateAction<string>>;
  username: string | undefined;
  setUsername: React.Dispatch<React.SetStateAction<string | undefined>>;
  usernameError: string | undefined;
  setUsernameError: React.Dispatch<React.SetStateAction<string>>;
  emailAddress: string | undefined;
  setEmailAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  emailError: string;
  setEmailError: React.Dispatch<React.SetStateAction<string>>;
  password: string | undefined;
  setPassword: React.Dispatch<React.SetStateAction<string | undefined>>;
  passwordError: string;
  setPasswordError: React.Dispatch<React.SetStateAction<string>>;
  confirmationPassword: string;
  setConfirmationPassword: React.Dispatch<React.SetStateAction<string>>;
  userCity: string | undefined;
  setUserCity: React.Dispatch<React.SetStateAction<string | undefined>>;
  userState: string | undefined;
  setUserState: React.Dispatch<React.SetStateAction<string | undefined>>;
  userCountry: string | undefined;
  setUserCountry: React.Dispatch<React.SetStateAction<string | undefined>>;
  locationError: string;
  setLocationError: React.Dispatch<React.SetStateAction<string>>;
  confirmationPasswordError: string;
  setConfirmationPasswordError: React.Dispatch<React.SetStateAction<string>>;
  areNoSignupFormErrors: boolean;
  areNoLoginErrors: boolean;
  allSignupFormFieldsFilled: boolean;
  allLoginInputsFilled: boolean;
  showErrors: boolean;
  handleNameInput: (
    name: string,
    isFirstName: boolean,
    formType: "signup" | "edit-user-info"
  ) => void;
  handleUsernameInput: (username: string, formType: "signup" | "edit-user-info") => void;
  handleEmailAddressInput: (email: string, formType: "signup" | "edit-user-info") => void;
  handlePasswordInput: (
    inputPassword: string,
    formType: "login" | "signup" | "edit-user-info"
  ) => void;
  handleConfirmationPasswordInput: (
    inputConfirmationPassword: string,
    formType: "login" | "signup" | "edit-user-info"
  ) => void;
  handleUsernameOrEmailInput: (input: string) => void;
  handleSignupOrLoginFormSubmission: (
    isOnSignup: boolean,
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  handleFormRejection: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  showPasswordCriteria: boolean;
  setShowPasswordCriteria: React.Dispatch<React.SetStateAction<boolean>>;
  showUsernameCriteria: boolean;
  setShowUsernameCriteria: React.Dispatch<React.SetStateAction<boolean>>;
  resetFormFieldsAndErrors: () => void;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
  facebook: string | undefined;
  setFacebook: React.Dispatch<React.SetStateAction<string | undefined>>;
  facebookError: string;
  setFacebookError: React.Dispatch<React.SetStateAction<string>>;
  instagram: string | undefined;
  setInstagram: React.Dispatch<React.SetStateAction<string | undefined>>;
  instagramError: string;
  setInstagramError: React.Dispatch<React.SetStateAction<string>>;
  x: string | undefined;
  setX: React.Dispatch<React.SetStateAction<string | undefined>>;
  xError: string;
  setXError: React.Dispatch<React.SetStateAction<string>>;
  userAbout: string | undefined;
  setUserAbout: React.Dispatch<React.SetStateAction<string | undefined>>;
  userAboutError: string;
  setUserAboutError: React.Dispatch<React.SetStateAction<string>>;
};
