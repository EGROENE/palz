import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../../Hooks/useUserContext";
import NavBar from "../NavBar/NavBar";
import { countries } from "../../constants";

const EventForm = () => {
  const privateCheckboxRef = useRef<HTMLInputElement | null>(null);
  const publicCheckboxRef = useRef<HTMLInputElement | null>(null);
  const { showSidebar, setShowSidebar, handleCityStateCountryInput } = useUserContext();

  const [showEventCountries, setShowEventCountries] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventAdditionalInfo, setEventAdditionalInfo] = useState<string>("");
  const [eventCity, setEventCity] = useState<string | undefined>("");
  const [eventState, setEventState] = useState<string | undefined>("");
  const [eventCountry, setEventCountry] = useState<string | undefined>("");
  const [eventLocationError, setEventLocationError] = useState<string>("");
  const [publicity, setPublicity] = useState<"public" | "private">("private");

  useEffect(() => {
    if (showSidebar) {
      setShowSidebar(false);
    }
  }, []);

  // INPUT HANDLERS
  //const handle;

  const handlePublicPrivateBoxChecking = (option: "public" | "private") => {
    if (option === "private") {
      setPublicity("private");
    } else if (option === "public") {
      setPublicity("public");
    }
  };

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
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value.replace(/\s+/g, " "))}
            placeholder="Name your event"
          />
        </label>
        <label>
          <p>Description:</p>
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value.replace(/\s+/g, " "))}
            placeholder="Describe your event"
          />
        </label>
        <label>
          <p>Additional Info: (optional)</p>
          <textarea
            value={eventAdditionalInfo}
            onChange={(e) => setEventAdditionalInfo(e.target.value.replace(/\s+/g, " "))}
            placeholder="Cancelation, backup plans, anything else your guests should know"
          />
        </label>
        <div className="location-inputs">
          <label className="location-input">
            <p>City:</p>
            <input
              value={eventCity}
              onChange={(e) =>
                handleCityStateCountryInput(
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
          </label>
          <label className="location-input">
            <p>State/Province:</p>
            <input
              value={eventState}
              onChange={(e) =>
                handleCityStateCountryInput(
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
              className="country-dropdown-button"
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
          <input placeholder="Number, street, postal code" />
        </label>
        <label>
          <p>Maximum Participants:</p>
          <input inputMode="numeric" placeholder="Max number of participants" />
        </label>
        <div className="event-form-checkbox-container">
          <label>
            <span>Public</span>
            <input
              onChange={() => handlePublicPrivateBoxChecking("public")}
              ref={publicCheckboxRef}
              type="checkbox"
              checked={publicity === "public"}
            />
          </label>
          <label>
            <span>Private</span>
            <input
              onChange={() => handlePublicPrivateBoxChecking("private")}
              ref={privateCheckboxRef}
              type="checkbox"
              checked={publicity === "private"}
            />
          </label>
        </div>
        <label>
          <p>Image One:</p>
          <input placeholder="Link to image" />
        </label>
        <label>
          <p>Image Two:</p>
          <input placeholder="Link to image" />
        </label>
        <label>
          <p>Image Three:</p>
          <input placeholder="Link to image" />
        </label>
      </form>
    </div>
  );
};

export default EventForm;
