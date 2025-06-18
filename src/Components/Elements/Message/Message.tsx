import { TMessage, TThemeColor } from "../../../types";
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
  const { currentUser } = useUserContext();

  const { handleDeleteMessage, currentChat, startEditingMessage } = useChatContext();

  const [showAreYouSureYouWantToDeleteMessage, setShowAreYouSureYouWantToDeleteMessage] =
    useState<boolean>(false);

  const dateOfSend = new Date(message.timeSent);

  const dateOfEdit: Date | null = message.timeEdited
    ? new Date(message.timeEdited)
    : null;

  const getComponentInlineStyling = () => {
    if (!showAreYouSureYouWantToDeleteMessage) {
      if (message.sender && currentUser && message.sender._id === currentUser._id) {
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
        message.sender._id === currentUser?._id ? "message sent" : "message received"
      }
    >
      {!showAreYouSureYouWantToDeleteMessage && (
        <>
          <img
            src={
              message.sender && message.sender.profileImage !== ""
                ? message.sender.profileImage
                : defaultProfileImage
            }
          />
          <div className="message-content">
            <p
              style={
                (randomColor === "var(--primary-color)" &&
                  currentUser &&
                  message.sender._id !== currentUser._id) ||
                (message.sender &&
                  currentUser &&
                  message.sender._id === currentUser._id &&
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
                  message.sender._id !== currentUser._id) ||
                (message.sender &&
                  currentUser &&
                  message.sender._id !== currentUser._id) ||
                !message.sender
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
                    message.sender._id !== currentUser._id) ||
                  (message.sender &&
                    currentUser &&
                    message.sender._id !== currentUser._id) ||
                  !message.sender
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
                  message.sender._id !== currentUser._id) ||
                (message.sender &&
                  currentUser &&
                  message.sender._id !== currentUser._id) ||
                !message.sender
                  ? { color: "rgb(68, 67, 67)" }
                  : { color: "darkgray" }
              }
            >
              {message.sender &&
              message.sender._id &&
              currentChat &&
              currentChat.members
                .map((m) => m._id)
                .includes(message.sender._id?.toString())
                ? `${message.sender.firstName} ${message.sender.lastName}`
                : "Deleted User"}
            </p>
            {currentUser && message.sender._id === currentUser._id && (
              <p className="message-sent-info">
                <span
                  tabIndex={0}
                  aria-hidden="false"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      startEditingMessage(message);
                    }
                  }}
                  onClick={() => startEditingMessage(message)}
                  style={{ color: randomColor }}
                  id="edit-msg-btn"
                >
                  Edit
                </span>
                <span
                  tabIndex={0}
                  aria-hidden="false"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowAreYouSureYouWantToDeleteMessage(true);
                    }
                  }}
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
