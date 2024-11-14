import { TEvent, TThemeColor, TUser } from "../../../types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import Requests from "../../../requests";
import toast from "react-hot-toast";
import ImageSlideshow from "../../Elements/ImageSlideshow/ImageSlideshow";
import UserListModal from "../../Elements/UserListModal/UserListModal";
import Tab from "../../Elements/Tab/Tab";
import styles from "./styles.module.css";

const EventPage = () => {
  const { allUsers, allEvents, currentUser, userCreatedAccount, setCurrentEvent } =
    useMainContext();
  const { showSidebar, setShowSidebar, handleRemoveInvitee, isLoading, setIsLoading } =
    useUserContext();
  //const [event, setEvent] = useState<TEvent | undefined>();
  const [refinedInterestedUsers, setRefinedInterestedUsers] = useState<TUser[]>([]);
  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);
  const [showInvitees, setShowInvitees] = useState<boolean>(false);

  // Get most current version of event to which this page pertains:
  const { eventID } = useParams();
  const currentEvent = allEvents.filter((ev) => ev._id === eventID)[0];
  const [userRSVPd, setUserRSVPd] = useState<boolean>(
    currentUser &&
      currentUser._id &&
      currentEvent.interestedUsers.includes(currentUser._id)
      ? true
      : false
  ); // use for optimistic rendering

  const navigation = useNavigate();

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();

  useEffect(() => {
    // Redirect user to their homepage or to login page if event is private & they are not an invitee or organizer
    if (
      currentEvent?.publicity === "private" &&
      currentUser?._id &&
      !currentEvent?.invitees.includes(currentUser._id) &&
      !currentEvent?.organizers.includes(currentUser._id)
    ) {
      toast.error("You do not have permission to edit or view this event.");
      if (currentUser && userCreatedAccount !== null) {
        navigation(`/users/${currentUser.username}`);
      } else {
        navigation("/");
      }
    }

    // Set randomColor:
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

  /* Every time allUsers changes, set refinedInterestedUsers, which checks that the id in event's interestedUsers array exists, so that when a user deletes their account, they won't still be counted as an interested user in a given event. */
  useEffect(() => {
    const refIntUsers = [];
    if (currentEvent) {
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
  if (currentEvent?.organizers) {
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
    } else if (
      currentUser &&
      currentUser._id &&
      currentEvent.interestedUsers.includes(currentUser._id)
    ) {
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

  /* Handlers to add/remove user rsvp defined here in order to allow for optimistic rendering.
   Variable userRSVPd must be set in state in this component & not in userContext, otherwise, rnndering
   takes too long after user adds/removes their RSVP. */
  const handleAddUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    setUserRSVPd(true);
    Requests.addUserRSVP(currentUser, event)
      .then((response) => {
        if (!response.ok) {
          toast.error("Could not RSVP to event. Please try again.");
          setUserRSVPd(false);
        } else {
          toast.success("RSVP added");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteUserRSVP = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    event: TEvent,
    user: TUser
  ): void => {
    e.preventDefault();
    setIsLoading(true);
    setUserRSVPd(false);
    Requests.deleteUserRSVP(user, event)
      .then((response) => {
        if (!response.ok) {
          setUserRSVPd(true);
          toast.error("Could not remove RSVP. Please try again.");
        } else {
          toast.error("RSVP deleted");
        }
      })
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  };

  return (
    <div onClick={() => showSidebar && setShowSidebar(false)} className="page-hero">
      {currentEvent ? (
        <>
          {showInvitees && (
            <UserListModal
              closeModalMethod={setShowInvitees}
              header="Invitees"
              handleUserRemoval={handleRemoveInvitee}
              userIDArray={currentEvent.invitees}
              event={currentEvent}
              randomColor={randomColor}
            />
          )}
          {showRSVPs && (
            <UserListModal
              closeModalMethod={setShowRSVPs}
              header="RSVPs"
              handleUserRemoval={handleDeleteUserRSVP}
              userIDArray={refinedInterestedUsers.map((user) => user._id)}
              event={currentEvent}
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
                <Tab
                  key={organizer._id}
                  info={organizer}
                  randomColor={randomColor}
                  userMayNotDelete={true}
                />
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
                  <button style={{ "backgroundColor": randomColor }}>
                    Log in/Sign up
                  </button>
                </Link>
              </>
            )}
            {currentEvent.eventEndDateTimeInMS > now &&
              currentUser &&
              userCreatedAccount !== null &&
              (!userIsOrganizer ? (
                <button
                  disabled={maxInviteesReached || isLoading}
                  style={{ "backgroundColor": randomColor }}
                  onClick={(e) =>
                    currentUser &&
                    currentUser._id &&
                    currentEvent.interestedUsers.includes(currentUser._id)
                      ? handleDeleteUserRSVP(e, currentEvent, currentUser)
                      : handleAddUserRSVP(e, currentEvent)
                  }
                >
                  {rsvpButtonText}
                </button>
              ) : (
                <Link to={`/edit-event/${currentEvent._id}`}>
                  <button
                    onClick={() => setCurrentEvent(currentEvent)}
                    style={{ "backgroundColor": randomColor }}
                  >
                    Edit Event
                  </button>
                </Link>
              ))}
          </div>
        </>
      ) : (
        <>
          <h1>Sorry, this event doesn't exist anymore.</h1>
          <Link to={"/events"}>
            <button>Back to All Events</button>
          </Link>
        </>
      )}
    </div>
  );
};

export default EventPage;
