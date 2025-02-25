import { useContext } from "react";
import { ChatContext } from "../Contexts/chatContext";

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used inside the ChatContext provider.");
  }
  return context;
};
