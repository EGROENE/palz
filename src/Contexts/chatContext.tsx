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
import toast from "react-hot-toast";
import { useMainContext } from "../Hooks/useMainContext";
import Methods from "../methods";

export const ChatContext = createContext<TChatContext | null>(null);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useMainContext();
  const {
    currentUser,
    userHasLoggedIn,
    allOtherUsers,
    allUsers,
    setCurrentOtherUser,
    currentOtherUser,
  } = useUserContext();

  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const [showMembers, setShowMembers] = useState<boolean>(false);

  const [showAreYouSureYouWantToLeaveChat, setShowShowAreYouSureYouWantToLeaveChat] =
    useState<boolean>(false);

  const [showAreYouSureYouWantToDeleteChat, setShowShowAreYouSureYouWantToDeleteChat] =
    useState<boolean>(false);

  const [
    showAreYouSureYouWantToRemoveYourselfAsAdmin,
    setShowAreYouSureYouWantToRemoveYourselfAsAdmin,
  ] = useState<boolean>(false);

  const [currentChat, setCurrentChat] = useLocalStorage<TChat | null>(
    "currentChat",
    null
  );

  const [showCreateNewChatModal, setShowCreateNewChatModal] = useState<boolean>(false);

  const [usersToAddToChat, setUsersToAddToChat] = useState<TUser[]>([]);

  const [chatName, setChatName] = useState<string>("");
  const [chatNameError, setChatNameError] = useState<string>("");

  const [admins, setAdmins] = useState<string[]>([]);

  const [showPotentialChatMembers, setShowPotentialChatMembers] =
    useState<boolean>(false);

  const [potentialChatMembers, setPotentialChatMembers] = useState<TUser[]>([]);

  const [chatMembersSearchQuery, setChatMembersSearchQuery] = useState<string>("");

  const [inputMessage, setInputMessage] = useState<string>("");

  const [
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
  ] = useState<number | undefined>(10);

  const [areNewMessages, setAreNewMessages] = useState<boolean>(false);

  const [chatCreationInProgress, setChatCreationInProgress] = useState<boolean>(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);

  const [messageIsBeingEdited, setMessageIsBeingEdited] = useState<boolean>(false);

  const fetchChatsQuery: UseQueryResult<TChat[], Error> = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      currentUser && currentUser._id
        ? Requests.getCurrentUserChats(currentUser._id)
        : undefined,
    enabled: userHasLoggedIn,
  });
  const userChats: TChat[] | undefined = fetchChatsQuery.data;

  /* const chatValuesToUpdate: TChatValuesToUpdate = {
      ...(firstName?.trim() !== "" &&
        firstName !== currentUser?.firstName && {
          firstName: Methods.formatHyphensAndSpacesInString(
            Methods.formatCapitalizedName(firstName?.trim())
          ),
        }),
      ...(lastName?.trim() !== "" &&
        lastName !== currentUser?.lastName && {
          lastName: Methods.formatHyphensAndSpacesInString(
            Methods.formatCapitalizedName(lastName?.trim())
          ),
        }),
        ...
    }; */

  const queryClient = useQueryClient();

  const updateChatMutation = useMutation({
    mutationFn: ({
      chat,
      chatValuesToUpdate,
      // @ts-ignore: purpose param not needed in mutationFn, but needed in onError
      purpose,
    }: {
      chat: TChat;
      chatValuesToUpdate: TChatValuesToUpdate;
      purpose:
        | "send-message"
        | "delete-message"
        | "mark-as-read"
        | "add-members"
        | "remove-member"
        | "remove-self-from-chat"
        | "add-admin"
        | "remove-admin"
        | "edit-message";
    }) => Requests.updateChat(chat, chatValuesToUpdate),
    onSuccess: (data, variables) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: "userChats" });
        queryClient.refetchQueries({ queryKey: ["userChats"] });
        setCurrentChat(variables.chat);
        if (inputMessage !== "") {
          setInputMessage("");
        }
        if (variables.purpose === "add-members") {
          if (usersToAddToChat.length > 1) {
            toast.success("Users added to chat!", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid green",
              },
            });
          } else {
            toast.success("User added to chat!", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid green",
              },
            });
          }
          setShowAddMemberModal(false);
          setChatMembersSearchQuery("");
          setUsersToAddToChat([]);
        }
        if (variables.purpose === "remove-self-from-chat") {
          setShowMembers(false);
          setShowChatModal(false);
          setCurrentChat(null);
          toast("You have left the chat.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
        if (variables.purpose === "remove-member") {
          toast(`${currentOtherUser?.username} removed from chat.`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          setCurrentOtherUser(null);
        }
        if (variables.purpose === "add-admin") {
          toast.success(`Added ${currentOtherUser?.username} as admin!`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
          setCurrentOtherUser(null);
        }
        if (variables.purpose === "remove-admin") {
          toast(`You have removed yourself as admin.`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
        if (variables.purpose === "edit-message") {
          setMessageIsBeingEdited(false);
          setInputMessage("");
          toast.success(`Message has been updated.`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
        }
      } else {
        throw Error;
      }
    },
    onError: (error, variables) => {
      console.log(error);
      if (variables.purpose === "send-message") {
        toast.error("Could not send message. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
      if (variables.purpose === "delete-message") {
        toast.error("Could not delete message. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
      if (variables.purpose === "add-members") {
        if (usersToAddToChat.length > 1) {
          toast.error("Could not add users to chat. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          toast.error("Could not add user to chat. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      }
      if (variables.purpose === "remove-self-from-chat") {
        toast.error(`Could not remove you from chat. Please try again.`, {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
      if (variables.purpose === "remove-member") {
        toast.error(
          `Could not remove ${currentOtherUser?.username} from chat. Please try again.`,
          {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          }
        );
      }
      if (variables.purpose === "add-admin") {
        toast.error(
          `Could not add ${currentOtherUser?.username} as admin. Please try again.`,
          {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          }
        );
      }
      if (variables.purpose === "remove-admin") {
        toast(`Could not remove you as admin; please try again.`, {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
      if (variables.purpose === "edit-message") {
        toast.error("Could not save edits; please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
  });

  const createChatMutation = useMutation({
    mutationFn: ({ chat }: { chat: TChat }) => Requests.createNewChat(chat),
    onSuccess: (data, variables) => {
      if (data.ok) {
        // set currentChat to chat, open ChatModal w/ it. if no message sent, put 'DRAFT' in chat preview
        handleOpenChat(variables.chat);
        setShowCreateNewChatModal(false);
        setUsersToAddToChat([]);
        queryClient.invalidateQueries({ queryKey: "userChats" });
        queryClient.refetchQueries({ queryKey: ["userChats"] });
      } else {
        throw Error;
      }
    },
    onError: (error) => {
      console.log(error);
      // notify by toast of inability to create chat. allow retry
      toast.error("Unable to create chat. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => setChatCreationInProgress(false),
  });

  const deleteChatMutation = useMutation({
    mutationFn: ({ chatID }: { chatID: string }) => Requests.deleteChat(chatID),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: "userChats" });
        queryClient.refetchQueries({ queryKey: ["userChats"] });
        setShowShowAreYouSureYouWantToDeleteChat(false);
        setShowChatModal(false);
        setCurrentChat(null);
        toast("Chat deleted.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      } else {
        throw Error;
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Could not delete chat. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
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

  // If chat w/ members already exists, do not create new one; set currentChat to input chat, open ChatModal w/ it, and nofify user by toast that chat w/ these members already exists.
  // While chat is being created, display loadingmodal. hide onSettled of createChatMutation
  const handleCreateChat = (chat: TChat): void => {
    setChatCreationInProgress(true);

    const existingChat: TChat | undefined =
      userChats &&
      userChats.filter((userChat) =>
        Methods.arraysAreIdentical(userChat.members, chat.members)
      )[0];

    if (existingChat) {
      setCurrentChat(chat);
      setShowChatModal(true);
      handleOpenChat(existingChat);
      setChatCreationInProgress(false);
      setShowCreateNewChatModal(false);
      toast.error("Chat already exists.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    } else {
      createChatMutation.mutate({ chat });
    }
  };

  const handleDeleteChat = (chatID: string): void => {
    deleteChatMutation.mutate({ chatID });
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
    } else {
      // if user is only admin left, inform by toast that they can't leave until another admin is assigned:
      if (
        chat &&
        chat.admins &&
        user._id &&
        user &&
        chat.admins.includes(user._id) &&
        chat.admins.length - 1 === 0
      ) {
        toast.error("Please assign another admin before leaving the chat.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      } else {
        if (user !== currentUser) {
          setCurrentOtherUser(user);
        }
        const chatValuesToUpdate: TChatValuesToUpdate = {
          members: chat.members.filter((member) => member !== user._id),
        };
        const purpose = user === currentUser ? "remove-self-from-chat" : "remove-member";
        updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
      }
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

  const handleAddMultipleUsersToChat = (users: string[], chat: TChat): void => {
    const updatedChatMembers = chat.members.concat(users);

    const chatValuesToUpdate: TChatValuesToUpdate = {
      members: updatedChatMembers,
    };

    const purpose = "add-members";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
  };

  const handleAddAdminToChat = (user: TUser, chat: TChat): void => {
    setCurrentOtherUser(user);
    const updatedAdmins = chat.admins && user._id ? chat.admins.concat(user._id) : [];
    const chatValuesToUpdate = { admins: updatedAdmins };
    const purpose = "add-admin";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
  };

  const handleRemoveAdminFromChat = (user: TUser, chat: TChat): void => {
    if (chat.admins && chat.admins.length - 1 === 0) {
      toast.error("Please assign another admin before removing yourself as admin.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    } else {
      const purpose = "remove-admin";
      const updatedAdmins =
        chat.admins && chat.admins.filter((admin) => admin !== user._id);
      const chatValuesToUpdate = { admins: updatedAdmins };
      updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
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

    const chatValuesToUpdate: TChatValuesToUpdate = {
      messages: chat.messages.concat(newMessage),
    };

    const purpose = "send-message";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
  };

  const startEditingMessage = (message: TMessage): void => {
    setMessageIsBeingEdited(true);
    setInputMessage(message.content);
  };

  const cancelEditingMessage = (): void => {
    setMessageIsBeingEdited(false);
    setInputMessage("");
  };

  const handleDeleteMessage = (
    chat: TChat,
    messageID: string | mongoose.Types.ObjectId
  ) => {
    const updatedMessages = chat.messages.filter((message) => message._id !== messageID);

    const chatValuesToUpdate: TChatValuesToUpdate = {
      messages: updatedMessages,
    };

    const purpose = "delete-message";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
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

  const markMessagesAsRead = (chat: TChat): void => {
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
    const chatValuesToUpdate: TChatValuesToUpdate = {
      messages: updatedChatMessages,
    };

    const purpose = "mark-as-read";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
  };

  const handleOpenChat = (chat: TChat): void => {
    setCurrentChat(chat);
    setShowChatModal(true);
    if (showMembers) {
      setShowMembers(false);
    }
    if (chat.messages.length > 0) {
      setAreNewMessages(false);
      markMessagesAsRead(chat);
    }
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
    cancelEditingMessage,
    startEditingMessage,
    messageIsBeingEdited,
    setMessageIsBeingEdited,
    showAreYouSureYouWantToDeleteChat,
    setShowShowAreYouSureYouWantToDeleteChat,
    handleDeleteChat,
    showAreYouSureYouWantToRemoveYourselfAsAdmin,
    setShowAreYouSureYouWantToRemoveYourselfAsAdmin,
    handleRemoveAdminFromChat,
    handleAddAdminToChat,
    showMembers,
    setShowMembers,
    showAreYouSureYouWantToLeaveChat,
    setShowShowAreYouSureYouWantToLeaveChat,
    admins,
    setAdmins,
    showAddMemberModal,
    setShowAddMemberModal,
    handleAddMultipleUsersToChat,
    createChatMutation,
    handleCreateChat,
    chatCreationInProgress,
    setChatCreationInProgress,
    markMessagesAsRead,
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
    showChatModal,
    setShowChatModal,
    getChatMembers,
  };

  return (
    <ChatContext.Provider value={chatContextValues}>{children}</ChatContext.Provider>
  );
};
