import { useEffect, useState } from "react";
import { TChat, TThemeColor } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import Methods from "../../../methods";
import { useUserContext } from "../../../Hooks/useUserContext";

const ChatPreview = ({ chat }: { chat: TChat }) => {
  const { currentUser } = useUserContext();
  const {
    getChatMembers,
    handleOpenChat,
    getNumberOfUnreadMessagesInChat,
    setShowAreYouSureYouWantToDeleteChat,
    setCurrentChat,
  } = useChatContext();

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

  const getPreviewOfLastMessage = (chat: TChat): string | JSX.Element => {
    const lastMessage: string | undefined =
      chat.messages.length > 0 && chat.messages[chat.messages.length - 1].content !== ""
        ? chat.messages[chat.messages.length - 1].content
        : undefined;
    if (lastMessage) {
      if (lastMessage.length > 50) {
        return `${lastMessage.slice(0, 37)}...`;
      }
      return lastMessage;
    }
    return <i>No messages yet</i>;
  };

  const userMayDeleteChat: boolean =
    chat.admins &&
    currentUser &&
    currentUser._id &&
    (chat.admins.includes(currentUser._id) ||
      (chat.members.includes(currentUser._id) && chat.members.length === 2))
      ? true
      : false;

  return (
    <div
      key={chat._id.toString()}
      className="chat-preview-container"
      style={{ border: `2px solid ${randomColor}` }}
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
      {userMayDeleteChat && (
        <i
          onClick={() => {
            setCurrentChat(chat);
            setShowAreYouSureYouWantToDeleteChat(true);
          }}
          tabIndex={0}
          aria-hidden="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCurrentChat(chat);
              setShowAreYouSureYouWantToDeleteChat(true);
            }
          }}
          title="Delete Chat"
          style={{ color: randomColor }}
          className="fas fa-trash-alt"
        ></i>
      )}
      <div
        tabIndex={0}
        aria-hidden="false"
        onClick={() => handleOpenChat(chat)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            return handleOpenChat(chat);
          }
        }}
        className="chat-preview"
      >
        <div className="profile-images-chat-preview-container">
          {getChatMembers(chat.members).map(
            (member) =>
              getChatMembers(chat.members).indexOf(member) < 3 && (
                <img
                  key={member.profileImage}
                  style={
                    getChatMembers(chat.members).indexOf(member) > 0
                      ? {
                          border: `4px solid ${randomColor}`,
                          zIndex: `${getChatMembers(chat.members).indexOf(member)}`,
                        }
                      : { border: `4px solid ${randomColor}` }
                  }
                  src={member.profileImage}
                />
              )
          )}
          {chat.members.length - 1 > 3 && (
            <span className="more-images-text">{`+ ${
              getChatMembers(chat.members).length - 3
            }`}</span>
          )}
        </div>
        <div className="chat-preview-container-text-container">
          <header style={{ color: randomColor }}>
            {`${getChatMembers(chat.members)
              .slice(0, 3)
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
            {chat.messages.length > 0 && (
              <span>
                {Methods.getDateMessageSent(chat.messages[chat.messages.length - 1])}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPreview;
