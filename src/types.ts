import React from "react";

export type TThemeColor =
  | "var(--primary-color)"
  | "var(--secondary-color)"
  | "var(--tertiary-color)"
  | "var(--fourth-color)"
  | "var(--fifth-color)";

export type TUser = {
  _id?: string;
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
  profileImage: string | unknown;
  about: string;
  friends: string[];
  subscriptionType: "free" | "bronze" | "silver" | "gold" | "platinum";
  hostingCredits: number;
  interests: string[];
  whoCanAddUserAsOrganizer: "friends" | "anyone" | "nobody" | undefined;
  whoCanInviteUser: "friends" | "anyone" | "nobody" | undefined;
  profileVisibleTo: "friends" | "anyone" | "friends of friends" | undefined;
  friendRequestsReceived: string[];
  friendRequestsSent: string[];
  blockedUsers: string[];
  whoCanMessage: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
};

export type TEvent = {
  _id?: string;
  creator: string | undefined;
  title: string;
  organizers: string[];
  invitees: string[];
  description: string;
  eventStartDateMidnightUTCInMS: number;
  eventStartTimeAfterMidnightUTCInMS: number;
  eventStartDateTimeInMS: number;
  eventEndDateMidnightUTCInMS: number;
  eventEndTimeAfterMidnightUTCInMS: number;
  eventEndDateTimeInMS: number;
  publicity: "public" | "private";
  maxParticipants: number | null;
  images: string[] | undefined;
  city: string | undefined;
  stateProvince: string | undefined;
  country: string | undefined;
  address: string | undefined;
  additionalInfo: string;
  interestedUsers: string[];
  disinterestedUsers: string[];
  relatedInterests: string[];
};

export type TUserValuesToUpdate = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  profileImage?: string | unknown;
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
  profileVisibleTo?: "anyone" | "friends" | "friends of friends" | undefined;
  whoCanMessage?: "anyone" | "friends" | "nobody" | "friends of friends" | undefined;
};

export type TEventValuesToUpdate = {
  relatedInterests?: string[] | undefined;
  images?: string[] | undefined;
  address?: string | undefined;
  maxParticipants?: number | null;
  eventStartDateMidnightUTCInMS?: number | undefined;
  eventStartTimeAfterMidnightUTCInMS?: number | undefined;
  eventStartDateTimeInMS?: number | undefined;
  eventEndDateMidnightUTCInMS?: number | undefined;
  eventEndTimeAfterMidnightUTCInMS?: number | undefined;
  eventEndDateTimeInMS?: number | undefined;
  organizers?: string[] | undefined;
  invitees?: string[] | undefined;
  description?: string | undefined;
  additionalInfo?: string | undefined;
  city?: string | undefined;
  stateProvince?: string | undefined;
  country?: string | undefined;
  publicity?: "public" | "private";
  title?: string | undefined;
};

export type TMainContext = {
  displayedItemsCount: number | undefined;
  setDisplayedItemsCount: React.Dispatch<React.SetStateAction<number | undefined>>;
  displayedItemsCountInterval: number | undefined;
  setDisplayedItemsCountInterval: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  displayedItemsFiltered: (TUser | TEvent)[];
  setDisplayedItemsFiltered: React.Dispatch<React.SetStateAction<(TUser | TEvent)[]>>;
  handleLoadMoreOnScroll: (
    displayedItemsCount: number | undefined,
    setDisplayedItemsCount: React.Dispatch<React.SetStateAction<number | undefined>>,
    displayedItemsArray: any[],
    displayedItemsArrayFiltered: any[],
    displayedItemsCountInterval: number | undefined,
    e?: React.UIEvent<HTMLUListElement, UIEvent> | React.UIEvent<HTMLDivElement, UIEvent>
  ) => void;
  displayedItems: (TUser | TEvent)[];
  setDisplayedItems: React.Dispatch<React.SetStateAction<(TEvent | TUser)[]>>;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  imageIsUploading: boolean;
  setImageIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  imageIsDeleting: boolean;
  setImageIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  theme: "dark" | "light";
  toggleTheme: () => void;
  showWelcomeMessage: boolean;
  setShowWelcomeMessage: React.Dispatch<React.SetStateAction<boolean>>;
  welcomeMessageDisplayTime: number;
  setWelcomeMessageDisplayTime: React.Dispatch<React.SetStateAction<number>>;
  handleWelcomeMessage: () => void;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export type TUserContext = {
  friends: string[] | undefined;
  setFriends: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  friendRequestsSent: string[] | undefined;
  setFriendRequestsSent: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  friendRequestsReceived: string[] | undefined;
  setFriendRequestsReceived: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  blockedUsers: string[] | null;
  setBlockedUsers: React.Dispatch<React.SetStateAction<string[] | null>>;
  handleAddRemoveUserAsOrganizer: (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLLIElement, MouseEvent>,
    organizers: string[],
    setOrganizers: React.Dispatch<React.SetStateAction<string[]>>,
    user: TUser,
    event?: TEvent
  ) => void;
  handleBlockUser: (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | null,
    setBlockedUsers?: React.Dispatch<React.SetStateAction<string[] | null>>
  ) => void;
  handleUnblockUser: (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | null,
    setBlockedUsers?: React.Dispatch<React.SetStateAction<string[] | null>>
  ) => void;
  currentOtherUser: TUser | null;
  setCurrentOtherUser: React.Dispatch<React.SetStateAction<TUser | null>>;
  handleSendFriendRequest: (
    sender: TUser | undefined,
    recipient: TUser,
    friendRequestsSent?: string[],
    setFriendRequestsSent?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  handleRetractFriendRequest: (
    sender: TUser,
    recipient: TUser,
    friendRequestsSent?: string[],
    setFriendRequestsSent?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  showFriendRequestResponseOptions: boolean;
  setShowFriendRequestResponseOptions: React.Dispatch<React.SetStateAction<boolean>>;
  handleUnfriending: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user: TUser,
    friend: TUser,
    friends?: string[],
    setFriends?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  handleAcceptFriendRequest: (
    e: React.ChangeEvent<HTMLInputElement>,
    sender: TUser,
    receiver: TUser,
    friendRequestsReceived?: string[],
    setFriendRequestsReceived?: React.Dispatch<
      React.SetStateAction<string[] | undefined>
    >,
    friends?: string[],
    setFriends?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  handleRejectFriendRequest: (
    e: React.ChangeEvent<HTMLInputElement>,
    sender: TUser,
    receiver: TUser,
    friendRequestsReceived?: string[],
    setFriendRequestsReceived?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  accountDeletionInProgress: boolean;
  setAccountDeletionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  showUpdateProfileImageInterface: boolean;
  setShowUpdateProfileImageInterface: React.Dispatch<React.SetStateAction<boolean>>;
  removeProfileImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  valuesToUpdate: TUserValuesToUpdate;
  handleProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  profileImage: string | unknown;
  setProfileImage: React.Dispatch<React.SetStateAction<string | unknown>>;
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
  resetLoginOrSignupFormFieldsAndErrors: () => void;
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
  whoCanAddUserAsOrganizer: "anyone" | "friends" | "nobody" | undefined;
  setWhoCanAddUserAsOrganizer: React.Dispatch<
    React.SetStateAction<"anyone" | "friends" | "nobody" | undefined>
  >;
  whoCanInviteUser: "anyone" | "friends" | "nobody" | undefined;
  setWhoCanInviteUser: React.Dispatch<
    React.SetStateAction<"anyone" | "friends" | "nobody" | undefined>
  >;
  profileVisibleTo: "anyone" | "friends" | "friends of friends" | undefined;
  setProfileVisibleTo: React.Dispatch<
    React.SetStateAction<"anyone" | "friends" | "friends of friends" | undefined>
  >;
  whoCanMessage: "anyone" | "friends" | "nobody" | "friends of friends" | undefined;
  setWhoCanMessage: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "friends of friends" | "nobody" | undefined
    >
  >;
  fetchAllUsers: () => Promise<void>;
  userCreatedAccount: null | boolean;
  setUserCreatedAccount: React.Dispatch<React.SetStateAction<boolean | null>>;
  allUsers: TUser[];
  currentUser: TUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<TUser | null>>;
};

export type TEventContext = {
  handleRemoveInvitee: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | null,
    displayedUsers?: TUser[],
    setDisplayedUsers?: React.Dispatch<React.SetStateAction<TUser[]>>
  ) => void;
  handleDeclineInvitation: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => void;
  eventDeletionIsInProgress: boolean;
  setEventDeletionIsInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  allEvents: TEvent[];
  setAllEvents: React.Dispatch<React.SetStateAction<TEvent[]>>;
  addEventIsInProgress: boolean;
  setAddEventIsInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  currentEvent: TEvent | undefined;
  setCurrentEvent: React.Dispatch<React.SetStateAction<TEvent | undefined>>;
  fetchAllEvents: () => Promise<void>;
  eventEditIsInProgress: boolean;
  setEventEditIsInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    setUserRSVPd?: React.Dispatch<React.SetStateAction<boolean | null>>
  ) => void;
  handleDeleteUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser,
    setUserRSVPd?: React.Dispatch<React.SetStateAction<boolean | null>>,
    displayedUsers?: TUser[],
    setDisplayedUsers?: React.Dispatch<React.SetStateAction<TUser[]>>
  ) => void;
};
