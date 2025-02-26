import { useState, useEffect } from "react";
import { useChatContext } from "../../../Hooks/useChatContext";
import Message from "../Message/Message";
import { TThemeColor } from "../../../types";
import Tab from "../Tab/Tab";

const ChatModal = () => {
  const { setShowChatModal, setCurrentChat, currentChat, getChatMembers } =
    useChatContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [showMembers, setShowMembers] = useState<boolean>(false);

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

  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={() => {
          setShowChatModal(false);
          setCurrentChat(null);
        }}
        className="fas fa-times close-module-icon"
      ></i>
      <div style={{ border: `3px solid ${randomColor}` }} className="messages-container">
        <div
          style={
            !showMembers
              ? { borderBottom: `2px solid ${randomColor}`, height: "unset" }
              : {
                  borderBottom: `2px solid ${randomColor}`,
                  height: "17%",
                  paddingBottom: "1rem",
                }
          }
          className="members-panel"
        >
          {!showMembers && <p onClick={() => setShowMembers(true)}>Show members</p>}
          {currentChat && showMembers && (
            <>
              <div className="members-container">
                {getChatMembers(currentChat.members).map((member) => (
                  <Tab
                    userMayNotDelete={true}
                    key={member._id}
                    randomColor={randomColor}
                    info={member}
                  />
                ))}
                <i className="fas fa-plus"></i>
              </div>
              <p onClick={() => setShowMembers(false)}>Hide members</p>
            </>
          )}
        </div>
        {currentChat &&
          currentChat.messages.map((message) => (
            <Message key={message._id} message={message} />
          ))}
        <div className="message-input-container">
          <input type="text" placeholder="Type message"></input>
          <i
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
            className="fas fa-paper-plane"
          ></i>
        </div>
      </div>
    </div>
  );
};
export default ChatModal;
