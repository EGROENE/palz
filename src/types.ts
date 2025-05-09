import React from "react";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import mongoose from "mongoose";

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
  profileImage: string;
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
  whoCanSeeLocation: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  displayFriendCount: boolean;
  whoCanSeeFriendsList:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeePhoneNumber:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeEmailAddress:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeFacebook: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  whoCanSeeX: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  whoCanSeeInstagram: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  whoCanSeeEventsOrganized:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeEventsInterestedIn:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeEventsInvitedTo:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
};

export type TEvent = {
  _id?: string;
  blockedUsersEvent: string[];
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
  images: string[];
  city: string | undefined;
  stateProvince: string | undefined;
  country: string | undefined;
  address: string | undefined;
  additionalInfo: string;
  interestedUsers: string[];
  disinterestedUsers: string[];
  relatedInterests: string[];
};

export type TChat = {
  _id: string | mongoose.Types.ObjectId;
  members: string[];
  messages: TMessage[];
  dateCreated: number;
  chatName: string | undefined;
  chatType: "two-member" | "group";
  admins?: string[];
};

export type TMessage = {
  _id: string | mongoose.Types.ObjectId;
  sender: string;
  content: string;
  timeSent: number;
  image: string;
  seenBy: { user: string; time: number }[];
  timeEdited?: number | undefined;
};

export type TChatValuesToUpdate = {
  members?: string[];
  messages?: TMessage[];
  dateCreated?: number;
  chatName?: string;
  admins?: string[];
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
  whoCanSeeLocation?: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  displayFriendCount?: boolean;
  whoCanSeeFriendsList?:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeePhoneNumber?:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeEmailAddress?:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeFacebook?: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  whoCanSeeX?: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  whoCanSeeInstagram?: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  whoCanSeeEventsOrganized?:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeEventsInterestedIn?:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  whoCanSeeEventsInvitedTo?:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
};

export type TEventValuesToUpdate = {
  relatedInterests?: string[] | undefined;
  blockedUsersEvent?: string[] | undefined;
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
  showMobileNavOptions: boolean;
  setShowMobileNavOptions: React.Dispatch<React.SetStateAction<boolean>>;
  currentRoute: string;
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
  userHasLoggedIn: boolean;
  allOtherUsers: TUser[];
  fetchAllUsersQuery: UseQueryResult<TUser[], Error>;
  friends: string[] | undefined;
  setFriends: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  friendRequestsSent: string[] | undefined;
  setFriendRequestsSent: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  friendRequestsReceived: string[] | undefined;
  setFriendRequestsReceived: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  blockedUsers: string[] | undefined;
  setBlockedUsers: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists: (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | undefined,
    setBlockedUsers?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  handleUnblockUser: (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | undefined,
    setBlockedUsers?: React.Dispatch<React.SetStateAction<string[] | undefined>>
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
    user: TUser,
    friend: TUser,
    friends?: string[],
    setFriends?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => void;
  handleAcceptFriendRequest: (
    sender: TUser,
    receiver: TUser,
    friendRequestsReceived?: string[],
    setFriendRequestsReceived?: React.Dispatch<
      React.SetStateAction<string[] | undefined>
    >,
    friends?: string[],
    setFriends?: React.Dispatch<React.SetStateAction<string[] | undefined>>,
    e?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleRejectFriendRequest: (
    sender: TUser,
    receiver: TUser,
    friendRequestsReceived?: string[],
    setFriendRequestsReceived?: React.Dispatch<
      React.SetStateAction<string[] | undefined>
    >,
    e?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  accountDeletionInProgress: boolean;
  setAccountDeletionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  showUpdateProfileImageInterface: boolean;
  setShowUpdateProfileImageInterface: React.Dispatch<React.SetStateAction<boolean>>;
  removeProfileImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userValuesToUpdate: TUserValuesToUpdate;
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
  whoCanSeeLocation: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  setWhoCanSeeLocation: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  displayFriendCount: boolean | undefined;
  setDisplayFriendCount: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  whoCanSeeFriendsList:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  setWhoCanSeeFriendsList: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeePhoneNumber:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  setWhoCanSeePhoneNumber: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeEmailAddress:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  setWhoCanSeeEmailAddress: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeFacebook: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  setWhoCanSeeFacebook: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeX: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  setWhoCanSeeX: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeInstagram: "friends" | "anyone" | "nobody" | "friends of friends" | undefined;
  setWhoCanSeeInstagram: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeEventsOrganized:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  setWhoCanSeeEventsOrganized: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeEventsInterestedIn:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  setWhoCanSeeEventsInterestedIn: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  whoCanSeeEventsInvitedTo:
    | "friends"
    | "anyone"
    | "nobody"
    | "friends of friends"
    | undefined;
  setWhoCanSeeEventsInvitedTo: React.Dispatch<
    React.SetStateAction<
      "anyone" | "friends" | "nobody" | "friends of friends" | undefined
    >
  >;
  userCreatedAccount: null | boolean;
  setUserCreatedAccount: React.Dispatch<React.SetStateAction<boolean | null>>;
  allUsers: TUser[] | undefined;
  currentUser: TUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<TUser | null>>;
  updateProfileImageMutation: UseMutationResult<
    Response,
    Error,
    {
      currentUser: TUser | null;
      base64: unknown;
    },
    unknown
  >;
  removeProfileImageMutation: UseMutationResult<
    Response,
    Error,
    {
      currentUser: TUser | null;
      placeholder: string;
    },
    unknown
  >;
};

export type TEventContext = {
  handleRemoveOrganizer: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | null
  ) => void;
  showRSVPs: boolean;
  setShowRSVPs: React.Dispatch<React.SetStateAction<boolean>>;
  showInvitees: boolean;
  setShowInvitees: React.Dispatch<React.SetStateAction<boolean>>;
  displayedPotentialInviteeCount: number | undefined;
  setDisplayedPotentialInviteeCount: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  displayedPotentialBlockeeCount: number | undefined;
  setDisplayedPotentialBlockeeCount: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  displayedPotentialCoOrganizerCount: number | undefined;
  setDisplayedPotentialCoOrganizerCount: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  updateEventMutation: UseMutationResult<
    Response,
    Error,
    {
      event: TEvent;
      eventValuesToUpdate: TEventValuesToUpdate;
    },
    unknown
  >;
  createEventMutation: UseMutationResult<
    Response,
    Error,
    {
      eventInfos: TEvent;
    },
    unknown
  >;
  deleteEventMutation: UseMutationResult<
    Response,
    Error,
    {
      event: TEvent;
    },
    unknown
  >;
  eventValuesToUpdate: TEventValuesToUpdate | undefined;
  eventTitle: string;
  setEventTitle: React.Dispatch<React.SetStateAction<string>>;
  eventTitleError: string;
  setEventTitleError: React.Dispatch<React.SetStateAction<string>>;
  eventDescription: string;
  setEventDescription: React.Dispatch<React.SetStateAction<string>>;
  eventDescriptionError: string;
  setEventDescriptionError: React.Dispatch<React.SetStateAction<string>>;
  eventAdditionalInfo: string;
  setEventAdditionalInfo: React.Dispatch<React.SetStateAction<string>>;
  eventAdditionalInfoError: string;
  setEventAdditionalInfoError: React.Dispatch<React.SetStateAction<string>>;
  eventCity: string | undefined;
  setEventCity: React.Dispatch<React.SetStateAction<string | undefined>>;
  eventState: string | undefined;
  setEventState: React.Dispatch<React.SetStateAction<string | undefined>>;
  eventCountry: string | undefined;
  setEventCountry: React.Dispatch<React.SetStateAction<string | undefined>>;
  eventLocationError: string;
  setEventLocationError: React.Dispatch<React.SetStateAction<string>>;
  eventStartDateMidnightUTCInMS: number;
  setEventStartDateMidnightUTCInMS: React.Dispatch<React.SetStateAction<number>>;
  eventStartTimeAfterMidnightUTCInMS: number;
  setEventStartTimeAfterMidnightUTCInMS: React.Dispatch<React.SetStateAction<number>>;
  eventStartDateTimeError: string;
  setEventStartDateTimeError: React.Dispatch<React.SetStateAction<string>>;
  eventEndDateMidnightUTCInMS: number;
  setEventEndDateMidnightUTCInMS: React.Dispatch<React.SetStateAction<number>>;
  eventEndTimeAfterMidnightUTCInMS: number;
  setEventEndTimeAfterMidnightUTCInMS: React.Dispatch<React.SetStateAction<number>>;
  eventEndDateTimeError: string;
  setEventEndDateTimeError: React.Dispatch<React.SetStateAction<string>>;
  eventAddress: string | undefined;
  setEventAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  eventAddressError: string;
  setEventAddressError: React.Dispatch<React.SetStateAction<string>>;
  maxParticipants: number | null;
  setMaxParticipants: React.Dispatch<React.SetStateAction<number | null>>;
  publicity: "public" | "private";
  setPublicity: React.Dispatch<React.SetStateAction<"public" | "private">>;
  organizers: string[];
  setOrganizers: React.Dispatch<React.SetStateAction<string[]>>;
  invitees: string[];
  setInvitees: React.Dispatch<React.SetStateAction<string[]>>;
  relatedInterests: string[];
  setRelatedInterests: React.Dispatch<React.SetStateAction<string[]>>;
  addEventImageMutation: UseMutationResult<
    Response,
    Error,
    {
      event: TEvent;
      base64: string;
    },
    unknown
  >;
  removeEventImageMutation: UseMutationResult<
    Response,
    Error,
    {
      event: TEvent;
      imageToBeRemoved: string;
    },
    unknown
  >;
  eventImages: string[];
  setEventImages: React.Dispatch<React.SetStateAction<string[]>>;
  blockedUsersEvent: string[];
  setBlockedUsersEvent: React.Dispatch<React.SetStateAction<string[]>>;
  fetchAllEventsQuery: UseQueryResult<TEvent[], Error>;
  handleAddRemoveUserAsOrganizer: (
    organizers: string[],
    setOrganizers: React.Dispatch<React.SetStateAction<string[]>>,
    user: TUser,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  handleAddRemoveUserAsInvitee: (
    invitees: string[],
    setInvitees: React.Dispatch<React.SetStateAction<string[]>>,
    user?: TUser
  ) => void;
  handleRemoveInvitee: (
    event: TEvent,
    user: TUser | null,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => void;
  handleDeclineInvitation: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => void;
  eventDeletionIsInProgress: boolean;
  setEventDeletionIsInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  addEventIsInProgress: boolean;
  setAddEventIsInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  currentEvent: TEvent | undefined;
  setCurrentEvent: React.Dispatch<React.SetStateAction<TEvent | undefined>>;
  eventEditIsInProgress: boolean;
  setEventEditIsInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddRemoveBlockedUserOnEvent: (user?: TUser) => void;
  handleAddUserRSVP: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => void;
  handleDeleteUserRSVP: (
    event: TEvent,
    user: TUser,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent> | undefined
  ) => void;
};

export type TChatContext = {
  handleUpdateChatName: (chat: TChat) => void;
  showEditChatNameModal: boolean;
  setShowEditChatNameModal: React.Dispatch<React.SetStateAction<boolean>>;
  startConversation: (otherUser: TUser) => void;
  getStartOrOpenChatWithUserHandler: (otherUser: TUser) => void;
  getTotalNumberOfUnreadMessages: (chatArray: TChat[]) => string | number;
  handleSaveEditedMessage: (chat: TChat, editedMessage: TMessage) => void;
  cancelEditingMessage: () => void;
  startEditingMessage: (message: TMessage) => void;
  messageBeingEdited: TMessage | undefined;
  setMessageBeingEdited: React.Dispatch<React.SetStateAction<TMessage | undefined>>;
  showAreYouSureYouWantToDeleteChat: boolean;
  setShowAreYouSureYouWantToDeleteChat: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteChat: (chatID: string) => void;
  showAreYouSureYouWantToRemoveYourselfAsAdmin: boolean;
  setShowAreYouSureYouWantToRemoveYourselfAsAdmin: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  handleRemoveAdminFromChat: (user: TUser, chat: TChat) => void;
  handleAddAdminToChat: (user: TUser, chat: TChat) => void;
  showMembers: boolean;
  setShowMembers: React.Dispatch<React.SetStateAction<boolean>>;
  showAreYouSureYouWantToLeaveChat: boolean;
  setShowAreYouSureYouWantToLeaveChat: React.Dispatch<React.SetStateAction<boolean>>;
  admins: string[];
  setAdmins: React.Dispatch<React.SetStateAction<string[]>>;
  showAddMemberModal: boolean;
  setShowAddMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddMultipleUsersToChat: (users: string[], chat: TChat) => void;
  createChatMutation: UseMutationResult<
    Response,
    Error,
    {
      chat: TChat;
    },
    unknown
  >;
  handleCreateChat: (chat: TChat) => void;
  chatCreationInProgress: boolean;
  setChatCreationInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  markMessagesAsRead: (chat: TChat) => void;
  areNewMessages: boolean;
  setAreNewMessages: React.Dispatch<React.SetStateAction<boolean>>;
  getNumberOfUnreadMessagesInChat: (chat: TChat) => string | number;
  handleDeleteMessage: (chat: TChat, messageID: string | mongoose.Types.ObjectId) => void;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (chat: TChat, content: string) => void;
  handleOpenChat: (chat: TChat) => void;
  handleChatNameInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchChatMembersInput: (
    e: React.ChangeEvent<HTMLInputElement>,
    showList: boolean,
    setShowList: React.Dispatch<React.SetStateAction<boolean>>,
    searchArray: TUser[],
    resetFunction: Function
  ) => void;
  getCurrentOtherUserFriends: (otherUser: TUser) => TUser[];
  showPotentialChatMembers: boolean;
  setShowPotentialChatMembers: React.Dispatch<React.SetStateAction<boolean>>;
  potentialChatMembers: TUser[];
  setPotentialChatMembers: React.Dispatch<React.SetStateAction<TUser[]>>;
  chatMembersSearchQuery: string;
  setChatMembersSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  chatName: string | undefined;
  setChatName: React.Dispatch<React.SetStateAction<string | undefined>>;
  chatNameError: string;
  setChatNameError: React.Dispatch<React.SetStateAction<string>>;
  handleRemoveUserFromChat: (user: TUser, chat: TChat) => void;
  handleAddRemoveUserFromChat: (
    user: TUser,
    usersToAddToChat: string[],
    setUsersToAddToChat: React.Dispatch<React.SetStateAction<string[]>>,
    chat?: TChat
  ) => void;
  usersToAddToChat: string[];
  setUsersToAddToChat: React.Dispatch<React.SetStateAction<string[]>>;
  numberOfPotentialChatMembersDisplayed: number | undefined;
  setNumberOfPotentialChatMembersDisplayed: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  currentChat: TChat | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<TChat | null>>;
  showChatModal: boolean;
  setShowChatModal: React.Dispatch<React.SetStateAction<boolean>>;
  getChatMembers: (members: string[]) => TUser[];
  fetchChatsQuery: UseQueryResult<TChat[], Error>;
  showCreateNewChatModal: boolean;
  setShowCreateNewChatModal: React.Dispatch<React.SetStateAction<boolean>>;
};
