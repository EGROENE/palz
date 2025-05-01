import { useState, useEffect } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TUser, TThemeColor } from "../../../types";
import ListedUser from "../../Elements/ListedUser/ListedUser";
import styles from "./styles.module.css";
import toast from "react-hot-toast";
import Methods from "../../../methods";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";

const FriendRequests = () => {
  const {
    showSidebar,
    setShowSidebar,
    theme,
    isLoading,
    setDisplayedItemsCount,
    setDisplayedItemsCountInterval,
    setDisplayedItems,
    displayedItemsFiltered,
    setDisplayedItemsFiltered,
    displayedItemsCount,
  } = useMainContext();
  const {
    allUsers,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriendRequest,
    setCurrentOtherUser,
    friendRequestsSent,
    friendRequestsReceived,
    userCreatedAccount,
    logout,
    currentUser,
    fetchAllUsersQuery,
  } = useUserContext();

  const friendRequestsReceivedUSERS: TUser[] | undefined = allUsers?.filter(
    (user) => user._id && friendRequestsReceived?.includes(user._id)
  );

  const friendRequestsSentUSERS: TUser[] | undefined = allUsers?.filter(
    (user) => user._id && friendRequestsSent?.includes(user._id)
  );

  const [requestsVisible, setRequestsVisible] = useState<"sent" | "received" | null>(
    null
  );

  // Upon page init render only, set displayedItemsCount/Interval:
  useEffect(() => {
    setDisplayedItemsCount(4);
    setDisplayedItemsCountInterval(4);
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

  // Upon change of requestsVisible, set displayedItems & displayedItemsFiltered arrays:
  /* Remember, these 2 arrays must both exist so the amount of items displayed can be compared to how many items there are in total. */
  useEffect(() => {
    if (
      requestsVisible === "received" &&
      friendRequestsReceived &&
      friendRequestsReceivedUSERS &&
      friendRequestsSent &&
      friendRequestsSentUSERS
    ) {
      if (friendRequestsReceived.length === 0) {
        if (friendRequestsSentUSERS.length > 0) {
          setRequestsVisible("sent");
          setDisplayedItems(friendRequestsSentUSERS);
          setDisplayedItemsFiltered(
            friendRequestsSentUSERS.slice(0, displayedItemsCount)
          );
        }
      } else {
        setDisplayedItems(friendRequestsReceivedUSERS);
        setDisplayedItemsFiltered(
          friendRequestsReceivedUSERS.slice(0, displayedItemsCount)
        );
      }
    }
    if (
      requestsVisible === "sent" &&
      friendRequestsReceived &&
      friendRequestsReceivedUSERS &&
      friendRequestsSent &&
      friendRequestsSentUSERS
    ) {
      if (friendRequestsSent.length === 0) {
        if (friendRequestsReceivedUSERS.length > 0) {
          setDisplayedItems(friendRequestsReceivedUSERS);
          setDisplayedItemsFiltered(
            friendRequestsReceivedUSERS.slice(0, displayedItemsCount)
          );
        }
      } else {
        setDisplayedItems(friendRequestsSentUSERS);
        setDisplayedItemsFiltered(friendRequestsSentUSERS.slice(0, displayedItemsCount));
      }
    }
  }, [
    requestsVisible,
    currentUser?.friendRequestsReceived,
    currentUser?.friendRequestsSent,
    fetchAllUsersQuery.isLoading,
    allUsers,
    currentUser,
  ]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  //const currentUser: TUser = allUsers.filter((user) => user.username === username)[0];

  const userHasPendingRequests: boolean =
    currentUser &&
    (currentUser.friendRequestsReceived.length > 0 ||
      currentUser.friendRequestsSent.length > 0)
      ? true
      : false;

  const friendRequestsSentFiltered: string[] = friendRequestsSent
    ? Methods.removeDuplicatesFromArray(friendRequestsSent)
    : [];
  const friendRequestsReceivedFiltered: string[] = friendRequestsReceived
    ? Methods.removeDuplicatesFromArray(friendRequestsReceived)
    : [];

  return (
    <>
      <h1>Friend Requests</h1>
      <QueryLoadingOrError
        query={fetchAllUsersQuery}
        errorMessage="Error loading friend requests"
      />
      {!fetchAllUsersQuery.isLoading &&
        !fetchAllUsersQuery.isError &&
        (userHasPendingRequests === null ||
        (currentUser?.friendRequestsSent.length === 0 &&
          currentUser.friendRequestsReceived.length === 0) ? (
          <h2>No pending friend requests</h2>
        ) : (
          <>
            <div className={styles.friendRequestFilterHeaders}>
              {friendRequestsSent && friendRequestsSentFiltered.length > 0 && (
                <div>
                  <header
                    style={
                      requestsVisible === "sent" &&
                      friendRequestsReceived &&
                      friendRequestsReceivedFiltered.length > 0
                        ? { color: randomColor }
                        : { color: "var(--text-color)" }
                    }
                    onClick={
                      friendRequestsReceived && friendRequestsReceivedFiltered.length > 0
                        ? () => setRequestsVisible("sent")
                        : undefined
                    }
                  >
                    {`Sent (${friendRequestsSentFiltered.length})`}
                  </header>
                  {requestsVisible === "sent" &&
                    friendRequestsReceived &&
                    friendRequestsReceivedFiltered.length > 0 && (
                      <div
                        className={`${styles.requestTypeUnderline} animate__animated animate__slideInRight`}
                        style={{ backgroundColor: randomColor }}
                      ></div>
                    )}
                </div>
              )}
              {friendRequestsReceived && friendRequestsReceivedFiltered.length > 0 && (
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
                      friendRequestsSent && friendRequestsSentFiltered.length > 0
                        ? () => setRequestsVisible("received")
                        : undefined
                    }
                  >
                    {`Received (${friendRequestsReceivedFiltered.length})`}
                  </header>
                  {requestsVisible === "received" &&
                    friendRequestsSent &&
                    friendRequestsSentFiltered.length > 0 && (
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
                ? displayedItemsFiltered &&
                  Methods.removeDuplicatesFromArray(displayedItemsFiltered).map(
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
                : displayedItemsFiltered &&
                  Methods.removeDuplicatesFromArray(displayedItemsFiltered).map(
                    (user) =>
                      Methods.isTUser(user) && (
                        <ListedUser
                          key={user._id}
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
        ))}
    </>
  );
};
export default FriendRequests;
