import { useState, useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TThemeColor } from "../../../types";
import ListedUser from "../../Elements/ListedUser/ListedUser";
import styles from "./styles.module.css";
import toast from "react-hot-toast";
import Methods from "../../../methods";

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
    handleRemoveFriendRequest,
    setCurrentOtherUser,
    friendRequestsSent,
    friendRequestsReceived,
    userCreatedAccount,
    logout,
    currentUser,
  } = useUserContext();

  const [requestsVisible, setRequestsVisible] = useState<"sent" | "received" | null>(
    null
  );

  useEffect(() => {
    window.scrollTo(0, 0);

    if (userCreatedAccount === null || !currentUser) {
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
      friendRequestsReceived &&
      friendRequestsSent &&
      (friendRequestsReceived.length > 0 || friendRequestsSent.length > 0)
    ) {
      if (friendRequestsSent.length > 0) {
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

  useEffect(() => {
    if (currentUser) {
      if (requestsVisible === "received") {
        if (currentUser.friendRequestsReceived.length === 0) {
          if (currentUser.friendRequestsSent.length > 0) {
            setRequestsVisible("sent");
            setDisplayedItems(currentUser.friendRequestsSent);
          }
        } else {
          setDisplayedItems(currentUser.friendRequestsReceived);
        }
      }
      if (requestsVisible === "sent") {
        if (currentUser.friendRequestsSent.length === 0) {
          if (currentUser.friendRequestsReceived.length > 0) {
            setRequestsVisible("received");
            setDisplayedItems(currentUser.friendRequestsReceived);
          }
        } else {
          setDisplayedItems(currentUser.friendRequestsSent);
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

  return (
    <>
      <h1>Friend Requests</h1>
      {userHasPendingRequests === null ||
      (currentUser?.friendRequestsSent.length === 0 &&
        currentUser?.friendRequestsReceived.length === 0) ? (
        <h2>No pending friend requests</h2>
      ) : (
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
                    Methods.isTUser(user) && (
                      <ListedUser
                        key={user._id?.toString()}
                        renderButtonOne={true}
                        user={user}
                        buttonOneText="See Profile"
                        buttonOneIsDisabled={isLoading}
                        buttonOneLink={`/users/${user?.username}`}
                        buttonOneHandler={() => setCurrentOtherUser(user)}
                        buttonOneHandlerNeedsEventParam={false}
                        renderButtonTwo={true}
                        buttonTwoText="Retract"
                        buttonTwoHandler={handleRemoveFriendRequest}
                        buttonTwoHandlerNeedsEventParam={false}
                        buttonTwoHandlerParams={[user]}
                        buttonTwoIsDisabled={isLoading}
                        buttonTwoLink={null}
                        objectLink={`/users/${user?.username}`}
                      />
                    )
                )
              : displayedItems &&
                Methods.removeDuplicatesFromArray(displayedItems).map(
                  (user) =>
                    Methods.isTUser(user) && (
                      <ListedUser
                        key={user._id?.toString()}
                        renderButtonOne={true}
                        user={user}
                        buttonOneText="Accept"
                        buttonOneLink={null}
                        buttonOneHandler={handleAcceptFriendRequest}
                        buttonOneHandlerParams={[user, currentUser]}
                        buttonOneHandlerNeedsEventParam={true}
                        buttonOneIsDisabled={isLoading}
                        renderButtonTwo={true}
                        buttonTwoText="Reject"
                        buttonTwoHandler={handleRejectFriendRequest}
                        buttonTwoHandlerParams={[user, currentUser]}
                        buttonTwoHandlerNeedsEventParam={true}
                        buttonTwoIsDisabled={isLoading}
                        buttonTwoLink={null}
                        objectLink={`/users/${user?.username}`}
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
