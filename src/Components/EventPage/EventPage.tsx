import { TEvent, TUser } from "../../types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMainContext } from "../../Hooks/useMainContext";
import { useUserContext } from "../../Hooks/useUserContext";
import { useNavigate } from "react-router-dom";
import ImageSlideshow from "../ImageSlideshow/ImageSlideshow";
import NavBar from "../NavBar/NavBar";

const EventPage = () => {
  const { allUsers, allEvents, getMostCurrentEvents, currentUser, userCreatedAccount } =
    useMainContext();
  const { handleDeleteUserRSVP, handleAddUserRSVP, showSidebar, setShowSidebar } =
    useUserContext();
  const { eventID } = useParams();
  const [event, setEvent] = useState<TEvent>(
    allEvents.filter((ev) => ev.id === eventID)[0]
  );
  const [refinedInterestedUsers, setRefinedInterestedUsers] = useState<TUser[]>([]);
  const [showRSVPs, setShowRSVPs] = useState<boolean>(false);

  const navigation = useNavigate();
  useEffect(() => {
    if (!currentUser && userCreatedAccount === null) {
      console.log("hi");
      navigation("/");
    }
  }, [currentUser, navigation, userCreatedAccount]);

  const [randomColor, setRandomColor] = useState<string>("");
  useEffect(() => {
    getMostCurrentEvents();
    const themeColors = [
      "var(--theme-blue)",
      "var(--theme-green)",
      "var(--theme-red)",
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

  const nextEventDateTime = event ? new Date(event.nextEventTime) : undefined;

  const userRSVPd =
    currentUser?.id && event?.interestedUsers.includes(currentUser.id.toString());

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

  const userIsOrganizer =
    currentUser?.id && event.organizers.includes(currentUser?.id.toString());

  return (
    <div onClick={() => showSidebar && setShowSidebar(false)} className="page-hero">
      <NavBar />
      {event ? (
        <>
          {showRSVPs && (
            <div className="modal-background">
              <i
                title="Close"
                onClick={() => setShowRSVPs(false)}
                className="fas fa-times close-interests-module-icon"
              ></i>
              <div className="rsvpd-users-container">
                <h2>RSVP'd Users</h2>
                {refinedInterestedUsers.map((user) => (
                  <div key={user.id} className="rsvpd-user">
                    <img
                      style={{ border: `2px solid ${randomColor}` }}
                      src={`${user.profileImage}`}
                      alt="profile pic"
                    />
                    <div className="rsvpd-user-texts-container">
                      <p>{`${user.firstName} ${user.lastName}`}</p>
                      <p>{user.username}</p>
                    </div>
                    <button style={{ backgroundColor: randomColor }}>Message</button>
                    <button
                      onClick={(e) => handleDeleteUserRSVP(e, event, user)}
                      style={{ backgroundColor: "tomato" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              border: `2px solid ${randomColor}`,
              boxShadow: `${randomColor} 0px 7px 90px`,
            }}
            className="event-main-info-container"
          >
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

                <p>
                  RSVPs:{" "}
                  <span
                    onClick={() => setShowRSVPs(true)}
                    className={
                      event.organizers.includes(String(currentUser?.id))
                        ? "show-rsvpd-users"
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
            <button
              disabled={userIsOrganizer ? true : false}
              title={
                userIsOrganizer ? "Cannot RSVP to an event you organized" : undefined
              }
              style={!userIsOrganizer ? { "backgroundColor": randomColor } : undefined}
              onClick={(e) =>
                userRSVPd
                  ? handleDeleteUserRSVP(e, event, currentUser)
                  : handleAddUserRSVP(e, event)
              }
            >
              {userRSVPd ? "Remove RSVP" : "RSVP"}
            </button>
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
