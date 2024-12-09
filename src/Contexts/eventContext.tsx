import { useState, createContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { TEventContext, TUser, TEvent } from "../types";
import Requests from "../requests";
import { useMainContext } from "../Hooks/useMainContext";
import { useUserContext } from "../Hooks/useUserContext";
import toast from "react-hot-toast";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { setIsLoading } = useMainContext();
  const { currentUser } = useUserContext();

  const [currentEvent, setCurrentEvent] = useLocalStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing
  const [allEvents, setAllEvents] = useLocalStorage<TEvent[]>("allEvents", []);
  const [addEventIsInProgress, setAddEventIsInProgress] = useState<boolean>(false);
  const [eventEditIsInProgress, setEventEditIsInProgress] = useState<boolean>(false);
  const [eventDeletionIsInProgress, setEventDeletionIsInProgress] =
    useState<boolean>(false);

  useEffect(() => {
    fetchAllEvents();
  }, [allEvents]);

  const fetchAllEvents = (): Promise<void> => Requests.getAllEvents().then(setAllEvents);

  const handleAddUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    setUserRSVPd?: React.Dispatch<React.SetStateAction<boolean | null>>
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    if (setUserRSVPd) {
      setUserRSVPd(true);
    }
    Requests.addUserRSVP(currentUser, event)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not RSVP to event. Please try again.");
          if (setUserRSVPd) {
            setUserRSVPd(false);
          }
        } else {
          toast.success("RSVP added");
          if (setUserRSVPd) {
            setUserRSVPd(true);
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
    setUserRSVPd?: React.Dispatch<React.SetStateAction<boolean | null>>
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    if (setUserRSVPd) {
      setUserRSVPd(false);
    }
    Requests.deleteUserRSVP(user, event)
      .then((response) => {
        if (!response.ok) {
          if (setUserRSVPd) {
            setUserRSVPd(true);
          }
          toast.error("Could not remove RSVP. Please try again.");
        } else {
          toast.error("RSVP deleted");
          if (setUserRSVPd) {
            setUserRSVPd(false);
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
    user: TUser | null
  ): void => {
    e.preventDefault();
    Requests.removeInvitee(event, user)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not remove invitee. Please try again.");
        } else {
          toast.error("Invitee removed.");
        }
      })
      .catch((error) => console.log(error));
  };

  const eventContextValues: TEventContext = {
    handleRemoveInvitee,
    handleDeclineInvitation,
    handleAddUserRSVP,
    handleDeleteUserRSVP,
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
