import { useEffect, useState } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TChat, TThemeColor, TMessage } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import Methods from "../../../methods";

const ChatPreview = ({ chat }: { chat: TChat }) => {
  const { currentUser } = useUserContext();
  const { getChatMembers, userChats, setShowChatModal, setCurrentChat } =
    useChatContext();

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

  const getPreviewOfLastMessage = (chat: TChat): string => {
    const lastMessage: string | undefined =
      chat.messages[chat.messages.length - 1].content !== ""
        ? chat.messages[chat.messages.length - 1].content
        : undefined;
    if (lastMessage) {
      if (lastMessage.length > 50) {
        return `${lastMessage.slice(0, 37)}...`;
      }
      return lastMessage;
    }
    return "IMAGE";
  };

  const getNumberOfUnreadMessagesInChat = (chat: TChat): string | number => {
    let unreadMessages: TMessage[] = [];
    if (userChats && currentUser && currentUser._id) {
      for (const message of chat.messages) {
        const usersWhoSawMessage: string[] = message.seenBy.map((obj) => obj.user);
        if (
          !usersWhoSawMessage.includes(currentUser._id) &&
          message.sender !== currentUser._id
        ) {
          unreadMessages.push(message);
        }
        if (
          usersWhoSawMessage.includes(currentUser._id) ||
          message.sender === currentUser._id
        ) {
          return "";
        }
      }
    }
    if (unreadMessages.length >= 10) {
      return "9+";
    }
    if (unreadMessages.length < 10) {
      return unreadMessages.length;
    }
    return 0;
  };

  return (
    <div
      key={chat._id}
      className="chat-preview"
      style={{ border: `2px solid ${randomColor}` }}
      onClick={() => {
        setShowChatModal(true);
        setCurrentChat(chat);
      }}
    >
      {getNumberOfUnreadMessagesInChat(chat) !== 0 &&
        typeof getNumberOfUnreadMessagesInChat(chat) !== "string" && (
          <span
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
            className="chat-new"
          >
            {`${getNumberOfUnreadMessagesInChat(chat)} New`}
          </span>
        )}
      <div className="profile-images-chat-preview">
        {getChatMembers(chat.members).map((member) =>
          getChatMembers(chat.members).indexOf(member) < 3 ? (
            <img
              key={member.profileImage}
              style={
                getChatMembers(chat.members).indexOf(member) > 0
                  ? {
                      border: `4px solid ${randomColor}`,
                      marginLeft: "-3rem",
                      zIndex: `${getChatMembers(chat.members).indexOf(member)}`,
                    }
                  : { border: `4px solid ${randomColor}` }
              }
              src={member.profileImage}
            />
          ) : (
            <span key={member.username} className="more-images-text">{`+ ${
              getChatMembers(chat.members).length - 3
            }`}</span>
          )
        )}
      </div>
      <div className="chat-preview-text-container">
        <header style={{ color: randomColor }}>
          {`${getChatMembers(chat.members)
            .map((member) =>
              getChatMembers(chat.members).indexOf(member) <= 2
                ? `${member.firstName} ${member.lastName}`
                : ""
            )
            .join(", ")} ${
            getChatMembers(chat.members).length - 3 > 0
              ? `+${getChatMembers(chat.members).length - 3} more`
              : ""
          }`}
        </header>
        <div className="last-message-preview-and-date">
          <span>{getPreviewOfLastMessage(chat)}</span>
          <span>
            {Methods.getDateMessageSent(chat.messages[chat.messages.length - 1])}
          </span>
        </div>
      </div>
    </div>
  );
};
export default ChatPreview;
