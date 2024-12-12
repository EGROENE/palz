import { useState, createContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { TEventContext, TUser, TEvent } from "../types";
import Requests from "../requests";
import { useMainContext } from "../Hooks/useMainContext";
import { useUserContext } from "../Hooks/useUserContext";
import toast from "react-hot-toast";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { setIsLoading, theme } = useMainContext();
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
          toast.error("Could not RSVP to event. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
          if (setUserRSVPd) {
            setUserRSVPd(false);
          }
        } else {
          toast.success("RSVP added!", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
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
    setUserRSVPd?: React.Dispatch<React.SetStateAction<boolean | null>>,
    displayedUsers?: TUser[],
    setDisplayedUsers?: React.Dispatch<React.SetStateAction<TUser[]>>
  ): void => {
    e.preventDefault();

    setIsLoading(true);

    if (setUserRSVPd) {
      setUserRSVPd(false);
    }

    if (displayedUsers && setDisplayedUsers) {
      setDisplayedUsers(displayedUsers.filter((u) => u._id !== user._id));
    }

    Requests.deleteUserRSVP(user, event)
      .then((response) => {
        if (!response.ok) {
          if (setUserRSVPd) {
            setUserRSVPd(true);
          }
          if (displayedUsers && setDisplayedUsers) {
            setDisplayedUsers(displayedUsers);
          }
          toast.error("Could not remove RSVP. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          toast("RSVP deleted", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
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
          toast.error("Could not decline invitation. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          toast("Invitation declined.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Handler for user to decline invitation. Should remove them from invitees array.
  const handleRemoveInvitee = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | null,
    displayedUsers?: TUser[],
    setDisplayedUsers?: React.Dispatch<React.SetStateAction<TUser[]>>
  ): void => {
    e.preventDefault();

    if (displayedUsers && setDisplayedUsers) {
      setDisplayedUsers(displayedUsers.filter((u) => user?._id !== u._id))
    }

    Requests.removeInvitee(event, user)
      .then((response) => {
        if (!response.ok) {
          if (displayedUsers && setDisplayedUsers) {
            setDisplayedUsers(displayedUsers)
          }
          toast.error("Could not remove invitee. Please try again.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          toast("Invitee removed", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
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
