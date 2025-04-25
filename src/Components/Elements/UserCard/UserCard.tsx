import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import TwoOptionsInterface from "../TwoOptionsInterface/TwoOptionsInterface";
import { Link } from "react-router-dom";
import { useChatContext } from "../../../Hooks/useChatContext";

const UserCard = ({ user }: { user: TUser }) => {
  const { isLoading } = useMainContext();
  const { currentUser, allUsers } = useUserContext();
  const {
    friends,
    setFriends,
    handleUnfriending,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleRemoveFriendRequest,
    handleSendFriendRequest,
    currentOtherUser,
    setCurrentOtherUser,
    friendRequestsSent,
    setFriendRequestsSent,
    friendRequestsReceived,
    setFriendRequestsReceived,
  } = useUserContext();
  const { getCurrentOtherUserFriends, getStartOrOpenChatWithUserHandler } =
    useChatContext();

  // Will update on time, unlike currentUser, when allUsers is changed (like when user sends/retracts friend request)
  const currentUserUpdated: TUser | undefined =
    allUsers && allUsers.filter((user) => user._id === currentUser?._id)[0];

  const currentUserReceivedFriendRequest =
    user._id && friendRequestsReceived && friendRequestsReceived.includes(user._id);

  const currentUserSentFriendRequest =
    user._id && friendRequestsSent && friendRequestsSent.includes(user._id);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
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

  const matchingCountryObject:
    | {
        country: string;
        abbreviation: string;
        phoneCode: string;
      }
    | undefined = countries.filter((country) => country.country === user.country)[0];

  const userCountryAbbreviation: string | undefined =
    user.country !== "" && matchingCountryObject
      ? matchingCountryObject.abbreviation
      : undefined;

  const getButtonOneText = (): JSX.Element | string => {
    if (currentUserReceivedFriendRequest) {
      return "Accept/Decline Request";
    }

    // If currentUser has sent user friend request:
    if (currentUserSentFriendRequest) {
      return (
        <>
          <i className="fas fa-user-minus"></i>Retract Request
        </>
      );
    }

    // If user and currentUser are friends:
    if (
      currentUser &&
      currentUser._id &&
      user &&
      user._id &&
      friends?.includes(user._id)
    ) {
      return (
        <>
          <i className="fas fa-user-minus"></i>Unfriend
        </>
      );
    }

    // Else, if no connection exists b/t currentUser & user whatsoever, and no friend request has been sent:
    return (
      <>
        <i className="fas fa-user-plus"></i>Add Friend
      </>
    );
  };

  const buttonOneText = getButtonOneText();

  const currentUserAndUserAreFriends =
    currentUser &&
    currentUser._id &&
    user &&
    user._id &&
    friends?.includes(user._id) &&
    user.friends.includes(currentUser._id);

  const noConnectionBetweenUserAndCurrentUser =
    !currentUserAndUserAreFriends &&
    !currentUserSentFriendRequest &&
    !currentUserReceivedFriendRequest;

  const getUserIsMessageable = (): boolean => {
    const currentUserIsFriendOfFriend: boolean =
      currentUser && currentUser._id
        ? getCurrentOtherUserFriends(user).some(
            (otherUserFriend) =>
              currentUser._id && otherUserFriend.friends.includes(currentUser._id)
          )
        : false;

    if (currentUser && currentUser._id) {
      if (
        user.whoCanMessage === "anyone" ||
        (user.whoCanMessage === "friends" && user.friends.includes(currentUser._id)) ||
        (user.whoCanMessage === "friends of friends" && currentUserIsFriendOfFriend)
      ) {
        return true;
      }
    }
    return false;
  };
  const userIsMessageable: boolean = getUserIsMessageable();

  const friendsInCommon: TUser[] = allUsers
    ? allUsers?.filter(
        (u) =>
          u._id && user.friends.includes(u._id) && currentUser?.friends.includes(u._id)
      )
    : [];

  return (
    <>
      {showFriendRequestResponseOptions &&
        currentOtherUser &&
        currentOtherUser._id === user._id && (
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
      <div
        className={styles.userCard}
        style={{
          boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
        }}
      >
        {userIsMessageable && (
          <div className={styles.userCardMessageBtnContainer}>
            <i
              onClick={() => getStartOrOpenChatWithUserHandler(user)}
              className="fas fa-comments"
            ></i>
          </div>
        )}
        <img
          style={{ border: `2px solid ${randomColor}` }}
          src={
            user.profileImage !== "" && typeof user.profileImage === "string"
              ? user.profileImage
              : defaultProfileImage
          }
          alt="profile image"
        />
        <header>
          {user.firstName} {user.lastName}
        </header>
        <p>{user.username}</p>
        {user.country !== "" && (
          <div className={styles.userCardLocationContainer}>
            <p>{`${user.city}, ${user.stateProvince}`}</p>
            <img src={`/flags/4x3/${userCountryAbbreviation}.svg`} />
          </div>
        )}
        {user.whoCanSeeFriendsList &&
          friendsInCommon.length > 0 &&
          (friendsInCommon.length === 1 ? (
            <p>{`${friendsInCommon.length} friend in common`}</p>
          ) : (
            <p>{`${friendsInCommon.length} friends in common`}</p>
          ))}
        <div className={styles.userCardBtnContainer}>
          <button
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
            onClick={() => {
              if (currentUserAndUserAreFriends) {
                handleUnfriending(currentUser, user, friends, setFriends);
              }
              if (currentUserSentFriendRequest && currentUser && currentUserUpdated) {
                handleRemoveFriendRequest(
                  user,
                  undefined,
                  friendRequestsSent,
                  setFriendRequestsSent
                );
              }
              if (currentUserReceivedFriendRequest) {
                setCurrentOtherUser(user);
                setShowFriendRequestResponseOptions(true);
              }
              if (currentUser && noConnectionBetweenUserAndCurrentUser) {
                handleSendFriendRequest(user, friendRequestsSent, setFriendRequestsSent);
              }
            }}
            disabled={isLoading}
          >
            {buttonOneText}
          </button>
          <Link to={`/users/${user.username}`}>
            <div className="theme-element-container">
              <button onClick={() => setCurrentOtherUser(user)} disabled={isLoading}>
                View Profile
              </button>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};
export default UserCard;
