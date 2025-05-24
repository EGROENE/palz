import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import styles from "./styles.module.css";
import { TThemeColor, TUser, TEvent, TChat, TOtherUser } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { countries } from "../../../constants";
import Methods from "../../../methods";
import Requests from "../../../requests";
import Tab from "../../Elements/Tab/Tab";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";
import UserEventsSection from "../../Elements/UserEventsSection/UserEventsSection";
import { useChatContext } from "../../../Hooks/useChatContext";
import useLocalStorage from "use-local-storage";

const OtherUserProfile = () => {
  const navigation = useNavigate();
  const { theme, isLoading, error, setError } = useMainContext();
  const {
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

  if (error) {
    throw new Error(error);
  }

  const currentOtherUserID: string | undefined = visibleOtherUsers?.filter(
    (visibleOtherUser) => visibleOtherUser.username === username
  )[0]._id;

  const [currentOtherUserSECURE, setCurrentOtherUserSECURE] = useLocalStorage<
    TOtherUser | undefined
  >(
    "currentOtherUserSECURE",
    visibleOtherUsers?.filter((otherUser) => otherUser.username === username)[0]
  );

  const getCurrentOtherUser = (
    currentOtherUserID: string
  ): Promise<TUser | undefined> | undefined => {
    if (currentOtherUserID) {
      return Requests.getUserByID(currentOtherUserID)
        .then((res) => {
          if (res.ok) {
            return res.json().then((otherUser: TUser) => {
              //currentOtherUser.push(otherUser);
              return otherUser;
            });
          } else {
            setError("Error fetching currentOtherUser (TUser)");
            return undefined;
          }
        })
        .catch((error) => {
          console.log(error);
          return undefined;
        });
    }
    return undefined;
  };

  const [showFriends, setShowFriends] = useState<boolean>(false);
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
  const [userCountryAbbreviation, setUserCountryAbbreviation] = useState<string>("");
  const [palzInCommon, setPalzInCommon] = useState<TOtherUser[]>([]);
  const [currentOtherUserFriendsSECURE, setCurrentOtherUserFriendsSECURE] = useState<
    TOtherUser[]
  >([]);
  const [palzInCommonText, setPalzInCommonText] = useState<string | undefined>(undefined);

  // put in other useEffect w/ empty dep array if no dependencies added to this one, or if only dependency is username
  useEffect(() => {
    setCurrentOtherUserSECURE(
      visibleOtherUsers?.filter((otherUser) => otherUser.username === username)[0]
    );

    if (currentOtherUserID) {
      const currentUserPromise: Promise<TUser | undefined> | undefined =
        getCurrentOtherUser(currentOtherUserID);
      currentUserPromise &&
        currentUserPromise.then((currentOtherUser) => {
          if (currentOtherUser) {
            // Determine if currentUser may send user a message:
            if (
              currentUser &&
              !aQueryIsLoading &&
              currentUser._id &&
              currentOtherUser._id &&
              (currentOtherUser.whoCanMessage === "anyone" ||
                (currentOtherUser.whoCanMessage === "friends" &&
                  currentOtherUser.friends.includes(currentUser._id) &&
                  currentUser?.friends.includes(currentOtherUser._id)) ||
                (currentOtherUser.whoCanMessage === "friends of friends" &&
                  currentUserIsFriendOfFriend))
            ) {
              setCurrentUserMayMessage(true);
            } else {
              setCurrentUserMayMessage(false);
            }

            // Set currentUserCanSeeLocation:
            if (
              !aQueryIsLoading &&
              currentUser?._id &&
              currentOtherUser.whoCanSeeLocation !== "nobody" &&
              (currentOtherUser.whoCanSeeLocation === "anyone" ||
                (currentOtherUser.whoCanSeeLocation === "friends of friends" &&
                  currentUserIsFriendOfFriend) ||
                (currentOtherUser.whoCanSeeLocation === "friends" &&
                  currentOtherUser.friends.includes(currentUser._id))) &&
              currentOtherUserSECURE &&
              currentOtherUserSECURE.city !== "" &&
              currentOtherUserSECURE &&
              currentOtherUserSECURE.stateProvince !== "" &&
              currentOtherUserSECURE &&
              currentOtherUserSECURE.country !== ""
            ) {
              setCurrentUserCanSeeLocation(true);
            }

            // Determine if currentUser may see friends list:
            const currentUserIsFriend: boolean =
              currentUser && currentUser._id && !aQueryIsLoading
                ? currentOtherUser.friends.includes(currentUser._id)
                : false;

            if (
              ((!aQueryIsLoading &&
                currentUserIsFriend &&
                currentOtherUser.whoCanSeeFriendsList === "friends") ||
                (!aQueryIsLoading &&
                  currentOtherUser.whoCanSeeFriendsList === "anyone") ||
                (!aQueryIsLoading &&
                  currentOtherUser.whoCanSeeFriendsList === "friends of friends" &&
                  currentUserIsFriendOfFriend)) &&
              currentOtherUser.friends.length > 0
            ) {
              setCurrentUserCanSeeFriendsList(true);
            }

            // Set palzInCommon:
            const currentUserFriends: TOtherUser[] = visibleOtherUsers
              ? visibleOtherUsers.filter((otherUser) => {
                  if (currentUser && otherUser._id) {
                    if (currentUser.friends.includes(otherUser._id)) {
                      return otherUser;
                    }
                  }
                })
              : [];

            const currentOtherUserFriends: TOtherUser[] = visibleOtherUsers
              ? visibleOtherUsers.filter((otherUser) => {
                  if (otherUser._id) {
                    if (currentOtherUser.friends.includes(otherUser._id)) {
                      return otherUser;
                    }
                  }
                })
              : [];

            const combinedPalz: TOtherUser[] = currentUserFriends.concat(
              currentOtherUserFriends
            );

            const pic: TOtherUser[] = Methods.removeDuplicatesFromArray(
              combinedPalz.filter(
                (pal) =>
                  currentUserFriends.includes(pal) &&
                  currentOtherUserFriends.includes(pal)
              )
            );

            setPalzInCommon(pic);

            if (pic.length > 2) {
              setPalzInCommonText(
                `You are both friends with ${pic
                  .slice(0, 3)
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

            // Set currentOtherUser's country object:
            if (!aQueryIsLoading) {
              setMatchingCountryObject(
                countries.filter(
                  (country) => country.country === currentOtherUser.country
                )[0]
              );
            }

            // Set country abbreviation:
            if (
              !aQueryIsLoading &&
              currentOtherUser.country !== "" &&
              matchingCountryObject
            ) {
              setUserCountryAbbreviation(matchingCountryObject.abbreviation);
            }

            // Set currentUserIsFriendOfFriend:
            const getCurrentOtherUserFriends = async (): Promise<TUser[]> => {
              let currentOtherUserFriends: TUser[] = [];
              if (currentOtherUserID) {
                for (const friendID of currentOtherUser.friends) {
                  await Requests.getUserByID(friendID)
                    .then((res) => {
                      if (res.ok) {
                        res
                          .json()
                          .then((currentOtherUserFriend) =>
                            currentOtherUserFriends.push(currentOtherUserFriend)
                          );
                      } else {
                        setError("Error fetching currentOtherUserFriends (TUser[])");
                      }
                    })
                    .catch((error) => console.log(error));
                }
              }
              // Set currentOtherUserFriendsSECURE:
              if (visibleOtherUsers) {
                setCurrentOtherUserFriendsSECURE(
                  visibleOtherUsers.filter((visibleOtherUser) => {
                    if (visibleOtherUser._id) {
                      return currentOtherUser.friends.includes(visibleOtherUser._id);
                    }
                  })
                );
              }
              return currentOtherUserFriends;
            };

            getCurrentOtherUserFriends().then((currentOtherUserFriends: TUser[]) => {
              if (currentUser && currentUser._id) {
                for (const friend of currentOtherUserFriends) {
                  if (friend.friends.includes(currentUser._id)) {
                    setCurrentUserIsFriendOfFriend(true);
                  }
                }
              }
            });

            // Set showFacebook:
            if (getSocialMediumIsVisible("facebook")) {
            }
            setShowFacebook(
              getSocialMediumIsVisible("facebook") && currentOtherUserSECURE
                ? currentOtherUserSECURE.facebook !== ""
                : false
            );

            // Set showInstagram:
            setShowInstagram(
              getSocialMediumIsVisible("instagram") && currentOtherUserSECURE
                ? currentOtherUserSECURE.instagram !== ""
                : false
            );

            // Set showX:
            setShowX(
              getSocialMediumIsVisible("x") && currentOtherUserSECURE
                ? currentOtherUserSECURE.x !== ""
                : false
            );
          }
        });
    }
  }, [
    username,
    fetchAllVisibleOtherUsersQuery.data,
    fetchAllEventsQuery.data,
    currentOtherUserID,
    currentOtherUser,
  ]);

  const currentOtherUserIsBlocked: boolean =
    blockedUsers && currentOtherUserID
      ? blockedUsers.includes(currentOtherUserID)
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
    if (currentOtherUserID) {
      const currentUserPromise: Promise<TUser | undefined> | undefined =
        getCurrentOtherUser(currentOtherUserID);
      currentUserPromise &&
        currentUserPromise.then((currentOtherUser) => {
          if (
            !aQueryIsLoading &&
            currentOtherUser &&
            currentUser &&
            currentUser._id &&
            currentOtherUser.blockedUsers.includes(currentUser._id)
          ) {
            toast("You do not have access to this page", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
            navigation(`/${currentUser?.username}`);
          }
        });
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const usersAreFriends: boolean =
    currentOtherUserID && friends?.includes(currentOtherUserID) ? true : false;

  const currentUserHasSentFriendRequest: boolean =
    currentOtherUserID && friendRequestsSent?.includes(currentOtherUserID) ? true : false;

  const currentUserHasReceivedFriendRequest: boolean =
    currentOtherUserID && friendRequestsReceived?.includes(currentOtherUserID)
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
          currentUser && currentOtherUserSECURE
            ? () => handleRemoveFriendRequest(currentOtherUserSECURE, currentUser)
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
        currentUser && currentOtherUserSECURE
          ? () => handleSendFriendRequest(currentOtherUserSECURE)
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
    handler: currentOtherUserSECURE
      ? () => getStartOrOpenChatWithUserHandler(currentOtherUserSECURE)
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
      currentUser && currentOtherUserSECURE
        ? () => {
            if (currentOtherUserSECURE) {
              return handleUnfriending(currentUser, currentOtherUserSECURE);
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
            currentOtherUserID &&
            chat.members.length === 2 &&
            chat.members.includes(currentUser._id) &&
            chat.members.includes(currentOtherUserID)
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
      currentOtherUserID &&
      currentOtherUserSECURE
    ) {
      for (const event of allEvents) {
        // If currentUser is event creator & currentOtherUser is an invitee, remove currentOtherUser as invitee:
        if (event.creator === currentUser._id) {
          if (event.invitees.includes(currentOtherUserID)) {
            handleRemoveInvitee(event, currentOtherUserSECURE, e);
          }

          // Remove blockee's RSVP:
          if (event.interestedUsers.includes(currentOtherUserID)) {
            handleDeleteUserRSVP(event, currentOtherUserSECURE, e);
          }

          // Remove blockee as organizer:
          if (event.organizers.includes(currentOtherUserID)) {
            handleRemoveOrganizer(e, event, currentOtherUserSECURE);
          }
        }

        // If event creator is currentOtherUser & currentUser is invitee or co-organizer, remove currentUser from those lists:
      }
    }

    // Add to blockedUsers (representative value in state), remove from friend requests, friends lists:
    if (currentUser && currentOtherUserSECURE) {
      addToBlockedUsersAndRemoveBothFromFriendRequestsAndFriendsLists(
        currentUser,
        currentOtherUserSECURE,
        blockedUsers,
        setBlockedUsers
      );
    }
  };

  const getBlockButton = () => {
    if (currentOtherUserIsBlocked && currentUser && currentOtherUserSECURE) {
      return {
        type: "unblock",
        buttonText: (
          <>
            <i className="fas fa-lock-open"></i> Unblock
          </>
        ),
        handler: () => {
          if (currentOtherUserSECURE) {
            return handleUnblockUser(
              currentUser,
              currentOtherUserSECURE,
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

  const pastEventsUserOrganized: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      currentOtherUserID &&
      event.creator !== currentUser?._id &&
      event.organizers.includes(currentOtherUserID) &&
      event.eventEndDateTimeInMS < now
  );

  const pastEventsUserRSVPd: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      currentOtherUserID &&
      event.interestedUsers.includes(currentOtherUserID) &&
      event.eventEndDateTimeInMS < now
  );

  const upcomingEventsUserOrganizes: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUserID &&
      event.organizers.includes(currentOtherUserID)
  );

  const upcomingEventsUserInvitedTo: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUserID &&
      event.invitees.includes(currentOtherUserID)
  );

  const upcomingEventsUserRSVPdTo: TEvent[] | undefined = allEvents?.filter(
    (event) =>
      event.eventStartDateTimeInMS > now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUserID &&
      event.interestedUsers.includes(currentOtherUserID)
  );

  const ongoingEvents: TEvent[] | undefined = allEvents?.filter((event) => {
    event.eventStartDateTimeInMS < now &&
      event.eventEndDateTimeInMS > now &&
      currentOtherUserID &&
      (event.organizers.includes(currentOtherUserID) ||
        event.interestedUsers.includes(currentOtherUserID));
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
    if (currentOtherUserID) {
      Requests.getUserByID(currentOtherUserID)
        .then((res) => {
          if (res.ok) {
            res.json().then((currentOtherUser: TUser) => {
              if (currentUser && currentUser._id && currentOtherUser) {
                if (event.type === "interested-event") {
                  if (
                    currentOtherUser.whoCanSeeEventsInterestedIn === "anyone" ||
                    (currentOtherUser.whoCanSeeEventsInterestedIn === "friends" &&
                      currentOtherUser.friends.includes(currentUser._id)) ||
                    (currentOtherUser.whoCanSeeEventsInterestedIn ===
                      "friends of friends" &&
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
            });
          } else {
            return false;
          }
        })
        .catch((error) => console.log(error));
    }
    return false;
  };

  const getSocialMediumIsVisible = (medium: "facebook" | "instagram" | "x"): boolean => {
    if (currentOtherUserID) {
      Requests.getUserByID(currentOtherUserID)
        .then((res) => {
          if (res.ok) {
            res.json().then((currentOtherUser: TUser) => {
              if (currentUser && currentUser._id) {
                if (
                  (medium === "facebook" &&
                    currentOtherUser?.whoCanSeeFacebook === "anyone") ||
                  (currentOtherUser?.whoCanSeeFacebook === "friends" &&
                    currentOtherUser.friends.includes(currentUser._id)) ||
                  (currentOtherUser?.whoCanSeeFacebook === "friends of friends" &&
                    currentUserIsFriendOfFriend)
                ) {
                  return true;
                }
                if (
                  (medium === "instagram" &&
                    currentOtherUser?.whoCanSeeInstagram === "anyone") ||
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
            });
          } else {
            return false;
          }
        })
        .catch((error) => console.log(error));
    }
    return false;
  };

  const getNumberOfGroupChatsInCommon = (): number => {
    const currentUserChats = fetchChatsQuery.data;

    let chatsInCommon = [];
    if (currentUserChats && currentOtherUserID) {
      for (const chat of currentUserChats) {
        if (chat.members.length > 2 && chat.members.includes(currentOtherUserID)) {
          chatsInCommon.push(chat);
        }
      }
    }
    return chatsInCommon.length;
  };
  const numberOfGroupChatsInCommon = getNumberOfGroupChatsInCommon();

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError && !fetchAllVisibleOtherUsersQuery.isError;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllVisibleOtherUsersQuery.isError) {
      return fetchAllVisibleOtherUsersQuery;
    }
    return fetchAllEventsQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  const aQueryIsLoading: boolean =
    fetchAllEventsQuery.isLoading || fetchAllVisibleOtherUsersQuery.isLoading;

  return (
    <>
      {aQueryIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {!isNoFetchError && (
        <QueryLoadingOrError
          query={queryForQueryLoadingOrError}
          errorMessage="Error fetching data"
        />
      )}
      {currentOtherUserSECURE && isNoFetchError && !aQueryIsLoading && (
        <>
          {showFriendRequestResponseOptions && (
            <TwoOptionsInterface
              header={`Respond to friend request from ${currentOtherUserSECURE.firstName} ${currentOtherUserSECURE.lastName} (${currentOtherUserSECURE.username})`}
              buttonOneText="Decline"
              buttonOneHandler={handleRejectFriendRequest}
              buttonOneHandlerParams={[currentOtherUserSECURE, currentUser]}
              handlerOneNeedsEventParam={true}
              buttonTwoText="Accept"
              buttonTwoHandler={handleAcceptFriendRequest}
              buttonTwoHandlerParams={[currentOtherUserSECURE, currentUser]}
              handlerTwoNeedsEventParam={true}
              closeHandler={setShowFriendRequestResponseOptions}
            />
          )}
          {!aQueryIsLoading && isNoFetchError && currentOtherUserSECURE && (
            <>
              <div
                className={styles.kopfzeile}
                style={{ borderBottom: `3px solid ${randomColor}` }}
              >
                <div style={{ boxShadow: "unset" }} className="theme-element-container">
                  <img
                    className={styles.profileImage}
                    src={
                      currentOtherUserSECURE.profileImage !== "" &&
                      typeof currentOtherUserSECURE.profileImage === "string"
                        ? currentOtherUserSECURE.profileImage
                        : defaultProfileImage
                    }
                  />
                </div>
                <div className={styles.mainInfoContainer}>
                  <header style={{ color: `${randomColor}` }}>
                    {currentOtherUserSECURE.firstName} {currentOtherUserSECURE.lastName}
                  </header>
                  <p style={{ color: randomColor }}>{currentOtherUserSECURE.username}</p>
                  {currentUserCanSeeLocation &&
                    currentOtherUser &&
                    currentOtherUser.city !== "" &&
                    currentOtherUser.stateProvince !== "" &&
                    currentOtherUser.country !== "" && (
                      <div className={styles.userLocationContainer}>
                        <p
                          style={{ color: randomColor }}
                        >{`${currentOtherUserSECURE.city}, ${currentOtherUserSECURE.stateProvince}`}</p>
                        <img src={`/flags/4x3/${userCountryAbbreviation}.svg`} />
                      </div>
                    )}
                  <p
                    style={{ color: randomColor }}
                    className={
                      palzInCommon.length > 2 ? `${styles.mutualFriendsLink}` : undefined
                    }
                    onClick={
                      palzInCommon.length > 2
                        ? () => setShowMutualFriends(true)
                        : undefined
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
                      {getSocialMediumIsVisible("facebook") && (
                        <a
                          title={`${currentOtherUserSECURE.username}'s Facebook Profile`}
                          href={`${currentOtherUserSECURE.facebook}`}
                          target="_blank"
                        >
                          <span className="fab fa-facebook"></span>
                        </a>
                      )}
                      {getSocialMediumIsVisible("instagram") &&
                        currentOtherUserSECURE.instagram !== "" && (
                          <a
                            title={`${currentOtherUserSECURE.username}'s Instagram Profile`}
                            href={`${currentOtherUserSECURE.instagram}`}
                            target="_blank"
                          >
                            <span className="fab fa-instagram"></span>
                          </a>
                        )}
                      {getSocialMediumIsVisible("x") &&
                        currentOtherUserSECURE.x !== "" && (
                          <a
                            title={`${currentOtherUserSECURE.username}'s X Profile`}
                            href={`${currentOtherUserSECURE.x}`}
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
                {currentOtherUserSECURE.about !== "" && (
                  <div className={styles.about}>
                    <header>About me :</header>
                    <p>{currentOtherUserSECURE.about}</p>
                  </div>
                )}
                {currentOtherUserSECURE.interests.length > 0 ? (
                  <div className={styles.infoPoint}>
                    <header>I'm interested in : </header>
                    <span>
                      {currentOtherUserSECURE.interests.map((int) => (
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
                    header={`${currentOtherUserSECURE.username} 's palz`}
                    userIDArray={currentOtherUserFriendsSECURE.map(
                      (friend) => friend._id
                    )}
                    buttonOneText="View Profile"
                    randomColor={randomColor}
                  />
                )}
                {!aQueryIsLoading &&
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
      )}
    </>
  );
};
export default OtherUserProfile;
