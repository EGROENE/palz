import { TThemeColor, TUser, TEvent } from "../../../types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useEventContext } from "../../../Hooks/useEventContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ImageSlideshow from "../../Elements/ImageSlideshow/ImageSlideshow";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import Tab from "../../Elements/Tab/Tab";
import styles from "./styles.module.css";
import { useMainContext } from "../../../Hooks/useMainContext";

const EventPage = () => {
  const { showSidebar, isLoading, setShowSidebar, theme } = useMainContext();
  const { allUsers, currentUser, userCreatedAccount, setCurrentOtherUser, logout } =
    useUserContext();
  const {
    handleAddUserRSVP,
    handleDeleteUserRSVP,
    allEvents,
    setCurrentEvent,
    handleRemoveInvitee,
    userRSVPd,
    setUserRSVPd,
  } = useEventContext();

  //const [event, setEvent] = useState<TEvent | undefined>();
  const [refinedInterestedUsers, setRefinedInterestedUsers] = useState<TUser[]>([]);
  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);
  const [showInvitees, setShowInvitees] = useState<boolean>(false);

  // Get most current version of event to which this page pertains:
  const { eventID } = useParams();
  const currentEvent: TEvent | undefined = allEvents
    ? allEvents.filter((ev) => ev._id === eventID)[0]
    : undefined;

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  /* 
  If event is private & currentUser isn't organizer or invitee, or if currentUser was blocked by one of the organizers, currentUser doesn't have access to event
  */
  const getUserDoesNotHaveAccess = (): boolean => {
    if (currentUser && currentUser._id) {
      if (currentEvent) {
        const eventIsPrivateAndCurrentUserIsNotOrganizerOrInvitee =
          currentEvent.publicity === "private" &&
          (currentEvent.invitees.includes(currentUser._id) ||
            currentEvent.organizers.includes(currentUser._id));

        const eventOrganizersID: string[] = currentEvent.organizers.map((org) => org);
        const eventOrganizers: TUser[] = [];
        if (allUsers) {
          for (const org of eventOrganizersID) {
            eventOrganizers.push(allUsers?.filter((user) => user._id === org)[0]);
          }
        }

        const currentUserHasBeenBlockedByAnOrganizer: boolean = eventOrganizers
          .map((org) => org.blockedUsers)
          .flat()
          .includes(currentUser._id);

        if (
          eventIsPrivateAndCurrentUserIsNotOrganizerOrInvitee ||
          currentUserHasBeenBlockedByAnOrganizer
        ) {
          return true;
        }
      }
    }
    return false;
  };
  const userDoesNotHaveAccess = getUserDoesNotHaveAccess();

  useEffect(() => {
    // Redirect user to their homepage or to login page if event is private & they are not an invitee or organizer
    if (userDoesNotHaveAccess) {
      toast.error("You do not have permission to edit or view this event.", {
        style: {
          background: theme === "light" ? "#242424" : "rgb(233, 231, 228)",
          color: theme === "dark" ? "black" : "white",
          border: "2px solid red",
        },
      });
      if (currentUser && userCreatedAccount !== null) {
        navigation(`/${currentUser.username}`);
      } else {
        logout();
      }
    }

    // Set randomColor:
    const themeColors: TThemeColor[] = [
      "var(--primary-color)",
      "var(--secondary-color)",
      "var(--tertiary-color)",
      "var(--fourth-color)",
      "var(--fifth-color)",
    ];
    const randomNumber = Math.floor(Math.random() * themeColors.length);
    setRandomColor(themeColors[randomNumber]);

    if (currentUser?._id && currentEvent) {
      setUserRSVPd(currentEvent.interestedUsers.includes(currentUser._id));
    }

    setCurrentEvent(currentEvent);
  }, []);

  /* Every time allUsers changes, set refinedInterestedUsers, which checks that the id in event's interestedUsers array exists, so that when a user deletes their account, they won't still be counted as an interested user in a given event. */
  useEffect(() => {
    const refIntUsers = [];
    if (currentEvent && allUsers) {
      for (const userID of currentEvent.interestedUsers) {
        for (const user of allUsers) {
          if (user._id === userID) {
            refIntUsers.push(user);
          }
        }
      }
    }
    setRefinedInterestedUsers(refIntUsers);
  }, [allUsers, allEvents]);

  const nextEventDateTime = currentEvent
    ? new Date(currentEvent.eventStartDateTimeInMS)
    : undefined;

  let organizers: TUser[] = [];
  if (currentEvent?.organizers && allUsers) {
    for (const id of currentEvent.organizers) {
      const organizerUserObject = allUsers.filter((user) => user._id === id)[0];
      organizers.push(organizerUserObject);
    }
  }

  // Explicitly return true or false to avoid TS error
  const userIsOrganizer: boolean =
    currentUser && currentUser._id && currentEvent?.organizers.includes(currentUser._id)
      ? true
      : false;

  const maxInviteesReached: boolean =
    currentEvent && currentEvent.maxParticipants
      ? currentEvent.invitees.length ===
        currentEvent.maxParticipants - currentEvent?.organizers.length
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
    if (
      currentEvent &&
      Math.abs(currentEvent.eventStartDateTimeInMS - now) <= 3600000 &&
      currentEvent.eventEndDateTimeInMS > now
    ) {
      return "Recently started";
    } else if (
      currentEvent &&
      currentEvent.eventEndDateTimeInMS > now &&
      currentEvent.eventStartDateTimeInMS < now
    ) {
      return "Happening now!";
    }
    return undefined;
  };
  const status: string | undefined = getStatus();

  return (
    <div onClick={() => showSidebar && setShowSidebar(false)} className="page-hero">
      {currentEvent ? (
        <>
          {showInvitees && (
            <UserListModal
              renderButtonOne={true}
              closeModalMethod={setShowInvitees}
              header="Invitees"
              handleDeletion={handleRemoveInvitee}
              userIDArray={currentEvent.invitees}
              deleteFrom="invitee-list"
              randomColor={randomColor}
            />
          )}
          {showRSVPs && (
            <UserListModal
              renderButtonOne={true}
              closeModalMethod={setShowRSVPs}
              header="RSVPs"
              handleDeletion={handleDeleteUserRSVP}
              userIDArray={refinedInterestedUsers.map((user) => user._id)}
              deleteFrom="rsvp-list"
              randomColor={randomColor}
            />
          )}
          <div
            style={{
              border: `2px solid ${randomColor}`,
              boxShadow: `${randomColor} 0px 7px 90px`,
            }}
            className={styles.eventMainInfoContainer}
          >
            {status && (
              <p style={{ backgroundColor: randomColor, padding: "0.5rem" }}>{status}</p>
            )}
            <h1 style={{ "color": randomColor }}>{currentEvent.title}</h1>
            <div className={styles.organizersContainer}>
              {currentEvent.organizers.length > 1 ? (
                <p>Organizers: </p>
              ) : (
                <p>Organizer: </p>
              )}
              {organizers.map((organizer) => (
                <Link
                  key={organizer._id}
                  to={`/users/${organizer.username}`}
                  onClick={() => setCurrentOtherUser(organizer)}
                >
                  <Tab
                    info={organizer}
                    randomColor={randomColor}
                    userMayNotDelete={true}
                  />
                </Link>
              ))}
            </div>
            <div>
              <p>{currentEvent?.description}</p>
              {currentEvent?.additionalInfo !== "" && (
                <p>{currentEvent?.additionalInfo}</p>
              )}
            </div>

            <div className={styles.eventDetailsContainer}>
              <div
                style={
                  currentEvent.images && currentEvent.images.length > 0
                    ? {
                        borderLeft: `2px solid ${randomColor}`,
                        borderTop: `2px solid ${randomColor}`,
                      }
                    : { border: `2px solid ${randomColor}` }
                }
                className={
                  currentEvent.images && currentEvent.images.length > 0
                    ? styles.eventMainInfoTextContainerWithImage
                    : styles.eventMainInfoTextContainerNoImage
                }
              >
                <div>
                  <p>
                    {nextEventDateTime?.toDateString()} at{" "}
                    {nextEventDateTime?.toLocaleTimeString()}
                  </p>
                  <p>{`${currentEvent.address}`}</p>
                  <p>{`${currentEvent.city}, ${currentEvent.stateProvince}, ${currentEvent.country}`}</p>
                </div>
                <div>
                  {currentEvent.invitees.length > 0 && (
                    <p>
                      Invitees:{" "}
                      <span
                        onClick={() =>
                          currentUser?._id &&
                          currentEvent.organizers.includes(currentUser._id) &&
                          currentEvent.invitees.length > 0
                            ? setShowInvitees(true)
                            : undefined
                        }
                        className={
                          currentUser?._id &&
                          currentEvent.organizers.includes(currentUser._id) &&
                          currentEvent.invitees.length > 0
                            ? "show-listed-users-or-invitees"
                            : undefined
                        }
                      >{`${currentEvent.invitees.length}`}</span>
                    </p>
                  )}
                  <p>
                    RSVPs:{" "}
                    <span
                      onClick={() =>
                        currentUser?._id &&
                        currentEvent.organizers.includes(currentUser._id) &&
                        refinedInterestedUsers.length > 0
                          ? setShowRSVPs(true)
                          : undefined
                      }
                      className={
                        currentUser?._id &&
                        currentEvent.organizers.includes(currentUser._id) &&
                        refinedInterestedUsers.length > 0
                          ? "show-listed-users-or-invitees"
                          : undefined
                      }
                    >{`${refinedInterestedUsers.length}`}</span>
                  </p>
                </div>
              </div>
              {currentEvent.images && currentEvent.images.length > 0 && (
                <ImageSlideshow
                  randomColor={randomColor}
                  images={currentEvent.images && currentEvent.images}
                />
              )}
            </div>
            {userCreatedAccount === null && (
              <>
                <p>
                  Please log in or sign up to edit RSVP or to make changes to this event.
                </p>
                <Link to={`/`}>
                  <div className="theme-element-container">
                    <button style={{ "backgroundColor": randomColor }}>
                      Log in/Sign up
                    </button>
                  </div>
                </Link>
              </>
            )}
            {currentEvent.eventEndDateTimeInMS > now &&
              currentUser &&
              userCreatedAccount !== null &&
              (!userIsOrganizer ? (
                <div className="theme-element-container">
                  <button
                    disabled={maxInviteesReached || isLoading}
                    onClick={(e) => {
                      if (userRSVPd && currentUser) {
                        handleDeleteUserRSVP(e, currentEvent, currentUser, setUserRSVPd);
                      } else if (!userRSVPd) {
                        handleAddUserRSVP(e, currentEvent, setUserRSVPd);
                      }
                    }}
                  >
                    {rsvpButtonText}
                  </button>
                </div>
              ) : (
                <Link to={`/edit-event/${currentEvent._id}`}>
                  <div className="theme-element-container">
                    <button onClick={() => setCurrentEvent(currentEvent)}>
                      Edit Event
                    </button>
                  </div>
                </Link>
              ))}
          </div>
        </>
      ) : (
        <>
          <h1>Sorry, this event doesn't exist anymore.</h1>
          <Link to={"/events"}>
            <div className="theme-element-container">
              <button>Back to All Events</button>
            </div>
          </Link>
        </>
      )}
    </div>
  );
};

export default EventPage;
