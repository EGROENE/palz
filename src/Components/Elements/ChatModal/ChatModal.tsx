import { useChatContext } from "../../../Hooks/useChatContext";
import Message from "../Message/Message";

const ChatModal = () => {
  const { setShowChatModal, setCurrentChat, currentChat } = useChatContext();

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
      <div className="messages-container">
        {currentChat &&
          currentChat.messages.map((message) => (
            <Message key={message._id} message={message} />
          ))}
      </div>
    </div>
  );
};
export default ChatModal;
