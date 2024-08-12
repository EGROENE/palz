import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import { TUser, TEvent, TEventValuesToUpdate } from "../../types";
import Methods from "../../methods";
import { countries } from "../../constants";
import Requests from "../../requests";
import toast from "react-hot-toast";
import UserTab from "../UserTab/UserTab";
import InterestsSection from "../InterestsSection/InterestsSection";

const EventForm = ({ currentEvent }: { currentEvent?: TEvent }) => {
  const { allUsers, currentUser } = useMainContext();
  const { showSidebar, setShowSidebar, handleCityStateCountryInput } = useUserContext();
  const navigation = useNavigate();

  const allOtherUsers = allUsers.filter((user) => user.id !== currentUser?.id);
  /* otherUsers is eventually the resorted version of allOtherUsers (palz shown on top), followed by all others; used to display potential co-organizers in dropdown */
  const [potentialCoOrganizers, setPotentialCoOrganizers] = useState<TUser[]>([]);
  const [potentialInvitees, setPotentialInvitees] = useState<TUser[]>([]);
  const [coOrganizersSearchQuery, setCoOrganizersSearchQuery] = useState<string>("");
  const [inviteesSearchQuery, setInviteesSearchQuery] = useState<string>("");
  const [showPotentialCoOrganizers, setShowPotentialCoOrganizers] =
    useState<boolean>(false);
  const [showPotentialInvitees, setShowPotentialInvitees] = useState<boolean>(false);

  const [showEventCountries, setShowEventCountries] = useState<boolean>(false);

  const [eventTitle, setEventTitle] = useState<string>(
    currentEvent ? currentEvent.title : ""
  );
  const [eventTitleError, setEventTitleError] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>(
    currentEvent ? currentEvent.description : ""
  );
  const [eventDescriptionError, setEventDescriptionError] = useState<string>(
    "Please fill out this field"
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
    "Please fill out all 3 location fields"
  );
  const [eventDate, setEventDate] = useState(0); // epoch translates to certain day at midnight
  const [eventTime, setEventTime] = useState(0); // number of ms
  const [eventDateTimeError, setEventDateTimeError] = useState<string>(
    "Please fill out this field"
  );
  const [eventAddress, setEventAddress] = useState<string | undefined>(
    currentEvent ? currentEvent.address : ""
  );
  const [eventAddressError, setEventAddressError] = useState<string | undefined>(
    "Please fill out this field"
  );
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(
    currentEvent ? currentEvent.maxParticipants : undefined
  );
  const [imageOne, setImageOne] = useState<string | undefined>(
    currentEvent ? currentEvent.imageOne : ""
  );
  const [imageOneError, setImageOneError] = useState<string>("");
  const [imageTwo, setImageTwo] = useState<string | undefined>(
    currentEvent ? currentEvent.imageTwo : ""
  );
  const [imageTwoError, setImageTwoError] = useState<string>("");
  const [imageThree, setImageThree] = useState<string | undefined>(
    currentEvent ? currentEvent.imageThree : ""
  );
  const [imageThreeError, setImageThreeError] = useState<string>("");
  const [publicity, setPublicity] = useState<"public" | "private">(
    currentEvent ? currentEvent.publicity : "public"
  );
  const [organizers, setOrganizers] = useState<string[]>(
    currentEvent ? currentEvent.organizers : [`${currentUser?.id}`]
  );
  const [invitees, setInvitees] = useState<string[]>(
    currentEvent ? currentEvent.invitees : []
  );
  const [relatedInterests, setRelatedInterests] = useState<string[]>(
    currentEvent ? currentEvent.relatedInterests : []
  );
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /* Get ref for these fields, since their values are not being set to their corresponding state values, which are epochs in MS & these are not controlled inputs. If currentEvent, initialize to date/time of that; else, initialize to null. */
  const dateField = useRef<HTMLInputElement | null>(null);
  const timeField = useRef<HTMLInputElement | null>(null);

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
    if (dateField.current !== null && timeField.current !== null) {
      dateField.current.value = "mm/dd/yyyy";
      timeField.current.value = "--:--";
    }

    if (currentEvent) {
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
      setEventDate(0);
      setEventTime(0);
      setEventDateTimeError("");
      setEventAddress(currentEvent.address);
      setEventAddressError("");
      setMaxParticipants(currentEvent.maxParticipants);
      setImageOne(currentEvent.imageOne);
      setImageOneError("");
      setImageTwo(currentEvent.imageTwo);
      setImageTwoError("");
      setImageThree(currentEvent.imageThree);
      setImageThreeError("");
      setPublicity("public");
      setOrganizers(currentEvent.organizers);
      setInvitees(currentEvent.invitees);
      setRelatedInterests(currentEvent.relatedInterests);
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
    if (!showErrors) {
      setShowErrors(true);
    }
    if (areNoErrors) {
      Requests.createEvent(eventInfos)
        .then((response) => {
          if (!response.ok) {
            toast.error("Could not create event. Please try again.");
          } else {
            toast.success("Event created!");
            navigation(`/${currentUser?.username}/events`);
          }
        })
        .catch((error) => console.log(error));
    } else {
      window.alert(
        "Please make sure all fields are filled out & that there are no errors"
      );
    }
  };

  const getValuesToUpdate = (): TEventValuesToUpdate | undefined => {
    // interestedUsers omitted from type b/c that is not controllable with this form, rather changes depending on other users RSVPing or de-RSVPing.
    if (currentEvent) {
      return {
        ...(eventTitle?.trim() !== "" &&
          eventTitle.trim() !== currentEvent.title && {
            title: eventTitle,
          }),
        ...(eventDate + eventTime !== currentEvent.nextEventTime && {
          nextEventTime: eventDate + eventTime,
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
        ...(imageOne !== "" &&
          imageOne !== currentEvent.imageOne && { imageOne: imageOne }),
        ...(imageTwo !== "" &&
          imageTwo !== currentEvent.imageTwo && { imageTwo: imageTwo }),
        ...(imageThree !== "" &&
          imageThree !== currentEvent.imageThree && { imageThree: imageThree }),
        ...(relatedInterests !== currentEvent.relatedInterests && {
          relatedInterests: relatedInterests,
        }),
      };
    }
    return undefined;
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
    if (currentEvent) {
      return (
        eventTitle !== currentEvent.title ||
        eventDescription !== currentEvent.description ||
        eventAdditionalInfo !== currentEvent.additionalInfo ||
        eventCity !== currentEvent.city ||
        eventState !== currentEvent.stateProvince ||
        eventCountry !== currentEvent.country ||
        eventDate !== 0 ||
        eventTime !== 0 ||
        eventAddress !== currentEvent.address ||
        maxParticipants !== currentEvent.maxParticipants ||
        imageOne !== currentEvent.imageOne ||
        imageTwo !== currentEvent.imageTwo ||
        imageThree !== currentEvent.imageThree ||
        publicity !== currentEvent.publicity ||
        organizers !== currentEvent.organizers ||
        invitees !== currentEvent.invitees ||
        relatedInterests !== currentEvent.relatedInterests
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
    eventDate !== 0 &&
    eventTime !== 0 &&
    eventAddress !== "";

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

  const [randomColor, setRandomColor] = useState<string>("");

  useEffect(() => {
    setPotentialCoOrganizersAndOrInviteesToOriginalValue();

    if (showSidebar) {
      setShowSidebar(false);
    }

    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  return (
    <form className="add-event-form">
      <label>
        <p>Title:</p>
        <input
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
            placeholder="Cancelation, backup plans, anything else your guests should know"
          />
          {eventLocationError !== "" && showErrors && <p>{eventLocationError}</p>}
        </label>
        <label className="location-input">
          <p>State/Province:</p>
          <input
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
            placeholder="Cancelation, backup plans, special directions, anything else your guests should know"
          />
        </label>
        <label className="location-countries-dropdown">
          <p>Country:</p>
          <button
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
            ref={dateField}
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
            ref={timeField}
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
          className={
            maxParticipants && !(Number(maxParticipants) > 0)
              ? "erroneous-field"
              : undefined
          }
          style={{ width: "25%" }}
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
            style={{ width: "unset" }}
            onChange={() => handlePublicPrivateBoxChecking("public")}
            type="checkbox"
            checked={publicity === "public"}
          />
        </label>
        <label>
          <span>Private</span>
          <input
            style={{ width: "unset" }}
            onChange={() => handlePublicPrivateBoxChecking("private")}
            type="checkbox"
            checked={publicity === "private"}
          />
        </label>
      </div>
      <label>
        <p>Image One: (optional)</p>
        <input
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
                />
              ))}
        </div>
        <div className="co-organizers-invitees-inputs">
          <input
            value={inviteesSearchQuery}
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
              />
            ))}
        </div>
        <div className="co-organizers-invitees-inputs">
          <input
            value={coOrganizersSearchQuery}
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
      />
      <div className="form-revert-submit-buttons-container">
        <button disabled={!changesMade} type="reset" onClick={() => handleRevert()}>
          Revert
        </button>
        <button
          disabled={!(areNoErrors && allRequiredFieldsFilled)}
          onClick={(e) => handleAddEventFormSubmission(e)}
          type="submit"
        >
          {currentEvent ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </form>
  );
};
export default EventForm;
