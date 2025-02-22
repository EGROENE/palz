import { createContext, ReactNode, useState, useEffect, SetStateAction } from "react";
import { TUserContext, TUser, TUserValuesToUpdate, TChat } from "../types";
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
    "anyone" | "friends" | "nobody" | undefined
  >("whoCanAddUserAsOrganizer", "anyone");
  const [whoCanInviteUser, setWhoCanInviteUser] = useSessionStorage<
    "anyone" | "friends" | "nobody" | undefined
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

  const [currentOtherUser, setCurrentOtherUser] = useLocalStorage<TUser | null>(
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

  const fetchAllUsersQuery: UseQueryResult<TUser[], Error> = useQuery({
    queryKey: ["allUsers"],
    // queryFn can be a callback that takes an object that can be logged to the console, where queryKey can be seen (put console log in .then() of promise)
    queryFn: Requests.getAllUsers,
    // enabled: boolean,
    // staleTime: number,
    // refetchInterval: number
  });
  let allUsers: TUser[] | undefined = fetchAllUsersQuery.data;

  const userHasLoggedIn = currentUser && userCreatedAccount !== null ? true : false;

  const fetchChatsQuery: UseQueryResult<TChat[], Error> = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      currentUser && currentUser._id
        ? Requests.getCurrentUserChats(currentUser._id)
        : undefined,
    enabled: userHasLoggedIn,
  });
  let userChats: TChat[] | undefined = fetchChatsQuery.data;

  // Rename to 'newUserData'
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

  const newUserMutation = useMutation({
    mutationFn: (userData: TUser) => Requests.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      setUserCreatedAccount(true);
    },
    onError: () => {
      setUserCreatedAccount(false);
      toast.error("Could not create account. Please try again later.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
  });

  const updateProfileImageMutation = useMutation({
    mutationFn: ({
      currentUser,
      base64,
    }: {
      currentUser: TUser | null;
      base64: unknown;
    }) => Requests.updateUserProfileImage(currentUser, base64),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      if (fetchAllUsersQuery.data && currentUser) {
        allUsers = fetchAllUsersQuery.data;
        setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
      }
      if (data.ok) {
        setProfileImage(variables.base64);
        toast.success("Profile image updated", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid green",
          },
        });
      }
    },
    onError: (error) => {
      console.log(error);
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
    },
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
      toast("Profile image removed", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      setProfileImage("");
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      if (fetchAllUsersQuery.data && currentUser) {
        allUsers = fetchAllUsersQuery.data;
        setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
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
        receiveFriendRequestMutation.mutate({ sender, recipient });
      }
    },
    onError: (error, variables) => {
      console.log(error);
      // Optimistic rendering: if request fails, remove recipient from friendRequestsSent
      if (variables.recipient._id && friendRequestsSent) {
        setFriendRequestsSent(
          friendRequestsSent.filter((id) => id !== variables.recipient._id)
        );
      }
      toast.error("Couldn't send request. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
  });

  const receiveFriendRequestMutation = useMutation({
    mutationFn: ({ sender, recipient }: { sender: TUser; recipient: TUser }) =>
      Requests.addToFriendRequestsReceived(sender, recipient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      if (fetchAllUsersQuery.data && currentUser) {
        allUsers = fetchAllUsersQuery.data;
        setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
      }
      toast.success("Friend request sent!", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid green",
        },
      });
    },
    onError: (error, variables) => {
      console.log(error);
      if (variables.recipient._id && friendRequestsSent) {
        // Optimistic rendering: if request fails, remove recipient from friendRequestsSent:
        setFriendRequestsSent(
          friendRequestsSent.filter((id) => id !== variables.recipient._id)
        );

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
    },
    onSettled: () => setIsLoading(false),
  });

  // change both below to "retract...."
  const retractSentFriendRequestMutation = useMutation({
    mutationFn: ({
      sender,
      recipient,
      event,
    }: {
      sender: TUser;
      recipient: TUser;
      event: "accept-request" | "retract-request" | "reject-request";
    }) => {
      // Yes, this is stupid logic, but 'event' has to be used to avoid a TS error
      return event
        ? Requests.removeFromFriendRequestsSent(sender, recipient)
        : Requests.removeFromFriendRequestsSent(sender, recipient);
    },
    onSuccess: (data, variables) => {
      if (data.ok) {
        const sender = variables.sender;
        const recipient = variables.recipient;
        const event = variables.event;
        retractReceivedFriendRequestMutation.mutate({ sender, recipient, event });
      }
    },
    onError: (error, variables) => {
      if (variables.event === "accept-request") {
        // Remove sender & receiver from each other's 'friends' array, add sender back to receivers FR-received array:
        Promise.all([
          Requests.deleteFriendFromFriendsArray(variables.sender, variables.recipient),
          Requests.deleteFriendFromFriendsArray(variables.recipient, variables.sender),
          Requests.addToFriendRequestsSent(variables.sender, variables.recipient),
        ]).catch((error) => console.log(error));

        // Revert surface-level state values (Remove sender from friends, add sender back to receivedFRs):
        if (friends) {
          setFriends(friends.filter((friend) => friend !== variables.sender._id));
        }

        if (variables.sender._id) {
          setFriendRequestsReceived(friendRequestsReceived?.concat(variables.sender._id));
        }

        console.log(error);

        toast.error("Could not accept friend request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }

      if (variables.event === "retract-request") {
        const recipient = variables.recipient;
        // Optimistic rendering: add recipient back to friendRequestsSent if request fails
        if (setFriendRequestsSent && friendRequestsSent && recipient._id) {
          setFriendRequestsSent(friendRequestsSent.concat(recipient._id));
        }
        console.log(error);
        toast.error("Couldn't retract request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }

      if (variables.event === "reject-request") {
        if (setFriendRequestsReceived && friendRequestsReceived && variables.sender._id) {
          setFriendRequestsReceived(friendRequestsReceived.concat(variables.sender._id));
        }

        toast.error("Could not reject friend request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
  });

  const retractReceivedFriendRequestMutation = useMutation({
    mutationFn: ({
      sender,
      recipient,
      event,
    }: {
      sender: TUser;
      recipient: TUser;
      event: "accept-request" | "retract-request" | "reject-request";
    }) => {
      // Yes, this is stupid logic, but 'event' has to be used to avoid a TS error
      return event
        ? Requests.removeFromFriendRequestsReceived(sender, recipient)
        : Requests.removeFromFriendRequestsReceived(sender, recipient);
    },
    onSuccess: (data, variables) => {
      if (data.ok) {
        if (variables.event === "accept-request") {
          toast.success(
            `You are now friends with ${variables.sender.firstName} ${variables.sender.lastName}!`,
            {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid green",
              },
            }
          );
        }

        if (variables.event === "retract-request") {
          toast("Friend request retracted", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
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
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            }
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      if (fetchAllUsersQuery.data && currentUser) {
        allUsers = fetchAllUsersQuery.data;
        setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
      }
    },
    onError: (error, variables) => {
      console.log(error);
      if (variables.event === "accept-request") {
        // Remove sender & receiver from each other's 'friends' array, add back to 'received' array:
        Promise.all([
          Requests.deleteFriendFromFriendsArray(variables.sender, variables.recipient),
          Requests.deleteFriendFromFriendsArray(variables.recipient, variables.sender),
          Requests.addToFriendRequestsReceived(variables.sender, variables.recipient),
        ]).catch((error) => console.log(error));

        toast.error("Could not accept friend request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });

        // Revert surface-level state values (remove sender from 'friends', add sender back to friendRequestsReceived):
        if (friends) {
          setFriends(friends.filter((friend) => friend !== variables.sender._id));
        }

        if (friendRequestsReceived && variables.sender._id) {
          setFriendRequestsReceived(friendRequestsReceived.concat(variables.sender._id));
        }
      }

      if (variables.event === "retract-request") {
        const recipient = variables.recipient;
        // Optimistic rendering: add recipient back to friendRequestsSent if request fails
        if (setFriendRequestsSent && friendRequestsSent && recipient._id) {
          setFriendRequestsSent(friendRequestsSent.concat(recipient._id));
        }
        toast.error("Could not retract request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }

      if (variables.event === "reject-request") {
        toast.error("Could not reject friend request. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });

        if (setFriendRequestsReceived && friendRequestsReceived && variables.sender._id) {
          setFriendRequestsReceived(friendRequestsReceived.concat(variables.sender._id));
        }
      }
    },
    onSettled: () => setIsLoading(false),
  });

  const addToSenderFriendsMutation = useMutation({
    mutationFn: ({ sender, receiver }: { sender: TUser; receiver: TUser }) =>
      Requests.addFriendToFriendsArray(sender, receiver),
    onSuccess: (data, variables) => {
      if (data.ok) {
        const receiver = variables.receiver;
        const sender = variables.sender;
        addToReceiverFriendsMutation.mutate({ receiver, sender });
      }
    },
    onError: (error, variables) => {
      console.log(error);
      toast.error("Could not accept friend request. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });

      // Revert surface-level states (remove sender from friends, add sender back to friendRequestsReceived):
      if (friends) {
        setFriends(friends.filter((friend) => friend !== variables.sender._id));
      }

      if (friendRequestsReceived && variables.sender._id) {
        setFriendRequestsReceived(friendRequestsReceived.concat(variables.sender._id));
      }
    },
  });

  const addToReceiverFriendsMutation = useMutation({
    mutationFn: ({ receiver, sender }: { receiver: TUser; sender: TUser }) =>
      Requests.addFriendToFriendsArray(receiver, sender),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: "allUsers" }).then(() => {
        if (allUsers && currentUser) {
          setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
        }
      });
      if (data.ok) {
        const recipient = variables.receiver;
        const sender = variables.sender;
        const event = "accept-request";
        retractSentFriendRequestMutation.mutate({
          sender,
          recipient,
          event,
        });
      }
    },
    onError: (error, variables) => {
      // Make request to delete receiver from sender's friends array:
      const deleteFromUserFriends = () =>
        Requests.deleteFriendFromFriendsArray(variables.sender, variables.receiver).catch(
          (error) => {
            console.log(error);
            deleteFromUserFriends();
          }
        );

      console.log(error);
      toast.error("Could not accept friend request. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });

      // Revert surface-level states (remove sender from friends, add sender back to friendRequestsReceived):
      if (friends) {
        setFriends(friends.filter((friend) => friend !== variables.sender._id));
      }

      if (friendRequestsReceived && variables.sender._id) {
        setFriendRequestsReceived(friendRequestsReceived.concat(variables.sender._id));
      }
    },
  });

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
        if (variables.areFriends) {
          handleUnfriending(variables.blocker, variables.blockee);
        }
        if (variables.hasSentFriendRequest) {
          handleRetractFriendRequest(variables.blocker, variables.blockee);
        }
        if (variables.hasReceivedFriendRequest) {
          handleRetractFriendRequest(variables.blockee, variables.blocker);
        }

        queryClient.invalidateQueries({ queryKey: "allUsers" });
        if (allUsers && currentUser) {
          setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
        }

        toast(`You have blocked ${variables.blockee.username}.`, {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error, variables) => {
      if (blockedUsers && setBlockedUsers) {
        setBlockedUsers(
          blockedUsers.filter((userID) => userID !== variables.blockee._id)
        );
      }
      console.log(error);
      toast.error(`Unable to block ${variables.blockee.username}. Please try again.`, {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => setIsLoading(false),
  });

  useEffect(() => {
    if (fetchAllUsersQuery.data && currentUser) {
      const updatedUser = fetchAllUsersQuery.data.filter(
        (user) => user._id === currentUser._id
      )[0];
      setCurrentUser(updatedUser);
      setFriendRequestsSent(updatedUser?.friendRequestsSent);
      setFriendRequestsReceived(updatedUser?.friendRequestsReceived);
      setFriends(updatedUser?.friends);
    }
  }, [currentUser?._id, fetchAllUsersQuery.data]);

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
    isFirstName
      ? setFirstName(Methods.nameNoSpecialChars(name))
      : setLastName(Methods.nameNoSpecialChars(name));

    if (allSignupFormFieldsFilled && areNoSignupFormErrors && formType === "signup") {
      setCurrentUser(userData);
    } else if (
      !allSignupFormFieldsFilled &&
      !areNoSignupFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(null);
    }

    if (formType === "signup") {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } /* else if (!nameIsValid(name.trim())) {
        isFirstName
          ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
          : setLastNameError("Only alphabetical characters & appropriate punctuation");
      } else if (nameIsValid(name.trim())) {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      } */ else {
        isFirstName ? setFirstNameError("") : setLastNameError("");
      }
    } else {
      if (name.trim() === "") {
        isFirstName
          ? setFirstNameError("Please fill out this field")
          : setLastNameError("Please fill out this field");
      } /* else if (!nameIsValid(name.trim()) && name.trim() !== "") {
        isFirstName
          ? setFirstNameError("Only alphabetical characters & appropriate punctuation")
          : setLastNameError("Only alphabetical characters & appropriate punctuation");
      } */ else {
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

    if (allSignupFormFieldsFilled && areNoSignupFormErrors && formType === "signup") {
      setCurrentUser(userData);
    } else if (
      !allSignupFormFieldsFilled &&
      !areNoSignupFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(null);
    }

    /* Get most-current version of allUsers (in case another user has changed their username, so username user inputs may become available or in available. Fetching allUsers onChange of username field ensures most-current data on users exists. This is also checked onSubmit of EditUserInfoForm.) */
    //fetchAllUsers();

    const usernameIsTaken: boolean | null = allUsers
      ? allUsers.filter((user) => user.username === inputUsername).length > 0
      : null;

    if (formType === "signup") {
      if (usernameIsTaken) {
        setUsernameError("Username is already taken");
      } else if (!inputUsername.length) {
        setUsernameError("Please fill out this field");
      } else if (inputUsername.length < 4) {
        setUsernameError(
          "Username must be 4-20 characters long & may only contain alphanumeric characters"
        );
      } else {
        setUsernameError("");
      }
    } else {
      if (usernameIsTaken && inputUsername !== currentUser?.username) {
        setUsernameError("Username is already taken");
      } else if (inputUsername.length < 4) {
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

    if (allSignupFormFieldsFilled && areNoSignupFormErrors && formType === "signup") {
      setCurrentUser(userData);
    } else if (
      !allSignupFormFieldsFilled &&
      !areNoSignupFormErrors &&
      formType === "signup"
    ) {
      setCurrentUser(null);
    }

    /* Get most-current version of allUsers (in case another user has changed their email, so email user inputs may become available or in available. Fetching allUsers onChange of email field ensures most-current data on users exists. This is also checked onSubmit of EditUserInfoForm.) */
    //fetchAllUsers();

    const emailIsTaken: boolean | null = allUsers
      ? allUsers.filter(
          (user) => user.emailAddress === inputEmailAddressNoWhitespaces.toLowerCase()
        ).length > 0
      : null;

    if (formType === "signup") {
      if (emailIsTaken) {
        setEmailError("E-mail address is taken");
      } else if (!inputEmailAddressNoWhitespaces.length) {
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
        emailIsTaken &&
        inputEmailAddressNoWhitespaces.toLowerCase() !== currentUser?.emailAddress
      ) {
        setEmailError("E-mail address is taken");
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
      // Get current user (if username/email has been entered) so that its password can be compared to input pw:
      const currentUser: TUser | null =
        loginMethod === "username"
          ? allUsers
            ? allUsers.filter((user) => user.username === username)[0]
            : null
          : allUsers
          ? allUsers.filter((user) => user.emailAddress === emailAddress)[0]
          : null;

      // If currentUser exists & there is non-whitespace input in password field:
      if (currentUser) {
        // If input pw is empty string...
        if (inputPWNoWhitespaces === "") {
          setPasswordError("Please fill out this field");
          // If input pw isn't empty string & is unequal to current user's pw, and input pw isn't empty string...
        } else if (
          currentUser.password !== inputPWNoWhitespaces &&
          inputPWNoWhitespaces !== ""
        ) {
          setPasswordError("Password doesn't match user");
          // If input pw simply isn't valid...
        } else if (!passwordIsValid(inputPWNoWhitespaces)) {
          setPasswordError("Invalid password");
          // If no error conditions are true, remove error message...
        } else {
          setPasswordError("");
        }
      }

      // If user enters password w/o first having input username or email (can only check for validity)...
      if (!currentUser) {
        !passwordIsValid(inputPWNoWhitespaces)
          ? setPasswordError("Invalid password")
          : setPasswordError("");
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
      allSignupFormFieldsFilled && areNoSignupFormErrors
        ? setCurrentUser(userData)
        : setCurrentUser(null);

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
      if (
        allSignupFormFieldsFilled &&
        firstNameError === "" &&
        lastNameError === "" &&
        usernameError === "" &&
        emailError === "" &&
        passwordError === "" &&
        (confirmationPasswordError === "Passwords don't match" ||
          confirmationPasswordError === "")
      ) {
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }

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
  const handleUsernameOrEmailInput = (input: string): void => {
    const inputNoWhitespaces = input.replace(/\s/g, "");
    //fetchAllUsers();

    const usernameExists: boolean | null =
      allUsers && !fetchAllUsersQuery.isLoading
        ? allUsers.map((user) => user.username).includes(inputNoWhitespaces)
        : null;

    const emailExists: boolean | null =
      allUsers && !fetchAllUsersQuery.isLoading
        ? allUsers
            .map((user) => user.emailAddress)
            .includes(inputNoWhitespaces.toLowerCase())
        : null;

    // If input matches pattern for an email:
    if (emailIsValid(inputNoWhitespaces.toLowerCase())) {
      const currentUser = allUsers
        ? allUsers.filter((user) => user.emailAddress === inputNoWhitespaces)[0]
        : null;
      setCurrentUser(currentUser);
      setUsername("");
      setUsernameError("");
      setLoginMethod("email");
      if (inputNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      }
      setEmailAddress(inputNoWhitespaces);
      // If email address isn't in database & field isn't empty string:
      if (!emailExists && inputNoWhitespaces !== "") {
        setEmailError("E-mail address not recognized");
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
        // If email is recognized...
      } else {
        setEmailError("");
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and password field isn't empty string...
        } else if (currentUser?.password !== password && password !== "") {
          setPasswordError("Password doesn't match user");
        } else {
          setPasswordError("");
        }
      }
      // When user input is not an email address (aka, it's a username):
    } else {
      const currentUser = allUsers
        ? allUsers.filter((user) => user.username === input)[0]
        : null;
      setCurrentUser(currentUser);
      setEmailAddress("");
      setEmailError("");
      setLoginMethod("username");
      setUsername(inputNoWhitespaces);
      if (inputNoWhitespaces === "") {
        setEmailError("Please fill out this field");
      }
      // If username doesn't exist & its field contains at least 1 character:
      if (!usernameExists && inputNoWhitespaces !== "") {
        setUsernameError("Data not recognized");
        // If pw isn't valid & isn't empty string...
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
        } else {
          setPasswordError("");
        }
        // If username is recognized & at least 1 character has been input...
      } else {
        setUsernameError("");
        if (password === "") {
          setPasswordError("Please fill out this field");
        } else if (!passwordIsValid(password)) {
          setPasswordError("Invalid password");
          // If currentUser exists, its pw isn't equal to input pw, and pw field isn't empty string...
        } else if (currentUser && currentUser.password !== password && password !== "") {
          setPasswordError("Password doesn't match user");
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

  const handleSendFriendRequest = (
    sender: TUser | undefined,
    recipient: TUser,
    friendRequestsSent?: string[],
    setFriendRequestsSent?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ): void => {
    if (friendRequestsSent && setFriendRequestsSent && recipient._id) {
      setFriendRequestsSent(friendRequestsSent.concat(recipient._id));
    }

    if (sender) {
      setIsLoading(true);
      sendFriendRequestMutation.mutate({ sender, recipient });
    }
  };

  const handleRetractFriendRequest = (
    sender: TUser,
    recipient: TUser,
    friendRequestsSent?: string[],
    setFriendRequestsSent?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ): void => {
    setIsLoading(true);

    if (setFriendRequestsSent && friendRequestsSent) {
      setFriendRequestsSent(
        friendRequestsSent.filter((userID) => userID !== recipient._id)
      );
    }

    const event = "retract-request";
    retractSentFriendRequestMutation.mutate({ sender, recipient, event });
  };

  const handleAcceptFriendRequest = (
    e: React.ChangeEvent<HTMLInputElement>,
    sender: TUser,
    receiver: TUser,
    friendRequestsReceived?: string[],
    setFriendRequestsReceived?: React.Dispatch<
      React.SetStateAction<string[] | undefined>
    >,
    friends?: string[],
    setFriends?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ): void => {
    e.preventDefault();
    setIsLoading(true);

    if (showFriendRequestResponseOptions) {
      setShowFriendRequestResponseOptions(false);
    }

    if (friends && setFriends && sender._id) {
      setFriends(friends.concat(sender._id));
    }

    if (friendRequestsReceived && setFriendRequestsReceived) {
      setFriendRequestsReceived(
        friendRequestsReceived.filter((userID) => userID !== sender._id)
      );
    }

    addToSenderFriendsMutation.mutate({ sender, receiver });
  };

  const handleRejectFriendRequest = (
    e: React.ChangeEvent<HTMLInputElement>,
    sender: TUser,
    receiver: TUser,
    friendRequestsReceived?: string[],
    setFriendRequestsReceived?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ) => {
    e.preventDefault();

    setIsLoading(true);

    if (showFriendRequestResponseOptions) {
      setShowFriendRequestResponseOptions(false);
    }

    if (setFriendRequestsReceived && friendRequestsReceived) {
      setFriendRequestsReceived(
        friendRequestsReceived.filter((userID) => userID !== sender._id)
      );
    }

    const event = "reject-request";
    const recipient = receiver;
    retractSentFriendRequestMutation.mutate({ sender, recipient, event });
  };

  const handleUnfriending = (
    user: TUser,
    friend: TUser,
    friends?: string[],
    setFriends?: React.Dispatch<React.SetStateAction<string[] | undefined>>
  ): void => {
    if (friends && setFriends) {
      setFriends(friends.filter((userID) => userID !== friend._id));
    }

    const removeUserFromFriendsFriendsArray = friend
      ? Requests.deleteFriendFromFriendsArray(user, friend)
      : undefined;

    const removeFriendFromUserFriendsArray = user
      ? Requests.deleteFriendFromFriendsArray(friend, user)
      : undefined;

    const promisesToAwait =
      removeUserFromFriendsFriendsArray && removeFriendFromUserFriendsArray
        ? [removeUserFromFriendsFriendsArray, removeFriendFromUserFriendsArray]
        : undefined;

    let allRequestsAreOK = true;

    if (promisesToAwait) {
      setIsLoading(true);
      Promise.all(promisesToAwait)
        .then(() => {
          for (const promise of promisesToAwait) {
            promise.then((response) => {
              if (!response.ok) {
                allRequestsAreOK = false;
                if (friends && setFriends) {
                  setFriends(friends);
                }
              }
            });
          }
        })
        .then(() => {
          if (!allRequestsAreOK) {
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
            if (friends && setFriends) {
              setFriends(friends);
            }
          } else {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            if (fetchAllUsersQuery.data && currentUser) {
              allUsers = fetchAllUsersQuery.data;
              setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
            }
            toast(`You have unfriended ${friend.firstName} ${friend.lastName}.`, {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
    }
  };

  // Defined here, since used in DropdownChecklist & EventForm

  // maybe pass in a TUser[] & its setter in order to optimistically render UserCards on FindPalz/MyPalz, FriendRequests
  const handleBlockUser = (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | null,
    setBlockedUsers?: React.Dispatch<SetStateAction<string[] | null>>
  ): void => {
    if (blockedUsers && setBlockedUsers && blockee._id) {
      setBlockedUsers(blockedUsers.concat(blockee._id));
    }
    setIsLoading(true);
    const areFriends: boolean =
      blocker._id &&
      blockee._id &&
      (blocker.friends.includes(blockee._id) || blockee.friends.includes(blocker._id))
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
  };

  // No mutation needed here, as operation is simpler than blocking
  const handleUnblockUser = (
    blocker: TUser,
    blockee: TUser,
    blockedUsers?: string[] | null,
    setBlockedUsers?: React.Dispatch<SetStateAction<string[] | null>>
  ): void => {
    setIsLoading(true);

    if (blockedUsers && setBlockedUsers) {
      setBlockedUsers(blockedUsers.filter((userID) => userID !== blockee._id));
    }

    if (blockee._id) {
      Requests.removeFromBlockedUsers(blocker, blockee._id)
        .then((response) => {
          if (!response.ok) {
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
          } else {
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
            if (fetchAllUsersQuery.data && currentUser) {
              allUsers = fetchAllUsersQuery.data;
              setCurrentUser(allUsers.filter((user) => user._id === currentUser._id)[0]);
            }
            toast.success(`Unblocked ${blockee.username}.`, {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid green",
              },
            });
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
  const valuesToUpdate: TUserValuesToUpdate = {
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

  const handleSignupOrLoginFormSubmission = (
    isOnSignup: boolean,
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    /*
     Check input data against most-recent allUsers. It will only be necessary to check if username or email address already exist in allUsers, as errors & completion are checked in onClick, and this function is only called if there are no errors and if all forms are complete. If username or email address do exist, alert user & reject submission; else, accept submission.
    */
    queryClient
      .invalidateQueries({ queryKey: "allUsers" })
      .then(() => {
        /* 
        When signing up, it's necessary to check username & emailAddress against those already in allUsers. When logging in, it's necessary to check these against all OTHER users in allUsers.
        */
        let usernameIsUnique: boolean = false;
        let emailAddressIsUnique: boolean = false;
        if (isOnSignup) {
          if (allUsers) {
            usernameIsUnique = !allUsers.map((user) => user.username).includes(username);
            emailAddressIsUnique = !allUsers
              .map((user) => user.emailAddress)
              .includes(emailAddress);
          }
        } else {
          if (allUsers) {
            const allOtherUsers =
              loginMethod === "email"
                ? allUsers.filter((user) => user.emailAddress !== emailAddress)
                : allUsers.filter((user) => user.username !== username);
            usernameIsUnique = !allOtherUsers
              .map((user) => user.username)
              .includes(username);
            emailAddressIsUnique = !allOtherUsers
              .map((user) => user.emailAddress)
              .includes(emailAddress);
          }
        }

        if (usernameIsUnique && emailAddressIsUnique) {
          handleWelcomeMessage();
          // If user had pw visible when logging in/signing up, hide it again, so it's hidden by default on edit-user-info form in Settings
          if (!passwordIsHidden) {
            toggleHidePassword();
          }
          if (isOnSignup) {
            newUserMutation.mutate(userData);
            setUserCreatedAccount(true);
            setCurrentUser(userData);
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
          } else {
            setUserCreatedAccount(false);
            if (allUsers) {
              if (emailAddress !== "") {
                setCurrentUser(
                  allUsers.filter((user) => user.emailAddress === emailAddress)[0]
                );
              } else if (username !== "") {
                setCurrentUser(allUsers.filter((user) => user.username === username)[0]);
              }
            }
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
          }
          setFirstNameError("");
          setLastNameError("");
          setUsernameError("");
          setEmailError("");
          setPasswordError("");
          setConfirmationPasswordError("");
        } else {
          handleFormRejection(e);
        }
      })
      .catch((error) => {
        console.log(error);
        if (isOnSignup) {
          window.alert("Could not complete signup; please try again.");
        } else {
          window.alert("Could not complete login; please try again.");
        }
      });
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
    window.location.reload(); // reload pg in order to reduce memory usage
  };

  const allOtherUsers: TUser[] =
      allUsers && currentUser
        ? allUsers.filter((user) => user._id !== currentUser._id)
        : [];
  
    const getChatMembers = (chat: TChat): TUser[] => {
      let chatMembers: TUser[] = [];
      for (const user of allOtherUsers) {
        if (user._id && chat.members.includes(user._id)) {
          chatMembers.push(user);
        }
      }
      return chatMembers;
    };

  const userContextValues: TUserContext = {
    getChatMembers,
    fetchChatsQuery,
    userChats,
    removeProfileImageMutation,
    updateProfileImageMutation,
    fetchAllUsersQuery,
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
    handleBlockUser,
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
    valuesToUpdate,
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
