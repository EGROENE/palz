import { Link } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useChatContext } from "../../../Hooks/useChatContext";
import { TChat } from "../../../types";

const MobileNavOptions = () => {
  const { setShowMobileNavOptions, currentRoute, setFetchStart, setDisplayedItems } =
    useMainContext();
  const { currentUser, userCreatedAccount, logout, friendRequestsReceived } =
    useUserContext();
  const { getTotalNumberOfUnreadMessages, fetchChatsQuery } = useChatContext();

  const userChats: TChat[] | undefined = fetchChatsQuery.data;

  const totalUnreadUserMessages: string | number | undefined = userChats
    ? getTotalNumberOfUnreadMessages(userChats)
    : undefined;

  return (
    <div className="mobile-nav-options">
      <i
        title="Close"
        onClick={() => setShowMobileNavOptions(false)}
        className="fas fa-times close-module-icon"
      ></i>
      <div className="mobile-nav-options-container">
        {currentRoute !== "/add-event" && (
          <Link onClick={() => setShowMobileNavOptions(false)} to={"/add-event"}>
            Create Event
          </Link>
        )}
        {currentRoute !== `/${currentUser?.username}/events` && (
          <Link
            onClick={() => setShowMobileNavOptions(false)}
            to={`/${currentUser?.username}/events`}
          >
            My Events
          </Link>
        )}
        {currentRoute !== "/find-events" && (
          <Link
            onClick={() => {
              setFetchStart(0);
              setDisplayedItems([]);
              setShowMobileNavOptions(false);
            }}
            to={"/find-events"}
          >
            Explore Events
          </Link>
        )}
        {currentRoute !== `/${currentUser?.username}/friend-requests` && (
          <Link
            onClick={() => setShowMobileNavOptions(false)}
            to={`/${currentUser?.username}/friend-requests`}
          >
            {
              <>
                Friend Requests{" "}
                {friendRequestsReceived && friendRequestsReceived.length > 0 && (
                  <span className="notifications-count">
                    {friendRequestsReceived.length}
                  </span>
                )}
              </>
            }
          </Link>
        )}
        {currentRoute !== "/find-palz" && (
          <Link
            onClick={() => {
              setFetchStart(0);
              setDisplayedItems([]);
              setShowMobileNavOptions(false);
            }}
            to="/find-palz"
          >
            Find Palz
          </Link>
        )}
        {currentRoute !== "/my-palz" && (
          <Link
            onClick={() => {
              setFetchStart(0);
              setDisplayedItems([]);
              setShowMobileNavOptions(false);
            }}
            to={"/my-palz"}
          >
            My Palz
          </Link>
        )}
        {currentRoute !== "/chats" && (
          <>
            <Link onClick={() => setShowMobileNavOptions(false)} to={"/chats"}>
              Chats
            </Link>
            {totalUnreadUserMessages !== 0 && (
              <span className="notifications-count">{totalUnreadUserMessages}</span>
            )}
          </>
        )}
        {currentRoute !== "/settings" && (
          <Link onClick={() => setShowMobileNavOptions(false)} to={"/settings"}>
            Settings
          </Link>
        )}
        {currentRoute !== "/terms-and-conditions" && (
          <Link
            onClick={() => setShowMobileNavOptions(false)}
            to={"/terms-and-conditions"}
          >
            Terms & Conditions
          </Link>
        )}
        {userCreatedAccount !== null ? (
          <div
            onClick={() => {
              logout();
              setShowMobileNavOptions(false);
            }}
          >
            Log Out
            <i style={{ marginLeft: "0.5rem" }} className="fas fa-sign-out-alt"></i>
          </div>
        ) : (
          <Link to="/">
            Log In/Sign Up<i className="fas fa-sign-out-alt"></i>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileNavOptions;
