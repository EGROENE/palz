import { ReactNode, useState, createContext } from "react";
import {
  TChatContext,
  TChat,
  TUser,
  TChatValuesToUpdate,
  TMessage,
  TUserSecure,
  TBarebonesUser,
} from "../types";
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
import { useEventContext } from "../Hooks/useEventContext";

export const ChatContext = createContext<TChatContext | null>(null);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const { theme, error } = useMainContext();

  if (error) {
    throw new Error(error);
  }

  const { currentUser, userHasLoggedIn, setCurrentOtherUser, currentOtherUser } =
    useUserContext();

  const { showInvitees, setShowInvitees, showRSVPs, setShowRSVPs } = useEventContext();

  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const [showMembers, setShowMembers] = useState<boolean>(false);

  const [showAreYouSureYouWantToLeaveChat, setShowAreYouSureYouWantToLeaveChat] =
    useState<boolean>(false);

  const [showAreYouSureYouWantToDeleteChat, setShowAreYouSureYouWantToDeleteChat] =
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

  const [showEditChatNameModal, setShowEditChatNameModal] = useState<boolean>(false);

  const [usersToAddToChat, setUsersToAddToChat] = useState<TBarebonesUser[]>([]);

  const [chatName, setChatName] = useState<string | undefined>(undefined);

  const [chatNameError, setChatNameError] = useState<string>("");

  const [admins, setAdmins] = useState<TBarebonesUser[]>([]);

  const [showPotentialChatMembers, setShowPotentialChatMembers] =
    useState<boolean>(false);

  const [chatMembersSearchQuery, setChatMembersSearchQuery] = useState<string>("");

  const [displayedPotentialChatMembers, setDisplayedPotentialChatMembers] = useState<
    TBarebonesUser[] | null
  >(null);
  const [allPotentialChatMembers, setAllPotentialChatMembers] = useState<
    TBarebonesUser[]
  >([]);
  const [fetchStart, setFetchStart] = useState<number>(0);
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);

  const [inputMessage, setInputMessage] = useState<string>("");

  const [
    numberOfPotentialChatMembersDisplayed,
    setNumberOfPotentialChatMembersDisplayed,
  ] = useState<number | undefined>(10);

  const [areNewMessages, setAreNewMessages] = useState<boolean>(false);

  const [chatCreationInProgress, setChatCreationInProgress] = useState<boolean>(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);

  const [messageBeingEdited, setMessageBeingEdited] = useState<TMessage | undefined>(
    undefined
  );

  const [fetchChatMembersIsLoading, setFetchChatMembersIsLoading] =
    useState<boolean>(false);

  const [fetchChatMembersIsError, setFetchChatMembersIsError] = useState<boolean>(false);

  const fetchChatsQuery: UseQueryResult<TChat[], Error> = useQuery({
    queryKey: ["userChats"],
    queryFn: () => Requests.getCurrentUserChats(currentUser),
    enabled: userHasLoggedIn,
  });
  const userChats: TChat[] | undefined = fetchChatsQuery.data;

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
        | "edit-message"
        | "update-chat-name";
    }) => Requests.updateChat(chat, chatValuesToUpdate),
    onSuccess: (data, variables) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["userChats"] });
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
          setShowAreYouSureYouWantToLeaveChat(false);
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
          setMessageBeingEdited(undefined);
          setInputMessage("");
          toast.success(`Message has been updated.`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
        }
        if (variables.purpose === "update-chat-name") {
          setChatName(undefined);
          toast.success(`Chat name has been updated.`, {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
        }
      } else {
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
        if (variables.purpose === "update-chat-name") {
          toast.error("Could not update chat name; please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      }
    },
    onError: (error) => console.log(error),
  });

  const createChatMutation = useMutation({
    mutationFn: ({ chat }: { chat: TChat }) => Requests.createNewChat(chat),
    onSuccess: (data) => {
      if (data.ok) {
        // set currentChat to chat, open ChatModal w/ it. if no message sent, put 'DRAFT' in chat preview
        data.json().then((newChat: TChat) => {
          handleOpenChat(newChat);
          setCurrentChat(newChat);
          setShowCreateNewChatModal(false);
          setShowChatModal(true);
          setUsersToAddToChat([]);
          setChatName(undefined);
          queryClient.invalidateQueries({ queryKey: ["userChats"] });
          queryClient.refetchQueries({ queryKey: ["userChats"] });
        });
      } else {
        toast.error("Unable to create chat. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setChatCreationInProgress(false),
  });

  const deleteChatMutation = useMutation({
    mutationFn: ({ chatID }: { chatID: string }) => Requests.deleteChat(chatID),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["userChats"] });
        queryClient.refetchQueries({ queryKey: ["userChats"] });
        setShowAreYouSureYouWantToDeleteChat(false);
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
        toast.error("Could not delete chat. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
  });

  const handleLoadMoreItemsOnScroll = (
    items: TBarebonesUser[],
    e?: React.UIEvent<HTMLUListElement, UIEvent> | React.UIEvent<HTMLDivElement, UIEvent>
  ): void => {
    const eHTMLElement = e?.target as HTMLElement;
    const scrollTop = e ? eHTMLElement.scrollTop : null;
    const scrollHeight = e ? eHTMLElement.scrollHeight : null;
    const clientHeight = e ? eHTMLElement.clientHeight : null;

    const bottomReached =
      e && scrollTop && clientHeight
        ? scrollTop + clientHeight === scrollHeight
        : window.innerHeight + window.scrollY >= document.body.offsetHeight;

    if (bottomReached) {
      const lastItem: TBarebonesUser = items[items.length - 1];

      if (lastItem && lastItem.index && chatMembersSearchQuery === "") {
        setFetchStart(lastItem.index + 1);
      }
    }
  };

  const initializePotentialChatMembersSearch = (
    input: string,
    chat?: TChat | undefined
  ): void => {
    if (!fetchIsLoading) {
      setFetchIsLoading(true);
    }
    setFetchStart(0);
    // If a chat is provided, pass to getPotentialChatMembers; if not, don't
    if (chat) {
      Requests.getPotentialChatMembers(currentUser, 0, Infinity, chat)
        .then((batchOfPotentialCMs) => {
          if (batchOfPotentialCMs) {
            setAllPotentialChatMembers(
              batchOfPotentialCMs.map((cm) => Methods.getTBarebonesUser(cm))
            );
            let matchingPotentialCOs = [];
            for (const co of batchOfPotentialCMs) {
              if (
                co.username?.includes(input.toLowerCase()) ||
                co.firstName?.includes(input.toLowerCase()) ||
                co.lastName?.includes(input.toLowerCase())
              ) {
                matchingPotentialCOs.push(Methods.getTBarebonesUser(co));
              }
            }
            setDisplayedPotentialChatMembers(matchingPotentialCOs);
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchIsLoading(false));
    } else {
      Requests.getPotentialChatMembers(currentUser, 0, Infinity)
        .then((batchOfPotentialCMs) => {
          if (batchOfPotentialCMs) {
            setAllPotentialChatMembers(
              batchOfPotentialCMs.map((cm) => Methods.getTBarebonesUser(cm))
            );
            let matchingPotentialCOs = [];
            for (const co of batchOfPotentialCMs) {
              if (
                co.username?.includes(input.toLowerCase()) ||
                co.firstName?.includes(input.toLowerCase()) ||
                co.lastName?.includes(input.toLowerCase())
              ) {
                matchingPotentialCOs.push(Methods.getTBarebonesUser(co));
              }
            }
            setDisplayedPotentialChatMembers(matchingPotentialCOs);
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchIsLoading(false));
    }
  };

  const handleSearchPotentialChatMembers = (
    e: React.ChangeEvent<HTMLInputElement>,
    chat?: TChat | undefined
  ): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    setChatMembersSearchQuery(inputCleaned);
    setShowPotentialChatMembers(true);
    if (inputCleaned.replace(/\s+/g, "") !== "") {
      if (allPotentialChatMembers.length === 0) {
        if (chat) {
          initializePotentialChatMembersSearch(inputCleaned, chat);
        } else {
          initializePotentialChatMembersSearch(inputCleaned);
        }
      } else {
        const matchingUsers: TBarebonesUser[] = [];
        for (const user of allPotentialChatMembers) {
          if (
            user?.firstName?.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
            user?.lastName?.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
            user?.username?.includes(inputCleaned.toLowerCase())
          ) {
            matchingUsers.push(user);
          }
        }
        setDisplayedPotentialChatMembers(matchingUsers);
      }
    } else {
      setChatMembersSearchQuery("");
      setAllPotentialChatMembers([]);
      setFetchStart(0);
    }
  };

  const handleCancelAddOrEditChat = (
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
    if (showAddMemberModal) {
      setShowAddMemberModal(false);
    }
    if (showCreateNewChatModal) {
      setShowCreateNewChatModal(false);
    }
    if (chatName) {
      setChatName(undefined);
    }
  };

  // If chat w/ members already exists, do not create new one; set currentChat to input chat, open ChatModal w/ it, and nofify user by toast that chat w/ these members already exists.
  // While chat is being created, display loadingmodal. hide onSettled of createChatMutation
  const handleCreateChat = (chat: TChat): void => {
    setChatCreationInProgress(true);

    // Make Request to get allChats. If length is 75+, don't create new one; show douchebag message
    Requests.getAllChats().then((res) => {
      if (res.ok) {
        res.json().then((allChats: TChat[]) => {
          if (allChats.length >= 75) {
            setChatCreationInProgress(false);
            toast.error(
              "Sorry, but due to potential spamming douchebags & this only being a portfolio project, only 75 chats in total can be created at this time.",
              {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              }
            );
          } else {
            createChatMutation.mutate({ chat });
          }
        });
      } else {
        setChatCreationInProgress(false);
        toast.error("Unable to create chat. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    });
  };

  const handleDeleteChat = (chatID: string): void =>
    deleteChatMutation.mutate({ chatID });

  const handleRemoveUserFromChat = (user: TUserSecure, chat?: TChat): void => {
    if (chat && chat.admins && user._id && user) {
      const updatedMembersIDs: string[] = chat.members.filter((member) => {
        if (user._id) {
          return member !== user._id.toString();
        }
      });

      const promisesToAwaitChatMembers: Promise<TUser>[] = updatedMembersIDs.map((id) => {
        return Requests.getUserByID(id).then((res) => {
          return res.json().then((chatMember: TUser) => chatMember);
        });
      });

      // For each _id in chat updatedMembersIDs, get TUser object, then pass array of these, converted to TBarebonesUser, to updateChatMutation
      setFetchChatMembersIsLoading(true);
      Promise.all(promisesToAwaitChatMembers)
        .then((chatMembers: TUser[]) => {
          if (chat.admins && user._id) {
            if (chat.admins.includes(user._id.toString())) {
              if (chat.admins.length - 1 === 0) {
                toast.error("Please assign another admin before leaving the chat.", {
                  style: {
                    background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                    color: theme === "dark" ? "black" : "white",
                    border: "2px solid red",
                  },
                });
              } else {
                // If user isn't only admin left, remove them from chat:
                const updatedAdmins: string[] = chat.admins.filter(
                  (admin) => admin !== user._id
                );

                const promisesToAwaitAdmins = updatedAdmins.map((a) => {
                  return Requests.getUserByID(a).then((res) => {
                    return res.json().then((user: TUser) => user);
                  });
                });

                Promise.all(promisesToAwaitAdmins)
                  .then((admins: TUser[]) => {
                    const chatValuesToUpdate: TChatValuesToUpdate = {
                      admins: admins
                        .map((a) => {
                          if (a._id) {
                            return a._id.toString();
                          }
                        })
                        .filter((elem) => elem !== undefined),
                      members: chatMembers
                        .map((m) => {
                          if (m._id) {
                            return m._id.toString();
                          }
                        })
                        .filter((elem) => elem !== undefined),
                    };

                    const purpose =
                      currentUser && user._id === currentUser._id
                        ? "remove-self-from-chat"
                        : "remove-member";
                    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
                  })
                  .catch((error) => {
                    console.log(error);
                    toast.error("Could not fetch chat members. Please try again.", {
                      style: {
                        background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                        color: theme === "dark" ? "black" : "white",
                        border: "2px solid red",
                      },
                    });
                  });
              }
            } else {
              // Remove non-admin members:
              const chatValuesToUpdate: TChatValuesToUpdate = {
                members: chatMembers
                  .map((m) => {
                    if (m._id) {
                      return m._id.toString();
                    }
                  })
                  .filter((elem) => elem !== undefined),
              };
              const purpose =
                currentUser && user._id === currentUser._id
                  ? "remove-self-from-chat"
                  : "remove-member";
              updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
            }
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchChatMembersIsLoading(false));
    }

    if (!chat) {
      setUsersToAddToChat(
        usersToAddToChat.filter((userToAdd) => userToAdd._id !== user._id)
      );
    }
  };

  const handleAddRemoveUserFromChat = (
    user: TBarebonesUser,
    usersToAddToChat: TBarebonesUser[],
    setUsersToAddToChat: React.Dispatch<React.SetStateAction<TBarebonesUser[]>>
  ): void => {
    if (user._id) {
      if (usersToAddToChat.map((u) => u._id).includes(user._id.toString())) {
        setUsersToAddToChat(
          usersToAddToChat.filter((userToAdd) => userToAdd._id !== user._id)
        );
      } else {
        setUsersToAddToChat(usersToAddToChat.concat(user));
      }
    }
  };

  const handleAddMultipleUsersToChat = (users: string[], chat: TChat): void => {
    const updatedMembersIDs: string[] = chat.members.concat(users);

    const promisesToAwaitChatMembers: Promise<TUser>[] = updatedMembersIDs.map((id) => {
      return Requests.getUserByID(id).then((res) => {
        return res.json().then((chatMember: TUser) => chatMember);
      });
    });

    // For each _id in chat updatedMembersIDs, get TUser object, then pass array of these, converted to TBarebonesUser, to updateChatMutation
    setFetchChatMembersIsLoading(true);
    Promise.all(promisesToAwaitChatMembers)
      .then((chatMembers: TUser[]) => {
        const chatValuesToUpdate: TChatValuesToUpdate = {
          members: chatMembers
            .map((m) => {
              if (m._id) {
                return m._id.toString();
              }
            })
            .filter((elem) => elem !== undefined),
        };

        const purpose = "add-members";
        updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
      })
      .catch((error) => console.log(error))
      .finally(() => setFetchChatMembersIsLoading(false));
  };

  const handleAddAdminToChat = (user: TUserSecure, chat: TChat): void => {
    setCurrentOtherUser(user);
    const updatedAdmins =
      chat.admins && user._id ? chat.admins.concat(user._id.toString()) : [];

    const promisesToAwaitAdmins = updatedAdmins.map((a) => {
      return Requests.getUserByID(a).then((res) => {
        return res.json().then((user: TUser) => user);
      });
    });

    Promise.all(promisesToAwaitAdmins)
      .then((admins: TUser[]) => {
        const chatValuesToUpdate = {
          admins: admins
            .map((a) => {
              if (a._id) {
                return a._id.toString();
              }
            })
            .filter((elem) => elem !== undefined),
        };
        const purpose = "add-admin";
        updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
      })
      .catch((error) => {
        console.log(error);
        toast.error("Could not fetch chat members. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      });
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

      const promisesToAwaitAdmins = updatedAdmins?.map((a) => {
        return Requests.getUserByID(a).then((res) =>
          res.json().then((user: TUser) => user)
        );
      });

      if (promisesToAwaitAdmins) {
        Promise.all(promisesToAwaitAdmins)
          .then((admins: TUser[]) => {
            const chatValuesToUpdate = {
              admins: admins
                .map((a) => {
                  if (a._id) {
                    return a._id.toString();
                  }
                })
                .filter((elem) => elem !== undefined),
            };
            updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
          })
          .catch((error) => {
            console.log(error);
            toast.error("Could not fetch chat members. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          });
      }
    }
  };

  const handleSendMessage = (chat: TChat, content: string): void => {
    const now = Date.now();
    const messageId = new mongoose.Types.ObjectId();

    if (currentUser && currentUser._id) {
      const newMessage: TMessage = {
        _id: messageId,
        sender: currentUser._id.toString(),
        content: content.trim(),
        image: "",
        timeSent: now,
        seenBy: [],
      };

      const chatValuesToUpdate: TChatValuesToUpdate = {
        messages: chat.messages.concat(newMessage),
      };

      const purpose = "send-message";
      updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
    }
  };

  const startEditingMessage = (message: TMessage): void => {
    setMessageBeingEdited(message);
    setInputMessage(message.content);
  };

  const cancelEditingMessage = (): void => {
    setMessageBeingEdited(undefined);
    setInputMessage("");
  };

  const handleSaveEditedMessage = (chat: TChat, editedMessage: TMessage): void => {
    const now = Date.now();
    const updatedMessageContent: string = inputMessage.trim();
    const messageToUpdate: TMessage = chat.messages.filter(
      (message) => message._id === editedMessage._id
    )[0];
    const updatedMessage = {
      _id: messageToUpdate._id,
      sender: messageToUpdate.sender,
      content: updatedMessageContent,
      timeSent: messageToUpdate.timeSent,
      image: messageToUpdate.image,
      seenBy: messageToUpdate.seenBy,
      timeEdited: now,
    };
    const updatedMessages = chat.messages.map((message) => {
      if (message._id === editedMessage._id) {
        return updatedMessage;
      } else {
        return message;
      }
    });
    const chatValuesToUpdate = { messages: updatedMessages };
    const purpose = "edit-message";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
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

  const handleSearchChatMembersInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    showList: boolean,
    setShowList: React.Dispatch<React.SetStateAction<boolean>>,
    searchArray: TBarebonesUser[],
    resetFunction: Function
  ): void => {
    e.preventDefault();
    if (!showList) {
      setShowList(true);
    }
    const input = e.target.value.toLowerCase().replace(/s\+/g, " ");
    setChatMembersSearchQuery(input);

    let matchingUsers: TBarebonesUser[] = [];
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
      setDisplayedPotentialChatMembers(matchingUsers);
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
        message.sender !== currentUser._id.toString() &&
        !usersWhoSawMessage.includes(currentUser._id.toString())
      ) {
        message.seenBy.push({ user: currentUser._id.toString(), time: now });
      }
      return message;
    });
    const chatValuesToUpdate: TChatValuesToUpdate = {
      messages: updatedChatMessages,
    };

    const purpose = "mark-as-read";
    updateChatMutation.mutate({ chat, chatValuesToUpdate, purpose });
  };

  const handleUpdateChatName = (chat: TChat): void => {
    const purpose = "update-chat-name";
    const chatValuesToUpdate: TChatValuesToUpdate = {
      chatName: chatName,
    };
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

  const getStartOrOpenChatWithUserHandler = (
    otherUser: TBarebonesUser | undefined
  ): void => {
    if (otherUser) {
      if (showInvitees) {
        setShowInvitees(false);
      }

      if (showRSVPs) {
        setShowRSVPs(false);
      }

      if (showChatModal) {
        setShowChatModal(false);
      }

      const existingChatWithListedChatMember: TChat | undefined = userChats?.filter(
        (chat) => {
          if (
            chat.members.length === 2 &&
            otherUser._id &&
            chat.members.indexOf(otherUser._id.toString()) !== -1
          ) {
            return chat;
          }
        }
      )[0];

      if (existingChatWithListedChatMember !== undefined) {
        return handleOpenChat(existingChatWithListedChatMember);
      }

      const newChatMembers: string[] =
        otherUser._id && currentUser && currentUser._id
          ? [otherUser._id.toString(), currentUser._id.toString()]
          : [];

      if (!existingChatWithListedChatMember) {
        return handleCreateChat({
          members: newChatMembers,
          messages: [],
          chatType: "two-member",
          dateCreated: Date.now(),
        });
      }
    }
  };

  const getNumberOfUnreadMessagesInChat = (chat: TChat): string | number => {
    let unreadMessages: TMessage[] = [];
    if (userChats && currentUser && currentUser._id) {
      for (const message of chat.messages) {
        const usersWhoSawMessage: string[] = message.seenBy.map((obj) => obj.user);
        if (
          !usersWhoSawMessage.includes(currentUser._id.toString()) &&
          message.sender !== currentUser._id.toString()
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

  const getTotalNumberOfUnreadMessages = (chatArray: TChat[]): string | number => {
    let unreadMessages: number = 0;
    for (const chat of chatArray) {
      const newMessagesInChat = getNumberOfUnreadMessagesInChat(chat);
      if (typeof newMessagesInChat === "number") {
        unreadMessages += newMessagesInChat;
      } else {
        return "9+";
      }
    }
    return unreadMessages > 9 ? "9+" : unreadMessages;
  };

  const chatContextValues: TChatContext = {
    fetchChatMembersIsError,
    setFetchChatMembersIsError,
    fetchChatMembersIsLoading,
    setFetchChatMembersIsLoading,
    handleCancelAddOrEditChat,
    handleSearchPotentialChatMembers,
    initializePotentialChatMembersSearch,
    handleLoadMoreItemsOnScroll,
    allPotentialChatMembers,
    setAllPotentialChatMembers,
    displayedPotentialChatMembers,
    setDisplayedPotentialChatMembers,
    fetchStart,
    setFetchStart,
    fetchIsLoading,
    setFetchIsLoading,
    isFetchError,
    setIsFetchError,
    handleUpdateChatName,
    showEditChatNameModal,
    setShowEditChatNameModal,
    getStartOrOpenChatWithUserHandler,
    getTotalNumberOfUnreadMessages,
    handleSaveEditedMessage,
    cancelEditingMessage,
    startEditingMessage,
    messageBeingEdited,
    setMessageBeingEdited,
    showAreYouSureYouWantToDeleteChat,
    setShowAreYouSureYouWantToDeleteChat,
    handleDeleteChat,
    showAreYouSureYouWantToRemoveYourselfAsAdmin,
    setShowAreYouSureYouWantToRemoveYourselfAsAdmin,
    handleRemoveAdminFromChat,
    handleAddAdminToChat,
    showMembers,
    setShowMembers,
    showAreYouSureYouWantToLeaveChat,
    setShowAreYouSureYouWantToLeaveChat,
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
    showPotentialChatMembers,
    setShowPotentialChatMembers,
    chatMembersSearchQuery,
    setChatMembersSearchQuery,
    chatName,
    setChatName,
    chatNameError,
    setChatNameError,
    handleAddRemoveUserFromChat,
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
  };

  return (
    <ChatContext.Provider value={chatContextValues}>{children}</ChatContext.Provider>
  );
};
