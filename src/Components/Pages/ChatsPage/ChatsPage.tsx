import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../../../Hooks/useEventContext";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";
import ChatPreview from "../../Elements/ChatPreview/ChatPreview";
import Methods from "../../../methods";
import { TChat, TThemeColor } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import ChatModal from "../../Elements/ChatModal/ChatModal";

const ChatsPage = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { currentUser, userCreatedAccount, fetchAllUsersQuery } = useUserContext();
  const { fetchAllEventsQuery } = useEventContext();
  const { fetchChatsQuery, userChats, showChatModal } = useChatContext();

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

  const navigation = useNavigate();

  const isNoFetchError: boolean =
    !fetchAllEventsQuery.isError &&
    !fetchAllUsersQuery.isError &&
    !fetchChatsQuery.isError;

  const fetchIsLoading: boolean =
    fetchAllEventsQuery.isLoading ||
    fetchAllUsersQuery.isLoading ||
    fetchChatsQuery.isLoading;

  const getQueryForQueryLoadingOrErrorComponent = () => {
    if (fetchAllUsersQuery.isError) {
      return fetchAllUsersQuery;
    }
    if (fetchChatsQuery.isError) {
      return fetchChatsQuery;
    }
    return fetchAllEventsQuery;
  };
  const queryForQueryLoadingOrError = getQueryForQueryLoadingOrErrorComponent();

  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("You must be logged in to access this page.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  let userChatsSortedMostRecent: TChat[] = [];
  if (userChats) {
    userChatsSortedMostRecent = Methods.sortChatsByMostRecentMessage(userChats);
  }

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Chats</h1>
      {showChatModal && <ChatModal />}
      <QueryLoadingOrError
        query={queryForQueryLoadingOrError}
        errorMessage="Error fetching your chats"
      />
      {isNoFetchError && !fetchIsLoading && userChats && (
        <>
          <div className="chats-container">
            {userChatsSortedMostRecent.map((chat) => (
              <ChatPreview key={chat._id} chat={chat} />
            ))}
          </div>
          <i
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
            id="new-chat-btn"
            className="fas fa-feather"
            title="Start new chat"
          ></i>
        </>
      )}
    </div>
  );
};
export default ChatsPage;
