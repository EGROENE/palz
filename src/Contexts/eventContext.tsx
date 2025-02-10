import { useState, createContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { TEventContext, TUser, TEvent, TEventValuesToUpdate } from "../types";
import Methods from "../methods";
import Requests from "../requests";
import { useMainContext } from "../Hooks/useMainContext";
import { useUserContext } from "../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { setIsLoading, theme } = useMainContext();
  const { currentUser, userCreatedAccount } = useUserContext();

  const userHasLoggedIn = currentUser && userCreatedAccount !== null ? true : false;
  const fetchAllEventsQuery: UseQueryResult<TEvent[], Error> = useQuery({
    queryKey: ["allEvents"],
    queryFn: Requests.getAllEvents,
    enabled: userHasLoggedIn,
  });

  let allEvents: TEvent[] | undefined = fetchAllEventsQuery.data;

  const [currentEvent, setCurrentEvent] = useLocalStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing
  const [addEventIsInProgress, setAddEventIsInProgress] = useState<boolean>(false);
  const [eventEditIsInProgress, setEventEditIsInProgress] = useState<boolean>(false);
  const [eventDeletionIsInProgress, setEventDeletionIsInProgress] =
    useState<boolean>(false);

  // State values  pertaining to properties on TEvent, along w/ error values to be used on EventForm:
  // Initialize these to characteristics of currentEvent if defined; update in useEffect dependent on currentEvent, allEvents, maybe more
  const [eventTitle, setEventTitle] = useState<string>(
    currentEvent ? currentEvent.title : ""
  );
  const [eventTitleError, setEventTitleError] = useState<string>(
    !currentEvent ? "Please fill out this field" : ""
  );
  const [eventDescription, setEventDescription] = useState<string>(
    currentEvent ? currentEvent.description : ""
  );
  const [eventDescriptionError, setEventDescriptionError] = useState<string>(
    !currentEvent ? "Please fill out this field" : ""
  );
  const [eventAdditionalInfo, setEventAdditionalInfo] = useState<string>(
    currentEvent ? currentEvent.additionalInfo : ""
  );
  const [eventAdditionalInfoError, setEventAdditionalInfoError] = useState<string>("");
  const [eventCity, setEventCity] = useState<string | undefined>(
    currentEvent ? currentEvent.city : ""
  );
  const [eventState, setEventState] = useState<string | undefined>(
    currentEvent ? currentEvent.stateProvince : ""
  );
  const [eventCountry, setEventCountry] = useState<string | undefined>(
    currentEvent ? currentEvent.country : ""
  );
  const [eventLocationError, setEventLocationError] = useState<string>(
    !currentEvent ? "Please fill out all 3 location fields" : ""
  );
  const [eventStartDateMidnightUTCInMS, setEventStartDateMidnightUTCInMS] =
    useState<number>(currentEvent ? currentEvent.eventStartDateMidnightUTCInMS : 0);
  const [eventStartTimeAfterMidnightUTCInMS, setEventStartTimeAfterMidnightUTCInMS] =
    useState<number>(currentEvent ? currentEvent.eventStartTimeAfterMidnightUTCInMS : -1); // set to this instead of undefined or null in order to avoid TS errors
  const [eventStartDateTimeError, setEventStartDateTimeError] = useState<string>(
    !currentEvent ? "Please specify when event begins" : ""
  );
  const [eventEndDateMidnightUTCInMS, setEventEndDateMidnightUTCInMS] = useState<number>(
    currentEvent && currentEvent.eventEndDateMidnightUTCInMS !== undefined
      ? currentEvent.eventEndDateMidnightUTCInMS
      : 0
  );
  const [eventEndTimeAfterMidnightUTCInMS, setEventEndTimeAfterMidnightUTCInMS] =
    useState<number>(
      currentEvent && currentEvent.eventEndTimeAfterMidnightUTCInMS !== undefined
        ? currentEvent.eventEndTimeAfterMidnightUTCInMS
        : -1 // set to this instead of undefined or null in order to avoid TS errors
    );
  const [eventEndDateTimeError, setEventEndDateTimeError] = useState<string>(
    !currentEvent ? "Please specify when event ends" : ""
  );
  const [eventAddress, setEventAddress] = useState<string | undefined>(
    currentEvent ? currentEvent.address : ""
  );
  const [eventAddressError, setEventAddressError] = useState<string>(
    !currentEvent ? "Please fill out this field" : ""
  );
  const [maxParticipants, setMaxParticipants] = useState<number | null>(
    currentEvent ? currentEvent.maxParticipants : null
  );
  const [publicity, setPublicity] = useState<"public" | "private">(
    currentEvent ? currentEvent.publicity : "public"
  );
  const [organizers, setOrganizers] = useState<string[]>(
    currentEvent ? currentEvent.organizers : [`${currentUser?._id}`]
  );
  const [invitees, setInvitees] = useState<string[]>(
    currentEvent ? currentEvent.invitees : []
  );
  const [relatedInterests, setRelatedInterests] = useState<string[]>(
    currentEvent ? currentEvent.relatedInterests : []
  );
  const [eventImages, setEventImages] = useState<string[]>([]);
  ///////////////////////

  const [userRSVPd, setUserRSVPd] = useState<boolean | null>(null);

  useEffect(() => {
    if (currentEvent && currentUser?._id) {
      setUserRSVPd(currentEvent.interestedUsers.includes(currentUser._id));
      setEventTitle(currentEvent.title);
      setEventDescription(currentEvent.description);
      setEventAdditionalInfo(currentEvent.additionalInfo);
      setEventCity(currentEvent.city);
      setEventState(currentEvent.stateProvince);
      setEventCountry(currentEvent.country);
      setEventStartDateMidnightUTCInMS(currentEvent.eventStartDateMidnightUTCInMS);
      setEventStartTimeAfterMidnightUTCInMS(
        currentEvent.eventStartTimeAfterMidnightUTCInMS
      );
      setEventEndDateMidnightUTCInMS(currentEvent.eventEndDateMidnightUTCInMS);
      setEventEndTimeAfterMidnightUTCInMS(currentEvent.eventEndTimeAfterMidnightUTCInMS);
      setEventAddress(currentEvent.address);
      setMaxParticipants(currentEvent.maxParticipants);
      setPublicity(currentEvent.publicity);
      setOrganizers(currentEvent.organizers);
      setInvitees(currentEvent.invitees);
      setRelatedInterests(currentEvent.relatedInterests);
    }
  }, [currentEvent, allEvents]);

  // Update currentEvent, eventImages w/ most recent info after fetchAllEventsQuery.data changes
  useEffect(() => {
    if (fetchAllEventsQuery.data && currentEvent) {
      const updatedEvent = fetchAllEventsQuery.data.filter(
        (ev) => ev._id === currentEvent._id
      )[0];
      setCurrentEvent(updatedEvent);
      setEventImages(updatedEvent.images);
    }
  }, [fetchAllEventsQuery.data]);

  const queryClient = useQueryClient();

  const addEventImageMutation = useMutation({
    mutationFn: ({ event, base64 }: { event: TEvent; base64: string }) =>
      Requests.addEventImage(event, base64),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      if (currentEvent && fetchAllEventsQuery.data) {
        allEvents = fetchAllEventsQuery.data;
        const updatedEvent = allEvents.filter(
          (event) => event._id === currentEvent._id
        )[0];
        setCurrentEvent(updatedEvent);
      }
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

  const removeEventImageMutation = useMutation({
    mutationFn: ({
      event,
      imageToBeRemoved,
    }: {
      event: TEvent;
      imageToBeRemoved: string;
    }) => Requests.removeEventImage(event, imageToBeRemoved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      allEvents = fetchAllEventsQuery.data;
      if (currentEvent && fetchAllEventsQuery.data) {
        allEvents = fetchAllEventsQuery.data;
        const updatedEvent = allEvents.filter(
          (event) => event._id === currentEvent._id
        )[0];
        setCurrentEvent(updatedEvent);
      }
      toast("Event image removed", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onError: (error, variables) => {
      setEventImages(eventImages?.concat(variables.imageToBeRemoved));
      console.log(error);
      toast.error("Could not remove event image. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
  });

  const addUserRSVPMutation = useMutation({
    mutationFn: ({ user, event }: { user: TUser; event: TEvent }) =>
      Requests.addUserRSVP(user, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "allEvents" });
      toast.success("RSVP added!", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid green",
        },
      });
    },
    onError: (error) => {
      setUserRSVPd(false);
      console.log(error);
      toast.error("Could not RSVP to event. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => setIsLoading(false),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({
      event,
      valuesToUpdate,
    }: {
      event: TEvent;
      valuesToUpdate: TEventValuesToUpdate;
    }) => Requests.updateEvent(event, valuesToUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "allEvents" });

      toast.success("Event updated!", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid green",
        },
      });

      /* Update fields corresponding to updated props on currentEvent w/o waiting for request to be made & state(s) to be set: */
      if (valuesToUpdate?.title) {
        setEventTitle(valuesToUpdate.title);
      }
      if (valuesToUpdate?.organizers) {
        setOrganizers(valuesToUpdate.organizers);
      }
      if (valuesToUpdate?.invitees) {
        setInvitees(valuesToUpdate.invitees);
      }
      if (valuesToUpdate?.description) {
        setEventDescription(valuesToUpdate.description);
      }
      if (valuesToUpdate?.additionalInfo) {
        setEventAdditionalInfo(valuesToUpdate.additionalInfo);
      }
      if (valuesToUpdate?.city) {
        setEventCity(valuesToUpdate.city);
      }
      if (valuesToUpdate?.stateProvince) {
        setEventState(valuesToUpdate.stateProvince);
      }
      if (valuesToUpdate?.country) {
        setEventCountry(valuesToUpdate.country);
      }
      if (valuesToUpdate?.publicity) {
        setPublicity(valuesToUpdate.publicity);
      }
      if (valuesToUpdate?.maxParticipants) {
        setMaxParticipants(valuesToUpdate.maxParticipants);
      }
      if (valuesToUpdate?.address) {
        setEventAddress(valuesToUpdate.address);
      }
      if (valuesToUpdate?.relatedInterests) {
        setRelatedInterests(valuesToUpdate.relatedInterests);
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Could not update event. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => {
      setEventEditIsInProgress(false);
      setIsLoading(false);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: ({ eventInfos }: { eventInfos: TEvent }) =>
      Requests.createEvent(eventInfos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "allEvents" });
      toast.success("Event created!", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid green",
        },
      });
      navigation(`/${currentUser?.username}/events`);
    },
    onError: (error) => {
      console.log(error);
      toast.error("Could not create event. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => {
      setAddEventIsInProgress(false);
      setIsLoading(false);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: ({ event }: { event: TEvent }) => Requests.deleteEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "allEvents" });
      toast("Event deleted", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      navigation(`/${currentUser?.username}`);
    },
    onError: () => {
      toast.error("Could not delete event. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => {
      setEventDeletionIsInProgress(false);
      setIsLoading(false);
    },
  });

  const addToDisinterestedUsersMutation = useMutation({
    mutationFn: ({ user, event }: { user: TUser; event: TEvent }) =>
      Requests.addToDisinterestedUsers(user, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: "allEvents" });
      toast("Invitation declined.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Could not decline invitation. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    },
    onSettled: () => setIsLoading(false),
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
    if (currentUser) {
      const user = currentUser;
      addUserRSVPMutation.mutate({ user, event });
    }
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
          queryClient.invalidateQueries({ queryKey: "allEvents" });
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
    if (currentUser) {
      const user = currentUser;
      addToDisinterestedUsersMutation.mutate({ user, event });
    }
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
          queryClient.invalidateQueries({ queryKey: "allEvents" });
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
        // Only state values are updated for now; DB updated when form is saved
        // Remove user who isn't currentUser
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
            queryClient.invalidateQueries({ queryKey: "allEvents" });
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

  /* valuesToUpdate is to be used on EventForm. It's an object that represents updated values on event, which are sent to the event in the DB in a PATCH request
   */
  const getValuesToUpdate = (): TEventValuesToUpdate | undefined => {
    // interestedUsers omitted from type b/c that is not controllable with this form, rather changes depending on other users RSVPing or de-RSVPing.
    if (currentEvent) {
      return {
        ...(eventTitle?.trim() !== "" &&
          eventTitle.trim() !== currentEvent.title && {
            title: eventTitle,
          }),
        ...(eventStartDateMidnightUTCInMS !==
          currentEvent.eventStartDateMidnightUTCInMS && {
          eventStartDateMidnightUTCInMS: eventStartDateMidnightUTCInMS,
        }),
        ...(eventStartTimeAfterMidnightUTCInMS !==
          currentEvent.eventStartTimeAfterMidnightUTCInMS && {
          eventStartTimeAfterMidnightUTCInMS: eventStartTimeAfterMidnightUTCInMS,
        }),
        ...(eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS !==
          currentEvent.eventStartDateTimeInMS && {
          eventStartDateTimeInMS:
            eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS,
        }),
        ...(eventEndDateMidnightUTCInMS !== currentEvent.eventEndDateMidnightUTCInMS && {
          eventEndDateMidnightUTCInMS: eventEndDateMidnightUTCInMS,
        }),
        ...(eventEndTimeAfterMidnightUTCInMS !==
          currentEvent.eventEndTimeAfterMidnightUTCInMS && {
          eventEndTimeAfterMidnightUTCInMS: eventEndTimeAfterMidnightUTCInMS,
        }),
        ...(eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS !==
          currentEvent.eventEndDateTimeInMS && {
          eventEndDateTimeInMS:
            eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS,
        }),
        ...(organizers !== currentEvent.organizers && {
          organizers: organizers,
        }),
        ...(invitees !== currentEvent.invitees && { invitees: invitees }),
        ...(eventDescription !== "" &&
          eventDescription !== currentEvent.description && {
            description: eventDescription.trim(),
          }),
        ...(eventAdditionalInfo !== currentEvent.additionalInfo && {
          additionalInfo: eventAdditionalInfo.trim(),
        }),
        ...(eventCity !== "" &&
          eventCity?.trim() !== currentEvent.city && {
            city: Methods.formatHyphensAndSpacesInString(
              Methods.formatCapitalizedName(eventCity)
            ),
          }),
        ...(eventState !== "" &&
          eventState?.trim() !== currentEvent.stateProvince && {
            stateProvince: Methods.formatHyphensAndSpacesInString(
              Methods.formatCapitalizedName(eventState)
            ),
          }),
        ...(eventCountry !== "" &&
          eventCountry !== currentEvent.country && {
            country: eventCountry,
          }),
        ...(publicity !== currentEvent.publicity && {
          publicity: publicity,
        }),
        ...(maxParticipants !== currentEvent.maxParticipants && {
          maxParticipants: maxParticipants,
        }),
        ...(eventAddress?.trim() !== "" &&
          eventAddress?.trim() !== currentEvent.address && {
            address: eventAddress?.trim(),
          }),
        ...(relatedInterests !== currentEvent.relatedInterests && {
          relatedInterests: relatedInterests,
        }),
      };
    }
  };
  const valuesToUpdate: TEventValuesToUpdate | undefined = getValuesToUpdate();

  const eventContextValues: TEventContext = {
    deleteEventMutation,
    createEventMutation,
    updateEventMutation,
    valuesToUpdate,
    userRSVPd,
    setUserRSVPd,
    eventTitle,
    setEventTitle,
    eventTitleError,
    setEventTitleError,
    eventDescription,
    setEventDescription,
    eventDescriptionError,
    setEventDescriptionError,
    eventAdditionalInfo,
    setEventAdditionalInfo,
    eventAdditionalInfoError,
    setEventAdditionalInfoError,
    eventCity,
    setEventCity,
    eventState,
    setEventState,
    eventCountry,
    setEventCountry,
    eventLocationError,
    setEventLocationError,
    eventStartDateMidnightUTCInMS,
    setEventStartDateMidnightUTCInMS,
    eventStartTimeAfterMidnightUTCInMS,
    setEventStartTimeAfterMidnightUTCInMS,
    eventStartDateTimeError,
    setEventStartDateTimeError,
    eventEndDateMidnightUTCInMS,
    setEventEndDateMidnightUTCInMS,
    eventEndTimeAfterMidnightUTCInMS,
    setEventEndTimeAfterMidnightUTCInMS,
    eventEndDateTimeError,
    setEventEndDateTimeError,
    eventAddress,
    setEventAddress,
    eventAddressError,
    setEventAddressError,
    maxParticipants,
    setMaxParticipants,
    publicity,
    setPublicity,
    organizers,
    setOrganizers,
    invitees,
    setInvitees,
    relatedInterests,
    setRelatedInterests,
    addEventImageMutation,
    removeEventImageMutation,
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
