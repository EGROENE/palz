import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useMainContext } from "../../../Hooks/useMainContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import styles from "./styles.module.css";
import { TThemeColor, TUser } from "../../../types";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";

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
  } = useUserContext();
  const { username } = useParams();
  const currentOtherUser = allUsers.filter((user) => user.username === username)[0];

  const currentOtherUserIsBlocked =
    blockedUsers && currentOtherUser._id && blockedUsers.includes(currentOtherUser._id);

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
    if (currentUser?._id && currentOtherUser.blockedUsers.includes(currentUser._id)) {
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

  /* Buttons at top - If currentUser has been blocked by currentOtherUser, show "The page you were looking for does not exist." (only should appear if user goes directly to that user's page). If currentUser has been blocked by another user, this user should not appear anywhere on the site (FindPalz, Palz lists of other users). When blocking, make TwoOptionsModal appear, warning that any friendship will be lost & that they won't be able to see each other's events. */

  const usersAreFriends: boolean =
    currentUser &&
    currentUser?._id &&
    currentOtherUser &&
    currentOtherUser?._id &&
    currentOtherUser.friends.includes(currentUser._id) &&
    currentUser.friends.includes(currentOtherUser._id)
      ? true
      : false;

  const currentOtherUserFriends: TUser[] =
    currentOtherUser &&
    allUsers.filter(
      (user) => user && user._id && currentOtherUser.friends.includes(user._id)
    );

  const currentUserIsFriendOfFriend: boolean =
    currentUser && currentOtherUser
      ? currentOtherUserFriends.some(
          (user) => currentUser._id && user.friends.includes(currentUser._id)
        )
      : false;

  const currentUserMayMessage: boolean =
    currentUser && currentUser._id && currentOtherUser._id
      ? currentOtherUser.whoCanMessage === "anyone" ||
        (currentUser._id &&
          currentOtherUser.whoCanMessage === "friends" &&
          currentOtherUser.friends.includes(currentUser._id) &&
          currentUser?.friends.includes(currentOtherUser._id)) ||
        (currentUserIsFriendOfFriend &&
          currentOtherUser.whoCanMessage === "friends of friends")
      : false;

  const currentUserHasSentFriendRequest: boolean =
    currentOtherUser._id && friendRequestsSent?.includes(currentOtherUser._id)
      ? true
      : false;

  const currentUserHasReceivedFriendRequest: boolean =
    currentOtherUser._id && friendRequestsReceived?.includes(currentOtherUser._id)
      ? true
      : false;

  // account for if user sent currentUser a FR
  const getFriendRequestButton = () => {
    if (!usersAreFriends) {
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
    }
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
    handlerParams: [currentUser, currentOtherUser],
    paramsIncludeEvent: false,
  };

  const getBlockButton = () => {
    if (
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
        buttonHandler: currentOtherUserIsBlocked ? handleUnblockUser : handleBlockUser,
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
      buttonHandler: !currentOtherUserIsBlocked ? handleBlockUser : handleUnblockUser,
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

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      {showFriendRequestResponseOptions && (
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
          ]}
          handlerTwoNeedsEventParam={true}
          closeHandler={setShowFriendRequestResponseOptions}
        />
      )}
      {currentOtherUser && (
        <div
          className={styles.kopfzeile}
          style={{ borderBottom: `3px solid ${randomColor}` }}
        >
          <div className="theme-element-container">
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
      )}
    </div>
  );
};
export default OtherUserProfile;
