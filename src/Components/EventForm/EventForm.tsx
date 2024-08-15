import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { TUser, TEvent, TEventValuesToUpdate, TThemeColor } from "../../types";
import Methods from "../../methods";
import { countries } from "../../constants";
import Requests from "../../requests";
import toast from "react-hot-toast";
import UserTab from "../UserTab/UserTab";
import InterestsSection from "../InterestsSection/InterestsSection";

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
    | "imageOne"
    | "imageTwo"
    | "imageThree"
    | "coOrganizers"
    | "invitees"
    | undefined
  >();
  // REFS:
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const additionalInfoRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const addressRef = useRef(null);
  const dateRef = useRef<HTMLInputElement | null>(null);
  const timeRef = useRef<HTMLInputElement | null>(null);
  const maxParticipantsRef = useRef(null);
  const publicRef = useRef(null);
  const privateRef = useRef(null);
  const imageOneRef = useRef(null);
  const imageTwoRef = useRef(null);
  const imageThreeRef = useRef(null);
  const coOrganizersRef = useRef(null);
  const inviteesRef = useRef(null);
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
  const [eventTitleError, setEventTitleError] = useState<string>("");
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
  const [eventDate, setEventDate] = useState(0); // epoch translates to certain day at midnight
  const [eventTime, setEventTime] = useState(0); // number of ms
  const [eventDateTimeError, setEventDateTimeError] = useState<string>(
    !event ? "Please fill out this field" : ""
  );
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
  const [organizers, setOrganizers] = useState<string[]>(
    event ? event.organizers : [`${currentUser?.id}`]
  );
  const [invitees, setInvitees] = useState<string[]>(event ? event.invitees : []);
  const [relatedInterests, setRelatedInterests] = useState<string[]>(
    event ? event.relatedInterests : []
  );
  //////////////////////////////////////////

  const [showErrors, setShowErrors] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to reset otherUsers to its original value, w/o filters from coOrganizersSearchQuery
  const setPotentialCoOrganizersAndOrInviteesToOriginalValue = (
    field?: "co-organizers" | "invitees"
  ): void => {
    const currentUserPalz = currentUser?.friends;
    const firstOtherUsers = allOtherUsers.filter((user) =>
      currentUserPalz?.includes(String(user?.id))
    );
    const restOfUsers = allOtherUsers.filter(
      (user) => !currentUserPalz?.includes(String(user?.id))
    );
    if (field === "co-organizers") {
      setPotentialCoOrganizers(firstOtherUsers.concat(restOfUsers));
    } else if (field === "invitees") {
      setPotentialInvitees(firstOtherUsers.concat(restOfUsers));
    } else {
      setPotentialCoOrganizers(firstOtherUsers.concat(restOfUsers));
      setPotentialInvitees(firstOtherUsers.concat(restOfUsers));
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

  // function should set date/time to utc times
  // display these times in local, if possible
  const handleDateTimeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    input: "date" | "time"
  ): void => {
    e.preventDefault();
    const nowDate = new Date();
    const nowPlusOneHourEpoch = nowDate.getTime() + 3600000;

    if (input === "date") {
      const inputDateLocal = new Date(e.target.value);
      const timezoneOffsetinMS = inputDateLocal.getTimezoneOffset() * 60000;
      const inputDateEpoch = e.target.valueAsNumber; // stored time value in ms since midnight, January 1, 1970 UTC to input date
      const eventDateUTCinMS = timezoneOffsetinMS + inputDateEpoch;
      setEventDate(eventDateUTCinMS);

      // Show error if event isn't set at least one hour in advance:
      if (eventDateUTCinMS + eventTime < nowPlusOneHourEpoch) {
        setEventDateTimeError("Event can only be set at least 1 hour in advance");
      } else {
        setEventDateTimeError("");
      }
    } else {
      const hours = e.target.value.substring(0, e.target.value.indexOf(":"));
      const mins = e.target.value.substring(e.target.value.indexOf(":") + 1);
      const hoursInMS = Number(hours) * 3600000;
      const minsInMS = Number(mins) * 60000;
      const hoursPlusMinutesInMS = hoursInMS + minsInMS;
      setEventTime(hoursPlusMinutesInMS);

      // Show error if event isn't set at least one hour in advance:
      if (hoursPlusMinutesInMS + eventDate < nowPlusOneHourEpoch) {
        setEventDateTimeError("Event can only be set at least 1 hour in advance");
      } else {
        setEventDateTimeError("");
      }
    }
  };

  const handleImageURLInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    imageNumber: number
  ): void => {
    e.preventDefault();
    // Handle setting of appropriate state value:
    if (imageNumber === 1) {
      setImageOne(e.target.value.trim());
    } else if (imageNumber === 2) {
      setImageTwo(e.target.value.trim());
    } else {
      setImageThree(e.target.value.trim());
    }

    // Handle setting of appropriate error:
    if (e.target.value.trim() !== "" && !Methods.isValidUrl(e.target.value.trim())) {
      if (imageNumber === 1) {
        setImageOneError("Invalid URL");
      } else if (imageNumber === 2) {
        setImageTwoError("Invalid URL");
      } else {
        setImageThreeError("Invalid URL");
      }
    } else {
      if (imageNumber === 1) {
        setImageOneError("");
      } else if (imageNumber === 2) {
        setImageTwoError("");
      } else {
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
    setInviteesSearchQuery(inputCleaned);
    if (inputCleaned.trim() !== "") {
      if (field === "co-organizers") {
        setShowPotentialCoOrganizers(true);
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
      } else if (field === "invitees") {
        setShowPotentialInvitees(true);
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
      }
    } else {
      setPotentialCoOrganizersAndOrInviteesToOriginalValue();
    }
  };

  const handleAddRemoveUserAsOrganizer = (user: TUser): void => {
    if (organizers.includes(String(user.id))) {
      setOrganizers(organizers.filter((organizer) => organizer !== user.id));
      setPotentialCoOrganizersAndOrInviteesToOriginalValue("invitees");
    } else {
      const updatedArray = organizers.concat(String(user.id));
      setOrganizers(updatedArray);
      setPotentialInvitees(
        potentialInvitees.filter((potentialInvitee) => potentialInvitee.id !== user.id)
      );
    }
  };

  const handleAddRemoveUserAsInvitee = (user: TUser): void => {
    if (invitees.includes(String(user.id))) {
      setInvitees(invitees.filter((invitee) => invitee !== user.id));
      setPotentialCoOrganizersAndOrInviteesToOriginalValue("co-organizers");
    } else {
      const updatedArray = invitees.concat(String(user.id));
      setInvitees(updatedArray);
      setPotentialCoOrganizers(
        potentialCoOrganizers.filter(
          (potentialCoOrganizer) => potentialCoOrganizer.id !== user.id
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
    // Reset date/time fields
    if (dateRef.current !== null && timeRef.current !== null) {
      dateRef.current.value = "mm/dd/yyyy";
      timeRef.current.value = "--:--";
    }

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
      setEventDate(0);
      setEventTime(0);
      setEventDateTimeError("");
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
      setEventDate(0);
      setEventTime(0);
      setEventDateTimeError("");
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
    setIsLoading(true);
    getMostCurrentEvents();
    if (!showErrors) {
      setShowErrors(true);
    }
    if (areNoErrors) {
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
              /* if (valuesToUpdate?.nextEventTime) {
              setEventTitle(valuesToUpdate.title)
            } */
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

  const getValuesToUpdate = (): TEventValuesToUpdate | undefined => {
    // interestedUsers omitted from type b/c that is not controllable with this form, rather changes depending on other users RSVPing or de-RSVPing.
    if (event) {
      return {
        ...(eventTitle?.trim() !== "" &&
          eventTitle.trim() !== event.title && {
            title: eventTitle,
          }),
        ...(eventDate + eventTime !== event.nextEventTime && {
          nextEventTime: eventDate + eventTime,
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
        //eventDate !== 0 ||
        //eventTime !== 0 ||
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
      eventDate !== 0 ||
      eventTime !== 0 ||
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
    eventDateTimeError === "" &&
    eventAddressError === "" &&
    imageOneError === "" &&
    imageTwoError === "" &&
    imageThreeError === "";

  const allRequiredFieldsFilled: boolean =
    eventTitle !== "" &&
    eventDescription !== "" &&
    eventCity !== "" &&
    eventState !== "" &&
    eventCountry !== "" &&
    //eventDate !== 0 &&
    //eventTime !== 0 &&
    eventAddress !== "";

  const getSubmitButtonIsDisabled = (): boolean => {
    if (isLoading) {
      return true;
    } else if (event) {
      return !(changesMade && allRequiredFieldsFilled && areNoErrors);
    }
    return !(areNoErrors && allRequiredFieldsFilled);
  };
  const submitButtonIsDisabled = getSubmitButtonIsDisabled();

  const eventInfos: TEvent = {
    title: eventTitle.trim(),
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
    nextEventTime: eventDate + eventTime,
    maxParticipants: maxParticipants,
    address: eventAddress?.trim(),
    interestedUsers: [],
    imageOne: imageOne,
    imageTwo: imageTwo,
    imageThree: imageThree,
    relatedInterests: relatedInterests,
  };

  useEffect(() => {
    setPotentialCoOrganizersAndOrInviteesToOriginalValue();

    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  useEffect(() => {
    if (event) {
      setCurrentEvent(allEvents.filter((ev) => ev.id === event.id)[0]);
    }
  }, []);

  useEffect(() => {
    setCurrentEvent(allEvents.filter((ev) => ev.id === event?.id)[0]);
  }, [allEvents]);

  return (
    <form className="add-event-form">
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
      <div className="date-time-inputs-container">
        <label>
          <p>Date:</p>{" "}
          <input
            ref={dateRef}
            onFocus={() => setFocusedElement("date")}
            style={
              focusedElement === "date"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            disabled={isLoading}
            className={
              (eventDateTimeError === "Please fill out this field" && showErrors) ||
              eventDateTimeError === "Event can only be set at least 1 hour in advance"
                ? "erroneous-field"
                : undefined
            }
            onChange={(e) => handleDateTimeInput(e, "date")}
            type="date"
          />
        </label>
        <label>
          <p>Time:</p>
          <input
            disabled={isLoading}
            ref={timeRef}
            onFocus={() => setFocusedElement("time")}
            style={
              focusedElement === "time"
                ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
                : undefined
            }
            className={
              (eventDateTimeError === "Please fill out this field" && showErrors) ||
              eventDateTimeError === "Event can only be set at least 1 hour in advance"
                ? "erroneous-field"
                : undefined
            }
            onChange={(e) => handleDateTimeInput(e, "time")}
            type="time"
          />
        </label>
      </div>
      {eventDateTimeError === "Please fill out this field" && showErrors && (
        <p style={{ display: "flex" }}>{eventDateTimeError}</p>
      )}
      {eventDateTimeError === "Event can only be set at least 1 hour in advance" && (
        <p style={{ display: "flex" }}>{eventDateTimeError}</p>
      )}
      <label>
        <p>Maximum Participants: (optional)</p>
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
          value={maxParticipants}
          onChange={(e) =>
            setMaxParticipants(Number(e.target.value.replace(/[^0-9]*$/g, "")))
          }
          inputMode="numeric"
          placeholder="Max number of participants"
        />
        {maxParticipants && !(maxParticipants > 0) && <p>Number must be over 0</p>}
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
      <label>
        <p>Image One: (optional)</p>
        <input
          ref={imageOneRef}
          onFocus={() => setFocusedElement("imageOne")}
          style={
            focusedElement === "imageOne"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
          disabled={isLoading}
          className={imageOneError !== "" ? "erroneous-field" : undefined}
          value={imageOne}
          onChange={(e) => handleImageURLInput(e, 1)}
          placeholder="Link to image"
        />
        {imageOneError !== "" && <p>{imageOneError}</p>}
      </label>
      <label>
        <p>Image Two: (optional)</p>
        <input
          ref={imageTwoRef}
          onFocus={() => setFocusedElement("imageTwo")}
          style={
            focusedElement === "imageTwo"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
          disabled={isLoading}
          className={imageTwoError !== "" ? "erroneous-field" : undefined}
          value={imageTwo}
          onChange={(e) => handleImageURLInput(e, 2)}
          placeholder="Link to image"
        />
        {imageTwoError !== "" && <p>{imageTwoError}</p>}
      </label>
      <label>
        <p>Image Three: (optional)</p>
        <input
          ref={imageThreeRef}
          onFocus={() => setFocusedElement("imageThree")}
          style={
            focusedElement === "imageThree"
              ? { boxShadow: `0px 0px 10px 2px ${randomColor}`, outline: "none" }
              : undefined
          }
          disabled={isLoading}
          className={imageThreeError !== "" ? "erroneous-field" : undefined}
          value={imageThree}
          onChange={(e) => handleImageURLInput(e, 3)}
          placeholder="Link to image"
        />
        {imageThreeError !== "" && <p>{imageThreeError}</p>}
      </label>
      <div className="add-other-users-area">
        <p>
          Co-organizers: (optional){" "}
          {currentUser &&
            !isLoading &&
            usersWhoAreOrganizers.filter(
              (user) => user.username !== currentUser?.username
            ).length > 0 && (
              <span
                style={{ color: randomColor }}
                onClick={() => setOrganizers([`${currentUser?.id}`])}
              >
                Remove All
              </span>
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
          {coOrganizersSearchQuery.trim() !== "" && (
            <i
              onClick={() => {
                setCoOrganizersSearchQuery("");
                setPotentialCoOrganizersAndOrInviteesToOriginalValue("co-organizers");
              }}
              className="clear-other-users-search-query fas fa-times"
            ></i>
          )}
          <div className="co-organizers-invitees-dropdown">
            <button
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
                    onClick={() => handleAddRemoveUserAsOrganizer(user)}
                    className="other-user-option"
                  >
                    <input
                      disabled={isLoading}
                      onChange={() => handleAddRemoveUserAsOrganizer(user)}
                      checked={organizers.includes(String(user.id))}
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
          {coOrganizersSearchQuery.trim() !== "" && (
            <i
              onClick={() => {
                setInviteesSearchQuery("");
                setPotentialCoOrganizersAndOrInviteesToOriginalValue("invitees");
              }}
              className="clear-other-users-search-query fas fa-times"
            ></i>
          )}
          <div className="co-organizers-invitees-dropdown">
            <button
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
              <ul className="country-code-dropdown">
                {potentialInvitees.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleAddRemoveUserAsInvitee(user)}
                    className="other-user-option"
                  >
                    <input
                      disabled={isLoading}
                      onChange={() => handleAddRemoveUserAsInvitee(user)}
                      checked={invitees.includes(String(user.id))}
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
      <div className="form-revert-submit-buttons-container">
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
          type="submit"
        >
          {event ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </form>
  );
};
export default EventForm;
