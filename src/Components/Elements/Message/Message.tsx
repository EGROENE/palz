import { TMessage, TUser } from "../../../types";
import { useUserContext } from "../../../Hooks/useUserContext";

const Message = ({ message }: { message: TMessage }) => {
  const { currentUser, allUsers } = useUserContext();

  const sender: TUser | undefined = allUsers
    ? allUsers.filter((user) => user._id === message.sender)[0]
    : undefined;

  return (
    <div
      className={
        message.sender === currentUser?._id ? "message sent" : "message received"
      }
    >
      <img src={sender ? sender.profileImage : ""} />
      <p>{message.content}</p>
    </div>
  );
};
export default Message;
