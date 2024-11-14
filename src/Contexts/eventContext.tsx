import { useState, createContext, ReactNode } from "react";
import { TEventContext } from "../types";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  // Use for optimistic rendering related to event rsvp-ing
  const [userRSVPdOptimistic, setUserRSVPdOptimistic] = useState<boolean>(false);

  const eventContextValues = {
    userRSVPdOptimistic,
    setUserRSVPdOptimistic,
  };

  return (
    <EventContext.Provider value={eventContextValues}>{children}</EventContext.Provider>
  );
};
