import { useEffect, useState } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { TEvent, TThemeColor } from "../../../types";
import { Link } from "react-router-dom";
import { countries } from "../../../constants";
import toast from "react-hot-toast";
import styles from "./styles.module.css";
import { useMainContext } from "../../../Hooks/useMainContext";

const EventCard = ({ event }: { event: TEvent }) => {
  const { isLoading, theme } = useMainContext();
  const { currentUser, allUsers } = useUserContext();
  const {
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    handleDeclineInvitation,
    setCurrentEvent,
    userRSVPd,
    setUserRSVPd,
  } = useEventContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const nextEventDateTime: Date = new Date(event.eventStartDateTimeInMS);

  useEffect(() => {
    // Set color of event card's border randomly:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);
    if (currentUser?._id) {
      setUserRSVPd(event.interestedUsers.includes(currentUser._id));
    }
  }, []);

  const userIsInvitee: boolean = currentUser?._id
    ? event.invitees.includes(currentUser._id)
    : false;

  const userDeclinedInvitation: boolean = currentUser?._id
    ? event.disinterestedUsers.includes(currentUser._id)
    : false;

  const refinedOrganizers: string[] = [];
  if (allUsers) {
    for (const organizer of event.organizers) {
      if (allUsers.map((user) => user._id).includes(organizer)) {
        refinedOrganizers.push(organizer);
      }
    }
  }

  const getOrganizersUsernames = (): (string | undefined)[] => {
    const usernameArray: Array<string | undefined> = [];
    if (allUsers) {
      for (const organizerID of refinedOrganizers) {
        usernameArray.push(
          allUsers.filter((user) => user._id === organizerID)[0].username
        );
      }
    }
    return usernameArray;
  };
  const organizerUsernames = getOrganizersUsernames();

  const userIsOrganizer =
    currentUser && currentUser._id && refinedOrganizers.includes(currentUser._id)
      ? true
      : false;

  const maxInviteesReached: boolean =
    event.maxParticipants && event
      ? event.invitees.length === event.maxParticipants - event?.organizers.length
      : false;

  const getRSVPButtonText = (): string => {
    if (maxInviteesReached) {
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
      className={styles.eventCard}
      style={{
        boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
      }}
    >
      {userIsInvitee && !userDeclinedInvitation && !userRSVPd && !maxInviteesReached && (
        <div className={styles.eventCardInvitation}>
          <div style={{ boxShadow: "none" }} className="theme-element-container">
            <p>You've been invited!</p>
          </div>
          <button
            style={
              randomColor === "var(--primary-color)"
                ? { backgroundColor: `${randomColor}`, color: "black" }
                : { backgroundColor: `${randomColor}`, color: "white" }
            }
            disabled={isLoading}
            onClick={(e) => handleAddUserRSVP(e, event, setUserRSVPd)}
          >
            {rsvpButtonText}
          </button>
          <button
            style={{
              backgroundColor: "var(--background-color-opposite",
              color: "var(--text-color-opposite)",
            }}
            disabled={isLoading}
            onClick={(e) => handleDeclineInvitation(e, event)}
          >
            Decline
          </button>
        </div>
      )}
      <div className={styles.eventCardMainInfo}>
        <i
          style={
            randomColor === "var(--primary-color)"
              ? { backgroundColor: randomColor, color: "black" }
              : { backgroundColor: randomColor, color: "white" }
          }
          onClick={() => {
            setCurrentEvent(event);
            navigator.clipboard.writeText(`localhost:5173/events/${event._id}`);
            toast.success("Link copied!", {
              style: {
                background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                color: theme === "dark" ? "black" : "white",
                border: "2px solid green",
              },
            });
          }}
          className="fas fa-link"
          title="Copy link to event page to clipboard"
        ></i>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="event-info-container">
            <header>{event.title}</header>
            <p>
              {nextEventDateTime.toDateString()} at{" "}
              {nextEventDateTime.toLocaleTimeString()}
            </p>
            <p className={styles.organizersEventCard}>
              <i className="fas fa-user-alt"></i>
              <span>
                {organizerUsernames.length === 1
                  ? organizerUsernames[0]
                  : `${organizerUsernames[0]}  +${organizerUsernames.length - 1}`}
              </span>
            </p>
            <div className={styles.eventButtonsContainer}>
              <Link
                style={
                  randomColor === "var(--primary-color)"
                    ? { backgroundColor: randomColor, color: "black" }
                    : { backgroundColor: randomColor, color: "white" }
                }
                onClick={() => setCurrentEvent(event)}
                className={styles.eventButtonsContainerButton}
                to={`/events/${event._id}`}
              >
                See Event
              </Link>
              {((event.eventEndDateTimeInMS === -1 &&
                event.eventStartDateTimeInMS < now) ||
                event.eventEndDateTimeInMS > now) &&
                (!userIsOrganizer ? (
                  <button
                    style={{
                      backgroundColor: "var(--background-color-opposite)",
                      color: "var(--text-color-opposite)",
                    }}
                    disabled={maxInviteesReached || isLoading}
                    className={`${styles.eventButtonsContainerButton}`}
                    onClick={(e) => {
                      if (userRSVPd && currentUser) {
                        handleDeleteUserRSVP(e, event, currentUser, setUserRSVPd);
                      } else if (!userRSVPd) {
                        handleAddUserRSVP(e, event, setUserRSVPd);
                      }
                    }}
                  >
                    {rsvpButtonText}
                  </button>
                ) : (
                  <Link
                    onClick={() => setCurrentEvent(event)}
                    to={`/edit-event/${event._id}`}
                    className={styles.eventButtonsContainerButton}
                  >
                    Edit Event
                  </Link>
                ))}
            </div>
          </div>
          <div className={styles.eventCardImageContainer}>
            {status && <p style={{ backgroundColor: randomColor }}>{status}</p>}
            {event && event.images && event.images.length > 0 ? (
              <img style={{ border: `2px solid ${randomColor}` }} src={event.images[0]} />
            ) : (
              <p style={{ border: `1px solid ${randomColor}` }}>Something fun!</p>
            )}
          </div>
        </div>
        <div className={styles.eventCardLocationContainer}>
          <p>{`${event.city}, ${event.stateProvince}`}</p>
          <img src={`/flags/4x3/${eventCountryAbbreviation}.svg`} />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
