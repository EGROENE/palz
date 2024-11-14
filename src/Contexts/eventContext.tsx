import { useState, createContext, ReactNode } from "react";
import { TEventContext, TUser, TEvent } from "../types";
import Requests from "../requests";
import { useMainContext } from "../Hooks/useMainContext";
import toast from "react-hot-toast";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useMainContext();

  // Use for optimistic rendering related to event rsvp-ing
  const [userRSVPdOptimistic, setUserRSVPdOptimistic] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    setUserRSVPdActual?: React.Dispatch<React.SetStateAction<boolean | null>>
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    setUserRSVPdOptimistic(true);
    Requests.addUserRSVP(currentUser, event)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not RSVP to event. Please try again.");
          setUserRSVPdOptimistic(false);
        } else {
          toast.success("RSVP added");
          if (setUserRSVPdActual) {
            setUserRSVPdActual(true);
          }
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser,
    setUserRSVPdActual?: React.Dispatch<React.SetStateAction<boolean | null>>
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    setUserRSVPdOptimistic(false);
    Requests.deleteUserRSVP(user, event)
      .then((response) => {
        if (!response.ok) {
          setUserRSVPdOptimistic(true);
          toast.error("Could not remove RSVP. Please try again.");
        } else {
          toast.error("RSVP deleted");
          if (setUserRSVPdActual) {
            setUserRSVPdActual(false);
          }
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const eventContextValues: TEventContext = {
    userRSVPdOptimistic,
    setUserRSVPdOptimistic,
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    isLoading,
    setIsLoading,
  };

  return (
    <EventContext.Provider value={eventContextValues}>{children}</EventContext.Provider>
  );
};
