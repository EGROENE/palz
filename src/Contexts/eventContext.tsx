import { useState, createContext, ReactNode, useEffect } from "react";
import { useSessionStorage } from "usehooks-ts";
import { TEventContext, TUser, TEvent } from "../types";
import Requests from "../requests";
import { useUserContext } from "../Hooks/useUserContext";
import toast from "react-hot-toast";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useUserContext();

  const [currentEvent, setCurrentEvent] = useSessionStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing
  const [allEvents, setAllEvents] = useSessionStorage<TEvent[]>("allEvents", []);
  const [addEventIsInProgress, setAddEventIsInProgress] = useState<boolean>(false);
  const [eventEditIsInProgress, setEventEditIsInProgress] = useState<boolean>(false);
  const [eventDeletionIsInProgress, setEventDeletionIsInProgress] =
    useState<boolean>(false);

  // Use for optimistic rendering related to event rsvp-ing
  const [userRSVPdOptimistic, setUserRSVPdOptimistic] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAllEvents();
  }, [allEvents]);

  const fetchAllEvents = (): Promise<void> => Requests.getAllEvents().then(setAllEvents);

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

  const handleDeclineInvitation = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ) => {
    e.preventDefault();
    setIsLoading(true);
    Requests.addToDisinterestedUsers(currentUser, event)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not decline invitation. Please try again.");
          fetchAllEvents();
        } else {
          toast.error("Invitation declined.");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Handler for user to decline invitation. Should remove them from invitees array.
  const handleRemoveInvitee = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | undefined
  ): void => {
    e.preventDefault();
    Requests.removeInvitee(event, user)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not decline invitation. Please try again.");
          fetchAllEvents();
        } else {
          toast.error("Invitation declined.");
        }
      })
      .catch((error) => console.log(error));
  };

  const eventContextValues: TEventContext = {
    handleRemoveInvitee,
    handleDeclineInvitation,
    userRSVPdOptimistic,
    setUserRSVPdOptimistic,
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    isLoading,
    setIsLoading,
    eventEditIsInProgress,
    setEventEditIsInProgress,
    fetchAllEvents,
    allEvents,
    setAllEvents,
    currentEvent,
    setCurrentEvent,
    addEventIsInProgress,
    setAddEventIsInProgress,
    eventDeletionIsInProgress,
    setEventDeletionIsInProgress,
  };

  return (
    <EventContext.Provider value={eventContextValues}>{children}</EventContext.Provider>
  );
};
