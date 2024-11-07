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

const EventPage = () => {
  const {
    allUsers,
    allEvents,
    fetchAllEvents,
    currentUser,
    currentEvent,
    userCreatedAccount,
    setCurrentEvent,
    fetchAllUsers,
  } = useMainContext();
  const { showSidebar, setShowSidebar, handleRemoveInvitee, isLoading, setIsLoading } =
    useUserContext();
  const { eventID } = useParams();
  const [event, setEvent] = useState<TEvent | undefined>();
  const [refinedInterestedUsers, setRefinedInterestedUsers] = useState<TUser[]>([]);
  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);
  const [showInvitees, setShowInvitees] = useState<boolean>(false);
  const [userRSVPd, setUserRSVPd] = useState<boolean>(false);

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
    // FIX THIS
    setEvent(currentEvent);
    fetchAllUsers();
    fetchAllEvents();

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

    // Set init value of userRSVPd:
    if (
      currentUser &&
      currentUser._id &&
      event &&
      event.interestedUsers.includes(currentUser._id)
    ) {
      setUserRSVPd(true);
    }
  }, []);

  useEffect(() => {
    setEvent(allEvents.filter((ev) => ev._id === eventID)[0]);
  }, [allEvents]);

  /* Every time allUsers changes, set refinedInterestedUsers, which checks that the id in event's interestedUsers array exists, so that when a user deletes their account, they won't still be counted as an interested user in a given event. */
  useEffect(() => {
    const refIntUsers = [];
    if (event) {
      for (const userID of event.interestedUsers) {
        for (const user of allUsers) {
          if (user._id === userID) {
            refIntUsers.push(user);
          }
        }
      }
    }
    setRefinedInterestedUsers(refIntUsers);
  }, [allUsers]);

  const nextEventDateTime = event ? new Date(event.eventStartDateTimeInMS) : undefined;

  const getImagesArray = ():
    | {
        url: string | undefined;
      }[]
    | undefined => {
    if (event?.imageOne !== "" && event?.imageTwo !== "" && event?.imageThree !== "") {
      return [
        { url: event?.imageOne },
        { url: event?.imageTwo },
        { url: event?.imageThree },
      ];
    } else if (event?.imageOne !== "" && event?.imageTwo !== "") {
      return [{ url: event?.imageOne }, { url: event?.imageTwo }];
    } else if (event?.imageOne !== "") {
      return [{ url: event?.imageOne }];
    }
  };
  const eventImages = getImagesArray();

  const getOrganizersUsernames = (): (string | undefined)[] => {
    const usernameArray: Array<string | undefined> = [];
    if (event) {
      for (const organizerID of event.organizers) {
        usernameArray.push(
          allUsers.filter((user) => user._id === organizerID)[0].username
        );
      }
    }
    return usernameArray;
  };
  const organizerUsernames = getOrganizersUsernames();

  // Explicitly return true or false to avoid TS error
  const userIsOrganizer: boolean =
    currentUser && currentUser._id && event?.organizers.includes(currentUser._id)
      ? true
      : false;

  const maxInviteesReached: boolean =
    event && event.maxParticipants
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
    if (
      event &&
      Math.abs(event.eventStartDateTimeInMS - now) <= 3600000 &&
      event.eventEndDateTimeInMS > now
    ) {
      return "Recently started";
    } else if (
      event &&
      event.eventEndDateTimeInMS > now &&
      event.eventStartDateTimeInMS < now
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
      {event ? (
        <>
          {showInvitees && (
            <UserListModal
              closeModalMethod={setShowInvitees}
              header="Invitees"
              handleUserRemoval={handleRemoveInvitee}
              userIDArray={event.invitees}
              event={event}
              randomColor={randomColor}
            />
          )}
          {showRSVPs && (
            <UserListModal
              closeModalMethod={setShowRSVPs}
              header="RSVPs"
              handleUserRemoval={handleDeleteUserRSVP}
              userIDArray={refinedInterestedUsers.map((user) => user._id)}
              event={event}
              randomColor={randomColor}
            />
          )}
          <div
            style={{
              border: `2px solid ${randomColor}`,
              boxShadow: `${randomColor} 0px 7px 90px`,
            }}
            className="event-main-info-container"
          >
            {status && (
              <p style={{ backgroundColor: randomColor, padding: "0.5rem" }}>{status}</p>
            )}
            <h1 style={{ "color": randomColor }}>{event.title}</h1>
            <div className="event-main-info-text-container">
              <div>
                <p>
                  {nextEventDateTime?.toDateString()} at{" "}
                  {nextEventDateTime?.toLocaleTimeString()}
                </p>
                <p>{`${event.address}`}</p>
                <p>{`${event.city}, ${event.stateProvince}, ${event.country}`}</p>
              </div>
              <div>
                {organizerUsernames.length === 1 ? (
                  <p>Organizer: {organizerUsernames[0]}</p>
                ) : (
                  <p>Organizers: {organizerUsernames.join(", ")}</p>
                )}

                {event.invitees.length > 0 && (
                  <p>
                    Invitees:{" "}
                    <span
                      onClick={() =>
                        currentUser?._id &&
                        event.organizers.includes(currentUser._id) &&
                        event.invitees.length > 0
                          ? setShowInvitees(true)
                          : undefined
                      }
                      className={
                        currentUser?._id &&
                        event.organizers.includes(currentUser._id) &&
                        event.invitees.length > 0
                          ? "show-listed-users-or-invitees"
                          : undefined
                      }
                    >{`${event.invitees.length}`}</span>
                  </p>
                )}
                <p>
                  RSVPs:{" "}
                  <span
                    onClick={() =>
                      currentUser?._id &&
                      event.organizers.includes(currentUser._id) &&
                      refinedInterestedUsers.length > 0
                        ? setShowRSVPs(true)
                        : undefined
                    }
                    className={
                      currentUser?._id &&
                      event.organizers.includes(currentUser._id) &&
                      refinedInterestedUsers.length > 0
                        ? "show-listed-users-or-invitees"
                        : undefined
                    }
                  >{`${refinedInterestedUsers.length}`}</span>
                </p>
              </div>
            </div>
            {event.imageOne !== "" && (
              <ImageSlideshow randomColor={randomColor} images={eventImages} />
            )}
            <div>
              <p>{event?.description}</p>
              {event?.additionalInfo !== "" && <p>{event?.additionalInfo}</p>}
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
            {event.eventEndDateTimeInMS > now &&
              currentUser &&
              userCreatedAccount !== null &&
              (!userIsOrganizer ? (
                <button
                  disabled={maxInviteesReached || isLoading}
                  style={{ "backgroundColor": randomColor }}
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
                <Link to={`/edit-event/${event._id}`}>
                  <button
                    onClick={() => setCurrentEvent(event)}
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
