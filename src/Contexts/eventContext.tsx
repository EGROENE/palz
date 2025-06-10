import { useState, createContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
  TEventContext,
  TUser,
  TEvent,
  TEventValuesToUpdate,
  TOtherUser,
  TBarebonesUser,
} from "../types";
import Methods from "../methods";
import Requests from "../requests";
import { useMainContext } from "../Hooks/useMainContext";
import { useUserContext } from "../Hooks/useUserContext";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
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

  const currentURL = useLocation().pathname;

  const fetchPotentialCoOrganizersQuery: UseQueryResult<TOtherUser[], Error> = useQuery({
    queryKey: ["potentialCoOrganizers"],
    queryFn: () =>
      Requests.getPotentialCoOrganizers(
        currentURL === "/add-event" ? "new" : "edit",
        currentUser && currentUser._id && currentUser._id.toString()
          ? currentUser._id.toString()
          : undefined
      ),
    enabled:
      userHasLoggedIn && (currentURL === "/add-event" || currentURL === "/edit-event"),
  });

  const fetchPotentialInviteesQuery: UseQueryResult<TOtherUser[], Error> = useQuery({
    queryKey: ["potentialCoOrganizers"],
    queryFn: () =>
      Requests.getPotentialInvitees(
        currentURL === "/add-event" ? "new" : "edit",
        currentUser && currentUser._id && currentUser._id.toString()
          ? currentUser._id.toString()
          : undefined
      ),
    enabled:
      userHasLoggedIn && (currentURL === "/add-event" || currentURL === "/edit-event"),
  });

  const [currentEvent, setCurrentEvent] = useLocalStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing

  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);
  const [showInvitees, setShowInvitees] = useState<boolean>(false);

  const [addEventIsInProgress, setAddEventIsInProgress] = useState<boolean>(false);
  const [eventEditIsInProgress, setEventEditIsInProgress] = useState<boolean>(false);
  const [eventDeletionIsInProgress, setEventDeletionIsInProgress] =
    useState<boolean>(false);

  const [displayedPotentialInviteeCount, setDisplayedPotentialInviteeCount] = useState<
    number | undefined
  >(10);
  const [displayedPotentialCoOrganizerCount, setDisplayedPotentialCoOrganizerCount] =
    useState<number | undefined>(10);
  const [displayedPotentialBlockeeCount, setDisplayedPotentialBlockeeCount] = useState<
    number | undefined
  >(10);

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
  const [organizers, setOrganizers] = useState<TBarebonesUser[]>(
    currentEvent ? currentEvent.organizers : []
  );
  const [invitees, setInvitees] = useState<TBarebonesUser[]>(
    currentEvent ? currentEvent.invitees : []
  );
  const [relatedInterests, setRelatedInterests] = useState<string[]>(
    currentEvent ? currentEvent.relatedInterests : []
  );
  const [eventImages, setEventImages] = useState<string[]>(
    currentEvent ? currentEvent.images : []
  );
  const [blockedUsersEvent, setBlockedUsersEvent] = useState<TBarebonesUser[]>(
    currentEvent ? currentEvent.blockedUsersEvent : []
  );
  ///////////////////////

  // Update currentEvent, eventImages w/ most recent info after fetchAllEventsQuery.data changes
  useEffect(() => {
    if (fetchAllEventsQuery.data && currentEvent && currentUser && currentUser._id) {
      const updatedEvent = fetchAllEventsQuery.data.filter(
        (ev) => ev._id === currentEvent._id
      )[0];
      setCurrentEvent(updatedEvent);
      setEventImages(updatedEvent.images);
      setEventTitle(updatedEvent.title);
      setEventDescription(updatedEvent.description);
      setEventAdditionalInfo(updatedEvent.additionalInfo);
      setEventCity(updatedEvent.city);
      setEventState(updatedEvent.stateProvince);
      setEventCountry(updatedEvent.country);
      setEventStartDateMidnightUTCInMS(updatedEvent.eventStartDateMidnightUTCInMS);
      setEventStartTimeAfterMidnightUTCInMS(
        updatedEvent.eventStartTimeAfterMidnightUTCInMS
      );
      setEventEndDateMidnightUTCInMS(updatedEvent.eventEndDateMidnightUTCInMS);
      setEventEndTimeAfterMidnightUTCInMS(updatedEvent.eventEndTimeAfterMidnightUTCInMS);
      setEventAddress(updatedEvent.address);
      setMaxParticipants(updatedEvent.maxParticipants);
      setPublicity(updatedEvent.publicity);
      setOrganizers(updatedEvent.organizers);
      setInvitees(updatedEvent.invitees);
      setRelatedInterests(updatedEvent.relatedInterests);
      setBlockedUsersEvent(updatedEvent.blockedUsersEvent);
    }
  }, [fetchAllEventsQuery.data]);

  const queryClient = useQueryClient();

  const addEventImageMutation = useMutation({
    mutationFn: ({ event, base64 }: { event: TEvent; base64: string }) =>
      Requests.addEventImage(event, base64),
    onSuccess: (data, variables) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
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
      } else {
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
      }
    },
    onError: (error) => console.log(error),
  });

  const removeEventImageMutation = useMutation({
    mutationFn: ({
      event,
      imageToBeRemoved,
    }: {
      event: TEvent;
      imageToBeRemoved: string;
    }) => Requests.removeEventImage(event, imageToBeRemoved),
    onSuccess: (data, variables) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
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
      } else {
        setEventImages(eventImages?.concat(variables.imageToBeRemoved));
        toast.error("Could not remove event image. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
  });

  const addUserRSVPMutation = useMutation({
    mutationFn: ({ user, event }: { user: TOtherUser | TUser; event: TEvent }) =>
      Requests.addUserRSVP(user, event),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast.success("RSVP added!", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid green",
          },
        });
      } else {
        toast.error("Could not RSVP to event. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const removeUserRSVPMutation = useMutation({
    mutationFn: ({ user, event }: { user: TUser | TOtherUser; event: TEvent }) =>
      Requests.deleteUserRSVP(user, event),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast("RSVP deleted", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      } else {
        toast.error("Could not remove RSVP. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({
      event,
      eventValuesToUpdate,
    }: {
      event: TEvent;
      eventValuesToUpdate: TEventValuesToUpdate;
    }) => Requests.updateEvent(event, eventValuesToUpdate),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });

        toast.success("Event updated!", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid green",
          },
        });

        /* Update fields corresponding to updated props on currentEvent w/o waiting for request to be made & state(s) to be set: */
        if (eventValuesToUpdate?.title) {
          setEventTitle(eventValuesToUpdate.title);
        }
        if (eventValuesToUpdate?.organizers) {
          setOrganizers(eventValuesToUpdate.organizers);
        }
        if (eventValuesToUpdate?.invitees) {
          setInvitees(eventValuesToUpdate.invitees);
        }
        if (eventValuesToUpdate?.blockedUsersEvent) {
          setBlockedUsersEvent(eventValuesToUpdate.blockedUsersEvent);
        }
        if (eventValuesToUpdate?.description) {
          setEventDescription(eventValuesToUpdate.description);
        }
        if (eventValuesToUpdate?.additionalInfo) {
          setEventAdditionalInfo(eventValuesToUpdate.additionalInfo);
        }
        if (eventValuesToUpdate?.city) {
          setEventCity(eventValuesToUpdate.city);
        }
        if (eventValuesToUpdate?.stateProvince) {
          setEventState(eventValuesToUpdate.stateProvince);
        }
        if (eventValuesToUpdate?.country) {
          setEventCountry(eventValuesToUpdate.country);
        }
        if (eventValuesToUpdate?.publicity) {
          setPublicity(eventValuesToUpdate.publicity);
        }
        if (eventValuesToUpdate?.maxParticipants) {
          setMaxParticipants(eventValuesToUpdate.maxParticipants);
        }
        if (eventValuesToUpdate?.address) {
          setEventAddress(eventValuesToUpdate.address);
        }
        if (eventValuesToUpdate?.relatedInterests) {
          setRelatedInterests(eventValuesToUpdate.relatedInterests);
        }
      } else {
        toast.error("Could not update event. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => {
      setEventEditIsInProgress(false);
      setIsLoading(false);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: ({ eventInfo }: { eventInfo: TEvent }) => Requests.createEvent(eventInfo),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast.success("Event created!", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid green",
          },
        });
        navigation(`/${currentUser?.username}/events`);
      } else {
        toast.error("Could not create event. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => {
      setAddEventIsInProgress(false);
      setIsLoading(false);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: ({ event }: { event: TEvent }) => Requests.deleteEvent(event),
    onSuccess: (data) => {
      if (data.ok) {
        setCurrentEvent(undefined);
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast("Event deleted", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
        navigation(`/${currentUser?.username}`);
      } else {
        toast.error("Could not delete event. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => {
      setEventDeletionIsInProgress(false);
      setIsLoading(false);
    },
  });

  const addToDisinterestedUsersMutation = useMutation({
    mutationFn: ({ user, event }: { user: TUser; event: TEvent }) =>
      Requests.addToDisinterestedUsers(user, event),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast("Invitation declined.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      } else {
        toast.error("Could not decline invitation. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const removeInviteeMutation = useMutation({
    mutationFn: ({ event, user }: { event: TEvent; user: TUser | TOtherUser }) =>
      Requests.removeInvitee(event, user),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });

        toast("Invitee removed", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      } else {
        toast.error("Could not remove invitee. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const removeOrganizerMutation = useMutation({
    mutationFn: ({ event, user }: { event: TEvent; user: TUser | TOtherUser }) =>
      Requests.removeOrganizer(event, user),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast("Event organizer removed", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      } else {
        toast.error("Could not remove invitee. Please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const removeSelfAsEventOrganizerMutation = useMutation({
    mutationFn: ({ event, user }: { event: TEvent; user: TUser }) =>
      Requests.removeOrganizer(event, user),
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: ["allEvents"] });
        queryClient.refetchQueries({ queryKey: ["allEvents"] });
        toast("You have removed yourself as an organizer of this event.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
        // Redirect to currentUser's homepage, as they've lost rights to edit event:
        navigation(`/${currentUser?.username}`);
      } else {
        toast.error("Unable to remove you as organizer; please try again.", {
          style: {
            background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
            color: theme === "dark" ? "black" : "white",
            border: "2px solid red",
          },
        });
      }
    },
    onError: (error) => console.log(error),
    onSettled: () => setIsLoading(false),
  });

  const handleAddUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    if (currentUser) {
      const user = currentUser;
      addUserRSVPMutation.mutate({ user, event });
    }
  };

  const handleDeleteUserRSVP = (
    event: TEvent,
    user: TUser | TOtherUser,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();

    setIsLoading(true);

    removeUserRSVPMutation.mutate({ user, event });
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

  const handleRemoveInvitee = (
    event: TEvent,
    user: TUser | TOtherUser | null,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e.preventDefault();

    setIsLoading(true);

    if (user) {
      removeInviteeMutation.mutate({ event, user });
    }
  };

  // Removes organizer from event.organizers. Request sent to DB.
  const handleRemoveOrganizer = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | TOtherUser | null
  ) => {
    e.preventDefault();
    setIsLoading(true);
    if (user) {
      removeOrganizerMutation.mutate({ event, user });
    }
  };

  const navigation = useNavigate();

  const handleAddRemoveBlockedUserOnEvent = (
    user?: TOtherUser | TBarebonesUser
  ): void => {
    //e?.preventDefault();
    if (user && user._id) {
      if (blockedUsersEvent.map((bu) => bu._id).includes(user._id.toString())) {
        setBlockedUsersEvent(
          blockedUsersEvent.filter((blockee) => blockee._id !== user._id)
        );
      } else {
        setBlockedUsersEvent(
          blockedUsersEvent.concat({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            emailAddress: user.emailAddress,
          })
        );
      }
    }
  };

  // Used in dropdown list of potential organizers; changes are only made to organizers variable in state
  const handleAddRemoveUserAsOrganizer = (
    organizers: TBarebonesUser[],
    setOrganizers: React.Dispatch<React.SetStateAction<TBarebonesUser[]>>,
    user: TOtherUser,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    if (user && user._id && currentUser && currentUser._id) {
      if (organizers.map((o) => o._id).includes(user._id.toString())) {
        if (user._id === currentUser._id) {
          e?.preventDefault();
          // Remove self as organizer:
          // DB is updated immediately, redirect to homepage
          setIsLoading(true);
          if (currentEvent && currentUser) {
            const event = currentEvent;
            const user = currentUser;
            removeSelfAsEventOrganizerMutation.mutate({ event, user });
          }
        } else {
          // Remove other user as organizer:
          // Only state values are updated for now; DB updated when form is saved
          setOrganizers(
            organizers.filter((o) => {
              if (o._id !== user._id) {
                return o;
              }
            })
          );
        }
      } else {
        // Add non-current user as organizer
        setOrganizers(
          organizers.concat({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            emailAddress: user.emailAddress,
          })
        );
      }
    }
  };

  const handleAddRemoveUserAsInvitee = (
    invitees: TBarebonesUser[],
    setInvitees: React.Dispatch<React.SetStateAction<TBarebonesUser[]>>,
    user?: TOtherUser
  ): void => {
    if (user?._id) {
      if (invitees.map((i) => i._id).includes(user._id.toString())) {
        // Remove user as invitee
        setInvitees(
          invitees.filter((i) => {
            if (i._id !== user._id) {
              return i;
            }
          })
        );
      } else {
        setInvitees(
          invitees.concat({
            _id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            emailAddress: user.emailAddress,
          })
        );
      }
    }
  };

  /* 
  eventValuesToUpdate is to be used on EventForm. It's an object that represents updated values on event, which are sent to the event in the DB in a PATCH request
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
        ...(blockedUsersEvent !== currentEvent.blockedUsersEvent && {
          blockedUsersEvent: blockedUsersEvent,
        }),
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
  const eventValuesToUpdate: TEventValuesToUpdate | undefined = getValuesToUpdate();

  const eventContextValues: TEventContext = {
    fetchPotentialCoOrganizersQuery,
    fetchPotentialInviteesQuery,
    handleRemoveOrganizer,
    showRSVPs,
    setShowRSVPs,
    showInvitees,
    setShowInvitees,
    handleAddRemoveBlockedUserOnEvent,
    handleAddRemoveUserAsInvitee,
    displayedPotentialBlockeeCount,
    setDisplayedPotentialBlockeeCount,
    blockedUsersEvent,
    setBlockedUsersEvent,
    displayedPotentialInviteeCount,
    setDisplayedPotentialInviteeCount,
    displayedPotentialCoOrganizerCount,
    setDisplayedPotentialCoOrganizerCount,
    deleteEventMutation,
    createEventMutation,
    updateEventMutation,
    eventValuesToUpdate,
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
