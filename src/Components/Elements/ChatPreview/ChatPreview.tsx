import { useEffect, useState } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TChat, TThemeColor, TMessage } from "../../../types";

const ChatPreview = ({ chat }: { chat: TChat }) => {
  const { getChatMembers, userChats, currentUser } = useUserContext();

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
        if (
          !message.seenBy.includes(currentUser._id) &&
          message.sender !== currentUser._id
        ) {
          unreadMessages.push(message);
        }
      }
    }
    return unreadMessages.length >= 10 ? "9+" : unreadMessages.length;
  };

  return (
    <div
      key={chat._id}
      className="chat-preview"
      style={{ border: `2px solid ${randomColor}` }}
    >
      {chat.messages[chat.messages.length - 1].timeOpened === null && (
        <span style={{ backgroundColor: randomColor }} className="chat-new">
          {`${getNumberOfUnreadMessagesInChat(chat)} New`}
        </span>
      )}
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
                      zIndex: `${getChatMembers(chat).indexOf(member)}`,
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
            .join(", ")} ${
            getChatMembers(chat).length - 3 > 0
              ? `+${getChatMembers(chat).length - 3} more`
              : ""
          }`}
        </header>
        <p>{getPreviewOfLastMessage(chat)}</p>
      </div>
    </div>
  );
};
export default ChatPreview;
