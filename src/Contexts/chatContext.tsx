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
import mongoose from "mongoose";
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

  const [inputMessage, setInputMessage] = useState<string>("");

  const [
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
  ] = useState<number | null>(10);

  const [areNewMessages, setAreNewMessages] = useState<boolean>(false);

  const fetchChatsQuery: UseQueryResult<TChat[], Error> = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      currentUser && currentUser._id
        ? Requests.getCurrentUserChats(currentUser._id)
        : undefined,
    enabled: userHasLoggedIn,
  });
  let userChats: TChat[] | undefined = fetchChatsQuery.data;

  const queryClient = useQueryClient();

  const updateChatMutation = useMutation({
    mutationFn: ({
      chat,
      valuesToUpdate,
    }: {
      chat: TChat;
      valuesToUpdate: TChatValuesToUpdate;
    }) => Requests.updateChat(chat, valuesToUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "userChats" });
      queryClient.refetchQueries({ queryKey: ["userChats"] });
      if (inputMessage !== "") {
        setInputMessage("");
      }
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

  const handleSendMessage = (chat: TChat, content: string): void => {
    const now = Date.now();
    const messageId = new mongoose.Types.ObjectId();

    const newMessage: TMessage = {
      _id: messageId,
      sender: currentUser && currentUser._id ? currentUser._id : "",
      content: content,
      image: "",
      timeSent: now,
      seenBy: [],
    };

    const valuesToUpdate: TChatValuesToUpdate = {
      members: chat.members,
      messages: chat.messages.concat(newMessage),
      dateCreated: chat.dateCreated,
      chatName: chat.chatName,
    };

    updateChatMutation.mutate({ chat, valuesToUpdate });
  };

  const handleDeleteMessage = (
    chat: TChat,
    messageID: string | mongoose.Types.ObjectId
  ) => {
    const updatedMessages = chat.messages.filter((message) => message._id !== messageID);

    const valuesToUpdate: TChatValuesToUpdate = {
      members: chat.members,
      messages: updatedMessages,
      dateCreated: chat.dateCreated,
      chatName: chat.chatName,
    };

    updateChatMutation.mutate({ chat, valuesToUpdate });
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
    setAreNewMessages(false);
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
    updateChatMutation.mutate({ chat, valuesToUpdate });
  };

  const getNumberOfUnreadMessagesInChat = (chat: TChat): string | number => {
    let unreadMessages: TMessage[] = [];
    if (userChats && currentUser && currentUser._id) {
      for (const message of chat.messages) {
        const usersWhoSawMessage: string[] = message.seenBy.map((obj) => obj.user);
        if (
          !usersWhoSawMessage.includes(currentUser._id) &&
          message.sender !== currentUser._id
        ) {
          unreadMessages.push(message);
        }
        if (
          usersWhoSawMessage.includes(currentUser._id) ||
          message.sender === currentUser._id
        ) {
          return "";
        }
      }
    }
    if (unreadMessages.length >= 10) {
      return "9+";
    }
    if (unreadMessages.length < 10) {
      return unreadMessages.length;
    }
    return 0;
  };

  const chatContextValues: TChatContext = {
    areNewMessages,
    setAreNewMessages,
    getNumberOfUnreadMessagesInChat,
    handleDeleteMessage,
    inputMessage,
    setInputMessage,
    handleSendMessage,
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
