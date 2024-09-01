import { useEffect, useState } from "react";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { TEvent, TThemeColor } from "../../../types";
import { Link } from "react-router-dom";
import { countries } from "../../../constants";
import toast from "react-hot-toast";

const EventCard = ({ event }: { event: TEvent }) => {
  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const { currentUser, allUsers, setCurrentEvent } = useMainContext();
  const { handleAddUserRSVP, handleDeleteUserRSVP, handleRemoveInvitee } =
    useUserContext();

  const nextEventDateTime: Date = new Date(event.eventStartDateTimeInMS);

  // Set color of event card's border randomly:
  useEffect(() => {
    const themeColors: TThemeColor[] = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-pink)",
      "var(--theme-purple)",
      "var(--theme-orange)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
  }, []);

  // Make sure that this updates after user de-RSVPs
  const userRSVPd: boolean =
    currentUser && currentUser.id
      ? event.interestedUsers.includes(currentUser.id)
      : false;

  const userIsInvitee: boolean = currentUser?.id
    ? event.invitees.includes(String(currentUser.id))
    : false;

  const refinedOrganizers: (string | number)[] = [];
  for (const organizer of event.organizers) {
    if (allUsers.map((user) => user.id).includes(organizer)) {
      refinedOrganizers.push(organizer);
    }
  }

  const getOrganizersUsernames = (): (string | undefined)[] => {
    const usernameArray: Array<string | undefined> = [];
    for (const organizerID of refinedOrganizers) {
      usernameArray.push(allUsers.filter((user) => user.id === organizerID)[0].username);
    }
    return usernameArray;
  };
  const organizerUsernames = getOrganizersUsernames();

  const userIsOrganizer =
    currentUser && currentUser.id && refinedOrganizers.includes(currentUser.id)
      ? true
      : false;

  const maxParticipantsReached: boolean = event.invitees.length === event.maxParticipants;

  const getRSVPButtonText = (): string => {
    if (maxParticipantsReached) {
      return "Max participants reached";
    } else if (userRSVPd) {
      return "Remove RSVP";
    }
    return "RSVP";
  };
  const rsvpButtonText = getRSVPButtonText();

  const now = Date.now();

  const getStatus = (): string | undefined => {
    if (Math.abs(event.eventStartDateTimeInMS - now) <= 3600000) {
      return "Recently started";
    } else if (
      event.eventEndDateTimeInMS !== -1 &&
      event.eventEndDateTimeInMS > now &&
      event.eventStartDateTimeInMS < now
    ) {
      return "Happening now!";
    }
    return undefined;
  };
  const status: string | undefined = getStatus();

  const eventCountryAbbreviation: string = countries.filter(
    (country) => country.country === event.country
  )[0].abbreviation;

  return (
    <div
      className="event-card"
      style={{
        boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
      }}
    >
      <i
        onClick={() => {
          setCurrentEvent(event);
          navigator.clipboard.writeText(`localhost:5173/events/${event.id}`);
          toast.success("Link copied!");
        }}
        className="fas fa-link"
        title="Copy link to event page to clipboard"
      ></i>
      {userIsInvitee && !userRSVPd && !maxParticipantsReached && (
        <div className="event-card-invitation">
          <p style={{ backgroundColor: randomColor }}>You've been invited!</p>
          <button onClick={(e) => handleAddUserRSVP(e, event)}>{rsvpButtonText}</button>
          <button onClick={(e) => handleRemoveInvitee(e, event, currentUser)}>
            Decline
          </button>
        </div>
      )}
      <div className="event-card-main-info">
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="event-info-container">
            <header>{event.title}</header>
            <p>
              {nextEventDateTime.toDateString()} at{" "}
              {nextEventDateTime.toLocaleTimeString()}
            </p>
            <p className="organizers-event-card">
              <i className="fas fa-user-alt"></i>
              {organizerUsernames.length === 1
                ? organizerUsernames[0]
                : `${organizerUsernames[0]}  +${organizerUsernames.length - 1}`}
            </p>
            <div className="event-buttons-container">
              <Link
                style={{ backgroundColor: randomColor }}
                onClick={() => setCurrentEvent(event)}
                className="event-buttons-container-button"
                to={`/events/${event.id}`}
              >
                See Event
              </Link>
              {((event.eventEndDateTimeInMS === -1 &&
                event.eventStartDateTimeInMS < now) ||
                event.eventEndDateTimeInMS > now) &&
                (!userIsOrganizer ? (
                  <button
                    disabled={maxParticipantsReached}
                    className="event-buttons-container-button"
                    onClick={(e) =>
                      currentUser &&
                      (userRSVPd
                        ? handleDeleteUserRSVP(e, event, currentUser)
                        : handleAddUserRSVP(e, event))
                    }
                  >
                    {rsvpButtonText}
                  </button>
                ) : (
                  <Link
                    onClick={() => setCurrentEvent(event)}
                    to={`/edit-event/${event.id}`}
                    className="event-buttons-container-button"
                  >
                    Edit Event
                  </Link>
                ))}
            </div>
          </div>
          <div className="event-card-image-container">
            {status && <p style={{ backgroundColor: randomColor }}>{status}</p>}
            <img src={event.imageOne} />
          </div>
        </div>
        <div className="event-card-location-container">
          <p>{`${event.city}, ${event.stateProvince}`}</p>
          <img src={`/flags/4x3/${eventCountryAbbreviation}.svg`} />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
