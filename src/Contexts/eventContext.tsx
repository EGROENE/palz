import { useState, createContext, ReactNode } from "react";
import { useLocalStorage } from "usehooks-ts";
import { TEventContext, TUser, TEvent } from "../types";
import Requests from "../requests";
import { useMainContext } from "../Hooks/useMainContext";
import { useUserContext } from "../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQuery, UseQueryResult, useMutation } from "@tanstack/react-query";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { setIsLoading, theme } = useMainContext();
  const { currentUser, userCreatedAccount } = useUserContext();

  const [currentEvent, setCurrentEvent] = useLocalStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing
  const [addEventIsInProgress, setAddEventIsInProgress] = useState<boolean>(false);
  const [eventEditIsInProgress, setEventEditIsInProgress] = useState<boolean>(false);
  const [eventDeletionIsInProgress, setEventDeletionIsInProgress] =
    useState<boolean>(false);
  const [eventImages, setEventImages] = useState<string[] | undefined>([]);

  const userHasLoggedIn = currentUser && userCreatedAccount !== null ? true : false;
  const fetchAllEventsQuery: UseQueryResult<TEvent[], Error> = useQuery({
    queryKey: ["allEvents"],
    queryFn: Requests.getAllEvents,
    enabled: userHasLoggedIn,
  });
  const allEvents: TEvent[] | undefined = fetchAllEventsQuery.data;

  const addEventImageMutation = useMutation({
    mutationFn: ({ event, base64 }: { event: TEvent; base64: string }) =>
      Requests.addEventImage(event, base64),
    onSuccess: () => {
      toast.success("Event image added", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid green",
        },
      });
    },
    onError: (error, variables) => {
      console.log(error);
      setEventImages(eventImages?.filter((image) => image !== variables.base64));
      toast.error(
        "Could not add event image. Please ensure image is size is 50MB or less & try again.",
        {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        }
      );
    },
  });

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

    setIsLoading(true);

    if (displayedUsers && setDisplayedUsers) {
      setDisplayedUsers(displayedUsers.filter((u) => user?._id !== u._id));
    }

    Requests.removeInvitee(event, user)
      .then((response) => {
        if (!response.ok) {
          if (displayedUsers && setDisplayedUsers) {
            setDisplayedUsers(displayedUsers);
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
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const navigation = useNavigate();

  const handleAddRemoveUserAsOrganizer = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLLIElement, MouseEvent>,
    organizers: string[],
    setOrganizers: React.Dispatch<React.SetStateAction<string[]>>,
    user: TUser,
    event?: TEvent
  ): void => {
    e?.preventDefault();
    if (user && user._id) {
      if (organizers.includes(user._id)) {
        // Remove non-current user who isn't currentUser
        setOrganizers(organizers.filter((organizerID) => organizerID !== user._id));
      } else {
        // Add non-current user as organizer
        setOrganizers(organizers.concat(user._id));
      }
    } else {
      // Remove currentUser as organizer
      Requests.removeOrganizer(event, currentUser)
        .then((response) => {
          if (!response.ok) {
            toast.error("Could not remove you as user. Please try again.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          } else {
            toast(
              "You have removed yourself as an organizer & are no longer able to make changes to that event.",
              {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              }
            );
            navigation(`/${currentUser?.username}`);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  const eventContextValues: TEventContext = {
    addEventImageMutation,
    eventImages,
    setEventImages,
    allEvents,
    fetchAllEventsQuery,
    handleAddRemoveUserAsOrganizer,
    handleRemoveInvitee,
    handleDeclineInvitation,
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    eventEditIsInProgress,
    setEventEditIsInProgress,
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
