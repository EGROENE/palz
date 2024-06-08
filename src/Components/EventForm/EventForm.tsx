import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import { countries } from "../../constants";
import Methods from "../../methods";

const EventForm = () => {
  const privateCheckboxRef = useRef<HTMLInputElement | null>(null);
  const publicCheckboxRef = useRef<HTMLInputElement | null>(null);
  const { showSidebar, setShowSidebar, handleCityStateCountryInput } = useUserContext();

  const [showEventCountries, setShowEventCountries] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventTitleError, setEventTitleError] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDescriptionError, setEventDescriptionError] = useState<string>("");
  const [eventAdditionalInfo, setEventAdditionalInfo] = useState<string>("");
  const [eventAdditionalInfoError, setEventAdditionalInfoError] = useState<string>("");
  const [eventCity, setEventCity] = useState<string | undefined>("");
  const [eventState, setEventState] = useState<string | undefined>("");
  const [eventCountry, setEventCountry] = useState<string | undefined>("");
  const [eventLocationError, setEventLocationError] = useState<string>("");
  const [eventDate, setEventDate] = useState(0); // epoch translates to certain day at midnight
  const [eventTime, setEventTime] = useState(0); // number of ms
  const [eventDateTimeError, setEventDateTimeError] = useState<string>("");
  const [eventAddress, setEventAddress] = useState<string | undefined>("");
  const [eventAddressError, setEventAddressError] = useState<string | undefined>("");
  const [maxParticipants, setMaxParticipants] = useState<number | undefined | string>(); // string is only a type b/c any non-integers are replaced w/ an empty string
  const [imageOne, setImage1] = useState<string>("");
  const [imageOneError, setImage1Error] = useState<string>("");
  const [imageTwo, setImageTwo] = useState<string>("");
  const [imageTwoError, setImageTwoError] = useState<string>("");
  const [imageThree, setImageThree] = useState<string>("");
  const [imageThreeError, setImageThreeError] = useState<string>("");
  const [publicity, setPublicity] = useState<"public" | "private">("public");

  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

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
    if (inputCleaned.trim().length > 100) {
      setEventAdditionalInfoError(
        `Too many characters (${inputCleaned.trim().length} / 100)`
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
  ) => {
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
  ) => {
    e.preventDefault();
    // Handle setting of appropriate state value:
    if (imageNumber === 1) {
      setImage1(e.target.value.trim());
    } else if (imageNumber === 2) {
      setImageTwo(e.target.value.trim());
    } else {
      setImageThree(e.target.value.trim());
    }

    // Handle setting of appropriate error:
    if (e.target.value.trim() !== "" && !Methods.isValidUrl(e.target.value.trim())) {
      if (imageNumber === 1) {
        setImage1Error("Invalid URL");
      } else if (imageNumber === 2) {
        setImageTwoError("Invalid URL");
      } else {
        setImageThreeError("Invalid URL");
      }
    } else {
      if (imageNumber === 1) {
        setImage1Error("");
      } else if (imageNumber === 2) {
        setImageTwoError("");
      } else {
        setImageThreeError("");
      }
    }
  };

  const handlePublicPrivateBoxChecking = (option: "public" | "private"): void =>
    setPublicity(option);

  // Create array in which certain countries from countries array will be placed on top
  const topCountryNames = ["United States", "Canada", "United Kingdom", "Australia"];
  const preferredCountries = countries.filter((country) =>
    topCountryNames.includes(country.country)
  );
  const restOfCountries = countries.filter(
    (country) => !topCountryNames.includes(country.country)
  );
  const getResortedCountries = (): {
    country: string;
    abbreviation: string;
    phoneCode: string;
  }[] => {
    return preferredCountries.concat(restOfCountries);
  };
  const resortedCountries = getResortedCountries();

  return (
    <div className="page-hero" onClick={() => showSidebar && setShowSidebar(false)}>
      <NavBar />
      <h1>Add New Event</h1>
      <form className="add-event-form">
        <label>
          <p>Title:</p>
          <input
            className={eventTitleError !== "" ? "erroneous-field" : undefined}
            value={eventTitle}
            onChange={(e) => handleEventTitleInput(e)}
            placeholder="Name your event"
          />
          {eventTitleError !== "" && <p>{eventTitleError}</p>}
        </label>
        <label>
          <p>Description:</p>
          <textarea
            className={eventDescriptionError !== "" ? "erroneous-field" : undefined}
            value={eventDescription}
            onChange={(e) => handleEventDescriptionInput(e)}
            placeholder="Describe your event"
          />
          {eventDescriptionError !== "" && <p>{eventDescriptionError}</p>}
        </label>
        <label>
          <p>Additional Info: (optional)</p>
          <textarea
            className={eventAdditionalInfoError !== "" ? "erroneous-field" : undefined}
            value={eventAdditionalInfo}
            onChange={(e) => handleEventAdditionalInfo(e)}
            placeholder="Cancelation, backup plans, anything else your guests should know"
          />
          {eventAdditionalInfoError !== "" && <p>{eventAdditionalInfo}</p>}
        </label>
        <div className="location-inputs">
          <label className="location-input">
            <p>City:</p>
            <input
              className={eventLocationError !== "" ? "erroneous-field" : undefined}
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
            {eventLocationError !== "" && <p>{eventLocationError}</p>}
          </label>
          <label className="location-input">
            <p>State/Province:</p>
            <input
              className={eventLocationError !== "" ? "erroneous-field" : undefined}
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
                eventLocationError !== ""
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
            className={eventAddressError !== "" ? "erroneous-field" : undefined}
            value={eventAddress}
            onChange={(e) => handleEventAddressInput(e)}
            placeholder="Number, street, postal code"
          />
          {eventAddressError !== "" && <p>{eventAddressError}</p>}
        </label>
        <div className="date-time-inputs-container">
          <label>
            <p>Date:</p>{" "}
            <input
              className={eventDateTimeError !== "" ? "erroneous-field" : undefined}
              onChange={(e) => handleDateTimeInput(e, "date")}
              type="date"
            />
          </label>
          <label>
            <p>Time:</p>
            <input
              className={eventDateTimeError !== "" ? "erroneous-field" : undefined}
              onChange={(e) => handleDateTimeInput(e, "time")}
              type="time"
            />
          </label>
        </div>
        {eventDateTimeError !== "" && (
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
            onChange={(e) => setMaxParticipants(e.target.value.replace(/[^0-9]*$/g, ""))}
            inputMode="numeric"
            placeholder="Max number of participants"
          />
          {maxParticipants && !(Number(maxParticipants) > 0) && (
            <p>Number must be over 0</p>
          )}
        </label>
        <div className="event-form-checkbox-container">
          <label>
            <span>Public</span>
            <input
              style={{ width: "unset" }}
              onChange={() => handlePublicPrivateBoxChecking("public")}
              ref={publicCheckboxRef}
              type="checkbox"
              checked={publicity === "public"}
            />
          </label>
          <label>
            <span>Private</span>
            <input
              style={{ width: "unset" }}
              onChange={() => handlePublicPrivateBoxChecking("private")}
              ref={privateCheckboxRef}
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
      </form>
    </div>
  );
};

export default EventForm;
