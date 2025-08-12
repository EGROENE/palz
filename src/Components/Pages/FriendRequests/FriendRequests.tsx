import { useState, useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TThemeColor, TUser } from "../../../types";
import ListedUser from "../../Elements/ListedUser/ListedUser";
import styles from "./styles.module.css";
import toast from "react-hot-toast";
import Methods from "../../../methods";
import Requests from "../../../requests";
import { useEventContext } from "../../../Hooks/useEventContext";

const FriendRequests = () => {
  const {
    showSidebar,
    setShowSidebar,
    theme,
    isLoading,
    displayedItems,
    setDisplayedItems,
  } = useMainContext();
  const {
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRetractFriendRequest,
    friendRequestsSent,
    friendRequestsReceived,
    userCreatedAccount,
    logout,
    currentUser,
    setCurrentUser,
    fetchFriendRequestsIsLoading,
    setFetchFriendRequestsIsLoading,
    fetchFriendRequestsSentIsError,
    fetchFriendRequestsReceivedIsError,
  } = useUserContext();
  const { setCurrentEvent } = useEventContext();

  const [fetchUpdatedCurrentUserIsError, setFetchUpdatedCurrentUserIsError] =
    useState<boolean>(false);

  const [requestsVisible, setRequestsVisible] = useState<"sent" | "received" | null>(
    null
  );

  const determineFRType = (): void => {
    // Determine if sent/received requests should be shown:
    if (
      friendRequestsReceived &&
      friendRequestsSent &&
      (friendRequestsReceived.length > 0 || friendRequestsSent.length > 0)
    ) {
      if (friendRequestsSent.length > 0) {
        setRequestsVisible("received");
      } else {
        setRequestsVisible("sent");
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (userCreatedAccount === null || !currentUser) {
      logout();
      setCurrentEvent(undefined);
      toast.error("Please log in before accessing this page.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
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

    if (currentUser && currentUser._id) {
      Requests.getUserByID(currentUser._id.toString())
        .then((res) => {
          if (res.ok) {
            res.json().then((cu: TUser) => setCurrentUser(cu));
          } else {
            setFetchUpdatedCurrentUserIsError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => {
          if (friendRequestsReceived && friendRequestsSent) {
            setFetchFriendRequestsIsLoading(false);
          }
        });
    }
  }, []);

  useEffect(() => {
    determineFRType();
  }, [friendRequestsReceived, friendRequestsSent]);

  useEffect(() => {
    if (currentUser && friendRequestsReceived && friendRequestsSent) {
      if (requestsVisible === "received") {
        if (currentUser.friendRequestsReceived.length === 0) {
          if (currentUser.friendRequestsSent.length > 0) {
            setRequestsVisible("sent");
            setDisplayedItems(friendRequestsSent);
          }
        } else {
          setDisplayedItems(friendRequestsReceived);
        }
      }
      if (requestsVisible === "sent") {
        if (currentUser.friendRequestsSent.length === 0) {
          if (currentUser.friendRequestsReceived.length > 0) {
            setRequestsVisible("received");
            setDisplayedItems(friendRequestsReceived);
          }
        } else {
          setDisplayedItems(friendRequestsSent);
        }
      }
    }
  }, [
    requestsVisible,
    currentUser,
    friendRequestsSent,
    friendRequestsReceived,
    currentUser?.friendRequestsReceived,
    currentUser?.friendRequestsSent,
  ]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const userHasPendingRequests: boolean =
    currentUser &&
    (currentUser.friendRequestsReceived.length > 0 ||
      currentUser.friendRequestsSent.length > 0)
      ? true
      : false;

  const isFetchError: boolean =
    fetchFriendRequestsReceivedIsError ||
    fetchFriendRequestsSentIsError ||
    fetchUpdatedCurrentUserIsError;

  return (
    <>
      <h1>Friend Requests</h1>
      {fetchFriendRequestsIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {isFetchError && !fetchFriendRequestsIsLoading && (
        <p>Error retrieving data; please reload the page.</p>
      )}
      {!isFetchError && !fetchFriendRequestsIsLoading && !userHasPendingRequests && (
        <h2>No pending friend requests</h2>
      )}
      {!isFetchError && !fetchFriendRequestsIsLoading && userHasPendingRequests && (
        <>
          <div className={styles.friendRequestFilterHeaders}>
            {friendRequestsSent &&
              Methods.removeDuplicatesFromArray(friendRequestsSent).length > 0 && (
                <div>
                  <header
                    style={
                      requestsVisible === "sent" &&
                      friendRequestsReceived &&
                      Methods.removeDuplicatesFromArray(friendRequestsReceived).length > 0
                        ? { color: randomColor }
                        : { color: "var(--text-color)" }
                    }
                    onClick={
                      friendRequestsReceived &&
                      Methods.removeDuplicatesFromArray(friendRequestsReceived).length > 0
                        ? () => setRequestsVisible("sent")
                        : undefined
                    }
                  >
                    {`Sent (${
                      Methods.removeDuplicatesFromArray(friendRequestsSent).length
                    })`}
                  </header>
                  {requestsVisible === "sent" &&
                    friendRequestsReceived &&
                    Methods.removeDuplicatesFromArray(friendRequestsReceived).length >
                      0 && (
                      <div
                        className={`${styles.requestTypeUnderline} animate__animated animate__slideInRight`}
                        style={{ backgroundColor: randomColor }}
                      ></div>
                    )}
                </div>
              )}
            {friendRequestsReceived &&
              Methods.removeDuplicatesFromArray(friendRequestsReceived).length > 0 && (
                <div>
                  <header
                    style={
                      requestsVisible === "received" &&
                      friendRequestsSent &&
                      friendRequestsSent.length > 0
                        ? { color: randomColor }
                        : { color: "var(--text-color)" }
                    }
                    onClick={
                      friendRequestsSent &&
                      Methods.removeDuplicatesFromArray(friendRequestsReceived).length > 0
                        ? () => setRequestsVisible("received")
                        : undefined
                    }
                  >
                    {`Received (${
                      Methods.removeDuplicatesFromArray(friendRequestsReceived).length
                    })`}
                  </header>
                  {requestsVisible === "received" &&
                    friendRequestsSent &&
                    Methods.removeDuplicatesFromArray(friendRequestsSent).length > 0 && (
                      <div
                        className={`${styles.requestTypeUnderline} animate__animated animate__slideInLeft`}
                        style={{ backgroundColor: randomColor }}
                      ></div>
                    )}
                </div>
              )}
          </div>
          <div className="friendRequestUsersContainer">
            {requestsVisible === "sent"
              ? displayedItems &&
                Methods.removeDuplicatesFromArray(displayedItems).map(
                  (user) =>
                    (Methods.isTUser(user) || Methods.isTBarebonesUser(user)) && (
                      <ListedUser
                        key={user._id?.toString()}
                        renderButtonOne={true}
                        user={Methods.getTBarebonesUser(user)}
                        buttonOneText="See Profile"
                        buttonOneIsDisabled={isLoading}
                        buttonOneLink={`/otherUsers/${user?.username}`}
                        renderButtonTwo={true}
                        buttonTwoText="Retract"
                        buttonTwoHandler={handleRetractFriendRequest}
                        buttonTwoHandlerNeedsEventParam={false}
                        buttonTwoHandlerParams={[user, currentUser, "retract-request"]}
                        buttonTwoIsDisabled={isLoading}
                        buttonTwoLink={null}
                        objectLink={`/otherUsers/${user?.username}`}
                      />
                    )
                )
              : displayedItems &&
                Methods.removeDuplicatesFromArray(displayedItems).map(
                  (user) =>
                    (Methods.isTUser(user) || Methods.isTBarebonesUser(user)) && (
                      <ListedUser
                        key={user._id?.toString()}
                        renderButtonOne={true}
                        user={Methods.getTBarebonesUser(user)}
                        buttonOneText="Accept"
                        buttonOneLink={null}
                        buttonOneHandler={handleAcceptFriendRequest}
                        buttonOneHandlerParams={[user, currentUser, true]}
                        buttonOneHandlerNeedsEventParam={true}
                        buttonOneIsDisabled={isLoading}
                        renderButtonTwo={true}
                        buttonTwoText="Reject"
                        buttonTwoHandler={handleRejectFriendRequest}
                        buttonTwoHandlerParams={[Methods.getTBarebonesUser(user)]}
                        buttonTwoHandlerNeedsEventParam={true}
                        buttonTwoIsDisabled={isLoading}
                        buttonTwoLink={null}
                        objectLink={`/otherUsers/${user?.username}`}
                      />
                    )
                )}
          </div>
        </>
      )}
    </>
  );
};
export default FriendRequests;
