import { ReactNode, useState, createContext } from "react";
import { TChatContext, TChat, TUser, TChatValuesToUpdate, TMessage } from "../types";
import { useUserContext } from "../Hooks/useUserContext";
import Requests from "../requests";
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

export const ChatContext = createContext<TChatContext | null>(null);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, userHasLoggedIn, allOtherUsers, allUsers } = useUserContext();

  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const [currentChat, setCurrentChat] = useLocalStorage<TChat | null>(
    "currentChat",
    null
  );

  const [showCreateNewChatModal, setShowCreateNewChatModal] = useState<boolean>(false);

  const [usersToAddToChat, setUsersToAddToChat] = useState<TUser[]>([]);

  const [chatName, setChatName] = useState<string>("");
  const [chatNameError, setChatNameError] = useState<string>("");

  const [showPotentialChatMembers, setShowPotentialChatMembers] =
    useState<boolean>(false);

  const [potentialChatMembers, setPotentialChatMembers] = useState<TUser[]>([]);

  const [chatMembersSearchQuery, setChatMembersSearchQuery] = useState<string>("");

  const [
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
  ] = useState<number | null>(10);

  const fetchChatsQuery: UseQueryResult<TChat[], Error> = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      currentUser && currentUser._id
        ? Requests.getCurrentUserChats(currentUser._id)
        : undefined,
    enabled: userHasLoggedIn,
  });
  let userChats: TChat[] | undefined = fetchChatsQuery.data;

  const queryClient = useQueryClient();

  const markMessagesAsReadMutation = useMutation({
    mutationFn: ({
      chat,
      valuesToUpdate,
    }: {
      chat: TChat;
      valuesToUpdate: TChatValuesToUpdate;
    }) => Requests.updateChat(chat, valuesToUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "messages" });
      queryClient.refetchQueries({ queryKey: ["messages"] });
    },
    onError: (error) => console.log(error),
  });

  const getChatMembers = (members: string[]): TUser[] => {
    let chatMembers: TUser[] = [];
    for (const user of allOtherUsers) {
      if (user._id && members.includes(user._id)) {
        chatMembers.push(user);
      }
    }
    return chatMembers;
  };

  const handleAddUserToChat = (user: TUser, chat?: TChat): void => {
    if (!chat) {
      setUsersToAddToChat(usersToAddToChat.concat(user));
    }
  };

  const handleRemoveUserFromChat = (user: TUser, chat?: TChat): void => {
    if (!chat) {
      setUsersToAddToChat(
        usersToAddToChat.filter((userToAdd) => userToAdd._id !== user._id)
      );
    }
  };

  const handleAddRemoveUserFromChat = (user: TUser, chat?: TChat): void => {
    if (!chat) {
      if (usersToAddToChat.includes(user)) {
        handleRemoveUserFromChat(user);
      } else {
        handleAddUserToChat(user);
      }
    }
  };

  const getCurrentOtherUserFriends = (otherUser: TUser): TUser[] => {
    if (allUsers) {
      return allUsers.filter(
        (user) => user && user._id && otherUser.friends.includes(user._id)
      );
    }
    return [];
  };

  const handleSearchChatMembersInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    showList: boolean,
    setShowList: React.Dispatch<React.SetStateAction<boolean>>,
    searchArray: TUser[],
    resetFunction: Function
  ): void => {
    e.preventDefault();
    if (!showList) {
      setShowList(true);
    }
    const input = e.target.value.toLowerCase().replace(/s\+/g, " ");
    setChatMembersSearchQuery(input);

    let matchingUsers: TUser[] = [];
    if (input.replace(/\s+/g, "") !== "") {
      for (const user of searchArray) {
        if (user.username && user.firstName && user.lastName) {
          if (
            user.username.toLowerCase().includes(input) ||
            user.firstName.toLowerCase().includes(input) ||
            user.lastName.toLowerCase().includes(input)
          ) {
            matchingUsers.push(user);
          }
        }
      }
      setPotentialChatMembers(matchingUsers);
    } else {
      resetFunction();
    }
  };

  const handleChatNameInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/s\+/g, " ");
    if (inputCleaned.trim().length <= 40) {
      setChatName(inputCleaned);
      setChatNameError("");
    } else {
      setChatNameError("Name must be 40 characters or less");
    }
  };

  const handleOpenChat = (chat: TChat): void => {
    setCurrentChat(chat);
    setShowChatModal(true);
    // if unread messages, mark them as read
    const now = Date.now();
    const updatedChatMessages: TMessage[] = chat.messages.map((message) => {
      const usersWhoSawMessage = message.seenBy.map((obj) => obj.user);
      if (
        currentUser &&
        currentUser._id &&
        message.sender !== currentUser._id &&
        !usersWhoSawMessage.includes(currentUser._id)
      ) {
        message.seenBy.push({ user: currentUser._id, time: now });
      }
      return message;
    });
    const valuesToUpdate: TChatValuesToUpdate = {
      members: chat.members,
      messages: updatedChatMessages,
      dateCreated: chat.dateCreated,
      chatName: chat.chatName,
    };
    markMessagesAsReadMutation.mutate({ chat, valuesToUpdate });
    // scroll automatically to bottom of chat
  };

  const chatContextValues: TChatContext = {
    handleOpenChat,
    handleChatNameInput,
    handleSearchChatMembersInput,
    getCurrentOtherUserFriends,
    showPotentialChatMembers,
    setShowPotentialChatMembers,
    potentialChatMembers,
    setPotentialChatMembers,
    chatMembersSearchQuery,
    setChatMembersSearchQuery,
    chatName,
    setChatName,
    chatNameError,
    setChatNameError,
    handleAddRemoveUserFromChat,
    handleAddUserToChat,
    handleRemoveUserFromChat,
    usersToAddToChat,
    setUsersToAddToChat,
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
    showCreateNewChatModal,
    setShowCreateNewChatModal,
    currentChat,
    setCurrentChat,
    fetchChatsQuery,
    userChats,
    showChatModal,
    setShowChatModal,
    getChatMembers,
  };

  return (
    <ChatContext.Provider value={chatContextValues}>{children}</ChatContext.Provider>
  );
};
