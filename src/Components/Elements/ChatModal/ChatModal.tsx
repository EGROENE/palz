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
import ChatModalTwoOptions from "../ChatModalTwoOptions/ChatModalTwoOptions";

const ChatModal = () => {
  const { allOtherUsers, currentUser } = useUserContext();
  const {
    startConversation,
    setMessageBeingEdited,
    setShowAreYouSureYouWantToLeaveChat,
    showMembers,
    setShowMembers,
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
    handleAddAdminToChat,
    setShowAreYouSureYouWantToRemoveYourselfAsAdmin,
    showAreYouSureYouWantToRemoveYourselfAsAdmin,
    handleRemoveAdminFromChat,
    setShowAreYouSureYouWantToDeleteChat,
    messageBeingEdited,
    cancelEditingMessage,
    handleSaveEditedMessage,
    handleDeleteChat,
    showAreYouSureYouWantToDeleteChat,
    showAreYouSureYouWantToLeaveChat,
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
        (!Methods.arraysAreIdentical(
          Object.values(currentChat),
          Object.values(updatedChat)
        ) ||
          !Methods.arraysAreIdentical(
            Object.values(updatedChat.messages.map((message) => message.content)),
            Object.values(currentChat.messages.map((message) => message.content))
          ));
      if (chatWasUpdated) {
        setCurrentChat(updatedChat);
      }
    }
  }, [fetchChatsQuery.data]);

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

  const getButtonOneHandler = (listedChatMember: TUser) => {
    const listedChatMemberIsAdmin: boolean =
      currentChat &&
      currentChat.admins &&
      listedChatMember._id &&
      currentChat.admins.includes(listedChatMember._id)
        ? true
        : false;

    const currentUserIsAdmin: boolean =
      currentChat &&
      currentChat.admins &&
      currentUser &&
      currentUser._id &&
      currentChat.admins.includes(currentUser._id)
        ? true
        : false;

    /* 
    if LCM is fellow admin, or if LCM is admin, but currentUser isn't, or If neither LCM nor currentUser is admin, 'message' btn:
    */
    if (
      (listedChatMemberIsAdmin && currentUserIsAdmin) ||
      (listedChatMemberIsAdmin && !currentUserIsAdmin) ||
      (!listedChatMemberIsAdmin && !currentUserIsAdmin)
    ) {
      return () => startConversation(listedChatMember);
    }

    // if currentUser is admin, but LCM isn't, 'add as admin' btn:
    if (currentUserIsAdmin && !listedChatMemberIsAdmin && currentChat) {
      return () => handleAddAdminToChat(listedChatMember, currentChat);
    }
  };

  const getButtonOneText = (listedChatMember: TUser): string => {
    const listedChatMemberIsAdmin: boolean =
      currentChat &&
      currentChat.admins &&
      listedChatMember._id &&
      currentChat.admins.includes(listedChatMember._id)
        ? true
        : false;

    const currentUserIsAdmin: boolean =
      currentChat &&
      currentChat.admins &&
      currentUser &&
      currentUser._id &&
      currentChat.admins.includes(currentUser._id)
        ? true
        : false;

    /* 
    if LCM is fellow admin, or if LCM is admin, but currentUser isn't, or If neither LCM nor currentUser is admin, 'message' btn:
    */
    if (
      (listedChatMemberIsAdmin && currentUserIsAdmin) ||
      (listedChatMemberIsAdmin && !currentUserIsAdmin) ||
      (!listedChatMemberIsAdmin && !currentUserIsAdmin)
    ) {
      return "Message";
    }

    // if currentUser is admin, but LCM isn't, 'add as admin' btn:
    return "Add Admin";
  };

  let usersToAdd: TUser[] = [];
  for (const userID of usersToAddToChat) {
    for (const otherUser of allOtherUsers) {
      if (otherUser._id === userID) {
        usersToAdd.push(otherUser);
      }
    }
  }

  const userMayDeleteChat: boolean =
    currentChat &&
    currentChat.admins &&
    currentUser &&
    currentUser._id &&
    (currentChat.admins.includes(currentUser._id) ||
      (currentChat.members.includes(currentUser._id) && currentChat.members.length === 2))
      ? true
      : false;

  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={(e) => {
          if (showAreYouSureYouWantToDeleteChat) {
            setShowAreYouSureYouWantToDeleteChat(false);
          }
          setShowChatModal(false);
          setCurrentChat(null);
          setAreNewMessages(false);
          if (messageBeingEdited) {
            setMessageBeingEdited(undefined);
            setInputMessage("");
          }
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
          {
            <div className="members-panel">
              {currentChat && currentChat.chatName && currentChat.chatName !== "" && (
                <header>{currentChat.chatName}</header>
              )}
              {currentChat && showMembers && (
                <div className="members-container">
                  {!showAreYouSureYouWantToRemoveYourselfAsAdmin && (
                    <i
                      title="Close"
                      onClick={() => setShowMembers(false)}
                      className="fas fa-times"
                    ></i>
                  )}
                  {!showAreYouSureYouWantToRemoveYourselfAsAdmin && (
                    <div className="members-container-options">
                      <button
                        style={{ color: randomColor }}
                        onClick={() => setShowAddMemberModal(true)}
                      >
                        Add Members
                      </button>

                      {currentChat.admins &&
                        currentUser &&
                        currentUser._id &&
                        currentChat.admins.includes(currentUser._id) && (
                          <button
                            style={{ color: randomColor }}
                            onClick={() =>
                              setShowAreYouSureYouWantToRemoveYourselfAsAdmin(true)
                            }
                          >
                            Remove yourself as admin
                          </button>
                        )}
                    </div>
                  )}
                  {showAreYouSureYouWantToRemoveYourselfAsAdmin && (
                    <ChatModalTwoOptions
                      randomColor={randomColor}
                      header="Are you sure you want to remove yourself as admin?"
                      subheader="You will need to ask another admin to be re-added as admin."
                      buttonOneText="Cancel"
                      buttonOneHandler={() =>
                        setShowAreYouSureYouWantToRemoveYourselfAsAdmin(false)
                      }
                      buttonTwoText="Confirm"
                      buttonTwoHandler={() => {
                        if (currentUser && currentChat) {
                          setShowAreYouSureYouWantToRemoveYourselfAsAdmin(false);
                          handleRemoveAdminFromChat(currentUser, currentChat);
                        }
                      }}
                    />
                  )}
                  {getChatMembers(currentChat.members).map((member) => (
                    <ListedUser
                      key={member._id}
                      objectLink={`/users/${member?.username}`}
                      user={member}
                      title={
                        currentChat &&
                        currentChat.admins &&
                        member._id &&
                        currentChat.admins.includes(member._id)
                          ? "Admin"
                          : undefined
                      }
                      renderButtonOne={true}
                      buttonOneText={getButtonOneText(member)}
                      buttonOneHandler={getButtonOneHandler(member)}
                      renderButtonTwo={
                        currentUser &&
                        currentUser._id &&
                        currentChat &&
                        currentChat.admins &&
                        member._id &&
                        !currentChat.admins.includes(member._id) &&
                        currentChat.admins.includes(currentUser._id)
                          ? true
                          : false
                      }
                      buttonTwoHandler={
                        currentUser &&
                        currentUser._id &&
                        currentChat &&
                        currentChat.admins &&
                        member._id &&
                        !currentChat.admins.includes(member._id) &&
                        currentChat.admins.includes(currentUser._id)
                          ? handleRemoveUserFromChat
                          : undefined
                      }
                      buttonTwoHandlerParams={
                        currentUser &&
                        currentUser._id &&
                        currentChat &&
                        currentChat.admins &&
                        member._id &&
                        !currentChat.admins.includes(member._id) &&
                        currentChat.admins.includes(currentUser._id)
                          ? [member, currentChat]
                          : undefined
                      }
                      buttonTwoText="Remove"
                    />
                  ))}
                </div>
              )}
            </div>
          }
        </div>
      )}
      {!showAddMemberModal && !showMembers && (
        <div style={{ border: `3px solid ${randomColor}` }} className="chat-container">
          {!showMembers && currentChat && currentChat.members.length > 2 && (
            <div
              className="show-members"
              style={{ borderBottom: `3px solid ${randomColor}` }}
            >
              <header onClick={() => setShowMembers(true)}>Show members</header>
              <header onClick={() => setShowAreYouSureYouWantToLeaveChat(true)}>
                Leave chat
              </header>
              {userMayDeleteChat && (
                <header
                  style={{ color: "tomato" }}
                  onClick={() => setShowAreYouSureYouWantToDeleteChat(true)}
                >
                  Delete chat
                </header>
              )}
            </div>
          )}
          {otherChatMember && (
            <div className="chat-header-single-other-member">
              <div>
                <img src={otherChatMember.profileImage} />
                <header>{`${otherChatMember.firstName} ${otherChatMember.lastName}`}</header>
              </div>
              <i
                onClick={() => setShowAreYouSureYouWantToDeleteChat(true)}
                title="Delete Chat"
                style={{ color: randomColor, margin: "0 2rem", fontSize: "1.25rem" }}
                className="fas fa-trash-alt"
              ></i>
            </div>
          )}
          {currentChat && (
            <div
              style={
                showAreYouSureYouWantToDeleteChat || showAreYouSureYouWantToLeaveChat
                  ? { display: "flex", alignItems: "center", justifyContent: "center" }
                  : undefined
              }
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
              {!showAreYouSureYouWantToDeleteChat &&
                !showAreYouSureYouWantToLeaveChat &&
                currentChat.messages.map((message) => (
                  <Message
                    key={message._id.toString()}
                    message={message}
                    randomColor={randomColor ? randomColor : undefined}
                  />
                ))}
              {showAreYouSureYouWantToDeleteChat && !showAreYouSureYouWantToLeaveChat && (
                <ChatModalTwoOptions
                  randomColor={randomColor}
                  header="Are you sure you want to delete this chat?"
                  subheader="Please understand that all messages will be deleted. This is irreversible."
                  buttonOneText="Cancel"
                  buttonOneHandler={() => setShowAreYouSureYouWantToDeleteChat(false)}
                  buttonTwoText="Delete"
                  buttonTwoHandler={
                    currentChat
                      ? () => handleDeleteChat(currentChat._id.toString())
                      : undefined
                  }
                />
              )}
              {showAreYouSureYouWantToLeaveChat && !showAreYouSureYouWantToDeleteChat && (
                <ChatModalTwoOptions
                  randomColor={randomColor}
                  header="Are you sure you want to leave this chat?"
                  buttonOneText="Cancel"
                  buttonOneHandler={() => setShowAreYouSureYouWantToLeaveChat(false)}
                  buttonTwoText="Leave"
                  buttonTwoHandler={
                    currentUser && currentChat
                      ? () => handleRemoveUserFromChat(currentUser, currentChat)
                      : undefined
                  }
                />
              )}
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
              {!messageBeingEdited ? (
                <button
                  id="send-message-button"
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
              ) : (
                <div className="edit-message-buttons-container">
                  <button
                    onClick={
                      currentChat
                        ? () => handleSaveEditedMessage(currentChat, messageBeingEdited)
                        : undefined
                    }
                    disabled={inputMessage === messageBeingEdited.content}
                    style={
                      randomColor === "var(--primary-color)"
                        ? { backgroundColor: `${randomColor}`, color: "black" }
                        : { backgroundColor: `${randomColor}`, color: "white" }
                    }
                  >
                    Update
                  </button>
                  <button onClick={() => cancelEditingMessage()}>Cancel</button>
                </div>
              )}
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
            <header style={{ marginBottom: "1rem" }}>Add people to chat:</header>
            {usersToAddToChat.length > 0 && (
              <div className="added-user-tab-container">
                {usersToAdd.map((user) => (
                  <Tab
                    key={`${user._id}-dropdown-item`}
                    info={user}
                    removeHandler={handleAddRemoveUserFromChat}
                    removeHandlerNeedsEventParam={false}
                    removeHandlerParams={[
                      user,
                      usersToAddToChat,
                      setUsersToAddToChat,
                      currentChat,
                    ]}
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
                  storageArray={usersToAddToChat}
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
                      usersToAdd.map((user) => (user && user._id ? user._id : "")),
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
