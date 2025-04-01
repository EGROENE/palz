import { useChatContext } from "../../Hooks/useChatContext";
import { useState, useEffect } from "react";
import { TThemeColor } from "../../types";

const EditChatNameModal = () => {
  const {
    currentChat,
    chatName,
    setChatName,
    handleChatNameInput,
    chatNameError,
    setShowEditChatNameModal,
    handleUpdateChatName,
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

  const handleCancelEditChatName = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLElement>
  ): void => {
    e.preventDefault();
    setChatName(undefined);
    setShowEditChatNameModal(false);
  };

  return (
    <div tabIndex={0} className="modal-background">
      <i
        tabIndex={0}
        title="Close"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCancelEditChatName(e);
          }
        }}
        onClick={(e) => handleCancelEditChatName(e)}
        className="fas fa-times close-module-icon"
      ></i>
      <div className="edit-chat-name-modal-container">
        <header>
          {currentChat && currentChat.chatName
            ? "Change name of group chat"
            : "Add name to group chat"}
        </header>
        <input
          value={chatName ? chatName : ""}
          onChange={(e) => handleChatNameInput(e)}
          type="text"
          placeholder="Choose a name for the group chat"
        ></input>
        {chatNameError !== "" && <p>{chatNameError}</p>}
        <div className="create-new-chat-modal-buttons">
          <button onClick={(e) => handleCancelEditChatName(e)} id="cancel">
            Cancel
          </button>
          <button
            onClick={currentChat ? () => handleUpdateChatName(currentChat) : undefined}
            disabled={chatName === undefined || chatName.replace(/\s/g, "") === ""}
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
          >
            {currentChat && currentChat.chatName ? "Update Chat Name" : "Add Chat Name"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditChatNameModal;
