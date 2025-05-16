import { createContext, ReactNode, useState, useEffect, SetStateAction } from "react";
import { TUserContext, TUser, TUserValuesToUpdate, TOtherUser } from "../types";
import { useMainContext } from "../Hooks/useMainContext";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import { usernameIsValid, passwordIsValid, emailIsValid } from "../validations";
import Requests from "../requests";
import toast from "react-hot-toast";
import Methods from "../methods";
import { useNavigate } from "react-router-dom";
import {
  useQueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";

export const UserContext = createContext<TUserContext | null>(null);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const navigation = useNavigate();

  const { handleWelcomeMessage, theme, setIsLoading } = useMainContext();

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
  const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true);

  /* Some values on currentUser are kept separately from currentUser. These are initialized to corresponding values from DB. These will be compared to values in DB when user changes these in Settings to render certain form UI. They can also be used for optimistic rendering, in that they update quicker than state values that depend on request to DB going thru, then state values being set after that. Corresponding values in DB are still updated in the background; if these requests fail, then these parallel state values below will reset to what they were before the change.*/
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
  const [blockedUsers, setBlockedUsers] = useSessionStorage<string[] | undefined>(
    "blockedUsers",
    currentUser?.blockedUsers
  );
  const [friendRequestsSent, setFriendRequestsSent] = useSessionStorage<
    string[] | undefined
  >("friendRequestsSent", currentUser?.friendRequestsSent);
  const [friendRequestsReceived, setFriendRequestsReceived] = useSessionStorage<
    string[] | undefined
  >("friendRequestsReceived", currentUser?.friendRequestsReceived);
  const [friends, setFriends] = useSessionStorage<string[] | undefined>(
    "friends",
    currentUser?.friends
  );
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

  const [currentOtherUser, setCurrentOtherUser] = useLocalStorage<TOtherUser | null>(
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

  const queryClient = useQueryClient();

  const userHasLoggedIn = currentUser && userCreatedAccount !== null ? true : false;

  const fetchAllVisibleOtherUsersQuery: UseQueryResult<TOtherUser[], Error> = useQuery({
    queryKey: ["allUsers"],
    // queryFn can be a callback that takes an object that can be logged to the console, where queryKey can be seen (put console log in .then() of promise)
    queryFn: () => Requests.getAllVisibleOtherUsers(currentUser),
    enabled: userHasLoggedIn,
    // staleTime: number,
    // refetchInterval: number
  });
  let allUsers: TOtherUser[] | undefined = fetchAllVisibleOtherUsersQuery.data;

  const userData: TUser = {
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
                    getOtherUserFriends(otherUserID);
                  }
                })
                .catch((error) => console.log(error));
            }
          });
        } else {
          getOtherUserFriends(otherUserID);
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

  const updateProfileImageMutation = useMutation({
    mutationFn: ({
      currentUser,
      base64,
    }: {
      currentUser: TUser | null;
      base64: unknown;
    }) => Requests.updateUserProfileImage(currentUser, base64),
    onSuccess: (data, variables) => {
      if (data.ok) {
        if (currentUser && currentUser._id) {
          Requests.getUserByID(currentUser._id)
            .then((res) => {
              if (res.ok) {
                res
                  .json()
                  .then((user) => {
                    if (user) {
                      setCurrentUser(user);
                      setProfileImage(variables.base64);
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
                  .catch((error) => console.log(error));
              } else {
                handleUpdateProfileImageFail();
              }
            })
            .catch((error) => console.log(error));
        }
      } else {
        handleUpdateProfileImageFail();
      }
    },
    onError: (error) => console.log(error),
  });

  const removeProfileImageMutation = useMutation({
    mutationFn: ({
      currentUser,
      placeholder,
    }: {
      currentUser: TUser | null;
      placeholder: string;
    }) => Requests.updateUserProfileImage(currentUser, placeholder),
    onSuccess: () => {
      if (currentUser && currentUser._id) {
        Requests.getUserByID(currentUser._id)
          .then((res) =>
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
            })
          )
          .catch((error) => {
            console.log(error);
            toast.error("Could not remove profile image. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          });
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Could not remove profile image. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
  });

  /* 
  Success of a sent friend request depends on if both of the mutations below are successful, so call second mutation in onSuccess of mutation that runs first. Display toast of send-friend-request success or failure in onSuccess/onError of second mutation that runs. setIsLoading(false) upon settling of second mutation that runs.
  */
  const sendFriendRequestMutation = useMutation({
    mutationFn: ({ sender, recipient }: { sender: TUser; recipient: TUser }) =>
      Requests.addToFriendRequestsSent(sender, recipient),
    onSuccess: (data, variables) => {
      if (data.ok) {
        const sender = variables.sender;
        const recipient = variables.recipient;

        if (recipient._id) {
          Requests.getUserByID(recipient._id).then((res) =>
            res
              .json()
              .then((recipient) =>
                receiveFriendRequestMutation.mutate({ sender, recipient })
              )
          );
        }
      } else {
        toast.error("Couldn't send request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const handleReceiveFriendRequestFail = (variables: {
    sender: TUser;
    recipient: TOtherUser;
  }) => {
    if (variables.recipient._id && friendRequestsSent) {
      // If FR was sent, but recipient didn't receive it (request failed), delete sent FR from sender:
      const removeSentFriendRequest = () =>
        Requests.removeFromFriendRequestsSent(
          variables.sender,
          variables.recipient
        ).catch((error) => {
          // If request to remove sent FR fails, keep trying:
          console.log(error);
          removeSentFriendRequest();
        });
      removeSentFriendRequest();
    }

    toast.error("Couldn't send request. Please try again.", {
      style: {
        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
        color: theme === "dark" ? "black" : "white",
        border: "2px solid red",
      },
    });
  };

  // Only if recipient receives FR from currentUser should currentUser's request go thru
  const receiveFriendRequestMutation = useMutation({
    mutationFn: ({ sender, recipient }: { sender: TUser; recipient: TUser }) =>
      Requests.addToFriendRequestsReceived(sender, recipient),
    onSuccess: (data, variables) => {
      if (data.ok) {
        if (currentUser && currentUser._id) {
          Requests.getUserByID(currentUser._id)
            .then((res) => {
              if (res.ok) {
                res
                  .json()
                  .then((user) => {
                    if (user) {
                      setCurrentUser(user);
                      toast.success("Friend request sent!", {
                        style: {
                          background:
                            theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                          color: theme === "dark" ? "black" : "white",
                          border: "2px solid green",
                        },
                      });
                    } else {
                      handleReceiveFriendRequestFail(variables);
                    }
                  })
                  .catch((error) => console.log(error));
              } else {
                handleReceiveFriendRequestFail(variables);
              }
            })
            .catch((error) => console.log(error));
        }
      } else {
        handleReceiveFriendRequestFail(variables);
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const handleRemoveFriendRequestFail = (variables: {
    sender: TUser;
    recipient: TOtherUser;
    event: "accept-request" | "retract-request" | "reject-request";
  }) => {
    if (variables.recipient._id) {
      Requests.getUserByID(variables.recipient._id).then((res) =>
        res.json().then((recipient) => {
          if (variables.event === "accept-request") {
            // Remove sender & receiver from each other's 'friends' array, add sender back to receivers FR-received array:
            Promise.all([
              Requests.deleteFriendFromFriendsArray(variables.sender, recipient),
              Requests.deleteFriendFromFriendsArray(recipient, variables.sender),
              Requests.addToFriendRequestsSent(variables.sender, recipient),
              Requests.addToFriendRequestsReceived(variables.sender, recipient),
            ])
              .then((res) => {
                if (res.some((promiseResult) => !promiseResult.ok)) {
                  handleRemoveFriendRequestFail(variables);
                }
              })
              .catch((error) => console.log(error));

            toast.error("Could not accept friend request. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }

          if (variables.event === "retract-request") {
            Promise.all([
              Requests.addToFriendRequestsSent(variables.sender, recipient),
              Requests.addToFriendRequestsReceived(variables.sender, recipient),
            ])
              .then((res) => {
                if (res.some((promiseResult) => !promiseResult.ok)) {
                  handleRemoveFriendRequestFail(variables);
                }
              })
              .catch((error) => console.log(error));

            toast.error("Couldn't retract request. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }

          if (variables.event === "reject-request") {
            Promise.all([
              Requests.addToFriendRequestsSent(variables.sender, recipient),
              Requests.addToFriendRequestsReceived(variables.sender, recipient),
            ])
              .then((res) => {
                if (res.some((promiseResult) => !promiseResult.ok)) {
                  handleRemoveFriendRequestFail(variables);
                }
              })
              .catch((error) => console.log(error));

            toast.error("Could not reject friend request. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }
        })
      );
    }
  };

  // change both below to "retract...."
  const retractSentFriendRequestMutation = useMutation({
    mutationFn: ({
      sender,
      recipient,
      // @ts-ignore: event is not needed in mutationFn, but is needed in onSuccess callback
      event,
    }: {
      sender: TUser;
      recipient: TOtherUser;
      event: "accept-request" | "retract-request" | "reject-request";
    }) => Requests.removeFromFriendRequestsSent(sender, recipient),
    onSuccess: (data, variables) => {
      if (data.ok) {
        const sender = variables.sender;
        const recipient = variables.recipient;
        const event = variables.event;

        if (recipient._id) {
          Requests.getUserByID(recipient._id).then((res) =>
            res
              .json()
              .then((recipient) =>
                removeReceivedFriendRequestMutation.mutate({ sender, recipient, event })
              )
          );
        }
      } else {
        handleRemoveFriendRequestFail(variables);
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const removeReceivedFriendRequestMutation = useMutation({
    mutationFn: ({
      sender,
      recipient,
      //@ts-ignore: though event param not used in mutationFn, it is needed in onSuccess & onError
      event,
    }: {
      sender: TUser;
      recipient: TUser;
      event: "accept-request" | "retract-request" | "reject-request";
    }) => Requests.removeFromFriendRequestsReceived(sender, recipient),
    onSuccess: (data, variables) => {
      if (data.ok) {
        if (currentUser && currentUser._id) {
          Requests.getUserByID(currentUser._id)
            .then((res) => {
              if (res.ok) {
                res
                  .json()
                  .then((user) => {
                    if (user) {
                      setCurrentUser(user);
                      if (variables.event === "accept-request") {
                        toast.success(
                          `You are now friends with ${variables.sender.firstName} ${variables.sender.lastName}!`,
                          {
                            style: {
                              background:
                                theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                              color: theme === "dark" ? "black" : "white",
                              border: "2px solid green",
                            },
                          }
                        );
                      }

                      if (variables.event === "retract-request") {
                        toast("Friend request retracted", {
                          style: {
                            background:
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        });
                      }

                      if (variables.event === "reject-request") {
                        toast(
                          `Rejected friend request from ${variables.sender.firstName} ${variables.sender.lastName}.`,
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
                    } else {
                      handleRemoveFriendRequestFail(variables);
                    }
                  })
                  .catch((error) => console.log(error));
              } else {
                handleRemoveFriendRequestFail(variables);
              }
            })
            .catch((error) => console.log(error));
        }
      } else {
        handleRemoveFriendRequestFail(variables);
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const resetFriendsAfterFailedAcceptedFriendRequest = (
    userOne: TUser,
    userTwo: TUser
  ): void => {
    if (userTwo._id && userOne.friends.includes(userTwo._id)) {
      Requests.deleteFriendFromFriendsArray(userOne, userTwo).catch((error) => {
        console.log(error);
        resetFriendsAfterFailedAcceptedFriendRequest(userOne, userTwo);
      });
    }

    if (userOne._id && userTwo.friends.includes(userOne._id)) {
      Requests.deleteFriendFromFriendsArray(userTwo, userOne).catch((error) => {
        console.log(error);
        resetFriendsAfterFailedAcceptedFriendRequest(userTwo, userOne);
      });
    }
  };

  const resetFriendRequestsAfterFailedAcceptedFriendRequest = (
    sender: TUser,
    recipient: TUser
  ): void => {
    if (recipient._id && !sender.friendRequestsSent.includes(recipient._id)) {
      Requests.addToFriendRequestsSent(sender, recipient).catch((error) => {
        console.log(error);
        resetFriendRequestsAfterFailedAcceptedFriendRequest(sender, recipient);
      });
    }

    if (sender._id && !recipient.friendRequestsReceived.includes(sender._id)) {
      Requests.addToFriendRequestsReceived(sender, recipient).catch((error) => {
        console.log(error);
        resetFriendRequestsAfterFailedAcceptedFriendRequest(sender, recipient);
      });
    }
  };

  const handleAddToFriendsFail = (variables: {
    receiver: TUser;
    sender: TUser;
  }): void => {
    toast.error("Could not accept friend request. Please try again.", {
      style: {
        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
        color: theme === "dark" ? "black" : "white",
        border: "2px solid red",
      },
    });

    resetFriendsAfterFailedAcceptedFriendRequest(variables.sender, variables.receiver);

    resetFriendRequestsAfterFailedAcceptedFriendRequest(
      variables.sender,
      variables.receiver
    );
  };

  const addToSenderFriendsMutation = useMutation({
    mutationFn: ({ sender, receiver }: { sender: TUser; receiver: TUser }) =>
      Requests.addFriendToFriendsArray(sender, receiver),
    onSuccess: (data, variables) => {
      if (data.ok) {
        const receiver = variables.receiver;
        const sender = variables.sender;
        addToReceiverFriendsMutation.mutate({ receiver, sender });
      } else {
        handleAddToFriendsFail(variables);
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  // On success of mutation to add friend to sender's list, run this; if this fails, reset everything
  const addToReceiverFriendsMutation = useMutation({
    mutationFn: ({ receiver, sender }: { receiver: TUser; sender: TUser }) =>
      Requests.addFriendToFriendsArray(receiver, sender),
    onSuccess: (data, variables) => {
      if (data.ok) {
        const recipient = variables.receiver;
        const sender = variables.sender;
        const event = "accept-request";
        retractSentFriendRequestMutation.mutate({
          sender,
          recipient,
          event,
        });
        if (currentUser && currentUser._id) {
          Requests.getUserByID(currentUser._id)
            .then((res) => {
              if (res.ok) {
                res
                  .json()
                  .then((user) => {
                    if (user) {
                      setCurrentUser(user);
                    } else {
                      handleAddToFriendsFail(variables);
                    }
                  })
                  .catch((error) => console.log(error));
              } else {
                handleAddToFriendsFail(variables);
              }
            })
            .catch((error) => console.log(error));
        }
      } else {
        handleAddToFriendsFail(variables);
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const handleBlockUserFail = (blockeeUsername: string | undefined): void => {
    toast.error(
      `Unable to block ${blockeeUsername ? blockeeUsername : "user"}. Please try again.`,
      {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      }
    );
  };

  const blockUserMutation = useMutation({
    mutationFn: ({
      blocker,
      blockee,
      areFriends,
      hasSentFriendRequest,
      hasReceivedFriendRequest,
    }: {
      blocker: TUser;
      blockee: TUser;
      areFriends: boolean;
      hasSentFriendRequest: boolean;
      hasReceivedFriendRequest: boolean;
    }) => {
      if (
        areFriends !== undefined &&
        hasSentFriendRequest !== undefined &&
        hasReceivedFriendRequest !== undefined
      ) {
        return Requests.addToBlockedUsers(blocker, blockee?._id);
      }
      return Requests.addToBlockedUsers(blocker, blockee?._id);
    },
    onSuccess: (data, variables) => {
      if (data.ok) {
        if (currentUser && currentUser._id) {
          Requests.getUserByID(currentUser._id)
            .then((res) => {
              if (res.ok) {
                res
                  .json()
                  .then((user) => {
                    if (user) {
                      if (variables.areFriends) {
                        handleUnfriending(variables.blocker, variables.blockee);
                      }
                      if (variables.hasSentFriendRequest) {
                        handleRemoveFriendRequest(variables.blockee, variables.blocker);
                      }
                      if (variables.hasReceivedFriendRequest) {
                        handleRemoveFriendRequest(variables.blocker, variables.blockee);
                      }
                      setCurrentUser(user);
                      toast(`You have blocked ${variables.blockee.username}.`, {
                        style: {
                          background:
                            theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                          color: theme === "dark" ? "black" : "white",
                          border: "2px solid red",
                        },
                      });
                    } else {
                      handleBlockUserFail(variables.blockee.username);
                    }
                  })
                  .catch((error) => console.log(error));
              } else {
                handleBlockUserFail(variables.blockee.username);
              }
            })
            .catch((error) => console.log(error));
        }
      } else {
        handleBlockUserFail(variables.blockee.username);
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  useEffect(() => {
    if (currentUser) {
      setFriendRequestsSent(currentUser.friendRequestsSent);
      setFriendRequestsReceived(currentUser.friendRequestsReceived);
      setFriends(currentUser.friends);
      setBlockedUsers(currentUser.blockedUsers);
    }
  }, [currentUser]);

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

  const toggleHidePassword = (): void => setPasswordIsHidden(!passwordIsHidden);

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
    updateProfileImageMutation.mutate({ currentUser, base64 });
  };

  const removeProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setShowUpdateProfileImageInterface(false);
    const placeholder = "";
    removeProfileImageMutation.mutate({ currentUser, placeholder });
  };

  const handleSendFriendRequest = (recipient: TOtherUser | TUser | undefined): void => {
    if (currentUser && recipient) {
      setIsLoading(true);
      const sender = currentUser;

      if (recipient._id) {
        Requests.getUserByID(recipient._id).then((res) =>
          res
            .json()
            .then((recipient) => sendFriendRequestMutation.mutate({ sender, recipient }))
        );
      }
    }
  };

  const handleRemoveFriendRequest = (
    recipient: TUser | undefined,
    sender: TUser
  ): void => {
    setIsLoading(true);

    if (currentUser && recipient) {
      if (currentUser._id === recipient._id && sender) {
        const event = "reject-request";
        removeReceivedFriendRequestMutation.mutate({ sender, recipient, event });
      } else {
        const event = "retract-request";
        const sender = currentUser;
        retractSentFriendRequestMutation.mutate({ sender, recipient, event });
      }
    }
  };

  const handleAcceptFriendRequest = (
    sender: TUser,
    receiver: TOtherUser,
    e?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    e?.preventDefault();
    setIsLoading(true);

    // Also put in handleRejectFR
    if (showFriendRequestResponseOptions) {
      setShowFriendRequestResponseOptions(false);
    }

    if (receiver._id) {
      Requests.getUserByID(receiver._id).then((res) =>
        res.json().then((receiver) => {
          addToSenderFriendsMutation.mutate({ sender, receiver });
        })
      );
    }
  };

  const handleRejectFriendRequest = (
    sender: TUser,
    receiver: TUser,
    e?: React.ChangeEvent<HTMLInputElement>
  ) => {
    e?.preventDefault();

    setIsLoading(true);

    const event = "reject-request";
    const recipient = receiver;
    retractSentFriendRequestMutation.mutate({ sender, recipient, event });
  };

  const handleUnfriendingFail = (friend: TUser): void => {
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

  const handleUnfriending = (user: TUser, friend: TUser): void => {
    Promise.all([
      Requests.deleteFriendFromFriendsArray(user, friend),
      Requests.deleteFriendFromFriendsArray(friend, user),
    ])
      .then((res) => {
        if (currentUser && currentUser._id && res[0].ok && res[1].ok) {
          Requests.getUserByID(currentUser._id)
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
                              theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                            color: theme === "dark" ? "black" : "white",
                            border: "2px solid red",
                          },
                        }
                      );
                    } else {
                      handleUnfriendingFail(friend);
                    }
                  })
                  .catch((error) => console.log(error));
              } else {
                handleUnfriendingFail(friend);
              }
            })
            .catch((error) => console.log(error));
        } else {
          handleUnfriendingFail(friend);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Defined here, since used in DropdownChecklist & EventForm

  // maybe pass in a TUser[] & its setter in order to optimistically render UserCards on FindPalz/MyPalz, FriendRequests
  const addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists = (
    blocker: TUser,
    blockee: TOtherUser,
    blockedUsers?: string[] | undefined,
    setBlockedUsers?: React.Dispatch<SetStateAction<string[] | undefined>>
  ): void => {
    if (blockedUsers && setBlockedUsers && blockee._id) {
      setBlockedUsers(blockedUsers.concat(blockee._id));
    }
    setIsLoading(true);

    if (blockee._id) {
      Requests.getUserByID(blockee._id).then((res) =>
        res.json().then((blockee) => {
          const areFriends: boolean =
            blocker._id &&
            blockee._id &&
            (blocker.friends.includes(blockee._id) ||
              blockee.friends.includes(blocker._id))
              ? true
              : false;
          const hasSentFriendRequest: boolean = blockee._id
            ? blocker.friendRequestsSent.includes(blockee._id)
            : false;
          const hasReceivedFriendRequest: boolean = blockee._id
            ? blocker.friendRequestsReceived.includes(blockee._id)
            : false;
          blockUserMutation.mutate({
            blocker,
            blockee,
            areFriends,
            hasSentFriendRequest,
            hasReceivedFriendRequest,
          });
        })
      );
    }
  };

  const handleUnblockUserFail = (blockee: TUser): void => {
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
  const handleUnblockUser = (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | undefined,
    setBlockedUsers?: React.Dispatch<SetStateAction<string[] | undefined>>
  ): void => {
    setIsLoading(true);

    if (blockedUsers && setBlockedUsers) {
      setBlockedUsers(blockedUsers.filter((userID) => userID !== blockee._id));
    }

    if (blockee._id) {
      Requests.removeFromBlockedUsers(blocker, blockee._id)
        .then((res) => {
          if (currentUser && currentUser._id && res.ok) {
            Requests.getUserByID(currentUser._id)
              .then((res) => {
                if (res.ok) {
                  res
                    .json()
                    .then((user) => {
                      setCurrentUser(user);
                      toast.success(`Unblocked ${blockee.username}.`, {
                        style: {
                          background:
                            theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                          color: theme === "dark" ? "black" : "white",
                          border: "2px solid green",
                        },
                      });
                    })
                    .catch((error) => console.log(error));
                } else {
                  handleUnblockUserFail(blockee);
                }
              })
              .catch((error) => console.log(error));
          } else {
            handleUnblockUserFail(blockee);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
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
    setFirstName(currentUser?.firstName);
    setLastName(currentUser?.lastName);
    setUsername(currentUser?.username);
    setProfileImage(currentUser?.profileImage);
    setEmailAddress(currentUser?.emailAddress);
    setFriends(currentUser?.friends);
    setBlockedUsers(currentUser?.blockedUsers);
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
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
    setUsername(userData.username);
    setFriends(userData.friends);
    setBlockedUsers(userData.blockedUsers);
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
     Check input data against most-recent allUsers. It will only be necessary to check if username or email address already exist in allUsers, as errors & completion are checked in onClick, and this function is only called if there are no errors and if all forms are complete. If username or email address do exist, alert user & reject submission; else, accept submission.
    */

    // Handle submit of login form:
    // Maybe .invalidateQueries({ queryKey: "allUsers" }) before running getUserByUsernameOrEmailAddress request
    if (!isOnSignup && password) {
      if (username && username !== "") {
        Requests.getUserByUsernameOrEmailAddress(password, username)
          .then((res) => {
            if (res.status === 401) {
              // Differentiate b/t error on username/email & error on pw
              if (res.statusText === "User not found") {
                setUsernameError(res.statusText);
              }
              if (res.statusText === "Invalid username or password") {
                setPasswordError(res.statusText);
              }
            }

            if (res.status === 404) {
              toast.error("User doesn't exist", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }

            if (res.status === 500) {
              toast.error("Could not log you in. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }

            if (res.ok) {
              res.json().then((json) => {
                setCurrentUser(json.user);
                handleWelcomeMessage();
                setUserCreatedAccount(false);
                navigation("/");
                setUserCreatedAccount(false);
                setParallelValuesAfterLogin(json.user);
                resetErrorMessagesAfterLogin();
              });
            }
          })
          .catch((error) => {
            console.log(error);
            console.log("hi");
            toast.error("Could not log you in. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          });
      }

      if (emailAddress && emailAddress !== "") {
        Requests.getUserByUsernameOrEmailAddress(password, undefined, emailAddress)
          .then((res) => {
            if (res.status === 401) {
              if (res.statusText === "User not found") {
                setEmailError("User not found");
              }
              if (res.statusText === "Invalid e-mail address or password") {
                setPasswordError(res.statusText);
              }
            }

            if (res.status === 500) {
              toast.error("Could not log you in. Please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }

            if (res.ok) {
              res.json().then((json) => {
                setCurrentUser(json.user);
                handleWelcomeMessage();
                setUserCreatedAccount(false);
                navigation("/");
                setUserCreatedAccount(false);
                setParallelValuesAfterLogin(json.user);
                resetErrorMessagesAfterLogin();
              });
            }
          })
          .catch((error) => {
            console.log(error);
            toast.error("Could not log you in. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          });
      }
    }

    // Handle submit of signup form:
    if (isOnSignup) {
      if ((username && username !== "") || (emailAddress && emailAddress !== "")) {
        // run newUserMutation. handle errors there
        Requests.createUser(userData)
          .then((res) => {
            if (res.status === 409) {
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
            }
            if (res.ok) {
              handleWelcomeMessage();
              setCurrentUser(userData);
              navigation("/");
              queryClient.invalidateQueries({ queryKey: ["allUsers"] });
              queryClient.refetchQueries({ queryKey: ["allUsers"] });
              setUserCreatedAccount(true);
              setParallelValuesAfterSignup();
              resetErrorMessagesAfterSignup();
            }
          })
          .catch((error) => {
            console.log(error);
            setUserCreatedAccount(false);
            toast.error("Could not set up your account. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          });
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
    window.alert(
      "Please ensure all fields have been filled out & fix any form errors. If everything looks right to you, re-enter the info try again."
    );
    setShowErrors(true);
  };

  const logout = (): void => {
    navigation("/");
    setUserCreatedAccount(null);
    setCurrentUser(null);
    setCurrentOtherUser(null);
    resetLoginOrSignupFormFieldsAndErrors();
    setProfileImage("");
    window.location.reload(); // reload pg in order to give memory a fresh start
  };

  const allOtherUsers: TOtherUser[] =
    allUsers && currentUser
      ? allUsers.filter((user) => user._id !== currentUser._id)
      : [];

  const userContextValues: TUserContext = {
    allOtherUsers,
    userHasLoggedIn,
    removeProfileImageMutation,
    updateProfileImageMutation,
    fetchAllVisibleOtherUsersQuery,
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
    friends,
    setFriends,
    friendRequestsSent,
    setFriendRequestsSent,
    friendRequestsReceived,
    setFriendRequestsReceived,
    blockedUsers,
    setBlockedUsers,
    handleUnblockUser,
    addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists,
    getOtherUserFriends,
    whoCanMessage,
    setWhoCanMessage,
    currentOtherUser,
    setCurrentOtherUser,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleSendFriendRequest,
    handleRemoveFriendRequest,
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
    allUsers,
    currentUser,
    setCurrentUser,
    userCreatedAccount,
    setUserCreatedAccount,
  };

  return (
    <UserContext.Provider value={userContextValues}>{children}</UserContext.Provider>
  );
};
