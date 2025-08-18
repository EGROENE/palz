import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import styles from "./styles.module.css";
import {
  TThemeColor,
  TUser,
  TEvent,
  TChat,
  TBarebonesUser,
  TUserSecure,
  TEventValuesToUpdate,
} from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { countries } from "../../../constants";
import Methods from "../../../methods";
import Requests from "../../../requests";
import Tab from "../../Elements/Tab/Tab";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";
import { useChatContext } from "../../../Hooks/useChatContext";
import { useQueryClient } from "@tanstack/react-query";

const OtherUserProfile = () => {
  const navigation = useNavigate();
  const { theme, isLoading, error, setError } = useMainContext();
  const {
    logout,
    currentUser,
    userCreatedAccount,
    handleSendFriendRequest,
    handleRetractFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    setCurrentUser,
    friendRequestsSent,
    handleUnblockUser,
    blockedUsers,
    friendRequestsReceived,
    handleUnfriending,
    setBlockedUsers,
    setBlockUserInProgress,
  } = useUserContext();
  const { setCurrentEvent } = useEventContext();
  const { getStartOrOpenChatWithUserHandler, fetchChatsQuery } = useChatContext();
  const userChats = fetchChatsQuery.data;
  const { username } = useParams();
  const queryClient = useQueryClient();

  if (error) {
    throw new Error(error);
  }

  const [pageOwner, setPageOwner] = useState<TUserSecure | null>(null);
  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [fetchUserInfoIsLoading, setUserInfoFetchIsLoading] = useState<boolean>(false);
  const [fetchCommonPalzIsLoading, setFetchCommonPalzIsLoading] = useState<boolean>(true);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);
  const [showMutualFriends, setShowMutualFriends] = useState<boolean>(false);
  const [currentUserMayMessage, setCurrentUserMayMessage] = useState<boolean>(false);
  const [showFacebook, setShowFacebook] = useState<boolean>(false);
  const [showInstagram, setShowInstagram] = useState<boolean>(false);
  const [showX, setShowX] = useState<boolean>(false);
  const [currentUserCanSeeLocation, setCurrentUserCanSeeLocation] =
    useState<boolean>(false);
  const [currentUserCanSeeEmailAddress, setCurrentUserCanSeeEmailAddress] =
    useState<boolean>(false);
  const [currentUserCanSeePhoneNumber, setCurrentUserCanSeePhoneNumber] =
    useState<boolean>(false);
  const [currentUserCanSeeFriendsList, setCurrentUserCanSeeFriendsList] =
    useState<boolean>(false);
  const [currentUserIsFriendOfFriend, setCurrentUserIsFriendOfFriend] =
    useState<boolean>(false);
  const [matchingCountryObject, setMatchingCountryObject] = useState<
    | {
        country: string;
        abbreviation: string;
        phoneCode: string;
      }
    | undefined
  >(undefined);
  const [palzInCommon, setPalzInCommon] = useState<TBarebonesUser[] | null>(null);
  const [palzInCommonText, setPalzInCommonText] = useState<string | undefined>(undefined);

  const [upcomingEventsUserRSVPdTo, setUpcomingEventsUserRSVPdTo] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchUpcomingEventsUserRSVPdToIsLoading,
    setFetchUpcomingEventsUserRSVPdToIsLoading,
  ] = useState<boolean>(true);

  const [ongoingEvents, setOngoingEvents] = useState<TEvent[] | null>(null);
  const [fetchOngoingEventsIsLoading, setFetchOngoingEventsIsLoading] =
    useState<boolean>(true);

  const [upcomingEventsUserOrganizes, setUpcomingEventsUserOrganizes] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchUpcomingEventsUserOrganizesIsLoading,
    setFetchUpcomingEventsUserOrganizesIsLoading,
  ] = useState<boolean>(true);

  const [recentEventsUserRSVPdTo, setRecentEventsUserRSVPdTo] = useState<TEvent[] | null>(
    null
  );
  const [
    fetchRecentEventsUserRSVPdToIsLoading,
    setFetchRecentEventsUserRSVPdToIsLoading,
  ] = useState<boolean>(true);

  const [upcomingEventsUserInvitedTo, setUpcomingEventsUserInvitedTo] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchUpcomingEventsUserInvitedToIsLoading,
    setFetchUpcomingEventsUserInvitedToIsLoading,
  ] = useState<boolean>(true);

  const [recentEventsUserOrganized, setRecentEventsUserOrganized] = useState<
    TEvent[] | null
  >(null);
  const [
    fetchRecentEventsUserOrganizedIsLoading,
    setFetchRecentEventsUserOrganizedIsLoading,
  ] = useState<boolean>(true);

  const [interestedEventsAreVisible, setInterestedEventsAreVisible] =
    useState<boolean>(false);

  const [organizedEventsAreVisible, setOrganizedEventsAreVisible] =
    useState<boolean>(false);

  const [invitedEventsAreVisible, setInvitedEventsAreVisible] = useState<boolean>(false);

  useEffect(() => {
    setPalzInCommonText(undefined);
    setPalzInCommon(null);
    setUpcomingEventsUserRSVPdTo(null);
    setOngoingEvents(null);
    setUpcomingEventsUserOrganizes(null);
    setRecentEventsUserRSVPdTo(null);
    setRecentEventsUserOrganized(null);
    setCurrentUserMayMessage(false);
    setShowFacebook(false);
    setShowInstagram(false);
    setShowX(false);
    setCurrentUserCanSeeLocation(false);
    setCurrentUserCanSeeEmailAddress(false);
    setCurrentUserCanSeePhoneNumber(false);
    setCurrentUserCanSeeFriendsList(false);
    setCurrentUserIsFriendOfFriend(false);
    setMatchingCountryObject(undefined);

    if (currentOtherUserIsBlocked) {
      toast("You have blocked this user", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }

    if (showFriends) {
      setShowFriends(false);
    }

    if (showMutualFriends) {
      setShowMutualFriends(false);
    }

    // Set color of event card's border randomly:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
    window.scrollTo(0, 0);
  }, [username]);

  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      logout();
      setCurrentEvent(undefined);
      navigation("/");
    }

    if (username && currentUser) {
      Requests.getUserByUsername(username)
        .then((res) => {
          if (res.ok) {
            res.json().then((currentOtherUser: TUser) => {
              // Boot from pg if currentUserIsBlocked
              // Else, get values for page
              if (
                currentOtherUser &&
                currentUser &&
                currentUser._id &&
                currentOtherUser.blockedUsers.includes(currentUser._id.toString())
              ) {
                toast("You do not have access to this page", {
                  style: {
                    background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                    color: theme === "dark" ? "black" : "white",
                    border: "2px solid red",
                  },
                });
                navigation(`/homepage/${currentUser?.username}`);
              } else {
                setPageOwner(
                  Methods.getTUserSecureFromTUser(currentOtherUser, currentUser)
                );

                // Set currentUserMayMessage:
                if (
                  currentUser &&
                  currentUser._id &&
                  currentOtherUser._id &&
                  (currentOtherUser.whoCanMessage === "anyone" ||
                    (currentOtherUser.whoCanMessage === "friends" &&
                      currentOtherUser.friends.includes(currentUser._id.toString()) &&
                      currentUser?.friends.includes(currentOtherUser._id.toString())) ||
                    (currentOtherUser.whoCanMessage === "friends of friends" &&
                      (currentUserIsFriendOfFriend ||
                        (currentOtherUser.friends.includes(currentUser._id.toString()) &&
                          currentUser?.friends.includes(
                            currentOtherUser._id.toString()
                          )))))
                ) {
                  setCurrentUserMayMessage(true);
                } else {
                  setCurrentUserMayMessage(false);
                }

                // Set currentUserCanSeeLocation:
                if (
                  currentUser?._id &&
                  currentOtherUser.whoCanSeeLocation !== "nobody" &&
                  (currentOtherUser.whoCanSeeLocation === "anyone" ||
                    (currentOtherUser.whoCanSeeLocation === "friends of friends" &&
                      (currentUserIsFriendOfFriend ||
                        currentOtherUser.friends.includes(currentUser._id.toString()))) ||
                    (currentOtherUser.whoCanSeeLocation === "friends" &&
                      currentOtherUser.friends.includes(currentUser._id.toString()))) &&
                  currentOtherUser.city !== "" &&
                  currentOtherUser &&
                  currentOtherUser.stateProvince !== "" &&
                  currentOtherUser &&
                  currentOtherUser.country !== ""
                ) {
                  setCurrentUserCanSeeLocation(true);
                }

                // Set currentOtherUser's country object:
                setMatchingCountryObject(
                  countries.filter(
                    (country) => country.country === currentOtherUser.country
                  )[0]
                );

                // Determine if currentUser may see friends list:
                const currentUserIsFriend: boolean =
                  currentUser && currentUser._id
                    ? currentOtherUser.friends.includes(currentUser._id.toString())
                    : false;

                // Set currentUserCanSeeEmailAddress to true if conditions are met:
                if (
                  currentOtherUser.whoCanSeeEmailAddress === "anyone" ||
                  (currentOtherUser.whoCanSeeEmailAddress === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEmailAddress === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setCurrentUserCanSeeEmailAddress(true);
                }
                // Set currentUserCanSeePhoneNumber if conditions are met:
                if (
                  currentOtherUser.whoCanSeePhoneNumber === "anyone" ||
                  (currentOtherUser.whoCanSeePhoneNumber === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeePhoneNumber === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setCurrentUserCanSeePhoneNumber(true);
                }

                // Set currentUserCanSeeFriendsList to true if conditions met:
                if (
                  ((currentUserIsFriend &&
                    currentOtherUser.whoCanSeeFriendsList === "friends") ||
                    currentOtherUser.whoCanSeeFriendsList === "anyone" ||
                    (currentOtherUser.whoCanSeeFriendsList === "friends of friends" &&
                      (currentUserIsFriendOfFriend || currentUserIsFriend))) &&
                  currentOtherUser.friends.length > 0
                ) {
                  setCurrentUserCanSeeFriendsList(true);
                }

                const palzInCommonIDs = Methods.removeDuplicatesFromArray(
                  currentUser.friends
                    .concat(currentOtherUser.friends)
                    .filter(
                      (id) =>
                        currentUser.friends.includes(id) &&
                        currentOtherUser.friends.includes(id)
                    )
                );

                const palzInCommonPromisesToAwait = palzInCommonIDs.map((id) => {
                  return Requests.getUserByID(id).then((res) => {
                    return res.json().then((user: TUser) => user);
                  });
                });

                setFetchCommonPalzIsLoading(true);
                Promise.all(palzInCommonPromisesToAwait)
                  .then((pic: TUser[]) => {
                    setPalzInCommon(pic.map((p) => Methods.getTBarebonesUser(p)));
                    if (pic.length > 2) {
                      setPalzInCommonText(
                        `You are both friends with ${pic
                          .slice(0, 2)
                          .map((pal) => `${pal.firstName} ${pal.lastName}`)
                          .join(", ")} +${pic.length - 2} more`
                      );
                    } else if (pic.length > 0) {
                      setPalzInCommonText(
                        `You are both friends with ${pic
                          .map((pal) => `${pal.firstName} ${pal.lastName}`)
                          .join(" & ")}`
                      );
                    } else {
                      setPalzInCommonText("No mutual friends");
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    setIsFetchError(true);
                  })
                  .finally(() => setFetchCommonPalzIsLoading(false));

                // Only fetch type of events if that type is visible to currentUser (remove these conditionals in Render, only rendering those events if they exist)
                Requests.getUpcomingEventsUserRSVPdTo(username)
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((events: TEvent[]) => {
                        setUpcomingEventsUserRSVPdTo(events);
                      });
                    } else {
                      setIsFetchError(true);
                    }
                  })
                  .catch((error) => console.log(error))
                  .finally(() => setFetchUpcomingEventsUserRSVPdToIsLoading(false));

                Requests.getUpcomingEventsUserInvitedTo(username)
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((events: TEvent[]) => {
                        setUpcomingEventsUserInvitedTo(events);
                      });
                    } else {
                      setIsFetchError(true);
                    }
                  })
                  .catch((error) => console.log(error))
                  .finally(() => setFetchUpcomingEventsUserInvitedToIsLoading(false));

                Requests.getOngoingEvents(username)
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((events: TEvent[]) => {
                        setOngoingEvents(events);
                      });
                    } else {
                      setIsFetchError(true);
                    }
                  })
                  .catch((error) => console.log(error))
                  .finally(() => setFetchOngoingEventsIsLoading(false));

                Requests.getUpcomingEventsUserOrganizes(username)
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((events: TEvent[]) => {
                        setUpcomingEventsUserOrganizes(events);
                      });
                    } else {
                      setIsFetchError(true);
                    }
                  })
                  .catch((error) => console.log(error))
                  .finally(() => setFetchUpcomingEventsUserOrganizesIsLoading(false));

                Requests.getRecentEventsUserRSVPdTo(username)
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((events: TEvent[]) => {
                        setRecentEventsUserRSVPdTo(events);
                      });
                    } else {
                      setIsFetchError(true);
                    }
                  })
                  .catch((error) => console.log(error))
                  .finally(() => setFetchRecentEventsUserRSVPdToIsLoading(false));

                Requests.getRecentEventsUserOrganized(username)
                  .then((res) => {
                    if (res.ok) {
                      res.json().then((events: TEvent[]) => {
                        setRecentEventsUserOrganized(events);
                      });
                    } else {
                      setIsFetchError(true);
                    }
                  })
                  .catch((error) => console.log(error))
                  .finally(() => setFetchRecentEventsUserOrganizedIsLoading(false));

                if (
                  currentOtherUser.whoCanSeeEventsInterestedIn === "anyone" ||
                  (currentOtherUser.whoCanSeeEventsInterestedIn === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEventsInterestedIn ===
                    "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setInterestedEventsAreVisible(true);
                }

                if (
                  currentOtherUser.whoCanSeeEventsOrganized === "anyone" ||
                  (currentOtherUser.whoCanSeeEventsOrganized === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEventsOrganized === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setOrganizedEventsAreVisible(true);
                }

                if (
                  currentOtherUser.whoCanSeeEventsInvitedTo === "anyone" ||
                  (currentOtherUser.whoCanSeeEventsInvitedTo === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEventsInvitedTo === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setInvitedEventsAreVisible(true);
                }

                // Set visibility of social links:
                if (
                  currentOtherUser.whoCanSeeFacebook === "anyone" ||
                  (currentOtherUser?.whoCanSeeFacebook === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser?.whoCanSeeFacebook === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setShowFacebook(true);
                }

                if (
                  currentOtherUser?.whoCanSeeInstagram === "anyone" ||
                  (currentOtherUser?.whoCanSeeInstagram === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser?.whoCanSeeInstagram === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setShowInstagram(true);
                }

                if (
                  currentOtherUser?.whoCanSeeX === "anyone" ||
                  (currentOtherUser?.whoCanSeeX === "friends" && currentUserIsFriend) ||
                  (currentOtherUser?.whoCanSeeX === "friends of friends" &&
                    (currentUserIsFriendOfFriend || currentUserIsFriend))
                ) {
                  setShowX(true);
                }

                setUserInfoFetchIsLoading(false);
              }
            });
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error));
    }
  }, [username, currentUser, navigation, userCreatedAccount]);

  const currentOtherUserIsBlocked: boolean =
    blockedUsers && pageOwner && pageOwner._id
      ? blockedUsers.map((u) => u._id).includes(pageOwner._id.toString())
      : false;

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const usersAreFriends: boolean =
    pageOwner &&
    pageOwner._id &&
    currentUser &&
    currentUser.friends.includes(pageOwner._id.toString())
      ? true
      : false;

  const currentUserHasSentFriendRequest: boolean =
    pageOwner &&
    pageOwner._id &&
    friendRequestsSent?.map((elem) => elem._id).includes(pageOwner._id.toString())
      ? true
      : false;

  const currentUserHasReceivedFriendRequest: boolean =
    pageOwner &&
    pageOwner._id &&
    friendRequestsReceived?.map((elem) => elem._id).includes(pageOwner._id.toString())
      ? true
      : false;

  // account for if user sent currentUser a FR
  const getFriendRequestButton = () => {
    if (currentUserHasSentFriendRequest) {
      return {
        type: "retract request",
        buttonText: (
          <>
            <i className="fas fa-user-minus"></i> Retract Request
          </>
        ),
        handler:
          currentUser && pageOwner
            ? () => handleRetractFriendRequest(pageOwner, currentUser, "retract-request")
            : undefined,
        paramsIncludeEvent: false,
      };
    }
    if (currentUserHasReceivedFriendRequest) {
      return {
        type: "respond to friend request",
        buttonText: "Accept/Decline Request",
        handler: () =>
          setShowFriendRequestResponseOptions(!showFriendRequestResponseOptions),
        paramsIncludeEvent: false,
      };
    }
    return {
      type: "add friend",
      buttonText: (
        <>
          <i className="fas fa-user-plus"></i> Add Friend
        </>
      ),
      handler:
        currentUser && pageOwner
          ? () => handleSendFriendRequest(pageOwner, true)
          : undefined,
      paramsIncludeEvent: false,
    };
  };
  const friendRequestButton = getFriendRequestButton();

  // have array with msg btn, array with FR button, array w/ block button
  const messageButton = {
    type: "message",
    buttonText: (
      <>
        <i className="fas fa-comments"></i>
        {` Message`}
      </>
    ),
    handler: pageOwner
      ? () => getStartOrOpenChatWithUserHandler(Methods.getTBarebonesUser(pageOwner))
      : undefined,
    paramsIncludeEvent: false,
  };

  const unfriendButton = {
    type: "unfriend",
    buttonText: (
      <>
        <i className="fas fa-user-minus"></i> Unfriend
      </>
    ),
    handler:
      currentUser && pageOwner
        ? () => {
            if (pageOwner) {
              return handleUnfriending(currentUser, pageOwner);
            }
          }
        : undefined,
    paramsIncludeEvent: false,
  };

  const handleBlockUserFail = (blockee: TUser | TUserSecure) => {
    setBlockUserInProgress(false);
    if (blockedUsers) {
      setBlockedUsers(blockedUsers.filter((u) => u._id !== blockee._id?.toString()));
    }
    toast.error("Could not block user. Please try again.", {
      style: {
        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
        color: theme === "dark" ? "black" : "white",
        border: "2px solid red",
      },
    });
  };

  // All blocking functionality defined here & not in userContext b/c userContext doesn't have access to event or chat data (it's possible to put requests in some function there to retrieve necessary data, but not practical while query exists to get all of currentUser's chats). Plus, blocking is only possible, now, from this component, so defining handleBlockUser here avoids unneeded abstraction.
  const handleBlockUser = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>): void => {
    e.preventDefault();

    setBlockUserInProgress(true);

    let promisesToAwait: Promise<Response>[] = [];

    // Optimistically set blockedUsers:
    if (blockedUsers) {
      setBlockedUsers(blockedUsers.concat(Methods.getTBarebonesUser(pageOwner)));
    }

    if (
      currentUser &&
      pageOwner &&
      pageOwner._id &&
      blockedUsers &&
      currentUser.username
    ) {
      Requests.getUserByID(pageOwner._id.toString())
        .then((res) => {
          if (res.ok) {
            res
              .json()
              .then((pageOwner: TUser) => {
                const areFriends: boolean =
                  currentUser._id &&
                  pageOwner._id &&
                  (currentUser.friends.includes(pageOwner._id.toString()) ||
                    pageOwner.friends.includes(currentUser._id.toString()))
                    ? true
                    : false;
                const hasSentFriendRequest: boolean = pageOwner._id
                  ? currentUser.friendRequestsSent.includes(pageOwner._id.toString())
                  : false;
                const hasReceivedFriendRequest: boolean = pageOwner._id
                  ? currentUser.friendRequestsReceived.includes(pageOwner._id.toString())
                  : false;

                //////////////////////////////////
                // Add requests to add to blockedUsers/By:
                if (currentUser._id && pageOwner && pageOwner._id) {
                  promisesToAwait.push(
                    Requests.addToBlockedUsers(currentUser, pageOwner._id.toString()),
                    Requests.addToBlockedBy(pageOwner, currentUser._id.toString())
                  );

                  // Add requests to delete from friend, friendRequestsReceived/Sent:
                  if (areFriends) {
                    promisesToAwait.push(
                      Requests.deleteFriendFromFriendsArray(currentUser, pageOwner),
                      Requests.deleteFriendFromFriendsArray(pageOwner, currentUser)
                    );
                  }

                  if (hasSentFriendRequest) {
                    promisesToAwait.push(
                      Requests.removeFromFriendRequestsSent(currentUser, pageOwner),
                      Requests.removeFromFriendRequestsReceived(
                        Methods.getTUserSecureFromTUser(currentUser, currentUser),
                        pageOwner
                      )
                    );
                  }

                  if (hasReceivedFriendRequest) {
                    promisesToAwait.push(
                      Requests.removeFromFriendRequestsSent(pageOwner, currentUser),
                      Requests.removeFromFriendRequestsReceived(
                        Methods.getTUserSecureFromTUser(pageOwner, currentUser),
                        pageOwner
                      )
                    );
                  }

                  // Delete any chat b/t blocker & blockee:
                  let chatToDelete: TChat | undefined = userChats
                    ? userChats.filter(
                        (chat) =>
                          currentUser &&
                          currentUser._id &&
                          pageOwner &&
                          pageOwner._id &&
                          chat.members.length === 2 &&
                          chat.members.includes(currentUser._id.toString()) &&
                          chat.members.includes(pageOwner._id.toString())
                      )[0]
                    : undefined;

                  if (chatToDelete && chatToDelete._id) {
                    promisesToAwait.push(
                      Requests.deleteChat(chatToDelete._id.toString())
                    );
                  }

                  // Delete pageOwner (blockee) from invitee, organizer, & RSVP lists of events currentUser created; add pageOwner to each event's blockedUsersEvent list:
                  if (currentUser.username) {
                    Requests.getEventsUserCreated(currentUser.username)
                      .then((res) => {
                        if (res.ok) {
                          res.json().then((eventsCreatedByCurrentUser: TEvent[]) => {
                            if (eventsCreatedByCurrentUser.length > 0) {
                              let requestsToUpdateEventsCreatedByCurrentUser = [];
                              for (const event of eventsCreatedByCurrentUser) {
                                // If currentUser is event creator & currentOtherUser is an invitee, remove currentOtherUser as invitee:
                                if (pageOwner._id) {
                                  // Maybe call handler to update event, updating invitees, blockedUsersEvent, organizers, and interestedUsers. Call Requests.updateEvent w/ eventValuesToUpdate defined as these updated lists:
                                  const eventValuesToUpdate: TEventValuesToUpdate = {
                                    invitees: event.invitees.filter(
                                      (i) => i !== pageOwner._id?.toString()
                                    ),
                                    organizers: event.organizers.filter(
                                      (o) => o !== pageOwner._id?.toString()
                                    ),
                                    interestedUsers: event.interestedUsers.filter(
                                      (u) => u !== pageOwner._id?.toString()
                                    ),
                                    blockedUsersEvent: event.blockedUsersEvent.concat(
                                      pageOwner._id.toString()
                                    ),
                                  };

                                  requestsToUpdateEventsCreatedByCurrentUser.push(
                                    Requests.updateEvent(event, eventValuesToUpdate)
                                  );
                                }
                              }

                              for (const request of requestsToUpdateEventsCreatedByCurrentUser) {
                                promisesToAwait.push(request);
                              }

                              Promise.all(promisesToAwait)
                                .then((resArray: Response[]) => {
                                  if (!resArray.every((res) => res.ok)) {
                                    handleBlockUserFail(pageOwner);
                                  } else {
                                    // Fetch updated currentUser:
                                    if (currentUser._id) {
                                      Requests.getUserByID(currentUser._id.toString())
                                        .then((res) => {
                                          if (res.ok) {
                                            res.json().then((cu: TUser) => {
                                              setCurrentUser(cu); // Fetch updated currentUser before doing this
                                              setBlockUserInProgress(false);
                                              toast(
                                                `You have blocked ${pageOwner.username}.`,
                                                {
                                                  style: {
                                                    background:
                                                      theme === "light"
                                                        ? "#242424"
                                                        : "rgb(233, 231, 228)",
                                                    color:
                                                      theme === "dark"
                                                        ? "black"
                                                        : "white",
                                                    border: "2px solid red",
                                                  },
                                                }
                                              );
                                            });
                                          } else {
                                            handleBlockUserFail(pageOwner);
                                          }
                                        })
                                        .catch((error) => console.log(error));
                                    }
                                  }
                                })
                                .catch((error) => console.log(error));
                            } else {
                              if (currentUser._id) {
                                Requests.getUserByID(currentUser._id.toString())
                                  .then((res) => {
                                    if (res.ok) {
                                      res.json().then((cu: TUser) => {
                                        setCurrentUser(cu); // Fetch updated currentUser before doing this
                                        setBlockUserInProgress(false);
                                        queryClient.invalidateQueries({
                                          queryKey: ["userChats"],
                                        });
                                        queryClient.refetchQueries({
                                          queryKey: ["userChats"],
                                        });
                                        toast(`You have blocked ${pageOwner.username}.`, {
                                          style: {
                                            background:
                                              theme === "light"
                                                ? "#242424"
                                                : "rgb(233, 231, 228)",
                                            color: theme === "dark" ? "black" : "white",
                                            border: "2px solid red",
                                          },
                                        });
                                      });
                                    } else {
                                      handleBlockUserFail(pageOwner);
                                    }
                                  })
                                  .catch((error) => console.log(error));
                              }
                            }
                          });
                        } else {
                          handleBlockUserFail(pageOwner);
                        }
                      })
                      .catch((error) => console.log(error));
                  }
                  /////////////////////////////
                }
              })
              .catch((error) => console.log(error));
          } else {
            if (pageOwner) {
              handleBlockUserFail(pageOwner);
            } else {
              setError("An error occurred; please reload the page.");
            }
          }
        })
        .catch((error) => console.log(error));
    } else {
      if (pageOwner) {
        handleBlockUserFail(pageOwner);
      } else {
        setError("An error occurred; please reload the page.");
      }
    }
  };

  const getBlockButton = () => {
    if (currentOtherUserIsBlocked && currentUser && pageOwner) {
      return {
        type: "unblock",
        buttonText: (
          <>
            <i className="fas fa-lock-open"></i> Unblock
          </>
        ),
        handler: () => {
          if (pageOwner) {
            return handleUnblockUser(
              Methods.getTBarebonesUser(currentUser),
              Methods.getTBarebonesUser(pageOwner)
            );
          }
        },
        paramsIncludeEvent: false,
      };
    }
    return {
      type: "block",
      buttonText: (
        <>
          <i className="fas fa-lock"></i> Block
        </>
      ),
      handler: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => handleBlockUser(e),
      paramsIncludeEvent: false,
    };
  };
  const blockButton = getBlockButton();

  const getDisplayedButtons = () => {
    return [
      currentUserMayMessage && !currentOtherUserIsBlocked && messageButton,
      !currentOtherUserIsBlocked &&
        (!usersAreFriends ? friendRequestButton : unfriendButton),
      blockButton,
    ];
  };
  const displayedButtons = getDisplayedButtons();

  const getNumberOfGroupChatsInCommon = (): number => {
    const currentUserChats = fetchChatsQuery.data;

    let chatsInCommon = [];
    if (currentUserChats && pageOwner && pageOwner._id) {
      for (const chat of currentUserChats) {
        if (chat.members.length > 2 && chat.members.includes(pageOwner._id.toString())) {
          chatsInCommon.push(chat);
        }
      }
    }
    return chatsInCommon.length;
  };
  const numberOfGroupChatsInCommon = getNumberOfGroupChatsInCommon();

  const fetchIsLoading: boolean =
    fetchUserInfoIsLoading ||
    fetchOngoingEventsIsLoading ||
    fetchUpcomingEventsUserRSVPdToIsLoading ||
    fetchUpcomingEventsUserOrganizesIsLoading ||
    fetchRecentEventsUserRSVPdToIsLoading ||
    fetchUpcomingEventsUserInvitedToIsLoading ||
    fetchRecentEventsUserOrganizedIsLoading;

  return (
    <>
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {isFetchError && !fetchIsLoading && (
        <p>Could not fetch user info; try reloading the page.</p>
      )}
      {pageOwner && !isFetchError && !fetchIsLoading && (
        <>
          {showFriendRequestResponseOptions && (
            <TwoOptionsInterface
              header={`Respond to friend request from ${pageOwner.firstName} ${pageOwner.lastName} (${pageOwner.username})`}
              buttonOneText="Decline"
              buttonOneHandler={handleRejectFriendRequest}
              buttonOneHandlerParams={[pageOwner]}
              handlerOneNeedsEventParam={true}
              buttonTwoText="Accept"
              buttonTwoHandler={handleAcceptFriendRequest}
              buttonTwoHandlerParams={[pageOwner, currentUser, true]}
              handlerTwoNeedsEventParam={true}
              closeHandler={setShowFriendRequestResponseOptions}
            />
          )}
          <>
            <div
              className={styles.kopfzeile}
              style={{ borderBottom: `3px solid ${randomColor}` }}
            >
              <div style={{ boxShadow: "unset" }} className="theme-element-container">
                <img
                  className={styles.profileImage}
                  src={
                    pageOwner.profileImage !== "" &&
                    typeof pageOwner.profileImage === "string"
                      ? pageOwner.profileImage
                      : defaultProfileImage
                  }
                />
              </div>
              <div className={styles.mainInfoContainer}>
                <header style={{ color: `${randomColor}` }}>
                  {pageOwner.firstName} {pageOwner.lastName}
                </header>

                <p style={{ color: randomColor }}>{pageOwner.username}</p>
                {currentUserCanSeeEmailAddress &&
                  pageOwner.emailAddress &&
                  pageOwner.emailAddress !== "" && (
                    <p style={{ color: randomColor }}>{pageOwner.emailAddress}</p>
                  )}
                {currentUserCanSeePhoneNumber &&
                  pageOwner.phoneCountryCode &&
                  pageOwner.phoneCountryCode !== "" &&
                  pageOwner.phoneNumberWithoutCountryCode &&
                  pageOwner.phoneNumberWithoutCountryCode !== "" && (
                    <p
                      style={{ color: randomColor }}
                    >{`+${pageOwner.phoneCountryCode} ${pageOwner.phoneNumberWithoutCountryCode}`}</p>
                  )}
                {currentUserCanSeeLocation &&
                  pageOwner &&
                  pageOwner.city !== "" &&
                  pageOwner.stateProvince !== "" &&
                  pageOwner.country !== "" && (
                    <div className={styles.userLocationContainer}>
                      <p
                        style={{ color: randomColor }}
                      >{`${pageOwner.city}, ${pageOwner.stateProvince}`}</p>
                      <img
                        src={`/flags/4x3/${matchingCountryObject?.abbreviation}.svg`}
                      />
                    </div>
                  )}
                {palzInCommonText && palzInCommon && (
                  <p
                    style={{ color: randomColor }}
                    className={
                      palzInCommon.length > 2 ? `${styles.mutualFriendsLink}` : undefined
                    }
                    onClick={
                      palzInCommon.length > 0
                        ? () => setShowMutualFriends(true)
                        : undefined
                    }
                  >
                    {palzInCommonText}
                    {palzInCommon.length > 0 && (
                      <i
                        style={{
                          transform: "rotate(22.5deg)",
                          fontSize: "1.25rem",
                          marginLeft: "0.25rem",
                        }}
                        className="fas fa-arrow-up"
                      ></i>
                    )}
                  </p>
                )}

                {numberOfGroupChatsInCommon > 1 && (
                  <p
                    style={{ color: randomColor }}
                  >{`You are in ${numberOfGroupChatsInCommon} group chats together`}</p>
                )}
                {numberOfGroupChatsInCommon === 1 && (
                  <p
                    style={{ color: randomColor }}
                  >{`You are in ${numberOfGroupChatsInCommon} group chat together`}</p>
                )}
                {(showFacebook || showInstagram || showX) && (
                  <div className={styles.socialLinksContainer}>
                    {showFacebook && (
                      <a
                        title={`${pageOwner.username}'s Facebook Profile`}
                        href={`${pageOwner.facebook}`}
                        target="_blank"
                      >
                        <span className="fab fa-facebook"></span>
                      </a>
                    )}
                    {showInstagram && pageOwner.instagram !== "" && (
                      <a
                        title={`${pageOwner.username}'s Instagram Profile`}
                        href={`${pageOwner.instagram}`}
                        target="_blank"
                      >
                        <span className="fab fa-instagram"></span>
                      </a>
                    )}
                    {showX && pageOwner.x !== "" && (
                      <a
                        title={`${pageOwner.username}'s X Profile`}
                        href={`${pageOwner.x}`}
                        target="_blank"
                      >
                        <span className="fab fa-twitter-square"></span>
                      </a>
                    )}
                  </div>
                )}
                <div className={styles.actionButtonsContainer}>
                  {displayedButtons.map(
                    (button) =>
                      button && (
                        <div
                          key={button.type}
                          style={{ maxHeight: "3rem", display: "flex" }}
                          className="theme-element-container"
                        >
                          <button disabled={isLoading} onClick={button.handler}>
                            {button.buttonText}
                          </button>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
            <section className="furtherInfoSection">
              {pageOwner.about !== "" && (
                <div className={styles.about}>
                  <header>About me :</header>
                  <p>{pageOwner.about}</p>
                </div>
              )}
              {pageOwner.interests.length > 0 ? (
                <div className={styles.infoPoint}>
                  <header>I'm interested in : </header>
                  <span>
                    {pageOwner.interests.map((int) => (
                      <Tab
                        key={int}
                        randomColor={randomColor}
                        info={int}
                        userMayNotDelete={true}
                      />
                    ))}
                  </span>
                </div>
              ) : (
                <p>No interests to show</p>
              )}
              {currentUserCanSeeFriendsList && (
                <div className={styles.infoPoint}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <header
                      tabIndex={0}
                      className={styles.clickableHeader}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setShowFriends(true);
                        }
                      }}
                      onClick={() => setShowFriends(true)}
                    >
                      See friends
                    </header>
                    <i
                      style={{
                        transform: "rotate(22.5deg)",
                        fontSize: "1.25rem",
                        marginLeft: "0.25rem",
                        color: randomColor,
                      }}
                      className="fas fa-arrow-up"
                    ></i>
                  </div>
                </div>
              )}
              {showMutualFriends && palzInCommon && (
                <UserListModal
                  listType="mutual-friends"
                  renderButtonOne={true}
                  buttonOneText="View Profile"
                  renderButtonTwo={false}
                  closeModalMethod={setShowMutualFriends}
                  header="Mutual Friends"
                  users={palzInCommon}
                  outsideFetchIsError={isFetchError}
                  outsideFetchIsLoading={fetchIsLoading || fetchCommonPalzIsLoading}
                  randomColor={randomColor}
                />
              )}
              {showFriends && pageOwner.friends && (
                <UserListModal
                  listType="other-user-friends"
                  renderButtonOne={true}
                  renderButtonTwo={false}
                  closeModalMethod={setShowFriends}
                  header={`${pageOwner.username} 's palz`}
                  outsideFetchIsError={isFetchError}
                  buttonOneText="View Profile"
                  randomColor={randomColor}
                />
              )}
              {ongoingEvents &&
                ongoingEvents.length > 0 &&
                interestedEventsAreVisible &&
                organizedEventsAreVisible && (
                  <UserEventsSection
                    key="ongoingEvents"
                    eventsArray={ongoingEvents}
                    header="Ongoing Events"
                  />
                )}
              {upcomingEventsUserOrganizes &&
                upcomingEventsUserOrganizes.length > 0 &&
                organizedEventsAreVisible && (
                  <UserEventsSection
                    key="upcomingEventsUserOrganizes"
                    eventsArray={upcomingEventsUserOrganizes}
                    header="Upcoming Events I'm Organizing"
                  />
                )}
              {upcomingEventsUserRSVPdTo &&
                upcomingEventsUserRSVPdTo.length > 0 &&
                interestedEventsAreVisible && (
                  <UserEventsSection
                    key="upcomingEventsUserRSVPdTo"
                    eventsArray={upcomingEventsUserRSVPdTo}
                    header="Upcoming Events I've RSVP'd To"
                  />
                )}
              {upcomingEventsUserInvitedTo &&
                upcomingEventsUserInvitedTo.length > 0 &&
                invitedEventsAreVisible && (
                  <UserEventsSection
                    key="upcomingEventsUserRSVPdTo"
                    eventsArray={upcomingEventsUserInvitedTo}
                    header="Upcoming Events I've been invited To"
                  />
                )}
              {recentEventsUserOrganized &&
                recentEventsUserOrganized.length > 0 &&
                organizedEventsAreVisible && (
                  <UserEventsSection
                    key="recentEventsUserOrganized"
                    eventsArray={recentEventsUserOrganized}
                    header="Recent Events I Organized"
                  />
                )}
              {recentEventsUserRSVPdTo &&
                recentEventsUserRSVPdTo.length > 0 &&
                interestedEventsAreVisible && (
                  <UserEventsSection
                    key="recentEventsUserRSVPdTo"
                    eventsArray={recentEventsUserRSVPdTo}
                    header="Recent Events I RSVP'd To"
                  />
                )}
            </section>
          </>
        </>
      )}
    </>
  );
};
export default OtherUserProfile;
