import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import styles from "./styles.module.css";
import { TThemeColor, TUser, TEvent, TChat, TBarebonesUser } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { countries } from "../../../constants";
import Methods from "../../../methods";
import Requests from "../../../requests";
import Tab from "../../Elements/Tab/Tab";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";
import { useChatContext } from "../../../Hooks/useChatContext";

const OtherUserProfile = () => {
  const navigation = useNavigate();
  const { theme, isLoading, error, setError } = useMainContext();
  const {
    logout,
    currentUser,
    currentOtherUser,
    userCreatedAccount,
    handleSendFriendRequest,
    handleRemoveFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    friendRequestsSent,
    addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists,
    handleUnblockUser,
    blockedUsers,
    setBlockedUsers,
    friendRequestsReceived,
    handleUnfriending,
    friends,
    setCurrentOtherUser,
  } = useUserContext();
  const {
    fetchAllEventsQuery,
    handleRemoveInvitee,
    handleRemoveOrganizer,
    handleDeleteUserRSVP,
  } = useEventContext();
  const allEvents = fetchAllEventsQuery.data;
  const { getStartOrOpenChatWithUserHandler, fetchChatsQuery, handleDeleteChat } =
    useChatContext();
  const userChats = fetchChatsQuery.data;
  const { username } = useParams();

  if (error) {
    throw new Error(error);
  }

  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);
  const [showMutualFriends, setShowMutualFriends] = useState<boolean>(false);
  const [currentUserMayMessage, setCurrentUserMayMessage] = useState<boolean>(false);
  const [showFacebook, setShowFacebook] = useState<boolean>(false);
  const [showInstagram, setShowInstagram] = useState<boolean>(false);
  const [showX, setShowX] = useState<boolean>(false);
  const [currentUserCanSeeLocation, setCurrentUserCanSeeLocation] =
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
  const [usersEvents, setUsersEvents] = useState<TDisplayedEvent[] | null>(null);

  useEffect(() => {
    setPalzInCommonText(undefined);
    setPalzInCommon(null);
    setUsersEvents(null);
    setCurrentUserMayMessage(false);
    setShowFacebook(false);
    setShowInstagram(false);
    setShowX(false);
    setCurrentUserCanSeeLocation(false);
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
                navigation(`/${currentUser?.username}`);
              } else {
                setCurrentOtherUser(
                  Methods.getTOtherUserFromTUser(currentOtherUser, currentUser)
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
                      currentUserIsFriendOfFriend))
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
                      currentUserIsFriendOfFriend) ||
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

                if (
                  ((currentUserIsFriend &&
                    currentOtherUser.whoCanSeeFriendsList === "friends") ||
                    currentOtherUser.whoCanSeeFriendsList === "anyone" ||
                    (currentOtherUser.whoCanSeeFriendsList === "friends of friends" &&
                      currentUserIsFriendOfFriend)) &&
                  currentOtherUser.friends.length > 0
                ) {
                  setCurrentUserCanSeeFriendsList(true);
                }

                const setFriendRelatedStates = (): void => {
                  setFetchIsLoading(true);

                  const palzInCommonIDs = Methods.removeDuplicatesFromArray(
                    currentUser.friends
                      .concat(currentOtherUser.friends)
                      .filter(
                        (id) =>
                          currentUser.friends.includes(id) &&
                          currentOtherUser.friends.includes(id)
                      )
                  );

                  const promisesToAwait = palzInCommonIDs.map((id) => {
                    return Requests.getUserByID(id).then((res) => {
                      return res.json().then((user: TUser) => user);
                    });
                  });
                  Promise.all(promisesToAwait)
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
                    .catch((error) => console.log(error));
                };

                setFriendRelatedStates();

                const upcomingEventsUserRSVPdTo: TEvent[] | undefined = allEvents?.filter(
                  (event) =>
                    event.eventStartDateTimeInMS > now &&
                    event.eventEndDateTimeInMS > now &&
                    currentOtherUser &&
                    currentOtherUser._id &&
                    event.interestedUsers
                      .map((i) => i._id)
                      .includes(currentOtherUser._id.toString())
                );

                const ongoingEvents: TEvent[] | undefined = allEvents?.filter((event) => {
                  event.eventStartDateTimeInMS < now &&
                    event.eventEndDateTimeInMS > now &&
                    currentOtherUser &&
                    currentOtherUser._id &&
                    (event.organizers
                      .map((o) => o._id)
                      .includes(currentOtherUser._id.toString()) ||
                      event.interestedUsers
                        .map((i) => i._id)
                        .includes(currentOtherUser._id.toString()));
                });

                const upcomingEventsUserOrganizes: TEvent[] | undefined =
                  allEvents?.filter(
                    (event) =>
                      event.eventStartDateTimeInMS > now &&
                      event.eventEndDateTimeInMS > now &&
                      currentOtherUser &&
                      currentOtherUser._id &&
                      event.organizers
                        .map((o) => o._id)
                        .includes(currentOtherUser._id.toString())
                  );

                const upcomingEventsUserInvitedTo: TEvent[] | undefined =
                  allEvents?.filter(
                    (event) =>
                      event.eventStartDateTimeInMS > now &&
                      event.eventEndDateTimeInMS > now &&
                      currentOtherUser &&
                      currentOtherUser._id &&
                      event.invitees
                        .map((i) => i._id)
                        .includes(currentOtherUser._id.toString())
                  );

                const pastEventsUserRSVPd: TEvent[] | undefined = allEvents?.filter(
                  (event) =>
                    currentOtherUser &&
                    currentOtherUser._id &&
                    event.interestedUsers
                      .map((i) => i._id)
                      .includes(currentOtherUser._id.toString()) &&
                    event.eventEndDateTimeInMS < now
                );

                const pastEventsUserOrganized: TEvent[] | undefined = allEvents?.filter(
                  (event) =>
                    currentOtherUser &&
                    currentOtherUser._id &&
                    event.creator !== currentUser?._id &&
                    event.organizers
                      .map((o) => o._id)
                      .includes(currentOtherUser._id.toString()) &&
                    event.eventEndDateTimeInMS < now
                );

                // Conditionally add upcomingEventsUserRSVPdTo, etc., depending on currentOtherUser's event-privacy settings:
                const interestedEventsAreVisible =
                  currentOtherUser.whoCanSeeEventsInterestedIn === "anyone" ||
                  (currentOtherUser.whoCanSeeEventsInterestedIn === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEventsInterestedIn ===
                    "friends of friends" &&
                    currentUserIsFriendOfFriend);

                const organizedEventsAreVisible =
                  currentOtherUser.whoCanSeeEventsOrganized === "anyone" ||
                  (currentOtherUser.whoCanSeeEventsOrganized === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEventsOrganized === "friends of friends" &&
                    currentUserIsFriendOfFriend);

                const invitedEventsAreVisible =
                  currentOtherUser.whoCanSeeEventsInvitedTo === "anyone" ||
                  (currentOtherUser.whoCanSeeEventsInvitedTo === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser.whoCanSeeEventsInvitedTo === "friends of friends" &&
                    currentUserIsFriendOfFriend);

                setUsersEvents([
                  ...(interestedEventsAreVisible
                    ? [
                        {
                          header: "Upcoming Events I've RSVP'd To",
                          array: upcomingEventsUserRSVPdTo,
                          type: "interested-event",
                        },
                      ]
                    : []),
                  ...(organizedEventsAreVisible
                    ? [
                        {
                          header: "My Ongoing Events",
                          array: ongoingEvents,
                          type: "organized-event",
                        },
                      ]
                    : []),
                  ...(organizedEventsAreVisible
                    ? [
                        {
                          header: "My Upcoming Events",
                          array: upcomingEventsUserOrganizes,
                          type: "organized-event",
                        },
                      ]
                    : []),
                  ...(invitedEventsAreVisible
                    ? [
                        {
                          header: "Upcoming Events I've Been Invited To",
                          array: upcomingEventsUserInvitedTo,
                          type: "invited-event",
                        },
                      ]
                    : []),
                  ...(interestedEventsAreVisible
                    ? [
                        {
                          header: "Past Events I RSVP'd To",
                          array: pastEventsUserRSVPd,
                          type: "interested-event",
                        },
                      ]
                    : []),
                  ...(organizedEventsAreVisible
                    ? [
                        {
                          header: "Past Events I Organized",
                          array: pastEventsUserOrganized,
                          type: "organized-event",
                        },
                      ]
                    : []),
                ]);

                // Set visibility of social links:
                if (
                  currentOtherUser.whoCanSeeFacebook === "anyone" ||
                  (currentOtherUser?.whoCanSeeFacebook === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser?.whoCanSeeFacebook === "friends of friends" &&
                    currentUserIsFriendOfFriend)
                ) {
                  setShowFacebook(true);
                }

                if (
                  currentOtherUser?.whoCanSeeInstagram === "anyone" ||
                  (currentOtherUser?.whoCanSeeInstagram === "friends" &&
                    currentUserIsFriend) ||
                  (currentOtherUser?.whoCanSeeInstagram === "friends of friends" &&
                    currentUserIsFriendOfFriend)
                ) {
                  setShowInstagram(true);
                }

                if (
                  currentOtherUser?.whoCanSeeX === "anyone" ||
                  (currentOtherUser?.whoCanSeeX === "friends" && currentUserIsFriend) ||
                  (currentOtherUser?.whoCanSeeX === "friends of friends" &&
                    currentUserIsFriendOfFriend)
                ) {
                  setShowX(true);
                }
              }
            });
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error));
    }
  }, [
    username,
    fetchAllEventsQuery.data,
    currentOtherUser,
    currentUser,
    navigation,
    userCreatedAccount,
  ]);

  const currentOtherUserIsBlocked: boolean =
    blockedUsers && currentOtherUser && currentOtherUser._id
      ? blockedUsers.includes(currentOtherUser._id.toString())
      : false;

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const usersAreFriends: boolean =
    currentOtherUser &&
    currentOtherUser._id &&
    friends?.includes(currentOtherUser._id.toString())
      ? true
      : false;

  const currentUserHasSentFriendRequest: boolean =
    currentOtherUser &&
    currentOtherUser._id &&
    friendRequestsSent?.map((elem) => elem._id).includes(currentOtherUser._id.toString())
      ? true
      : false;

  const currentUserHasReceivedFriendRequest: boolean =
    currentOtherUser &&
    currentOtherUser._id &&
    friendRequestsReceived
      ?.map((elem) => elem._id)
      .includes(currentOtherUser._id.toString())
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
          currentUser && currentOtherUser
            ? () => handleRemoveFriendRequest(currentOtherUser, currentUser)
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
        currentUser && currentOtherUser
          ? () => handleSendFriendRequest(currentOtherUser)
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
    handler: currentOtherUser
      ? () => getStartOrOpenChatWithUserHandler(currentOtherUser)
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
      currentUser && currentOtherUser
        ? () => {
            if (currentOtherUser) {
              return handleUnfriending(currentUser, currentOtherUser);
            }
          }
        : undefined,
    paramsIncludeEvent: false,
  };

  const handleBlockUser = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>): void => {
    // Delete chat w/ currentOtherUser, if it exists:
    // Must be done here, since addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists, defined in userContext, doesn't have access to chat info
    let chatToDelete: TChat | undefined = userChats
      ? userChats.filter(
          (chat) =>
            currentUser &&
            currentUser._id &&
            currentOtherUser &&
            currentOtherUser._id &&
            chat.members.length === 2 &&
            chat.members.map((m) => m._id).includes(currentUser._id.toString()) &&
            chat.members.map((m) => m._id).includes(currentOtherUser._id.toString())
        )[0]
      : undefined;

    if (chatToDelete) {
      handleDeleteChat(chatToDelete._id.toString());
    }

    // Remove from invitee lists, currentOtherUser from co-organizer lists (if currentUser is event creator), currentUser from co-organizer lists (if currentOtherUser is event creator)
    // Must be done here, as addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists, defined in userContext, doesn't have access to events info
    const allEvents = fetchAllEventsQuery.data;
    if (
      allEvents &&
      currentUser &&
      currentUser._id &&
      currentOtherUser &&
      currentOtherUser._id
    ) {
      for (const event of allEvents) {
        // If currentUser is event creator & currentOtherUser is an invitee, remove currentOtherUser as invitee:
        if (event.creator === currentUser._id) {
          if (
            event.invitees.map((i) => i._id).includes(currentOtherUser._id.toString())
          ) {
            handleRemoveInvitee(event, currentOtherUser, e);
          }

          // Remove blockee's RSVP:
          if (
            event.interestedUsers
              .map((i) => i._id)
              .includes(currentOtherUser._id.toString())
          ) {
            handleDeleteUserRSVP(event, currentOtherUser, e);
          }

          // Remove blockee as organizer:
          if (
            event.organizers.map((o) => o._id).includes(currentOtherUser._id.toString())
          ) {
            handleRemoveOrganizer(e, event, currentOtherUser);
          }
        }
      }
    }

    // Add to blockedUsers (representative value in state), remove from friend requests, friends lists:
    if (currentUser && currentOtherUser) {
      addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists(
        currentUser,
        currentOtherUser,
        blockedUsers,
        setBlockedUsers
      );
    }
  };

  const getBlockButton = () => {
    if (currentOtherUserIsBlocked && currentUser && currentOtherUser) {
      return {
        type: "unblock",
        buttonText: (
          <>
            <i className="fas fa-lock-open"></i> Unblock
          </>
        ),
        handler: () => {
          if (currentOtherUser) {
            return handleUnblockUser(
              currentUser,
              currentOtherUser,
              blockedUsers,
              setBlockedUsers
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

  const now = Date.now();

  type TDisplayedEvent = {
    header: string;
    array: TEvent[] | undefined;
    type: string;
  };

  const userEventsExist: boolean = usersEvents
    ? usersEvents
        .map((event) => event.array)
        .some((eventArray) => eventArray && eventArray.length > 0)
    : false;

  const getNumberOfGroupChatsInCommon = (): number => {
    const currentUserChats = fetchChatsQuery.data;

    let chatsInCommon = [];
    if (currentUserChats && currentOtherUser && currentOtherUser._id) {
      for (const chat of currentUserChats) {
        if (
          chat.members.length > 2 &&
          chat.members.map((m) => m._id).includes(currentOtherUser._id.toString())
        ) {
          chatsInCommon.push(chat);
        }
      }
    }
    return chatsInCommon.length;
  };
  const numberOfGroupChatsInCommon = getNumberOfGroupChatsInCommon();

  const isNoFetchError: boolean = !fetchAllEventsQuery.isError;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllEventsQuery.isError) {
      return fetchAllEventsQuery;
    }
  };
  const queryWithError = getQueryForQueryLoadingOrErrorComponent();

  const aQueryIsLoading: boolean = fetchAllEventsQuery.isLoading;

  return (
    <>
      {aQueryIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {queryWithError && (
        <div className="query-error-container">
          <header className="query-status-text">Error fetching data. </header>
          <div className="theme-element-container">
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
      {currentOtherUser && isNoFetchError && (
        <>
          {showFriendRequestResponseOptions && (
            <TwoOptionsInterface
              header={`Respond to friend request from ${currentOtherUser.firstName} ${currentOtherUser.lastName} (${currentOtherUser.username})`}
              buttonOneText="Decline"
              buttonOneHandler={handleRejectFriendRequest}
              buttonOneHandlerParams={[currentOtherUser, currentUser]}
              handlerOneNeedsEventParam={true}
              buttonTwoText="Accept"
              buttonTwoHandler={handleAcceptFriendRequest}
              buttonTwoHandlerParams={[currentOtherUser, currentUser]}
              handlerTwoNeedsEventParam={true}
              closeHandler={setShowFriendRequestResponseOptions}
            />
          )}
          {isNoFetchError && currentOtherUser && (
            <>
              <div
                className={styles.kopfzeile}
                style={{ borderBottom: `3px solid ${randomColor}` }}
              >
                <div style={{ boxShadow: "unset" }} className="theme-element-container">
                  <img
                    className={styles.profileImage}
                    src={
                      currentOtherUser.profileImage !== "" &&
                      typeof currentOtherUser.profileImage === "string"
                        ? currentOtherUser.profileImage
                        : defaultProfileImage
                    }
                  />
                </div>
                <div className={styles.mainInfoContainer}>
                  <header style={{ color: `${randomColor}` }}>
                    {currentOtherUser.firstName} {currentOtherUser.lastName}
                  </header>
                  <p style={{ color: randomColor }}>{currentOtherUser.username}</p>
                  {currentUserCanSeeLocation &&
                    currentOtherUser &&
                    currentOtherUser.city !== "" &&
                    currentOtherUser.stateProvince !== "" &&
                    currentOtherUser.country !== "" && (
                      <div className={styles.userLocationContainer}>
                        <p
                          style={{ color: randomColor }}
                        >{`${currentOtherUser.city}, ${currentOtherUser.stateProvince}`}</p>
                        <img
                          src={`/flags/4x3/${matchingCountryObject?.abbreviation}.svg`}
                        />
                      </div>
                    )}
                  {palzInCommonText && palzInCommon && (
                    <p
                      style={{ color: randomColor }}
                      className={
                        palzInCommon.length > 2
                          ? `${styles.mutualFriendsLink}`
                          : undefined
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
                          title={`${currentOtherUser.username}'s Facebook Profile`}
                          href={`${currentOtherUser.facebook}`}
                          target="_blank"
                        >
                          <span className="fab fa-facebook"></span>
                        </a>
                      )}
                      {showInstagram && currentOtherUser.instagram !== "" && (
                        <a
                          title={`${currentOtherUser.username}'s Instagram Profile`}
                          href={`${currentOtherUser.instagram}`}
                          target="_blank"
                        >
                          <span className="fab fa-instagram"></span>
                        </a>
                      )}
                      {showX && currentOtherUser.x !== "" && (
                        <a
                          title={`${currentOtherUser.username}'s X Profile`}
                          href={`${currentOtherUser.x}`}
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
                {currentOtherUser.about !== "" && (
                  <div className={styles.about}>
                    <header>About me :</header>
                    <p>{currentOtherUser.about}</p>
                  </div>
                )}
                {currentOtherUser.interests.length > 0 ? (
                  <div className={styles.infoPoint}>
                    <header>I'm interested in : </header>
                    <span>
                      {currentOtherUser.interests.map((int) => (
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
                        aria-hidden="false"
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
                    users={palzInCommon
                      .map((p) => p._id.toString())
                      .filter((elem) => elem !== undefined)}
                    randomColor={randomColor}
                  />
                )}
                {showFriends && currentOtherUser.friends && (
                  <UserListModal
                    listType="other-user-friends"
                    renderButtonOne={true}
                    renderButtonTwo={false}
                    closeModalMethod={setShowFriends}
                    header={`${currentOtherUser.username} 's palz`}
                    users={currentOtherUser.friends}
                    buttonOneText="View Profile"
                    randomColor={randomColor}
                  />
                )}
                {!aQueryIsLoading &&
                  isNoFetchError &&
                  userEventsExist &&
                  usersEvents &&
                  usersEvents.map(
                    (event) =>
                      event &&
                      event.array &&
                      event.array.length > 0 && (
                        <UserEventsSection
                          key={event.header}
                          eventsArray={event.array}
                          header={event.header}
                        />
                      )
                  )}
              </section>
            </>
          )}
        </>
      )}
    </>
  );
};
export default OtherUserProfile;
