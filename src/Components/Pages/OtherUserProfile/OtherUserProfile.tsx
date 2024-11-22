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
  const { showSidebar, setShowSidebar } = useMainContext();
  const {
    allUsers,
    currentUser,
    userCreatedAccount,
    handleSendFriendRequest,
    buttonsAreDisabled,
    handleRetractFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
  } = useUserContext();
  const { username } = useParams();
  const currentOtherUser = allUsers.filter((user) => user.username === username)[0];

  const [userSentFriendRequestOptimistic, setUserSentFriendRequestOptimistic] =
    useState<boolean>(false);
  const [userReceivedFriendRequestOptimistic, setUserReceivedFriendRequestOptimistic] =
    useState<boolean>(false);

  const [userSentFriendRequestActual, setUserSentFriendRequestActual] = useState<
    boolean | null
  >(null);
  const [userReceivedFriendRequestActual, setUserReceivedFriendRequestActual] = useState<
    boolean | null
  >(null);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    // Set color of event card's border randomly:
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  // if currentUser is undefined on initial render, redirect to login page
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please login before accessing this page");
      navigation("/");
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

  const currentUserIsBlocked: boolean =
    currentUser &&
    currentUser._id &&
    currentOtherUser &&
    currentOtherUser.blockedUsers.includes(currentUser._id)
      ? true
      : false;

  const currentOtherUserFriends: TUser[] = allUsers.filter(
    (user) => user && user._id && currentOtherUser.friends.includes(user._id)
  );

  const currentUserIsFriendOfFriend: boolean = currentUser
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
    currentOtherUser && currentOtherUser._id && currentUser && currentUser._id
      ? currentOtherUser.friendRequestsReceived.includes(currentUser._id) &&
        currentUser.friendRequestsSent.includes(currentOtherUser._id)
      : false;

  const currentUserHasReceivedFriendRequest: boolean =
    currentOtherUser && currentOtherUser._id && currentUser && currentUser._id
      ? currentOtherUser.friendRequestsSent.includes(currentUser._id) &&
        currentUser.friendRequestsReceived.includes(currentOtherUser._id)
      : false;

  // account for if user sent currentUser a FR
  const getFriendRequestButton = () => {
    if (!usersAreFriends) {
      if (currentUserHasSentFriendRequest) {
        return {
          type: "retract request",
          buttonText: (
            <>
              <i className="fas fa-user-minus"></i>Retract Request
            </>
          ),
          handler: handleRetractFriendRequest,
          handlerParams: [currentUser, currentOtherUser],
          paramsIncludeEvent: true,
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
        handlerParams: [currentUser, currentOtherUser],
        paramsIncludeEvent: false,
      };
    }
  };
  // have array with msg btn, array with FR button, array w/ block button
  const messageButton = {
    type: "message",
    buttonText: "Message",
    handler: undefined,
    handlerParams: [],
    paramsIncludeEvent: false,
  };
  const friendRequestButton = getFriendRequestButton();
  const unfriendButton = {
    type: "unfriend",
    buttonText: (
      <>
        <i className="fas fa-user-minus"></i> Unfriend
      </>
    ),
    handler: undefined,
    handlerParams: [],
    paramsIncludeEvent: false,
  };
  const blockButton = {
    type: "block",
    buttonText: (
      <>
        <i className="fas fa-user-minus"></i> Block
      </>
    ),
    buttonHandler: undefined,
    handlerParams: [],
    paramsIncludeEvent: false,
  };

  const getDisplayedButtons = () => {
    return [
      currentUserMayMessage && messageButton,
      !usersAreFriends ? friendRequestButton : unfriendButton,
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
          buttonOneHandlerParams={[currentOtherUser, currentUser]}
          buttonTwoText="Accept"
          buttonTwoHandler={handleAcceptFriendRequest}
          buttonTwoHandlerParams={[currentOtherUser, currentUser]}
          closeHandler={setShowFriendRequestResponseOptions}
        />
      )}
      <div
        className={styles.kopfzeile}
        style={{ borderBottom: `3px solid ${randomColor}` }}
      >
        <img
          style={{
            border: `3px solid ${randomColor}`,
            boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
          }}
          src={
            currentOtherUser.profileImage !== "" &&
            typeof currentOtherUser.profileImage === "string"
              ? currentOtherUser.profileImage
              : defaultProfileImage
          }
        />
        <div
          /* style={{
            background: `linear-gradient(90deg, rgba(112,106,223,0.03405112044817926) 0%, ${randomColor}  67%)`,
          }} */
          style={{
            background: `radial-gradient(circle, var(--text-color) 10%, #6a6868 70%, ${randomColor} 90%)`,
            boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
          }}
        >
          <header style={{ color: `${randomColor}` }}>
            {currentOtherUser.firstName} {currentOtherUser.lastName}
          </header>
          <p>{currentOtherUser.username}</p>
          <div className={styles.actionButtonsContainer}>
            {displayedButtons.map(
              (button) =>
                button && (
                  <button
                    disabled={buttonsAreDisabled}
                    key={button.type}
                    style={{ backgroundColor: randomColor }}
                    onClick={
                      button.paramsIncludeEvent // @ts-ignore
                        ? (e) => button.handler(e, ...button.handlerParams)
                        : // @ts-ignore
                          () => button.handler(...button.handlerParams)
                    }
                  >
                    {button.buttonText}
                  </button>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OtherUserProfile;
