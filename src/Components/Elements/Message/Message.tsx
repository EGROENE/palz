import { TMessage, TUser } from "../../../types";
import { useUserContext } from "../../../Hooks/useUserContext";

const Message = ({ message }: { message: TMessage }) => {
  const { currentUser, allUsers } = useUserContext();

  const sender: TUser | undefined = allUsers
    ? allUsers.filter((user) => user._id === message.sender)[0]
    : undefined;

  const dateOfMessage = new Date(message.timeSent);

  return (
    <div
      className={
        message.sender === currentUser?._id ? "message sent" : "message received"
      }
    >
      <img src={sender ? sender.profileImage : ""} />
      <div className="message-content">
        <p>{message.content}</p>
        <p className="message-sent-info">{`Sent ${dateOfMessage.toLocaleDateString()} at ${dateOfMessage.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}`}</p>
      </div>
    </div>
  );
};
export default Message;
