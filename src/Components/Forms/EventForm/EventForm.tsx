import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TEvent, TThemeColor, TOtherUser, TBarebonesUser, TUser } from "../../../types";
import Methods from "../../../methods";
import { countries } from "../../../constants";
import toast from "react-hot-toast";
import Tab from "../../Elements/Tab/Tab";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { useEventContext } from "../../../Hooks/useEventContext";
import DropdownChecklist from "../../Elements/DropdownChecklist/DropdownChecklist";
import SearchAndDropdownList from "../../Elements/SearchAndDropdownList/SearchAndDropdownList";
import Requests from "../../../requests";

const EventForm = ({
  randomColor,
  usedFor,
  event,
}: {
  randomColor: TThemeColor | undefined;
  usedFor: "add-event" | "edit-event";
  event?: TEvent;
}) => {
  const { showSidebar, setShowSidebar, isLoading, setIsLoading, theme } =
    useMainContext();
  const { handleCityStateCountryInput, fetchAllVisibleOtherUsersQuery, currentUser } =
    useUserContext();

  const visibleOtherUsers: TOtherUser[] | undefined = fetchAllVisibleOtherUsersQuery.data;

  const {
    handleAddRemoveBlockedUserOnEvent,
    handleAddRemoveUserAsInvitee,
    setBlockedUsersEvent,
    blockedUsersEvent,
    currentEvent,
    setCurrentEvent,
    setAddEventIsInProgress,
    setEventDeletionIsInProgress,
    setEventEditIsInProgress,
    handleAddRemoveUserAsOrganizer,
    eventImages,
    setEventImages,
    addEventImageMutation,
    removeEventImageMutation,
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
    eventValuesToUpdate,
    updateEventMutation,
    createEventMutation,
    deleteEventMutation,
    fetchAllEventsQuery,
    fetchPotentialInviteesQuery,
  } = useEventContext();

  const allEvents = fetchAllEventsQuery.data;

  const [focusedElement, setFocusedElement] = useState<
    | "title"
    | "description"
    | "additionalInfo"
    | "city"
    | "state"
    | "address"
    | "startDate"
    | "startTime"
    | "endDate"
    | "endTime"
    | "maxParticipants"
    | "public"
    | "private"
    | `image${string}`
    | "coOrganizers"
    | "invitees"
    | "blockees"
    | undefined
  >();
  // REFS:
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef(null);
  const additionalInfoRef = useRef(null);
  const cityRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLInputElement | null>(null);
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const startTimeRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);
  const endTimeRef = useRef<HTMLInputElement | null>(null);
  const maxParticipantsRef = useRef<HTMLInputElement | null>(null);
  const publicRef = useRef<HTMLInputElement | null>(null);
  const privateRef = useRef<HTMLInputElement | null>(null);
  const coOrganizersRef = useRef<HTMLInputElement | null>(null);
  const inviteesRef = useRef<HTMLInputElement | null>(null);
  const blockeesRef = useRef<HTMLInputElement | null>(null);
  ///////

  const [potentialCoOrganizers, setPotentialCoOrganizers] = useState<TBarebonesUser[]>(
    []
  );
  const [potentialInvitees, setPotentialInvitees] = useState<TOtherUser[]>([]);
  const [potentialBlockees, setPotentialBlockees] = useState<TOtherUser[]>([]);
  const [inviteesSearchQuery, setInviteesSearchQuery] = useState<string>("");
  const [blockeesSearchQuery, setBlockeesSearchQuery] = useState<string>("");
  const [showPotentialCoOrganizers, setShowPotentialCoOrganizers] =
    useState<boolean>(false);
  const [showPotentialInvitees, setShowPotentialInvitees] = useState<boolean>(false);
  const [showPotentialBlockees, setShowPotentialBlockees] = useState<boolean>(false);

  const [showEventCountries, setShowEventCountries] = useState<boolean>(false);

  const [showErrors, setShowErrors] = useState<boolean>(
    usedFor === "edit-event" ? true : false
  );

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);

  const [showAreYouSureDeleteEvent, setShowAreYouSureDeleteEvent] =
    useState<boolean>(false);
  const [
    showAreYouSureRemoveCurrentUserAsOrganizer,
    setShowAreYouSureRemoveCurrentUserAsOrganizer,
  ] = useState<boolean>(false);

  const [allPotentialCOs, setAllPotentialCOs] = useState<TBarebonesUser[]>([]);
  const [fetchPotentialCOsStart, setFetchPotentialCOsStart] = useState<number>(0);
  const [potentialCOsSearchTerm, setPotentialCOsSearchTerm] = useState<string>("");

  const fetchLimit = 10;

  useEffect(() => {
    // Hide Sidebar if showing:
    if (showSidebar) {
      setShowSidebar(false);
    }

    if (usedFor === "add-event") {
      if (eventImages && eventImages.length > 0) {
        // Remove any previously added event images (like if user added some on new event, but didn't submit form)
        setEventImages([]);
      }
      setCurrentEvent(undefined);
      handleRevert();
    }
  }, [usedFor]);

  // useEffect to fetch more users when fetch starts change
  useEffect(() => {
    if (
      usedFor === "edit-event" &&
      (potentialCOsSearchTerm === "" || potentialCOsSearchTerm === undefined)
    ) {
      setFetchIsLoading(true);
      Requests.getPotentialCoOrganizers(
        "edit",
        currentUser,
        fetchPotentialCOsStart,
        fetchLimit
      )
        .then((potentialCOs) => {
          if (potentialCOs) {
            let potentialCOsSecure: TBarebonesUser[] = potentialCOs.map((pco) =>
              getTBarebonesUser(pco)
            );
            if (fetchPotentialCOsStart === 0) {
              setPotentialCoOrganizers(potentialCOsSecure);
            } else {
              setPotentialCoOrganizers(potentialCoOrganizers.concat(potentialCOsSecure));
            }
          } else {
            setIsFetchError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchIsLoading(false));

      /* if (event) {
        setCurrentEvent(allEvents.filter((ev) => ev._id === event._id)[0]);
        setEventImages(event.images);
      } else if (!event && currentEvent) {
        setEventImages(currentEvent.images);
      }
      handleRevert(); */
    }
  }, [fetchPotentialCOsStart, potentialCOsSearchTerm]);

  useEffect(() => {
    // Set updated potentialCoOrganizers, after user makes changes to 3 lists (seen in dep array):

    if (fetchPotentialInviteesQuery.data) {
      setPotentialInvitees(
        fetchPotentialInviteesQuery.data.filter(
          (user) =>
            user._id &&
            !blockedUsersEvent.map((bu) => bu._id).includes(user._id.toString())
        )
      );
    }

    if (visibleOtherUsers) {
      setPotentialBlockees(
        visibleOtherUsers.filter(
          (otherUser) =>
            otherUser._id &&
            !invitees.map((i) => i._id).includes(otherUser._id.toString()) &&
            !organizers.map((o) => o._id).includes(otherUser._id.toString())
        )
      );
    }
  }, [invitees, organizers, blockedUsersEvent, fetchPotentialInviteesQuery.data]);

  const getTBarebonesUser = (user: TUser | null): TBarebonesUser => {
    return {
      _id: user?._id,
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      emailAddress: user?.emailAddress,
      profileImage: user?.profileImage,
      index: user?.index,
    };
  };

  // add as event listener on dropdown-scroll. do this inside useEffect dependent on CO fetch starts, fetchLimit, search terms,
  const handleLoadMorePotentialCOsOnScroll = (
    items: (TOtherUser | TEvent | TBarebonesUser)[],
    e?: React.UIEvent<HTMLUListElement, UIEvent> | React.UIEvent<HTMLDivElement, UIEvent>
  ): void => {
    const eHTMLElement = e?.target as HTMLElement;
    const scrollTop = e ? eHTMLElement.scrollTop : null;
    const scrollHeight = e ? eHTMLElement.scrollHeight : null;
    const clientHeight = e ? eHTMLElement.clientHeight : null;

    const bottomReached =
      e && scrollTop && clientHeight
        ? scrollTop + clientHeight === scrollHeight
        : window.innerHeight + window.scrollY >= document.body.offsetHeight;

    if (bottomReached) {
      const lastItem: TOtherUser | TEvent | TBarebonesUser = items[items.length - 1];

      if (usedFor === "edit-event") {
        if (
          lastItem &&
          lastItem.index &&
          (potentialCOsSearchTerm === "" || potentialCOsSearchTerm === undefined)
        ) {
          setFetchPotentialCOsStart(lastItem.index + 1);
        }
      }
    }
  };

  const initializePotentialCoOrganizersSearch = (input: string): void => {
    setFetchIsLoading(true);
    setFetchPotentialCOsStart(0);
    const eventType = usedFor === "add-event" ? "new" : "edit";
    Requests.getPotentialCoOrganizers(eventType, currentUser, 0, Infinity)
      .then((batchOfPotentialCOs) => {
        if (batchOfPotentialCOs) {
          setAllPotentialCOs(batchOfPotentialCOs.map((co) => getTBarebonesUser(co)));
          let matchingPotentialCOs = [];
          for (const co of batchOfPotentialCOs) {
            if (
              co.username?.includes(input.toLowerCase()) ||
              co.firstName?.includes(input.toLowerCase()) ||
              co.lastName?.includes(input.toLowerCase())
            ) {
              matchingPotentialCOs.push(getTBarebonesUser(co));
            }
          }
          setPotentialCoOrganizers(matchingPotentialCOs);
        } else {
          setIsFetchError(true);
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setFetchIsLoading(false));
  };

  // INPUT HANDLERS
  const handleEventTitleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    setEventTitle(inputCleaned);
    if (inputCleaned.trim() === "") {
      setEventTitleError("Please fill out this field");
    } else if (inputCleaned.trim().length > 40) {
      setEventTitleError(
        `Too many characters (${e.target.value.replace(/\s+/g, " ").trim().length} / 40)`
      );
    } else {
      setEventTitleError("");
    }
  };

  const handleEventDescriptionInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    setEventDescription(e.target.value.replace(/\s+/g, " "));
    if (inputCleaned.trim() === "") {
      setEventDescriptionError("Please fill out this field");
    } else if (inputCleaned.trim().length > 200) {
      setEventDescriptionError(
        `Too many characters (${inputCleaned.trim().length} / 200)`
      );
    } else {
      setEventDescriptionError("");
    }
  };

  const handleEventAdditionalInfo = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    setEventAdditionalInfo(inputCleaned);
    if (inputCleaned.trim().length > 150) {
      setEventAdditionalInfoError(
        `Too many characters (${inputCleaned.trim().length} / 150)`
      );
    } else {
      setEventAdditionalInfoError("");
    }
  };

  const handleEventAddressInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    setEventAddress(inputCleaned);
    if (inputCleaned.trim() === "") {
      setEventAddressError("Please fill out this field");
    } else {
      setEventAddressError("");
    }
  };

  const getDateFieldValue = (eventStartDateMidnightUTCInMS: number): string => {
    // yyyy-mm-dd
    let month = String(new Date(eventStartDateMidnightUTCInMS).getMonth() + 1);
    let day = String(new Date(eventStartDateMidnightUTCInMS).getDate());
    const year = new Date(eventStartDateMidnightUTCInMS).getFullYear();
    if (Number(month) < 10) {
      month = `0${month}`;
    }
    if (Number(day) < 10) {
      day = `0${day}`;
    }
    return `${year}-${month}-${day}`;
  };

  const getTimeFieldValue = (timeAfterMidnightUTCInMS: number): string => {
    const hoursSinceMidnight = timeAfterMidnightUTCInMS / 3600000; // EX: 23.75
    const hoursSinceMidnightString = String(hoursSinceMidnight); // EX: "23.75"
    let wholeHoursSinceMidnight: number | string = Math.floor(hoursSinceMidnight); // EX: 23
    let remainingMinutes: string =
      hoursSinceMidnightString.indexOf(".") === -1
        ? "0"
        : (
            Number(
              hoursSinceMidnightString.substring(hoursSinceMidnightString.indexOf("."))
            ) * 60
          ).toFixed(0); // EX: 45 (0.75 * 60)

    if (wholeHoursSinceMidnight < 10) {
      wholeHoursSinceMidnight = `0${wholeHoursSinceMidnight}`;
    }
    if (Number(remainingMinutes) < 10) {
      remainingMinutes = `0${remainingMinutes}`;
    }
    return `${wholeHoursSinceMidnight}:${remainingMinutes}`; // EX: 23:45
  };

  // Method to set state values & errors relating to event's start & end date/time
  // Params match one of the 4 types of inputs in whose onChange this method will be called
  const handleDateTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    input: "start-date" | "start-time" | "end-date" | "end-time"
  ): void => {
    e.preventDefault();
    const nowDate = new Date();
    const nowPlusOneHourMS = nowDate.getTime() + 3600000;
    const nowPlusOneHourAndOneMinuteInMS = nowPlusOneHourMS + 60000;

    if (input === "start-date" || input === "end-date") {
      const inputDateLocal = new Date(e.target.value);
      const timezoneOffsetinMS = inputDateLocal.getTimezoneOffset() * 60000;
      const inputDateMS = e.target.valueAsNumber; // stored time value in ms since midnight, January 1, 1970 UTC to input date
      const eventDateUTCinMS = timezoneOffsetinMS + inputDateMS;

      if (input === "start-date") {
        // Handle change of start-date field:

        setEventStartDateMidnightUTCInMS(eventDateUTCinMS);

        if (
          // If end date & time have been changed and start is before the end:
          eventEndDateMidnightUTCInMS > 0 &&
          eventEndTimeAfterMidnightUTCInMS > -1 &&
          eventDateUTCinMS + eventStartTimeAfterMidnightUTCInMS <
            eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS
        ) {
          setEventEndDateTimeError("");
        }

        if (
          // If event start date has been edited, but start is not set at least an hour in advance from current moment:
          eventDateUTCinMS > 0 &&
          eventDateUTCinMS + eventStartTimeAfterMidnightUTCInMS < nowPlusOneHourMS
        ) {
          setEventStartDateTimeError("Event can only be set at least 1 hour in advance");
        } else if (
          // If end date & time have been edited and end is before or at the same time as the start:
          eventEndDateMidnightUTCInMS !== 0 &&
          eventEndTimeAfterMidnightUTCInMS !== -1 &&
          eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS <=
            eventDateUTCinMS + eventStartTimeAfterMidnightUTCInMS
        ) {
          setEventStartDateTimeError(
            "Event must start before its end & at least 1 hour from now"
          );
        } else {
          // If start and end make sense:

          // If start date/time have both been edited (both are required fields):
          if (eventDateUTCinMS > 0 && eventStartTimeAfterMidnightUTCInMS > -1) {
            setEventStartDateTimeError("");
          } else {
            /* If either start date/event has not been edited (only one will be a this point, since this function is an input handler): */
            setEventStartDateTimeError("Please specify when event begins");
          }
        }
      } else {
        // Handle change of end-date field:

        setEventEndDateMidnightUTCInMS(eventDateUTCinMS);

        if (
          // If start is earlier than end and both end date & time have been edited:
          eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS <
            eventDateUTCinMS + eventEndDateMidnightUTCInMS &&
          eventStartDateMidnightUTCInMS > 0 &&
          eventStartTimeAfterMidnightUTCInMS > -1
        ) {
          setEventStartDateTimeError("");
        }

        if (
          // If event end is before the start:
          eventDateUTCinMS + eventEndTimeAfterMidnightUTCInMS <=
          eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS
        ) {
          setEventEndDateTimeError(
            "Event end must be after its start and at least 1 hour & 1 minute from now"
          );
        } else if (
          // If end is not at least one hour and one minute from current moment:
          eventDateUTCinMS + eventEndTimeAfterMidnightUTCInMS <
          nowPlusOneHourAndOneMinuteInMS
        ) {
          setEventEndDateTimeError("Event must end at least 1 hour & 1 minute from now");
        } else {
          // If start date/time have both been edited (both are required fields):
          if (eventDateUTCinMS > 0 && eventEndTimeAfterMidnightUTCInMS > -1) {
            setEventEndDateTimeError("");
          } else {
            /* If either start date/event has not been edited (only one will be a this point, since this function is an input handler): */
            setEventEndDateTimeError("Please specify when event ends");
          }
        }

        if (
          eventEndDateTimeError === "" &&
          (eventStartDateMidnightUTCInMS === -1 ||
            eventStartTimeAfterMidnightUTCInMS === -1)
        ) {
          setEventStartDateTimeError("Please specify when event begins");
        }
      }
    }
    if (input === "start-time" || input === "end-time") {
      const hours = e.target.value.substring(0, e.target.value.indexOf(":"));
      const mins = e.target.value.substring(e.target.value.indexOf(":") + 1);
      const hoursInMS = Number(hours) * 3600000;
      const minsInMS = Number(mins) * 60000;
      const hoursPlusMinutesInMS = hoursInMS + minsInMS;

      if (input === "start-time") {
        // Handle start-time input:

        setEventStartTimeAfterMidnightUTCInMS(hoursPlusMinutesInMS);

        if (
          // If end date & time have been edited and start is before the end:
          eventEndDateMidnightUTCInMS > 0 &&
          eventEndTimeAfterMidnightUTCInMS > -1 &&
          eventStartDateMidnightUTCInMS + hoursPlusMinutesInMS <
            eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS
        ) {
          setEventEndDateTimeError("");
        }

        if (
          // If end date & time have been edited and end is before or at the same time as the start:
          eventEndDateMidnightUTCInMS > 0 &&
          eventEndTimeAfterMidnightUTCInMS > -1 &&
          eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS <=
            eventStartDateMidnightUTCInMS + hoursPlusMinutesInMS
        ) {
          setEventStartDateTimeError(
            "Event must start before its end & at least 1 hour from now"
          );
        } else if (
          // If start date & time have been edited and start is less than an hour in advance from current moment:
          eventStartDateMidnightUTCInMS > 0 &&
          eventStartTimeAfterMidnightUTCInMS > -1 &&
          hoursPlusMinutesInMS + eventStartDateMidnightUTCInMS < nowPlusOneHourMS
        ) {
          setEventStartDateTimeError("Event can only be set at least 1 hour in advance");
        } else {
          // If all other conditions are met & start date & time have, indeed, been entered:
          if (eventStartDateMidnightUTCInMS > 0 && hoursPlusMinutesInMS > -1) {
            setEventStartDateTimeError("");
          } else {
            // If start date & time fields have not been completed:
            setEventStartDateTimeError("Please specify when event begins");
          }
        }
      } else {
        // Handle end-time field:

        setEventEndTimeAfterMidnightUTCInMS(hoursPlusMinutesInMS);

        if (
          // If start is before end, and end date/time have both been edited:
          eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS <
            eventEndTimeAfterMidnightUTCInMS + hoursPlusMinutesInMS &&
          eventStartDateMidnightUTCInMS > 0 &&
          eventStartTimeAfterMidnightUTCInMS > -1
        ) {
          setEventStartDateTimeError("");
        }

        if (
          // If start is after end:
          !(
            eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS <
            eventEndDateMidnightUTCInMS + hoursPlusMinutesInMS
          )
        ) {
          setEventEndDateTimeError(
            "Event end must be after its start & at least 1 hour & 1 minute from now"
          );
        } else if (
          // If end is set less than 1hr and 1min from current moment:
          eventEndDateMidnightUTCInMS + hoursPlusMinutesInMS <
          nowPlusOneHourAndOneMinuteInMS
        ) {
          setEventEndDateTimeError("Event must end at least 1 hour & 1 minute from now");
        } else {
          if (eventEndDateMidnightUTCInMS > 0 && hoursPlusMinutesInMS > -1) {
            setEventEndDateTimeError("");
          } else {
            // If start date & time fields have not been completed:
            setEventEndDateTimeError("Please specify when event ends");
          }
        }
      }
    }
  };

  const handleMaxParticipantsInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputCleaned = Number(e.target.value.replace(/[^0-9]/g, ""));
    inputCleaned > 0 ? setMaxParticipants(inputCleaned) : setMaxParticipants(null);
  };

  const handleAddEventImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();
    const file = e.target.files && e.target.files[0];
    const base64: string | null = file && String(await Methods.convertToBase64(file));
    // If event (component is used to edit existing event), save image to DB when added
    /* If !event (component is used to add new event), only add image to state value eventImages, which will be 
    passed into database when user submits form successfully */
    if (base64) {
      if (usedFor === "edit-event") {
        if (currentEvent) {
          if (
            currentEvent &&
            usedFor === "edit-event" &&
            currentEvent.images &&
            !currentEvent.images.includes(base64) &&
            !eventImages?.includes(base64)
          ) {
            const event = currentEvent;
            addEventImageMutation.mutate({ event, base64 });
          }
          if (eventImages.includes(base64) || currentEvent.images.includes(base64)) {
            toast.error("Cannot upload same image more than once.", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid red",
              },
            });
          }
        }
      }

      if (usedFor === "add-event") {
        if (eventImages.includes(base64)) {
          toast.error("Cannot upload same image more than once.", {
            style: {
              background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
              color: theme === "dark" ? "black" : "white",
              border: "2px solid red",
            },
          });
        } else {
          setEventImages(eventImages?.concat(base64));
        }
      }
    }
  };

  const handleDeleteEventImage = async (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    imageToBeRemoved: string
  ): Promise<void> => {
    e.preventDefault();
    setEventImages(eventImages?.filter((image) => image !== imageToBeRemoved));

    if (usedFor === "edit-event") {
      if (currentEvent) {
        const event = currentEvent;
        removeEventImageMutation.mutate({ event, imageToBeRemoved });
      }
    }

    if (usedFor === "add-event") {
      toast("Event image removed", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
    }
  };

  const handlePublicPrivateBoxChecking = (option: "public" | "private"): void =>
    setPublicity(option);

  const handleDropdownListSearchQuery = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "co-organizers" | "invitees" | "blockees"
  ): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    if (field === "co-organizers") {
      setPotentialCOsSearchTerm(inputCleaned);
      setShowPotentialCoOrganizers(true);
      if (inputCleaned.replace(/\s+/g, "") !== "") {
        if (allPotentialCOs.length === 0) {
          initializePotentialCoOrganizersSearch(inputCleaned);
        } else {
          // If input w/o spaces is not empty string
          const matchingUsers: TBarebonesUser[] = [];
          for (const user of allPotentialCOs) {
            if (
              user?.firstName
                ?.toLowerCase()
                .includes(inputCleaned.toLowerCase().trim()) ||
              user?.lastName?.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
              user?.username?.includes(inputCleaned.toLowerCase())
            ) {
              matchingUsers.push(user);
            }
          }
          setPotentialCoOrganizers(matchingUsers);
        }
      } else {
        setPotentialCOsSearchTerm("");
        setAllPotentialCOs([]);
        setFetchPotentialCOsStart(0);
      }
    }
    if (field === "invitees") {
      setInviteesSearchQuery(inputCleaned);
      setShowPotentialInvitees(true);
      if (inputCleaned.replace(/\s+/g, "") !== "") {
        const matchingUsers: TOtherUser[] = [];
        for (const user of potentialInvitees) {
          if (
            user.firstName &&
            user.lastName &&
            user.username &&
            (user.firstName.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
              user?.lastName.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
              user?.username.includes(inputCleaned.toLowerCase()))
          ) {
            matchingUsers.push(user);
          }
        }
        setPotentialInvitees(matchingUsers);
      } else {
        if (fetchPotentialInviteesQuery.data) {
          setPotentialInvitees(fetchPotentialInviteesQuery.data);
        }
      }
    }
    if (field === "blockees" && visibleOtherUsers) {
      setBlockeesSearchQuery(inputCleaned);
      setShowPotentialBlockees(true);
      if (inputCleaned.replace(/\s+/g, "") !== "") {
        const matchingUsers: TOtherUser[] = [];
        for (const user of visibleOtherUsers) {
          if (
            user.firstName &&
            user.lastName &&
            user.username &&
            (user.firstName.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
              user?.lastName.toLowerCase().includes(inputCleaned.toLowerCase().trim()) ||
              user?.username.includes(inputCleaned.toLowerCase()))
          ) {
            matchingUsers.push(user);
          }
        }
        setPotentialBlockees(matchingUsers);
      } else {
        if (visibleOtherUsers) {
          setPotentialBlockees(visibleOtherUsers);
        }
      }
    }
  };

  const handleAddEventInterest = (
    interest: string,
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ): void => {
    e.preventDefault();
    const updatedArray: string[] = relatedInterests;
    updatedArray.push(interest);
    setRelatedInterests(updatedArray);
  };

  const handleRemoveEventInterest = (interest: string): void =>
    setRelatedInterests(relatedInterests.filter((int) => int !== interest));

  const handleRevert = (): void => {
    if (currentEvent && usedFor === "edit-event") {
      setEventTitle(currentEvent.title);
      setEventTitleError("");
      setEventDescription(currentEvent.description);
      setEventDescriptionError("");
      setEventAdditionalInfo(currentEvent.additionalInfo);
      setEventAdditionalInfoError("");
      setEventCity(currentEvent.city);
      setEventState(currentEvent.stateProvince);
      setEventCountry(currentEvent.country);
      setEventLocationError("");
      setEventStartDateMidnightUTCInMS(currentEvent.eventStartDateMidnightUTCInMS);
      setEventStartTimeAfterMidnightUTCInMS(
        currentEvent.eventStartTimeAfterMidnightUTCInMS
      );
      setEventStartDateTimeError("");
      setEventEndDateMidnightUTCInMS(currentEvent.eventEndDateMidnightUTCInMS);
      setEventEndTimeAfterMidnightUTCInMS(currentEvent.eventEndTimeAfterMidnightUTCInMS);
      setEventEndDateTimeError("");
      setEventAddress(currentEvent.address);
      setEventAddressError("");
      setMaxParticipants(currentEvent.maxParticipants);
      setPublicity("public");
      setOrganizers(currentEvent.organizers);
      setInvitees(currentEvent.invitees);
      setBlockedUsersEvent(currentEvent.blockedUsersEvent);
      setRelatedInterests(currentEvent.relatedInterests);
    } else {
      setEventTitle("");
      setEventTitleError("Please enter a title");
      setEventDescription("");
      setEventDescriptionError("Please enter a description");
      setEventAdditionalInfo("");
      setEventAdditionalInfoError("");
      setEventCity("");
      setEventState("");
      setEventCountry("");
      setEventLocationError("Please enter a location");
      setEventStartDateMidnightUTCInMS(0);
      setEventStartTimeAfterMidnightUTCInMS(-1);
      setEventStartDateTimeError("Please enter a start date & time");
      setEventEndDateMidnightUTCInMS(0);
      setEventEndTimeAfterMidnightUTCInMS(-1);
      setEventEndDateTimeError("Please enter an end date & time");
      setEventAddress("");
      setEventAddressError("Please enter an address");
      setMaxParticipants(null);
      setPublicity("public");
      setOrganizers([getTBarebonesUser(currentUser)]);
      setInvitees([]);
      setBlockedUsersEvent([]);
      setRelatedInterests([]);
    }
  };

  const handleClearDateTime = (isStartDateTime: boolean): void => {
    if (isStartDateTime) {
      setEventStartDateMidnightUTCInMS(0);
      setEventStartTimeAfterMidnightUTCInMS(-1);
      setEventStartDateTimeError(
        usedFor === "edit-event" ? "Please specify when event starts" : ""
      );
    } else {
      setEventEndDateMidnightUTCInMS(0);
      setEventEndTimeAfterMidnightUTCInMS(-1);
      setEventEndDateTimeError(
        usedFor === "edit-event" ? "Please specify when event ends" : ""
      );
    }
  };

  const handleEventFormSubmission = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    if (!showErrors) {
      setShowErrors(true);
    }
    if (areNoErrors) {
      setIsLoading(true);
      if (currentEvent && usedFor === "edit-event") {
        // When updating an existing event:
        setEventEditIsInProgress(true);
        if (eventValuesToUpdate) {
          const event = currentEvent;
          updateEventMutation.mutate({ event, eventValuesToUpdate });
        }
      } else {
        // When adding a newly created event:
        if (allRequiredFieldsFilled) {
          Requests.getAllEvents().then((allEvents) => {
            if (allEvents) {
              setAddEventIsInProgress(true);
              eventInfos.index = allEvents.length;
              const eventInfo = eventInfos;
              createEventMutation.mutate({ eventInfo });
            } else {
              toast.error("Couldn't create event; please try again.", {
                style: {
                  background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                  color: theme === "dark" ? "black" : "white",
                  border: "2px solid red",
                },
              });
            }
          });
        }
      }
    } else {
      window.alert(
        "Please make sure all fields are filled out & that there are no errors"
      );
    }
  };

  const handleDeleteEvent = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    setEventDeletionIsInProgress(true);
    setShowAreYouSureDeleteEvent(false);
    if (currentEvent && usedFor === "edit-event") {
      const event = currentEvent;
      deleteEventMutation.mutate({ event });
    }
  };

  // Create array in which certain countries from countries array will be placed on top
  const topCountryNames = ["United States", "Canada", "United Kingdom", "Australia"];
  type TCountry = {
    country: string;
    abbreviation: string;
    phoneCode: string;
  };
  const preferredCountries: TCountry[] = countries.filter((country) =>
    topCountryNames.includes(country.country)
  );
  const restOfCountries: TCountry[] = countries.filter(
    (country) => !topCountryNames.includes(country.country)
  );
  const getResortedCountries = (): TCountry[] => {
    return preferredCountries.concat(restOfCountries);
  };
  const resortedCountries = getResortedCountries();

  const usersWhoAreOrganizers = event?.organizers;

  const usersWhoAreInvitees = event?.invitees;

  const getChangesMade = (): boolean => {
    if (currentEvent && usedFor === "edit-event") {
      return (
        eventTitle !== currentEvent?.title ||
        eventDescription !== currentEvent?.description ||
        eventAdditionalInfo !== currentEvent?.additionalInfo ||
        eventCity !== currentEvent?.city ||
        eventState !== currentEvent?.stateProvince ||
        eventCountry !== currentEvent?.country ||
        eventStartDateMidnightUTCInMS !== currentEvent.eventStartDateMidnightUTCInMS ||
        eventStartTimeAfterMidnightUTCInMS !==
          currentEvent.eventStartTimeAfterMidnightUTCInMS ||
        eventEndDateMidnightUTCInMS !== currentEvent.eventEndDateMidnightUTCInMS ||
        eventEndTimeAfterMidnightUTCInMS !==
          currentEvent.eventEndTimeAfterMidnightUTCInMS ||
        eventAddress !== currentEvent?.address ||
        maxParticipants !== currentEvent?.maxParticipants ||
        publicity !== currentEvent?.publicity ||
        !Methods.arraysAreIdentical(organizers, currentEvent?.organizers) ||
        !Methods.arraysAreIdentical(currentEvent?.invitees, invitees) ||
        !Methods.arraysAreIdentical(currentEvent?.blockedUsersEvent, blockedUsersEvent) ||
        !Methods.arraysAreIdentical(currentEvent?.relatedInterests, relatedInterests)
      );
    }
    return (
      eventTitle !== "" ||
      eventDescription !== "" ||
      eventAdditionalInfo !== "" ||
      eventCity !== "" ||
      eventState !== "" ||
      eventCountry !== "" ||
      eventStartDateMidnightUTCInMS !== 0 ||
      eventStartTimeAfterMidnightUTCInMS !== -1 ||
      eventEndDateMidnightUTCInMS !== 0 ||
      eventEndTimeAfterMidnightUTCInMS !== -1 ||
      eventAddress !== "" ||
      maxParticipants !== undefined ||
      publicity !== "public" ||
      organizers.length > 1 ||
      invitees.length > 0 ||
      blockedUsersEvent.length > 0 ||
      relatedInterests.length > 0
    );
  };
  const changesMade: boolean = getChangesMade();

  const areNoErrors: boolean =
    eventTitleError === "" &&
    eventDescriptionError === "" &&
    eventAdditionalInfoError === "" &&
    eventLocationError === "" &&
    eventStartDateTimeError === "" &&
    eventEndDateTimeError === "" &&
    eventAddressError === "";

  const allRequiredFieldsFilled: boolean =
    eventTitle !== "" &&
    eventDescription !== "" &&
    eventCity !== "" &&
    eventState !== "" &&
    eventCountry !== "" &&
    eventStartDateMidnightUTCInMS !== 0 &&
    eventStartTimeAfterMidnightUTCInMS !== -1 &&
    eventEndDateMidnightUTCInMS !== 0 &&
    eventEndTimeAfterMidnightUTCInMS !== -1 &&
    eventAddress !== "";

  const getSubmitButtonIsDisabled = (): boolean => {
    if (isLoading) {
      return true;
    } else if (usedFor === "edit-event") {
      return !(changesMade && allRequiredFieldsFilled && areNoErrors);
      //return !changesMade || !allRequiredFieldsFilled || !areNoErrors;
    }
    return false;
  };
  const submitButtonIsDisabled: boolean = getSubmitButtonIsDisabled();

  let eventInfos: TEvent = {
    index: undefined,
    title: eventTitle.trim(),
    creator: currentUser?._id?.toString(),
    organizers: organizers,
    invitees: invitees,
    blockedUsersEvent: blockedUsersEvent,
    description: eventDescription.trim(),
    additionalInfo: eventAdditionalInfo.trim(),
    city: Methods.formatHyphensAndSpacesInString(
      Methods.formatCapitalizedName(eventCity)
    ),
    stateProvince: Methods.formatHyphensAndSpacesInString(
      Methods.formatCapitalizedName(eventState)
    ),
    country: eventCountry,
    publicity: "public",
    eventStartDateMidnightUTCInMS: eventStartDateMidnightUTCInMS,
    eventStartTimeAfterMidnightUTCInMS: eventStartTimeAfterMidnightUTCInMS,
    eventStartDateTimeInMS:
      eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS,
    eventEndDateMidnightUTCInMS: eventEndDateMidnightUTCInMS,
    eventEndTimeAfterMidnightUTCInMS: eventEndTimeAfterMidnightUTCInMS,
    eventEndDateTimeInMS: eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS,
    maxParticipants: maxParticipants,
    address: eventAddress?.trim(),
    interestedUsers: [],
    disinterestedUsers: [],
    images: eventImages,
    relatedInterests: relatedInterests,
  };

  return (
    <>
      {isFetchError && <p>Error retrieving data; please reload the page.</p>}
      {!isFetchError && (
        <form className="event-form">
          <label>
            <header className="input-label">Title:</header>
            <input
              name="event-title"
              id="event-title"
              inputMode="text"
              ref={titleRef}
              onFocus={() => setFocusedElement("title")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "title"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              disabled={isLoading}
              className={
                eventTitleError !== "" && showErrors ? "erroneous-field" : undefined
              }
              value={eventTitle}
              onChange={(e) => handleEventTitleInput(e)}
              placeholder="Name your event"
            />
            {eventTitleError !== "" && showErrors && <p>{eventTitleError}</p>}
          </label>
          <label>
            <header className="input-label">Description:</header>
            <textarea
              name="event-description"
              id="event-description"
              ref={descriptionRef}
              onFocus={() => setFocusedElement("description")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "description"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              disabled={isLoading}
              className={
                eventDescriptionError !== "" && showErrors ? "erroneous-field" : undefined
              }
              value={eventDescription}
              onChange={(e) => handleEventDescriptionInput(e)}
              placeholder="Describe your event"
            />
            {eventDescriptionError !== "" && showErrors && <p>{eventDescriptionError}</p>}
          </label>
          <label>
            <header className="input-label">Additional Info: (optional)</header>
            <textarea
              name="event-additional-info"
              id="event-additional-info"
              ref={additionalInfoRef}
              onFocus={() => setFocusedElement("additionalInfo")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "additionalInfo"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              disabled={isLoading}
              className={
                eventAdditionalInfoError !== "" && showErrors
                  ? "erroneous-field"
                  : undefined
              }
              value={eventAdditionalInfo}
              onChange={(e) => handleEventAdditionalInfo(e)}
              placeholder="Cancelation, backup plans, anything else your guests should know"
            />
            {eventAdditionalInfoError !== "" && <p>{eventAdditionalInfoError}</p>}
          </label>
          <div className="location-inputs">
            <label className="location-input">
              <header className="input-label">City:</header>
              <input
                name="event-city"
                id="event-city"
                inputMode="text"
                ref={cityRef}
                onFocus={() => setFocusedElement("city")}
                onBlur={() => setFocusedElement(undefined)}
                style={
                  focusedElement === "city"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                disabled={isLoading}
                className={
                  eventLocationError !== "" && showErrors ? "erroneous-field" : undefined
                }
                value={eventCity}
                onChange={(e) =>
                  handleCityStateCountryInput(
                    { city: eventCity, state: eventState, country: eventCountry },
                    {
                      citySetter: setEventCity,
                      stateSetter: undefined,
                      countrySetter: undefined,
                      errorSetter: setEventLocationError,
                      showCountriesSetter: undefined,
                    },
                    "city",
                    undefined,
                    e
                  )
                }
                placeholder="City"
              />
              {eventLocationError !== "" && showErrors && <p>{eventLocationError}</p>}
            </label>
            <label className="location-input">
              <header className="input-label">State/Province:</header>
              <input
                name="event-state-province"
                id="event-state-province"
                inputMode="text"
                ref={stateRef}
                onFocus={() => setFocusedElement("state")}
                onBlur={() => setFocusedElement(undefined)}
                style={
                  focusedElement === "state"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                disabled={isLoading}
                className={
                  eventLocationError !== "" && showErrors ? "erroneous-field" : undefined
                }
                value={eventState}
                onChange={(e) =>
                  handleCityStateCountryInput(
                    { city: eventCity, state: eventState, country: eventCountry },
                    {
                      citySetter: undefined,
                      stateSetter: setEventState,
                      countrySetter: undefined,
                      errorSetter: setEventLocationError,
                    },
                    "state",
                    undefined,
                    e
                  )
                }
                placeholder="State, province, etc."
              />
            </label>
            <label className="location-countries-dropdown">
              <header className="input-label">Country:</header>
              <button
                disabled={isLoading}
                className={
                  eventLocationError !== "" && showErrors
                    ? "country-dropdown-button erroneous-field"
                    : "country-dropdown-button"
                }
                type="button"
                onClick={() => setShowEventCountries(!showEventCountries)}
              >
                {eventCountry === "" ? (
                  "Select country:"
                ) : (
                  <div className="flag-and-code-container">
                    <img
                      src={`/flags/1x1/${
                        countries.filter((country) => country.country === eventCountry)[0]
                          .abbreviation
                      }.svg`}
                    />
                    <span
                      style={
                        eventCountry && eventCountry.length >= 19
                          ? { fontSize: "0.75rem" }
                          : undefined
                      }
                    >
                      {`${
                        countries.filter((country) => country.country === eventCountry)[0]
                          .country
                      }`}
                    </span>
                  </div>
                )}
                <i
                  style={showEventCountries ? { "rotate": "180deg" } : undefined}
                  className="fas fa-chevron-down"
                ></i>
              </button>
              {showEventCountries && (
                <ul className="dropdown-list">
                  {resortedCountries.map((country) => (
                    <li
                      tabIndex={0}
                      aria-hidden="false"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCityStateCountryInput(
                            { city: eventCity, state: eventState, country: eventCountry },
                            {
                              citySetter: undefined,
                              stateSetter: undefined,
                              countrySetter: setEventCountry,
                              errorSetter: setEventLocationError,
                              showCountriesSetter: setShowEventCountries,
                            },
                            "country",
                            country.country,
                            undefined
                          );
                        }
                      }}
                      style={
                        country.country === "United States"
                          ? {
                              "borderBottom": "1px dotted white",
                            }
                          : undefined
                      }
                      key={country.country}
                      onClick={() =>
                        handleCityStateCountryInput(
                          { city: eventCity, state: eventState, country: eventCountry },
                          {
                            citySetter: undefined,
                            stateSetter: undefined,
                            countrySetter: setEventCountry,
                            errorSetter: setEventLocationError,
                            showCountriesSetter: setShowEventCountries,
                          },
                          "country",
                          country.country,
                          undefined
                        )
                      }
                    >
                      <img src={`/flags/1x1/${country.abbreviation}.svg`} />
                      <span>{`${country.country}`}</span>
                    </li>
                  ))}
                </ul>
              )}
            </label>
          </div>
          <label>
            <header className="input-label">Address:</header>
            <input
              name="event-address"
              id="event-address"
              inputMode="text"
              ref={addressRef}
              onFocus={() => setFocusedElement("address")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "address"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              disabled={isLoading}
              className={
                eventAddressError !== "" && showErrors ? "erroneous-field" : undefined
              }
              value={eventAddress}
              onChange={(e) => handleEventAddressInput(e)}
              placeholder="Number, street, postal code"
            />
            {eventAddressError !== "" && showErrors && <p>{eventAddressError}</p>}
          </label>
          <div className={styles.dateTimeInputsLine}>
            <div className={styles.dateTimeGroupContainer}>
              <div className={styles.dateTimeInputsContainer}>
                <label>
                  <header className="input-label">Start Date:</header>{" "}
                  <input
                    name="event-start-date"
                    id="event-start-date"
                    inputMode="text"
                    value={
                      eventStartDateMidnightUTCInMS > 0
                        ? getDateFieldValue(eventStartDateMidnightUTCInMS)
                        : ""
                    }
                    ref={startDateRef}
                    onFocus={() => setFocusedElement("startDate")}
                    onBlur={() => setFocusedElement(undefined)}
                    style={
                      focusedElement === "startDate"
                        ? {
                            boxShadow: `0px 0px 10px 2px ${randomColor}`,
                            outline: "none",
                          }
                        : undefined
                    }
                    disabled={isLoading}
                    className={
                      (eventStartDateTimeError === "Please fill out this field" &&
                        showErrors) ||
                      (eventStartDateTimeError !== "" && showErrors)
                        ? "erroneous-field"
                        : undefined
                    }
                    onChange={(e) => handleDateTimeInput(e, "start-date")}
                    type="date"
                  />
                </label>
                <label>
                  <header className="input-label">Start Time:</header>
                  <input
                    name="event-start-time"
                    id="event-start-time"
                    value={
                      eventStartTimeAfterMidnightUTCInMS > -1
                        ? getTimeFieldValue(eventStartTimeAfterMidnightUTCInMS)
                        : ""
                    }
                    step="600"
                    disabled={isLoading}
                    ref={startTimeRef}
                    onFocus={() => setFocusedElement("startTime")}
                    onBlur={() => setFocusedElement(undefined)}
                    style={
                      focusedElement === "startTime"
                        ? {
                            boxShadow: `0px 0px 10px 2px ${randomColor}`,
                            outline: "none",
                          }
                        : undefined
                    }
                    className={
                      (eventStartDateTimeError === "Please fill out this field" &&
                        showErrors) ||
                      (eventStartDateTimeError !== "" && showErrors)
                        ? "erroneous-field"
                        : undefined
                    }
                    onChange={(e) => handleDateTimeInput(e, "start-time")}
                    type="time"
                  />
                </label>
                {(eventStartDateMidnightUTCInMS > 0 ||
                  eventStartTimeAfterMidnightUTCInMS > -1) && (
                  <span
                    tabIndex={0}
                    aria-hidden="false"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleClearDateTime(true);
                      }
                    }}
                    onClick={() => handleClearDateTime(true)}
                    className="remove-data"
                  >
                    Clear Start Date/Time
                  </span>
                )}
              </div>
              {eventStartDateTimeError !== "" && showErrors && (
                <p style={{ display: "flex" }}>{eventStartDateTimeError}</p>
              )}
            </div>
            <div className={styles.dateTimeGroupContainer}>
              <div className={styles.dateTimeInputsContainer}>
                <label>
                  <header className="input-label">End Date:</header>{" "}
                  <input
                    name="event-end-date"
                    id="event-end-date"
                    value={
                      eventEndDateMidnightUTCInMS > 0
                        ? getDateFieldValue(eventEndDateMidnightUTCInMS)
                        : ""
                    }
                    ref={endDateRef}
                    onFocus={() => setFocusedElement("endDate")}
                    onBlur={() => setFocusedElement(undefined)}
                    style={
                      focusedElement === "endDate"
                        ? {
                            boxShadow: `0px 0px 10px 2px ${randomColor}`,
                            outline: "none",
                          }
                        : undefined
                    }
                    disabled={isLoading}
                    className={
                      eventEndDateTimeError !== "" && showErrors
                        ? "erroneous-field"
                        : undefined
                    }
                    onChange={(e) => handleDateTimeInput(e, "end-date")}
                    type="date"
                  />
                </label>
                <label>
                  <header className="input-label">End Time:</header>
                  <input
                    name="event-end-time"
                    id="event-end-time"
                    value={
                      eventEndTimeAfterMidnightUTCInMS > -1
                        ? getTimeFieldValue(eventEndTimeAfterMidnightUTCInMS)
                        : ""
                    }
                    step="600"
                    disabled={isLoading}
                    ref={endTimeRef}
                    onFocus={() => setFocusedElement("endTime")}
                    onBlur={() => setFocusedElement(undefined)}
                    style={
                      focusedElement === "endTime"
                        ? {
                            boxShadow: `0px 0px 10px 2px ${randomColor}`,
                            outline: "none",
                          }
                        : undefined
                    }
                    className={
                      eventEndDateTimeError !== "" && showErrors
                        ? "erroneous-field"
                        : undefined
                    }
                    onChange={(e) => handleDateTimeInput(e, "end-time")}
                    type="time"
                  />
                </label>
                {(eventEndDateMidnightUTCInMS > 0 ||
                  eventEndTimeAfterMidnightUTCInMS > -1) && (
                  <span
                    tabIndex={0}
                    aria-hidden="false"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleClearDateTime(false);
                      }
                    }}
                    onClick={() => handleClearDateTime(false)}
                    className="remove-data"
                  >
                    Clear End Date/Time
                  </span>
                )}
              </div>
              {eventEndDateTimeError !== "" && showErrors && (
                <p style={{ display: "flex" }}>{eventEndDateTimeError}</p>
              )}
            </div>
          </div>
          <label>
            <header className="input-label">
              Maximum Participants: (optional, not including organizers)
            </header>
            <input
              name="event-max-participants"
              id="event-max-participants"
              ref={maxParticipantsRef}
              onFocus={() => setFocusedElement("maxParticipants")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "maxParticipants"
                  ? {
                      boxShadow: `0px 0px 10px 2px ${randomColor}`,
                      outline: "none",
                    }
                  : undefined
              }
              disabled={isLoading}
              className={
                maxParticipants && !(Number(maxParticipants) > 0)
                  ? "erroneous-field"
                  : undefined
              }
              value={maxParticipants ? maxParticipants : ""}
              onChange={(e) => handleMaxParticipantsInput(e)}
              inputMode="numeric"
              placeholder="Max number of participants"
            />
          </label>
          <div className={styles.eventFormCheckboxContainer}>
            <label>
              <span className="input-label">Public</span>
              <input
                name="event-privacy-public"
                id="event-privacy-public"
                ref={publicRef}
                onFocus={() => setFocusedElement("public")}
                onBlur={() => setFocusedElement(undefined)}
                style={
                  focusedElement === "public"
                    ? {
                        outline: "none",
                        width: "unset",
                      }
                    : { width: "unset", accentColor: randomColor }
                }
                disabled={isLoading}
                onChange={() => handlePublicPrivateBoxChecking("public")}
                type="checkbox"
                checked={publicity === "public"}
              />
            </label>
            <label>
              <span className="input-label">Private</span>
              <input
                name="event-privacy-private"
                id="event-privacy-private"
                ref={privateRef}
                onFocus={() => setFocusedElement("private")}
                onBlur={() => setFocusedElement(undefined)}
                style={
                  focusedElement === "private"
                    ? {
                        outline: "none",
                        width: "unset",
                        accentColor: randomColor,
                      }
                    : { width: "unset" }
                }
                disabled={isLoading}
                onChange={() => handlePublicPrivateBoxChecking("private")}
                type="checkbox"
                checked={publicity === "private"}
              />
            </label>
          </div>
          <div className={styles.addOtherUsersArea}>
            <header className="input-label">
              Co-organizers: (optional){" "}
              {currentUser &&
                !isLoading &&
                usersWhoAreOrganizers &&
                usersWhoAreOrganizers.filter(
                  (user) => user.username !== currentUser.username
                ).length > 0 && (
                  <>
                    <span
                      style={{ color: randomColor }}
                      onClick={() => setShowAreYouSureRemoveCurrentUserAsOrganizer(true)}
                    >
                      Remove Yourself
                    </span>
                    {currentEvent?.creator === currentUser?._id && currentUser && (
                      <span
                        style={{ color: randomColor }}
                        onClick={() => setOrganizers([getTBarebonesUser(currentUser)])}
                      >
                        Remove All Others
                      </span>
                    )}
                  </>
                )}
            </header>
            <div className="added-user-tab-container">
              {currentUser &&
                usersWhoAreOrganizers &&
                usersWhoAreOrganizers.filter(
                  (user) => user.username !== currentUser?.username
                ).length > 0 &&
                usersWhoAreOrganizers
                  .filter((user) => user.username !== currentUser?.username)
                  .map((user) => (
                    <Tab
                      key={user._id?.toString()}
                      info={user}
                      removeHandler={handleAddRemoveUserAsOrganizer}
                      removeHandlerNeedsEventParam={true}
                      removeHandlerParams={[organizers, setOrganizers, user]}
                      randomColor={randomColor}
                      isDisabled={isLoading}
                      userMayNotDelete={currentEvent?.creator === user._id}
                      specialIcon={
                        currentEvent?.creator === user._id ? (
                          <i
                            style={{
                              color: "rgb(253, 255, 8)",
                              fontSize: "1.05rem",
                              margin: "0 0 0 0.5rem",
                            }}
                            className="fas fa-crown"
                          ></i>
                        ) : undefined
                      }
                    />
                  ))}
            </div>
            <SearchAndDropdownList
              randomColor={randomColor}
              name="event-co-organizers-search"
              id="event-co-organizers-search"
              inputRef={coOrganizersRef}
              onFocus={() => setFocusedElement("coOrganizers")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "coOrganizers"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              isDisabled={isLoading}
              query={potentialCOsSearchTerm}
              inputOnChange={(e) => handleDropdownListSearchQuery(e, "co-organizers")}
              placeholder="Search users by username, first/last names"
              clearQueryOnClick={() => {
                setPotentialCOsSearchTerm("");
                setAllPotentialCOs([]);
                setFetchPotentialCOsStart(0);
              }}
              dropdownChecklist={
                <DropdownChecklist
                  fetchIsLoading={fetchIsLoading}
                  scrollHandler={handleLoadMorePotentialCOsOnScroll}
                  scrollHandlerParams={[potentialCoOrganizers]}
                  usedFor="potential-co-organizers"
                  displayedItemsArray={potentialCoOrganizers}
                  storageArray={organizers}
                  setStorageArray={setOrganizers}
                  event={currentEvent}
                  action={handleAddRemoveUserAsOrganizer}
                  actionEventParamNeeded={true}
                />
              }
              showList={showPotentialCoOrganizers}
              setShowList={setShowPotentialCoOrganizers}
            />
          </div>
          <div className={styles.addOtherUsersArea}>
            <header className="input-label">
              Invitees: (recommended if event is private){" "}
              {currentUser && usersWhoAreInvitees && usersWhoAreInvitees.length > 0 && (
                <span style={{ color: randomColor }} onClick={() => setInvitees([])}>
                  Remove All
                </span>
              )}
            </header>
            <div className="added-user-tab-container">
              {currentUser &&
                usersWhoAreInvitees &&
                usersWhoAreInvitees.length > 0 &&
                usersWhoAreInvitees.map((user) => (
                  <Tab
                    key={user._id?.toString()}
                    info={user}
                    removeHandler={handleAddRemoveUserAsInvitee}
                    removeHandlerNeedsEventParam={false}
                    removeHandlerParams={[invitees, setInvitees, user]}
                    randomColor={randomColor}
                    isDisabled={isLoading}
                  />
                ))}
            </div>
            <SearchAndDropdownList
              randomColor={randomColor}
              name="potential-invitees-search"
              id="potential-invitees-search"
              inputRef={inviteesRef}
              onFocus={() => setFocusedElement("invitees")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "invitees"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              isDisabled={isLoading}
              query={inviteesSearchQuery}
              inputOnChange={(e) => handleDropdownListSearchQuery(e, "invitees")}
              placeholder="Search users by username, first/last names"
              clearQueryOnClick={() => {
                setInviteesSearchQuery("");
                if (fetchPotentialInviteesQuery.data) {
                  setPotentialInvitees(fetchPotentialInviteesQuery.data);
                }
              }}
              showList={showPotentialInvitees}
              setShowList={setShowPotentialInvitees}
              dropdownChecklist={
                <DropdownChecklist
                  usedFor="potential-invitees"
                  displayedItemsArray={potentialInvitees}
                  storageArray={invitees}
                  setStorageArray={setInvitees}
                  event={currentEvent}
                  action={handleAddRemoveUserAsInvitee}
                  actionEventParamNeeded={true}
                />
              }
            />
          </div>
          <div className={styles.addOtherUsersArea}>
            <header className="input-label">
              Block users: (users whom you don't want to see this event){" "}
              {currentUser && blockedUsersEvent.length > 0 && (
                <span
                  style={{ color: randomColor }}
                  onClick={() => setBlockedUsersEvent([])}
                >
                  Remove All
                </span>
              )}
            </header>
            {/* Checkbox to add all blocked users to blockedUsersEvent. Only render if currentUser has blocked people. Only have it checked if all blocked users have been added to blockedUsersEvent (combination of state blockedUsersEvent & event.blockedUsersEvent). */}
            {currentUser?.blockedUsers.length &&
              currentUser.blockedUsers
                .map((bu) => bu._id)
                .some((id) => !blockedUsersEvent.map((bu) => bu._id).includes(id)) && (
                <label className="form-sub-checkbox">
                  <input
                    name="blocked-users-event-checkbox"
                    id="blocked-users-event-checkbox"
                    type="checkbox"
                    style={{ accentColor: randomColor }}
                    onChange={() => {
                      let newBlockees = [];
                      for (const bu of currentUser.blockedUsers) {
                        newBlockees.push(bu);
                      }
                      setBlockedUsersEvent(
                        Methods.removeDuplicatesFromArray(newBlockees)
                      );
                    }}
                    checked={currentUser.blockedUsers.every((bu) => {
                      if (event && event.blockedUsersEvent) {
                        return blockedUsersEvent.indexOf(bu) !== -1;
                      }
                    })}
                  />
                  <span>Add all users you have blocked</span>
                </label>
              )}
            <div className="added-user-tab-container">
              {currentUser &&
                event &&
                blockedUsersEvent &&
                blockedUsersEvent.length > 0 &&
                blockedUsersEvent.map((user) => (
                  <Tab
                    key={user._id?.toString()}
                    info={user}
                    removeHandler={handleAddRemoveBlockedUserOnEvent}
                    removeHandlerNeedsEventParam={false}
                    removeHandlerParams={[user]}
                    randomColor={randomColor}
                    isDisabled={isLoading}
                  />
                ))}
            </div>
            <SearchAndDropdownList
              randomColor={randomColor}
              name="potential-blockees-search"
              id="potential-blockees-search"
              inputRef={blockeesRef}
              onFocus={() => setFocusedElement("blockees")}
              onBlur={() => setFocusedElement(undefined)}
              style={
                focusedElement === "blockees"
                  ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                  : undefined
              }
              isDisabled={isLoading}
              query={blockeesSearchQuery}
              inputOnChange={(e) => handleDropdownListSearchQuery(e, "blockees")}
              placeholder="Search users by username, first/last names"
              clearQueryOnClick={() => {
                setBlockeesSearchQuery("");
                if (visibleOtherUsers) {
                  setPotentialBlockees(visibleOtherUsers);
                }
              }}
              showList={showPotentialBlockees}
              setShowList={setShowPotentialBlockees}
              dropdownChecklist={
                <DropdownChecklist
                  usedFor="potential-blockees"
                  displayedItemsArray={potentialBlockees}
                  storageArray={blockedUsersEvent}
                  setStorageArray={setBlockedUsersEvent}
                  event={currentEvent}
                  action={handleAddRemoveBlockedUserOnEvent}
                  actionEventParamNeeded={false}
                />
              }
            />
          </div>
          <InterestsSection
            randomColor={randomColor}
            interestsRelation="event"
            newEventInterests={relatedInterests}
            handleAddInterest={handleAddEventInterest}
            handleRemoveInterest={handleRemoveEventInterest}
            isDisabled={isLoading}
          />
          <div className={styles.eventImagesField}>
            <header className="input-label">Images:</header>
            {
              <div className={styles.eventImagesContainer}>
                {eventImages &&
                  eventImages.length > 0 &&
                  eventImages.map((img) => (
                    <div className={styles.eventImageContainer} key={img}>
                      <i
                        title="Remove"
                        onClick={(e) => handleDeleteEventImage(e, img)}
                        className="fas fa-times"
                      ></i>
                      <img
                        key={typeof img === "string" ? img : undefined}
                        src={typeof img === "string" ? img : undefined}
                        style={{ border: `1px solid ${randomColor}` }}
                      />
                    </div>
                  ))}
                {eventImages && eventImages.length < 3 && (
                  <label>
                    <label title="Add Photo" htmlFor="event-image-upload">
                      <i id="add-photo-box" className="fas fa-plus"></i>
                    </label>
                    <input
                      id="event-image-upload"
                      name="event-image-upload"
                      onChange={(e) => handleAddEventImage(e)}
                      style={{ display: "none" }}
                      type="file"
                      accept=".jpeg, .png, .jpg"
                    />
                  </label>
                )}
              </div>
            }
          </div>
          {currentEvent &&
            currentUser &&
            currentUser._id &&
            currentEvent.organizers
              .map((o) => o._id)
              .includes(currentUser._id.toString()) && (
              <button
                type="button"
                onClick={() => setShowAreYouSureDeleteEvent(true)}
                className="delete-button"
              >
                Delete Event
              </button>
            )}
          {showAreYouSureDeleteEvent && (
            <TwoOptionsInterface
              header="Are you sure you want to delete this event?"
              buttonOneText="Cancel"
              buttonOneHandler={() => setShowAreYouSureDeleteEvent(false)}
              handlerOneNeedsEventParam={false}
              buttonTwoText="Delete Event"
              buttonTwoHandler={handleDeleteEvent}
              handlerTwoNeedsEventParam={true}
              closeHandler={setShowAreYouSureDeleteEvent}
            />
          )}
          {showAreYouSureRemoveCurrentUserAsOrganizer && (
            <TwoOptionsInterface
              header="Are you sure you want to remove yourself as an organizer?"
              subheader="You will no longer be able to make changes to this event, unless another user adds you as a co-organizer."
              buttonOneText="Cancel"
              buttonOneHandler={() =>
                setShowAreYouSureRemoveCurrentUserAsOrganizer(false)
              }
              handlerOneNeedsEventParam={false}
              buttonTwoText="Remove Myself as Organizer"
              closeHandler={setShowAreYouSureRemoveCurrentUserAsOrganizer}
              buttonTwoHandler={handleAddRemoveUserAsOrganizer}
              buttonTwoHandlerParams={[organizers, setOrganizers, currentUser]}
              handlerTwoNeedsEventParam={true}
            />
          )}
          <div className="buttons-container">
            <div className="theme-element-container">
              <button
                disabled={!changesMade || isLoading}
                type="reset"
                onClick={() => handleRevert()}
              >
                Revert
              </button>
            </div>
            <button
              disabled={submitButtonIsDisabled}
              onClick={(e) => handleEventFormSubmission(e)}
              style={
                randomColor === "var(--primary-color)"
                  ? { backgroundColor: `${randomColor}`, color: "black" }
                  : { backgroundColor: `${randomColor}`, color: "white" }
              }
              type="submit"
            >
              {usedFor === "edit-event" ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </form>
      )}
    </>
  );
};
export default EventForm;
