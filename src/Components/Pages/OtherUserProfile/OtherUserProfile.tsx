import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import styles from "./styles.module.css";
import { TThemeColor, TUser } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { countries } from "../../../constants";
import Methods from "../../../methods";
import Tab from "../../Elements/Tab/Tab";

const OtherUserProfile = () => {
  const navigation = useNavigate();
  const { showSidebar, setShowSidebar, theme, isLoading } = useMainContext();
  const {
    allUsers,
    currentUser,
    userCreatedAccount,
    handleSendFriendRequest,
    handleRetractFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    friendRequestsSent,
    setFriendRequestsSent,
    handleBlockUser,
    handleUnblockUser,
    blockedUsers,
    setBlockedUsers,
    friendRequestsReceived,
    setFriendRequestsReceived,
    handleUnfriending,
    friends,
    setFriends,
  } = useUserContext();
  const { username } = useParams();
  const currentOtherUser =
    allUsers && allUsers.filter((user) => user.username === username)[0];

  const currentOtherUserIsBlocked =
    blockedUsers && currentOtherUser?._id && blockedUsers.includes(currentOtherUser._id);

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
  }, []);

  // if currentUser is falsy, redirect to login page
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please log in before accessing this page", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      navigation("/");
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

  const currentOtherUserFriends: TUser[] | undefined =
    currentOtherUser &&
    allUsers.filter(
      (user) => user && user._id && currentOtherUser.friends.includes(user._id)
    );

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
        handler: handleRetractFriendRequest,
        handlerParams: [
          currentUser,
          currentOtherUser,
          friendRequestsSent,
          setFriendRequestsSent,
        ],
        paramsIncludeEvent: false,
      };
    }
    if (currentUserHasReceivedFriendRequest) {
      return {
        type: "respond to friend request",
        buttonText: "Accept/Decline Request",
        handler: setShowFriendRequestResponseOptions,
        handlerParams: [!showFriendRequestResponseOptions],
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
      handler: handleSendFriendRequest,
      handlerParams: [
        currentUser,
        currentOtherUser,
        friendRequestsSent,
        setFriendRequestsSent,
      ],
      paramsIncludeEvent: false,
    };
  };
  const friendRequestButton = getFriendRequestButton();

  // have array with msg btn, array with FR button, array w/ block button
  const messageButton = {
    type: "message",
    buttonText: "Message",
    handler: undefined,
    handlerParams: [],
    paramsIncludeEvent: false,
  };

  const unfriendButton = {
    type: "unfriend",
    buttonText: (
      <>
        <i className="fas fa-user-minus"></i> Unfriend
      </>
    ),
    handler: handleUnfriending,
    handlerParams: [currentUser, currentOtherUser, friends, setFriends],
    paramsIncludeEvent: false,
  };

  const getBlockButton = () => {
    if (
      currentOtherUser &&
      currentOtherUser._id &&
      currentUser?.blockedUsers.includes(currentOtherUser._id)
    ) {
      return {
        type: "unblock",
        buttonText: currentOtherUserIsBlocked ? (
          <>
            <i className="fas fa-lock-open"></i> Unblock
          </>
        ) : (
          <>
            <i className="fas fa-lock"></i> Block
          </>
        ),
        handler: currentOtherUserIsBlocked ? handleUnblockUser : handleBlockUser,
        handlerParams: [currentUser, currentOtherUser, blockedUsers, setBlockedUsers],
        paramsIncludeEvent: false,
      };
    }
    return {
      type: "block",
      buttonText: !currentOtherUserIsBlocked ? (
        <>
          <i className="fas fa-lock"></i> Block
        </>
      ) : (
        <>
          <i className="fas fa-lock-open"></i> Unblock
        </>
      ),
      handler: !currentOtherUserIsBlocked ? handleBlockUser : handleUnblockUser,
      handlerParams: [currentUser, currentOtherUser, blockedUsers, setBlockedUsers],
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

  // get TUser object that matches each id in currentUser.friends:
  let currentUserFriends: TUser[] = [];
  if (currentUser?.friends && allUsers) {
    for (const friendID of currentUser.friends) {
      currentUserFriends.push(allUsers.filter((u) => u._id === friendID)[0]);
    }
  }
  // get TUser object that matches each id in friends array of each of currentUser's friends
  let friendsOfCurrentUserFriends: TUser[] = [];
  for (const friend of currentUserFriends) {
    if (friend && friend.friends.length > 0 && allUsers) {
      for (const friendID of friend.friends) {
        const friendOfFriend: TUser | undefined = allUsers.filter(
          (u) =>
            friendID !== currentUser?._id &&
            !currentUser?.friends.includes(friendID) &&
            u._id === friendID
        )[0];
        /* Necessary to check that friendOfFriend is truthy b/c it would sometimes be undefined if no user in allUsers fit the criteria (without this check, undefined would be pushed to friendsOfFriends) */
        if (friendOfFriend) {
          friendsOfCurrentUserFriends.push(friendOfFriend);
        }
      }
    }
  }
  const usersAreFriendsOfFriends = currentOtherUser
    ? friendsOfCurrentUserFriends.includes(currentOtherUser)
    : false;

  const getCurrentUserPalz = (): TUser[] => {
    let currentUserPalz = [];
    if (allUsers && currentUser) {
      for (const palID of currentUser.friends) {
        currentUserPalz.push(allUsers.filter((user) => user._id === palID)[0]);
      }
    }
    return currentUserPalz;
  };
  const currentUserPalz: TUser[] = getCurrentUserPalz();

  const getCurrentOtherUserPalz = (): TUser[] => {
    let currentOtherUserPalz = [];
    if (allUsers && currentOtherUser) {
      for (const palID of currentOtherUser.friends) {
        currentOtherUserPalz.push(allUsers.filter((user) => user._id === palID)[0]);
      }
    }
    return currentOtherUserPalz;
  };
  const currentOtherUserPalz = getCurrentOtherUserPalz();

  const combinedPalz = currentUserPalz.concat(currentOtherUserPalz);

  const palzInCommon = Methods.removeDuplicatesFromArray(
    combinedPalz.filter(
      (pal) => combinedPalz.indexOf(pal) !== combinedPalz.lastIndexOf(pal)
    )
  );

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      {showFriendRequestResponseOptions && currentOtherUser && (
        <TwoOptionsInterface
          header={`Respond to friend request from ${currentOtherUser.firstName} ${currentOtherUser.lastName} (${currentOtherUser.username})`}
          buttonOneText="Decline"
          buttonOneHandler={handleRejectFriendRequest}
          buttonOneHandlerParams={[
            currentOtherUser,
            currentUser,
            friendRequestsReceived,
            setFriendRequestsReceived,
          ]}
          handlerOneNeedsEventParam={true}
          buttonTwoText="Accept"
          buttonTwoHandler={handleAcceptFriendRequest}
          buttonTwoHandlerParams={[
            currentOtherUser,
            currentUser,
            friendRequestsReceived,
            setFriendRequestsReceived,
            friends,
            setFriends,
          ]}
          handlerTwoNeedsEventParam={true}
          closeHandler={setShowFriendRequestResponseOptions}
        />
      )}
      {currentOtherUser && (
        <>
          <div
            className={styles.kopfzeile}
            style={{ borderBottom: `3px solid ${randomColor}` }}
          >
            <div style={{ boxShadow: "unset" }} className="theme-element-container">
              <img
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
              <p>{currentOtherUser.username}</p>
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
                    <p>{`${currentOtherUser.city}, ${currentOtherUser.stateProvince}`}</p>
                    <img src={`/flags/4x3/${userCountryAbbreviation}.svg`} />
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
                        <button
                          disabled={isLoading}
                          onClick={
                            button.paramsIncludeEvent // @ts-expect-error: ...
                              ? (e) => button.handler(e, ...button.handlerParams)
                              : // @ts-expect-error: ...
                                () => button.handler(...button.handlerParams)
                          }
                        >
                          {button.buttonText}
                        </button>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
          <section className={styles.furtherInfoSection}>
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
            {palzInCommon.length > 0 ? (
              <div className={styles.infoPoint}>
                <header>You are both palz with : </header>
                {palzInCommon.map((pal) => (
                  <Tab
                    key={pal._id}
                    info={pal}
                    userMayNotDelete={true}
                    randomColor={randomColor}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.infoPoint}>
                <header>You are both palz with : </header>
                <p>No one</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
export default OtherUserProfile;
