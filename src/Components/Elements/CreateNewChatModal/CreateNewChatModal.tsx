import { useState, useEffect } from "react";
import { TThemeColor } from "../../../types";
import { useChatContext } from "../../../Hooks/useChatContext";
import DropdownChecklist from "../DropdownChecklist/DropdownChecklist";
import { useUserContext } from "../../../Hooks/useUserContext";
import Tab from "../Tab/Tab";
import SearchAndDropdownList from "../SearchAndDropdownList/SearchAndDropdownList";
import Methods from "../../../methods";
import Requests from "../../../requests";

const CreateNewChatModal = () => {
  const { currentUser } = useUserContext();

  const {
    setShowCreateNewChatModal,
    handleOpenChat,
    fetchChatsQuery,
    handleSearchPotentialChatMembers,
    handleLoadMoreItemsOnScroll,
    admins,
    handleCreateChat,
    handleAddRemoveUserFromChat,
    usersToAddToChat,
    setUsersToAddToChat,
    handleRemoveUserFromChat,
    chatName,
    chatNameError,
    showPotentialChatMembers,
    setShowPotentialChatMembers,
    chatMembersSearchQuery,
    setChatMembersSearchQuery,
    handleChatNameInput,
    displayedPotentialChatMembers,
    setDisplayedPotentialChatMembers,
    fetchStart,
    fetchIsLoading,
    setFetchIsLoading,
    isFetchError,
    setIsFetchError,
    handleCancelAddOrEditChat,
  } = useChatContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const fetchLimit = 10;

  if (isFetchError) {
    throw new Error("Couldn't fetch potential chat members.");
  }

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

  useEffect(() => {
    if (chatMembersSearchQuery === "") {
      setFetchIsLoading(true);
      Requests.getPotentialChatMembers(currentUser, fetchStart, fetchLimit)
        .then((batchOfPotentialCMs) => {
          if (batchOfPotentialCMs) {
            if (fetchStart === 0) {
              setDisplayedPotentialChatMembers(
                batchOfPotentialCMs.map((pf) => Methods.getTBarebonesUser(pf))
              );
            } else {
              if (displayedPotentialChatMembers) {
                setDisplayedPotentialChatMembers(
                  displayedPotentialChatMembers.concat(
                    batchOfPotentialCMs.map((pf) => Methods.getTBarebonesUser(pf))
                  )
                );
              }
            }
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchIsLoading(false));
    }
  }, [fetchStart, chatMembersSearchQuery]);

  const chatCanBeCreated = chatNameError === "" && usersToAddToChat.length > 0;

  const initialFetchIsLoading: boolean = displayedPotentialChatMembers === null;

  return (
    <div tabIndex={0} className="modal-background">
      <i
        tabIndex={0}
        title="Close"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCancelAddOrEditChat(e);
          }
        }}
        onClick={(e) => handleCancelAddOrEditChat(e)}
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
        {!initialFetchIsLoading && isFetchError && (
          <p>Error retrieving data; please reload the page.</p>
        )}
        {initialFetchIsLoading && (
          <header style={{ marginTop: "3rem" }} className="query-status-text">
            Loading...
          </header>
        )}
        {!initialFetchIsLoading && !isFetchError && (
          <>
            <header style={{ fontFamily: "var(--text-font" }}>Add people to chat:</header>
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
            {displayedPotentialChatMembers && (
              <SearchAndDropdownList
                name="chat-members-search"
                id="chat-members-search"
                randomColor={randomColor}
                inputOnChange={(e) => handleSearchPotentialChatMembers(e)}
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
                    displayedItemsArray={displayedPotentialChatMembers}
                    storageArray={usersToAddToChat}
                    setStorageArray={setUsersToAddToChat}
                    fetchIsLoading={fetchIsLoading}
                    scrollHandler={handleLoadMoreItemsOnScroll}
                    scrollHandlerParams={[displayedPotentialChatMembers]}
                  />
                }
              />
            )}
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
              <button onClick={(e) => handleCancelAddOrEditChat(e)} id="cancel">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (currentUser?._id) {
                    // Forced to set otherUserToAdd w/ loop in order to pass tsc test when running npm run build
                    let userIDsToAddToChat: string[] = [];
                    for (const u of usersToAddToChat) {
                      if (u._id && u._id !== currentUser._id) {
                        userIDsToAddToChat.push(u._id.toString());
                      }
                    }
                    const otherUserToAdd: string = userIDsToAddToChat[0];

                    const existingChatWithOtherUserToAdd = fetchChatsQuery.data?.filter(
                      (chat) =>
                        chat.members.length === 2 &&
                        currentUser._id &&
                        chat.members.includes(currentUser._id.toString()) &&
                        chat.members.includes(otherUserToAdd)
                    )[0];

                    if (existingChatWithOtherUserToAdd) {
                      handleOpenChat(existingChatWithOtherUserToAdd);
                      setShowCreateNewChatModal(false);
                      setUsersToAddToChat([]);
                    } else {
                      // Forced to get array for members property w/ loop b/c of tsc error
                      let updatedMembers: string[] = [];
                      for (const u of usersToAddToChat) {
                        if (u._id) {
                          updatedMembers.push(u._id.toString());
                        }
                      }
                      if (currentUser && currentUser._id) {
                        updatedMembers.concat(currentUser._id.toString());
                      }
                      handleCreateChat({
                        members: updatedMembers,
                        messages: [],
                        ...(chatName &&
                          chatName.replace(/\s/g, "") !== "" && { chatName: chatName }),
                        chatType: usersToAddToChat.length > 1 ? "group" : "two-member",
                        dateCreated: Date.now(),
                        ...(usersToAddToChat.length >= 2 &&
                          currentUser &&
                          currentUser._id && {
                            admins: [
                              currentUser._id.toString(),
                              ...admins
                                .map((a) => a._id?.toString())
                                .filter((elem) => elem !== undefined),
                            ],
                          }),
                      });
                    }
                  }
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
          </>
        )}
      </div>
    </div>
  );
};
export default CreateNewChatModal;
