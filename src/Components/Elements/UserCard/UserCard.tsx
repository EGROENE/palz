import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import TwoOptionsInterface from "../TwoOptionsInterface/TwoOptionsInterface";

const UserCard = ({ user }: { user: TUser }) => {
  const { currentUser, allUsers } = useMainContext();
  const {
    handleUnfriending,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    setFriendRequestSent,
    handleRetractFriendRequest,
    handleSendFriendRequest,
    buttonsAreDisabled,
    selectedOtherUser,
    setSelectedOtherUser,
  } = useUserContext();
  // Will update on time, unlike currentUser, when allUsers is changed (like when user sends/retracts friend request)
  const currentUserUpdated = allUsers.filter((user) => user._id === currentUser?._id)[0];

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  /* sender below is absolute most-current version of currentUser. currentUser itself (the state value) doesn't update in time if friend requests are sent/rescinded, but the corresponding user in allUsers does update in time, so sender is simply that value, captured when Add/Retract friend req btn is clicked. */
  //const sender = allUsers.filter((user) => user._id === currentUser?._id)[0];

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

    // Initialize value of friendRequestSent:
    if (
      user._id &&
      currentUserUpdated?._id &&
      currentUserUpdated?.friendRequestsSent.includes(user._id) &&
      user.friendRequestsReceived.includes(currentUserUpdated?._id)
    ) {
      setFriendRequestSent(true);
    }
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
    // either Unfriend, Retract Request

    // If user has sent currentUser a friend req, return btn "Accept/Decline Request" w/ handler that shows TwoOptionsModal w/ Accept/Decline btns

    // If user has sent currentUser a friend request:
    if (
      currentUser &&
      currentUser._id &&
      user.friendRequestsSent.includes(currentUser._id)
    ) {
      return "Accept/Decline Request";
    }

    // If currentUser has sent user friend request:
    if (user._id && currentUser?.friendRequestsSent.includes(user._id)) {
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
      user.friends.includes(currentUser._id) &&
      currentUser.friends.includes(user._id)
    ) {
      return (
        <>
          <i className="fas fa-user-minus"></i>Unfriend
        </>
      );
    }

    // Else, if no connection exists b/t currentUser & user whatsoever:
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
    currentUser?.friends.includes(user._id) &&
    user.friends.includes(currentUser._id);

  const currentUserHasSentUserAFriendRequest =
    currentUser &&
    currentUser._id &&
    user.friendRequestsReceived.includes(currentUser._id);

  const userHasSentCurrentUserAFriendRequest =
    user && user._id && currentUser?.friendRequestsReceived.includes(user._id);

  const noConnectionBetweenUserAndCurrentUser =
    !currentUserAndUserAreFriends &&
    !currentUserHasSentUserAFriendRequest &&
    !userHasSentCurrentUserAFriendRequest;

  return (
    <>
      {showFriendRequestResponseOptions &&
        selectedOtherUser &&
        selectedOtherUser._id === user._id && (
          <TwoOptionsInterface
            header={`Respond to friend request from ${selectedOtherUser.firstName} ${selectedOtherUser.lastName} (${selectedOtherUser.username})`}
            buttonOneText="Accept"
            buttonOneHandler={handleAcceptFriendRequest}
            buttonOneHandlerParams={[selectedOtherUser, currentUser]}
            buttonTwoText="Decline"
            buttonTwoHandler={handleRejectFriendRequest}
            buttonTwoHandlerParams={[selectedOtherUser, currentUser]}
            closeHandler={setShowFriendRequestResponseOptions}
          />
        )}
      <div
        className={styles.userCard}
        style={{
          boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
        }}
      >
        <i
          style={{
            position: "absolute",
            right: "1rem",
            top: "1rem",
            fontSize: "1.25rem",
          }}
          className="fas fa-comments"
        ></i>
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
        <div className={styles.userCardBtnContainer}>
          <button
            onClick={(e) => {
              if (currentUserAndUserAreFriends) {
                handleUnfriending(e, currentUser, user);
              }
              if (currentUserHasSentUserAFriendRequest) {
                handleRetractFriendRequest(e, currentUser, user);
              }
              if (userHasSentCurrentUserAFriendRequest) {
                setSelectedOtherUser(user);
                setShowFriendRequestResponseOptions(true);
              }
              if (currentUser && noConnectionBetweenUserAndCurrentUser) {
                handleSendFriendRequest(currentUser, user);
              }
            }}
            disabled={buttonsAreDisabled}
            style={{ backgroundColor: randomColor }}
          >
            {buttonOneText}
          </button>
          <button disabled={buttonsAreDisabled}>View Profile</button>
        </div>
      </div>
    </>
  );
};
export default UserCard;
