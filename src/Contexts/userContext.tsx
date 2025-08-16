import { createContext, ReactNode, useState, useEffect } from "react";
import {
  TUserContext,
  TUser,
  TUserValuesToUpdate,
  TUserSecure,
  TBarebonesUser,
  TEvent,
} from "../types";
import { useMainContext } from "../Hooks/useMainContext";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import { usernameIsValid, passwordIsValid, emailIsValid } from "../validations";
import Requests from "../requests";
import toast from "react-hot-toast";
import Methods from "../methods";
import { useNavigate } from "react-router-dom";
import mongoose from "mongoose";

export const UserContext = createContext<TUserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigate();

  const {
    maximumNumberOfUsersDB,
    theme,
    setIsLoading,
    setError,
    error,
    setShowWelcomeMessage,
    welcomeMessageDisplayTime,
    displayedItems,
    setDisplayedItems,
  } = useMainContext();

  if (error) {
    throw new Error(error);
  }

  const [currentUser, setCurrentUser] = useLocalStorage<TUser | null>(
    "currentUser",
    null
  );
  const [userCreatedAccount, setUserCreatedAccount] = useLocalStorage<boolean | null>(
    "userCreatedAccount",
    null
  );

  const [showUpdateProfileImageInterface, setShowUpdateProfileImageInterface] =
    useState<boolean>(false);
  const [accountDeletionInProgress, setAccountDeletionInProgress] =
    useState<boolean>(false);
  const [showFriendRequestResponseOptions, setShowFriendRequestResponseOptions] =
    useState<boolean>(false);

  const [signupIsSelected, setSignupIsSelected] = useState<boolean>(false);

  const [blockUserInProgress, setBlockUserInProgress] = useState<boolean>(false);

  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);
  const [confirmationPasswordIsHidden, setConfirmationPasswordIsHidden] =
    useState<boolean>(true);

  const [updateProfileImageIsLoading, setUpdateProfileImageIsLoading] =
    useState<boolean>(false);

  const [removeProfileImageIsLoading, setRemoveProfileImageIsLoading] =
    useState<boolean>(false);

  /* Some values on currentUser are kept separately from currentUser. These are initialized to corresponding values from DB. These will be compared to values in DB when user changes these in Settings to render certain form UI. They can also be used for optimistic rendering, in that they update quicker than state values that depend on request to DB going thru, then state values being set after that. Corresponding values in DB are still updated in the background; if these requests fail, then these parallel state values below will reset to what they were before the change.*/
  const [index, setIndex] = useSessionStorage<number | undefined>("index", undefined);
  const [lastLogin, setLastLogin] = useSessionStorage<number>(
    "lastLogin",
    currentUser && currentUser.lastLogin > 0 ? currentUser.lastLogin : 0
  );
  const [firstName, setFirstName, removeFirstName] = useSessionStorage<
    string | undefined
  >("firstName", "");
  const [lastName, setLastName, removeLastName] = useSessionStorage<string | undefined>(
    "lastName",
    ""
  );
  const [username, setUsername, removeUsername] = useSessionStorage<string | undefined>(
    "username",
    ""
  );
  const [emailAddress, setEmailAddress, removeEmailAddress] = useSessionStorage<
    string | undefined
  >("emailAddress", "");
  const [phoneCountry, setPhoneCountry, removePhoneCountry] = useSessionStorage<
    string | undefined
  >("phoneCountry", "");
  const [phoneCountryCode, setPhoneCountryCode, removePhoneCountryCode] =
    useSessionStorage<string | undefined>("phoneCountryCode", "");
  const [
    phoneNumberWithoutCountryCode,
    setPhoneNumberWithoutCountryCode,
    removePhoneNumberWithoutCountryCode,
  ] = useSessionStorage<string | undefined>("phoneNumberWithoutCountryCode", "");
  const [password, setPassword, removePassword] = useSessionStorage<string | undefined>(
    "password",
    ""
  );
  const [confirmationPassword, setConfirmationPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useSessionStorage<string | unknown>(
    "profileImage",
    currentUser?.profileImage !== "" ? currentUser?.profileImage : ""
  );
  const [userCity, setUserCity, removeUserCity] = useSessionStorage<string | undefined>(
    "city",
    ""
  );
  const [userState, setUserState, removeUserState] = useSessionStorage<
    string | undefined
  >("state", "");
  const [userCountry, setUserCountry, removeUserCountry] = useSessionStorage<
    string | undefined
  >("country", "");
  const [facebook, setFacebook, removeFacebook] = useSessionStorage<string | undefined>(
    "facebook",
    ""
  );
  const [instagram, setInstagram, removeInstagram] = useSessionStorage<
    string | undefined
  >("instagram", "");
  const [x, setX, removeX] = useSessionStorage<string | undefined>("x", "");
  const [userAbout, setUserAbout, removeUserAbout] = useSessionStorage<
    string | undefined
  >("userAbout", "");
  const [whoCanAddUserAsOrganizer, setWhoCanAddUserAsOrganizer] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanAddUserAsOrganizer", "anyone");
  const [whoCanInviteUser, setWhoCanInviteUser] = useSessionStorage<
    "anyone" | "friends" | "friends of friends" | "nobody" | undefined
  >("whoCanInviteUser", "anyone");
  const [profileVisibleTo, setProfileVisibleTo] = useSessionStorage<
    "anyone" | "friends" | "friends of friends" | undefined
  >("profileVisibleTo", "anyone");
  const [whoCanMessage, setWhoCanMessage] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanMessage", "anyone");
  const [displayFriendCount, setDisplayFriendCount] = useSessionStorage<
    boolean | undefined
  >("displayFriendCount", true);
  const [whoCanSeeLocation, setWhoCanSeeLocation] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeLocation", "nobody");
  const [whoCanSeeFriendsList, setWhoCanSeeFriendsList] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeFriendsList", "nobody");
  const [whoCanSeePhoneNumber, setWhoCanSeePhoneNumber] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeePhoneNumber", "nobody");
  const [whoCanSeeEmailAddress, setWhoCanSeeEmailAddress] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeEmailAddress", "nobody");
  const [whoCanSeeFacebook, setWhoCanSeeFacebook] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeFacebook", "nobody");
  const [whoCanSeeX, setWhoCanSeeX] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeX", "nobody");
  const [whoCanSeeInstagram, setWhoCanSeeInstagram] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeInstagram", "nobody");
  const [whoCanSeeEventsOrganized, setWhoCanSeeEventsOrganized] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeEventsOrganized", "nobody");
  const [whoCanSeeEventsInterestedIn, setWhoCanSeeEventsInterestedIn] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeEventsInterestedIn", "nobody");
  const [whoCanSeeEventsInvitedTo, setWhoCanSeeEventsInvitedTo] = useSessionStorage<
    "anyone" | "friends" | "nobody" | "friends of friends" | undefined
  >("whoCanSeeEventsInvitedTo", "nobody");
  const [blockedUsers, setBlockedUsers] = useState<TBarebonesUser[] | null>(null);
  const [friendRequestsSent, setFriendRequestsSent] = useState<TBarebonesUser[] | null>(
    null
  );
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<
    TBarebonesUser[] | null
  >(null);
  /////////////////////////////////////////////////////////////////////////////////

  const [loginMethod, setLoginMethod] = useState<"username" | "email">("username");
  const [showPasswordCriteria, setShowPasswordCriteria] = useState<boolean>(false);
  const [showUsernameCriteria, setShowUsernameCriteria] = useState<boolean>(false);

  // Boolean values relating to input-field errors:
  const [firstNameError, setFirstNameError] = useState<string>(
    "Please fill out this field"
  );
  const [lastNameError, setLastNameError] = useState<string>(
    "Please fill out this field"
  );
  const [usernameError, setUsernameError] = useState<string>(
    "Please fill out this field"
  );
  const [emailError, setEmailError] = useState<string>("Please fill out this field");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>(
    "Please fill out this field"
  );
  const [locationError, setLocationError] = useState<string>("");
  const [confirmationPasswordError, setConfirmationPasswordError] = useState<string>(
    "Please fill out this field"
  );
  const [facebookError, setFacebookError] = useState<string>("");
  const [instagramError, setInstagramError] = useState<string>("");
  const [xError, setXError] = useState<string>("");
  const [userAboutError, setUserAboutError] = useState<string>("");

  const [showErrors, setShowErrors] = useState<boolean>(false);

  const [ongoingEvents, setOngoingEvents] = useState<TEvent[] | null>(null);
  const [upcomingEventsUserRSVPdTo, setUpcomingEventsUserRSVPdTo] = useState<
    TEvent[] | null
  >(null);
  const [upcomingEventsUserOrganizes, setUpcomingEventsUserOrganizes] = useState<
    TEvent[] | null
  >(null);
  const [recentEventsUserRSVPdTo, setRecentEventsUserRSVPdTo] = useState<TEvent[] | null>(
    null
  );
  const [upcomingEventsUserInvitedTo, setUpcomingEventsUserInvitedTo] = useState<
    TEvent[] | null
  >(null);
  const [recentEventsUserOrganized, setRecentEventsUserOrganized] = useState<
    TEvent[] | null
  >(null);

  const [currentOtherUser, setCurrentOtherUser] = useLocalStorage<TUserSecure | null>(
    "currentOtherUser",
    null
  );

  // For every mutation made to a query, the query will need to be invalidated so that the data refreshes
  // Mutations can be used anywhere in app
  // If cached data exists, this is shown until data is updated after a mutation (automatically renders then)

  // Examples of keys:
  // /posts ---> ["posts"]
  // /posts/1 ---> ["posts", post.id]
  // /posts?authorId=1 ---> ["posts", {authorId: 1}]
  // /posts/2/comments ---> ["posts", post.id, "comments"]

  // Values pertaining to fetch of blockedUsers & friendRequestsSent/Received are defined here so they can be optimisically updated throughout the project
  const [fetchBlockedUsersIsLoading, setFetchBlockedUsersIsLoading] =
    useState<boolean>(false);
  const [fetchBlockedUsersIsError, setFetchBlockedUsersIsError] =
    useState<boolean>(false);

  const [fetchFriendRequestsIsLoading, setFetchFriendRequestsIsLoading] =
    useState<boolean>(true);

  const [fetchFriendRequestsSentIsError, setFetchFriendRequestsSentIsError] =
    useState<boolean>(false);

  const [fetchFriendRequestsReceivedIsError, setFetchFriendRequestsReceivedIsError] =
    useState<boolean>(false);

  const [processingLoginIsLoading, setProcessingLoginIsLoading] =
    useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.blockedUsers.length > 0) {
        const promisesToAwait = currentUser.blockedUsers.map((id) => {
          return Requests.getUserByID(id).then((res) => {
            return res.json().then((user: TUser) => user);
          });
        });

        setFetchBlockedUsersIsLoading(true);
        Promise.all(promisesToAwait)
          .then((pic: TUser[]) => {
            setBlockedUsers(pic.map((p) => Methods.getTBarebonesUser(p)));
          })
          .catch((error) => {
            console.log(error);
            setFetchBlockedUsersIsError(true);
          })
          .finally(() => setFetchBlockedUsersIsLoading(false));
      } else {
        setBlockedUsers([]);
      }
    }
  }, [currentUser?.blockedUsers]);

  // For each id in FR sent, get full TUser, set friendRequestsSent to TBarebonesUser of sender TUser object
  useEffect(() => {
    if (currentUser) {
      if (currentUser.friendRequestsSent.length > 0) {
        const promisesToAwaitFRSent = currentUser.friendRequestsSent.map((id) => {
          return Requests.getUserByID(id).then((res) => {
            return res.json().then((user: TUser) => user);
          });
        });

        Promise.all(promisesToAwaitFRSent)
          .then((usersToWhomSentFR: TUser[]) => {
            setFriendRequestsSent(
              usersToWhomSentFR.map((u) => Methods.getTBarebonesUser(u))
            );
          })
          .catch((error) => {
            console.log(error);
            setFetchFriendRequestsSentIsError(true);
          })
          .finally(() => {
            if (friendRequestsReceived && currentUser) {
              setFetchFriendRequestsIsLoading(false);
            }
          });
      } else {
        setFriendRequestsSent([]);
      }
    }
  }, [currentUser?.friendRequestsSent]);

  // For each id in FR receeived, get full TUser, set friendRequestsReceived to TBarebonesUser of receiver TUser object
  useEffect(() => {
    if (currentUser) {
      if (currentUser.friendRequestsReceived.length > 0) {
        const promisesToAwaitFRReceived = currentUser.friendRequestsReceived.map((id) => {
          return Requests.getUserByID(id).then((res) => {
            return res.json().then((user: TUser) => user);
          });
        });

        Promise.all(promisesToAwaitFRReceived)
          .then((usersFromWhomFRReceived: TUser[]) => {
            setFriendRequestsReceived(
              usersFromWhomFRReceived.map((u) => Methods.getTBarebonesUser(u))
            );
          })
          .catch((error) => {
            console.log(error);
            setFetchFriendRequestsReceivedIsError(true);
          })
          .finally(() => {
            if (friendRequestsSent && currentUser) {
              setFetchFriendRequestsIsLoading(false);
            }
          });
      } else {
        setFriendRequestsReceived([]);
      }
    }
  }, [currentUser?.friendRequestsReceived]);

  const userHasLoggedIn = currentUser && userCreatedAccount !== null ? true : false;

  const userData: TUser = {
    _id: new mongoose.Types.ObjectId(),
    lastLogin: lastLogin,
    index: index,
    firstName: Methods.formatHyphensAndSpacesInString(
      Methods.formatCapitalizedName(firstName)
    ),
    lastName: Methods.formatHyphensAndSpacesInString(
      Methods.formatCapitalizedName(lastName)
    ),
    username: username?.trim(),
    emailAddress: emailAddress?.trim().toLowerCase(),
    password: password?.trim(),
    hostingCredits: 0,
    city: "",
    stateProvince: "",
    country: "",
    phoneCountry: "",
    phoneCountryCode: "",
    phoneNumberWithoutCountryCode: "",
    instagram: "",
    facebook: "",
    x: "",
    profileImage: "",
    friends: [],
    about: "",
    subscriptionType: "free",
    interests: [],
    whoCanAddUserAsOrganizer: "anyone",
    whoCanInviteUser: "anyone",
    profileVisibleTo: "anyone",
    whoCanMessage: "anyone",
    whoCanSeeLocation: "nobody",
    displayFriendCount: true,
    whoCanSeeFriendsList: "nobody",
    whoCanSeePhoneNumber: "nobody",
    whoCanSeeEmailAddress: "nobody",
    whoCanSeeFacebook: "nobody",
    whoCanSeeX: "nobody",
    whoCanSeeInstagram: "nobody",
    whoCanSeeEventsOrganized: "nobody",
    whoCanSeeEventsInterestedIn: "nobody",
    whoCanSeeEventsInvitedTo: "nobody",
    friendRequestsReceived: [],
    friendRequestsSent: [],
    blockedUsers: [],
    blockedBy: [],
  };

  /* 
  To be used whenever there is not already access to otherUser's friends list, as request is made to DB in order to access the friends list
  */
  const getOtherUserFriends = (otherUserID: string): TUser[] => {
    /*
    First, get TUser object (so that friends list can be accessed) by using getUserByID w/ param otherUserID. Then, loop thru each of otherUser friends, getting access to their friends lists by using getUserByID request w/ otherUser friend's _id. Then, push each of their friends to otherUserFriends, & return this at end of function.
    */
    let otherUserFriends: TUser[] = [];
    Requests.getUserByID(otherUserID)
      .then((response) => {
        if (response.ok) {
          response.json().then((otherUser) => {
            for (const otherUserFriendID of otherUser.friends) {
              Requests.getUserByID(otherUserFriendID)
                .then((response) => {
                  if (response.ok) {
                    response.json().then((otherUserFriend) => {
                      otherUserFriends.push(otherUserFriend);
                    });
                  } else {
                    setError("Error getting other user's friends (TUser[])");
                  }
                })
                .catch((error) => console.log(error));
            }
          });
        } else {
          setError("Error getting other user's friends (TUser[])");
        }
      })
      .catch((error) => console.log(error));
    return otherUserFriends;
  };

  const handleUpdateProfileImageFail = (): void => {
    toast.error(
      "Could not update profile image. Please make sure the image is 50MB or less & try again.",
      {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      }
    );
  };

  const handleReceiveFriendRequestFail = (sender: TUser, recipient: TUserSecure) => {
    if (recipient._id && friendRequestsSent) {
      // If FR was sent, but recipient didn't receive it (request failed), delete sent FR from sender:
      Requests.removeFromFriendRequestsSent(sender, recipient)
        .then((res) => {
          if (!res.ok) {
            toast.error("Couldn't send request. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleRemoveFriendRequestFail = (
    sender: TUserSecure | TBarebonesUser,
    recipientID: string | undefined,
    event?: "accept-request" | "retract-request" | "reject-request"
  ) => {
    if (recipientID) {
      Requests.getUserByID(recipientID)
        .then((res) =>
          res.json().then((recipient) => {
            if (sender._id) {
              Requests.getUserByID(sender._id.toString())
                .then((res) => {
                  if (res.ok) {
                    res.json().then((sender: TUser) => {
                      if (event === "accept-request") {
                        // Remove sender & receiver from each other's 'friends' array, add sender back to receivers FR-received array:
                        Promise.all([
                          Requests.deleteFriendFromFriendsArray(sender, recipient),
                          Requests.deleteFriendFromFriendsArray(recipient, sender),
                          Requests.addToFriendRequestsSent(sender, recipient),
                          Requests.addToFriendRequestsReceived(sender, recipient),
                        ])
                          .then((res) => {
                            if (res.some((promiseResult) => !promiseResult.ok)) {
                              handleRemoveFriendRequestFail(
                                sender,
                                recipient._id.toString(),
                                event
                              );
                            }
                          })
                          .catch((error) => console.log(error));

                        toast.error(
                          "Could not accept friend request. Please try again.",
                          {
                            style: {
                              background:
                                theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                              color: theme === "dark" ? "black" : "white",
                              border: "2px solid red",
                            },
                          }
                        );
                      } else {
                        Promise.all([
                          Requests.addToFriendRequestsSent(sender, recipient),
                          Requests.addToFriendRequestsReceived(sender, recipient),
                        ])
                          .then((res) => {
                            if (res.some((promiseResult) => !promiseResult.ok)) {
                              handleRemoveFriendRequestFail(
                                sender,
                                recipient._id.toString(),
                                event
                              );
                            }
                          })
                          .catch((error) => console.log(error));

                        if (event === "retract-request") {
                          toast.error("Couldn't retract request. Please try again.", {
                            style: {
                              background:
                                theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                              color: theme === "dark" ? "black" : "white",
                              border: "2px solid red",
                            },
                          });
                        }

                        if (event === "reject-request") {
                          toast.error(
                            "Could not reject friend request. Please try again.",
                            {
                              style: {
                                background:
                                  theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                                color: theme === "dark" ? "black" : "white",
                                border: "2px solid red",
                              },
                            }
                          );
                        }
                      }
                    });
                  } else {
                    handleRemoveFriendRequestFail(sender, recipientID, event);
                  }
                })
                .catch((error) => console.log(error));
            }
          })
        )
        .catch((error) => console.log(error));
    }
  };

  const resetFriendsAfterFailedAcceptedFriendRequest = (
    userOne: TUser,
    userTwo: TUser
  ): void => {
    if (userTwo._id && userOne.friends.includes(userTwo._id.toString())) {
      Requests.deleteFriendFromFriendsArray(userOne, userTwo)
        .then((res) => {
          if (!res.ok) {
            resetFriendsAfterFailedAcceptedFriendRequest(userOne, userTwo);
          }
        })
        .catch((error) => console.log(error));
    }

    if (userOne._id && userTwo.friends.includes(userOne._id.toString())) {
      Requests.deleteFriendFromFriendsArray(userTwo, userOne)
        .then((res) => {
          if (!res.ok) {
            resetFriendsAfterFailedAcceptedFriendRequest(userTwo, userOne);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const resetFriendRequestsAfterFailedAcceptedFriendRequest = (
    sender: TUser,
    recipient: TUser
  ): void => {
    if (recipient._id && !sender.friendRequestsSent.includes(recipient._id.toString())) {
      Requests.addToFriendRequestsSent(sender, recipient._id.toString())
        .then((res) => {
          if (!res.ok) {
            resetFriendRequestsAfterFailedAcceptedFriendRequest(sender, recipient);
          }
        })
        .catch((error) => console.log(error));
    }

    if (sender._id && !recipient.friendRequestsReceived.includes(sender._id.toString())) {
      Requests.addToFriendRequestsReceived(sender, recipient)
        .then((res) => {
          if (!res.ok) {
            resetFriendRequestsAfterFailedAcceptedFriendRequest(sender, recipient);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleAddToFriendsFail = (receiver: TUser, sender: TUser): void => {
    toast.error("Could not accept friend request. Please try again.", {
      style: {
        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
        color: theme === "dark" ? "black" : "white",
        border: "2px solid red",
      },
    });

    resetFriendsAfterFailedAcceptedFriendRequest(sender, receiver);

    resetFriendRequestsAfterFailedAcceptedFriendRequest(sender, receiver);
  };

  // Called when user switches b/t login & signup forms & when user logs out
  // Only necessary to reset errors for fields on login and/or signup form
  const resetLoginOrSignupFormFieldsAndErrors = (): void => {
    removeFirstName();
    setFirstNameError("Please fill out this field");
    removeLastName();
    setLastNameError("Please fill out this field");
    removeUsername();
    setUsernameError("Please fill out this field");
    removeEmailAddress();
    setEmailError("Please fill out this field");
    removePhoneCountry();
    removePhoneCountryCode();
    removePhoneNumberWithoutCountryCode();
    setPhoneNumberError("");
    removePassword();
    setPasswordError("Please fill out this field");
    setConfirmationPassword("");
    setConfirmationPasswordError("Please fill out this field");
    removeUserCity();
    removeUserState();
    removeUserCountry();
    removeFacebook();
    removeInstagram();
    removeX();
    removeUserAbout();
    setShowErrors(false);
    setShowUsernameCriteria(false);
    setShowPasswordCriteria(false);
    setLoginMethod("username");
  };

  const toggleSignupLogin = (): void => {
    signupIsSelected ? navigation("/login") : navigation("/signup");
    setSignupIsSelected(!signupIsSelected);
    resetLoginOrSignupFormFieldsAndErrors();
  };

  const toggleHidePassword = (type: "password" | "confirmation-password"): void => {
    if (type === "password") {
      setPasswordIsHidden(!passwordIsHidden);
    } else {
      setConfirmationPasswordIsHidden(!confirmationPasswordIsHidden);
    }
  };

  // Defined here, not in SignupForm, as it's used in some handlers that are used in multiple components
  const areNoSignupFormErrors: boolean =
    firstNameError === "" &&
    lastNameError === "" &&
    usernameError === "" &&
    emailError === "" &&
    passwordError === "" &&
    confirmationPasswordError === "";

  // Input-handling methods:
  // Put here, since used in multiple components
  const handleNameInput = (
    name: string,
    isFirstName: boolean,
    formType: "signup" | "edit-user-info"
  ) => {
    const nameNoSpecialCharsCleaned = Methods.nameNoSpecialChars(name).replace(
      /\s+/g,
      " "
    );

    isFirstName
      ? setFirstName(nameNoSpecialCharsCleaned)
      : setLastName(nameNoSpecialCharsCleaned);

    if (formType === "signup") {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } else {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      }
    } else {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } else {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      }
    }
  };

  const handleUsernameInput = (
    inputUsername: string,
    formType: "signup" | "edit-user-info"
  ): void => {
    if (inputUsername.length <= 20 && usernameIsValid(inputUsername)) {
      setUsername(inputUsername);
    }

    if (formType === "signup") {
      if (!inputUsername.length) {
        setUsernameError("Please fill out this field");
      } else if (inputUsername.length < 4) {
        setUsernameError(
          "Username must be 4-20 characters long & may only contain alphanumeric characters"
        );
      } else {
        setUsernameError("");
      }
    } else {
      if (inputUsername.length < 4) {
        setUsernameError(
          "Username must be 4-20 characters long & may only contain alphanumeric characters"
        );
      } else {
        setUsernameError("");
      }
    }

    if (inputUsername.toLowerCase() === "undefined") {
      setUsernameError("Invalid username");
    }
  };

  const handleEmailAddressInput = (
    inputEmailAddress: string,
    formType: "signup" | "edit-user-info"
  ): void => {
    const inputEmailAddressNoWhitespaces = inputEmailAddress.replace(/\s/g, "");

    setEmailAddress(inputEmailAddressNoWhitespaces.toLowerCase());

    if (formType === "signup") {
      if (!inputEmailAddressNoWhitespaces.length) {
        setEmailError("Please fill out this field");
      } else if (
        !emailIsValid(inputEmailAddressNoWhitespaces.toLowerCase()) &&
        inputEmailAddressNoWhitespaces !== ""
      ) {
        setEmailError("Invalid e-mail address");
      } else {
        setEmailError("");
      }
    } else {
      if (inputEmailAddressNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      } else if (
        !emailIsValid(inputEmailAddressNoWhitespaces.toLowerCase()) &&
        inputEmailAddressNoWhitespaces !== ""
      ) {
        setEmailError("Invalid e-mail address");
      } else {
        setEmailError("");
      }
    }
  };

  const handlePasswordInput = (
    inputPassword: string,
    formType: "login" | "signup" | "edit-user-info"
  ): void => {
    setPassword(inputPassword.replace(/\s+/g, ""));

    /* Use inputPassword w/ no whitespaces in logic checks below, as it is more current that the state value 'password', which may lag behind, causing logic checks to be inaccurate */
    const inputPWNoWhitespaces = inputPassword.replace(/\s/g, "");

    // Handle input pw on login form:
    if (formType === "login") {
      // If currentUser exists & there is non-whitespace input in password field:
      // If input pw is empty string...
      if (inputPWNoWhitespaces === "") {
        setPasswordError("Please fill out this field");
        // If input pw isn't empty string & is unequal to current user's pw, and input pw isn't empty string...
      } else if (!passwordIsValid(inputPWNoWhitespaces)) {
        setPasswordError("Invalid password");
        // If no error conditions are true, remove error message...
      } else {
        setPasswordError("");
      }
      // Handle input pw on edit-user-info form:
    } else if (formType === "edit-user-info") {
      if (inputPWNoWhitespaces !== "") {
        if (
          confirmationPassword === "" &&
          inputPWNoWhitespaces !== currentUser?.password
        ) {
          setConfirmationPasswordError("Please confirm new password");
        }

        // If pw isn't/is valid...
        if (!passwordIsValid(inputPWNoWhitespaces)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }

        // If confirmationPassword has at least 1 char & is not equal to pw input...
        if (
          confirmationPassword !== "" &&
          inputPWNoWhitespaces !== confirmationPassword
        ) {
          setConfirmationPasswordError("Passwords don't match");
        }

        // If input pw matches confirmation pw (which contains at least 1 char)...
        if (
          inputPWNoWhitespaces === confirmationPassword &&
          confirmationPassword !== ""
        ) {
          setConfirmationPasswordError("");
        }
      } else {
        setPasswordError("Please fill out this field");
      }
      // If used on signup form:
    } else if (formType === "signup") {
      if (inputPWNoWhitespaces !== "") {
        // If pw isn't/is valid...
        if (!passwordIsValid(inputPWNoWhitespaces)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }

        // If confirmationPassword has at least 1 char & is not equal to pw input...
        if (
          confirmationPassword !== "" &&
          inputPWNoWhitespaces !== confirmationPassword
        ) {
          setConfirmationPasswordError("Passwords don't match");
        }

        // If input pw matches confirmation pw (which contains at least 1 char)...
        if (
          inputPWNoWhitespaces === confirmationPassword &&
          confirmationPassword !== ""
        ) {
          setConfirmationPasswordError("");
        }
      } else {
        setPasswordError("Please fill out this field");
      }
    }
  };

  const handleConfirmationPasswordInput = (
    inputConfirmationPassword: string,
    formType: "login" | "signup" | "edit-user-info"
  ): void => {
    const inputConfirmationPWNoWhitespaces = inputConfirmationPassword.replace(/\s/g, "");

    setConfirmationPassword(inputConfirmationPWNoWhitespaces);

    /* Condition to set currentUser should be all other errors === "" && allSignupFormFieldsFilled && (confirmationPasswordError === "Passwords don't match" | confirmationPasswordError === ""), b/c, in this handler, setting of this error state value lags. */
    if (formType === "signup") {
      if (inputConfirmationPWNoWhitespaces !== password && password !== "") {
        if (inputConfirmationPWNoWhitespaces !== "") {
          setConfirmationPasswordError("Passwords don't match");
        } else {
          setConfirmationPasswordError("Please confirm password");
        }
      } else {
        setConfirmationPasswordError("");
      }
    }
  };

  // This method is used on login form, where user can input either their username or email to log in
  const handleUsernameOrEmailInput = async (input: string) => {
    const inputNoWhitespaces = input.replace(/\s/g, "");

    // If input matches pattern for an email:
    if (emailIsValid(inputNoWhitespaces.toLowerCase())) {
      setUsername("");
      setUsernameError("");
      setLoginMethod("email");
      if (inputNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      }
      setEmailAddress(inputNoWhitespaces);
      // If field isn't empty string:
      if (inputNoWhitespaces !== "") {
        if (emailError !== "") {
          setEmailError("");
        }
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      }
    } else {
      // If input doesn't match pattern of an email address (is a username):
      setEmailAddress("");
      setEmailError("");
      setLoginMethod("username");
      setUsername(inputNoWhitespaces);
      if (inputNoWhitespaces === "") {
        setUsernameError("Please fill out this field");
      }
      // If username doesn't exist & its field contains at least 1 character:
      if (inputNoWhitespaces !== "") {
        if (usernameError !== "") {
          setUsernameError("");
        }
        if (inputNoWhitespaces.length < 4) {
          setUsernameError("Username must be at least 4 characters long");
        } else {
          setUsernameError("");
        }
        // If pw isn't valid & isn't empty string...
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
      }
    }
  };

  const handleCityStateCountryInput = (
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
  ): void => {
    // Set appropriate state values based on field in question
    // Throw error when a location field is filled out and at least one other is not. Otherwise, no error thrown.
    if (e) {
      if (locationType === "city") {
        if (setters.citySetter) {
          setters.citySetter(Methods.nameNoSpecialChars(e.target.value));
        }
        if (
          (e.target.value !== "" &&
            (stateValues.state === "" || stateValues.country === "")) ||
          (e.target.value === "" &&
            (stateValues.state !== "" || stateValues.country !== ""))
        ) {
          setters.errorSetter("Please fill out all 3 location fields");
        } else {
          setters.errorSetter("");
        }
      } else if (locationType === "state") {
        if (setters.stateSetter) {
          setters.stateSetter(Methods.nameNoSpecialChars(e.target.value));
        }
        if (
          (e.target.value !== "" &&
            (stateValues.city === "" || stateValues.country === "")) ||
          (e.target.value === "" &&
            (stateValues.city !== "" || stateValues.country !== ""))
        ) {
          setters.errorSetter("Please fill out all 3 location fields");
        } else {
          setters.errorSetter("");
        }
      }
    } else {
      if (setters.showCountriesSetter) {
        setters.showCountriesSetter(true); // Hide countries dropdown once one is selected (not sure why true is necessary)
      }
      if (setters.countrySetter) {
        setters.countrySetter(country);
      }
      if (
        country &&
        country !== "" &&
        (stateValues.city === "" || stateValues.state === "")
      ) {
        setters.errorSetter("Please fill out all 3 location fields");
      } else {
        setters.errorSetter("");
      }
    }
  };

  // maybe create separate request to update user profile img
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();
    setShowUpdateProfileImageInterface(false);
    const file = e.target.files && e.target.files[0];
    const base64 = file && (await Methods.convertToBase64(file));
    setUpdateProfileImageIsLoading(true);
    Requests.updateUserProfileImage(currentUser, base64)
      .then((res) => {
        if (res.ok) {
          if (currentUser && currentUser._id) {
            Requests.getUserByID(currentUser._id.toString())
              .then((res) => {
                if (res.ok) {
                  res
                    .json()
                    .then((user) => {
                      if (user) {
                        setCurrentUser(user);
                        setProfileImage(base64);
                        toast.success("Profile image updated", {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid green",
                          },
                        });
                      } else {
                        handleUpdateProfileImageFail();
                      }
                    })
                    .catch((error) => console.log(error))
                    .finally(() => setUpdateProfileImageIsLoading(false));
                } else {
                  setUpdateProfileImageIsLoading(false);
                  handleUpdateProfileImageFail();
                }
              })
              .catch((error) => console.log(error));
          }
        } else {
          setUpdateProfileImageIsLoading(false);
          handleUpdateProfileImageFail();
        }
      })
      .catch((error) => console.log(error));
  };

  const removeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setShowUpdateProfileImageInterface(false);
    setRemoveProfileImageIsLoading(true);
    Requests.updateUserProfileImage(currentUser, "")
      .then((res) => {
        if (res.ok) {
          if (currentUser && currentUser._id) {
            Requests.getUserByID(currentUser._id.toString())
              .then((res) => {
                if (res.ok) {
                  res.json().then((user) => {
                    setCurrentUser(user);
                    setProfileImage("");
                    toast("Profile image removed", {
                      style: {
                        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                        color: theme === "dark" ? "black" : "white",
                        border: "2px solid red",
                      },
                    });
                  });
                } else {
                  toast.error("Could not remove profile image. Please try again.", {
                    style: {
                      background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                      color: theme === "dark" ? "black" : "white",
                      border: "2px solid red",
                    },
                  });
                }
              })
              .catch((error) => console.log(error))
              .finally(() => setRemoveProfileImageIsLoading(false));
          }
        } else {
          setRemoveProfileImageIsLoading(false);
          toast.error("Could not remove profile image. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      })
      .catch((error) => console.log(error));
  };

  const handleSendFriendRequest = (
    recipient: TUserSecure | TUser | undefined,
    shouldOptimisticRender?: boolean
  ): void => {
    if (currentUser && recipient && recipient._id) {
      if (shouldOptimisticRender && friendRequestsSent && recipient && recipient._id) {
        setFriendRequestsSent(
          friendRequestsSent.concat(Methods.getTBarebonesUser(recipient))
        );
      }
      setIsLoading(true);

      Requests.getUserByID(recipient._id.toString()).then((res) => {
        if (res.ok) {
          res.json().then((rec: TUser) => {
            if (recipient._id) {
              Promise.all([
                Requests.addToFriendRequestsSent(currentUser, recipient._id.toString()),
                Requests.addToFriendRequestsReceived(currentUser, rec),
              ]).then((resArray: Response[]) => {
                if (resArray.every((res) => res.ok) && currentUser._id) {
                  Requests.getUserByID(currentUser._id.toString()).then((res) => {
                    if (res.ok) {
                      res
                        .json()
                        .then((cu: TUser) => {
                          setCurrentUser(cu);
                          toast.success("Friend request sent!", {
                            style: {
                              background:
                                theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                              color: theme === "dark" ? "black" : "white",
                              border: "2px solid green",
                            },
                          });
                        })
                        .catch((error) => console.log(error))
                        .finally(() => setIsLoading(false));
                    } else {
                      if (shouldOptimisticRender && friendRequestsSent) {
                        friendRequestsSent.filter(
                          (fr) => fr !== Methods.getTBarebonesUser(recipient)
                        );
                      }
                      handleReceiveFriendRequestFail(currentUser, recipient);
                    }
                  });
                } else {
                  if (shouldOptimisticRender && friendRequestsSent) {
                    friendRequestsSent.filter(
                      (fr) => fr !== Methods.getTBarebonesUser(recipient)
                    );
                  }
                  setIsLoading(false);
                  handleReceiveFriendRequestFail(currentUser, recipient);
                }
              });
            }
          });
        } else {
          if (shouldOptimisticRender && friendRequestsSent) {
            friendRequestsSent.filter(
              (fr) => fr !== Methods.getTBarebonesUser(recipient)
            );
          }
          setIsLoading(false);
          toast.error("Couldn't send request. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      });
    } else {
      toast.error("Couldn't send request. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  };

  const handleRetractFriendRequest = (
    recipient: TUserSecure | TUser,
    sender: TUserSecure | TUser
  ): void => {
    setIsLoading(true);

    if (currentUser && recipient && recipient._id) {
      Requests.getUserByID(recipient._id.toString())
        .then((res) => {
          if (res.ok) {
            res.json().then((rec: TUser) => {
              Promise.all([
                Requests.removeFromFriendRequestsSent(currentUser, recipient),
                Requests.removeFromFriendRequestsReceived(sender, rec),
              ]).then((resArray: Response[]) => {
                if (resArray.every((res) => res.ok) && currentUser && currentUser._id) {
                  Requests.getUserByID(currentUser._id.toString())
                    .then((res) => {
                      if (res.ok) {
                        res.json().then((user) => {
                          if (user) {
                            setCurrentUser(user);

                            toast("Friend request retracted", {
                              style: {
                                background:
                                  theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                                color: theme === "dark" ? "black" : "white",
                                border: "2px solid red",
                              },
                            });
                          } else {
                            handleRemoveFriendRequestFail(
                              sender,
                              recipient._id?.toString(),
                              "retract-request"
                            );
                          }
                        });
                      } else {
                        handleRemoveFriendRequestFail(
                          sender,
                          recipient._id?.toString(),
                          "retract-request"
                        );
                      }
                    })
                    .catch((error) => console.log(error))
                    .finally(() => setIsLoading(false));
                } else {
                  setIsLoading(false);
                  handleRemoveFriendRequestFail(
                    sender,
                    recipient._id?.toString(),
                    "retract-request"
                  );
                }
              });
            });
          } else {
            setIsLoading(false);
            handleRemoveFriendRequestFail(
              sender,
              recipient._id?.toString(),
              "retract-request"
            );
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleAcceptFriendRequest = (
    sender: TUserSecure,
    receiver: TUserSecure,
    optimisticRender: boolean,
    e?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    e?.preventDefault();
    setIsLoading(true);

    if (optimisticRender && friendRequestsReceived) {
      setFriendRequestsReceived(
        friendRequestsReceived.filter((r) => {
          if (r._id && sender._id) {
            return r._id.toString() !== sender._id.toString();
          }
        })
      );

      setDisplayedItems(
        displayedItems.filter((item) => item._id?.toString() !== sender._id?.toString())
      );
    }

    // Also put in handleRejectFR
    if (showFriendRequestResponseOptions) {
      setShowFriendRequestResponseOptions(false);
    }

    if (sender._id) {
      Requests.getUserByID(sender._id.toString())
        .then((res) => {
          if (res.ok) {
            res.json().then((sender) => {
              if (receiver._id) {
                Requests.getUserByID(receiver._id.toString())
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((receiver) => {
                        Promise.all([
                          Requests.addFriendToFriendsArray(receiver, sender),
                          Requests.addFriendToFriendsArray(sender, receiver),
                          Requests.removeFromFriendRequestsReceived(sender, receiver),
                          Requests.removeFromFriendRequestsSent(sender, receiver),
                        ])
                          .then((resArray) => {
                            if (resArray.some((res) => !res.ok)) {
                              if (optimisticRender && friendRequestsReceived) {
                                setFriendRequestsReceived(
                                  friendRequestsReceived.concat(
                                    Methods.getTBarebonesUser(sender)
                                  )
                                );
                              }
                              setDisplayedItems(displayedItems.concat(sender));
                              handleRemoveFriendRequestFail(
                                sender,
                                receiver._id.toString(),
                                "accept-request"
                              );
                            } else {
                              if (currentUser && currentUser._id) {
                                Requests.getUserByID(currentUser._id.toString())
                                  .then((res) => {
                                    if (res.ok) {
                                      res
                                        .json()
                                        .then((user: TUser) => {
                                          if (user) {
                                            setCurrentUser(user);
                                            toast.success(
                                              `You are now friends with ${sender.firstName} ${sender.lastName}!`,
                                              {
                                                style: {
                                                  background:
                                                    theme === "light"
                                                      ? "#242424"
                                                      : "rgb(233, 231, 228)",
                                                  color:
                                                    theme === "dark" ? "black" : "white",
                                                  border: "2px solid green",
                                                },
                                              }
                                            );
                                          } else {
                                            if (
                                              optimisticRender &&
                                              friendRequestsReceived
                                            ) {
                                              setFriendRequestsReceived(
                                                friendRequestsReceived.concat(
                                                  Methods.getTBarebonesUser(sender)
                                                )
                                              );
                                            }
                                            setDisplayedItems(
                                              displayedItems.concat(sender)
                                            );
                                            handleRemoveFriendRequestFail(
                                              sender,
                                              receiver?._id?.toString(),
                                              "accept-request"
                                            );
                                          }
                                        })
                                        .catch((error) => console.log(error));
                                    } else {
                                      if (optimisticRender && friendRequestsReceived) {
                                        setFriendRequestsReceived(
                                          friendRequestsReceived.concat(
                                            Methods.getTBarebonesUser(sender)
                                          )
                                        );
                                      }
                                      setDisplayedItems(displayedItems.concat(sender));
                                      handleRemoveFriendRequestFail(
                                        sender,
                                        receiver?._id?.toString(),
                                        "accept-request"
                                      );
                                    }
                                  })
                                  .catch((error) => console.log(error));
                              }
                            }
                          })
                          .catch((error) => console.log(error));
                        Requests.addFriendToFriendsArray(receiver, sender)
                          .then((res) => {
                            if (res.ok) {
                              // Remove FR from sender's sent FRs:
                              Requests.removeFromFriendRequestsSent(sender, receiver)
                                .then((res) => {
                                  if (res.ok) {
                                    if (receiver._id) {
                                      if (currentUser && currentUser._id) {
                                        // Fetch updated version of currentUser, set if successful:
                                      }
                                    }
                                  } else {
                                    handleRemoveFriendRequestFail(
                                      sender,
                                      receiver._id?.toString(),
                                      "accept-request"
                                    );
                                  }
                                })
                                .catch((error) => console.log(error))
                                .finally(() => setIsLoading(false));

                              if (currentUser && currentUser._id) {
                                Requests.getUserByID(currentUser._id.toString())
                                  .then((res) => {
                                    if (res.ok) {
                                      res
                                        .json()
                                        .then((user) => {
                                          if (user) {
                                            setCurrentUser(user);
                                          } else {
                                            handleAddToFriendsFail(receiver, sender);
                                          }
                                        })
                                        .catch((error) => console.log(error));
                                    } else {
                                      handleAddToFriendsFail(receiver, sender);
                                    }
                                  })
                                  .catch((error) => console.log(error));
                              }
                            } else {
                              handleAddToFriendsFail(receiver, sender);
                            }
                          })
                          .catch((error) => console.log(error));
                      });
                    } else {
                      if (optimisticRender && friendRequestsReceived) {
                        setFriendRequestsReceived(
                          friendRequestsReceived.concat(Methods.getTBarebonesUser(sender))
                        );
                      }
                      setDisplayedItems(displayedItems.concat(sender));
                      toast.error("Could not accept friend request. Please try again.", {
                        style: {
                          background:
                            theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                          color: theme === "dark" ? "black" : "white",
                          border: "2px solid red",
                        },
                      });
                    }
                  })
                  .catch((error) => console.log(error));
              }
            });
          } else {
            if (optimisticRender && friendRequestsReceived) {
              setFriendRequestsReceived(
                friendRequestsReceived.concat(Methods.getTBarebonesUser(sender))
              );
            }
            setDisplayedItems(displayedItems.concat(sender));
            toast.error("Could not accept friend request. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }
        })
        .catch((error) => console.log(error));
    }
  };

  // Could pass value to render FR received optimistically
  const handleRejectFriendRequest = (
    sender: TUserSecure | TBarebonesUser,
    e?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    e?.preventDefault();

    setIsLoading(true);

    setDisplayedItems(
      displayedItems.filter((item) => item._id?.toString() !== sender._id?.toString())
    );

    if (sender._id) {
      Requests.getUserByID(sender._id.toString())
        .then((res) => {
          if (res.ok) {
            res.json().then((sender: TUser) => {
              if (currentUser) {
                Promise.all([
                  Requests.removeFromFriendRequestsSent(sender, currentUser),
                  Requests.removeFromFriendRequestsReceived(sender, currentUser),
                ])
                  .then((resArray: Response[]) => {
                    if (resArray.every((res) => res.ok) && currentUser._id) {
                      Requests.getUserByID(currentUser._id.toString())
                        .then((res) => {
                          if (res.ok) {
                            res
                              .json()
                              .then((user) => {
                                if (user) {
                                  setCurrentUser(user);

                                  toast(
                                    `Rejected friend request from ${sender.firstName} ${sender.lastName}.`,
                                    {
                                      style: {
                                        background:
                                          theme === "light"
                                            ? "#242424"
                                            : "rgb(233, 231, 228)",
                                        color: theme === "dark" ? "black" : "white",
                                        border: "2px solid red",
                                      },
                                    }
                                  );
                                } else {
                                  setDisplayedItems(displayedItems.concat(sender));
                                  handleRemoveFriendRequestFail(
                                    sender,
                                    currentUser._id?.toString(),
                                    "reject-request"
                                  );
                                }
                              })
                              .catch((error) => console.log(error));
                          } else {
                            setDisplayedItems(displayedItems.concat(sender));
                            handleRemoveFriendRequestFail(
                              sender,
                              currentUser._id?.toString(),
                              "reject-request"
                            );
                          }
                        })
                        .catch((error) => console.log(error))
                        .finally(() => setIsLoading(false));
                    } else {
                      setIsLoading(false);
                      setDisplayedItems(displayedItems.concat(sender));
                      handleRemoveFriendRequestFail(
                        sender,
                        currentUser._id?.toString(),
                        "reject-request"
                      );
                    }
                  })
                  .catch((error) => console.log(error));
              }
            });
          } else {
            setIsLoading(false);
            setDisplayedItems(displayedItems.concat(sender));
            handleRemoveFriendRequestFail(
              sender,
              currentUser?._id?.toString(),
              "reject-request"
            );
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleUnfriendingFail = (friend: TUserSecure): void => {
    setIsLoading(false);
    toast.error(
      `Couldn't unfriend ${friend.firstName} ${friend.lastName}. Please try again.`,
      {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      }
    );
  };

  const handleUnfriending = (
    user: TUserSecure | TUser,
    friend: TUserSecure | TUser,
    array?: (TUserSecure | TBarebonesUser | TEvent)[],
    setArray?: React.Dispatch<
      React.SetStateAction<(TBarebonesUser | TUserSecure | TEvent)[]>
    >
  ): void => {
    if (user._id) {
      if (
        array &&
        setArray &&
        array.every(
          (elem) => Methods.isTBarebonesUser(elem) || Methods.isTUserSecure(elem)
        )
      ) {
        setArray(
          array.filter((u) => {
            if (u._id && friend._id) {
              return u._id.toString() !== friend._id.toString();
            }
          })
        );
      }

      Requests.getUserByID(user._id.toString())
        .then((res) => {
          if (res.ok) {
            res.json().then((user: TUser) => {
              if (friend._id) {
                Requests.getUserByID(friend._id.toString())
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((friend: TUser) => {
                        setIsLoading(true);
                        Promise.all([
                          Requests.deleteFriendFromFriendsArray(user, friend),
                          Requests.deleteFriendFromFriendsArray(friend, user),
                        ])
                          .then((resArray: Response[]) => {
                            if (
                              currentUser &&
                              currentUser._id &&
                              resArray.every((res) => res.ok)
                            ) {
                              Requests.getUserByID(currentUser._id.toString())
                                .then((res) => {
                                  if (res.ok) {
                                    res
                                      .json()
                                      .then((user) => {
                                        if (user) {
                                          setCurrentUser(user);
                                          toast(
                                            `You have unfriended ${friend.firstName} ${friend.lastName}.`,
                                            {
                                              style: {
                                                background:
                                                  theme === "light"
                                                    ? "#242424"
                                                    : "rgb(233, 231, 228)",
                                                color:
                                                  theme === "dark" ? "black" : "white",
                                                border: "2px solid red",
                                              },
                                            }
                                          );
                                        } else {
                                          if (
                                            array &&
                                            setArray &&
                                            array.every(
                                              (elem) =>
                                                Methods.isTBarebonesUser(elem) ||
                                                Methods.isTUserSecure(elem)
                                            )
                                          ) {
                                            Methods.isTUser(friend) && currentUser
                                              ? setArray(
                                                  array.concat(
                                                    Methods.getTUserSecureFromTUser(
                                                      friend,
                                                      currentUser
                                                    )
                                                  )
                                                )
                                              : setArray(array.concat(friend));
                                          }
                                          handleUnfriendingFail(friend);
                                        }
                                      })
                                      .catch((error) => console.log(error));
                                  } else {
                                    if (
                                      array &&
                                      setArray &&
                                      array.every(
                                        (elem) =>
                                          Methods.isTBarebonesUser(elem) ||
                                          Methods.isTUserSecure(elem)
                                      )
                                    ) {
                                      Methods.isTUser(friend) && currentUser
                                        ? setArray(
                                            array.concat(
                                              Methods.getTUserSecureFromTUser(
                                                friend,
                                                currentUser
                                              )
                                            )
                                          )
                                        : setArray(array.concat(friend));
                                    }
                                    handleUnfriendingFail(friend);
                                  }
                                })
                                .catch((error) => console.log(error));
                            } else {
                              if (
                                array &&
                                setArray &&
                                array.every(
                                  (elem) =>
                                    Methods.isTBarebonesUser(elem) ||
                                    Methods.isTUserSecure(elem)
                                )
                              ) {
                                Methods.isTUser(friend) && currentUser
                                  ? setArray(
                                      array.concat(
                                        Methods.getTUserSecureFromTUser(
                                          friend,
                                          currentUser
                                        )
                                      )
                                    )
                                  : setArray(array.concat(friend));
                              }
                              handleUnfriendingFail(friend);
                            }
                          })
                          .catch((error) => console.log(error))
                          .finally(() => setIsLoading(false));
                      });
                    } else {
                      if (
                        array &&
                        setArray &&
                        array.every(
                          (elem) =>
                            Methods.isTBarebonesUser(elem) || Methods.isTUserSecure(elem)
                        )
                      ) {
                        Methods.isTUser(friend) && currentUser
                          ? setArray(
                              array.concat(
                                Methods.getTUserSecureFromTUser(friend, currentUser)
                              )
                            )
                          : setArray(array.concat(friend));
                      }
                      handleUnfriendingFail(friend);
                    }
                  })
                  .catch((error) => console.log(error));
              }
            });
          } else {
            if (
              array &&
              setArray &&
              array.every(
                (elem) => Methods.isTBarebonesUser(elem) || Methods.isTUserSecure(elem)
              )
            ) {
              Methods.isTUser(friend) && currentUser
                ? setArray(
                    array.concat(Methods.getTUserSecureFromTUser(friend, currentUser))
                  )
                : setArray(array.concat(friend));
            }
            handleUnfriendingFail(friend);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const handleUnblockUserFail = (blockee: TBarebonesUser): void => {
    setIsLoading(false);
    if (blockedUsers && setBlockedUsers) {
      setBlockedUsers(blockedUsers);
    }
    toast.error(`Unable to unblock ${blockee.username}. Please try again.`, {
      style: {
        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
        color: theme === "dark" ? "black" : "white",
        border: "2px solid red",
      },
    });
  };

  // No mutation needed here, as operation is simpler than blocking
  const handleUnblockUser = (blocker: TBarebonesUser, blockee: TBarebonesUser): void => {
    setIsLoading(true);

    if (blockedUsers && setBlockedUsers) {
      setBlockedUsers(blockedUsers.filter((bu) => bu._id !== blockee._id?.toString()));
    }

    if (blocker._id) {
      Requests.getUserByID(blocker._id.toString())
        .then((res) => {
          if (res.ok) {
            res
              .json()
              .then((blocker: TUser) => {
                if (blockee._id) {
                  Requests.getUserByID(blockee._id.toString())
                    .then((res) => {
                      if (res.ok) {
                        res
                          .json()
                          .then((blockee: TUser) => {
                            if (blockee._id && blocker._id) {
                              Promise.all([
                                Requests.removeFromBlockedUsers(
                                  blocker,
                                  blockee._id.toString()
                                ),
                                Requests.removeFromBlockedBy(
                                  blockee,
                                  blocker._id.toString()
                                ),
                              ])
                                .then((resArray: Response[]) => {
                                  if (
                                    resArray.every((res) => res.ok) &&
                                    currentUser &&
                                    currentUser._id
                                  ) {
                                    Requests.getUserByID(currentUser._id.toString())
                                      .then((res) => {
                                        if (res.ok) {
                                          setIsLoading(false);
                                          res.json().then((user: TUser) => {
                                            setCurrentUser(user);
                                            toast.success(
                                              `Unblocked ${blockee.username}.`,
                                              {
                                                style: {
                                                  background:
                                                    theme === "light"
                                                      ? "#242424"
                                                      : "rgb(233, 231, 228)",
                                                  color:
                                                    theme === "dark" ? "black" : "white",
                                                  border: "2px solid green",
                                                },
                                              }
                                            );
                                          });
                                        } else {
                                          handleUnblockUserFail(
                                            Methods.getTBarebonesUser(blockee)
                                          );
                                        }
                                      })
                                      .catch((error) => console.log(error));
                                  } else {
                                    handleUnblockUserFail(
                                      Methods.getTBarebonesUser(blockee)
                                    );
                                  }
                                })
                                .catch((error) => console.log(error));
                            }
                          })
                          .catch((error) => console.log(error));
                      } else {
                        handleUnblockUserFail(Methods.getTBarebonesUser(blockee));
                      }
                    })
                    .catch((error) => console.log(error));
                }
              })
              .catch((error) => console.log(error));
          } else {
            handleUnblockUserFail(blockee);
          }
        })
        .catch((error) => console.log(error));
    } else {
      handleUnblockUserFail(Methods.getTBarebonesUser(blockee));
    }
  };

  // Defined here, as it's used in methods that are used in multiple components
  const allSignupFormFieldsFilled: boolean =
    firstName !== "" &&
    lastName !== "" &&
    username !== "" &&
    emailAddress !== "" &&
    password !== "" &&
    confirmationPassword !== "";

  const areNoLoginErrors: boolean =
    usernameError === "" && emailError === "" && passwordError === "";

  const allLoginInputsFilled: boolean =
    (username !== "" || emailAddress !== "") && password !== "";

  // If a data point is updated, it is used in PATCH request to update its part of the user's data object in DB
  const userValuesToUpdate: TUserValuesToUpdate = {
    ...(firstName?.trim() !== "" &&
      firstName !== currentUser?.firstName && {
        firstName: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(firstName?.trim())
        ),
      }),
    ...(lastName?.trim() !== "" &&
      lastName !== currentUser?.lastName && {
        lastName: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(lastName?.trim())
        ),
      }),
    ...(username !== "" && username !== currentUser?.username && { username: username }),
    ...(emailAddress !== "" &&
      emailAddress !== currentUser?.emailAddress && {
        emailAddress: emailAddress?.trim(),
      }),
    ...(password !== "" &&
      password !== currentUser?.password && { password: password?.replace(/\s+/g, "") }),
    ...(phoneCountry !== "" &&
      phoneCountry !== currentUser?.phoneCountry && { phoneCountry: phoneCountry }),
    ...(phoneCountryCode !== "" &&
      phoneCountryCode !== currentUser?.phoneCountryCode && {
        phoneCountryCode: phoneCountryCode,
      }),
    ...(phoneNumberWithoutCountryCode !== "" &&
      phoneNumberWithoutCountryCode !== currentUser?.phoneNumberWithoutCountryCode && {
        phoneNumberWithoutCountryCode: phoneNumberWithoutCountryCode,
      }),
    ...(userCity !== "" &&
      userCity !== currentUser?.city && {
        city: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(userCity?.trim())
        ),
      }),
    ...(userState !== "" &&
      userState !== currentUser?.stateProvince && {
        stateProvince: Methods.formatHyphensAndSpacesInString(
          Methods.formatCapitalizedName(userState?.trim())
        ),
      }),
    ...(userCountry !== "" &&
      userCountry !== currentUser?.country && { country: userCountry }),
    ...(facebook !== currentUser?.facebook && { facebook: facebook }),
    ...(instagram !== currentUser?.instagram && { instagram: instagram }),
    ...(x !== currentUser?.x && { x: x }),
    ...(userAbout !== currentUser?.about && { about: userAbout?.trim() }),
    ...(whoCanAddUserAsOrganizer !== currentUser?.whoCanAddUserAsOrganizer && {
      whoCanAddUserAsOrganizer: whoCanAddUserAsOrganizer,
    }),
    ...(whoCanInviteUser !== currentUser?.whoCanInviteUser && {
      whoCanInviteUser: whoCanInviteUser,
    }),
    ...(profileVisibleTo !== currentUser?.profileVisibleTo && {
      profileVisibleTo: profileVisibleTo,
    }),
    ...(whoCanMessage !== currentUser?.whoCanMessage && {
      whoCanMessage: whoCanMessage,
    }),
    ...(whoCanSeeLocation !== currentUser?.whoCanSeeLocation && {
      whoCanSeeLocation: whoCanSeeLocation,
    }),
    ...(displayFriendCount !== currentUser?.displayFriendCount && {
      displayFriendCount: displayFriendCount,
    }),
    ...(whoCanSeeFriendsList !== currentUser?.whoCanSeeFriendsList && {
      whoCanSeeFriendsList: whoCanSeeFriendsList,
    }),
    ...(whoCanSeePhoneNumber !== currentUser?.whoCanSeePhoneNumber && {
      whoCanSeePhoneNumber: whoCanSeePhoneNumber,
    }),
    ...(whoCanSeeEmailAddress !== currentUser?.whoCanSeeEmailAddress && {
      whoCanSeeEmailAddress: whoCanSeeEmailAddress,
    }),
    ...(whoCanSeeFacebook !== currentUser?.whoCanSeeFacebook && {
      whoCanSeeFacebook: whoCanSeeFacebook,
    }),
    ...(whoCanSeeX !== currentUser?.whoCanSeeX && {
      whoCanSeeX: whoCanSeeX,
    }),
    ...(whoCanSeeInstagram !== currentUser?.whoCanSeeInstagram && {
      whoCanSeeInstagram: whoCanSeeInstagram,
    }),
    ...(whoCanSeeEventsOrganized !== currentUser?.whoCanSeeEventsOrganized && {
      whoCanSeeEventsOrganized: whoCanSeeEventsOrganized,
    }),
    ...(whoCanSeeEventsInterestedIn !== currentUser?.whoCanSeeEventsInterestedIn && {
      whoCanSeeEventsInterestedIn: whoCanSeeEventsInterestedIn,
    }),
    ...(whoCanSeeEventsInvitedTo !== currentUser?.whoCanSeeEventsInvitedTo && {
      whoCanSeeEventsInvitedTo: whoCanSeeEventsInvitedTo,
    }),
  };

  const setParallelValuesAfterLogin = (currentUser: TUser): void => {
    setIndex(currentUser?.index);
    setFirstName(currentUser?.firstName);
    setLastName(currentUser?.lastName);
    setUsername(currentUser?.username);
    setProfileImage(currentUser?.profileImage);
    setEmailAddress(currentUser?.emailAddress);
    setPassword(currentUser?.password);
    setPhoneCountry(currentUser?.phoneCountry);
    setPhoneCountryCode(currentUser?.phoneCountryCode);
    setPhoneNumberWithoutCountryCode(currentUser?.phoneNumberWithoutCountryCode);
    setUserCity(currentUser?.city);
    setUserState(currentUser?.stateProvince);
    setUserCountry(currentUser?.country);
    setFacebook(currentUser?.facebook);
    setInstagram(currentUser?.instagram);
    setX(currentUser?.x);
    setUserAbout(currentUser?.about);
    setWhoCanAddUserAsOrganizer(currentUser?.whoCanAddUserAsOrganizer);
    setProfileVisibleTo(currentUser?.profileVisibleTo);
    setWhoCanMessage(currentUser?.whoCanMessage);
    setDisplayFriendCount(currentUser?.displayFriendCount);
    setWhoCanSeeLocation(currentUser?.whoCanSeeLocation);
    setWhoCanSeeFriendsList(currentUser?.whoCanSeeFriendsList);
    setWhoCanSeePhoneNumber(currentUser?.whoCanSeePhoneNumber);
    setWhoCanSeeEmailAddress(currentUser?.whoCanSeeEmailAddress);
    setWhoCanSeeFacebook(currentUser?.whoCanSeeFacebook);
    setWhoCanSeeX(currentUser?.whoCanSeeX);
    setWhoCanSeeInstagram(currentUser?.whoCanSeeInstagram);
    setWhoCanSeeEventsOrganized(currentUser?.whoCanSeeEventsOrganized);
    setWhoCanSeeEventsInterestedIn(currentUser?.whoCanSeeEventsInterestedIn);
    setWhoCanSeeEventsInvitedTo(currentUser?.whoCanSeeEventsInvitedTo);
  };

  const resetErrorMessagesAfterLogin = (): void => {
    if (usernameError !== "") {
      setUsernameError("");
    }
    if (emailError !== "") {
      setEmailError("");
    }
    if (passwordError !== "") {
      setPasswordError("");
    }
  };

  const setParallelValuesAfterSignup = (): void => {
    setIndex(userData.index);
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
    setUsername(userData.username);
    setProfileImage(userData.profileImage);
    setEmailAddress(userData.emailAddress);
    setPassword(userData.password);
    setPhoneCountry(userData.phoneCountry);
    setPhoneCountryCode(userData.phoneCountryCode);
    setPhoneNumberWithoutCountryCode(userData.phoneNumberWithoutCountryCode);
    setUserCity(userData.city);
    setUserState(userData.stateProvince);
    setUserCountry(userData.country);
    setFacebook(userData.facebook);
    setInstagram(userData.instagram);
    setX(userData.x);
    setUserAbout(userData.about);
    setWhoCanAddUserAsOrganizer(userData.whoCanAddUserAsOrganizer);
    setWhoCanInviteUser(userData.whoCanInviteUser);
    setProfileVisibleTo(userData.profileVisibleTo);
    setWhoCanMessage(userData.whoCanMessage);
    setDisplayFriendCount(userData.displayFriendCount);
    setWhoCanSeeLocation(userData.whoCanSeeLocation);
    setWhoCanSeeFriendsList(userData.whoCanSeeFriendsList);
    setWhoCanSeePhoneNumber(userData.whoCanSeePhoneNumber);
    setWhoCanSeeEmailAddress(userData.whoCanSeeEmailAddress);
    setWhoCanSeeFacebook(userData.whoCanSeeFacebook);
    setWhoCanSeeX(userData.whoCanSeeX);
    setWhoCanSeeInstagram(userData.whoCanSeeInstagram);
    setWhoCanSeeEventsOrganized(userData.whoCanSeeEventsOrganized);
    setWhoCanSeeEventsInterestedIn(userData.whoCanSeeEventsInterestedIn);
    setWhoCanSeeEventsInvitedTo(userData.whoCanSeeEventsInvitedTo);
  };

  const resetErrorMessagesAfterSignup = (): void => {
    if (firstNameError !== "") {
      setFirstNameError("");
    }
    if (lastNameError !== "") {
      setLastNameError("");
    }
    if (usernameError !== "") {
      setUsernameError("");
    }
    if (emailError !== "") {
      setEmailError("");
    }
    if (passwordError !== "") {
      setPasswordError("");
    }
    if (confirmationPasswordError != "") {
      setConfirmationPasswordError("");
    }
  };

  const handleSignupOrLoginFormSubmission = async (
    isOnSignup: boolean,
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setShowErrors(true);
    /*
     It will only be necessary to check if username or email address already exist on other users in DB, as errors & completion are checked in onClick, and this function is only called if there are no errors and if all forms are complete. If username or email address do exist, alert user & reject submission; else, accept submission.
    */

    // Handle submit of login form:
    if (!isOnSignup && password) {
      if (username && username !== "") {
        setProcessingLoginIsLoading(true);
        Requests.getUserByUsernameOrEmailAddress(password, username)
          .then((res) => {
            if (res.status === 401) {
              setProcessingLoginIsLoading(false);
              toast.error("Invalid credentials", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            } else if (res.status === 404) {
              setProcessingLoginIsLoading(false);
              toast.error("User doesn't exist", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            } else if (res.status === 500) {
              setProcessingLoginIsLoading(false);
              toast.error("Could not log you in. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            } else if (res.ok) {
              res.json().then((json) => {
                const now = Date.now();
                Requests.patchUpdatedUserInfo(json.user, { "lastLogin": now })
                  .then((res) => {
                    if (res.ok) {
                      setCurrentUser(json.user);
                      setShowWelcomeMessage(true);
                      setUserCreatedAccount(false);
                      navigation("/");
                      setLastLogin(now);
                      setParallelValuesAfterLogin(json.user);
                      resetErrorMessagesAfterLogin();
                      setTimeout(() => {
                        setShowWelcomeMessage(false);
                        setProcessingLoginIsLoading(false);
                        navigation(`/homepage/${json.user.username}`);
                      }, welcomeMessageDisplayTime);
                    } else {
                      setProcessingLoginIsLoading(false);
                      toast.error("Could not log you in. Please try again.", {
                        style: {
                          background:
                            theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                          color: theme === "dark" ? "black" : "white",
                          border: "2px solid red",
                        },
                      });
                    }
                  })
                  .catch((error) => console.log(error));
              });
            } else {
              setProcessingLoginIsLoading(false);
              toast.error("Could not log you in. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }
          })
          .catch((error) => console.log(error));
      }

      if (emailAddress && emailAddress !== "") {
        setProcessingLoginIsLoading(true);
        Requests.getUserByUsernameOrEmailAddress(password, undefined, emailAddress)
          .then((res) => {
            if (res.status === 401) {
              toast.error("Invalid credentials", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
              setProcessingLoginIsLoading(false);
            } else if (res.status === 500) {
              setProcessingLoginIsLoading(false);
              toast.error("Could not log you in. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            } else if (res.ok) {
              res.json().then((json) => {
                const now = Date.now();
                Requests.patchUpdatedUserInfo(json.user, { "lastLogin": now })
                  .then((res) => {
                    if (res.ok) {
                      setCurrentUser(json.user);
                      setShowWelcomeMessage(true);
                      setUserCreatedAccount(false);
                      navigation("/");
                      setParallelValuesAfterLogin(json.user);
                      setLastLogin(now);
                      resetErrorMessagesAfterLogin();
                      setTimeout(() => {
                        setShowWelcomeMessage(false);
                        navigation(`/homepage/${json.user.username}`);
                        setProcessingLoginIsLoading(false);
                      }, welcomeMessageDisplayTime);
                    } else {
                      setProcessingLoginIsLoading(false);
                      toast.error("Could not log you in. Please try again.", {
                        style: {
                          background:
                            theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                          color: theme === "dark" ? "black" : "white",
                          border: "2px solid red",
                        },
                      });
                    }
                  })
                  .catch((error) => console.log(error));
              });
            } else {
              setProcessingLoginIsLoading(false);
              toast.error("Could not log you in. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }
          })
          .catch((error) => console.log(error));
      }
    }

    // Handle submit of signup form:
    if (isOnSignup) {
      if ((username && username !== "") || (emailAddress && emailAddress !== "")) {
        // run newUserMutation. handle errors there
        setProcessingLoginIsLoading(true);
        Requests.getAllUsers()
          .then((res) => {
            if (res.ok) {
              res.json().then((allUsers) => {
                setIndex(allUsers.length);

                if (allUsers.length >= maximumNumberOfUsersDB) {
                  setProcessingLoginIsLoading(false);
                  setUserCreatedAccount(false);
                  toast.error(
                    "Sorry, but due to potential spamming douchebags & this only being a portfolio project, only 50 user accounts in total can be created at this time.",
                    {
                      style: {
                        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                        color: theme === "dark" ? "black" : "white",
                        border: "2px solid red",
                      },
                    }
                  );
                } else {
                  setLastLogin(Date.now());
                  Requests.createUser(userData)
                    .then((res) => {
                      if (res.status === 409) {
                        setProcessingLoginIsLoading(false);
                        if (res.statusText === "USERNAME & EMAIL TAKEN") {
                          setUsernameError("Username already in use");
                          setEmailError("E-mail address already in use");
                        }
                        if (res.statusText === "USERNAME TAKEN") {
                          setUsernameError("Username already in use");
                        }
                        if (res.statusText === "EMAIL TAKEN") {
                          setEmailError("E-mail address already in use");
                        }
                      } else if (res.ok) {
                        setShowWelcomeMessage(true);
                        setTimeout(() => {
                          setShowWelcomeMessage(false);
                          navigation(`/homepage/${userData.username}`);
                          setProcessingLoginIsLoading(false);
                        }, welcomeMessageDisplayTime);
                        setCurrentUser(userData);
                        navigation("/");
                        setUserCreatedAccount(true);
                        setParallelValuesAfterSignup();
                        resetErrorMessagesAfterSignup();
                      } else {
                        setUserCreatedAccount(false);
                        toast.error("Could not set up your account. Please try again.", {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        });
                      }
                    })
                    .catch((error) => console.log(error));
                }
              });
            } else {
              setProcessingLoginIsLoading(false);
              setUserCreatedAccount(false);
              toast.error("Could not set up your account. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }
          })
          .catch((error) => console.log(error));
      }
    }
  };

  const handleFormRejection = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    console.log("hi");
    window.alert(
      "Please ensure all fields have been filled out & fix any form errors. If everything looks right to you, re-enter the info try again."
    );
    setShowErrors(true);
  };

  const logout = (): void => {
    navigation("/");
    setUserCreatedAccount(null);
    setLastLogin(0);
    setCurrentUser(null);
    setCurrentOtherUser(null);
    resetLoginOrSignupFormFieldsAndErrors();
    setProfileImage("");
    window.location.reload(); // reload pg in order to give memory a fresh start
  };

  const userContextValues: TUserContext = {
    ongoingEvents,
    setOngoingEvents,
    upcomingEventsUserRSVPdTo,
    setUpcomingEventsUserRSVPdTo,
    upcomingEventsUserOrganizes,
    setUpcomingEventsUserOrganizes,
    recentEventsUserRSVPdTo,
    setRecentEventsUserRSVPdTo,
    upcomingEventsUserInvitedTo,
    setUpcomingEventsUserInvitedTo,
    recentEventsUserOrganized,
    setRecentEventsUserOrganized,
    confirmationPasswordIsHidden,
    setConfirmationPasswordIsHidden,
    processingLoginIsLoading,
    setProcessingLoginIsLoading,
    fetchFriendRequestsIsLoading,
    setFetchFriendRequestsIsLoading,
    fetchFriendRequestsSentIsError,
    setFetchFriendRequestsSentIsError,
    fetchFriendRequestsReceivedIsError,
    setFetchFriendRequestsReceivedIsError,
    removeProfileImageIsLoading,
    setRemoveProfileImageIsLoading,
    updateProfileImageIsLoading,
    setUpdateProfileImageIsLoading,
    fetchBlockedUsersIsLoading,
    setFetchBlockedUsersIsLoading,
    fetchBlockedUsersIsError,
    setFetchBlockedUsersIsError,
    userHasLoggedIn,
    displayFriendCount,
    setDisplayFriendCount,
    whoCanSeeLocation,
    setWhoCanSeeLocation,
    whoCanSeeFriendsList,
    setWhoCanSeeFriendsList,
    whoCanSeePhoneNumber,
    setWhoCanSeePhoneNumber,
    whoCanSeeEmailAddress,
    setWhoCanSeeEmailAddress,
    whoCanSeeFacebook,
    setWhoCanSeeFacebook,
    whoCanSeeX,
    setWhoCanSeeX,
    whoCanSeeInstagram,
    setWhoCanSeeInstagram,
    whoCanSeeEventsOrganized,
    setWhoCanSeeEventsOrganized,
    whoCanSeeEventsInterestedIn,
    setWhoCanSeeEventsInterestedIn,
    whoCanSeeEventsInvitedTo,
    setWhoCanSeeEventsInvitedTo,
    friendRequestsSent,
    setFriendRequestsSent,
    friendRequestsReceived,
    setFriendRequestsReceived,
    blockedUsers,
    setBlockedUsers,
    handleUnblockUser,
    getOtherUserFriends,
    whoCanMessage,
    setWhoCanMessage,
    currentOtherUser,
    setCurrentOtherUser,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleSendFriendRequest,
    handleRetractFriendRequest,
    handleUnfriending,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    accountDeletionInProgress,
    setAccountDeletionInProgress,
    removeProfileImage,
    userValuesToUpdate,
    handleProfileImageUpload,
    profileImage,
    setProfileImage,
    handleCityStateCountryInput,
    facebook,
    setFacebook,
    facebookError,
    setFacebookError,
    instagram,
    setInstagram,
    instagramError,
    setInstagramError,
    x,
    setX,
    xError,
    setXError,
    phoneCountry,
    setPhoneCountry,
    phoneCountryCode,
    setPhoneCountryCode,
    phoneNumberWithoutCountryCode,
    setPhoneNumberWithoutCountryCode,
    phoneNumberError,
    setPhoneNumberError,
    resetLoginOrSignupFormFieldsAndErrors,
    logout,
    loginMethod,
    signupIsSelected,
    setSignupIsSelected,
    passwordIsHidden,
    setPasswordIsHidden,
    toggleSignupLogin,
    toggleHidePassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    firstNameError,
    setFirstNameError,
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
    userCity,
    setUserCity,
    userState,
    setUserState,
    userCountry,
    setUserCountry,
    areNoSignupFormErrors,
    areNoLoginErrors,
    allSignupFormFieldsFilled,
    allLoginInputsFilled,
    showErrors,
    handleNameInput,
    handleUsernameInput,
    handleEmailAddressInput,
    handlePasswordInput,
    handleConfirmationPasswordInput,
    handleUsernameOrEmailInput,
    handleSignupOrLoginFormSubmission,
    handleFormRejection,
    showPasswordCriteria,
    setShowPasswordCriteria,
    showUsernameCriteria,
    setShowUsernameCriteria,
    locationError,
    setLocationError,
    userAbout,
    setUserAbout,
    userAboutError,
    setUserAboutError,
    whoCanAddUserAsOrganizer,
    setWhoCanAddUserAsOrganizer,
    whoCanInviteUser,
    setWhoCanInviteUser,
    profileVisibleTo,
    setProfileVisibleTo,
    showUpdateProfileImageInterface,
    setShowUpdateProfileImageInterface,
    currentUser,
    setCurrentUser,
    userCreatedAccount,
    setUserCreatedAccount,
    blockUserInProgress,
    setBlockUserInProgress,
    lastLogin,
    setLastLogin,
  };

  return (
    <UserContext.Provider value={userContextValues}>{children}</UserContext.Provider>
  );
};
