import { useState, useEffect } from "react";
import { useChatContext } from "../../../Hooks/useChatContext";
import Message from "../Message/Message";
import { TThemeColor } from "../../../types";
import Tab from "../Tab/Tab";
import SearchAndDropdownList from "../SearchAndDropdownList/SearchAndDropdownList";
import { useUserContext } from "../../../Hooks/useUserContext";
import DropdownChecklist from "../DropdownChecklist/DropdownChecklist";

const ChatModal = () => {
  const { allOtherUsers, currentUser } = useUserContext();
  const {
    setShowChatModal,
    setCurrentChat,
    currentChat,
    getChatMembers,
    chatMembersSearchQuery,
    setChatMembersSearchQuery,
    showPotentialChatMembers,
    setShowPotentialChatMembers,
    getCurrentOtherUserFriends,
    setPotentialChatMembers,
    usersToAddToChat,
    handleRemoveUserFromChat,
    handleAddRemoveUserFromChat,
    potentialChatMembers,
    setUsersToAddToChat,
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
    handleSearchChatMembersInput,
    handleChatNameInput,
    chatName,
    chatNameError,
    setChatName,
    setChatNameError,
  } = useChatContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [showMembers, setShowMembers] = useState<boolean>(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);

  const [inputMessage, setInputMessage] = useState<string>("");

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
        const userIsNotAlreadyInCurrentChat: boolean =
          otherUser._id && currentChat && currentChat.members.includes(otherUser._id)
            ? false
            : true;

        const currentUserIsBlocked: boolean =
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
          userIsNotAlreadyInCurrentChat &&
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

  const handleCancelAddingChatMembers = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLElement, MouseEvent>
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
    initiatePotentialChatMembers();
    setShowAddMemberModal(false);
    setShowPotentialChatMembers(false);
  };

  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={(e) => {
          setShowChatModal(false);
          setCurrentChat(null);
          if (showAddMemberModal) {
            handleCancelAddingChatMembers(e);
          }
        }}
        className="fas fa-times close-module-icon"
      ></i>
      <div style={{ border: `3px solid ${randomColor}` }} className="chat-container">
        {showAddMemberModal && (
          <div className="add-members-modal">
            <i
              title="Close"
              onClick={(e) => {
                handleCancelAddingChatMembers(e);
              }}
              className="fas fa-times close-module-icon"
            ></i>
            <header>Add people to chat:</header>
            {usersToAddToChat.length > 0 && (
              <div className="added-user-tab-container">
                {usersToAddToChat.map((user) => (
                  <Tab
                    key={user._id}
                    info={user}
                    removeHandler={() => handleRemoveUserFromChat(user)}
                    randomColor={randomColor}
                    userMayNotDelete={false}
                  />
                ))}
              </div>
            )}
            <SearchAndDropdownList
              name="add-member-to-chat"
              id="add-member-to-chat"
              placeholder="Search users by username, first/last names"
              query={chatMembersSearchQuery}
              clearQueryOnClick={() => {
                setChatMembersSearchQuery("");
                initiatePotentialChatMembers();
              }}
              randomColor={randomColor}
              showList={showPotentialChatMembers}
              setShowList={setShowPotentialChatMembers}
              inputOnChange={(e) =>
                handleSearchChatMembersInput(
                  e,
                  showPotentialChatMembers,
                  setShowPotentialChatMembers,
                  allOtherUsers,
                  initiatePotentialChatMembers
                )
              }
              dropdownChecklist={
                <DropdownChecklist
                  usedFor="potential-additional-chat-members"
                  action={handleAddRemoveUserFromChat}
                  actionEventParamNeeded={false}
                  displayedItemsArray={potentialChatMembers}
                  storageArray={usersToAddToChat.map((user) => user._id)}
                  setStorageArray={setUsersToAddToChat}
                  displayedItemsCount={numberOfPotentialChatMembersDisplayed}
                  setDisplayedItemsCount={setNumberOfPotentialChatMembersDisplayed}
                  displayedItemsCountInterval={10}
                />
              }
            />
            {usersToAddToChat.length > 0 && (
              <>
                <header>Choose group name (optional)</header>
                <input
                  value={chatName}
                  onChange={(e) => handleChatNameInput(e)}
                  type="text"
                  placeholder="Choose a name for the group chat"
                ></input>
                {chatNameError !== "" && <p>{chatNameError}</p>}
              </>
            )}
          </div>
        )}
        {!showAddMemberModal && (
          <div
            style={
              !showMembers
                ? { borderBottom: `2px solid ${randomColor}`, height: "unset" }
                : {
                    borderBottom: `2px solid ${randomColor}`,
                    height: "17%",
                    paddingBottom: "1rem",
                  }
            }
            className="members-panel"
          >
            {currentChat && currentChat.chatName && currentChat.chatName !== "" && (
              <p>{currentChat.chatName}</p>
            )}
            {!showMembers && <p onClick={() => setShowMembers(true)}>Show members</p>}
            {currentChat && showMembers && (
              <>
                <div className="members-container">
                  {getChatMembers(currentChat.members).map((member) => (
                    <Tab
                      userMayNotDelete={true}
                      key={member._id}
                      randomColor={randomColor}
                      info={member}
                    />
                  ))}
                  <i
                    onClick={() => setShowAddMemberModal(true)}
                    className="fas fa-plus"
                  ></i>
                </div>
                <p onClick={() => setShowMembers(false)}>Hide members</p>
              </>
            )}
          </div>
        )}
        {currentChat && !showAddMemberModal && (
          <div className="messages-container">
            {currentChat.messages.map((message) => (
              <Message
                key={message._id}
                message={message}
                randomColor={randomColor ? randomColor : undefined}
              />
            ))}
          </div>
        )}
        {!showAddMemberModal && (
          <div className="message-input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message"
              maxLength={10000}
            ></textarea>
            <i
              style={
                randomColor === "var(--primary-color)"
                  ? { backgroundColor: `${randomColor}`, color: "black" }
                  : { backgroundColor: `${randomColor}`, color: "white" }
              }
              className="fas fa-paper-plane"
            ></i>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatModal;
