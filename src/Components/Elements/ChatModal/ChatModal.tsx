import { useState, useEffect, useRef } from "react";
import { useChatContext } from "../../../Hooks/useChatContext";
import Message from "../Message/Message";
import { TThemeColor, TUser } from "../../../types";
import Tab from "../Tab/Tab";
import SearchAndDropdownList from "../SearchAndDropdownList/SearchAndDropdownList";
import { useUserContext } from "../../../Hooks/useUserContext";
import DropdownChecklist from "../DropdownChecklist/DropdownChecklist";
import Methods from "../../../methods";
import ListedUser from "../ListedUser/ListedUser";

const ChatModal = () => {
  const { allOtherUsers, currentUser } = useUserContext();
  const {
    handleAddMultipleUsersToChat,
    areNewMessages,
    setAreNewMessages,
    getNumberOfUnreadMessagesInChat,
    showChatModal,
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
    handleSendMessage,
    setChatNameError,
    inputMessage,
    setInputMessage,
    markMessagesAsRead,
    fetchChatsQuery,
    showAddMemberModal,
    setShowAddMemberModal,
  } = useChatContext();

  /* 
  Update currentChat whenever fetchChatsQuery.data changes & when chat in userChats w/ matching _id to currentChat is not identical to currentChat:
  */
  useEffect(() => {
    const userChats = fetchChatsQuery.data;
    if (currentChat && userChats && showChatModal) {
      const updatedChat = userChats.filter(
        (userChat) => userChat._id === currentChat._id
      )[0];
      // compare currentChat & updatedChat; if not the same, setCurrentChat(updatedChat)
      const chatWasUpdated =
        updatedChat &&
        !Methods.arraysAreIdentical(
          Object.values(currentChat),
          Object.values(updatedChat)
        );
      if (chatWasUpdated) {
        setCurrentChat(updatedChat);
      }
    }
  }, [fetchChatsQuery.data]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [showMembers, setShowMembers] = useState<boolean>(false);

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

    setTimeout(() => scrollToLatestMessage(), 500);
    //scrollToLatestMessage();
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

  const [otherChatMember, setOtherChatMember] = useState<TUser | undefined>(undefined);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToLatestMessage = () => {
    // Mark latest message as read:
    if (currentChat && areNewMessages) {
      setAreNewMessages(false);
      markMessagesAsRead(currentChat);
    }

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    //messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentChat) {
      const updatedAreNewMessages = getNumberOfUnreadMessagesInChat(currentChat) !== 0;
      setAreNewMessages(updatedAreNewMessages);

      const scrollBottom =
        messagesContainerRef.current && messagesContainerScrollHeight
          ? messagesContainerScrollHeight -
            messagesContainerRef.current.scrollTop -
            messagesContainerClientHeight
          : 0;

      if (scrollBottom === 0 && currentChat && updatedAreNewMessages) {
        markMessagesAsRead(currentChat);
      }
    }

    if (
      currentUser &&
      currentUser._id &&
      currentChat &&
      currentChat.messages.length > 0 &&
      currentChat.messages[currentChat.messages.length - 1].sender === currentUser._id
    ) {
      scrollToLatestMessage();
    }

    setOtherChatMember(
      currentChat && currentUser && currentChat.members.length === 2
        ? getChatMembers(currentChat.members).filter(
            (member) => member._id !== currentUser._id
          )[0]
        : undefined
    );
  }, [currentChat, fetchChatsQuery.data]);

  let messagesContainerScrollHeight: number = messagesContainerRef.current
    ? messagesContainerRef.current.scrollHeight
    : 0;

  let messagesContainerClientHeight: number = messagesContainerRef.current
    ? messagesContainerRef.current.clientHeight
    : 0;

  const [messagesContainerScrollBottom, setMessagesContainerScrollBottom] =
    useState<number>(
      messagesContainerRef.current && messagesContainerScrollHeight
        ? messagesContainerScrollHeight -
            messagesContainerRef.current.scrollTop -
            messagesContainerClientHeight
        : 0
    );

  const handleMessageContainerScroll = () => {
    messagesContainerScrollHeight = messagesContainerRef.current
      ? messagesContainerRef.current.scrollHeight
      : 0;

    messagesContainerClientHeight = messagesContainerRef.current
      ? messagesContainerRef.current.clientHeight
      : 0;

    const scrollBottom =
      messagesContainerRef.current && messagesContainerScrollHeight
        ? messagesContainerScrollHeight -
          messagesContainerRef.current.scrollTop -
          messagesContainerClientHeight
        : 0;

    if (scrollBottom === 0 && currentChat && areNewMessages) {
      markMessagesAsRead(currentChat);
    }

    setMessagesContainerScrollBottom(scrollBottom);
  };

  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={(e) => {
          setShowChatModal(false);
          setCurrentChat(null);
          setAreNewMessages(false);
          if (showAddMemberModal) {
            handleCancelAddingChatMembers(e);
          }
        }}
        className="fas fa-times close-module-icon"
      ></i>
      {!showAddMemberModal && showMembers && (
        <div
          style={
            !showMembers
              ? {
                  borderBottom: `2px solid ${randomColor}`,
                  height: "unset",
                  border: `3px solid ${randomColor}`,
                }
              : {
                  borderBottom: `2px solid ${randomColor}`,
                  paddingBottom: "1rem",
                  border: `3px solid ${randomColor}`,
                }
          }
          className="members-panel-container"
        >
          <div className="members-panel">
            {currentChat && currentChat.chatName && currentChat.chatName !== "" && (
              <header>{currentChat.chatName}</header>
            )}
            {currentChat && showMembers && (
              <div className="members-container">
                <div>
                  <button onClick={() => setShowMembers(false)}>Hide members</button>
                  <button onClick={() => setShowAddMemberModal(true)}>Add</button>
                </div>
                {getChatMembers(currentChat.members).map((member) => (
                  <ListedUser
                    key={member._id}
                    renderButtonOne={true}
                    user={member}
                    buttonOneText="Message"
                    renderButtonTwo={
                      currentUser && currentUser._id && currentChat && currentChat.admins
                        ? currentChat.admins.includes(currentUser._id)
                        : false
                    }
                    buttonTwoText="Remove"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {!showAddMemberModal && !showMembers && (
        <div style={{ border: `3px solid ${randomColor}` }} className="chat-container">
          {!showMembers && currentChat && currentChat.members.length > 2 && (
            <header
              className="show-members"
              style={{ borderBottom: `3px solid ${randomColor}` }}
              onClick={() => setShowMembers(true)}
            >
              Show members
            </header>
          )}
          {otherChatMember && (
            <div className="chat-header-single-other-member">
              <img src={otherChatMember.profileImage} />
              <header>{`${otherChatMember.firstName} ${otherChatMember.lastName}`}</header>
            </div>
          )}
          {currentChat && (
            <div
              ref={messagesContainerRef}
              className="messages-container"
              onScroll={() => handleMessageContainerScroll()}
            >
              {(messagesContainerScrollBottom > 0 || areNewMessages) && (
                <div
                  style={areNewMessages ? { top: "67%" } : { top: "80%" }}
                  className="message-indicators-container"
                >
                  {areNewMessages &&
                    messagesContainerScrollHeight > messagesContainerClientHeight && (
                      <span
                        className="new-messages-indicator"
                        style={
                          randomColor === "var(--primary-color)"
                            ? { backgroundColor: `${randomColor}`, color: "black" }
                            : { backgroundColor: `${randomColor}`, color: "white" }
                        }
                      >
                        New
                      </span>
                    )}
                  {messagesContainerScrollBottom > 0 && (
                    <i
                      onClick={() => scrollToLatestMessage()}
                      id="to-latest-message-button"
                      className="fas fa-chevron-down"
                      style={
                        randomColor === "var(--primary-color)"
                          ? { backgroundColor: `${randomColor}`, color: "black" }
                          : { backgroundColor: `${randomColor}`, color: "white" }
                      }
                    ></i>
                  )}
                </div>
              )}
              {currentChat.messages.map((message) => (
                <Message
                  key={message._id.toString()}
                  message={message}
                  randomColor={randomColor ? randomColor : undefined}
                />
              ))}
            </div>
          )}
          {
            <div className="message-input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type message"
                maxLength={10000}
              ></textarea>
              <button
                disabled={inputMessage.replace(/\s+/g, "") === ""}
                onClick={() =>
                  currentChat && handleSendMessage(currentChat, inputMessage)
                }
                style={
                  randomColor === "var(--primary-color)"
                    ? { backgroundColor: `${randomColor}`, color: "black" }
                    : { backgroundColor: `${randomColor}`, color: "white" }
                }
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          }
        </div>
      )}
      {showAddMemberModal && (
        <div
          style={{ border: `3px solid ${randomColor}` }}
          className="add-members-modal-container"
        >
          <div className="add-members-modal">
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
            <div className="create-new-chat-modal-buttons">
              <button
                onClick={(e) => {
                  handleCancelAddingChatMembers(e);
                }}
                id="cancel"
              >
                Cancel
              </button>
              <button
                disabled={usersToAddToChat.length === 0}
                style={
                  randomColor === "var(--primary-color)"
                    ? { backgroundColor: `${randomColor}`, color: "black" }
                    : { backgroundColor: `${randomColor}`, color: "white" }
                }
                onClick={() => {
                  if (currentChat) {
                    handleAddMultipleUsersToChat(
                      usersToAddToChat.map((user) => (user && user._id ? user._id : "")),
                      currentChat
                    );
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatModal;
