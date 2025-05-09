import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import styles from "./styles.module.css";
import { TThemeColor, TUser, TEvent, TChat } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { countries } from "../../../constants";
import Methods from "../../../methods";
import Requests from "../../../requests";
import Tab from "../../Elements/Tab/Tab";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";
import { useChatContext } from "../../../Hooks/useChatContext";

const OtherUserProfile = () => {
  const navigation = useNavigate();
  const { theme, isLoading } = useMainContext();
  const {
    currentUser,
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
    fetchAllVisibleOtherUsersQuery,
  } = useUserContext();
  const visibleOtherUsers = fetchAllVisibleOtherUsersQuery.data;
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

  const currentOtherUserID: string | undefined = visibleOtherUsers?.filter(
    (visibleOtherUser) => visibleOtherUser.username === username
  )[0]._id;

  let currentOtherUser: TUser | undefined;
  if (currentOtherUserID) {
    Requests.getUserByID(currentOtherUserID).then((res) =>
      res.json().then((user) => (currentOtherUser = user))
    );
  }

  const [showFriends, setShowFriends] = useState<boolean>(false);
  const [showMutualFriends, setShowMutualFriends] = useState<boolean>(false);

  const currentOtherUserIsBlocked: boolean =
    blockedUsers && currentOtherUser && currentOtherUser._id
      ? blockedUsers.includes(currentOtherUser._id)
      : false;

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    if (currentOtherUserIsBlocked) {
      toast("You have blocked this user", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
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
  }, []);

  // if currentUser is falsy, redirect to login page
  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      navigation("/");
    }

    if (showFriends) {
      setShowFriends(false);
    }

    if (showMutualFriends) {
      setShowMutualFriends(false);
    }

    // If logged-in user is blocked by currentOtherUser:
    if (currentUser?._id && currentOtherUser?.blockedUsers.includes(currentUser._id)) {
      toast("You do not have access to this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      navigation(`/${currentUser?.username}`);
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const usersAreFriends: boolean =
    currentOtherUser?._id && friends?.includes(currentOtherUser._id) ? true : false;

  // First, get currentOtherUser as TUser
  // Second, go thru all currentOtherUser friends & map their TUser object into currentOtherUserFriends
  const getCurrentOtherUserFriends = (): TUser[] => {
    let currentOtherUserFriends: TUser[] = [];
    if (currentOtherUser && currentOtherUser._id) {
      Requests.getUserByID(currentOtherUser._id).then((res) =>
        res.json().then((currentOtherUser: TUser) => {
          for (const friendID of currentOtherUser.friends) {
            Requests.getUserByID(friendID).then((res) =>
              res
                .json()
                .then((currentOtherUserFriend) =>
                  currentOtherUserFriends.push(currentOtherUserFriend)
                )
            );
          }
        })
      );
    }
    return currentOtherUserFriends;
  };
  let currentOtherUserFriends: TUser[] = getCurrentOtherUserFriends();

  const currentUserIsFriendOfFriend: boolean =
    currentUser && currentOtherUser && currentOtherUserFriends
      ? currentOtherUserFriends.some(
          (user) => currentUser._id && user.friends.includes(currentUser._id)
        )
      : false;

  const currentUserMayMessage: boolean =
    currentUser && currentUser._id && currentOtherUser?._id
      ? currentOtherUser.whoCanMessage === "anyone" ||
        (currentUser._id &&
          currentOtherUser.whoCanMessage === "friends" &&
          currentOtherUser.friends.includes(currentUser._id) &&
          currentUser?.friends.includes(currentOtherUser._id)) ||
        (currentUserIsFriendOfFriend &&
          currentOtherUser.whoCanMessage === "friends of friends")
      : false;

  const currentUserHasSentFriendRequest: boolean =
    currentOtherUser?._id && friendRequestsSent?.includes(currentOtherUser._id)
      ? true
      : false;

  const currentUserHasReceivedFriendRequest: boolean =
    currentOtherUser?._id &&
    currentOtherUser &&
    friendRequestsReceived?.includes(currentOtherUser._id)
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
            chat.members.includes(currentUser._id) &&
            chat.members.includes(currentOtherUser._id)
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
          if (event.invitees.includes(currentOtherUser._id)) {
            handleRemoveInvitee(event, currentOtherUser, e);
          }

          // Remove blockee's RSVP:
          if (event.interestedUsers.includes(currentOtherUser._id)) {
            handleDeleteUserRSVP(event, currentOtherUser, e);
          }

          // Remove blockee as organizer:
          if (event.organizers.includes(currentOtherUser._id)) {
            handleRemoveOrganizer(e, event, currentOtherUser);
          }
        }

        // If event creator is currentOtherUser & currentUser is invitee or co-organizer, remove currentUser from those lists:
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

  const matchingCountryObject:
    | {
        country: string;
        abbreviation: string;
        phoneCode: string;
      }
    | undefined = countries.filter(
    (country) => country.country === currentOtherUser?.country
  )[0];

  const userCountryAbbreviation: string | undefined =
    currentOtherUser?.country !== "" && matchingCountryObject
      ? matchingCountryObject.abbreviation
      : undefined;

  const getCurrentUserFriends = (): TUser[] => {
    let currentUserFriends: TUser[] = [];
    if (currentUser) {
      for (const friendID of currentUser.friends) {
        Requests.getUserByID(friendID).then((res) =>
          res
            .json()
            .then((currentUserFriend: TUser) =>
              currentUserFriends.push(currentUserFriend)
            )
        );
      }
    }
    return currentUserFriends;
  };
  const currentUserFriends: TUser[] = getCurrentUserFriends();

  // get TUser object that matches each id in friends array of each of currentUser's friends
  let friendsOfCurrentUserFriends: TUser[] = [];
  for (const friend of currentUserFriends) {
    if (friend && friend.friends.length > 0) {
      for (const friendID of friend.friends) {
        Requests.getUserByID(friendID).then((res) =>
          res.json().then((friend: TUser) => friendsOfCurrentUserFriends.push(friend))
        );
      }
    }
  }
  const usersAreFriendsOfFriends = currentOtherUser
    ? friendsOfCurrentUserFriends.includes(currentOtherUser)
    : false;

  const combinedPalz: TUser[] = currentUserFriends.concat(currentOtherUserFriends);

  const palzInCommon = Methods.removeDuplicatesFromArray(
    combinedPalz.filter(
      (pal) => combinedPalz.indexOf(pal) !== combinedPalz.lastIndexOf(pal)
    )
  );

  const getCurrentUserCanSeeFriendsList = (): boolean => {
    if (currentUser && currentUser._id) {
      const currentUserIsFriend: boolean =
        currentOtherUser && currentOtherUser && currentOtherUser._id
          ? currentOtherUser.friends.includes(currentUser._id) &&
            currentUser.friends.includes(currentOtherUser._id)
          : false;

      if (
        currentOtherUser?.whoCanSeeFriendsList === "anyone" ||
        currentUserIsFriend ||
        currentUserIsFriendOfFriend
      ) {
        return true;
      }
    }
    return false;
  };
  const currentUserCanSeeFriendsList: boolean = getCurrentUserCanSeeFriendsList();

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError && !fetchAllVisibleOtherUsersQuery.isError;

  const fetchIsLoading: boolean =
    fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllVisibleOtherUsersQuery.isError) {
      return fetchAllVisibleOtherUsersQuery;
    }
    return fetchAllEventsQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  const now = Date.now();

  const pastEventsUserOrganized: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      currentOtherUser?._id &&
      event.creator !== currentUser?._id &&
      event.organizers.includes(currentOtherUser._id) &&
      event.eventEndDateTimeInMS < now
  );

  const pastEventsUserRSVPd: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      currentOtherUser?._id &&
      event.interestedUsers.includes(currentOtherUser._id) &&
      event.eventEndDateTimeInMS < now
  );

  const upcomingEventsUserOrganizes: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUser?._id &&
      event.organizers.includes(currentOtherUser._id)
  );

  const upcomingEventsUserInvitedTo: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUser?._id &&
      event.invitees.includes(currentOtherUser._id)
  );

  const upcomingEventsUserRSVPdTo: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUser?._id &&
      event.interestedUsers.includes(currentOtherUser._id)
  );

  const ongoingEvents: TEvent[] | undefined = allEvents?.filter((event) => {
    event.eventStartDateTimeInMS < now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUser?._id &&
      (event.organizers.includes(currentOtherUser._id) ||
        event.interestedUsers.includes(currentOtherUser._id));
  });

  type TDisplayedEvent = {
    header: string;
    array: TEvent[] | undefined;
    type: string;
  };

  const usersEvents: TDisplayedEvent[] = [
    { header: "My Ongoing Events", array: ongoingEvents, type: "organized-event" },
    {
      header: "My Upcoming Events",
      array: upcomingEventsUserOrganizes,
      type: "organized-event",
    },
    {
      header: "Upcoming Events I've RSVP'd To",
      array: upcomingEventsUserRSVPdTo,
      type: "interested-event",
    },
    {
      header: "Upcoming Events I've Been Invited To",
      array: upcomingEventsUserInvitedTo,
      type: "invited-event",
    },
    {
      header: "Past Events I RSVP'd To",
      array: pastEventsUserRSVPd,
      type: "interested-event",
    },
    {
      header: "Past Events I Organized",
      array: pastEventsUserOrganized,
      type: "organized-event",
    },
  ];

  const userEventsExist = usersEvents
    .map((event) => event.array)
    .some((eventArray) => eventArray && eventArray.length > 0);

  const getCurrentUserMaySeeEvent = (event: TDisplayedEvent): boolean => {
    const currentUserIsFriendOfFriend: boolean =
      currentUser && currentOtherUser && currentOtherUserFriends
        ? currentOtherUserFriends.some(
            (user) => currentUser._id && user.friends.includes(currentUser._id)
          )
        : false;

    if (currentUser && currentUser._id && currentOtherUser) {
      if (event.type === "interested-event") {
        if (
          currentOtherUser.whoCanSeeEventsInterestedIn === "anyone" ||
          (currentOtherUser.whoCanSeeEventsInterestedIn === "friends" &&
            currentOtherUser.friends.includes(currentUser._id)) ||
          (currentOtherUser.whoCanSeeEventsInterestedIn === "friends of friends" &&
            currentUserIsFriendOfFriend)
        ) {
          return true;
        }
      }

      if (event.type === "organized-event") {
        if (
          currentOtherUser.whoCanSeeEventsOrganized === "anyone" ||
          (currentOtherUser.whoCanSeeEventsOrganized === "friends" &&
            currentOtherUser.friends.includes(currentUser._id)) ||
          (currentOtherUser.whoCanSeeEventsOrganized === "friends of friends" &&
            currentUserIsFriendOfFriend)
        ) {
          return true;
        }
      }

      if (event.type === "invited-event") {
        if (
          currentOtherUser.whoCanSeeEventsInvitedTo === "anyone" ||
          (currentOtherUser.whoCanSeeEventsInvitedTo === "friends" &&
            currentOtherUser.friends.includes(currentUser._id)) ||
          (currentOtherUser.whoCanSeeEventsInvitedTo === "friends of friends" &&
            currentUserIsFriendOfFriend)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const getSocialMediumIsVisible = (medium: "facebook" | "instagram" | "x"): boolean => {
    if (currentUser && currentUser._id) {
      if (
        (medium === "facebook" && currentOtherUser?.whoCanSeeFacebook === "anyone") ||
        (currentOtherUser?.whoCanSeeFacebook === "friends" &&
          currentOtherUser.friends.includes(currentUser._id)) ||
        (currentOtherUser?.whoCanSeeFacebook === "friends of friends" &&
          currentUserIsFriendOfFriend)
      ) {
        return true;
      }
      if (
        (medium === "instagram" && currentOtherUser?.whoCanSeeInstagram === "anyone") ||
        (currentOtherUser?.whoCanSeeInstagram === "friends" &&
          currentOtherUser.friends.includes(currentUser._id)) ||
        (currentOtherUser?.whoCanSeeInstagram === "friends of friends" &&
          currentUserIsFriendOfFriend)
      ) {
        return true;
      }
      if (
        (medium === "x" && currentOtherUser?.whoCanSeeX === "anyone") ||
        (currentOtherUser?.whoCanSeeX === "friends" &&
          currentOtherUser.friends.includes(currentUser._id)) ||
        (currentOtherUser?.whoCanSeeX === "friends of friends" &&
          currentUserIsFriendOfFriend)
      ) {
        return true;
      }
    }
    return false;
  };

  const getNumberOfGroupChatsInCommon = (): number => {
    const currentUserChats = fetchChatsQuery.data;

    let chatsInCommon = [];
    if (currentUserChats && currentOtherUser && currentOtherUser._id) {
      for (const chat of currentUserChats) {
        if (chat.members.length > 2 && chat.members.includes(currentOtherUser._id)) {
          chatsInCommon.push(chat);
        }
      }
    }
    return chatsInCommon.length;
  };
  const numberOfGroupChatsInCommon = getNumberOfGroupChatsInCommon();

  const getPalzInCommonText = (): string => {
    if (palzInCommon.length > 2) {
      return `You are both friends with ${palzInCommon
        .slice(0, 3)
        .map((pal) => `${pal.firstName} ${pal.lastName}`)
        .join(", ")} +${palzInCommon.length - 2} more`;
    } else if (palzInCommon.length > 0) {
      return `You are both friends with ${palzInCommon
        .map((pal) => `${pal.firstName} ${pal.lastName}`)
        .join(" & ")}`;
    }
    return "No mutual friends";
  };
  const palzInCommonText = getPalzInCommonText();

  const showFacebook: boolean =
    currentOtherUser && getSocialMediumIsVisible("facebook")
      ? currentOtherUser.facebook !== ""
      : false;

  const showInstagram: boolean =
    currentOtherUser && getSocialMediumIsVisible("instagram")
      ? currentOtherUser.instagram !== ""
      : false;

  const showX: boolean =
    currentOtherUser && getSocialMediumIsVisible("x") ? currentOtherUser.x !== "" : false;

  return (
    <>
      {" "}
      <QueryLoadingOrError
        query={queryForQueryLoadingOrError}
        errorMessage="Error fetching data"
      />
      {!fetchIsLoading &&
        isNoFetchError &&
        showFriendRequestResponseOptions &&
        currentOtherUser && (
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
      {!fetchIsLoading && isNoFetchError && currentOtherUser && (
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
              {currentUser?._id &&
                currentOtherUser.whoCanSeeLocation !== "nobody" &&
                (currentOtherUser.whoCanSeeLocation === "anyone" ||
                  (currentOtherUser.whoCanSeeLocation === "friends of friends" &&
                    usersAreFriendsOfFriends) ||
                  (currentOtherUser.whoCanSeeLocation === "friends" &&
                    currentOtherUser.friends.includes(currentUser._id))) &&
                currentOtherUser.city !== "" &&
                currentOtherUser.stateProvince !== "" &&
                currentOtherUser.country !== "" && (
                  <div className={styles.userLocationContainer}>
                    <p
                      style={{ color: randomColor }}
                    >{`${currentOtherUser.city}, ${currentOtherUser.stateProvince}`}</p>
                    <img src={`/flags/4x3/${userCountryAbbreviation}.svg`} />
                  </div>
                )}
              <p
                style={{ color: randomColor }}
                className={
                  palzInCommon.length > 2 ? `${styles.mutualFriendsLink}` : undefined
                }
                onClick={
                  palzInCommon.length > 2 ? () => setShowMutualFriends(true) : undefined
                }
              >
                {palzInCommonText}
                {palzInCommon.length > 2 && (
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
                  {getSocialMediumIsVisible("facebook") &&
                    currentOtherUser.facebook !== "" && (
                      <a
                        title={`${currentOtherUser.username}'s Facebook Profile`}
                        href={`${currentOtherUser.facebook}`}
                        target="_blank"
                      >
                        <span className="fab fa-facebook"></span>
                      </a>
                    )}
                  {getSocialMediumIsVisible("instagram") &&
                    currentOtherUser.instagram !== "" && (
                      <a
                        title={`${currentOtherUser.username}'s Instagram Profile`}
                        href={`${currentOtherUser.instagram}`}
                        target="_blank"
                      >
                        <span className="fab fa-instagram"></span>
                      </a>
                    )}
                  {getSocialMediumIsVisible("x") && currentOtherUser.x !== "" && (
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
            {currentOtherUser.friends.length > 0 && currentUserCanSeeFriendsList && (
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
            {showMutualFriends && (
              <UserListModal
                listType="mutual-friends"
                renderButtonOne={true}
                buttonOneText="View Profile"
                renderButtonTwo={false}
                closeModalMethod={setShowMutualFriends}
                header="Mutual Friends"
                userIDArray={palzInCommon.map((pal) => pal._id)}
                randomColor={randomColor}
              />
            )}
            {showFriends && (
              <UserListModal
                listType="other-user-friends"
                renderButtonOne={true}
                renderButtonTwo={false}
                closeModalMethod={setShowFriends}
                header={`${currentOtherUser.username} 's palz`}
                userIDArray={currentOtherUser.friends}
                buttonOneText="View Profile"
                randomColor={randomColor}
              />
            )}
            {!fetchIsLoading &&
              isNoFetchError &&
              userEventsExist &&
              usersEvents.map(
                (event) =>
                  event &&
                  getCurrentUserMaySeeEvent(event) &&
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
  );
};
export default OtherUserProfile;
