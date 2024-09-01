import { TEvent, TThemeColor, TUser } from "../../../types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMainContext } from "../../../Hooks/useMainContext";
import { useUserContext } from "../../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ImageSlideshow from "../../Elements/ImageSlideshow/ImageSlideshow";
import UserListModal from "../../Elements/UserListModal/UserListModal";

const EventPage = () => {
  const {
    allUsers,
    allEvents,
    fetchAllEvents,
    currentUser,
    userCreatedAccount,
    setCurrentEvent,
  } = useMainContext();
  const {
    handleDeleteUserRSVP,
    handleAddUserRSVP,
    showSidebar,
    setShowSidebar,
    handleRemoveInvitee,
  } = useUserContext();
  const { eventID } = useParams();
  const [event, setEvent] = useState<TEvent>(
    allEvents.filter((ev) => ev.id === eventID)[0]
  );
  const [refinedInterestedUsers, setRefinedInterestedUsers] = useState<TUser[]>([]);
  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);
  const [showInvitees, setShowInvitees] = useState<boolean>(false);

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      toast.error("Please login before accessing this page");
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const [randomColor, setRandomColor] = useState<TThemeColor | undefined>();
  useEffect(() => {
    if (!event) {
      navigation(`/`);
      toast.error("Please log in, then paste URL into same tab to view this event");
    }
    fetchAllEvents();
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

  useEffect(() => {
    setEvent(allEvents.filter((ev) => ev.id === eventID)[0]);
  }, [allEvents]);

  /* Every time allUsers changes, set refinedInterestedUsers, which checks that the id in event's interestedUsers array exists, so that when a user deletes their account, they won't still be counted as an interested user in a given event. */
  useEffect(() => {
    const refIntUsers = [];
    if (event) {
      for (const userID of event.interestedUsers) {
        for (const user of allUsers) {
          if (user.id === userID) {
            refIntUsers.push(user);
          }
        }
      }
    }
    setRefinedInterestedUsers(refIntUsers);
  }, [allUsers]);

  const nextEventDateTime = event ? new Date(event.eventStartDateTimeInMS) : undefined;

  const userRSVPd =
    currentUser && currentUser.id && event?.interestedUsers.includes(currentUser.id);

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
          allUsers.filter((user) => user.id === organizerID)[0].username
        );
      }
    }
    return usernameArray;
  };
  const organizerUsernames = getOrganizersUsernames();

  const userIsOrganizer: boolean =
    currentUser && currentUser.id && event.organizers.includes(currentUser.id)
      ? true
      : false;

  const maxParticipantsReached: boolean =
    event && event.invitees.length === event.maxParticipants;

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
              userIDArray={refinedInterestedUsers.map((user) => user.id)}
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
                        event.organizers.includes(String(currentUser?.id)) &&
                        event.invitees.length > 0
                          ? setShowInvitees(true)
                          : undefined
                      }
                      className={
                        event.organizers.includes(String(currentUser?.id)) &&
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
                      event.organizers.includes(String(currentUser?.id)) &&
                      refinedInterestedUsers.length > 0
                        ? setShowRSVPs(true)
                        : undefined
                    }
                    className={
                      event.organizers.includes(String(currentUser?.id)) &&
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
            {event.eventEndDateTimeInMS > now &&
              (!userIsOrganizer ? (
                <button
                  disabled={maxParticipantsReached}
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
                <Link to={`/edit-event/${event.id}`}>
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
