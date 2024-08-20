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
  const [eventDateMidnightUTCUnix, setEventDateMidnightUTCUnix] = useState(
    event ? event.eventDateMidnightUTCUnix : 0
  );
  const [eventTimeAfterMidnightUTCUnix, setEventTimeAfterMidnightUTCUnix] = useState(
    event ? event.eventTimeAfterMidnightUTCUnix : 0
  );
  const [eventDateTimeError, setEventDateTimeError] = useState<string>(
    !event ? "Please fill out date & time fields" : ""
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

  const [showErrors, setShowErrors] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showAreYouSureInterface, setShowAreYouSureInterface] = useState<boolean>(false);

  // Function to reset otherUsers to its original value, w/o filters from coOrganizersSearchQuery
  const setPotentialCoOrganizersAndOrInviteesToOriginalValue = (
    field?: "co-organizers" | "invitees"
  ): void => {
    const currentUserPalz: (string | number)[] | undefined = currentUser?.friends;
    // use for...of loop to avoid TS errors
    let firstOtherUsers: TUser[] = [];
    for (const user of allOtherUsers) {
      if (user.id && currentUserPalz?.includes(user.id)) {
        firstOtherUsers.push(user);
      }
    }
    // use for...of loop to avoid TS errors
    const restOfUsers: TUser[] = [];
    for (const user of allOtherUsers) {
      if (user.id && !currentUserPalz?.includes(user.id)) {
        restOfUsers.push(user);
      }
    }
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

  const getDateFieldValue = (eventDateMidnightUTCUnix: number): string => {
    // yyyy-mm-dd
    let month = String(new Date(eventDateMidnightUTCUnix).getMonth() + 1);
    let day = String(new Date(eventDateMidnightUTCUnix).getDate());
    const year = new Date(eventDateMidnightUTCUnix).getFullYear();
    if (Number(month) < 10) {
      month = `0${month}`;
    }
    if (Number(day) < 10) {
      day = `0${day}`;
    }
    return `${year}-${month}-${day}`;
  };

  const getTimeFieldValue = (eventTimeAfterMidnightUTCUnix: number): string => {
    const hoursSinceMidnight = eventTimeAfterMidnightUTCUnix / 3600000; // EX: 23.75
    const hoursSinceMidnightString = String(eventTimeAfterMidnightUTCUnix / 3600000); // EX: "23.75"
    const wholeHoursSinceMidnight = Math.floor(hoursSinceMidnight); // EX: 23
    const remainingMinutes = (
      Number(hoursSinceMidnightString.substring(hoursSinceMidnightString.indexOf("."))) *
      60
    ).toFixed(0); // EX: 45 (0.75 * 60)
    return `${wholeHoursSinceMidnight}:${remainingMinutes}`; // EX: 23:45
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
      setEventDateMidnightUTCUnix(eventDateUTCinMS);

      // Show error if event isn't set at least one hour in advance:
      if (eventDateUTCinMS + eventTimeAfterMidnightUTCUnix < nowPlusOneHourEpoch) {
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
      setEventTimeAfterMidnightUTCUnix(hoursPlusMinutesInMS);

      // Show error if event isn't set at least one hour in advance:
      if (hoursPlusMinutesInMS + eventDateMidnightUTCUnix < nowPlusOneHourEpoch) {
        setEventDateTimeError("Event can only be set at least 1 hour in advance");
      } else {
        setEventDateTimeError("");
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
        setPotentialCoOrganizersAndOrInviteesToOriginalValue("co-organizers");
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
        setPotentialCoOrganizersAndOrInviteesToOriginalValue("invitees"); // make sep functions for each type
      }
    }
  };

  const handleAddRemoveUserAsOrganizer = (user: TUser): void => {
    if (user.id) {
      if (organizers.includes(user.id)) {
        // Remove user as organizer:
        if (user.id === currentUser?.id) {
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
        } else {
          setOrganizers(organizers.filter((organizer) => organizer !== user.id));
          setPotentialCoOrganizersAndOrInviteesToOriginalValue("co-organizers");
        }
      } else {
        // Add user as organizer:
        const updatedArray = organizers.concat(String(user.id));
        setOrganizers(updatedArray);
        setPotentialInvitees(
          potentialInvitees.filter((potentialInvitee) => potentialInvitee.id !== user.id)
        );
      }
    }
  };

  const handleAddRemoveUserAsInvitee = (user: TUser): void => {
    if (invitees.includes(String(user.id))) {
      setInvitees(invitees.filter((invitee) => invitee !== user.id));
      setPotentialCoOrganizersAndOrInviteesToOriginalValue("invitees");
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
      setEventDateMidnightUTCUnix(event.eventDateMidnightUTCUnix);
      setEventTimeAfterMidnightUTCUnix(event.eventTimeAfterMidnightUTCUnix);
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
      setEventDateMidnightUTCUnix(0);
      setEventTimeAfterMidnightUTCUnix(0);
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
        setShowAreYouSureInterface(false);
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
        ...(eventDateMidnightUTCUnix !== event.eventDateMidnightUTCUnix && {
          eventDateMidnightUTCUnix: eventDateMidnightUTCUnix,
        }),
        ...(eventTimeAfterMidnightUTCUnix !== event.eventTimeAfterMidnightUTCUnix && {
          eventTimeAfterMidnightUTCUnix: eventTimeAfterMidnightUTCUnix,
        }),
        ...(eventDateMidnightUTCUnix + eventTimeAfterMidnightUTCUnix !==
          event.eventDateTimeUnix && {
          eventDateTimeUnix: eventDateMidnightUTCUnix + eventTimeAfterMidnightUTCUnix,
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
        eventDateMidnightUTCUnix !== event.eventDateMidnightUTCUnix ||
        eventTimeAfterMidnightUTCUnix !== event.eventTimeAfterMidnightUTCUnix ||
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
      eventDateMidnightUTCUnix !== 0 ||
      eventTimeAfterMidnightUTCUnix !== 0 ||
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

  /* const allRequiredFieldsFilled: boolean =
    eventTitle !== "" &&
    eventDescription !== "" &&
    eventCity !== "" &&
    eventState !== "" &&
    eventCountry !== "" &&
    eventDateMidnightUTCUnix !== 0 &&
    eventTimeAfterMidnightUTCUnix !== 0 &&
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
    eventDateMidnightUTCUnix: eventDateMidnightUTCUnix,
    eventTimeAfterMidnightUTCUnix: eventTimeAfterMidnightUTCUnix,
    eventDateTimeUnix: eventDateMidnightUTCUnix + eventTimeAfterMidnightUTCUnix,
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
      <div className="date-time-inputs-container">
        <label>
          <p>Date:</p>{" "}
          <input
            value={
              eventDateMidnightUTCUnix > 0
                ? getDateFieldValue(eventDateMidnightUTCUnix)
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
            value={
              eventTimeAfterMidnightUTCUnix > 0
                ? getTimeFieldValue(eventTimeAfterMidnightUTCUnix)
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
          {coOrganizersSearchQuery.replace(/s\+/g, "") !== "" && (
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
                {potentialCoOrganizers
                  .filter((user) => user.id && !invitees.includes(user.id))
                  .map((user) => (
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
                setPotentialCoOrganizersAndOrInviteesToOriginalValue("invitees");
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
                {potentialInvitees
                  .filter((user) => user.id && !organizers.includes(user.id))
                  .map((user) => (
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
      {event && (
        <button
          type="button"
          onClick={() => setShowAreYouSureInterface(true)}
          className="delete-button"
        >
          Delete Button
        </button>
      )}
      {showAreYouSureInterface && (
        <AreYouSureInterface
          message="Are you sure you want to delete this event?"
          noButtonText="Cancel"
          yesButtonText="Delete Event"
          setShowAreYouSureInterface={setShowAreYouSureInterface}
          executionHandler={handleDeleteEvent}
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
