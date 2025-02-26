import { useState, useEffect } from "react";
import { useChatContext } from "../../../Hooks/useChatContext";
import Message from "../Message/Message";
import { TThemeColor } from "../../../types";

const ChatModal = () => {
  const { setShowChatModal, setCurrentChat, currentChat } = useChatContext();

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
        {currentChat &&
          currentChat.messages.map((message) => (
            <Message key={message._id} message={message} />
          ))}
      </div>
    </div>
  );
};
export default ChatModal;
