import { useState, useEffect } from "react";
import { TThemeColor, TUser } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import DropdownChecklist from "../DropdownChecklist/DropdownChecklist";
import { useUserContext } from "../../../Hooks/useUserContext";
import Tab from "../Tab/Tab";
import SearchAndDropdownList from "../SearchAndDropdownList/SearchAndDropdownList";

// add members
// name chat (if over 1 other member)
// upon click of 'create', make this modal disappear, then render ChatModal (set currentChat to newly created chat)
// in chat preview, if no messages, show NO MESSAGES YET if no messages exist in chat

const CreateNewChatModal = () => {
  const { allOtherUsers, currentUser, allUsers } = useUserContext();
  const {
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
  } = useChatContext();

  const [showPotentialChatMembers, setShowPotentialChatMembers] =
    useState<boolean>(false);

  const [potentialChatMembers, setPotentialChatMembers] = useState<TUser[]>([]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const [chatMembersSearchQuery, setChatMembersSearchQuery] = useState<string>("");

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

  const getCurrentOtherUserFriends = (otherUser: TUser): TUser[] => {
    if (allUsers) {
      return allUsers.filter(
        (user) => user && user._id && otherUser.friends.includes(user._id)
      );
    }
    return [];
  };

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

  const handleSearchChatMembersInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const input = e.target.value.toLowerCase().replace(/s\+/g, " ");
    setChatMembersSearchQuery(input);

    let matchingUsers: TUser[] = [];
    if (input.replace(/\s+/g, "") !== "") {
      for (const otherUser of allOtherUsers) {
        if (otherUser.username && otherUser.firstName && otherUser.lastName) {
          if (
            otherUser.username.toLowerCase().includes(input) ||
            otherUser.firstName.toLowerCase().includes(input) ||
            otherUser.lastName.toLowerCase().includes(input)
          ) {
            matchingUsers.push(otherUser);
          }
        }
      }
      setPotentialChatMembers(matchingUsers);
    } else {
      initiatePotentialChatMembers();
    }
  };

  const handleChatNameInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/s\+/g, " ");
    if (inputCleaned.trim().length <= 20) {
      setChatName(inputCleaned);
      setChatNameError("");
    } else {
      setChatNameError("Name must be 20 character or less");
    }
  };

  const handleCancelNewChatCreation = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLElement, MouseEvent>
  ): void => {
    e.preventDefault();
    setUsersToAddToChat([]);
    setChatMembersSearchQuery("");
    setPotentialChatMembers(potentialChatMembers);
    setChatName("");
    setChatNameError("");
    setShowCreateNewChatModal(false);
  };

  const chatCanBeCreated = chatNameError === "" && usersToAddToChat.length > 0;

  return (
    <div className="modal-background">
      <i
        title="Close"
        onClick={(e) => {
          handleCancelNewChatCreation(e);
        }}
        className="fas fa-times close-module-icon"
      ></i>
      <div
        style={showPotentialChatMembers ? { overflowY: "scroll" } : undefined}
        className="create-new-chat"
      >
        <h1>New Chat</h1>
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
          name="chat-members-search"
          id="chat-members-search"
          randomColor={randomColor}
          value={chatMembersSearchQuery}
          inputOnChange={(e) => handleSearchChatMembersInput(e)}
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
              storageArray={usersToAddToChat.map((user) => user._id)}
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
              value={chatName}
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
