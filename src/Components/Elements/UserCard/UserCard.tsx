import styles from "./styles.module.css";
import { TUser, TThemeColor } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import TwoOptionsInterface from "../TwoOptionsInterface/TwoOptionsInterface";
import { Link } from "react-router-dom";

const UserCard = ({ user }: { user: TUser }) => {
  const { currentUser, allUsers } = useUserContext();
  const {
    handleUnfriending,
    handleRejectFriendRequest,
    handleAcceptFriendRequest,
    showFriendRequestResponseOptions,
    setShowFriendRequestResponseOptions,
    handleRetractFriendRequest,
    handleSendFriendRequest,
    buttonsAreDisabled,
    currentOtherUser,
    setCurrentOtherUser,
  } = useUserContext();
  // Will update on time, unlike currentUser, when allUsers is changed (like when user sends/retracts friend request)
  const currentUserUpdated: TUser = allUsers.filter(
    (user) => user._id === currentUser?._id
  )[0];

  const [currentUserSentFriendRequest, setCurrentUserSentFriendRequest] =
    useState<boolean>(
      user && currentUser && currentUser._id && currentUserUpdated._id && user._id
        ? currentUserUpdated.friendRequestsSent.includes(user._id) &&
            user.friendRequestsReceived.includes(currentUserUpdated._id)
        : false
    );

  // set this optimistically in function to reject friend request
  const [currentUserReceivedFriendRequest, setCurrentUserReceivedFriendRequest] =
    useState<boolean>(
      currentUserUpdated._id && user && user._id
        ? user.friendRequestsSent.includes(currentUserUpdated._id) &&
            currentUserUpdated.friendRequestsReceived.includes(user._id)
        : false
    );

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
      user.friends.includes(currentUser._id) &&
      currentUser.friends.includes(user._id)
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
    currentUser?.friends.includes(user._id) &&
    user.friends.includes(currentUser._id);

  const noConnectionBetweenUserAndCurrentUser =
    !currentUserAndUserAreFriends &&
    !currentUserSentFriendRequest &&
    !currentUserReceivedFriendRequest;

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
              undefined,
              undefined,
              setCurrentUserReceivedFriendRequest,
            ]}
            handlerOneNeedsEventParam={true}
            buttonTwoText="Accept"
            buttonTwoHandler={handleAcceptFriendRequest}
            buttonTwoHandlerParams={[currentOtherUser, currentUser]}
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
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
            onClick={(e) => {
              if (currentUserAndUserAreFriends) {
                handleUnfriending(e, currentUser, user);
              }
              if (currentUserSentFriendRequest && currentUser) {
                handleRetractFriendRequest(
                  e,
                  currentUserUpdated,
                  user,
                  setCurrentUserSentFriendRequest
                );
              }
              if (currentUserReceivedFriendRequest) {
                setCurrentOtherUser(user);
                setShowFriendRequestResponseOptions(true);
              }
              if (currentUser && noConnectionBetweenUserAndCurrentUser) {
                handleSendFriendRequest(
                  currentUserUpdated,
                  user,
                  setCurrentUserSentFriendRequest
                );
              }
            }}
            disabled={buttonsAreDisabled}
          >
            {buttonOneText}
          </button>
          <Link to={`/users/${user.username}`}>
            <div className="theme-element-container">
              <button
                onClick={() => setCurrentOtherUser(user)}
                disabled={buttonsAreDisabled}
              >
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
