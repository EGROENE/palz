import styles from "./styles.module.css";
import { TUser, TThemeColor, TOtherUser } from "../../../types";
import { countries } from "../../../constants";
import { useState, useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";
import TwoOptionsInterface from "../TwoOptionsInterface/TwoOptionsInterface";
import { Link } from "react-router-dom";
import { useChatContext } from "../../../Hooks/useChatContext";
import Requests from "../../../requests";

const UserCard = ({ userSECURE }: { userSECURE: TOtherUser }) => {
  const { isLoading, error, setError } = useMainContext();

  if (error) {
    throw new Error(error);
  }

  const { currentUser } = useUserContext();

  const {
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
    friendRequestsReceived,
  } = useUserContext();

  const { getStartOrOpenChatWithUserHandler } = useChatContext();

  // Will update on time, unlike currentUser, when allUsers is changed (like when user sends/retracts friend request)
  const currentUserReceivedFriendRequest =
    userSECURE._id &&
    friendRequestsReceived &&
    friendRequestsReceived.map((elem) => elem._id).includes(userSECURE._id.toString());

  const currentUserSentFriendRequest =
    userSECURE._id &&
    friendRequestsSent &&
    friendRequestsSent.map((elem) => elem._id).includes(userSECURE._id.toString());

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [friendsInCommon, setFriendsInCommon] = useState<string[] | undefined>(undefined);

  const [currentUserIsFriendOfFriend, setCurrentUserIsFriendOfFriend] =
    useState<boolean>(false);

  const [currentUserCanSeeLocation, setCurrentUserCanSeeLocation] =
    useState<boolean>(false);

  const [userIsMessageable, setUserIsMessageable] = useState<boolean>(false);

  const [currentUserAndUserAreFriends, setCurrentUserAndUserAreFriends] =
    useState<boolean>(false);

  const [currentUserCanSeeFriends, setCurrentUserCanSeeFriends] =
    useState<boolean>(false);

  useEffect(() => {
    // Get user's TUser object, set values that depend on its properties:
    if (userSECURE._id) {
      Requests.getUserByID(userSECURE._id.toString())
        .then((res) => {
          if (res.ok) {
            res
              .json()
              .then((user: TUser) => {
                // Set currentUserCanSeeFriends:
                if (
                  user.whoCanSeeFriendsList === "anyone" ||
                  (user.whoCanSeeFriendsList === "friends" &&
                    currentUserAndUserAreFriends) ||
                  (user.whoCanSeeFriendsList === "friends of friends" &&
                    currentUserIsFriendOfFriend)
                ) {
                  setCurrentUserCanSeeFriends(true);
                }

                // Set currentUserCanSeeLocation:
                if (
                  user.whoCanSeeLocation === "anyone" ||
                  (user.whoCanSeeLocation === "friends" &&
                    currentUserAndUserAreFriends) ||
                  (user.whoCanSeeLocation === "friends of friends" &&
                    currentUserIsFriendOfFriend)
                ) {
                  setCurrentUserCanSeeLocation(true);
                }

                // Set friendsInCommon:
                let friendsInCommon: string[] = [];
                for (const friend of user.friends) {
                  if (currentUser?.friends.includes(friend)) {
                    friendsInCommon.push(friend);
                  }
                }
                setFriendsInCommon(friendsInCommon);

                // Set currentUserIsFriendOfFriend:
                const getCurrentOtherUserFriends = async (): Promise<TUser[]> => {
                  let currentOtherUserFriends: TUser[] = [];
                  for (const friendID of user.friends) {
                    await Requests.getUserByID(friendID)
                      .then((res) => {
                        if (res.ok) {
                          res
                            .json()
                            .then((currentOtherUserFriend) =>
                              currentOtherUserFriends.push(currentOtherUserFriend)
                            );
                        } else {
                          setError("Error fetching user's friends (TUser[])");
                        }
                      })
                      .catch((error) => console.log(error));
                  }
                  return currentOtherUserFriends;
                };

                getCurrentOtherUserFriends().then((currentOtherUserFriends) => {
                  if (currentUser && currentUser._id) {
                    for (const friend of currentOtherUserFriends) {
                      if (friend.friends.includes(currentUser._id.toString())) {
                        setCurrentUserIsFriendOfFriend(true);
                      }
                    }
                  }
                });

                // Set userIsMessageable:
                if (currentUser && currentUser._id) {
                  if (
                    user.whoCanMessage === "anyone" ||
                    (user.whoCanMessage === "friends" &&
                      user.friends.includes(currentUser._id.toString())) ||
                    (user.whoCanMessage === "friends of friends" &&
                      currentUserIsFriendOfFriend)
                  ) {
                    setUserIsMessageable(true);
                  }
                }

                // setCurrentUserAndUserAreFriends:
                if (
                  currentUser &&
                  currentUser._id &&
                  user._id &&
                  currentUser.friends.includes(user._id.toString()) &&
                  user.friends.includes(currentUser._id.toString())
                ) {
                  setCurrentUserAndUserAreFriends(true);
                }
              })
              .catch((error) => console.log(error));
          }
        })
        .catch((error) => {
          console.log(error);
          return undefined;
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

  const matchingCountryObject:
    | {
        country: string;
        abbreviation: string;
        phoneCode: string;
      }
    | undefined = countries.filter(
    (country) => country.country === userSECURE.country
  )[0];

  const userCountryAbbreviation: string | undefined =
    userSECURE?.country !== "" && matchingCountryObject && currentUserCanSeeLocation
      ? matchingCountryObject.abbreviation
      : undefined;

  const noConnectionBetweenUserAndCurrentUser =
    !currentUserAndUserAreFriends &&
    !currentUserSentFriendRequest &&
    !currentUserReceivedFriendRequest;

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
    if (currentUserAndUserAreFriends) {
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

  return (
    <>
      {showFriendRequestResponseOptions &&
        currentOtherUser &&
        currentOtherUser._id === userSECURE._id && (
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
      <div
        className={styles.userCard}
        style={{
          boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
        }}
      >
        {userIsMessageable && (
          <div className={styles.userCardMessageBtnContainer}>
            <i
              onClick={() => getStartOrOpenChatWithUserHandler(userSECURE)}
              className="fas fa-comments"
            ></i>
          </div>
        )}
        <img
          style={{ border: `2px solid ${randomColor}` }}
          src={
            userSECURE.profileImage !== "" && typeof userSECURE.profileImage === "string"
              ? userSECURE.profileImage
              : defaultProfileImage
          }
          alt="profile image"
        />
        <header>
          {userSECURE.firstName} {userSECURE.lastName}
        </header>
        <p>{userSECURE.username}</p>
        {userSECURE.country !== "" &&
          userSECURE.city !== "" &&
          userSECURE.stateProvince !== "" &&
          currentUserCanSeeLocation && (
            <div className={styles.userCardLocationContainer}>
              <p>{`${userSECURE.city}, ${userSECURE.stateProvince}`}</p>
              <img src={`/flags/4x3/${userCountryAbbreviation}.svg`} />
            </div>
          )}
        {currentUserCanSeeFriends &&
          friendsInCommon &&
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
              if (currentUserAndUserAreFriends && currentUser && userSECURE) {
                handleUnfriending(currentUser, userSECURE);
              }
              if (currentUserSentFriendRequest && currentUser) {
                handleRemoveFriendRequest(userSECURE, currentUser);
              }
              if (currentUserReceivedFriendRequest) {
                setCurrentOtherUser(userSECURE);
                setShowFriendRequestResponseOptions(true);
              }
              if (currentUser && noConnectionBetweenUserAndCurrentUser) {
                handleSendFriendRequest(userSECURE);
              }
            }}
            disabled={isLoading}
          >
            {buttonOneText}
          </button>
          <Link to={`/users/${userSECURE.username}`}>
            <div className="theme-element-container">
              <button
                onClick={() => setCurrentOtherUser(userSECURE)}
                disabled={isLoading}
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
