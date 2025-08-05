import { useState, createContext, ReactNode } from "react";
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
import { useNavigate } from "react-router-dom";

export const EventContext = createContext<TEventContext | null>(null);

export const EventContextProvider = ({ children }: { children: ReactNode }) => {
  const { setIsLoading, theme, setSavedInterests, savedInterests } = useMainContext();
  const { currentUser } = useUserContext();

  const [allCurrentUserUpcomingEvents, setAllCurrentUserUpcomingEvents] = useState<
    TEvent[]
  >([]);

  const [currentEvent, setCurrentEvent] = useLocalStorage<TEvent | undefined>(
    "currentEvent",
    undefined
  ); // event user is editing or viewing

  const [disinterestedUsersCurrentEvent, setDisinterestedUsersCurrentEvent] = useState<
    string[]
  >(currentEvent ? currentEvent.disinterestedUsers : []);

  const [interestedUsersCurrentEvent, setInterestedUsersCurrentEvent] = useState<
    string[]
  >(currentEvent ? currentEvent.interestedUsers : []);

  const [inviteesCurrentEvent, setInviteesCurrentEvent] = useState<string[]>(
    currentEvent ? currentEvent.invitees : []
  );

  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);
  const [showInvitees, setShowInvitees] = useState<boolean>(false);
  const [showDeclinedInvitations, setShowDeclinedInvitations] = useState<boolean>(false);

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
  const [organizers, setOrganizers] = useState<TBarebonesUser[]>([]);
  const [organizersORIGINAL, setOrganizersORIGINAL] = useState<TBarebonesUser[]>([]);
  const [invitees, setInvitees] = useState<TBarebonesUser[]>([]);
  const [inviteesORIGINAL, setInviteesORIGINAL] = useState<TBarebonesUser[]>([]);
  const [eventImages, setEventImages] = useState<string[]>(
    currentEvent ? currentEvent.images : []
  );
  const [blockedUsersEvent, setBlockedUsersEvent] = useState<TBarebonesUser[]>([]);
  const [blockedUsersEventORIGINAL, setBlockedUsersEventORIGINAL] = useState<
    TBarebonesUser[]
  >([]);
  ///////////////////////

  const handleAddUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    rsvpdUsers?: string[],
    setRsvpdUsers?: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    if (currentUser && currentUser._id && rsvpdUsers && setRsvpdUsers) {
      setRsvpdUsers(rsvpdUsers.concat(currentUser._id.toString()));
    }
    Requests.addUserRSVP(currentUser, event)
      .then((res) => {
        if (res.ok) {
          toast.success("RSVP added!", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid green",
            },
          });
        } else {
          if (currentUser && currentUser._id && rsvpdUsers && setRsvpdUsers) {
            setRsvpdUsers(
              rsvpdUsers?.filter((userID) => userID !== currentUser._id?.toString())
            );
          }
          toast.error("Could not RSVP to event. Please try again.", {
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

  const handleDeleteUserRSVP = (
    event: TEvent,
    user: TBarebonesUser,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    rsvpdUsers?: string[],
    setRsvpdUsers?: React.Dispatch<React.SetStateAction<string[]>>,
    optRenderCurrentUserEvents?: boolean
  ): void => {
    e?.preventDefault();

    if (rsvpdUsers && setRsvpdUsers) {
      setRsvpdUsers(rsvpdUsers.filter((u) => u !== user._id));
    }

    if (optRenderCurrentUserEvents) {
      setAllCurrentUserUpcomingEvents(
        allCurrentUserUpcomingEvents.filter((ev) => ev !== event)
      );
    }

    setIsLoading(true);

    Requests.deleteUserRSVP(Methods.getTBarebonesUser(user), event)
      .then((res) => {
        if (res.ok) {
          toast("RSVP deleted", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          if (rsvpdUsers && setRsvpdUsers && currentUser && currentUser._id) {
            setRsvpdUsers(rsvpdUsers.concat(currentUser._id.toString()));
          }
          if (optRenderCurrentUserEvents) {
            setAllCurrentUserUpcomingEvents(allCurrentUserUpcomingEvents.concat(event));
          }
          toast.error("Could not remove RSVP. Please try again.", {
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

  const handleDeclineInvitation = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    eventsArray?: TEvent[],
    setEventsArray?: React.Dispatch<React.SetStateAction<TEvent[]>>,
    optRenderCurrentUserEvents?: boolean
  ) => {
    e.preventDefault();
    if (currentUser) {
      if (eventsArray && setEventsArray) {
        setEventsArray(eventsArray.filter((e) => e !== event));
      }
      if (optRenderCurrentUserEvents) {
        setAllCurrentUserUpcomingEvents(
          allCurrentUserUpcomingEvents.filter((ev) => ev !== event)
        );
      }
      setIsLoading(true);
      Requests.addToDisinterestedUsers(currentUser, event)
        .then((res) => {
          if (res.ok) {
            toast("Invitation declined.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          } else {
            if (eventsArray && setEventsArray) {
              setEventsArray(eventsArray.concat(event));
            }
            if (optRenderCurrentUserEvents) {
              setAllCurrentUserUpcomingEvents(allCurrentUserUpcomingEvents.concat(event));
            }
            toast.error("Could not decline invitation. Please try again.", {
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
    } else {
      toast.error("Could not decline invitation. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  };

  const handleRemoveInvitee = (
    event: TEvent,
    user: TBarebonesUser | null,
    userArray?: string[],
    setUserArray?: React.Dispatch<React.SetStateAction<string[]>>,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e?.preventDefault();

    if (user) {
      if (userArray && setUserArray) {
        setUserArray(userArray.filter((u) => u !== user._id));
      }
      setIsLoading(true);
      Requests.removeInvitee(event, user)
        .then((res) => {
          if (res.ok) {
            toast("Invitee removed", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          } else {
            if (userArray && setUserArray && user._id) {
              setUserArray(userArray.concat(user._id.toString()));
            }
            toast.error("Could not remove invitee. Please try again.", {
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
    } else {
      toast.error("Could not remove invitee. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  };

  const handleRemoveDisinterestedUser = (
    event: TEvent,
    user: TBarebonesUser | null
  ): void => {
    setIsLoading(true);
    if (disinterestedUsersCurrentEvent) {
      setDisinterestedUsersCurrentEvent(
        disinterestedUsersCurrentEvent.filter((u) => {
          if (user && user._id) {
            return u !== user._id.toString();
          }
        })
      );
    }
    Requests.deleteFromDisinterestedUsers(user, event)
      .then((res) => {
        if (res.ok) {
          toast("User removed from declined invitations.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          if (user && user._id && disinterestedUsersCurrentEvent) {
            setDisinterestedUsersCurrentEvent(
              disinterestedUsersCurrentEvent.concat(user._id.toString())
            );
          }
          toast.error(
            "Could not remove user from declined invitations. Please try again.",
            {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            }
          );
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  // Removes organizer from event.organizers. Request sent to DB.
  const handleRemoveOrganizer = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser | TOtherUser | null
  ) => {
    e.preventDefault();
    if (user) {
      setIsLoading(true);
      Requests.removeOrganizer(event, user)
        .then((res) => {
          if (res.ok) {
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
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
    } else {
      toast.error("Could not remove invitee. Please try again.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  };

  const navigation = useNavigate();

  const handleAddRemoveBlockedUserOnEvent = (user?: TBarebonesUser): void => {
    // find way to add TBarebonesUser to blockedUsersEvent when creating new event
    if (user && user._id) {
      if (blockedUsersEvent.map((b) => b._id).includes(user._id.toString())) {
        setBlockedUsersEvent(
          blockedUsersEvent.filter((blockee) => blockee._id !== user._id)
        );
      } else {
        if (invitees.map((u) => u._id).includes(user._id)) {
          setInvitees(invitees.filter((u) => u._id !== user._id));
        }

        if (organizers.map((u) => u._id).includes(user._id.toString())) {
          setOrganizers(organizers.filter((u) => u._id !== user._id));
        }

        setBlockedUsersEvent(blockedUsersEvent.concat(user));
      }
    }
  };

  // Used in dropdown list of potential organizers; changes are only made to organizers variable in state
  const handleAddRemoveUserAsOrganizer = (
    organizers: (TBarebonesUser | TOtherUser)[],
    setOrganizers: React.Dispatch<React.SetStateAction<(TBarebonesUser | TOtherUser)[]>>,
    user: TBarebonesUser,
    e?: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    if (organizers.map((o) => o._id).includes(user?._id?.toString())) {
      if (user._id === currentUser?._id) {
        e?.preventDefault();
        // Remove self as organizer:
        // DB is updated immediately, redirect to homepage
        setIsLoading(true);
        if (currentEvent && currentUser) {
          Requests.removeOrganizer(currentEvent, currentUser)
            .then((res) => {
              if (res.ok) {
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
            })
            .catch((error) => console.log(error))
            .finally(() => setIsLoading(false));
        }
      } else {
        // Remove other user as organizer:
        // Only state values are updated for now; DB updated when form is saved
        setOrganizers(organizers.filter((o) => o._id !== user._id));
      }
    } else {
      // Add non-current user as organizer
      if (invitees.map((u) => u._id).includes(user._id)) {
        setInvitees(invitees.filter((u) => u._id !== user._id));
      }

      if (user._id && blockedUsersEvent.map((u) => u._id).includes(user._id.toString())) {
        setBlockedUsersEvent(blockedUsersEvent.filter((u) => u._id !== user._id));
      }

      setOrganizers(organizers.concat(user));
    }
  };

  const handleAddRemoveUserAsInvitee = (
    invitees: (TBarebonesUser | TOtherUser)[],
    setInvitees: React.Dispatch<React.SetStateAction<(TBarebonesUser | TOtherUser)[]>>,
    user?: TBarebonesUser
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
        if (organizers.map((u) => u._id).includes(user._id)) {
          setOrganizers(organizers.filter((u) => u._id !== user._id));
        }

        if (
          user._id &&
          blockedUsersEvent.map((u) => u._id).includes(user._id.toString())
        ) {
          setBlockedUsersEvent(blockedUsersEvent.filter((u) => u._id !== user._id));
        }

        setInvitees(invitees.concat(Methods.getTBarebonesUser(user)));
      }
    }
  };

  const handleAddEventInterest = (interest: string): void =>
    setSavedInterests(savedInterests.concat(interest));

  const handleRemoveEventInterest = (interest: string): void =>
    setSavedInterests(savedInterests.filter((int) => int !== interest));

  /* 
  eventValuesToUpdate is to be used on EventForm. It's an object that represents updated values on event, which are sent to the event in the DB in a PATCH request
   */
  const getValuesToUpdate = (): TEventValuesToUpdate | undefined => {
    // interestedUsers omitted from type b/c that is not controllable with this form, rather changes depending on other users RSVPing or de-RSVPing.
    if (currentEvent) {
      return {
        ...(!Methods.arraysAreIdentical(currentEvent.images, eventImages) && {
          images: eventImages,
        }),
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
        ...(!Methods.arraysAreIdentical(
          organizers.map((u) => u._id),
          currentEvent.organizers
        ) && {
          organizers: organizers
            .map((o) => o._id?.toString())
            .filter((elem) => elem !== undefined),
        }),
        ...(!Methods.arraysAreIdentical(
          invitees.map((u) => u._id),
          currentEvent.invitees
        ) && {
          invitees: invitees
            .map((i) => i._id?.toString())
            .filter((elem) => elem !== undefined),
        }),
        ...(!Methods.arraysAreIdentical(
          blockedUsersEvent.map((u) => u._id),
          currentEvent.blockedUsersEvent
        ) && {
          blockedUsersEvent: blockedUsersEvent
            .map((bue) => bue._id?.toString())
            .filter((elem) => elem !== undefined),
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
        ...(savedInterests !== currentEvent.relatedInterests && {
          relatedInterests: savedInterests,
        }),
      };
    }
  };
  const eventValuesToUpdate: TEventValuesToUpdate | undefined = getValuesToUpdate();

  const eventContextValues: TEventContext = {
    handleAddEventInterest,
    handleRemoveEventInterest,
    inviteesCurrentEvent,
    setInviteesCurrentEvent,
    allCurrentUserUpcomingEvents,
    setAllCurrentUserUpcomingEvents,
    interestedUsersCurrentEvent,
    setInterestedUsersCurrentEvent,
    disinterestedUsersCurrentEvent,
    setDisinterestedUsersCurrentEvent,
    handleRemoveDisinterestedUser,
    showDeclinedInvitations,
    setShowDeclinedInvitations,
    inviteesORIGINAL,
    setInviteesORIGINAL,
    organizersORIGINAL,
    setOrganizersORIGINAL,
    handleRemoveOrganizer,
    showRSVPs,
    setShowRSVPs,
    showInvitees,
    setShowInvitees,
    handleAddRemoveBlockedUserOnEvent,
    handleAddRemoveUserAsInvitee,
    blockedUsersEvent,
    setBlockedUsersEvent,
    blockedUsersEventORIGINAL,
    setBlockedUsersEventORIGINAL,
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
    eventImages,
    setEventImages,
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
