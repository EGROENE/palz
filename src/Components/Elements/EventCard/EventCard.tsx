import { useEffect, useState } from "react";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { TBarebonesUser, TEvent, TThemeColor, TUser } from "../../../types";
import { Link } from "react-router-dom";
import { countries } from "../../../constants";
import toast from "react-hot-toast";
import styles from "./styles.module.css";
import { useMainContext } from "../../../Hooks/useMainContext";
import Requests from "../../../requests";
import Methods from "../../../methods";

const EventCard = ({ event }: { event: TEvent }) => {
  const { isLoading, theme } = useMainContext();
  const { currentUser } = useUserContext();

  const {
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    handleDeclineInvitation,
    setCurrentEvent,
    handleRemoveDisinterestedUser,
  } = useEventContext();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  const nextEventDateTime: Date = new Date(event.eventStartDateTimeInMS);

  const [fetchEventIsLoading, setFetchEventIsLoading] = useState<boolean>(false);
  const [fetchEventIsError, setFetchEventIsError] = useState<boolean>(false);

  const [interestedUsers, setInterestedUsers] = useState<string[]>(event.interestedUsers);

  const [cardEvent, setCardEvent] = useState<TEvent>();

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
  }, []);

  // Update event:
  useEffect(() => {
    if (event._id) {
      Requests.getEventByID(event._id)
        .then((res) => {
          if (res.ok) {
            res.json().then((e) => setCardEvent(e));
          } else {
            setFetchEventIsError(true);
          }
        })
        .catch((error) => console.log(error))
        .finally(() => setFetchEventIsLoading(false));
    }
  }, [interestedUsers]);

  const userRSVPd: boolean =
    currentUser && currentUser._id && cardEvent
      ? interestedUsers.includes(currentUser._id.toString())
      : false;

  const userIsInvitee: boolean =
    currentUser?._id && cardEvent
      ? cardEvent.invitees.includes(currentUser._id.toString())
      : false;

  const userDeclinedInvitation: boolean =
    currentUser?._id && cardEvent
      ? cardEvent.disinterestedUsers.includes(currentUser._id.toString())
      : false;

  // Define in state eventOrganizers of type TBarebonesUser[]. Set in useEffect by calling getUserByID on every _id in event.organizers, then set in Promise.all.then() statement.
  const [eventOrganizers, setEventOrganizers] = useState<TBarebonesUser[] | null>(null);
  const [fetchOrganizersIsLoading, setFetchOrganizersIsLoading] =
    useState<boolean>(false);
  const [fetchOrganizersIsError, setFetchOrganizersIsError] = useState<boolean>(false);

  useEffect(() => {
    const promisesToAwaitOrganizers = cardEvent?.organizers.map((id) => {
      return Requests.getUserByID(id).then((res) => {
        return res.json().then((user: TUser) => user);
      });
    });

    setFetchOrganizersIsLoading(true);
    if (promisesToAwaitOrganizers) {
      Promise.all(promisesToAwaitOrganizers)
        .then((pic: TUser[]) => {
          setEventOrganizers(pic.map((p) => Methods.getTBarebonesUser(p)));
        })
        .catch((error) => {
          console.log(error);
          setFetchOrganizersIsError(true);
        })
        .finally(() => setFetchOrganizersIsLoading(false));
    }
  }, [event]);

  const userIsOrganizer =
    currentUser &&
    currentUser._id &&
    cardEvent &&
    cardEvent.organizers.includes(currentUser._id.toString())
      ? true
      : false;

  const maxInviteesReached: boolean =
    cardEvent && cardEvent.maxParticipants
      ? cardEvent.invitees.length ===
        cardEvent.maxParticipants - cardEvent.organizers.length
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
      className="eventCard"
      style={{
        boxShadow: `${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px, ${randomColor} 0px 4px 16px`,
      }}
    >
      {fetchEventIsLoading && <p>Loading...</p>}
      {!fetchEventIsLoading && fetchEventIsError && (
        <p>Couldn't fetch event. Try reloading the page.</p>
      )}
      {!fetchEventIsLoading && !fetchEventIsError && (
        <>
          {status && (
            <p
              style={
                randomColor === "var(--primary-color)"
                  ? { backgroundColor: randomColor, color: "black", padding: "0.25rem" }
                  : { backgroundColor: randomColor, color: "white", padding: "0.25rem" }
              }
            >
              {status}
            </p>
          )}
          {userIsInvitee &&
            !userDeclinedInvitation &&
            !userRSVPd &&
            !maxInviteesReached && (
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
                  onClick={(e) => {
                    handleAddUserRSVP(e, event, interestedUsers, setInterestedUsers);
                    if (
                      cardEvent &&
                      cardEvent.disinterestedUsers &&
                      currentUser &&
                      currentUser._id &&
                      cardEvent.disinterestedUsers.includes(currentUser._id.toString())
                    ) {
                      handleRemoveDisinterestedUser(
                        event,
                        Methods.getTBarebonesUser(currentUser)
                      );
                    }
                  }}
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
          <div aria-hidden="false" className={styles.eventCardMainInfo}>
            <i
              tabIndex={0}
              aria-hidden="false"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentEvent(event);
                  navigator.clipboard.writeText(`localhost:5173/events/${event._id}`);
                  toast.success("Link copied!", {
                    style: {
                      background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
                      color: theme === "dark" ? "black" : "white",
                      border: "2px solid green",
                    },
                  });
                }
              }}
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
            <div
              className="event-all-but-location-container"
              style={{ display: "flex", alignItems: "center" }}
            >
              <div className={styles.eventInfoContainer}>
                <header>{event.title}</header>
                <p>
                  {nextEventDateTime.toDateString()} at{" "}
                  {nextEventDateTime.toLocaleTimeString()}
                </p>
                {!fetchOrganizersIsError &&
                  !fetchOrganizersIsLoading &&
                  eventOrganizers && (
                    <p className={styles.organizersEventCard}>
                      <i className="fas fa-user-alt"></i>
                      <span>
                        {eventOrganizers.length === 1
                          ? eventOrganizers.map((o) => o.username)[0]
                          : `${eventOrganizers.map((o) => o.username)[0]}  +${
                              eventOrganizers.length - 1
                            }`}
                      </span>
                    </p>
                  )}
                <div aria-hidden="false" className={styles.eventButtonsContainer}>
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
                            handleDeleteUserRSVP(
                              event,
                              Methods.getTBarebonesUser(currentUser),
                              e,
                              interestedUsers,
                              setInterestedUsers
                            );
                          } else if (!userRSVPd && cardEvent) {
                            handleAddUserRSVP(
                              e,
                              event,
                              interestedUsers,
                              setInterestedUsers
                            );
                            if (
                              cardEvent &&
                              cardEvent.disinterestedUsers &&
                              currentUser &&
                              currentUser._id &&
                              cardEvent.disinterestedUsers.includes(
                                currentUser._id.toString()
                              )
                            ) {
                              handleRemoveDisinterestedUser(
                                event,
                                Methods.getTBarebonesUser(currentUser)
                              );
                            }
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
              <div className="eventCardImageContainer">
                {event && event.images && event.images.length > 0 ? (
                  <img
                    style={{ border: `2px solid ${randomColor}` }}
                    src={event.images[0]}
                  />
                ) : (
                  <p style={{ border: `1px solid ${randomColor}` }}>Something fun!</p>
                )}
              </div>
            </div>
            <div className="eventCardLocationContainer">
              <p>{`${event.city}, ${event.stateProvince}`}</p>
              <img src={`/flags/4x3/${eventCountryAbbreviation}.svg`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EventCard;
