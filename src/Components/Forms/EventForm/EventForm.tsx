import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { TUser, TEvent, TEventValuesToUpdate, TThemeColor } from "../../../types";
import Methods from "../../../methods";
import { countries } from "../../../constants";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import Tab from "../../Elements/Tab/Tab";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import TwoOptionsInterface from "../../Elements/TwoOptionsInterface/TwoOptionsInterface";
import { useEventContext } from "../../../Hooks/useEventContext";

const EventForm = ({
  randomColor,
  event,
}: {
  randomColor: TThemeColor | undefined;
  event?: TEvent;
}) => {
  const { showSidebar, setShowSidebar, setImageIsUploading, setImageIsDeleting } =
    useMainContext();
  const { handleCityStateCountryInput, allUsers, currentUser } = useUserContext();
  const {
    allEvents,
    currentEvent,
    setCurrentEvent,
    fetchAllEvents,
    setAddEventIsInProgress,
    setEventDeletionIsInProgress,
    setEventEditIsInProgress,
  } = useEventContext();

  const navigation = useNavigate();

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
  ///////

  const [potentialCoOrganizers, setPotentialCoOrganizers] = useState<TUser[]>([]);
  const [potentialInvitees, setPotentialInvitees] = useState<TUser[]>([]);
  const [coOrganizersSearchQuery, setCoOrganizersSearchQuery] = useState<string>("");
  const [inviteesSearchQuery, setInviteesSearchQuery] = useState<string>("");
  const [showPotentialCoOrganizers, setShowPotentialCoOrganizers] =
    useState<boolean>(false);
  const [showPotentialInvitees, setShowPotentialInvitees] = useState<boolean>(false);

  const [showEventCountries, setShowEventCountries] = useState<boolean>(false);

  // STATE VALUES CORRESPONDING TO EDITABLE PROPERTIES OF TEvent, ALONG W/ CORRESPONDING FIELDS' ERROR STATES:
  const [eventTitle, setEventTitle] = useState<string>(event ? event.title : "");
  const [eventTitleError, setEventTitleError] = useState<string>(
    !event ? "Please fill out this field" : ""
  );
  const [eventDescription, setEventDescription] = useState<string>(
    event ? event.description : ""
  );
  const [eventDescriptionError, setEventDescriptionError] = useState<string>(
    !event ? "Please fill out this field" : ""
  );
  const [eventAdditionalInfo, setEventAdditionalInfo] = useState<string>(
    event ? event.additionalInfo : ""
  );
  const [eventAdditionalInfoError, setEventAdditionalInfoError] = useState<string>("");
  const [eventCity, setEventCity] = useState<string | undefined>(event ? event.city : "");
  const [eventState, setEventState] = useState<string | undefined>(
    event ? event.stateProvince : ""
  );
  const [eventCountry, setEventCountry] = useState<string | undefined>(
    event ? event.country : ""
  );
  const [eventLocationError, setEventLocationError] = useState<string>(
    !event ? "Please fill out all 3 location fields" : ""
  );
  const [eventStartDateMidnightUTCInMS, setEventStartDateMidnightUTCInMS] = useState(
    event ? event.eventStartDateMidnightUTCInMS : 0
  );
  const [eventStartTimeAfterMidnightUTCInMS, setEventStartTimeAfterMidnightUTCInMS] =
    useState(event ? event.eventStartTimeAfterMidnightUTCInMS : -1); // set to this instead of undefined or null in order to avoid TS errors
  const [eventStartDateTimeError, setEventStartDateTimeError] = useState<string>(
    !event ? "Please specify when event begins" : ""
  );
  const [eventEndDateMidnightUTCInMS, setEventEndDateMidnightUTCInMS] = useState(
    event && event.eventEndDateMidnightUTCInMS !== undefined
      ? event.eventEndDateMidnightUTCInMS
      : 0
  );
  const [eventEndTimeAfterMidnightUTCInMS, setEventEndTimeAfterMidnightUTCInMS] =
    useState(
      event && event.eventEndTimeAfterMidnightUTCInMS !== undefined
        ? event.eventEndTimeAfterMidnightUTCInMS
        : -1 // set to this instead of undefined or null in order to avoid TS errors
    );
  const [eventEndDateTimeError, setEventEndDateTimeError] = useState<string>(
    !event ? "Please specify when event ends" : ""
  );
  const [eventAddress, setEventAddress] = useState<string | undefined>(
    event ? event.address : ""
  );
  const [eventAddressError, setEventAddressError] = useState<string | undefined>(
    !event ? "Please fill out this field" : ""
  );
  const [maxParticipants, setMaxParticipants] = useState<number | null>(
    event ? event.maxParticipants : null
  );
  const [eventImages, setEventImages] = useSessionStorage<string[] | undefined>(
    "eventImages",
    event ? event.images : []
  );
  const [publicity, setPublicity] = useState<"public" | "private">(
    event ? event.publicity : "public"
  );
  const [organizers, setOrganizers] = useState<string[]>(
    event ? event.organizers : [`${currentUser?._id}`]
  );
  const [invitees, setInvitees] = useState<string[]>(event ? event.invitees : []);
  const [relatedInterests, setRelatedInterests] = useState<string[]>(
    event ? event.relatedInterests : []
  );
  //////////////////////////////////////////

  const [showErrors, setShowErrors] = useState<boolean>(event ? true : false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showAreYouSureDeleteEvent, setShowAreYouSureDeleteEvent] =
    useState<boolean>(false);
  const [
    showAreYouSureRemoveCurrentUserAsOrganizer,
    setShowAreYouSureRemoveCurrentUserAsOrganizer,
  ] = useState<boolean>(false);

  useEffect(() => {
    setCurrentEvent(allEvents.filter((ev) => ev._id === event?._id)[0]);
  }, [allEvents]);

  useEffect(() => {
    // Hide Sidebar if showing:
    if (showSidebar) {
      setShowSidebar(false);
    }

    // If event passed to this component, setCurrentEvent in mainContext to that:
    if (event) {
      setCurrentEvent(allEvents.filter((ev) => ev._id === event._id)[0]);
      setEventImages(event.images);
    } else {
      if (eventImages && eventImages.length > 0) {
        // Remove any previously added event images (like if user added some on new event, but didn't submit form)
        setEventImages([]);
      }
    }
  }, []);

  useEffect(() => {
    setPotentialCoOrganizers(
      allOtherUsers.filter((user) => {
        if (user._id) {
          return (
            (user.whoCanAddUserAsOrganizer === "anyone" ||
              (user.whoCanAddUserAsOrganizer === "friends" &&
                currentUser?.friends.includes(user._id))) &&
            !invitees.includes(user._id)
          );
        }
      })
    );

    setPotentialInvitees(
      allOtherUsers.filter((user) => {
        if (user._id) {
          return (
            (user.whoCanInviteUser === "anyone" ||
              (user.whoCanInviteUser === "friends" &&
                currentUser?.friends.includes(user._id))) &&
            !organizers.includes(user._id)
          );
        }
      })
    );
  }, [invitees, organizers]);

  // Make allOtherUsers consist first of currentUser's friends, then all others
  const currentUserFriends = allUsers.filter(
    (user) => user._id && currentUser?.friends.includes(user._id)
  );
  const currentUserNonFriends = allUsers
    .filter((user) => user._id !== currentUser?._id)
    .filter((user) => user._id && !currentUser?.friends.includes(user._id));
  const allOtherUsers = currentUserFriends.concat(currentUserNonFriends);

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
      if (
        event &&
        event.images &&
        !event.images.includes(base64) &&
        !eventImages?.includes(base64)
      ) {
        setImageIsUploading(true);
        setEventImages(eventImages?.concat(base64));
        Requests.addEventImage(event, base64)
          .then((response) => {
            if (!response.ok) {
              e.preventDefault();
              setEventImages(eventImages?.filter((image) => image !== base64));
              if (response.status === 413) {
                toast.error("Max file size is 50MB.");
              } else {
                toast.error("Could not add event image. Please try again.");
              }
            } else {
              toast.success("Event image added");
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setImageIsUploading(false));
      } else {
        if (event?.images?.includes(base64) || eventImages?.includes(base64)) {
          toast.error("Cannot upload same image more than once.");
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
    setImageIsDeleting(true);
    setEventImages(eventImages?.filter((image) => image !== imageToBeRemoved));
    if (event) {
      Requests.removeEventImage(event, imageToBeRemoved)
        .then((response) => {
          if (!response.ok) {
            setEventImages(eventImages);
            toast.error("Could not remove event image. Please try again.");
          } else {
            toast.error("Event image removed");
            let newEventImages = [];
            if (eventImages) {
              for (const image of eventImages) {
                if (image !== imageToBeRemoved) {
                  newEventImages.push(image);
                }
              }
            }
            setEventImages(newEventImages);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setImageIsDeleting(false));
    }
  };

  const handlePublicPrivateBoxChecking = (option: "public" | "private"): void =>
    setPublicity(option);

  const handlePotentialCoOrganizersAndInviteesSearchQuery = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "co-organizers" | "invitees"
  ): void => {
    e.preventDefault();
    const inputCleaned = e.target.value.replace(/\s+/g, " ");
    if (field === "co-organizers") {
      setCoOrganizersSearchQuery(inputCleaned);
      setShowPotentialCoOrganizers(true);
      if (inputCleaned.replace(/\s+/g, "") !== "") {
        // If input w/o spaces is not empty string
        const matchingUsers: TUser[] = [];
        for (const user of allOtherUsers) {
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
        setPotentialCoOrganizers(matchingUsers);
      } else {
        // setPotentialCoOrganizers to original value
        setPotentialCoOrganizers(
          allOtherUsers.filter((user) => {
            if (user._id) {
              return (
                (user.whoCanAddUserAsOrganizer === "anyone" ||
                  (user.whoCanAddUserAsOrganizer === "friends" &&
                    currentUser?.friends.includes(user._id))) &&
                !invitees.includes(user._id)
              );
            }
          })
        );
      }
    } else {
      setInviteesSearchQuery(inputCleaned);
      setShowPotentialInvitees(true);
      if (inputCleaned.replace(/\s+/g, "") !== "") {
        const matchingUsers: TUser[] = [];
        for (const user of allOtherUsers) {
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
        setPotentialInvitees(
          allOtherUsers.filter((user) => {
            if (user._id) {
              return (
                (user.whoCanInviteUser === "anyone" ||
                  (user.whoCanInviteUser === "friends" &&
                    currentUser?.friends.includes(user._id))) &&
                !organizers.includes(user._id)
              );
            }
          })
        );
      }
    }
  };

  const handleAddRemoveUserAsOrganizer = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user?: TUser
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
            toast.error("Could not remove you as user. Please try again.");
          } else {
            toast.error(
              "You have removed yourself as an organizer & are no longer able to make changes to that event."
            );
            navigation(`/users/${currentUser?.username}`);
          }
        })
        .catch((error) => console.log(error));
    }
  };

  /* prop could be user: TUser only, but TS must be satisfied (this function, along w/ handleAddRemoveUserAsOrganizer, which has the props now included here, are both passed to Tab as removeHandler) */
  const handleAddRemoveUserAsInvitee = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user?: TUser
  ): void => {
    e?.preventDefault();
    if (user?._id) {
      if (invitees.includes(user._id)) {
        // Remove user as invitee
        setInvitees(invitees.filter((inviteeID) => inviteeID !== user?._id));
      } else {
        setInvitees(invitees.concat(user._id));
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
    if (event) {
      setEventTitle(event.title);
      setEventTitleError("");
      setEventDescription(event.description);
      setEventDescriptionError("");
      setEventAdditionalInfo(event.additionalInfo);
      setEventAdditionalInfoError("");
      setEventCity(event.city);
      setEventState(event.stateProvince);
      setEventCountry(event.country);
      setEventLocationError("");
      setEventStartDateMidnightUTCInMS(event.eventStartDateMidnightUTCInMS);
      setEventStartTimeAfterMidnightUTCInMS(event.eventStartTimeAfterMidnightUTCInMS);
      setEventStartDateTimeError("");
      setEventEndDateMidnightUTCInMS(event.eventEndDateMidnightUTCInMS);
      setEventEndTimeAfterMidnightUTCInMS(event.eventEndTimeAfterMidnightUTCInMS);
      setEventEndDateTimeError("");
      setEventAddress(event.address);
      setEventAddressError("");
      setMaxParticipants(event.maxParticipants);
      setPublicity("public");
      setOrganizers(event.organizers);
      setInvitees(event.invitees);
      setRelatedInterests(event.relatedInterests);
    } else {
      setEventTitle("");
      setEventTitleError("");
      setEventDescription("");
      setEventDescriptionError("");
      setEventAdditionalInfo("");
      setEventAdditionalInfoError("");
      setEventCity("");
      setEventState("");
      setEventCountry("");
      setEventLocationError("");
      setEventStartDateMidnightUTCInMS(0);
      setEventStartTimeAfterMidnightUTCInMS(-1);
      setEventStartDateTimeError("");
      setEventEndDateMidnightUTCInMS(0);
      setEventEndTimeAfterMidnightUTCInMS(-1);
      setEventEndDateTimeError("");
      setEventAddress("");
      setEventAddressError("");
      setMaxParticipants(null);
      setPublicity("public");
      setOrganizers([`${currentUser?._id}`]);
      setInvitees([]);
      setRelatedInterests([]);
    }
  };

  const handleClearDateTime = (isStartDateTime: boolean): void => {
    if (isStartDateTime) {
      setEventStartDateMidnightUTCInMS(0);
      setEventStartTimeAfterMidnightUTCInMS(-1);
      setEventStartDateTimeError(!event ? "Please specify when event starts" : "");
    } else {
      setEventEndDateMidnightUTCInMS(0);
      setEventEndTimeAfterMidnightUTCInMS(-1);
      setEventEndDateTimeError(!event ? "Please specify when event ends" : "");
    }
  };

  const handleAddEventFormSubmission = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    if (!showErrors) {
      setShowErrors(true);
    }
    if (areNoErrors) {
      setIsLoading(true);
      if (event) {
        // When updating an existing event:
        setEventEditIsInProgress(true);
        Requests.updateEvent(event, valuesToUpdate)
          .then((response) => {
            if (!response.ok) {
              toast.error("Could not update event. Please try again.");
              fetchAllEvents();
            } else {
              toast.success("Event updated!");

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
            }
          })
          .catch((error) => console.log(error))
          .finally(() => {
            setIsLoading(false);
            setEventEditIsInProgress(false);
          });
      } else {
        // When adding a newly created event:
        setAddEventIsInProgress(true);
        Requests.createEvent(eventInfos)
          .then((response) => {
            if (!response.ok) {
              toast.error("Could not create event. Please try again.");
            } else {
              toast.success("Event created!");
              navigation(`/${currentUser?.username}/events`);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => {
            setAddEventIsInProgress(false);
            setIsLoading(false);
          });
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
    Requests.deleteEvent(event)
      .then((response) => {
        setShowAreYouSureDeleteEvent(false);
        if (!response.ok) {
          toast.error("Could not delete event. Please try again.");
        } else {
          toast.error("Event deleted");
          navigation(`/users/${currentUser?.username}`); // redirect to user homepage after del event
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setEventDeletionIsInProgress(false);
        setIsLoading(false);
      });
  };

  const getValuesToUpdate = (): TEventValuesToUpdate | undefined => {
    // interestedUsers omitted from type b/c that is not controllable with this form, rather changes depending on other users RSVPing or de-RSVPing.
    if (event) {
      return {
        ...(eventTitle?.trim() !== "" &&
          eventTitle.trim() !== event.title && {
            title: eventTitle,
          }),
        ...(eventStartDateMidnightUTCInMS !== event.eventStartDateMidnightUTCInMS && {
          eventStartDateMidnightUTCInMS: eventStartDateMidnightUTCInMS,
        }),
        ...(eventStartTimeAfterMidnightUTCInMS !==
          event.eventStartTimeAfterMidnightUTCInMS && {
          eventStartTimeAfterMidnightUTCInMS: eventStartTimeAfterMidnightUTCInMS,
        }),
        ...(eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS !==
          event.eventStartDateTimeInMS && {
          eventStartDateTimeInMS:
            eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS,
        }),
        ...(eventEndDateMidnightUTCInMS !== event.eventEndDateMidnightUTCInMS && {
          eventEndDateMidnightUTCInMS: eventEndDateMidnightUTCInMS,
        }),
        ...(eventEndTimeAfterMidnightUTCInMS !==
          event.eventEndTimeAfterMidnightUTCInMS && {
          eventEndTimeAfterMidnightUTCInMS: eventEndTimeAfterMidnightUTCInMS,
        }),
        ...(eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS !==
          event.eventEndDateTimeInMS && {
          eventEndDateTimeInMS:
            eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS,
        }),
        ...(organizers !== event.organizers && {
          organizers: organizers,
        }),
        ...(invitees !== event.invitees && { invitees: invitees }),
        ...(eventDescription !== "" &&
          eventDescription !== event.description && {
            description: eventDescription.trim(),
          }),
        ...(eventAdditionalInfo !== event.additionalInfo && {
          additionalInfo: eventAdditionalInfo.trim(),
        }),
        ...(eventCity !== "" &&
          eventCity?.trim() !== event.city && {
            city: Methods.formatHyphensAndSpacesInString(
              Methods.formatCapitalizedName(eventCity)
            ),
          }),
        ...(eventState !== "" &&
          eventState?.trim() !== event.stateProvince && {
            stateProvince: Methods.formatHyphensAndSpacesInString(
              Methods.formatCapitalizedName(eventState)
            ),
          }),
        ...(eventCountry !== "" &&
          eventCountry !== event.country && {
            country: eventCountry,
          }),
        ...(publicity !== event.publicity && {
          publicity: publicity,
        }),
        ...(maxParticipants !== event.maxParticipants && {
          maxParticipants: maxParticipants,
        }),
        ...(eventAddress?.trim() !== "" &&
          eventAddress?.trim() !== event.address && {
            address: eventAddress?.trim(),
          }),
        ...(relatedInterests !== event.relatedInterests && {
          relatedInterests: relatedInterests,
        }),
      };
    }
  };
  const valuesToUpdate: TEventValuesToUpdate | undefined = getValuesToUpdate();

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

  const getUsersWhoAreOrganizers = (): TUser[] => {
    const usersWhoAreOrganizers: TUser[] = [];
    for (const organizer of organizers) {
      const user = allUsers.filter((user) => user._id === organizer)[0];
      usersWhoAreOrganizers.push(user);
    }
    return usersWhoAreOrganizers;
  };
  const usersWhoAreOrganizers = getUsersWhoAreOrganizers();

  const getUsersWhoAreInvitees = (): TUser[] => {
    const usersWhoAreInvitees: TUser[] = [];
    for (const invitee of invitees) {
      const user = allUsers.filter((user) => user._id === invitee)[0];
      usersWhoAreInvitees.push(user);
    }
    return usersWhoAreInvitees;
  };
  const usersWhoAreInvitees = getUsersWhoAreInvitees();

  const getChangesMade = (): boolean => {
    if (event) {
      return (
        eventTitle !== currentEvent?.title ||
        eventDescription !== currentEvent?.description ||
        eventAdditionalInfo !== currentEvent?.additionalInfo ||
        eventCity !== currentEvent?.city ||
        eventState !== currentEvent?.stateProvince ||
        eventCountry !== currentEvent?.country ||
        eventStartDateMidnightUTCInMS !== event.eventStartDateMidnightUTCInMS ||
        eventStartTimeAfterMidnightUTCInMS !== event.eventStartTimeAfterMidnightUTCInMS ||
        eventEndDateMidnightUTCInMS !== event.eventEndDateMidnightUTCInMS ||
        eventEndTimeAfterMidnightUTCInMS !== event.eventEndTimeAfterMidnightUTCInMS ||
        eventAddress !== currentEvent?.address ||
        maxParticipants !== currentEvent?.maxParticipants ||
        publicity !== currentEvent?.publicity ||
        !Methods.arraysAreIdentical(organizers, currentEvent?.organizers) ||
        !Methods.arraysAreIdentical(currentEvent?.invitees, invitees) ||
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

  /* const allRequiredFieldsFilled: boolean =
    eventTitle !== "" &&
    eventDescription !== "" &&
    eventCity !== "" &&
    eventState !== "" &&
    eventCountry !== "" &&
    eventStartDateMidnightUTCInMS !== 0 &&
    eventStartTimeAfterMidnightUTCInMS !== 0 &&
    eventAddress !== ""; */

  const getSubmitButtonIsDisabled = (): boolean => {
    if (isLoading) {
      return true;
    } else if (event) {
      // return !(changesMade && allRequiredFieldsFilled && areNoErrors);
      return !changesMade;
    }
    //return !(areNoErrors && allRequiredFieldsFilled);
    return false;
  };
  const submitButtonIsDisabled: boolean = getSubmitButtonIsDisabled();

  const eventInfos: TEvent = {
    title: eventTitle.trim(),
    creator: currentUser?._id,
    organizers: organizers,
    invitees: invitees,
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
    <form className={styles.eventForm}>
      <label>
        <p>Title:</p>
        <input
          ref={titleRef}
          onFocus={() => setFocusedElement("title")}
          onBlur={() => setFocusedElement(undefined)}
          style={
            focusedElement === "title"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
          disabled={isLoading}
          className={eventTitleError !== "" && showErrors ? "erroneous-field" : undefined}
          value={eventTitle}
          onChange={(e) => handleEventTitleInput(e)}
          placeholder="Name your event"
        />
        {eventTitleError !== "" && showErrors && <p>{eventTitleError}</p>}
      </label>
      <label>
        <p>Description:</p>
        <textarea
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
        <p>Additional Info: (optional)</p>
        <textarea
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
            eventAdditionalInfoError !== "" && showErrors ? "erroneous-field" : undefined
          }
          value={eventAdditionalInfo}
          onChange={(e) => handleEventAdditionalInfo(e)}
          placeholder="Cancelation, backup plans, anything else your guests should know"
        />
        {eventAdditionalInfoError !== "" && <p>{eventAdditionalInfoError}</p>}
      </label>
      <div className="location-inputs">
        <label className="location-input">
          <p>City:</p>
          <input
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
          <p>State/Province:</p>
          <input
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
          <p>Country:</p>
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
                >{`${
                  countries.filter((country) => country.country === eventCountry)[0]
                    .country
                }`}</span>
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
        <p>Address:</p>
        <input
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
              <p>Start Date:</p>{" "}
              <input
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
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
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
              <p>Start Time:</p>
              <input
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
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
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
              <span onClick={() => handleClearDateTime(true)} className="remove-data">
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
              <p>End Date:</p>{" "}
              <input
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
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
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
              <p>End Time:</p>
              <input
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
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
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
              <span onClick={() => handleClearDateTime(false)} className="remove-data">
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
        <p>Maximum Participants: (optional, not including organizers)</p>
        <input
          ref={maxParticipantsRef}
          onFocus={() => setFocusedElement("maxParticipants")}
          onBlur={() => setFocusedElement(undefined)}
          style={
            focusedElement === "maxParticipants"
              ? {
                  boxShadow: `0px 0px 10px 2px ${randomColor}`,
                  outline: "none",
                  width: "25%",
                }
              : { width: "25%" }
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
          <span>Public</span>
          <input
            ref={publicRef}
            onFocus={() => setFocusedElement("public")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "public"
                ? {
                    boxShadow: `0px 0px 10px 2px ${randomColor}`,
                    outline: "none",
                    width: "unset",
                  }
                : { width: "unset" }
            }
            disabled={isLoading}
            onChange={() => handlePublicPrivateBoxChecking("public")}
            type="checkbox"
            checked={publicity === "public"}
          />
        </label>
        <label>
          <span>Private</span>
          <input
            ref={privateRef}
            onFocus={() => setFocusedElement("private")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "private"
                ? {
                    boxShadow: `0px 0px 10px 2px ${randomColor}`,
                    outline: "none",
                    width: "unset",
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
        <p>
          Co-organizers: (optional){" "}
          {currentUser &&
            !isLoading &&
            usersWhoAreOrganizers.filter(
              (user) => user.username !== currentUser?.username
            ).length > 0 && (
              <>
                <span
                  style={{ color: randomColor }}
                  onClick={() => setShowAreYouSureRemoveCurrentUserAsOrganizer(true)}
                >
                  Remove Yourself
                </span>
                {event?.creator === currentUser?._id && (
                  <span
                    style={{ color: randomColor }}
                    onClick={() => setOrganizers([`${currentUser?._id}`])}
                  >
                    Remove All Others
                  </span>
                )}
              </>
            )}
        </p>
        <div className={styles.coorganizersInviteesContainer}>
          {currentUser &&
            usersWhoAreOrganizers.filter(
              (user) => user.username !== currentUser?.username
            ).length > 0 &&
            usersWhoAreOrganizers
              .filter((user) => user.username !== currentUser?.username)
              .map((user) => (
                <Tab
                  key={user._id}
                  info={user}
                  removeHandler={handleAddRemoveUserAsOrganizer}
                  randomColor={randomColor}
                  isDisabled={isLoading}
                  userMayNotDelete={event?.creator === user._id}
                  specialIcon={
                    event?.creator === user._id ? (
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
        <div className={styles.coorganizersInviteesInputs}>
          <input
            ref={coOrganizersRef}
            onFocus={() => setFocusedElement("coOrganizers")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "coOrganizers"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            disabled={isLoading}
            value={coOrganizersSearchQuery}
            onChange={(e) =>
              handlePotentialCoOrganizersAndInviteesSearchQuery(e, "co-organizers")
            }
            type="text"
            placeholder="Search users by username, first/last names"
          />
          {coOrganizersSearchQuery.replace(/s\+/g, "") !== "" && (
            <i
              onClick={() => {
                setCoOrganizersSearchQuery("");
                setPotentialCoOrganizers(
                  allOtherUsers.filter((user) => {
                    if (user._id) {
                      return (
                        (user.whoCanAddUserAsOrganizer === "anyone" ||
                          (user.whoCanAddUserAsOrganizer === "friends" &&
                            currentUser?.friends.includes(user._id))) &&
                        !invitees.includes(user._id)
                      );
                    }
                  })
                );
              }}
              className="clear-other-users-search-query fas fa-times"
            ></i>
          )}
          <div className={styles.coorganizersInviteesDropdown}>
            <button
              style={{ backgroundColor: randomColor }}
              disabled={isLoading}
              type="button"
              onClick={() => setShowPotentialCoOrganizers(!showPotentialCoOrganizers)}
            >
              Select user:
              <i
                style={showPotentialCoOrganizers ? { "rotate": "180deg" } : undefined}
                className="fas fa-chevron-down"
              ></i>
            </button>
            {showPotentialCoOrganizers && (
              <ul className="dropdown-list">
                {potentialCoOrganizers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleAddRemoveUserAsOrganizer(undefined, user)}
                    className={styles.otherUserOption}
                  >
                    <input
                      disabled={isLoading}
                      onChange={() => handleAddRemoveUserAsOrganizer(undefined, user)}
                      checked={
                        (typeof user._id === "string" || typeof user._id === "number") &&
                        organizers.includes(user._id)
                      }
                      type="checkbox"
                    />
                    <li title={`${user.firstName} ${user.lastName}`}>
                      <img src={`${user.profileImage}`} />
                      <span style={{ fontSize: "1rem" }}>{`${user.username}`}</span>
                    </li>
                  </div>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className={styles.addOtherUsersArea}>
        <p>
          Invitees: (recommended if event is private){" "}
          {currentUser && usersWhoAreInvitees.length > 0 && (
            <span style={{ color: randomColor }} onClick={() => setInvitees([])}>
              Remove All
            </span>
          )}
        </p>
        <div className={styles.coorganizersInviteesContainer}>
          {currentUser &&
            usersWhoAreInvitees.length > 0 &&
            usersWhoAreInvitees.map((user) => (
              <Tab
                key={user._id}
                info={user}
                removeHandler={handleAddRemoveUserAsInvitee}
                randomColor={randomColor}
                isDisabled={isLoading}
              />
            ))}
        </div>
        <div className={styles.coorganizersInviteesInputs}>
          <input
            ref={inviteesRef}
            onFocus={() => setFocusedElement("invitees")}
            onBlur={() => setFocusedElement(undefined)}
            style={
              focusedElement === "invitees"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            disabled={isLoading}
            value={inviteesSearchQuery}
            onChange={(e) =>
              handlePotentialCoOrganizersAndInviteesSearchQuery(e, "invitees")
            }
            type="text"
            placeholder="Search users by username, first/last names"
          />
          {inviteesSearchQuery.replace(/s\+/g, "") !== "" && (
            <i
              onClick={() => {
                setInviteesSearchQuery("");
                setPotentialInvitees(
                  allOtherUsers.filter((user) => {
                    if (user._id) {
                      return (
                        (user.whoCanInviteUser === "anyone" ||
                          (user.whoCanInviteUser === "friends" &&
                            currentUser?.friends.includes(user._id))) &&
                        !organizers.includes(user._id)
                      );
                    }
                  })
                );
              }}
              className="clear-other-users-search-query fas fa-times"
            ></i>
          )}
          <div className={styles.coorganizersInviteesDropdown}>
            <button
              style={{ backgroundColor: randomColor }}
              disabled={isLoading}
              type="button"
              onClick={() => setShowPotentialInvitees(!showPotentialInvitees)}
            >
              Select user:
              <i
                style={showPotentialInvitees ? { "rotate": "180deg" } : undefined}
                className="fas fa-chevron-down"
              ></i>
            </button>
            {showPotentialInvitees && (
              <ul className="dropdown-list">
                {potentialInvitees.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleAddRemoveUserAsInvitee(undefined, user)}
                    className={styles.otherUserOption}
                  >
                    <input
                      disabled={isLoading}
                      onChange={() => handleAddRemoveUserAsInvitee(undefined, user)}
                      checked={
                        (typeof user._id === "string" || typeof user._id === "number") &&
                        invitees.includes(user._id)
                      }
                      type="checkbox"
                    />
                    <li title={`${user.firstName} ${user.lastName}`}>
                      <img src={`${user.profileImage}`} />
                      <span style={{ fontSize: "1rem" }}>{`${user.username}`}</span>
                    </li>
                  </div>
                ))}
              </ul>
            )}
          </div>
        </div>
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
        <p>Images:</p>
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
                <label title="Add Photo" htmlFor="image-upload">
                  <i className="fas fa-plus"></i>
                </label>
                <input
                  id="image-upload"
                  name="profileImage"
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
      {event && event.creator === currentUser?._id && (
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
          buttonTwoText="Delete Event"
          buttonTwoHandler={handleDeleteEvent}
          closeHandler={setShowAreYouSureDeleteEvent}
        />
      )}
      {showAreYouSureRemoveCurrentUserAsOrganizer && (
        <TwoOptionsInterface
          header="Are you sure you want to remove yourself as an organizer?"
          subheader="You will no longer be able to make changes to this event, unless another user adds you as a co-organizer."
          buttonOneText="Cancel"
          buttonOneHandler={() => setShowAreYouSureRemoveCurrentUserAsOrganizer(false)}
          buttonTwoText="Remove Myself as Organizer"
          closeHandler={setShowAreYouSureRemoveCurrentUserAsOrganizer}
          buttonTwoHandler={handleAddRemoveUserAsOrganizer}
          buttonTwoHandlerParams={[currentUser]}
        />
      )}
      <div className="buttons-container">
        <button
          disabled={!changesMade || isLoading}
          type="reset"
          onClick={() => handleRevert()}
        >
          Revert
        </button>
        <button
          disabled={submitButtonIsDisabled}
          onClick={(e) => handleAddEventFormSubmission(e)}
          style={{ backgroundColor: randomColor }}
          type="submit"
        >
          {event ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </form>
  );
};
export default EventForm;
