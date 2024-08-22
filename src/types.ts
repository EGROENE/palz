import React from "react";

export type TThemeColor =
  | "var(--theme-blue)"
  | "var(--theme-green)"
  | "var(--theme-pink)"
  | "var(--theme-purple)"
  | "var(--theme-orange)";

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
  friends: (string | number)[];
  subscriptionType: string;
  hostingCredits: number;
  interests: string[];
  whoCanAddUserAsOrganizer: "friends" | "anyone" | "nobody";
  whoCanInviteUser: "friends" | "anyone" | "nobody";
  profileVisibleTo: "friends" | "anyone";
};

export type TEvent = {
  id?: string | number;
  creator: string | number | undefined;
  title: string;
  organizers: (string | number)[];
  invitees: (string | number)[];
  description: string;
  eventStartDateMidnightUTCInMS: number;
  eventStartTimeAfterMidnightUTCInMS: number;
  eventStartDateTimeInMS: number;
  eventEndDateMidnightUTCInMS: number;
  eventEndTimeAfterMidnightUTCInMS: number;
  eventEndDateTimeInMS: number;
  publicity: "public" | "private";
  maxParticipants: number | undefined;
  imageOne?: string;
  imageTwo?: string;
  imageThree?: string;
  city: string | undefined;
  stateProvince: string | undefined;
  country: string | undefined;
  address: string | undefined;
  additionalInfo: string;
  interestedUsers: (string | number)[];
  relatedInterests: string[];
};

export type TUserValuesToUpdate = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  username?: string | undefined;
  emailAddress?: string | undefined;
  about?: string | undefined;
  password?: string | undefined;
  phoneCountry?: string | undefined;
  phoneCountryCode?: string | undefined;
  phoneNumberWithoutCountryCode?: string | undefined;
  city?: string | undefined;
  stateProvince?: string | undefined;
  country?: string | undefined;
  facebook?: string | undefined;
  instagram?: string | undefined;
  x?: string | undefined;
  whoCanAddUserAsOrganizer?: "anyone" | "friends" | "nobody" | undefined;
  whoCanInviteUser?: "anyone" | "friends" | "nobody" | undefined;
  profileVisibleTo?: "anyone" | "friends" | undefined;
};

export type TEventValuesToUpdate = {
  relatedInterests?: string[] | undefined;
  imageThree?: string | undefined;
  imageTwo?: string | undefined;
  imageOne?: string | undefined;
  address?: string | undefined;
  maxParticipants?: number | undefined;
  eventStartDateMidnightUTCInMS?: number | undefined;
  eventStartTimeAfterMidnightUTCInMS?: number | undefined;
  eventStartDateTimeInMS?: number | undefined;
  eventEndDateMidnightUTCInMS?: number | undefined;
  eventEndTimeAfterMidnightUTCInMS?: number | undefined;
  eventEndDateTimeInMS?: number | undefined;
  organizers?: (string | number)[] | undefined;
  invitees?: (string | number)[] | undefined;
  description?: string | undefined;
  additionalInfo?: string | undefined;
  city?: string | undefined;
  stateProvince?: string | undefined;
  country?: string | undefined;
  publicity?: "public" | "private";
  title?: string | undefined;
};

export type TMainContext = {
  currentEvent: TEvent | undefined;
  setCurrentEvent: React.Dispatch<React.SetStateAction<TEvent | undefined>>;
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
  handleRemoveInvitee: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | undefined
  ) => void;
  handleCityStateCountryInput: (
    stateValues: {
      city: string | undefined;
      state: string | undefined;
      country: string | undefined;
    },
    setters: {
      citySetter?: (value: React.SetStateAction<string | undefined>) => void;
      stateSetter?: (value: React.SetStateAction<string | undefined>) => void;
      countrySetter?: (value: React.SetStateAction<string | undefined>) => void;
      errorSetter: (value: React.SetStateAction<string>) => void;
      showCountriesSetter?: (value: React.SetStateAction<boolean>) => void;
    },
    locationType: "city" | "state" | "country",
    country?: string,
    e?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleAddUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => void;
  handleDeleteUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser
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
  whoCanAddUserAsOrganizer: "anyone" | "friends" | "nobody";
  setWhoCanAddUserAsOrganizer: React.Dispatch<
    React.SetStateAction<"anyone" | "friends" | "nobody">
  >;
  whoCanInviteUser: "anyone" | "friends" | "nobody";
  setWhoCanInviteUser: React.Dispatch<
    React.SetStateAction<"anyone" | "friends" | "nobody">
  >;
  profileVisibleTo: "anyone" | "friends";
  setProfileVisibleTo: React.Dispatch<React.SetStateAction<"anyone" | "friends">>;
};
