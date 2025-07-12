import { useEffect, useState } from "react";
import { TChat, TThemeColor, TOtherUser, TUser } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import Methods from "../../../methods";
import { useUserContext } from "../../../Hooks/useUserContext";
import Requests from "../../../requests";

const ChatPreview = ({ chat }: { chat: TChat }) => {
  const { currentUser } = useUserContext();
  const {
    handleOpenChat,
    getNumberOfUnreadMessagesInChat,
    setShowAreYouSureYouWantToDeleteChat,
    setCurrentChat,
  } = useChatContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [chatMembers, setChatMembers] = useState<TOtherUser[] | null>(null);

  const [fetchChatMembersIsLoading, setFetchChatMembersIsLoading] =
    useState<boolean>(false);

  const [fetchChatMembersIsError, setFetchChatMembersIsError] = useState<boolean>(false);

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

    const promisesToAwaitChatMembers: Promise<TUser>[] = chat.members.map((m) => {
      return Requests.getUserByID(m).then((res) => {
        return res.json().then((member: TUser) => member);
      });
    });

    setFetchChatMembersIsLoading(true);
    Promise.all(promisesToAwaitChatMembers)
      .then((members: TUser[]) => {
        if (currentUser) {
          setChatMembers(
            members.map((m) => Methods.getTOtherUserFromTUser(m, currentUser))
          );
        }
      })
      .catch((error) => {
        console.log(error);
        setFetchChatMembersIsError(true);
      })
      .finally(() => setFetchChatMembersIsLoading(false));
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
    (chat.admins.includes(currentUser._id.toString()) ||
      (chat.members.includes(currentUser._id.toString()) && chat.members.length === 2))
      ? true
      : false;

  const getNamesOfOtherMembersInChat = (): string | undefined => {
    const otherMembers = chatMembers?.filter((m) => m._id !== currentUser?._id);

    const fullNamesToRender: number = 2;

    if (otherMembers) {
      if (otherMembers.length > 2) {
        const firstTwo = otherMembers.slice(0, fullNamesToRender).map((m) => {
          if (otherMembers.indexOf(m) <= 2) {
            return `${m.firstName} ${m.lastName}`;
          }
        });
        return `${firstTwo.join(", ")} +${otherMembers.length - fullNamesToRender} more`;
      }

      if (otherMembers.length === 2) {
        return otherMembers.map((m) => `${m.firstName} ${m.lastName}`).join(" & ");
      }
    }
    // if only one other member (two-member chat):
    return otherMembers?.map((m) => `${m.firstName} ${m.lastName}`).join("");
  };
  const namesOfOtherMembersInChat = getNamesOfOtherMembersInChat();

  return (
    <div
      className="chat-preview-container"
      style={{ border: `2px solid ${randomColor}` }}
    >
      {fetchChatMembersIsLoading && <p style={{ width: "100%" }}>Loading...</p>}
      {fetchChatMembersIsError && !fetchChatMembersIsLoading && (
        <p style={{ width: "100%" }}>Couldn't fetch chat info. Try reloading the page.</p>
      )}
      {!fetchChatMembersIsLoading && !fetchChatMembersIsError && (
        <>
          {chat.chatName && (
            <header className="chat-preview-header">{chat.chatName}</header>
          )}
          {chat._id && (
            <div key={chat._id.toString()} className="chat-preview-body">
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
                  id="delete-chat-btn"
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
                className="chat-members-and-last-message"
              >
                <div className="profile-images-chat-preview-body">
                  {chatMembers &&
                    currentUser &&
                    chatMembers
                      .filter((m) => m._id !== currentUser._id)
                      .map(
                        (member) =>
                          chatMembers
                            .filter((m) => m._id !== currentUser._id)
                            .indexOf(member) < 3 && (
                            <img
                              key={member.profileImage}
                              style={
                                chatMembers.indexOf(member) > 0
                                  ? {
                                      border: `4px solid ${randomColor}`,
                                      zIndex: `${chatMembers.indexOf(member)}`,
                                    }
                                  : { border: `4px solid ${randomColor}` }
                              }
                              src={member.profileImage}
                            />
                          )
                      )}
                  {chatMembers && chatMembers.length - 1 > 3 && (
                    <span className="more-images-text">{`+ ${
                      chatMembers.length - 3
                    }`}</span>
                  )}
                </div>
                <div className="chat-preview-body-text-container">
                  {chatMembers && currentUser && (
                    <header style={{ color: randomColor }}>
                      {namesOfOtherMembersInChat}
                    </header>
                  )}
                  <div className="last-message-preview-and-date">
                    <span>{getPreviewOfLastMessage(chat)}</span>
                    {chat.messages.length > 0 && (
                      <span>
                        {Methods.getDateMessageSent(
                          chat.messages[chat.messages.length - 1]
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ChatPreview;
