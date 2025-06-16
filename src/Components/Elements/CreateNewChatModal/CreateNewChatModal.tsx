import { useState, useEffect } from "react";
import { TThemeColor } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import DropdownChecklist from "../DropdownChecklist/DropdownChecklist";
import { useUserContext } from "../../../Hooks/useUserContext";
import Tab from "../Tab/Tab";
import SearchAndDropdownList from "../SearchAndDropdownList/SearchAndDropdownList";
import mongoose from "mongoose";
import Methods from "../../../methods";

// add members
// name chat (if over 1 other member)
// upon click of 'create', make this modal disappear, then render ChatModal (set currentChat to newly created chat)
// in chat preview, if no messages, show NO MESSAGES YET if no messages exist in chat

const CreateNewChatModal = () => {
  const { currentUser, fetchAllVisibleOtherUsersQuery } = useUserContext();

  const visibleOtherUsers = fetchAllVisibleOtherUsersQuery.data;

  const {
    admins,
    handleCreateChat,
    setShowCreateNewChatModal,
    handleAddRemoveUserFromChat,
    usersToAddToChat,
    setUsersToAddToChat,
    handleRemoveUserFromChat,
    chatName,
    setChatName,
    chatNameError,
    setChatNameError,
    showPotentialChatMembers,
    setShowPotentialChatMembers,
    potentialChatMembers,
    chatMembersSearchQuery,
    setChatMembersSearchQuery,
    handleChatNameInput,
    handleSearchChatMembersInput,
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

  const handleCancelNewChatCreation = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLElement>
  ): void => {
    e.preventDefault();
    if (usersToAddToChat.length > 0) {
      setUsersToAddToChat([]);
    }
    if (chatMembersSearchQuery !== "") {
      setChatMembersSearchQuery("");
    }
    if (chatName !== "") {
      setChatName("");
    }
    if (chatNameError !== "") {
      setChatNameError("");
    }
    if (showPotentialChatMembers) {
      setShowPotentialChatMembers(false);
    }
    setShowCreateNewChatModal(false);
  };

  const chatCanBeCreated = chatNameError === "" && usersToAddToChat.length > 0;

  return (
    <div tabIndex={0} aria-hidden="false" className="modal-background">
      <i
        tabIndex={0}
        aria-hidden="false"
        title="Close"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCancelNewChatCreation(e);
          }
        }}
        onClick={(e) => handleCancelNewChatCreation(e)}
        className="fas fa-times close-module-icon"
      ></i>
      <div
        style={
          showPotentialChatMembers
            ? { border: `2px solid ${randomColor}`, overflowY: "scroll" }
            : { border: `2px solid ${randomColor}` }
        }
        className="create-new-chat"
      >
        <h1>New Chat</h1>
        <header>Add people to chat:</header>
        {usersToAddToChat.length > 0 && (
          <div className="added-user-tab-container">
            {usersToAddToChat.map((user) => (
              <Tab
                key={user._id?.toString()}
                info={user}
                removeHandler={handleRemoveUserFromChat}
                removeHandlerNeedsEventParam={false}
                removeHandlerParams={[user]}
                randomColor={randomColor}
                userMayNotDelete={false}
              />
            ))}
          </div>
        )}
        <SearchAndDropdownList
          name="chat-members-search"
          id="chat-members-search"
          randomColor={randomColor}
          inputOnChange={(e) => {
            if (visibleOtherUsers) {
              return handleSearchChatMembersInput(
                e,
                showPotentialChatMembers,
                setShowPotentialChatMembers,
                visibleOtherUsers,
                initiatePotentialChatMembers
              );
            }
          }}
          placeholder="Search users by username, first/last names"
          query={chatMembersSearchQuery}
          clearQueryOnClick={() => setChatMembersSearchQuery("")}
          showList={showPotentialChatMembers}
          setShowList={setShowPotentialChatMembers}
          dropdownChecklist={
            <DropdownChecklist
              usedFor="potential-chat-members"
              action={handleAddRemoveUserFromChat}
              actionEventParamNeeded={false}
              displayedItemsArray={potentialChatMembers}
              storageArray={usersToAddToChat}
              setStorageArray={setUsersToAddToChat}
            />
          }
        />
        {usersToAddToChat.length > 1 && (
          <>
            <header>Choose group name (optional)</header>
            <input
              inputMode="text"
              value={chatName ? chatName : ""}
              onChange={(e) => handleChatNameInput(e)}
              type="text"
              placeholder="Choose a name for the group chat"
            ></input>
            {chatNameError !== "" && <p>{chatNameError}</p>}
          </>
        )}
        <div className="create-new-chat-modal-buttons">
          <button onClick={(e) => handleCancelNewChatCreation(e)} id="cancel">
            Cancel
          </button>
          <button
            onClick={() => {
              handleCreateChat({
                _id: new mongoose.Types.ObjectId().toString(),
                members: usersToAddToChat,
                messages: [],
                chatName: chatName,
                chatType: usersToAddToChat.length > 2 ? "group" : "two-member",
                dateCreated: Date.now(),
                ...(usersToAddToChat.length >= 2 &&
                  currentUser &&
                  currentUser._id && {
                    admins: [Methods.getTBarebonesUser(currentUser)].concat(admins),
                  }),
              });
            }}
            disabled={!chatCanBeCreated}
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
          >
            Create Chat
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateNewChatModal;
