import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { TUser, TEvent, TEventValuesToUpdate, TThemeColor } from "../../../types";
import Methods from "../../../methods";
import { countries } from "../../../constants";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import UserTab from "../../Elements/UserTab/UserTab";
import InterestsSection from "../../Elements/InterestsSection/InterestsSection";
import ImageURLField from "../../Elements/ImageURLField/ImageURLField";
import AreYouSureInterface from "../../Elements/AreYouSureInterface/AreYouSureInterface";

const EventForm = ({
  randomColor,
  event,
}: {
  randomColor: TThemeColor | undefined;
  event?: TEvent;
}) => {
  const {
    allUsers,
    currentUser,
    allEvents,
    currentEvent,
    setCurrentEvent,
    getMostCurrentEvents,
  } = useMainContext();
  const { showSidebar, setShowSidebar, handleCityStateCountryInput } = useUserContext();
  const navigation = useNavigate();

  const [focusedElement, setFocusedElement] = useState<
    | "title"
    | "description"
    | "additionalInfo"
    | "city"
    | "state"
    | "address"
    | "date"
    | "time"
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
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);
  const maxParticipantsRef = useRef<HTMLInputElement | null>(null);
  const publicRef = useRef<HTMLInputElement | null>(null);
  const privateRef = useRef<HTMLInputElement | null>(null);
  const imageOneRef = useRef<HTMLInputElement | null>(null);
  const imageTwoRef = useRef<HTMLInputElement | null>(null);
  const imageThreeRef = useRef<HTMLInputElement | null>(null);
  const coOrganizersRef = useRef<HTMLInputElement | null>(null);
  const inviteesRef = useRef<HTMLInputElement | null>(null);
  ///////

  const allOtherUsers = allUsers.filter((user) => user.id !== currentUser?.id);
  /* otherUsers is eventually the resorted version of allOtherUsers (with user's palz shown on top), followed by all others; used to display potential co-organizers in dropdown */
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
    useState(event ? event.eventStartTimeAfterMidnightUTCInMS : 0);
  const [eventStartDateTimeError, setEventStartDateTimeError] = useState<string>(
    !event ? "Please fill out date & time fields" : ""
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
  const [eventEndDateTimeError, setEventEndDateTimeError] = useState<string>("");
  const [eventAddress, setEventAddress] = useState<string | undefined>(
    event ? event.address : ""
  );
  const [eventAddressError, setEventAddressError] = useState<string | undefined>(
    !event ? "Please fill out this field" : ""
  );
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(
    event ? event.maxParticipants : undefined
  );
  const [imageOne, setImageOne] = useState<string | undefined>(
    event ? event.imageOne : ""
  );
  const [imageOneError, setImageOneError] = useState<string>("");
  const [imageTwo, setImageTwo] = useState<string | undefined>(
    event ? event.imageTwo : ""
  );
  const [imageTwoError, setImageTwoError] = useState<string>("");
  const [imageThree, setImageThree] = useState<string | undefined>(
    event ? event.imageThree : ""
  );
  const [imageThreeError, setImageThreeError] = useState<string>("");
  const [publicity, setPublicity] = useState<"public" | "private">(
    event ? event.publicity : "public"
  );
  const [organizers, setOrganizers] = useState<(string | number)[]>(
    event ? event.organizers : [`${currentUser?.id}`]
  );
  const [invitees, setInvitees] = useState<(string | number)[]>(
    event ? event.invitees : []
  );
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

  // Function to set otherUsers to its original value, w/o filters from coOrganizersSearchQuery
  const setPotentialCoOrganizersAndOrInvitees = (
    field?: "co-organizers" | "invitees"
  ): void => {
    // use for...of loop to avoid TS errors
    // friends will always be able to add friends as co-organizers/invite them to events
    let currentUserFriends: TUser[] = [];
    for (const user of allOtherUsers) {
      if (user.id && currentUser?.friends.includes(user.id)) {
        currentUserFriends.push(user);
      }
    }
    // use for...of loop to avoid TS errors
    const restOfUsers: TUser[] = [];
    for (const user of allOtherUsers) {
      // For all users who are not friends w/ currentUser, only include users who are not invited to event & who can be added as a co-organizer by anyone.
      if (user.id && !currentUser?.friends.includes(user.id)) {
        restOfUsers.push(user);
      }
    }

    // If only potentialCoOrganizers should be reset (like when deleting coOrganizersSearchQuery)
    if (field === "co-organizers") {
      setPotentialCoOrganizers(
        currentUserFriends.concat(
          restOfUsers.filter(
            (user) =>
              user.id &&
              !invitees.includes(user.id) &&
              user.whoCanAddUserAsOrganizer === "anyone"
          )
        )
      );
    } else if (field === "invitees") {
      // If only potentialInvitees should be reset (like when deleting inviteesSearchQuery)
      setPotentialInvitees(
        currentUserFriends.concat(
          restOfUsers.filter(
            (user) =>
              user.id &&
              !organizers.includes(user.id) &&
              user.whoCanInviteUser === "anyone"
          )
        )
      );
    } else {
      // When both potentialCoOrganizers & potentialInvitees should be reset (like when adding/removing as co-organizer/invitee):
      setPotentialCoOrganizers(
        currentUserFriends.concat(
          restOfUsers.filter(
            (user) =>
              user.id &&
              !invitees.includes(user.id) &&
              user.whoCanAddUserAsOrganizer === "anyone"
          )
        )
      );
      setPotentialInvitees(
        currentUserFriends.concat(
          restOfUsers.filter(
            (user) =>
              user.id &&
              !organizers.includes(user.id) &&
              user.whoCanInviteUser === "anyone"
          )
        )
      );
    }
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
    let remainingMinutes: string = (
      Number(hoursSinceMidnightString.substring(hoursSinceMidnightString.indexOf("."))) *
      60
    ).toFixed(0); // EX: 45 (0.75 * 60)
    if (wholeHoursSinceMidnight < 10) {
      wholeHoursSinceMidnight = `0${wholeHoursSinceMidnight}`;
    }
    if (Number(remainingMinutes) < 10) {
      remainingMinutes = `0${remainingMinutes}`;
    }
    return `${wholeHoursSinceMidnight}:${remainingMinutes}`; // EX: 23:45
  };

  // function should set date/time to utc times
  // display these times in local, if possible
  const handleDateTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    input: "start-date" | "start-time" | "end-date" | "end-time"
  ): void => {
    e.preventDefault();
    const nowDate = new Date();
    const nowPlusOneHourMS = nowDate.getTime() + 3600000;

    if (input === "start-date" || input === "end-date") {
      const inputDateLocal = new Date(e.target.value);
      const timezoneOffsetinMS = inputDateLocal.getTimezoneOffset() * 60000;
      const inputDateMS = e.target.valueAsNumber; // stored time value in ms since midnight, January 1, 1970 UTC to input date
      const eventDateUTCinMS = timezoneOffsetinMS + inputDateMS;

      if (input === "start-date") {
        setEventEndDateTimeError("");
        setEventStartDateMidnightUTCInMS(eventDateUTCinMS);

        console.log(eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS);
        console.log(eventDateUTCinMS + eventStartTimeAfterMidnightUTCInMS);

        if (
          eventEndDateMidnightUTCInMS !== 0 &&
          eventEndTimeAfterMidnightUTCInMS !== -1 &&
          eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS <=
            eventDateUTCinMS + eventStartTimeAfterMidnightUTCInMS
        ) {
          setEventStartDateTimeError(
            "Event must start before its end & at least 1 hour from now"
          );
        } else if (
          eventDateUTCinMS + eventStartTimeAfterMidnightUTCInMS <
          nowPlusOneHourMS
        ) {
          // Show error if event isn't set at least one hour in advance:
          setEventStartDateTimeError("Event can only be set at least 1 hour in advance");
        } else {
          setEventStartDateTimeError("");
        }
      } else {
        setEventStartDateTimeError("");
        setEventEndDateMidnightUTCInMS(eventDateUTCinMS);
        // If end time/date is edited, but other isn't:
        if (
          (!(eventDateUTCinMS > 0) && eventEndTimeAfterMidnightUTCInMS > -1) ||
          (eventEndTimeAfterMidnightUTCInMS === -1 && eventDateUTCinMS > 0)
        ) {
          setEventEndDateTimeError(
            "Both end date & end time fields must be empty or complete"
          );
        } else if (
          // If event end is before the start:
          eventDateUTCinMS + eventEndTimeAfterMidnightUTCInMS <=
          eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS
        ) {
          setEventEndDateTimeError("Event end must be after its start");
        } else {
          setEventEndDateTimeError("");
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
        setEventEndDateTimeError("");
        setEventStartTimeAfterMidnightUTCInMS(hoursPlusMinutesInMS);

        if (
          eventEndDateMidnightUTCInMS !== 0 &&
          eventEndTimeAfterMidnightUTCInMS !== -1 &&
          eventEndDateMidnightUTCInMS + eventEndTimeAfterMidnightUTCInMS <=
            eventStartDateMidnightUTCInMS + hoursPlusMinutesInMS
        ) {
          setEventStartDateTimeError(
            "Event must start before its end & at least 1 hour from now"
          );
        } else if (
          hoursPlusMinutesInMS + eventStartDateMidnightUTCInMS <
          nowPlusOneHourMS
        ) {
          // Show error if event isn't set at least one hour in advance:
          setEventStartDateTimeError("Event can only be set at least 1 hour in advance");
        } else {
          setEventStartDateTimeError("");
        }
      } else {
        setEventStartDateTimeError("");
        setEventEndTimeAfterMidnightUTCInMS(hoursPlusMinutesInMS);
        if (
          (!(eventEndDateMidnightUTCInMS > 0) && hoursPlusMinutesInMS > -1) ||
          (hoursPlusMinutesInMS === -1 && !(eventEndDateMidnightUTCInMS > 0))
        ) {
          // if end date/time is changed, but other is not changed:
          setEventEndDateTimeError(
            "Both end date & end time fields must be empty or complete"
          );
        } else if (
          !(
            eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS <
            eventEndDateMidnightUTCInMS + hoursPlusMinutesInMS
          )
        ) {
          // if start date + time is not before event date + time:
          console.log(eventStartDateMidnightUTCInMS + eventStartTimeAfterMidnightUTCInMS);
          console.log(eventEndDateMidnightUTCInMS + hoursPlusMinutesInMS);
          setEventEndDateTimeError("Event end must be after its start");
        } else {
          setEventEndDateTimeError("");
        }
      }
    }
  };

  const handleMaxParticipantsInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputCleaned = Number(e.target.value.replace(/[^0-9]/g, ""));
    inputCleaned > 0 ? setMaxParticipants(inputCleaned) : setMaxParticipants(undefined);
  };

  const handleImageURLInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    imageNumber: "one" | "two" | "three"
  ): void => {
    e.preventDefault();
    // Handle setting of appropriate state value:
    switch (imageNumber) {
      case "one":
        setImageOne(e.target.value.trim());
        break;
      case "two":
        setImageTwo(e.target.value.trim());
        break;
      default:
        setImageThree(e.target.value.trim());
    }

    // Handle setting of appropriate error:
    if (e.target.value.trim() !== "" && !Methods.isValidUrl(e.target.value.trim())) {
      switch (imageNumber) {
        case "one":
          setImageOneError("Invalid URL");
          break;
        case "two":
          setImageTwoError("Invalid URL");
          break;
        default:
          setImageThreeError("Invalid URL");
      }
    } else {
      switch (imageNumber) {
        case "one":
          setImageOneError("");
          break;
        case "two":
          setImageTwoError("");
          break;
        default:
          setImageThreeError("");
      }
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
        setPotentialCoOrganizersAndOrInvitees("co-organizers");
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
        setPotentialCoOrganizersAndOrInvitees("invitees"); // make sep functions for each type
      }
    }
  };

  const handleAddRemoveUserAsOrganizer = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user?: TUser
  ): void => {
    /* If 'user' is passed, it refers to a user that is not the current user, so the logic to update the organizers that display on page is handled here (then updated in DB once form is submitted.). In else below, the removal of currentUser as an organizer is handled. They are removed from the event's 'organizers' array in DB & redirected to their homepage. */
    if (user?.id) {
      // Add/remove other users as organizers:
      if (organizers.includes(user.id)) {
        // Remove user as organizer:
        setOrganizers(organizers.filter((organizer) => organizer !== user?.id));
        setPotentialCoOrganizersAndOrInvitees("co-organizers");
      } else {
        // Add user as organizer:
        const updatedArray = organizers.concat(String(user?.id));
        setOrganizers(updatedArray);
        setPotentialInvitees(
          potentialInvitees.filter((potentialInvitee) => potentialInvitee.id !== user?.id)
        );
      }
    } else {
      // Remove currentUser as organizer:
      e?.preventDefault();
      // If removing self, currentUser.id is removed from event's 'organizers' array
      // If request to do so is successful, user is redirected back to their homepage. Else, they can try again.
      setIsLoading(true);
      Requests.removeOrganizer(event, currentUser)
        .then((response) => {
          if (!response.ok) {
            toast.error("Could not remove you as organizer. Please try again.");
          } else {
            toast.success(
              "You have been removed as an organizer. You can no longer make changes to this event."
            );
            navigation(`/users/${currentUser?.username}`);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setIsLoading(false));
    }
  };

  /* prop could be user: TUser only, but TS must be satisfied (this function, along w/ handleAddRemoveUserAsOrganizer, which has the props now included here, are both passed to UserTab as removeHandler) */
  const handleAddRemoveUserAsInvitee = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user?: TUser
  ): void => {
    e?.preventDefault();
    if (invitees.includes(String(user?.id))) {
      setInvitees(invitees.filter((invitee) => invitee !== user?.id));
      setPotentialCoOrganizersAndOrInvitees("invitees");
    } else {
      const updatedArray = invitees.concat(String(user?.id));
      setInvitees(updatedArray);
      setPotentialCoOrganizers(
        potentialCoOrganizers.filter(
          (potentialCoOrganizer) => potentialCoOrganizer.id !== user?.id
        )
      );
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
      setImageOne(event.imageOne);
      setImageOneError("");
      setImageTwo(event.imageTwo);
      setImageTwoError("");
      setImageThree(event.imageThree);
      setImageThreeError("");
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
      setEventStartTimeAfterMidnightUTCInMS(0);
      setEventStartDateTimeError("");
      setEventEndDateMidnightUTCInMS(0);
      setEventEndTimeAfterMidnightUTCInMS(-1);
      setEventEndDateTimeError("");
      setEventAddress("");
      setEventAddressError("");
      setMaxParticipants(undefined);
      setImageOne("");
      setImageOneError("");
      setImageTwo("");
      setImageTwoError("");
      setImageThree("");
      setImageThreeError("");
      setPublicity("public");
      setOrganizers([`${currentUser?.id}`]);
      setInvitees([]);
      setRelatedInterests([]);
    }
  };

  const handleAddEventFormSubmission = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();
    getMostCurrentEvents();
    if (!showErrors) {
      setShowErrors(true);
    }
    if (areNoErrors) {
      setIsLoading(true);
      if (event) {
        // When updating an existing event:
        Requests.updateEvent(event, valuesToUpdate)
          .then((response) => {
            if (!response.ok) {
              toast.error("Could not update event. Please try again.");
              getMostCurrentEvents();
            } else {
              toast.success("Event updated!");
              getMostCurrentEvents();

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
              if (valuesToUpdate?.imageOne) {
                setImageOne(valuesToUpdate.imageOne);
              }
              if (valuesToUpdate?.imageTwo) {
                setImageTwo(valuesToUpdate.imageTwo);
              }
              if (valuesToUpdate?.imageThree) {
                setImageThree(valuesToUpdate.imageThree);
              }
              if (valuesToUpdate?.relatedInterests) {
                setRelatedInterests(valuesToUpdate.relatedInterests);
              }
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setIsLoading(false));
      } else {
        // When adding a newly created event:
        Requests.createEvent(eventInfos)
          .then((response) => {
            if (!response.ok) {
              toast.error("Could not create event. Please try again.");
              getMostCurrentEvents();
            } else {
              getMostCurrentEvents();
              toast.success("Event created!");
              navigation(`/${currentUser?.username}/events`);
            }
          })
          .catch((error) => console.log(error))
          .finally(() => setIsLoading(false));
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
      .finally(() => setIsLoading(false));
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
        ...(imageOne !== "" && imageOne !== event.imageOne && { imageOne: imageOne }),
        ...(imageTwo !== "" && imageTwo !== event.imageTwo && { imageTwo: imageTwo }),
        ...(imageThree !== "" &&
          imageThree !== event.imageThree && { imageThree: imageThree }),
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
      const user = allUsers.filter((user) => user.id === organizer)[0];
      usersWhoAreOrganizers.push(user);
    }
    return usersWhoAreOrganizers;
  };
  const usersWhoAreOrganizers = getUsersWhoAreOrganizers();

  const getUsersWhoAreInvitees = (): TUser[] => {
    const usersWhoAreInvitees: TUser[] = [];
    for (const invitee of invitees) {
      const user = allUsers.filter((user) => user.id === invitee)[0];
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
        imageOne !== currentEvent?.imageOne ||
        imageTwo !== currentEvent?.imageTwo ||
        imageThree !== currentEvent?.imageThree ||
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
      eventStartTimeAfterMidnightUTCInMS !== 0 ||
      eventEndDateMidnightUTCInMS !== 0 ||
      eventEndTimeAfterMidnightUTCInMS !== -1 ||
      eventAddress !== "" ||
      maxParticipants !== undefined ||
      imageOne !== "" ||
      imageTwo !== "" ||
      imageThree !== "" ||
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
    eventAddressError === "" &&
    imageOneError === "" &&
    imageTwoError === "" &&
    imageThreeError === "";

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

  const maxParticipantsReached: boolean = maxParticipants
    ? invitees.length > maxParticipants
    : false;

  const eventInfos: TEvent = {
    title: eventTitle.trim(),
    creator: currentUser?.id,
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
    imageOne: imageOne,
    imageTwo: imageTwo,
    imageThree: imageThree,
    relatedInterests: relatedInterests,
  };

  useEffect(() => {
    setPotentialCoOrganizersAndOrInvitees();
  }, [invitees, organizers]);

  useEffect(() => {
    setPotentialCoOrganizersAndOrInvitees();

    /* If user access event's edit page, but is not an organizer, redirect to their homepage & tell them they don't have permission to edit event */
    if (currentUser?.id && !event?.organizers.includes(currentUser.id)) {
      navigation(`/users/${currentUser.username}`);
      toast.error("You do not have permission to edit this event.");
    }

    // Hide Sidebar if showing:
    if (showSidebar) {
      setShowSidebar(false);
    }

    // If event passed to this component, setCurrentEvent to that:
    if (event) {
      setCurrentEvent(allEvents.filter((ev) => ev.id === event.id)[0]);
    }
  }, []);

  useEffect(() => {
    setCurrentEvent(allEvents.filter((ev) => ev.id === event?.id)[0]);
  }, [allEvents]);

  return (
    <form className="event-form">
      <label>
        <p>Title:</p>
        <input
          ref={titleRef}
          onFocus={() => setFocusedElement("title")}
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
            <ul className="country-code-dropdown">
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
      <div className="date-time-inputs-line">
        <div className="date-time-group-container">
          <div className="date-time-inputs-container">
            <label>
              <p>Start Date:</p>{" "}
              <input
                value={
                  eventStartDateMidnightUTCInMS > 0
                    ? getDateFieldValue(eventStartDateMidnightUTCInMS)
                    : ""
                }
                ref={dateRef}
                onFocus={() => setFocusedElement("date")}
                style={
                  focusedElement === "date"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                disabled={isLoading}
                className={
                  (eventStartDateTimeError === "Please fill out this field" &&
                    showErrors) ||
                  eventStartDateTimeError !== ""
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
                ref={timeRef}
                onFocus={() => setFocusedElement("time")}
                style={
                  focusedElement === "time"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                className={
                  (eventStartDateTimeError === "Please fill out this field" &&
                    showErrors) ||
                  eventStartDateTimeError !== ""
                    ? "erroneous-field"
                    : undefined
                }
                onChange={(e) => handleDateTimeInput(e, "start-time")}
                type="time"
              />
            </label>
          </div>
          {eventStartDateTimeError !== "" && showErrors && (
            <p style={{ display: "flex" }}>{eventStartDateTimeError}</p>
          )}
        </div>
        <div className="date-time-group-container">
          <div className="date-time-inputs-container">
            <label>
              <p>End Date: (optional)</p>{" "}
              <input
                value={
                  eventEndDateMidnightUTCInMS > 0
                    ? getDateFieldValue(eventEndDateMidnightUTCInMS)
                    : ""
                }
                ref={dateRef}
                onFocus={() => setFocusedElement("date")}
                style={
                  focusedElement === "date"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                disabled={isLoading}
                className={eventEndDateTimeError !== "" ? "erroneous-field" : undefined}
                onChange={(e) => handleDateTimeInput(e, "end-date")}
                type="date"
              />
            </label>
            <label>
              <p>End Time: (optional)</p>
              <input
                value={
                  eventEndTimeAfterMidnightUTCInMS > -1
                    ? getTimeFieldValue(eventEndTimeAfterMidnightUTCInMS)
                    : ""
                }
                step="600"
                disabled={isLoading}
                ref={timeRef}
                onFocus={() => setFocusedElement("time")}
                style={
                  focusedElement === "time"
                    ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                    : undefined
                }
                className={eventEndDateTimeError !== "" ? "erroneous-field" : undefined}
                onChange={(e) => handleDateTimeInput(e, "end-time")}
                type="time"
              />
            </label>
          </div>
          {eventEndDateTimeError !== "" && (
            <p style={{ display: "flex" }}>{eventEndDateTimeError}</p>
          )}
        </div>
      </div>
      <label>
        <p>Maximum Participants: (optional, not including organizers)</p>
        <input
          ref={maxParticipantsRef}
          onFocus={() => setFocusedElement("maxParticipants")}
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
      <div className="event-form-checkbox-container">
        <label>
          <span>Public</span>
          <input
            ref={publicRef}
            onFocus={() => setFocusedElement("public")}
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
      <div className="add-other-users-area">
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
                <span
                  style={{ color: randomColor }}
                  onClick={() => setOrganizers([`${currentUser?.id}`])}
                >
                  Remove All
                </span>
              </>
            )}
        </p>
        <div className="co-organizers-invitees-container">
          {currentUser &&
            usersWhoAreOrganizers.filter(
              (user) => user.username !== currentUser?.username
            ).length > 0 &&
            usersWhoAreOrganizers
              .filter((user) => user.username !== currentUser?.username)
              .map((user) => (
                <UserTab
                  key={user.id}
                  user={user}
                  removeHandler={handleAddRemoveUserAsOrganizer}
                  randomColor={randomColor}
                  isDisabled={isLoading}
                />
              ))}
        </div>
        <div className="co-organizers-invitees-inputs">
          <input
            ref={coOrganizersRef}
            onFocus={() => setFocusedElement("coOrganizers")}
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
                setPotentialCoOrganizersAndOrInvitees("co-organizers");
              }}
              className="clear-other-users-search-query fas fa-times"
            ></i>
          )}
          <div className="co-organizers-invitees-dropdown">
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
              <ul className="country-code-dropdown">
                {potentialCoOrganizers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleAddRemoveUserAsOrganizer(undefined, user)}
                    className="other-user-option"
                  >
                    <input
                      disabled={isLoading}
                      onChange={() => handleAddRemoveUserAsOrganizer(undefined, user)}
                      checked={
                        (typeof user.id === "string" || typeof user.id === "number") &&
                        organizers.includes(user.id)
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
      <div className="add-other-users-area">
        <p>
          Invitees: (especially recommended if event is private:){" "}
          {currentUser && usersWhoAreInvitees.length > 0 && (
            <span style={{ color: randomColor }} onClick={() => setInvitees([])}>
              Remove All
            </span>
          )}
        </p>
        <div className="co-organizers-invitees-container">
          {currentUser &&
            usersWhoAreInvitees.length > 0 &&
            usersWhoAreInvitees.map((user) => (
              <UserTab
                key={user.id}
                user={user}
                removeHandler={handleAddRemoveUserAsInvitee}
                randomColor={randomColor}
                isDisabled={isLoading}
              />
            ))}
        </div>
        <div className="co-organizers-invitees-inputs">
          <input
            ref={inviteesRef}
            onFocus={() => setFocusedElement("invitees")}
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
                setPotentialCoOrganizersAndOrInvitees("invitees");
              }}
              className="clear-other-users-search-query fas fa-times"
            ></i>
          )}
          <div className="co-organizers-invitees-dropdown">
            <button
              style={{ backgroundColor: randomColor }}
              disabled={isLoading || maxParticipantsReached}
              type="button"
              onClick={() => setShowPotentialInvitees(!showPotentialInvitees)}
            >
              Select user:
              <i
                style={showPotentialInvitees ? { "rotate": "180deg" } : undefined}
                className="fas fa-chevron-down"
              ></i>
            </button>
            {showPotentialInvitees && !maxParticipantsReached && (
              <ul className="country-code-dropdown">
                {potentialInvitees.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleAddRemoveUserAsInvitee(undefined, user)}
                    className="other-user-option"
                  >
                    <input
                      disabled={isLoading}
                      onChange={() => handleAddRemoveUserAsInvitee(undefined, user)}
                      checked={
                        (typeof user.id === "string" || typeof user.id === "number") &&
                        invitees.includes(user.id)
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
          {maxParticipantsReached && <p>Max participants reached</p>}
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
      <ImageURLField
        imageNumber="one"
        imageFieldRef={imageOneRef}
        onFocusHandler={setFocusedElement}
        focusedElement={focusedElement}
        randomColor={randomColor}
        isLoading={isLoading}
        imageError={imageOneError}
        imageURL={imageOne}
        handleImageURLInput={handleImageURLInput}
      />
      <ImageURLField
        imageNumber="two"
        imageFieldRef={imageTwoRef}
        onFocusHandler={setFocusedElement}
        focusedElement={focusedElement}
        randomColor={randomColor}
        isLoading={isLoading}
        imageError={imageTwoError}
        imageURL={imageTwo}
        handleImageURLInput={handleImageURLInput}
      />
      <ImageURLField
        imageNumber="three"
        imageFieldRef={imageThreeRef}
        onFocusHandler={setFocusedElement}
        focusedElement={focusedElement}
        randomColor={randomColor}
        isLoading={isLoading}
        imageError={imageThreeError}
        imageURL={imageThree}
        handleImageURLInput={handleImageURLInput}
      />
      {event && event.creator === currentUser?.id && (
        <button
          type="button"
          onClick={() => setShowAreYouSureDeleteEvent(true)}
          className="delete-button"
        >
          Delete Event
        </button>
      )}
      {showAreYouSureDeleteEvent && (
        <AreYouSureInterface
          message="Are you sure you want to delete this event?"
          noButtonText="Cancel"
          yesButtonText="Delete Event"
          setShowAreYouSureInterface={setShowAreYouSureDeleteEvent}
          executionHandler={handleDeleteEvent}
          randomColor={randomColor}
        />
      )}
      {showAreYouSureRemoveCurrentUserAsOrganizer && (
        <AreYouSureInterface
          message="Are you sure you want to remove yourself as an organizer?"
          subheader="You will no longer be able to make changes to this event, unless another user adds you as a co-organizer."
          noButtonText="Cancel"
          yesButtonText="Remove Myself as Organizer"
          setShowAreYouSureInterface={setShowAreYouSureRemoveCurrentUserAsOrganizer}
          executionHandler={handleAddRemoveUserAsInvitee}
          randomColor={randomColor}
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
