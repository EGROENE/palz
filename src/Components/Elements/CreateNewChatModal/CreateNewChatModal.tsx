import { useState, useEffect } from "react";
import { TThemeColor, TUser } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import DropdownChecklist from "../DropdownChecklist/DropdownChecklist";
import { useUserContext } from "../../../Hooks/useUserContext";
import Tab from "../Tab/Tab";
import SearchAndDropdownList from "../SearchAndDropdownList/SearchAndDropdownList";
import mongoose from "mongoose";

// add members
// name chat (if over 1 other member)
// upon click of 'create', make this modal disappear, then render ChatModal (set currentChat to newly created chat)
// in chat preview, if no messages, show NO MESSAGES YET if no messages exist in chat

const CreateNewChatModal = () => {
  const { allOtherUsers, currentUser } = useUserContext();
  const {
    admins,
    handleCreateChat,
    setShowCreateNewChatModal,
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
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
    setPotentialChatMembers,
    chatMembersSearchQuery,
    setChatMembersSearchQuery,
    getCurrentOtherUserFriends,
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

  const initiatePotentialChatMembers = (): void => {
    setPotentialChatMembers(
      allOtherUsers.filter((otherUser) => {
        const currentUserIsBlocked =
          currentUser && currentUser._id
            ? otherUser.blockedUsers.includes(currentUser._id)
            : false;

        const currentUserIsFriendOfFriend: boolean =
          currentUser && currentUser._id
            ? getCurrentOtherUserFriends(otherUser).some(
                (otherUserFriend) =>
                  currentUser._id && otherUserFriend.friends.includes(currentUser._id)
              )
            : false;

        const currentUserIsFriend: boolean =
          currentUser && currentUser._id
            ? otherUser.friends.includes(currentUser._id)
            : false;

        if (
          !currentUserIsBlocked &&
          (otherUser.whoCanMessage === "anyone" ||
            (otherUser.whoCanMessage === "friends" && currentUserIsFriend) ||
            (otherUser.whoCanMessage === "friends of friends" &&
              currentUserIsFriendOfFriend))
        ) {
          return otherUser;
        }
      })
    );
  };

  useEffect(() => {
    initiatePotentialChatMembers();
  }, [usersToAddToChat]);

  const handleCancelNewChatCreation = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLElement>
  ): void => {
    e.preventDefault();
    initiatePotentialChatMembers();
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

  let usersToAdd: TUser[] = [];
  for (const userID of usersToAddToChat) {
    for (const otherUser of allOtherUsers) {
      if (otherUser._id === userID) {
        usersToAdd.push(otherUser);
      }
    }
  }

  return (
    <div tabIndex={0} className="modal-background">
      <i
        tabIndex={0}
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
            {usersToAdd.map((user) => (
              <Tab
                key={user._id}
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
          inputOnChange={(e) =>
            handleSearchChatMembersInput(
              e,
              showPotentialChatMembers,
              setShowPotentialChatMembers,
              allOtherUsers,
              initiatePotentialChatMembers
            )
          }
          placeholder="Search users by username, first/last names"
          query={chatMembersSearchQuery}
          clearQueryOnClick={() => {
            setChatMembersSearchQuery("");
            initiatePotentialChatMembers();
          }}
          showList={showPotentialChatMembers}
          setShowList={setShowPotentialChatMembers}
          dropdownChecklist={
            <DropdownChecklist
              usedFor="potential-chat-members"
              action={handleAddRemoveUserFromChat}
              actionEventParamNeeded={false}
              displayedItemsArray={potentialChatMembers}
              storageArray={usersToAdd.map((user) => user._id)}
              setStorageArray={setUsersToAddToChat}
              displayedItemsCount={numberOfPotentialChatMembersDisplayed}
              setDisplayedItemsCount={setNumberOfPotentialChatMembersDisplayed}
              displayedItemsCountInterval={10}
            />
          }
        />
        {usersToAddToChat.length > 1 && (
          <>
            <header>Choose group name (optional)</header>
            <input
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
              const userIDsToAddToChat = usersToAddToChat.concat(
                currentUser && currentUser._id ? currentUser._id : ""
              );
              handleCreateChat({
                _id: new mongoose.Types.ObjectId().toString(),
                members: userIDsToAddToChat,
                messages: [],
                chatName: chatName,
                chatType: userIDsToAddToChat.length > 2 ? "group" : "two-member",
                dateCreated: Date.now(),
                ...(usersToAddToChat.length >= 2 &&
                  currentUser &&
                  currentUser._id && { admins: [currentUser._id].concat(admins) }),
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
