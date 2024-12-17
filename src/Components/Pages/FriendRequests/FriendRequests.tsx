import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser, TThemeColor } from "../../../types";
import ListedUser from "../../Elements/ListedUser/ListedUser";
import styles from "./styles.module.css";
import toast from "react-hot-toast";
import Methods from "../../../methods";

const FriendRequests = () => {
  const navigation = useNavigate();
  const {
    showSidebar,
    setShowSidebar,
    theme,
    isLoading,
    setDisplayedItemsCount,
    setDisplayedItemsCountInterval,
    displayedItems,
    setDisplayedItems,
    displayedItemsFiltered,
    setDisplayedItemsFiltered,
    displayedItemsCount,
  } = useMainContext();
  const {
    allUsers,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRetractFriendRequest,
    setCurrentOtherUser,
    displayedSentRequests,
    setDisplayedSentRequests,
    displayedReceivedRequests,
    setDisplayedReceivedRequests,
    userCreatedAccount,
    logout,
  } = useUserContext();
  const { username } = useParams();

  const [requestsVisible, setRequestsVisible] = useState<"sent" | "received" | null>(
    null
  );

  // Upon page init render only, set displayedItemsCount/Interval:
  useEffect(() => {
    setDisplayedItemsCount(4);
    setDisplayedItemsCountInterval(4);
  }, []);

  // Upon change of requestsVisible, set displayedItems & displayedItemsFiltered arrays:
  /* Remember, these 2 arrays must both exist so the amount of items displayed can be compared to how many items there are in total. */
  useEffect(() => {
    if (requestsVisible === "received" && displayedReceivedRequests) {
      setDisplayedItems(displayedReceivedRequests);
      setDisplayedItemsFiltered(displayedReceivedRequests.slice(0, displayedItemsCount));
    }
    if (requestsVisible === "sent" && displayedSentRequests) {
      setDisplayedItems(displayedSentRequests);
      setDisplayedItemsFiltered(displayedItems.slice(0, displayedItemsCount));
    }
  }, [requestsVisible]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const currentUser: TUser = allUsers.filter((user) => user.username === username)[0];

  const userHasPendingRequests: boolean =
    currentUser.friendRequestsReceived.length > 0 ||
    currentUser.friendRequestsSent.length > 0;

  useEffect(() => {
    if (userCreatedAccount === null) {
      navigation(`/`);
      logout();
      toast.error("Please log in before accessing this page.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }

    // Determine if sent/received requests should be shown:
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
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

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
            {displayedSentRequests && displayedSentRequests.length > 0 && (
              <div>
                <header
                  style={
                    requestsVisible === "sent" &&
                    displayedReceivedRequests &&
                    displayedReceivedRequests.length > 0
                      ? { color: randomColor }
                      : { color: "var(--text-color)" }
                  }
                  onClick={
                    displayedReceivedRequests && displayedReceivedRequests.length > 0
                      ? () => setRequestsVisible("sent")
                      : undefined
                  }
                >
                  Sent
                </header>
                {requestsVisible === "sent" &&
                  displayedReceivedRequests &&
                  displayedReceivedRequests.length > 0 && (
                    <div
                      className={`${styles.requestTypeUnderline} animate__animated animate__slideInRight`}
                      style={{ backgroundColor: randomColor }}
                    ></div>
                  )}
              </div>
            )}
            {displayedReceivedRequests && displayedReceivedRequests.length > 0 && (
              <div>
                <header
                  style={
                    requestsVisible === "received" &&
                    displayedSentRequests &&
                    displayedSentRequests.length > 0
                      ? { color: randomColor }
                      : { color: "var(--text-color)" }
                  }
                  onClick={
                    displayedSentRequests && displayedSentRequests.length > 0
                      ? () => setRequestsVisible("received")
                      : undefined
                  }
                >
                  Received
                </header>
                {requestsVisible === "received" &&
                  displayedSentRequests &&
                  displayedSentRequests.length > 0 && (
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
              ? displayedItemsFiltered &&
                displayedItemsFiltered.map(
                  (user) =>
                    Methods.isTUser(user) && (
                      <ListedUser
                        key={user._id}
                        renderButtonOne={true}
                        user={user}
                        buttonOneText="See Profile"
                        buttonOneIsDisabled={isLoading}
                        buttonOneLink={`/users/${user?.username}`}
                        buttonOneHandler={() => setCurrentOtherUser(user)}
                        handlerOneNeedsEventParam={false}
                        buttonTwoText="Retract"
                        buttonTwoHandler={handleRetractFriendRequest}
                        buttonTwoHandlerParams={[
                          currentUser,
                          user,
                          undefined,
                          displayedSentRequests,
                          setDisplayedSentRequests,
                        ]}
                        buttonTwoIsDisabled={isLoading}
                        handlerTwoNeedsEventParam={false}
                        buttonTwoLink={null}
                        objectLink={`/users/${user?.username}`}
                      />
                    )
                )
              : displayedItemsFiltered &&
                displayedItemsFiltered.map(
                  (user) =>
                    Methods.isTUser(user) && (
                      <ListedUser
                        key={user._id}
                        renderButtonOne={true}
                        user={user}
                        buttonOneText="Accept"
                        buttonOneLink={null}
                        buttonOneHandler={handleAcceptFriendRequest}
                        buttonOneHandlerParams={[
                          user,
                          currentUser,
                          displayedReceivedRequests,
                          setDisplayedReceivedRequests,
                        ]}
                        handlerOneNeedsEventParam={true}
                        buttonOneIsDisabled={isLoading}
                        buttonTwoText="Reject"
                        buttonTwoHandler={handleRejectFriendRequest}
                        buttonTwoHandlerParams={[
                          user,
                          currentUser,
                          displayedReceivedRequests,
                          setDisplayedReceivedRequests,
                        ]}
                        handlerTwoNeedsEventParam={true}
                        buttonTwoIsDisabled={isLoading}
                        buttonTwoLink={null}
                        objectLink={`/users/${user?.username}`}
                      />
                    )
                )}
          </div>
        </>
      )}
    </div>
  );
};
export default FriendRequests;
