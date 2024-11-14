import { useContext } from "react";
import { EventContext } from "../Contexts/eventContext";

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used inside the EventContext provider.");
  }
  return context;
};
