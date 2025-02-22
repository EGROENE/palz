import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../../../Hooks/useEventContext";
import QueryLoadingOrError from "../../Elements/QueryLoadingOrError/QueryLoadingOrError";
import { TUser, TChat, TThemeColor } from "../../../types";

const ChatsPage = () => {
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

  const { showSidebar, setShowSidebar, theme } = useMainContext();
  const {
    currentUser,
    userCreatedAccount,
    userChats,
    fetchAllUsersQuery,
    fetchChatsQuery,
    allUsers,
  } = useUserContext();
  const { fetchAllEventsQuery } = useEventContext();

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

  const allOtherUsers: TUser[] =
    allUsers && currentUser
      ? allUsers.filter((user) => user._id !== currentUser._id)
      : [];

  const getChatMembers = (chat: TChat): TUser[] => {
    let chatMembers: TUser[] = [];
    for (const user of allOtherUsers) {
      if (user._id && chat.members.includes(user._id)) {
        chatMembers.push(user);
      }
    }
    return chatMembers;
  };

  const getPreviewOfLastMessage = (chat: TChat): string => {
    const lastMessage: string | undefined =
      chat.messages[chat.messages.length - 1].content !== ""
        ? chat.messages[chat.messages.length - 1].content
        : undefined;
    if (lastMessage) {
      if (lastMessage.length > 50) {
        return `${lastMessage.slice(0, 47)}...`;
      }
      return lastMessage;
    }
    return "IMAGE";
  };

  const secondImageZIndex = 0;

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <h1>Chats</h1>
      <QueryLoadingOrError
        query={queryForQueryLoadingOrError}
        errorMessage="Error fetching your chats"
      />
      {isNoFetchError && !fetchIsLoading && userChats && (
        <div className="chats-container">
          {userChats.map((chat) => (
            <div
              key={chat._id}
              className="chat-preview"
              style={{ border: `2px solid ${randomColor}` }}
            >
              <div className="profile-images-chat-preview">
                {getChatMembers(chat).map((member) =>
                  getChatMembers(chat).indexOf(member) < 3 ? (
                    <img
                      key={member.profileImage}
                      style={
                        getChatMembers(chat).indexOf(member) > 0
                          ? {
                              border: `4px solid ${randomColor}`,
                              marginLeft: "-3rem",
                              zIndex: `${
                                secondImageZIndex + getChatMembers(chat).indexOf(member)
                              }`,
                            }
                          : { border: `4px solid ${randomColor}` }
                      }
                      src={member.profileImage}
                    />
                  ) : (
                    <span key={member.username} className="more-images-text">{`+ ${
                      getChatMembers(chat).length - 3
                    }`}</span>
                  )
                )}
              </div>
              <div className="chat-preview-text-container">
                <header style={{ color: randomColor }}>
                  {`${getChatMembers(chat)
                    .map((member) =>
                      getChatMembers(chat).indexOf(member) <= 2
                        ? `${member.firstName} ${member.lastName}`
                        : ""
                    )
                    .join(", ")} +${getChatMembers(chat).length - 3} more`}
                </header>
                <p>{getPreviewOfLastMessage(chat)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ChatsPage;
