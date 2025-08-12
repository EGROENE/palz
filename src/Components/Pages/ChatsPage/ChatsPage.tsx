import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ChatPreview from "../../Elements/ChatPreview/ChatPreview";
import Methods from "../../../methods";
import { TChat, TThemeColor } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import CreateNewChatModal from "../../Elements/CreateNewChatModal/CreateNewChatModal";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import EditChatNameModal from "../../Elements/EditChatNameModal/EditChatNameModal";

const ChatsPage = () => {
  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const { currentUser, userCreatedAccount } = useUserContext();
  const {
    fetchChatsQuery,
    showCreateNewChatModal,
    setShowCreateNewChatModal,
    showAreYouSureYouWantToDeleteChat,
    setShowAreYouSureYouWantToDeleteChat,
    handleDeleteChat,
    currentChat,
    showEditChatNameModal,
    showChatModal,
  } = useChatContext();

  const userChats = fetchChatsQuery.data;

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
    window.scrollTo(0, 0);
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  const navigation = useNavigate();

  const isFetchError: boolean = fetchChatsQuery.isError;

  const fetchIsLoading: boolean = fetchChatsQuery.isLoading;

  useEffect(() => {
    if (!currentUser || userCreatedAccount === null) {
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
    <>
      <h1>Chats</h1>
      <button
        style={
          randomColor === "var(--primary-color)"
            ? { backgroundColor: `${randomColor}`, color: "black" }
            : { backgroundColor: `${randomColor}`, color: "var(--text-color)" }
        }
        id="new-chat-btn"
        title="Start new chat"
        onClick={() => setShowCreateNewChatModal(true)}
      >
        <i className="fas fa-feather"></i>
      </button>
      {showCreateNewChatModal && <CreateNewChatModal />}
      {showEditChatNameModal && <EditChatNameModal />}
      {isFetchError && !fetchIsLoading && (
        <p>Could not fetch your chats; try reloading the page.</p>
      )}
      {fetchIsLoading && (
        <header style={{ marginTop: "3rem" }} className="query-status-text">
          Loading...
        </header>
      )}
      {!isFetchError && !fetchIsLoading && userChats && (
        <>
          {userChats.length > 0 ? (
            <>
              {showAreYouSureYouWantToDeleteChat && !showChatModal && (
                <TwoOptionsInterface
                  header="Are you sure you want to delete this chat?"
                  subheader="Please understand that all messages will be deleted. This is irreversible."
                  buttonOneText="Cancel"
                  buttonOneHandler={() => setShowAreYouSureYouWantToDeleteChat(false)}
                  handlerOneNeedsEventParam={false}
                  buttonTwoText="Delete"
                  buttonTwoHandler={handleDeleteChat}
                  buttonTwoHandlerParams={[currentChat?._id]}
                  handlerTwoNeedsEventParam={false}
                  closeHandler={setShowAreYouSureYouWantToDeleteChat}
                />
              )}
              <div className="chats-container">
                {userChatsSortedMostRecent.map((chat) => (
                  <ChatPreview key={chat._id?.toString()} chat={chat} />
                ))}
              </div>
            </>
          ) : (
            <>
              <header
                style={{ color: "var(--text-color)", fontFamily: "var(--text-font)" }}
              >
                No chats yet, but you can create one by clicking the quill icon!
              </header>
            </>
          )}
        </>
      )}
    </>
  );
};
export default ChatsPage;
