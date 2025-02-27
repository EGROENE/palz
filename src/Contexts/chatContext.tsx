import { ReactNode, useState, createContext } from "react";
import { TChatContext, TChat, TUser } from "../types";
import { useUserContext } from "../Hooks/useUserContext";
import Requests from "../requests";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";

export const ChatContext = createContext<TChatContext | null>(null);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, userHasLoggedIn, allOtherUsers } = useUserContext();

  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const [currentChat, setCurrentChat] = useLocalStorage<TChat | null>(
    "currentChat",
    null
  );

  const [showCreateNewChatModal, setShowCreateNewChatModal] = useState<boolean>(false);

  const fetchChatsQuery: UseQueryResult<TChat[], Error> = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      currentUser && currentUser._id
        ? Requests.getCurrentUserChats(currentUser._id)
        : undefined,
    enabled: userHasLoggedIn,
  });
  let userChats: TChat[] | undefined = fetchChatsQuery.data;

  const getChatMembers = (members: string[]): TUser[] => {
    let chatMembers: TUser[] = [];
    for (const user of allOtherUsers) {
      if (user._id && members.includes(user._id)) {
        chatMembers.push(user);
      }
    }
    return chatMembers;
  };

  const chatContextValues: TChatContext = {
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
