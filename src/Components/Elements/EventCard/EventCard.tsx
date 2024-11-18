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
  const { isLoading } = useMainContext();
  const { currentUser, allUsers } = useUserContext();
  const {
    userRSVPdOptimistic,
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    handleDeclineInvitation,
    setCurrentEvent,
  } = useEventContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  const [userRSVPdActual, setUserRSVPdActual] = useState<boolean | null>(null);

  useEffect(() => {
    if (
      currentUser &&
      currentUser._id &&
      event.interestedUsers.includes(currentUser._id)
    ) {
      setUserRSVPdActual(true);
    } else {
      setUserRSVPdActual(false);
    }
  }, [userRSVPdOptimistic]);

  const nextEventDateTime: Date = new Date(event.eventStartDateTimeInMS);

  useEffect(() => {
    // Set color of event card's border randomly:
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

  const userIsInvitee: boolean = currentUser?._id
    ? event.invitees.includes(currentUser._id)
    : false;

  const userDeclinedInvitation: boolean = currentUser?._id
    ? event.disinterestedUsers.includes(currentUser._id)
    : false;

  const refinedOrganizers: string[] = [];
  for (const organizer of event.organizers) {
    if (allUsers.map((user) => user._id).includes(organizer)) {
      refinedOrganizers.push(organizer);
    }
  }

  const getOrganizersUsernames = (): (string | undefined)[] => {
    const usernameArray: Array<string | undefined> = [];
    for (const organizerID of refinedOrganizers) {
      usernameArray.push(allUsers.filter((user) => user._id === organizerID)[0].username);
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
    } else if (userRSVPdActual || userRSVPdOptimistic) {
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
      {userIsInvitee &&
        !userDeclinedInvitation &&
        !userRSVPdActual &&
        !maxInviteesReached && (
          <div className={styles.eventCardInvitation}>
            <p style={{ backgroundColor: randomColor }}>You've been invited!</p>
            <button
              disabled={isLoading}
              onClick={(e) => handleAddUserRSVP(e, event, setUserRSVPdActual)}
            >
              {rsvpButtonText}
            </button>
            <button
              disabled={isLoading}
              onClick={(e) => handleDeclineInvitation(e, event)}
            >
              Decline
            </button>
          </div>
        )}
      <div className={styles.eventCardMainInfo}>
        <i
          onClick={() => {
            setCurrentEvent(event);
            navigator.clipboard.writeText(`localhost:5173/events/${event._id}`);
            toast.success("Link copied!");
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
                style={{ backgroundColor: randomColor }}
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
                    disabled={maxInviteesReached || isLoading}
                    className={styles.eventButtonsContainerButton}
                    onClick={(e) => {
                      if (userRSVPdActual && currentUser) {
                        handleDeleteUserRSVP(e, event, currentUser, setUserRSVPdActual);
                      } else if (!userRSVPdActual && !userRSVPdOptimistic) {
                        handleAddUserRSVP(e, event, setUserRSVPdActual);
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
              <img src={event.images[0]} />
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
