import { TMessage, TThemeColor, TUser } from "../../../types";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useMainContext } from "../../../Hooks/useMainContext";

const Message = ({
  message,
  randomColor,
}: {
  message: TMessage;
  randomColor?: TThemeColor;
}) => {
  const { theme } = useMainContext();
  const { currentUser, allUsers } = useUserContext();

  const sender: TUser | undefined = allUsers
    ? allUsers.filter((user) => user._id === message.sender)[0]
    : undefined;

  const dateOfMessage = new Date(message.timeSent);

  return (
    <div
      style={
        sender && currentUser && sender._id === currentUser._id
          ? { backgroundColor: "var(--background-color" }
          : { backgroundColor: randomColor }
      }
      className={
        message.sender === currentUser?._id ? "message sent" : "message received"
      }
    >
      <img src={sender ? sender.profileImage : ""} />
      <div className="message-content">
        <p
          style={
            (randomColor === "var(--primary-color)" &&
              currentUser &&
              message.sender !== currentUser._id) ||
            (sender && currentUser && sender._id === currentUser._id && theme === "light")
              ? { color: "black" }
              : { color: "white" }
          }
        >
          {message.content}
        </p>
        <p
          style={
            (randomColor === "var(--primary-color)" &&
              currentUser &&
              message.sender !== currentUser._id) ||
            (sender && currentUser && sender._id !== currentUser._id)
              ? { color: "rgb(68, 67, 67)" }
              : { color: "darkgray" }
          }
          className="message-sent-info"
        >{`Sent ${dateOfMessage.toLocaleDateString()} at ${dateOfMessage.toLocaleTimeString(
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
