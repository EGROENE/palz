import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser, TThemeColor } from "../../../types";
import ListedUser from "../../Elements/ListedUser/ListedUser";
import styles from "./styles.module.css";

const FriendRequests = () => {
  const { showSidebar, setShowSidebar } = useMainContext();
  const {
    allUsers,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRetractFriendRequest,
    buttonsAreDisabled,
    setCurrentOtherUser,
  } = useUserContext();
  const { username } = useParams();

  const [requestsVisible, setRequestsVisible] = useState<"sent" | "received" | null>(
    null
  );

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const currentUser: TUser = allUsers.filter((user) => user.username === username)[0];

  const [usersToWhomCurrentUserSentRequest, setUsersToWhomCurrentUserSentRequest] =
    useState<TUser[]>(
      allUsers.filter(
        (user) => user._id && currentUser.friendRequestsSent.includes(user._id)
      )
    );
  const [displayedSentRequests, setDisplayedSentRequests] = useState<TUser[]>(
    allUsers.filter(
      (user) => user._id && currentUser.friendRequestsSent.includes(user._id)
    )
  );

  const [usersWhoSentCurrentUserARequest, setUsersWhoSentCurrentUserRequest] = useState<
    TUser[]
  >(
    allUsers.filter(
      (user) => user._id && currentUser.friendRequestsReceived.includes(user._id)
    )
  );
  const [displayedReceivedRequests, setDisplayedReceivedRequests] = useState<TUser[]>(
    allUsers.filter(
      (user) => user._id && currentUser.friendRequestsReceived.includes(user._id)
    )
  );

  useEffect(() => {
    setDisplayedSentRequests(usersToWhomCurrentUserSentRequest);
  }, [usersToWhomCurrentUserSentRequest]);

  useEffect(() => {
    setDisplayedReceivedRequests(usersWhoSentCurrentUserARequest);
  }, [usersWhoSentCurrentUserARequest]);

  const userHasPendingRequests: boolean =
    currentUser.friendRequestsReceived.length > 0 ||
    currentUser.friendRequestsSent.length > 0;

  useEffect(() => {
    if (
      currentUser.friendRequestsReceived.length > 0 ||
      currentUser.friendRequestsSent.length > 0
    ) {
      if (currentUser.friendRequestsSent.length > 0) {
        setRequestsVisible("sent");
      } else {
        setRequestsVisible("received");
      }
    }

    if (showSidebar) {
      setShowSidebar(false);
    }

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

  useEffect(() => {
    setDisplayedReceivedRequests(usersWhoSentCurrentUserARequest);
    setDisplayedSentRequests(usersToWhomCurrentUserSentRequest);
  }, [allUsers]);

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Friend Requests</h1>
      {userHasPendingRequests === null ||
      (currentUser.friendRequestsSent.length === 0 &&
        currentUser.friendRequestsReceived.length === 0) ? (
        <h2>No pending friend requests</h2>
      ) : (
        <>
          <div className={styles.friendRequestFilterHeaders}>
            {usersToWhomCurrentUserSentRequest.length > 0 && (
              <div>
                <header
                  style={
                    requestsVisible === "sent" &&
                    usersWhoSentCurrentUserARequest.length > 0
                      ? { color: randomColor }
                      : { color: "var(--text-color)" }
                  }
                  onClick={
                    usersWhoSentCurrentUserARequest.length > 0
                      ? () => setRequestsVisible("sent")
                      : undefined
                  }
                >
                  Sent
                </header>
                {requestsVisible === "sent" &&
                  usersWhoSentCurrentUserARequest.length > 0 && (
                    <div
                      className={`${styles.requestTypeUnderline} animate__animated animate__slideInRight`}
                      style={{ backgroundColor: randomColor }}
                    ></div>
                  )}
              </div>
            )}
            {usersWhoSentCurrentUserARequest.length > 0 && (
              <div>
                <header
                  style={
                    requestsVisible === "received" &&
                    usersToWhomCurrentUserSentRequest.length > 0
                      ? { color: randomColor }
                      : { color: "var(--text-color)" }
                  }
                  onClick={
                    usersToWhomCurrentUserSentRequest.length > 0
                      ? () => setRequestsVisible("received")
                      : undefined
                  }
                >
                  Received
                </header>
                {requestsVisible === "received" &&
                  usersToWhomCurrentUserSentRequest.length > 0 && (
                    <div
                      className={`${styles.requestTypeUnderline} animate__animated animate__slideInLeft`}
                      style={{ backgroundColor: randomColor }}
                    ></div>
                  )}
              </div>
            )}
          </div>
          <div className={styles.friendRequestUsersContainer}>
            {requestsVisible === "sent"
              ? displayedSentRequests.map((user) => (
                  <ListedUser
                    key={user._id}
                    user={user}
                    randomColor={randomColor}
                    buttonOneText="See Profile"
                    buttonOneIsDisabled={buttonsAreDisabled}
                    buttonOneLink={`/users/${user?.username}`}
                    buttonOneHandler={() => setCurrentOtherUser(user)}
                    buttonTwoText="Retract"
                    buttonTwoHandler={handleRetractFriendRequest}
                    buttonTwoHandlerParams={[
                      currentUser,
                      user,
                      undefined,
                      undefined,
                      usersToWhomCurrentUserSentRequest,
                      setUsersToWhomCurrentUserSentRequest,
                    ]}
                    buttonTwoIsDisabled={buttonsAreDisabled}
                    buttonTwoLink={null}
                    objectLink={`/users/${user?.username}`}
                  />
                ))
              : displayedReceivedRequests.map((user) => (
                  <ListedUser
                    key={user._id}
                    user={user}
                    randomColor={randomColor}
                    buttonOneText="Accept"
                    buttonOneLink={null}
                    buttonOneHandler={handleAcceptFriendRequest}
                    buttonOneHandlerParams={[
                      user,
                      currentUser,
                      usersWhoSentCurrentUserARequest,
                      setUsersWhoSentCurrentUserRequest,
                    ]}
                    buttonOneIsDisabled={buttonsAreDisabled}
                    buttonTwoText="Reject"
                    buttonTwoHandler={handleRejectFriendRequest}
                    buttonTwoHandlerParams={[
                      user,
                      currentUser,
                      usersWhoSentCurrentUserARequest,
                      setUsersWhoSentCurrentUserRequest,
                    ]}
                    buttonTwoIsDisabled={buttonsAreDisabled}
                    buttonTwoLink={null}
                    objectLink={`/users/${user?.username}`}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
};
export default FriendRequests;
