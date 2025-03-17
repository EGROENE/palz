import { TMessage, TThemeColor, TUser } from "../../../types";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useChatContext } from "../../../Hooks/useChatContext";
import { useState } from "react";
import defaultProfileImage from "../../../assets/default-profile-pic.jpg";

const Message = ({
  message,
  randomColor,
}: {
  message: TMessage;
  randomColor?: TThemeColor;
}) => {
  const { theme } = useMainContext();
  const { currentUser, allUsers } = useUserContext();
  const { handleDeleteMessage, currentChat, startEditingMessage } = useChatContext();

  const [showAreYouSureYouWantToDeleteMessage, setShowAreYouSureYouWantToDeleteMessage] =
    useState<boolean>(false);

  const sender: TUser | undefined = allUsers
    ? allUsers.filter((user) => user._id === message.sender)[0]
    : undefined;

  const dateOfSend = new Date(message.timeSent);

  const dateOfEdit: Date | null = message.timeEdited
    ? new Date(message.timeEdited)
    : null;

  const getComponentInlineStyling = () => {
    if (!showAreYouSureYouWantToDeleteMessage) {
      if (sender && currentUser && sender._id === currentUser._id) {
        return {
          backgroundColor: "var(--background-color)",
        };
      } else {
        if (randomColor === "var(--primary-color)") {
          return { backgroundColor: randomColor, color: "black" };
        }
        return { backgroundColor: randomColor };
      }
    }
    return {
      backgroundColor: randomColor,
      flexDirection: undefined,
      justifyContent: "center",
    };
  };
  const componentInlineStyling = getComponentInlineStyling();

  return (
    <div
      style={componentInlineStyling}
      className={
        message.sender === currentUser?._id ? "message sent" : "message received"
      }
    >
      {!showAreYouSureYouWantToDeleteMessage && (
        <>
          <img
            src={
              sender && sender.profileImage !== ""
                ? sender.profileImage
                : defaultProfileImage
            }
          />
          <div className="message-content">
            <p
              style={
                (randomColor === "var(--primary-color)" &&
                  currentUser &&
                  message.sender !== currentUser._id) ||
                (sender &&
                  currentUser &&
                  sender._id === currentUser._id &&
                  theme === "light")
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
                (sender && currentUser && sender._id !== currentUser._id) ||
                !sender
                  ? { color: "rgb(68, 67, 67)" }
                  : { color: "darkgray" }
              }
              className="message-sent-info"
            >{`Sent ${dateOfSend.toLocaleDateString()} at ${dateOfSend.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}`}</p>
            {dateOfEdit && (
              <p
                style={
                  (randomColor === "var(--primary-color)" &&
                    currentUser &&
                    message.sender !== currentUser._id) ||
                  (sender && currentUser && sender._id !== currentUser._id) ||
                  !sender
                    ? { color: "rgb(68, 67, 67)" }
                    : { color: "darkgray" }
                }
                className="message-sent-info"
              >{`Edited ${dateOfEdit.toLocaleDateString()} at ${dateOfEdit.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}`}</p>
            )}
            <p
              className="message-sent-info"
              style={
                (randomColor === "var(--primary-color)" &&
                  currentUser &&
                  message.sender !== currentUser._id) ||
                (sender && currentUser && sender._id !== currentUser._id) ||
                !sender
                  ? { color: "rgb(68, 67, 67)" }
                  : { color: "darkgray" }
              }
            >
              {sender &&
              sender._id &&
              currentChat &&
              currentChat.members.includes(sender._id)
                ? `${sender.firstName} ${sender.lastName}`
                : "Deleted User"}
            </p>
            {currentUser && message.sender === currentUser._id && (
              <p className="message-sent-info">
                <span
                  onClick={() => startEditingMessage(message)}
                  style={{ color: randomColor }}
                  id="edit-msg-btn"
                >
                  Edit
                </span>
                <span
                  onClick={() => setShowAreYouSureYouWantToDeleteMessage(true)}
                  id="delete-msg-btn"
                >
                  Delete
                </span>
              </p>
            )}
          </div>
        </>
      )}
      {showAreYouSureYouWantToDeleteMessage && (
        <div className="delete-message-modal">
          <header
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
          >
            Delete message?
            <div className="delete-message-btns-container">
              <button onClick={() => setShowAreYouSureYouWantToDeleteMessage(false)}>
                Cancel
              </button>
              <button
                onClick={() =>
                  currentChat && handleDeleteMessage(currentChat, message._id)
                }
              >
                Delete
              </button>
            </div>
          </header>
        </div>
      )}
    </div>
  );
};
export default Message;
